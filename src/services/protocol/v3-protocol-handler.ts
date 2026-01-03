/**
 * V3 Protocol Handler
 *
 * Handles text-based ASCII protocol for firmware versions 2-4.
 * - Upload: One instruction per write operation
 * - Download: Comma-delimited text responses
 * - Maximum ~100 instructions (MTU limited)
 */

import { IHardwareLayer } from '@/types/hardware';
import { IProtocolHandler, ProtocolVersion } from '@/types/protocol';
import { RobotProgram, RobotInstruction } from '@/types/robot';
import { encodeSpeed, decodeSpeed, calculateDataLength } from './protocol-utils';
import { uint8ArrayToLatin1 } from '@/utils/buffer-utils';

export class V3ProtocolHandler implements IProtocolHandler {
  readonly version: ProtocolVersion = 'V3';
  readonly maxInstructions: number = 100;

  private hardware: IHardwareLayer;
  private responseBuffer: string = '';
  private responsePromise: ((value: string) => void) | null = null;
  private cleanupNotification: (() => void) | null = null;

  constructor(hardware: IHardwareLayer) {
    this.hardware = hardware;

    // Set up notification handler
    this.cleanupNotification = this.hardware.onNotification((data) => {
      const text = uint8ArrayToLatin1(data);
      this.handleResponse(text);
    });
  }

  async uploadProgram(
    program: RobotProgram,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (program.instructions.length > this.maxInstructions) {
      throw new Error(
        `Program too large: ${program.instructions.length} instructions (max ${this.maxInstructions})`
      );
    }

    // 1. Flush
    await this.hardware.write('F');

    // 2. Data length
    const dataLength = calculateDataLength(program.instructions.length);
    await this.hardware.write(dataLength);

    // 3. Enter upload mode
    await this.hardware.write('E');

    // 4. Upload instructions one by one
    for (let i = 0; i < program.instructions.length; i++) {
      const inst = program.instructions[i];
      const left = encodeSpeed(inst.leftMotorSpeed).toString().padStart(3, '0');
      const right = encodeSpeed(inst.rightMotorSpeed).toString().padStart(3, '0');
      const instruction = `${left},${right}xx`;

      await this.hardware.write(instruction);

      if (onProgress) {
        onProgress((i + 1) / program.instructions.length);
      }
    }

    // 5. End marker
    await this.hardware.write('end');

    // 6. Wait for FULL response
    await this.waitForResponse('FULL');
  }

  async downloadProgram(onProgress?: (progress: number) => void): Promise<RobotProgram> {
    const instructions: RobotInstruction[] = [];

    // Begin download
    await this.hardware.write('B');

    // Read instructions until end marker
    let done = false;
    while (!done) {
      const response = await this.waitForResponse(() => true);

      if (response === ',,,,') {
        // End marker
        done = true;
      } else if (response.includes(',')) {
        // Parse instruction
        const parts = response.split(',');
        if (parts.length >= 2) {
          const left = parseInt(parts[0], 10);
          const right = parseInt(parts[1], 10);

          if (!isNaN(left) && !isNaN(right)) {
            instructions.push({
              leftMotorSpeed: decodeSpeed(left),
              rightMotorSpeed: decodeSpeed(right),
            });

            if (onProgress) {
              // Progress is unknown until end marker
              onProgress(0);
            }
          }
        }
      }
    }

    if (onProgress) {
      onProgress(1);
    }

    return { instructions };
  }

  async run(): Promise<void> {
    await this.hardware.write('R');
    await this.waitForResponse('_END');
  }

  async go(): Promise<void> {
    await this.hardware.write('G');
    await this.waitForResponse('_GO_');
  }

  async stop(): Promise<void> {
    await this.hardware.write('S');
    await this.waitForResponse('_SR_');
  }

  async getInterval(): Promise<number> {
    await this.hardware.write('z');
    const response = await this.waitForResponse((r) => r.startsWith('I='));

    // Parse "I=XX" format
    const match = response.match(/I=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }

    throw new Error('Invalid interval response');
  }

  async setInterval(value: number): Promise<void> {
    const command = `i${value.toString().padStart(2, '0')}`;
    await this.hardware.write(command);
  }

  async startRecording(durationSeconds: number): Promise<void> {
    const command = `r${durationSeconds.toString().padStart(4, '0')}`;
    await this.hardware.write(command);
  }

  async downloadRecording(onProgress?: (progress: number) => void): Promise<RobotProgram> {
    // Recording download is same as program download for V3
    return this.downloadProgram(onProgress);
  }

  private handleResponse(text: string): void {
    this.responseBuffer += text;

    // If we're waiting for a response, resolve it
    if (this.responsePromise) {
      this.responsePromise(this.responseBuffer);
      this.responsePromise = null;
      this.responseBuffer = '';
    }
  }

  private waitForResponse(matcher: string | ((response: string) => boolean)): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responsePromise = null;
        reject(new Error('Response timeout'));
      }, 5000);

      this.responsePromise = (response) => {
        const matches =
          typeof matcher === 'string' ? response.includes(matcher) : matcher(response);

        if (matches) {
          clearTimeout(timeout);
          this.responsePromise = null;
          resolve(response);
        }
        // If doesn't match, keep waiting for more data (don't reject here)
      };

      // Check if we already have a response in the buffer
      if (this.responseBuffer) {
        const matches =
          typeof matcher === 'string'
            ? this.responseBuffer.includes(matcher)
            : matcher(this.responseBuffer);

        if (matches) {
          clearTimeout(timeout);
          const response = this.responseBuffer;
          this.responseBuffer = '';
          this.responsePromise = null;
          resolve(response);
        }
      }
    });
  }
}

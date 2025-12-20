/**
 * V6 Protocol Handler
 *
 * Handles binary protocol for firmware version 9.
 * - Upload: All instructions in single write (or multiple if needed)
 * - Download: Packeted with sequence numbers
 * - Maximum ~2400 instructions
 */

import { IHardwareLayer } from '@/types/hardware';
import { IProtocolHandler, ProtocolVersion } from '@/types/protocol';
import { RobotProgram, RobotInstruction } from '@/types/robot';
import { encodeSpeed, decodeSpeed, calculateDataLength } from './protocol-utils';

export class V6ProtocolHandler implements IProtocolHandler {
  readonly version: ProtocolVersion = 'V6';
  readonly maxInstructions: number = 2400;

  private hardware: IHardwareLayer;
  private responseBuffer: Uint8Array = new Uint8Array(0);
  private responsePromise: ((value: Uint8Array) => void) | null = null;
  private cleanupNotification: (() => void) | null = null;

  constructor(hardware: IHardwareLayer) {
    this.hardware = hardware;

    // Set up notification handler
    this.cleanupNotification = this.hardware.onNotification((data) => {
      this.handleResponse(data);
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

    // 4. Upload all instructions as binary
    const binaryData = new Uint8Array(program.instructions.length * 2);
    for (let i = 0; i < program.instructions.length; i++) {
      const inst = program.instructions[i];
      binaryData[i * 2] = encodeSpeed(inst.leftMotorSpeed);
      binaryData[i * 2 + 1] = encodeSpeed(inst.rightMotorSpeed);
    }

    await this.hardware.write(binaryData);

    if (onProgress) {
      onProgress(1);
    }

    // 5. Wait for FULL response
    await this.waitForTextResponse('FULL');
  }

  async downloadProgram(onProgress?: (progress: number) => void): Promise<RobotProgram> {
    const instructions: RobotInstruction[] = [];

    // Begin download
    await this.hardware.write('B');

    // Read packet 0: total byte count
    const packet0 = await this.waitForBinaryResponse();
    const totalBytes = (packet0[0] << 24) | (packet0[1] << 16) | (packet0[2] << 8) | packet0[3];
    const totalInstructions = totalBytes / 2;

    // Read data packets
    let bytesReceived = 0;
    while (bytesReceived < totalBytes) {
      const packet = await this.waitForBinaryResponse();

      // First byte is sequence number, rest is data
      const dataBytes = packet.slice(1);

      // Parse instructions
      for (let i = 0; i < dataBytes.length; i += 2) {
        if (i + 1 < dataBytes.length) {
          instructions.push({
            leftMotorSpeed: decodeSpeed(dataBytes[i]),
            rightMotorSpeed: decodeSpeed(dataBytes[i + 1]),
          });
          bytesReceived += 2;
        }
      }

      if (onProgress && totalInstructions > 0) {
        onProgress(instructions.length / totalInstructions);
      }
    }

    if (onProgress) {
      onProgress(1);
    }

    return { instructions };
  }

  async run(): Promise<void> {
    await this.hardware.write('R');
    await this.waitForTextResponse('_END');
  }

  async go(): Promise<void> {
    await this.hardware.write('G');
    await this.waitForTextResponse('_GO_');
  }

  async stop(): Promise<void> {
    await this.hardware.write('S');
    await this.waitForTextResponse('_SR_');
  }

  async getInterval(): Promise<number> {
    await this.hardware.write('z');
    const response = await this.waitForTextResponse();

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
    return this.downloadProgram(onProgress);
  }

  private handleResponse(data: Uint8Array): void {
    // Append to buffer
    const newBuffer = new Uint8Array(this.responseBuffer.length + data.length);
    newBuffer.set(this.responseBuffer);
    newBuffer.set(data, this.responseBuffer.length);
    this.responseBuffer = newBuffer;

    // If we're waiting for a response, resolve it
    if (this.responsePromise) {
      this.responsePromise(this.responseBuffer);
      this.responsePromise = null;
      this.responseBuffer = new Uint8Array(0);
    }
  }

  private waitForBinaryResponse(): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responsePromise = null;
        reject(new Error('Response timeout'));
      }, 5000);

      this.responsePromise = (response) => {
        clearTimeout(timeout);
        resolve(response);
      };

      // Check if we already have a response in the buffer
      if (this.responseBuffer.length > 0) {
        clearTimeout(timeout);
        const response = this.responseBuffer;
        this.responseBuffer = new Uint8Array(0);
        this.responsePromise = null;
        resolve(response);
      }
    });
  }

  private async waitForTextResponse(expected?: string): Promise<string> {
    const data = await this.waitForBinaryResponse();
    const text = Buffer.from(data).toString('latin1');

    if (expected && !text.includes(expected)) {
      throw new Error(`Expected '${expected}' but got '${text}'`);
    }

    return text;
  }
}

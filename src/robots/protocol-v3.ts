/**
 * V3 Protocol Handler
 *
 * Text-based ASCII protocol for firmware versions 2-4.
 * - Upload: One instruction per write operation with "xxx,xxxxx" format
 * - Download: Comma-delimited text responses ending with ",,,,"
 * - Maximum ~100 instructions (MTU limited)
 */

import { Instruction } from '@/programs/instructions';
import { ProtocolHandler } from './protocol';
import {
  DeviceChannel,
  encodeSpeed,
  decodeSpeed,
  calculateDataLength,
  uint8ArrayToLatin1,
} from './protocol-base';

export class ProtocolV3 implements ProtocolHandler {
  async startDriveMode(channel: DeviceChannel): Promise<void> {
    const response = await channel.requestText('G');
    if (!response.includes('_GR_') && !response.includes('_GO_')) {
      throw new Error(`Unexpected drive mode response: ${response}`);
    }
  }

  async recordInstructions(
    channel: DeviceChannel,
    durationSeconds: number,
    _interval: number
  ): Promise<void> {
    // 1. Flush memory
    await channel.send('F');

    // 2. Send data length (V3 uses duration * 2 - 1, ignores interval)
    const byteCount = durationSeconds * 2 - 1;
    const hex = 'd' + byteCount.toString(16).toUpperCase().padStart(4, '0');
    await channel.send(hex);

    // 3. Start recording
    const response = await channel.requestText('L', (durationSeconds + 10) * 1000);
    if (response !== 'FULL') {
      throw new Error(`Unexpected record response: ${response}`);
    }
  }

  async runStoredInstructions(channel: DeviceChannel): Promise<void> {
    const response = await channel.requestText('R', 60000);
    if (response !== '_END') {
      throw new Error(`Unexpected run response: ${response}`);
    }
  }

  async stop(channel: DeviceChannel): Promise<void> {
    const response = await channel.requestText('S');
    if (response !== '_SR_') {
      throw new Error(`Unexpected stop response: ${response}`);
    }
  }

  async uploadInstructions(
    channel: DeviceChannel,
    instructions: Instruction[],
    runAfterUpload: boolean
  ): Promise<void> {
    // 1. Flush memory
    await channel.send('F');

    // 2. Send data length
    await channel.send(calculateDataLength(instructions.length));

    // 3. Enter upload mode
    await channel.send('E');

    // 4. Upload instructions one by one (V3 text format)
    for (const inst of instructions) {
      const left = encodeSpeed(inst.leftMotorSpeed).toString().padStart(3, '0');
      const right = encodeSpeed(inst.rightMotorSpeed).toString().padStart(3, '0');
      await channel.send(`${left},${right}xx`);
    }

    // 5. End upload
    const response = await channel.requestText('end');
    if (response !== 'FULL') {
      throw new Error(`Unexpected upload response: ${response}`);
    }

    // 6. Run if requested
    if (runAfterUpload) {
      const runResponse = await channel.requestText('R', 60000);
      if (runResponse !== '_END') {
        throw new Error(`Unexpected run response: ${runResponse}`);
      }
    }
  }

  async downloadInstructions(channel: DeviceChannel): Promise<Instruction[]> {
    const instructions: Instruction[] = [];

    // Send download request
    await channel.send('B');

    // Collect responses until we get the end marker
    while (true) {
      const response = await channel.awaitResponse();
      const text = uint8ArrayToLatin1(response);

      if (text === ',,,,') {
        break;
      }

      // Parse "xxx,xxx" format
      const match = text.match(/(\d{3}),(\d{3})/);
      if (match) {
        instructions.push({
          leftMotorSpeed: decodeSpeed(parseInt(match[1], 10)),
          rightMotorSpeed: decodeSpeed(parseInt(match[2], 10)),
        });
      }
    }

    return instructions;
  }

  async getInterval(channel: DeviceChannel): Promise<number> {
    const response = await channel.requestText('I?');
    if (!response.startsWith('I=')) {
      throw new Error(`Unexpected interval response: ${response}`);
    }
    const match = response.match(/I=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    throw new Error('Invalid interval response');
  }

  async setInterval(channel: DeviceChannel, value: number): Promise<void> {
    await channel.send(`I${value}`);
  }
}

/**
 * V3 Protocol Handler
 *
 * Text-based ASCII protocol for firmware versions 2-4.
 * - Upload: One instruction per write operation with "xxx,xxxxx" format
 * - Download: Comma-delimited text responses ending with ",,,,"
 * - Maximum ~100 instructions (MTU limited)
 */

import { Instruction } from '@/services/programs/instructions';
import { ProtocolHandler } from './protocol';
import { encodeSpeed, decodeSpeed, calculateDataLength, uint8ArrayToLatin1 } from './protocol-base';
import { DeviceChannel } from './device-channel';

export class ProtocolV3 implements ProtocolHandler {
  async startDriveMode(channel: DeviceChannel): Promise<void> {
    await channel.send('G');
    const response = await channel.awaitTextResponse();
    if (!response.includes('_GR_') && !response.includes('_GO_')) {
      console.warn(`Unexpected drive mode response: ${response}`);
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
    await channel.send('L');
    await channel.expectTextResponse('FULL', (durationSeconds + 10) * 1000);
  }

  async runStoredInstructions(channel: DeviceChannel): Promise<void> {
    await channel.send('R');
    await channel.expectTextResponse('_END', 60000);
  }

  async stop(channel: DeviceChannel): Promise<void> {
    await channel.send('S');
    await channel.expectTextResponse('_SR_');
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
    await channel.send('end');
    await channel.expectTextResponse('FULL');

    // 6. Run if requested
    if (runAfterUpload) {
      await this.runStoredInstructions(channel);
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
    await channel.send('I?');
    const response = await channel.awaitTextResponse();
    if (!response.startsWith('I=')) {
      console.warn(`Unexpected interval response: ${response}`);
      return 0;
    }
    const match = response.match(/I=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  async setInterval(channel: DeviceChannel, value: number): Promise<void> {
    await channel.send(`I${value}`);
  }
}

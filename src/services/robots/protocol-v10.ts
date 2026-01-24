/**
 * V10 Protocol Handler
 *
 * Binary protocol with chunked uploads for firmware version 10.
 * - Upload: Data sent in chunks of 256 instructions
 * - Download: Same as V6 (packeted with sequence numbers)
 * - Maximum 4096 instructions
 */

import { Instruction } from '@/services/programs/instructions';
import { ProtocolHandler } from './protocol';
import { encodeSpeed, decodeSpeed, hexNumber, hexNumberConfirm } from './protocol-base';
import { DeviceChannel } from './device-channel';

const CHUNK_SIZE = 256; // instructions per chunk

export class ProtocolV10 implements ProtocolHandler {
  async startDriveMode(channel: DeviceChannel): Promise<void> {
    await channel.send('R');
    await channel.expectTextResponse('_RR_');
  }

  async recordInstructions(
    channel: DeviceChannel,
    durationSeconds: number,
    interval: number
  ): Promise<void> {
    await this.flushMemory(channel);
    await this.sendDataLength(channel, interval * durationSeconds * 2);

    await channel.send('L');
    await channel.expectTextResponse('_LR_');

    await channel.expectTextResponse('FULL', (durationSeconds + 5) * 1000);
  }

  async runStoredInstructions(channel: DeviceChannel): Promise<void> {
    await channel.send('G');
    await channel.expectTextResponse('_GR_');

    await channel.expectTextResponse('_END', 300000);
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
    await this.flushMemory(channel);
    await this.sendDataLength(channel, instructions.length * 2 - 1);

    await channel.send('E');
    await channel.expectTextResponse('_ER_');

    const chunks = this.createChunks(instructions);
    for (const chunk of chunks) {
      await channel.send(chunk);
    }

    await channel.expectTextResponse('FULL');

    if (runAfterUpload) {
      await this.runStoredInstructions(channel);
    }
  }

  async downloadInstructions(channel: DeviceChannel): Promise<Instruction[]> {
    // Send download request
    await channel.send('B');

    // Read header packet (total byte count)
    const headerPacket = await channel.awaitResponse();
    const totalBytes = this.decodeBigEndian(headerPacket);
    const expectedPackets = Math.ceil((totalBytes + 1) / 18);

    const instructions: Instruction[] = [];
    let packetsReceived = 0;

    // Read data packets
    while (packetsReceived < expectedPackets) {
      const packet = await channel.awaitResponse();

      // First byte is sequence number, rest is instruction data
      const dataBytes = packet.slice(1);

      // Parse instruction pairs
      for (let i = 0; i + 1 < dataBytes.length; i += 2) {
        instructions.push({
          leftMotorSpeed: decodeSpeed(dataBytes[i]),
          rightMotorSpeed: decodeSpeed(dataBytes[i + 1]),
        });
      }

      packetsReceived++;
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

  private async flushMemory(channel: DeviceChannel): Promise<void> {
    await channel.send('F');
    await channel.expectTextResponse('MEMCLEAR');
  }

  private async sendDataLength(channel: DeviceChannel, value: number): Promise<void> {
    await channel.send(hexNumber(value));
    await channel.expectTextResponse(hexNumberConfirm(value));
  }

  private createChunks(instructions: Instruction[]): Uint8Array[] {
    const chunks: Uint8Array[] = [];

    for (let offset = 0; offset < instructions.length; offset += CHUNK_SIZE) {
      const chunkLength = Math.min(CHUNK_SIZE, instructions.length - offset);
      const bytes = new Uint8Array(chunkLength * 2);

      for (let i = 0; i < chunkLength; i++) {
        const inst = instructions[offset + i];
        bytes[i * 2] = encodeSpeed(inst.leftMotorSpeed);
        bytes[i * 2 + 1] = encodeSpeed(inst.rightMotorSpeed);
      }

      chunks.push(bytes);
    }

    return chunks;
  }

  private decodeBigEndian(data: Uint8Array): number {
    let value = 0;
    for (let i = 0; i < data.length; i++) {
      value = (value << 8) | data[i];
    }
    return value;
  }
}

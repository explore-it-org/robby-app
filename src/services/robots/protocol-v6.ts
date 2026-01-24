/**
 * V6 Protocol Handler
 *
 * Binary protocol for firmware version 9.
 * - Upload: All instructions in single binary write
 * - Download: Packeted with sequence numbers
 * - Maximum ~2400 instructions
 */

import { Instruction } from '@/services/programs/instructions';
import { ProtocolHandler } from './protocol';
import { encodeSpeed, decodeSpeed, calculateDataLength } from './protocol-base';
import { DeviceChannel } from './device-channel';

export class ProtocolV6 implements ProtocolHandler {
  async startDriveMode(channel: DeviceChannel): Promise<void> {
    const response = await channel.requestText('G');
    if (!response.includes('_GR_') && !response.includes('_GO_')) {
      throw new Error(`Unexpected drive mode response: ${response}`);
    }
  }

  async recordInstructions(
    channel: DeviceChannel,
    durationSeconds: number,
    interval: number
  ): Promise<void> {
    // 1. Flush memory
    await channel.send('F');

    // 2. Send data length (V6 uses interval * duration * 2 - 1)
    const byteCount = interval * durationSeconds * 2 - 1;
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

    // 4. Upload all instructions as binary data
    const binaryData = this.encodeInstructions(instructions);
    await channel.send(binaryData);

    // 5. Send end marker
    await channel.send('end');

    // 6. Wait for confirmation
    const response = await channel.awaitTextResponse();
    if (response !== 'FULL') {
      throw new Error(`Unexpected upload response: ${response}`);
    }

    // 7. Run if requested
    if (runAfterUpload) {
      const runResponse = await channel.requestText('R', 60000);
      if (runResponse !== '_END') {
        throw new Error(`Unexpected run response: ${runResponse}`);
      }
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

  private encodeInstructions(instructions: Instruction[]): Uint8Array {
    const data = new Uint8Array(instructions.length * 2);
    for (let i = 0; i < instructions.length; i++) {
      data[i * 2] = encodeSpeed(instructions[i].leftMotorSpeed);
      data[i * 2 + 1] = encodeSpeed(instructions[i].rightMotorSpeed);
    }
    return data;
  }

  private decodeBigEndian(data: Uint8Array): number {
    let value = 0;
    for (let i = 0; i < data.length; i++) {
      value = (value << 8) | data[i];
    }
    return value;
  }
}

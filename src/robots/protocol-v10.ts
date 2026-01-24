/**
 * V10 Protocol Handler
 *
 * Binary protocol with chunked uploads for firmware version 10.
 * - Upload: Data sent in chunks of 256 instructions
 * - Download: Same as V6 (packeted with sequence numbers)
 * - Maximum 4096 instructions
 */

import { ConnectedDevice } from '@/ble/manager';
import { Instruction } from '@/programs/instructions';
import { ProtocolHandler } from './protocol';
import { DeviceChannel, encodeSpeed, decodeSpeed, calculateDataLength } from './protocol-base';

const CHUNK_SIZE = 256; // instructions per chunk

export class ProtocolV10 implements ProtocolHandler {
  async startDriveMode(device: ConnectedDevice): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      await channel.requestText('G', '_END', 60000);
    } finally {
      channel.dispose();
    }
  }

  async recordInstructions(device: ConnectedDevice): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      await channel.requestText('L', 'FULL', 120000);
    } finally {
      channel.dispose();
    }
  }

  async runStoredInstructions(device: ConnectedDevice): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      await channel.requestText('R', '_END', 60000);
    } finally {
      channel.dispose();
    }
  }

  async stop(device: ConnectedDevice): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      await channel.requestText('S', '_SR_');
    } finally {
      channel.dispose();
    }
  }

  async uploadInstructions(
    device: ConnectedDevice,
    instructions: Instruction[],
    runAfterUpload: boolean
  ): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      // 1. Flush memory
      await channel.send('F');

      // 2. Send data length
      await channel.send(calculateDataLength(instructions.length));

      // 3. Enter upload mode
      await channel.send('E');

      // 4. Upload instructions in chunks
      const chunks = this.createChunks(instructions);
      for (const chunk of chunks) {
        await channel.send(chunk);
      }

      // 5. Wait for confirmation
      await channel.awaitTextResponse('FULL');

      // 6. Run if requested
      if (runAfterUpload) {
        await channel.requestText('R', '_END', 60000);
      }
    } finally {
      channel.dispose();
    }
  }

  async downloadInstructions(device: ConnectedDevice): Promise<Instruction[]> {
    const channel = new DeviceChannel(device);
    try {
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
    } finally {
      channel.dispose();
    }
  }

  async getInterval(device: ConnectedDevice): Promise<number> {
    const channel = new DeviceChannel(device);
    try {
      const response = await channel.requestText('I?', (text) => text.startsWith('I='));
      const match = response.match(/I=(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
      throw new Error('Invalid interval response');
    } finally {
      channel.dispose();
    }
  }

  async setInterval(device: ConnectedDevice, value: number): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      await channel.send(`I${value}`);
    } finally {
      channel.dispose();
    }
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

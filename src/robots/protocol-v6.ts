/**
 * V6 Protocol Handler
 *
 * Binary protocol for firmware version 9.
 * - Upload: All instructions in single binary write
 * - Download: Packeted with sequence numbers
 * - Maximum ~2400 instructions
 */

import { ConnectedDevice } from '@/ble/manager';
import { Instruction } from '@/programs/instructions';
import { ProtocolHandler } from './protocol';
import { DeviceChannel, encodeSpeed, decodeSpeed, calculateDataLength } from './protocol-base';

export class ProtocolV6 implements ProtocolHandler {
  async startDriveMode(device: ConnectedDevice): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      // Robot responds with '_GR_' or '_GO_' when drive mode starts
      await channel.requestText('G', (text) => text.includes('_GR_') || text.includes('_GO_'));
    } finally {
      channel.dispose();
    }
  }

  async recordInstructions(
    device: ConnectedDevice,
    durationSeconds: number,
    interval: number
  ): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      // 1. Flush memory
      await channel.send('F');

      // 2. Send data length (V6 uses interval * duration * 2 - 1)
      const byteCount = interval * durationSeconds * 2 - 1;
      const hex = 'd' + byteCount.toString(16).toUpperCase().padStart(4, '0');
      await channel.send(hex);

      // 3. Start recording
      await channel.requestText('L', 'FULL', (durationSeconds + 10) * 1000);
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

      // 4. Upload all instructions as binary data
      const binaryData = this.encodeInstructions(instructions);
      await channel.send(binaryData);

      // 5. Send end marker
      await channel.send('end');

      // 6. Wait for confirmation
      await channel.awaitTextResponse('FULL');

      // 7. Run if requested
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

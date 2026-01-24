/**
 * V3 Protocol Handler
 *
 * Text-based ASCII protocol for firmware versions 2-4.
 * - Upload: One instruction per write operation with "xxx,xxxxx" format
 * - Download: Comma-delimited text responses ending with ",,,,"
 * - Maximum ~100 instructions (MTU limited)
 */

import { ConnectedDevice } from '@/ble/manager';
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
    _interval: number
  ): Promise<void> {
    const channel = new DeviceChannel(device);
    try {
      // 1. Flush memory
      await channel.send('F');

      // 2. Send data length (V3 uses duration * 2 - 1, ignores interval)
      const byteCount = durationSeconds * 2 - 1;
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

      // 4. Upload instructions one by one (V3 text format)
      for (const inst of instructions) {
        const left = encodeSpeed(inst.leftMotorSpeed).toString().padStart(3, '0');
        const right = encodeSpeed(inst.rightMotorSpeed).toString().padStart(3, '0');
        await channel.send(`${left},${right}xx`);
      }

      // 5. End upload
      await channel.requestText('end', 'FULL');

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
}

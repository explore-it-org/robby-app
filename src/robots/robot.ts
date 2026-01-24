import { ConnectedDevice } from '@/ble/manager';
import { ProtocolHandler } from './protocol';
import { Instruction } from '@/programs/instructions';
import { DeviceChannel } from './protocol-base';
import { createProtocolHandler, getProtocolVersion, ProtocolVersion } from './protocol-factory';

export class Robot {
  readonly id: string;
  readonly name: string;
  readonly firmwareVersion: number;
  readonly protocolVersion: ProtocolVersion;

  private device: ConnectedDevice;
  private protocol: ProtocolHandler;

  private constructor(
    device: ConnectedDevice,
    protocol: ProtocolHandler,
    firmwareVersion: number,
    protocolVersion: ProtocolVersion
  ) {
    this.device = device;
    this.protocol = protocol;
    this.id = device.id;
    this.name = device.name;
    this.firmwareVersion = firmwareVersion;
    this.protocolVersion = protocolVersion;
  }

  /**
   * Connect to a robot and negotiate the protocol version
   */
  static async connect(device: ConnectedDevice): Promise<Robot> {
    const channel = new DeviceChannel(device);

    try {
      // Send VERSION_REQ ('Z') and await VERSION_RESP ('VER X')
      const response = await channel.requestText('Z', (text) => text.startsWith('VER '));

      // Parse firmware version from 'VER X' response
      const match = response.match(/VER\s+(\d+)/);
      if (!match) {
        throw new Error(`Invalid version response: ${response}`);
      }

      const firmwareVersion = parseInt(match[1], 10);
      const protocolVersion = getProtocolVersion(firmwareVersion);
      const protocol = createProtocolHandler(protocolVersion);

      return new Robot(device, protocol, firmwareVersion, protocolVersion);
    } finally {
      channel.dispose();
    }
  }

  async startDriveMode() {
    await this.protocol.startDriveMode(this.device);
  }

  async recordInstructions(durationSeconds: number, interval: number) {
    await this.protocol.recordInstructions(this.device, durationSeconds, interval);
  }

  async runStoredInstructions() {
    await this.protocol.runStoredInstructions(this.device);
  }

  async stop() {
    await this.protocol.stop(this.device);
  }

  async uploadInstructions(instructions: Instruction[], runAfterUpload: boolean) {
    await this.protocol.uploadInstructions(this.device, instructions, runAfterUpload);
  }

  async downloadInstructions() {
    return await this.protocol.downloadInstructions(this.device);
  }

  async getInterval(): Promise<number> {
    return await this.protocol.getInterval(this.device);
  }

  async setInterval(value: number): Promise<void> {
    await this.protocol.setInterval(this.device, value);
  }

  async disconnect(): Promise<void> {
    await this.device.disconnect();
  }

  onDisconnect(callback: () => void): () => void {
    return this.device.onDisconnect(callback);
  }
}

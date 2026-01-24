import { ConnectedDevice } from '@/services/ble/manager';
import { ProtocolHandler } from './protocol';
import { Instruction } from '@/services/programs/instructions';
import { DeviceChannel } from './device-channel';
import { createProtocolHandler, getProtocolVersion, ProtocolVersion } from './protocol-factory';

export class Robot {
  readonly id: string;
  readonly name: string;
  readonly firmwareVersion: number;
  readonly protocolVersion: ProtocolVersion;
  private _interval: number;

  private device: ConnectedDevice;
  private channel: DeviceChannel;
  private protocol: ProtocolHandler;

  private constructor(
    device: ConnectedDevice,
    channel: DeviceChannel,
    protocol: ProtocolHandler,
    firmwareVersion: number,
    protocolVersion: ProtocolVersion,
    interval: number
  ) {
    this.device = device;
    this.channel = channel;
    this.protocol = protocol;
    this.id = device.id;
    this.name = device.name;
    this.firmwareVersion = firmwareVersion;
    this.protocolVersion = protocolVersion;
    this._interval = interval;
  }

  get interval(): number {
    return this._interval;
  }

  /**
   * Connect to a robot and negotiate the protocol version
   */
  static async connect(device: ConnectedDevice): Promise<Robot> {
    const channel = new DeviceChannel(device);

    // Send VERSION_REQ ('Z') and await VERSION_RESP ('VER X')
    const response = await channel.requestText('Z');

    // Validate response format
    if (!response.startsWith('VER ')) {
      throw new Error(`Invalid version response: ${response}`);
    }

    // Parse firmware version from 'VER X' response
    const match = response.match(/VER\s+(\d+)/);
    if (!match) {
      throw new Error(`Invalid version response: ${response}`);
    }

    const firmwareVersion = parseInt(match[1], 10);
    const protocolVersion = getProtocolVersion(firmwareVersion);
    const protocol = createProtocolHandler(protocolVersion);

    // Query interval after connection
    const interval = await protocol.getInterval(channel);

    return new Robot(device, channel, protocol, firmwareVersion, protocolVersion, interval);
  }

  async startDriveMode() {
    await this.protocol.startDriveMode(this.channel);
  }

  async recordInstructions(durationSeconds: number, interval: number) {
    await this.protocol.recordInstructions(this.channel, durationSeconds, interval);
  }

  async runStoredInstructions() {
    await this.protocol.runStoredInstructions(this.channel);
  }

  async stop() {
    await this.protocol.stop(this.channel);
  }

  async uploadInstructions(instructions: Instruction[], runAfterUpload: boolean) {
    await this.protocol.uploadInstructions(this.channel, instructions, runAfterUpload);
  }

  async downloadInstructions() {
    return await this.protocol.downloadInstructions(this.channel);
  }

  async setInterval(value: number): Promise<void> {
    await this.protocol.setInterval(this.channel, value);
    this._interval = value;
  }

  async disconnect(): Promise<void> {
    this.channel.dispose();
    await this.device.disconnect();
  }

  onDisconnect(callback: () => void): () => void {
    return this.device.onDisconnect(callback);
  }
}

import { ConnectedDevice } from '@/ble/manager';
import { ProtocolHandler } from './protocol';
import { Instruction } from '@/programs/instructions';

export class Robot {
  private device: ConnectedDevice;
  private protocol: ProtocolHandler;

  constructor(device: ConnectedDevice, protocol: ProtocolHandler) {
    this.device = device;
    this.protocol = protocol;
  }

  async startDriveMode() {
    await this.protocol.startDriveMode(this.device);
  }

  async recordInstructions() {
    await this.protocol.recordInstructions(this.device);
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

import { Instruction } from '@/services/programs/instructions';
import { DeviceChannel } from './device-channel';

export interface ProtocolHandler {
  // Control commands
  startDriveMode: (channel: DeviceChannel) => Promise<void>;
  recordInstructions: (
    channel: DeviceChannel,
    durationSeconds: number,
    interval: number
  ) => Promise<void>;
  runStoredInstructions: (channel: DeviceChannel) => Promise<void>;
  stop: (channel: DeviceChannel) => Promise<void>;

  // Uploading and downloading instructions
  uploadInstructions: (
    channel: DeviceChannel,
    instructions: Instruction[],
    runAfterUpload: boolean
  ) => Promise<void>;
  downloadInstructions: (channel: DeviceChannel) => Promise<Instruction[]>;

  // Configuration
  getInterval(channel: DeviceChannel): Promise<number>;
  setInterval(channel: DeviceChannel, value: number): Promise<void>;
}

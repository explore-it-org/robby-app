import { ConnectedDevice } from '@/ble/manager';
import { Instruction } from '@/programs/instructions';

export interface ProtocolHandler {
  // Control commands
  startDriveMode: (device: ConnectedDevice) => Promise<void>;
  recordInstructions: (device: ConnectedDevice) => Promise<void>;
  runStoredInstructions: (device: ConnectedDevice) => Promise<void>;
  stop: (device: ConnectedDevice) => Promise<void>;

  // Uploading and downloading instructions
  uploadInstructions: (
    device: ConnectedDevice,
    instructions: Instruction[],
    runAfterUpload: boolean
  ) => Promise<void>;
  downloadInstructions: (device: ConnectedDevice) => Promise<Instruction[]>;

  // Configuration
  getInterval(device: ConnectedDevice): Promise<number>;
  setInterval(device: ConnectedDevice, value: number): Promise<void>;
}

import { Instruction } from '@/programs/instructions';

export function useConnectedRobot(): ConnectedRobot | null {
  throw new Error('Not implemented');
}

export interface ConnectedRobot {
  name: string;
  state: ConnectedRobotState;

  startDriveMode: () => Promise<void>;
  recordInstructions: () => Promise<void>;
  uploadInstructions: (instructions: Instruction[], runAfterUpload: boolean) => Promise<void>;
  downloadInstructions: () => Promise<Instruction[]>;
  runStoredInstructions: () => Promise<void>;
  stop: () => Promise<void>;
}

export type ConnectedRobotState = 'ready' | 'executing' | 'stopping';

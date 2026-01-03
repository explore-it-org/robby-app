/**
 * High-level robot abstraction interfaces
 * Based on the Explore-It Protocol RFC
 */

/**
 * A single robot instruction (movement command)
 * Represents motor speeds for left and right motors
 */
export interface RobotInstruction {
  leftMotorSpeed: number; // 0 to 100
  rightMotorSpeed: number; // 0 to 100
}

/**
 * A complete robot program
 */
export interface RobotProgram {
  instructions: RobotInstruction[];
}

/**
 * Robot connection state
 */
export type RobotConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Robot operational state
 */
export type RobotOperationalState =
  | 'idle'
  | 'running' // Executing program (RUN command)
  | 'going' // In drive mode (GO command)
  | 'uploading'
  | 'recording'
  | 'downloading';

/**
 * Robot error
 */
export interface RobotError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * High-level robot interface
 */
export interface IRobot {
  // Identity and capabilities
  readonly id: string;
  readonly name: string;
  readonly firmwareVersion: number;
  readonly protocolVersion: 'V3' | 'V6' | 'V10';

  // Connection state
  readonly isConnected: boolean;
  readonly connectionState: RobotConnectionState;
  readonly operationalState: RobotOperationalState;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onConnectionStateChange(callback: (state: RobotConnectionState) => void): () => void;
  onOperationalStateChange(callback: (state: RobotOperationalState) => void): () => void;

  // Control commands
  run(): Promise<void>;
  go(): Promise<void>;
  stop(): Promise<void>;

  // Program management
  uploadProgram(program: RobotProgram): Promise<void>;
  downloadProgram(): Promise<RobotProgram>;
  onUploadProgress(callback: (progress: number) => void): () => void;
  onDownloadProgress(callback: (progress: number) => void): () => void;

  // Configuration
  getInterval(): Promise<number>;
  setInterval(deciseconds: number): Promise<void>;

  // Recording
  startRecording(durationSeconds: number): Promise<void>;
  stopRecording(): Promise<RobotProgram>;
  onRecordingProgress(callback: (progress: number) => void): () => void;

  // Error handling
  onError(callback: (error: RobotError) => void): () => void;
}

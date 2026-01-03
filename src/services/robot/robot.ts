/**
 * Robot Implementation
 *
 * Top-level command interface that provides high-level robot commands.
 * Manages connection lifecycle, state, and delegates to protocol layer.
 */

import { IProtocolHandler, ProtocolVersion } from '@/types/protocol';
import {
  IRobot,
  RobotConnectionState,
  RobotOperationalState,
  RobotProgram,
  RobotError,
} from '@/types/robot';
import { IHardwareLayer } from '@/types/hardware';

export class Robot implements IRobot {
  // Identity
  readonly id: string;
  readonly name: string;
  readonly firmwareVersion: number;
  readonly protocolVersion: ProtocolVersion;

  // State
  private _connectionState: RobotConnectionState = 'disconnected';
  private _operationalState: RobotOperationalState = 'idle';

  // Dependencies
  private hardware: IHardwareLayer;
  private protocolHandler: IProtocolHandler;

  // Callbacks
  private connectionStateCallbacks: ((state: RobotConnectionState) => void)[] = [];
  private operationalStateCallbacks: ((state: RobotOperationalState) => void)[] = [];
  private uploadProgressCallbacks: ((progress: number) => void)[] = [];
  private downloadProgressCallbacks: ((progress: number) => void)[] = [];
  private recordingProgressCallbacks: ((progress: number) => void)[] = [];
  private errorCallbacks: ((error: RobotError) => void)[] = [];

  constructor(
    id: string,
    name: string,
    firmwareVersion: number,
    hardware: IHardwareLayer,
    protocolHandler: IProtocolHandler
  ) {
    this.id = id;
    this.name = name;
    this.firmwareVersion = firmwareVersion;
    this.protocolVersion = protocolHandler.version;
    this.hardware = hardware;
    this.protocolHandler = protocolHandler;

    // Monitor hardware state changes (deferred to avoid race condition)
    queueMicrotask(() => {
      this.hardware.onStateChange((state) => {
        if (state === 'connected') {
          this.setConnectionState('connected');
        } else if (state === 'disconnected') {
          this.setConnectionState('disconnected');
        } else if (state === 'connecting') {
          this.setConnectionState('connecting');
        }
      });
    });
  }

  // Identity and state getters
  get isConnected(): boolean {
    return this._connectionState === 'connected';
  }

  get connectionState(): RobotConnectionState {
    return this._connectionState;
  }

  get operationalState(): RobotOperationalState {
    return this._operationalState;
  }

  // Connection management
  async connect(): Promise<void> {
    try {
      this.setConnectionState('connecting');
      await this.hardware.connect(this.id);
      this.setConnectionState('connected');
    } catch (error) {
      this.setConnectionState('error');
      this.emitError({
        code: 'CONNECTION_FAILED',
        message: 'Failed to connect to robot',
        details: error,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.hardware.disconnect();
      this.setConnectionState('disconnected');
      this.setOperationalState('idle');
    } catch (error) {
      this.emitError({
        code: 'DISCONNECTION_FAILED',
        message: 'Failed to disconnect from robot',
        details: error,
      });
      throw error;
    }
  }

  onConnectionStateChange(callback: (state: RobotConnectionState) => void): () => void {
    this.connectionStateCallbacks.push(callback);
    return () => {
      const idx = this.connectionStateCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.connectionStateCallbacks.splice(idx, 1);
      }
    };
  }

  onOperationalStateChange(callback: (state: RobotOperationalState) => void): () => void {
    this.operationalStateCallbacks.push(callback);
    return () => {
      const idx = this.operationalStateCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.operationalStateCallbacks.splice(idx, 1);
      }
    };
  }

  // Program operations
  async uploadProgram(program: RobotProgram): Promise<void> {
    this.assertConnected();
    this.validateProgram(program);

    try {
      this.setOperationalState('uploading');

      await this.protocolHandler.uploadProgram(program, (progress) => {
        this.uploadProgressCallbacks.forEach((cb) => cb(progress));
      });

      this.setOperationalState('idle');
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload program to robot',
        details: error,
      });
      throw error;
    }
  }

  async downloadProgram(): Promise<RobotProgram> {
    this.assertConnected();

    try {
      this.setOperationalState('downloading');

      const program = await this.protocolHandler.downloadProgram((progress) => {
        this.downloadProgressCallbacks.forEach((cb) => cb(progress));
      });

      this.setOperationalState('idle');
      return program;
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'DOWNLOAD_FAILED',
        message: 'Failed to download program from robot',
        details: error,
      });
      throw error;
    }
  }

  onUploadProgress(callback: (progress: number) => void): () => void {
    this.uploadProgressCallbacks.push(callback);
    return () => {
      const idx = this.uploadProgressCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.uploadProgressCallbacks.splice(idx, 1);
      }
    };
  }

  onDownloadProgress(callback: (progress: number) => void): () => void {
    this.downloadProgressCallbacks.push(callback);
    return () => {
      const idx = this.downloadProgressCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.downloadProgressCallbacks.splice(idx, 1);
      }
    };
  }

  // Control commands
  async run(): Promise<void> {
    this.assertConnected();

    try {
      this.setOperationalState('running');
      await this.protocolHandler.run();
      this.setOperationalState('idle');
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'RUN_FAILED',
        message: 'Failed to run program',
        details: error,
      });
      throw error;
    }
  }

  async go(): Promise<void> {
    this.assertConnected();

    try {
      this.setOperationalState('going');
      await this.protocolHandler.go();
      // Stay in 'going' state until stopped
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'GO_FAILED',
        message: 'Failed to enter drive mode',
        details: error,
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.assertConnected();

    try {
      await this.protocolHandler.stop();
      this.setOperationalState('idle');
    } catch (error) {
      this.emitError({
        code: 'STOP_FAILED',
        message: 'Failed to stop robot',
        details: error,
      });
      throw error;
    }
  }

  // Configuration
  async getInterval(): Promise<number> {
    this.assertConnected();

    try {
      return await this.protocolHandler.getInterval();
    } catch (error) {
      this.emitError({
        code: 'GET_INTERVAL_FAILED',
        message: 'Failed to get interval',
        details: error,
      });
      throw error;
    }
  }

  async setInterval(deciseconds: number): Promise<void> {
    this.assertConnected();

    if (deciseconds < 0) {
      throw new Error('Interval must be non-negative');
    }

    try {
      await this.protocolHandler.setInterval(deciseconds);
    } catch (error) {
      this.emitError({
        code: 'SET_INTERVAL_FAILED',
        message: 'Failed to set interval',
        details: error,
      });
      throw error;
    }
  }

  // Recording
  async startRecording(durationSeconds: number): Promise<void> {
    this.assertConnected();

    if (durationSeconds <= 0) {
      throw new Error('Recording duration must be positive');
    }

    if (durationSeconds > 9999) {
      throw new Error('Recording duration must not exceed 9999 seconds');
    }

    try {
      this.setOperationalState('recording');
      await this.protocolHandler.startRecording(durationSeconds);
      // Stay in 'recording' state until stopped
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'RECORDING_START_FAILED',
        message: 'Failed to start recording',
        details: error,
      });
      throw error;
    }
  }

  async stopRecording(): Promise<RobotProgram> {
    this.assertConnected();

    if (this._operationalState !== 'recording') {
      throw new Error('Robot is not recording');
    }

    try {
      const program = await this.protocolHandler.downloadRecording((progress) => {
        this.recordingProgressCallbacks.forEach((cb) => cb(progress));
      });

      this.setOperationalState('idle');
      return program;
    } catch (error) {
      this.setOperationalState('idle');
      this.emitError({
        code: 'RECORDING_STOP_FAILED',
        message: 'Failed to stop recording',
        details: error,
      });
      throw error;
    }
  }

  onRecordingProgress(callback: (progress: number) => void): () => void {
    this.recordingProgressCallbacks.push(callback);
    return () => {
      const idx = this.recordingProgressCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.recordingProgressCallbacks.splice(idx, 1);
      }
    };
  }

  // Error handling
  onError(callback: (error: RobotError) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const idx = this.errorCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.errorCallbacks.splice(idx, 1);
      }
    };
  }

  // Private helpers
  private setConnectionState(state: RobotConnectionState): void {
    if (this._connectionState !== state) {
      this._connectionState = state;
      this.connectionStateCallbacks.forEach((cb) => cb(state));
    }
  }

  private setOperationalState(state: RobotOperationalState): void {
    if (this._operationalState !== state) {
      this._operationalState = state;
      this.operationalStateCallbacks.forEach((cb) => cb(state));
    }
  }

  private emitError(error: RobotError): void {
    this.errorCallbacks.forEach((cb) => cb(error));
  }

  private assertConnected(): void {
    if (!this.isConnected) {
      throw new Error('Robot is not connected');
    }
  }

  private validateProgram(program: RobotProgram): void {
    if (program.instructions.length === 0) {
      throw new Error('Program must have at least one instruction');
    }

    if (program.instructions.length > this.protocolHandler.maxInstructions) {
      throw new Error(
        `Program too large: ${program.instructions.length} instructions (max ${this.protocolHandler.maxInstructions})`
      );
    }

    // Validate instruction values
    for (let i = 0; i < program.instructions.length; i++) {
      const inst = program.instructions[i];

      if (inst.leftMotorSpeed < 0 || inst.leftMotorSpeed > 100) {
        throw new Error(`Invalid left motor speed at instruction ${i}: ${inst.leftMotorSpeed}`);
      }

      if (inst.rightMotorSpeed < 0 || inst.rightMotorSpeed > 100) {
        throw new Error(`Invalid right motor speed at instruction ${i}: ${inst.rightMotorSpeed}`);
      }
    }
  }
}

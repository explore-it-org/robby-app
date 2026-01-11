/**
 * Emulator Hardware Layer
 *
 * Simulates robot communication without requiring physical hardware.
 * Provides emulated robots for development and testing.
 */

import { DiscoveredDevice, HardwareState, IHardwareLayer } from '@/types/hardware';
import { RobotInstruction } from '@/types/robot';

/**
 * Configuration for emulated robots
 */
export interface EmulatorConfig {
  robots: {
    firmwareVersion: number;
  }[];
  responseDelay: number; // Simulated network latency (ms)
}

/**
 * Default emulator configuration with three robots (one per protocol version)
 */
const DEFAULT_EMULATOR_CONFIG: EmulatorConfig = {
  robots: [{ firmwareVersion: 10 }, { firmwareVersion: 9 }, { firmwareVersion: 3 }],
  responseDelay: 100,
};

/**
 * Emulated robot that responds to protocol commands
 */
class EmulatedRobot {
  private firmwareVersion: number;
  private name: string;
  private program: RobotInstruction[] = [];
  private interval: number = 2;
  private isRunning: boolean = false;
  private uploadMode: boolean = false;
  private expectedDataLength: number = 0;

  constructor(firmwareVersion: number, name: string) {
    this.firmwareVersion = firmwareVersion;
    this.name = name;
  }

  /**
   * Handle incoming command and generate appropriate response
   */
  async handleCommand(data: string | Uint8Array): Promise<Uint8Array | null> {
    // Convert to string if needed for command parsing
    let commandStr = '';
    if (typeof data === 'string') {
      commandStr = data;
    } else {
      // For binary data, check first byte for text commands
      commandStr = String.fromCharCode(data[0]);
    }

    // Version query
    if (commandStr === 'Z') {
      return this.encodeResponse(`VER ${this.firmwareVersion}`);
    }

    // Interval query
    if (commandStr === 'z') {
      return this.encodeResponse(`I=${this.interval.toString().padStart(2, '0')}`);
    }

    // Set interval
    if (commandStr === 'i' && typeof data === 'string' && data.length > 1) {
      const intervalValue = parseInt(data.substring(1), 10);
      if (!isNaN(intervalValue)) {
        this.interval = intervalValue;
      }
      return null;
    }

    // Flush program
    if (commandStr === 'F') {
      this.program = [];
      this.uploadMode = false;
      this.expectedDataLength = 0;
      return null;
    }

    // Data length (part of upload sequence)
    if (commandStr === 'd' && typeof data === 'string') {
      // Parse hex data length: e.g., "d0003" means 3 bytes = (3+1)/2 = 2 instructions
      const hexLength = data.substring(1);
      this.expectedDataLength = parseInt(hexLength, 16) + 1;
      return null;
    }

    // Enter upload mode
    if (commandStr === 'E') {
      this.uploadMode = true;
      return null;
    }

    // Upload instruction (V3 text-based)
    if (this.uploadMode && typeof data === 'string' && data.includes(',')) {
      if (data === ',,,,') {
        // End marker for download
        return null;
      }
      if (data === 'end') {
        // End of upload
        this.uploadMode = false;
        return this.encodeResponse('FULL');
      }
      // Parse instruction
      const parts = data.replace(/xx$/, '').split(',');
      if (parts.length >= 2) {
        const left = parseInt(parts[0], 10);
        const right = parseInt(parts[1], 10);
        if (!isNaN(left) && !isNaN(right)) {
          this.program.push({
            leftMotorSpeed: Math.trunc(left / 2.55 + 0.5),
            rightMotorSpeed: Math.trunc(right / 2.55 + 0.5),
          });
        }
      }
      return null;
    }

    // Upload instruction (binary) - only process if in upload mode
    if (this.uploadMode && data instanceof Uint8Array && data.length > 1) {
      // Store binary program data
      for (let i = 0; i < data.length; i += 2) {
        if (i + 1 < data.length) {
          this.program.push({
            leftMotorSpeed: Math.trunc(data[i] / 2.55 + 0.5),
            rightMotorSpeed: Math.trunc(data[i + 1] / 2.55 + 0.5),
          });
        }
      }
      // Check if we've received all expected data
      const bytesReceived = this.program.length * 2;
      if (bytesReceived >= this.expectedDataLength) {
        this.uploadMode = false;
        return this.encodeResponse('FULL');
      }
      return null;
    }

    // Begin download
    if (commandStr === 'B') {
      return this.startDownload();
    }

    // Run program
    if (commandStr === 'R') {
      this.isRunning = true;
      // Simulate execution
      setTimeout(
        () => {
          this.isRunning = false;
        },
        this.program.length * this.interval * 100
      );
      return this.encodeResponse('_END');
    }

    // Go (drive mode)
    if (commandStr === 'G') {
      return this.encodeResponse('_GO_');
    }

    // Stop
    if (commandStr === 'S') {
      this.isRunning = false;
      return this.encodeResponse('_SR_');
    }

    return null;
  }

  private startDownload(): Uint8Array | null {
    // For V3: return comma-delimited text
    if (this.firmwareVersion <= 4) {
      // Will be sent as multiple notifications
      return null;
    }

    // For V6/V10: return binary packets
    // Packet 0: total byte count
    const totalBytes = this.program.length * 2;
    return new Uint8Array([
      (totalBytes >> 24) & 0xff,
      (totalBytes >> 16) & 0xff,
      (totalBytes >> 8) & 0xff,
      totalBytes & 0xff,
    ]);
  }

  private encodeResponse(text: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }

  getName(): string {
    return this.name;
  }

  getProgram(): RobotInstruction[] {
    return [...this.program];
  }
}

/**
 * Emulator Hardware Layer Implementation
 */
export class EmulatorHardwareLayer implements IHardwareLayer {
  private config: EmulatorConfig;
  private state: HardwareState = 'idle';
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();
  private emulatedRobots: Map<string, EmulatedRobot> = new Map();
  private connectedRobotId: string | null = null;
  private discoveryCallback?: (device: DiscoveredDevice) => void;
  private notificationCallbacks: ((data: Uint8Array) => void)[] = [];
  private stateChangeCallbacks: ((state: HardwareState) => void)[] = [];
  private discoveryTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(config: EmulatorConfig = DEFAULT_EMULATOR_CONFIG) {
    this.config = config;
    this.initializeEmulatedRobots();
  }

  private initializeEmulatedRobots(): void {
    this.config.robots.forEach((robotConfig, index) => {
      const id = `emulated-robot-${index}`;
      // Generate a name based on firmware version for internal use
      const protocolVersion =
        robotConfig.firmwareVersion >= 10 ? 'V10' : robotConfig.firmwareVersion >= 6 ? 'V6' : 'V3';
      const name = `EXPLORE-IT EMU:${protocolVersion}`;
      const robot = new EmulatedRobot(robotConfig.firmwareVersion, name);
      this.emulatedRobots.set(id, robot);
    });
  }

  async startDiscovery(callback: (device: DiscoveredDevice) => void): Promise<void> {
    this.discoveryCallback = callback;
    this.discoveredDevices.clear();
    this.setState('discovering');

    // Simulate discovery of emulated robots with delays
    this.config.robots.forEach((robotConfig, index) => {
      const delay = (index + 1) * 1000; // 1s, 2s, 3s
      const timeout = setTimeout(() => {
        if (this.state === 'discovering') {
          const id = `emulated-robot-${index}`;
          const device: DiscoveredDevice = {
            id,
          };
          this.discoveredDevices.set(id, device);
          this.discoveryCallback?.(device);
        }
      }, delay);
      this.discoveryTimeouts.push(timeout);
    });
  }

  async stopDiscovery(): Promise<void> {
    // Clear any pending discovery timeouts
    this.discoveryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.discoveryTimeouts = [];

    if (this.state === 'discovering') {
      this.setState('idle');
    }
  }

  getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  async connect(deviceId: string): Promise<void> {
    const robot = this.emulatedRobots.get(deviceId);
    if (!robot) {
      throw new Error(`Emulated robot not found: ${deviceId}`);
    }

    this.setState('connecting');

    // Simulate connection delay
    await this.delay(this.config.responseDelay);

    this.connectedRobotId = deviceId;
    this.setState('connected');
  }

  async disconnect(): Promise<void> {
    this.connectedRobotId = null;
    this.setState('disconnected');
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.connectedRobotId !== null;
  }

  async write(data: string | Uint8Array): Promise<void> {
    if (!this.connectedRobotId) {
      throw new Error('Not connected to any device');
    }

    const robot = this.emulatedRobots.get(this.connectedRobotId);
    if (!robot) {
      throw new Error('Connected robot not found');
    }

    // Simulate network delay
    await this.delay(this.config.responseDelay);

    // Handle command and get response
    const response = await robot.handleCommand(data);

    // Send response via notification if any
    if (response) {
      setTimeout(() => {
        this.notificationCallbacks.forEach((callback) => callback(response));
      }, this.config.responseDelay);
    }
  }

  onNotification(callback: (data: Uint8Array) => void): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      const idx = this.notificationCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.notificationCallbacks.splice(idx, 1);
      }
    };
  }

  getState(): HardwareState {
    return this.state;
  }

  onStateChange(callback: (state: HardwareState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  private setState(state: HardwareState): void {
    this.state = state;
    this.stateChangeCallbacks.forEach((callback) => callback(state));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

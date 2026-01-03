/**
 * Mock Robot Manager
 *
 * Simulates robot discovery by returning 3 dummy robots
 * at 1, 2, and 3 second intervals using the emulator.
 */

import {
  DiscoveredRobot,
  DiscoveryStatus,
  RobotDiscoveredCallback,
  DiscoveryStatusCallback,
  IRobotManager,
} from '@/types/robot-discovery';
import { IRobot } from '@/types/robot';
import { EmulatorHardwareLayer } from './hardware/emulator-hardware-layer';
import { createRobot } from './robot/robot-factory';

export class MockRobotManager implements IRobotManager {
  private hardware: EmulatorHardwareLayer;
  private status: DiscoveryStatus = 'idle';
  private discoveredRobots: Map<string, DiscoveredRobot> = new Map();
  private onRobotDiscovered?: RobotDiscoveredCallback;
  private onStatusChange?: DiscoveryStatusCallback;

  constructor() {
    this.hardware = new EmulatorHardwareLayer();
  }

  async startDiscovery(
    onRobotDiscovered: RobotDiscoveredCallback,
    onStatusChange?: DiscoveryStatusCallback
  ): Promise<void> {
    this.onRobotDiscovered = onRobotDiscovered;
    this.onStatusChange = onStatusChange;
    this.discoveredRobots.clear();
    this.updateStatus('scanning');

    await this.hardware.startDiscovery((device) => {
      const robot: DiscoveredRobot = {
        id: device.id,
        name: device.id, // Use device ID as name since hardware layer doesn't provide names
      };

      this.discoveredRobots.set(device.id, robot);
      this.onRobotDiscovered?.(robot);
    });
  }

  async stopDiscovery(): Promise<void> {
    await this.hardware.stopDiscovery();

    if (this.status === 'scanning') {
      this.updateStatus('stopped');
    }
  }

  getStatus(): DiscoveryStatus {
    return this.status;
  }

  getDiscoveredRobots(): DiscoveredRobot[] {
    return Array.from(this.discoveredRobots.values());
  }

  clearDiscoveredRobots(): void {
    this.discoveredRobots.clear();
  }

  async createRobot(robotId: string): Promise<IRobot> {
    const discoveredRobot = this.discoveredRobots.get(robotId);
    if (!discoveredRobot) {
      throw new Error(`Robot not found: ${robotId}`);
    }

    // Stop discovery before connecting
    if (this.status === 'scanning') {
      await this.stopDiscovery();
    }

    // Create a new hardware layer instance for this robot
    const robotHardware = new EmulatorHardwareLayer();

    // Create robot with version detection
    const robot = await createRobot(discoveredRobot.id, discoveredRobot.name, robotHardware);

    // Update discovered robot info with version details
    discoveredRobot.firmwareVersion = robot.firmwareVersion;
    discoveredRobot.protocolVersion = robot.protocolVersion;

    return robot;
  }

  private updateStatus(status: DiscoveryStatus, error?: Error): void {
    this.status = status;
    this.onStatusChange?.(status, error);
  }
}

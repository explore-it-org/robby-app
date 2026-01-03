/**
 * BLE Robot Manager
 *
 * Manages robot discovery using Bluetooth Low Energy (BLE).
 * Scans for nearby robots and creates robot instances with full communication stack.
 */

import {
  DiscoveredRobot,
  DiscoveryStatus,
  RobotDiscoveredCallback,
  DiscoveryStatusCallback,
  IRobotManager,
} from '@/types/robot-discovery';
import { IRobot } from '@/types/robot';
import { BLEHardwareLayer } from './hardware/ble-hardware-layer';
import { createRobot } from './robot/robot-factory';

export class BLERobotManager implements IRobotManager {
  private hardware: BLEHardwareLayer;
  private status: DiscoveryStatus = 'idle';
  private discoveredRobots: Map<string, DiscoveredRobot> = new Map();
  private onRobotDiscovered?: RobotDiscoveredCallback;
  private onStatusChange?: DiscoveryStatusCallback;

  constructor() {
    this.hardware = new BLEHardwareLayer();
  }

  async startDiscovery(
    onRobotDiscovered: RobotDiscoveredCallback,
    onStatusChange?: DiscoveryStatusCallback
  ): Promise<void> {
    try {
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
    } catch (error) {
      this.updateStatus('error', error as Error);
    }
  }

  async stopDiscovery(): Promise<void> {
    try {
      await this.hardware.stopDiscovery();
      if (this.status === 'scanning') {
        this.updateStatus('stopped');
      }
    } catch (error) {
      console.error('Error stopping BLE scan:', error);
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
    // (each robot needs its own connection)
    const robotHardware = new BLEHardwareLayer();

    // Create robot with version detection
    const robot = await createRobot(discoveredRobot.id, discoveredRobot.name, robotHardware);

    // Update discovered robot info with version details
    discoveredRobot.firmwareVersion = robot.firmwareVersion;
    discoveredRobot.protocolVersion = robot.protocolVersion;

    return robot;
  }

  /**
   * Clean up resources when the manager is no longer needed
   */
  destroy(): void {
    this.stopDiscovery();
    this.hardware.destroy();
  }

  private updateStatus(status: DiscoveryStatus, error?: Error): void {
    this.status = status;
    this.onStatusChange?.(status, error);
  }
}

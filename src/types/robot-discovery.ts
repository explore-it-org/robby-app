/**
 * Types for robot discovery and management
 */

import { IRobot } from './robot';
import { VirtualRobotConfig } from './virtual-robot';

/**
 * A discovered robot with basic identification information
 */
export interface DiscoveredRobot {
  /** Unique identifier for the robot */
  id: string;

  /** Display name of the robot */
  name: string;

  /** Firmware version (detected after connection) */
  firmwareVersion?: number;

  /** Protocol version (determined from firmware version) */
  protocolVersion?: 'V3' | 'V6' | 'V10';

  /** Additional metadata specific to the discovery method */
  metadata?: Record<string, unknown>;

  /** True if this is a virtual robot (simulated, not physical hardware) */
  isVirtual?: boolean;

  /** Virtual robot configuration (only present for virtual robots) */
  virtualConfig?: VirtualRobotConfig;
}

/**
 * Discovery status
 */
export type DiscoveryStatus = 'idle' | 'scanning' | 'stopped' | 'error';

/**
 * Callback for when a robot is discovered
 */
export type RobotDiscoveredCallback = (robot: DiscoveredRobot) => void;

/**
 * Callback for when discovery status changes
 */
export type DiscoveryStatusCallback = (status: DiscoveryStatus, error?: Error) => void;

/**
 * Interface for robot discovery and management
 */
export interface IRobotManager {
  /**
   * Start scanning for robots
   * @param onRobotDiscovered Callback invoked when a robot is discovered
   * @param onStatusChange Callback invoked when discovery status changes
   */
  startDiscovery(
    onRobotDiscovered: RobotDiscoveredCallback,
    onStatusChange?: DiscoveryStatusCallback
  ): Promise<void>;

  /**
   * Stop scanning for robots
   */
  stopDiscovery(): Promise<void>;

  /**
   * Get current discovery status
   */
  getStatus(): DiscoveryStatus;

  /**
   * Get list of currently discovered robots
   */
  getDiscoveredRobots(): DiscoveredRobot[];

  /**
   * Clear the list of discovered robots
   */
  clearDiscoveredRobots(): void;

  /**
   * Create a robot instance from a discovered robot
   * Connects to the robot and performs version detection
   */
  createRobot(robotId: string): Promise<IRobot>;
}

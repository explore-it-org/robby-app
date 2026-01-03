/**
 * Robot Connection State Service
 *
 * Manages the connection state of robots.
 * This is a simple in-memory state manager that tracks which robots are connected.
 * In the future, this will integrate with actual robot connection logic.
 */

import { StoredRobot } from './known-robots-storage';

/**
 * In-memory map of connected robots
 * Key: robotId, Value: StoredRobot data
 */
const connectedRobots = new Map<string, StoredRobot>();

/**
 * Listeners for connection state changes
 */
type ConnectionStateListener = () => void;
const listeners = new Set<ConnectionStateListener>();

/**
 * Notify all listeners of a connection state change
 */
function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to connection state changes
 */
export function subscribeToConnectionState(listener: ConnectionStateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Check if a robot is connected
 */
export function isRobotConnected(robotId: string): boolean {
  return connectedRobots.has(robotId);
}

/**
 * Mark a robot as connected
 */
export function setRobotConnected(robotId: string, robot?: StoredRobot): void {
  if (robot) {
    connectedRobots.set(robotId, robot);
  } else if (!connectedRobots.has(robotId)) {
    // If no robot data provided and robot is not already connected, create minimal data
    connectedRobots.set(robotId, {
      robotId,
      robotName: 'Unknown Robot',
      isVirtual: false,
    });
  }
  notifyListeners();
}

/**
 * Mark a robot as disconnected
 */
export function setRobotDisconnected(robotId: string): void {
  connectedRobots.delete(robotId);
  notifyListeners();
}

/**
 * Get all connected robot IDs
 */
export function getConnectedRobotIds(): string[] {
  return Array.from(connectedRobots.keys());
}

/**
 * Get the connected robot (only one robot can be connected at a time)
 */
export function getConnectedRobot(): StoredRobot | null {
  const firstEntry = Array.from(connectedRobots.values())[0];
  return firstEntry || null;
}

/**
 * Get robot data for a specific robot ID
 */
export function getRobotData(robotId: string): StoredRobot | null {
  return connectedRobots.get(robotId) || null;
}

/**
 * Update the name of a connected robot
 */
export function updateConnectedRobotName(robotId: string, newName: string): void {
  const robot = connectedRobots.get(robotId);
  if (robot) {
    connectedRobots.set(robotId, {
      ...robot,
      robotName: newName,
    });
    notifyListeners();
  }
}

/**
 * Disconnect all robots
 */
export function disconnectAllRobots(): void {
  connectedRobots.clear();
  notifyListeners();
}

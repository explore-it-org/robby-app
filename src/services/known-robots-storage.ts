/**
 * Known Robots Storage Service
 *
 * Manages persistence of the user's list of known robots using expo-file-system.
 * Stores a list of robots that have been added by the user.
 */

import { Paths, File } from 'expo-file-system';
import { DiscoveredRobot } from '@/types/robot-discovery';

// File instance for known robots storage
const getKnownRobotsFile = () => new File(Paths.document, 'known-robots.json');

/**
 * Interface for stored robot data
 */
export interface StoredRobot {
  robotId: string;
  robotName: string;
  isVirtual: boolean;
  addedAt: string; // ISO 8601 timestamp
}

/**
 * Loads the list of known robots
 * @returns Array of known robots or empty array if none exist
 */
export async function loadKnownRobots(): Promise<StoredRobot[]> {
  try {
    const file = getKnownRobotsFile();
    if (!file.exists) {
      return [];
    }

    const content = await file.text();
    const data = JSON.parse(content) as StoredRobot[];

    // Validate it's an array
    if (!Array.isArray(data)) {
      console.warn('Invalid known robots data, expected array');
      return [];
    }

    // Filter out invalid entries
    return data.filter(
      (robot) =>
        robot.robotId &&
        robot.robotName &&
        typeof robot.isVirtual === 'boolean' &&
        typeof robot.addedAt === 'string'
    );
  } catch (error) {
    console.error('Error loading known robots:', error);
    return [];
  }
}

/**
 * Adds a robot to the known robots list
 * @param robot The discovered robot to add
 * @returns true if added, false if already exists
 */
export async function addKnownRobot(robot: DiscoveredRobot): Promise<boolean> {
  try {
    const knownRobots = await loadKnownRobots();

    // Check if robot already exists
    if (knownRobots.some((r) => r.robotId === robot.id)) {
      return false; // Robot already in list
    }

    // Add new robot
    const newRobot: StoredRobot = {
      robotId: robot.id,
      robotName: robot.name,
      isVirtual: robot.isVirtual ?? false,
      addedAt: new Date().toISOString(),
    };

    knownRobots.push(newRobot);

    const file = getKnownRobotsFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(knownRobots, null, 2));
    return true;
  } catch (error) {
    console.error('Error adding known robot:', error);
    throw error;
  }
}

/**
 * Removes a robot from the known robots list
 * @param robotId The ID of the robot to remove
 */
export async function removeKnownRobot(robotId: string): Promise<void> {
  try {
    const knownRobots = await loadKnownRobots();
    const filtered = knownRobots.filter((r) => r.robotId !== robotId);

    const file = getKnownRobotsFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(filtered, null, 2));
  } catch (error) {
    console.error('Error removing known robot:', error);
    throw error;
  }
}

/**
 * Renames a robot in the known robots list
 * @param robotId The ID of the robot to rename
 * @param newName The new name for the robot
 * @returns true if renamed successfully, false if robot not found
 */
export async function renameKnownRobot(robotId: string, newName: string): Promise<boolean> {
  try {
    const knownRobots = await loadKnownRobots();
    const robot = knownRobots.find((r) => r.robotId === robotId);

    if (!robot) {
      return false; // Robot not found
    }

    robot.robotName = newName;

    const file = getKnownRobotsFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(knownRobots, null, 2));
    return true;
  } catch (error) {
    console.error('Error renaming known robot:', error);
    throw error;
  }
}

/**
 * Clears all known robots
 */
export async function clearKnownRobots(): Promise<void> {
  try {
    const file = getKnownRobotsFile();
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error('Error clearing known robots:', error);
    throw error;
  }
}

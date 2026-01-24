export function useRobotDiscovery(): RobotDiscovery {
  throw new Error('Not implemented');
}

export interface RobotDiscovery {
  state: RobotDiscoveryState;
  discoveredRobots: DiscoveredRobot[];

  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
}

export type RobotDiscoveryState = 'stopped' | 'running' | 'error';

export interface DiscoveredRobot {
  id: string;
  name: string;

  connect: () => Promise<void>;
}

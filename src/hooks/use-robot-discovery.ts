import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { BleManager, DiscoveredDevice } from '@/ble/manager';

const BleManagerContext = createContext<BleManager | null>(null);

export const BleManagerProvider = BleManagerContext.Provider;

function useBleManager(): BleManager {
  const manager = useContext(BleManagerContext);
  if (!manager) {
    throw new Error('useRobotDiscovery must be used within a BleManagerProvider');
  }
  return manager;
}

export function useRobotDiscovery(): RobotDiscovery {
  const bleManager = useBleManager();
  const [state, setState] = useState<RobotDiscoveryState>('stopped');
  const [discoveredRobots, setDiscoveredRobots] = useState<DiscoveredRobot[]>([]);
  const discoveredDevicesRef = useRef<Map<string, DiscoveredDevice>>(new Map());

  const startDiscovery = useCallback(async () => {
    if (state === 'running') {
      return;
    }

    setDiscoveredRobots([]);
    discoveredDevicesRef.current.clear();

    try {
      setState('running');
      await bleManager.startDiscovery((device) => {
        if (discoveredDevicesRef.current.has(device.id)) {
          return;
        }
        discoveredDevicesRef.current.set(device.id, device);

        const robot: DiscoveredRobot = {
          id: device.id,
          name: device.name,
          connect: async () => {
            throw new Error('Not implemented');
          },
        };

        setDiscoveredRobots((prev) => [...prev, robot]);
      });
    } catch {
      setState('error');
    }
  }, [bleManager, state]);

  const stopDiscovery = useCallback(async () => {
    if (state !== 'running') {
      return;
    }

    await bleManager.stopDiscovery();
    setState('stopped');
  }, [bleManager, state]);

  return {
    state,
    discoveredRobots,
    startDiscovery,
    stopDiscovery,
  };
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

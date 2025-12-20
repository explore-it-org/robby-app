/**
 * useRobotConnection Hook
 *
 * Provides access to global robot connection state.
 * Automatically subscribes to connection state changes and re-renders when state updates.
 */

import { StoredRobot } from '@/services/known-robots-storage';
import {
  getConnectedRobot,
  setRobotConnected,
  setRobotDisconnected,
  subscribeToConnectionState,
} from '@/services/robot-connection-state';
import { useEffect, useState } from 'react';

interface UseRobotConnectionReturn {
  connectedRobot: StoredRobot | null;
  isConnected: boolean;
  connectRobot: (robotId: string, robot: StoredRobot) => void;
  disconnectRobot: (robotId: string) => void;
}

/**
 * Hook to access and manage robot connection state
 */
export function useRobotConnection(): UseRobotConnectionReturn {
  const [connectedRobot, setConnectedRobotState] = useState<StoredRobot | null>(
    () => getConnectedRobot()
  );

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = subscribeToConnectionState(() => {
      setConnectedRobotState(getConnectedRobot());
    });

    return unsubscribe;
  }, []);

  const connectRobot = (robotId: string, robot: StoredRobot) => {
    setRobotConnected(robotId, robot);
  };

  const disconnectRobot = (robotId: string) => {
    setRobotDisconnected(robotId);
  };

  return {
    connectedRobot,
    isConnected: connectedRobot !== null,
    connectRobot,
    disconnectRobot,
  };
}

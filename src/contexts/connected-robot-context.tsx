/**
 * Connected Robot Context
 *
 * Provides access to the currently connected robot across the app.
 * Used by the robots screen to manage connection and by settings to configure the robot.
 */

import { ConnectedRobot } from '@/hooks/use-robot-discovery';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ConnectedRobotContextValue {
  robot: ConnectedRobot | null;
  setRobot: (robot: ConnectedRobot | null) => void;
}

const ConnectedRobotContext = createContext<ConnectedRobotContextValue | null>(null);

export function ConnectedRobotProvider({ children }: { children: ReactNode }) {
  const [robot, setRobot] = useState<ConnectedRobot | null>(null);

  return (
    <ConnectedRobotContext.Provider value={{ robot, setRobot }}>
      {children}
    </ConnectedRobotContext.Provider>
  );
}

export function useConnectedRobot(): ConnectedRobotContextValue {
  const context = useContext(ConnectedRobotContext);
  if (!context) {
    throw new Error('useConnectedRobot must be used within a ConnectedRobotProvider');
  }
  return context;
}

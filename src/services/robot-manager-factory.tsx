/**
 * Robot Manager Factory and Context
 *
 * Provides a way to create and access robot managers throughout the app.
 * Automatically detects BLE availability and uses mock manager as fallback.
 */

import { BLERobotManager } from '@/services/robot-manager-ble';
import { MockRobotManager } from '@/services/robot-manager-mock';
import { IRobotManager } from '@/types/robot-discovery';
import { getBLEAvailabilityMessage, isBLEAvailable } from '@/utils/ble-availability';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Re-export BLE availability utilities for convenience
export { getBLEAvailabilityMessage, isBLEAvailable };

/**
 * Available robot manager types
 */
export type RobotManagerType = 'mock' | 'ble' | 'auto';

/**
 * Robot manager context type
 */
interface RobotManagerContextType {
  managerType: RobotManagerType;
  setManagerType: (type: RobotManagerType) => void;
  getRobotManager: () => IRobotManager;
}

const RobotManagerContext = createContext<RobotManagerContextType | undefined>(undefined);

interface RobotManagerProviderProps {
  children: ReactNode;
  defaultType?: RobotManagerType;
}

/**
 * Provider component for robot manager context
 */
export function RobotManagerProvider({
  children,
  defaultType = 'auto',
}: RobotManagerProviderProps) {
  // Determine the actual manager type to use
  const getActualManagerType = (type: RobotManagerType): 'mock' | 'ble' => {
    if (type === 'auto') {
      return isBLEAvailable() ? 'ble' : 'mock';
    }
    return type as 'mock' | 'ble';
  };

  const [managerType, setManagerTypeInternal] = useState<RobotManagerType>(defaultType);

  // Lazy-load managers to avoid instantiating BLE when not available
  const [managers] = useState<Record<'mock' | 'ble', IRobotManager | null>>(() => ({
    mock: new MockRobotManager(),
    ble: null, // Lazy-load BLE manager
  }));

  const setManagerType = (type: RobotManagerType) => {
    setManagerTypeInternal(type);
  };

  const getRobotManager = (): IRobotManager => {
    const actualType = getActualManagerType(managerType);

    // Lazy-load BLE manager if needed and not yet created
    if (actualType === 'ble' && !managers.ble) {
      managers.ble = new BLERobotManager();
    }

    return managers[actualType]!;
  };

  // Cleanup managers on unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing discovery
      Object.values(managers).forEach((manager) => {
        if (manager && manager.getStatus() === 'scanning') {
          manager.stopDiscovery();
        }
      });

      // Cleanup BLE manager resources if it was created
      const bleManager = managers.ble as BLERobotManager | null;
      if (bleManager?.destroy) {
        bleManager.destroy();
      }
    };
  }, [managers]);

  return (
    <RobotManagerContext.Provider value={{ managerType, setManagerType, getRobotManager }}>
      {children}
    </RobotManagerContext.Provider>
  );
}

/**
 * Hook to access robot manager context
 */
export function useRobotManager(): RobotManagerContextType {
  const context = useContext(RobotManagerContext);
  if (!context) {
    throw new Error('useRobotManager must be used within a RobotManagerProvider');
  }
  return context;
}

/**
 * Factory function to create a robot manager instance
 * Can be used outside of React components
 *
 * @param type - The type of manager to create. Use 'auto' for automatic detection.
 */
export function createRobotManager(type: RobotManagerType = 'auto'): IRobotManager {
  // Auto-detect if needed
  if (type === 'auto') {
    type = isBLEAvailable() ? 'ble' : 'mock';
  }

  switch (type) {
    case 'mock':
      return new MockRobotManager();
    case 'ble':
      if (!isBLEAvailable()) {
        console.warn('BLE is not available, falling back to mock manager');
        return new MockRobotManager();
      }
      return new BLERobotManager();
    default:
      throw new Error(`Unknown robot manager type: ${type}`);
  }
}

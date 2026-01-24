import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { BleManager, DiscoveredDevice } from '@/ble/manager';
import { NativeBleManager } from '@/ble/native';
import { Robot } from '@/robots';
import { Instruction } from '@/programs/instructions';

// BLE Manager Context
const defaultBleManager = new NativeBleManager();
const BleManagerContext = createContext<BleManager>(defaultBleManager);
export const BleManagerProvider = BleManagerContext.Provider;

function useBleManager(): BleManager {
  return useContext(BleManagerContext);
}

// Connected Robot Context
const ConnectedRobotContext = createContext<ConnectedRobot | null>(null);
export const ConnectedRobotProvider = ConnectedRobotContext.Provider;

export function useConnectedRobot(): ConnectedRobot | null {
  return useContext(ConnectedRobotContext);
}

// Robot Discovery Hook
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
            // Connect to the BLE device
            const connectedDevice = await bleManager.connect(device);
            // Negotiate protocol and create Robot instance
            const robotInstance = await Robot.connect(connectedDevice);
            // Wrap in ConnectedRobot
            return createConnectedRobot(robotInstance);
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

/**
 * Create a ConnectedRobot wrapper around a Robot instance
 */
function createConnectedRobot(robot: Robot): ConnectedRobot {
  let currentState: ConnectedRobotState = 'ready';
  const stateCallbacks: ((state: ConnectedRobotState) => void)[] = [];

  const setState = (newState: ConnectedRobotState) => {
    currentState = newState;
    stateCallbacks.forEach((cb) => cb(newState));
  };

  return {
    id: robot.id,
    name: robot.name,
    firmwareVersion: robot.firmwareVersion,
    protocolVersion: robot.protocolVersion,

    get state() {
      return currentState;
    },

    onStateChange(callback: (state: ConnectedRobotState) => void): () => void {
      stateCallbacks.push(callback);
      return () => {
        const idx = stateCallbacks.indexOf(callback);
        if (idx !== -1) stateCallbacks.splice(idx, 1);
      };
    },

    async startDriveMode() {
      setState('executing');
      await robot.startDriveMode();
      // State remains 'executing' until stop() is called
    },

    async recordInstructions(durationSeconds: number, interval: number) {
      setState('executing');
      try {
        await robot.recordInstructions(durationSeconds, interval);
      } finally {
        setState('ready');
      }
    },

    async uploadInstructions(instructions: Instruction[], runAfterUpload: boolean) {
      setState('executing');
      try {
        await robot.uploadInstructions(instructions, runAfterUpload);
      } finally {
        setState('ready');
      }
    },

    async downloadInstructions() {
      setState('executing');
      try {
        return await robot.downloadInstructions();
      } finally {
        setState('ready');
      }
    },

    async runStoredInstructions() {
      setState('executing');
      try {
        await robot.runStoredInstructions();
      } finally {
        setState('ready');
      }
    },

    async stop() {
      setState('stopping');
      try {
        await robot.stop();
      } finally {
        setState('ready');
      }
    },

    get interval() {
      return robot.interval;
    },

    async setInterval(value: number) {
      await robot.setInterval(value);
    },

    async disconnect() {
      await robot.disconnect();
    },

    onDisconnect(callback: () => void): () => void {
      return robot.onDisconnect(callback);
    },
  };
}

// Types

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

  connect: () => Promise<ConnectedRobot>;
}

export interface ConnectedRobot {
  // Identity
  id: string;
  name: string;
  firmwareVersion: number;
  protocolVersion: string;

  // State
  state: ConnectedRobotState;
  onStateChange: (callback: (state: ConnectedRobotState) => void) => () => void;

  // Robot operations
  startDriveMode: () => Promise<void>;
  recordInstructions: (durationSeconds: number, interval: number) => Promise<void>;
  uploadInstructions: (instructions: Instruction[], runAfterUpload: boolean) => Promise<void>;
  downloadInstructions: () => Promise<Instruction[]>;
  runStoredInstructions: () => Promise<void>;
  stop: () => Promise<void>;

  // Configuration
  interval: number;
  setInterval: (value: number) => Promise<void>;

  // Connection
  disconnect: () => Promise<void>;
  onDisconnect: (callback: () => void) => () => void;
}

export type ConnectedRobotState = 'ready' | 'executing' | 'stopping';

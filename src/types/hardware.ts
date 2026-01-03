/**
 * Hardware Layer Types
 *
 * Defines interfaces for the hardware abstraction layer that handles
 * BLE operations and emulated robots.
 */

/**
 * A discovered device from the hardware layer
 */
export interface DiscoveredDevice {
  id: string;
}

/**
 * Hardware layer state
 */
export type HardwareState = 'idle' | 'discovering' | 'connecting' | 'connected' | 'disconnected';

/**
 * Hardware layer interface
 *
 * Abstracts BLE operations and provides a consistent interface for
 * protocol handlers to communicate with robots.
 */
export interface IHardwareLayer {
  // Discovery
  startDiscovery(callback: (device: DiscoveredDevice) => void): Promise<void>;
  stopDiscovery(): Promise<void>;
  getDiscoveredDevices(): DiscoveredDevice[];

  // Connection
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Communication
  write(data: string | Uint8Array): Promise<void>;
  onNotification(callback: (data: Uint8Array) => void): () => void;

  // State
  getState(): HardwareState;
  onStateChange(callback: (state: HardwareState) => void): void;
}

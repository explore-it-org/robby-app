export type BleAdapterState = 'poweredOn' | 'poweredOff' | 'unavailable';

export interface BleManager {
  // Discovery
  startDiscovery: (callback: (device: DiscoveredDevice) => void) => Promise<void>;
  stopDiscovery: () => Promise<void>;
  isDiscovering(): boolean;

  // Connection
  connect(device: DiscoveredDevice): Promise<ConnectedDevice>;

  // Adapter state
  getAdapterState(): Promise<BleAdapterState>;
  onAdapterStateChange(callback: (state: BleAdapterState) => void): () => void;

  // Cleanup
  destroy(): void;
}

export interface DiscoveredDevice {
  // Device information
  id: string;
  name: string;
}

export interface ConnectedDevice {
  // Device information
  id: string;
  name: string;

  // Disconnecting
  disconnect(): Promise<void>;
  onDisconnect(callback: () => void): () => void;

  // Communication
  writeData(data: string | Uint8Array): Promise<void>;
  onDataReceived(callback: (data: Uint8Array) => void): () => void;
}

/**
 * BLE Hardware Layer
 *
 * Implements the hardware layer interface using real Bluetooth Low Energy.
 * Handles BLE GATT operations for communicating with physical robots.
 */

import { BleManager, Device } from 'react-native-ble-plx';
import { DiscoveredDevice, HardwareState, IHardwareLayer } from '@/types/hardware';

// BLE Service and Characteristic UUIDs for EXPLORE-IT robots
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const TRANSACTION_ID = 'exploreit';

export class BLEHardwareLayer implements IHardwareLayer {
  private bleManager: BleManager;
  private state: HardwareState = 'idle';
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();
  private connectedDevice: Device | null = null;
  private discoveryCallback?: (device: DiscoveredDevice) => void;
  private notificationCallbacks: ((data: Uint8Array) => void)[] = [];
  private stateChangeCallbacks: ((state: HardwareState) => void)[] = [];

  constructor() {
    this.bleManager = new BleManager();
  }

  async startDiscovery(callback: (device: DiscoveredDevice) => void): Promise<void> {
    this.discoveryCallback = callback;
    this.discoveredDevices.clear();

    // Check if Bluetooth is powered on
    const state = await this.bleManager.state();
    if (state !== 'PoweredOn') {
      throw new Error('Bluetooth is not powered on');
    }

    this.setState('discovering');

    // Start scanning for EXPLORE-IT robots
    this.bleManager.startDeviceScan(
      null, // Scan for all devices, filter by name
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('BLE scan error:', error);
          this.setState('idle');
          return;
        }

        if (device && this.isExploreitRobot(device)) {
          const discoveredDevice: DiscoveredDevice = {
            id: device.id,
          };

          if (!this.discoveredDevices.has(device.id)) {
            this.discoveredDevices.set(device.id, discoveredDevice);
            this.discoveryCallback?.(discoveredDevice);
          }
        }
      }
    );
  }

  async stopDiscovery(): Promise<void> {
    this.bleManager.stopDeviceScan();
    if (this.state === 'discovering') {
      this.setState('idle');
    }
  }

  getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  async connect(deviceId: string): Promise<void> {
    try {
      // Stop discovery if active before changing state
      const wasDiscovering = this.state === 'discovering';
      if (wasDiscovering) {
        await this.stopDiscovery();
      }

      this.setState('connecting');

      // Connect to device
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      // Subscribe to notifications
      await device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        BLE_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }

          if (characteristic?.value) {
            // Convert base64 to Uint8Array
            const data = Buffer.from(characteristic.value, 'base64');
            // Notify all registered callbacks
            this.notificationCallbacks.forEach((callback) => callback(new Uint8Array(data)));
          }
        },
        TRANSACTION_ID
      );

      this.connectedDevice = device;
      this.setState('connected');
    } catch (error) {
      this.setState('disconnected');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      this.connectedDevice = null;
    }
    this.setState('disconnected');
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.connectedDevice !== null;
  }

  async write(data: string | Uint8Array): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('Not connected to any device');
    }

    // Convert to base64 for BLE
    const buffer = typeof data === 'string' ? Buffer.from(data, 'latin1') : Buffer.from(data);
    const base64 = buffer.toString('base64');

    await this.connectedDevice.writeCharacteristicWithResponseForService(
      BLE_SERVICE_UUID,
      BLE_CHAR_UUID,
      base64
    );
  }

  onNotification(callback: (data: Uint8Array) => void): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      const idx = this.notificationCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.notificationCallbacks.splice(idx, 1);
      }
    };
  }

  getState(): HardwareState {
    return this.state;
  }

  onStateChange(callback: (state: HardwareState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopDiscovery();
    this.disconnect();
    this.bleManager.destroy();
  }

  private isExploreitRobot(device: Device): boolean {
    const name = device.name || device.localName || '';
    return name.startsWith('EXPLORE-IT');
  }

  private setState(state: HardwareState): void {
    this.state = state;
    this.stateChangeCallbacks.forEach((callback) => callback(state));
  }
}

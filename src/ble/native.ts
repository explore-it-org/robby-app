import { BleManager as RNBleManager, Device, State } from 'react-native-ble-plx';
import { BleAdapterState, BleManager, ConnectedDevice, DiscoveredDevice } from './manager';
import { requestBluetoothPermissions } from '@/utils/ble-permissions';
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
  latin1ToUint8Array,
} from '@/utils/buffer-utils';

const ROBOT_NAME_PREFIX = 'EXPLORE-IT';
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const TRANSACTION_ID = 'exploreit';

/**
 * Implementation of ConnectedDevice for native BLE
 */
class NativeConnectedDevice implements ConnectedDevice {
  readonly id: string;
  readonly name: string;

  private device: Device;
  private rnBleManager: RNBleManager;
  private dataCallbacks: ((data: Uint8Array) => void)[] = [];
  private disconnectCallbacks: (() => void)[] = [];

  constructor(device: Device, rnBleManager: RNBleManager) {
    this.device = device;
    this.rnBleManager = rnBleManager;
    this.id = device.id;
    this.name = device.name || device.localName || 'Unknown';
  }

  async disconnect(): Promise<void> {
    try {
      await this.rnBleManager.cancelDeviceConnection(this.device.id);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    this.notifyDisconnect();
  }

  onDisconnect(callback: () => void): () => void {
    this.disconnectCallbacks.push(callback);
    return () => {
      const idx = this.disconnectCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.disconnectCallbacks.splice(idx, 1);
      }
    };
  }

  async writeData(data: string | Uint8Array): Promise<void> {
    const uint8Array = typeof data === 'string' ? latin1ToUint8Array(data) : data;
    const base64 = uint8ArrayToBase64(uint8Array);

    await this.device.writeCharacteristicWithResponseForService(
      BLE_SERVICE_UUID,
      BLE_CHAR_UUID,
      base64
    );
  }

  onDataReceived(callback: (data: Uint8Array) => void): () => void {
    this.dataCallbacks.push(callback);
    return () => {
      const idx = this.dataCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.dataCallbacks.splice(idx, 1);
      }
    };
  }

  /**
   * Called internally when data is received from the device
   */
  handleDataReceived(data: Uint8Array): void {
    this.dataCallbacks.forEach((callback) => callback(data));
  }

  /**
   * Called internally when disconnection is detected
   */
  notifyDisconnect(): void {
    this.disconnectCallbacks.forEach((callback) => callback());
  }
}

export class NativeBleManager implements BleManager {
  private rnBleManager: RNBleManager;
  private discovering = false;

  constructor() {
    this.rnBleManager = new RNBleManager();
  }

  async startDiscovery(callback: (device: DiscoveredDevice) => void): Promise<void> {
    const permissionsGranted = await requestBluetoothPermissions();
    if (!permissionsGranted) {
      throw new Error('Bluetooth permissions not granted');
    }

    const adapterState = await this.getAdapterState();
    if (adapterState !== 'poweredOn') {
      throw new Error('Bluetooth is not powered on');
    }

    this.discovering = true;

    this.rnBleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        this.discovering = false;
        return;
      }

      if (device && this.isRobot(device.name || device.localName)) {
        callback({
          id: device.id,
          name: device.name || device.localName || 'Unknown',
        });
      }
    });
  }

  async stopDiscovery(): Promise<void> {
    this.rnBleManager.stopDeviceScan();
    this.discovering = false;
  }

  isDiscovering(): boolean {
    return this.discovering;
  }

  async connect(device: DiscoveredDevice): Promise<ConnectedDevice> {
    // Stop discovery if active
    if (this.discovering) {
      await this.stopDiscovery();
    }

    // Connect to device
    const rnDevice = await this.rnBleManager.connectToDevice(device.id);
    await rnDevice.discoverAllServicesAndCharacteristics();

    // Create connected device wrapper
    const connectedDevice = new NativeConnectedDevice(rnDevice, this.rnBleManager);

    // Subscribe to notifications
    rnDevice.monitorCharacteristicForService(
      BLE_SERVICE_UUID,
      BLE_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Notification error:', error);
          return;
        }

        if (characteristic?.value) {
          const data = base64ToUint8Array(characteristic.value);
          connectedDevice.handleDataReceived(data);
        }
      },
      TRANSACTION_ID
    );

    // Monitor for disconnection
    rnDevice.onDisconnected(() => {
      connectedDevice.notifyDisconnect();
    });

    return connectedDevice;
  }

  async getAdapterState(): Promise<BleAdapterState> {
    const state = await this.rnBleManager.state();
    return this.mapAdapterState(state);
  }

  onAdapterStateChange(callback: (state: BleAdapterState) => void): () => void {
    const subscription = this.rnBleManager.onStateChange((state) => {
      const mappedState = this.mapAdapterState(state);
      callback(mappedState);
    }, true);

    return () => {
      subscription.remove();
    };
  }

  destroy(): void {
    this.stopDiscovery();
    this.rnBleManager.destroy();
  }

  private isRobot(name: string | null | undefined): boolean {
    if (!name) {
      return false;
    }
    return name.startsWith(ROBOT_NAME_PREFIX);
  }

  private mapAdapterState(state: State): BleAdapterState {
    switch (state) {
      case State.PoweredOn:
        return 'poweredOn';
      case State.PoweredOff:
        return 'poweredOff';
      default:
        return 'unavailable';
    }
  }
}

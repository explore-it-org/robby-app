import { BleManager as RNBleManager, State } from 'react-native-ble-plx';
import { BleAdapterState, BleManager, ConnectedDevice, DiscoveredDevice } from './manager';
import { requestBluetoothPermissions } from '@/utils/ble-permissions';

const ROBOT_NAME_PREFIX = 'EXPLORE-IT';

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

  async connect(_device: DiscoveredDevice): Promise<ConnectedDevice> {
    throw new Error('Not implemented');
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

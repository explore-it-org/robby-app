import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// These values are unique to explore-it devices.
const serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const characteristicsUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const transactionId = 'exploreit';

class BleService {
    constructor() {
        this.devices = null;
        this.actDevice = null;
        this.manager = new BleManager();
        this.subscription = null;
        this.c = 0;
    }

    async requestLocationPermission() {
        if (Platform.OS === "ios") {
            return true;
        }
        // we are on android
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Location permission granted")
            } else {
                console.log("Location permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }

    checkBluetoothState(stateHandler) {
        // state of Bluetooth on client device (on/off/etc)
        this.manager.onStateChange((state) => {
            if (state == 'PoweredOn') {
                stateHandler();
            }
        }, true);
    }

    scanningForRobots(errorHandler, deviceHandler) {
        // Just for testing
        /*
        simDevices = ['Device A', 'Device B'];
        setTimeout(() => {
          deviceHandler(simDevices[0]);
        }, 100);
        setTimeout(() => {
          deviceHandler(simDevices[1]);
        }, 100);
        */
        this.devices = new Map();
        let services = [];
        services.push(serviceUUID)
        this.manager.startDeviceScan(services, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                errorHandler(error);
                return
            }
            // new device detected. check it!
            if (device.name && device.name.startsWith('EXPLORE-IT')) {
                devicesFound = this.devices.get(device.name);
                if (devicesFound === undefined) {
                    this.devices.set(device.name, device);
                    deviceHandler(device.name);
                }
            }
        });
    }

    stopScanning() {
        this.manager.stopDeviceScan();
    }

    connectToActDevice(responseHandler, connectionHandler, errorHandler) {
        console.log('BleService connecting...');
        this.actDevice.connect()
            .then((device) => {
                console.log('BleService connect - ' + device.name);
                // Promise which emits the device object if all available services and characteristics have been discovered.
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
                // Returns connected device object if successful.
                console.log('BleService monitor - ' + device.name);
                // Workaround for multiple listeners
                this.c++;
                let localc = this.c;
                // Monitor value changes of a ble characteristic.
                this.subscription = device.monitorCharacteristicForService(
                    serviceUUID,
                    characteristicsUUID,
                    // Add listener to handle responses from connected device
                    (error, characteristic) => {
                        if (this.c == localc){
                            if (error) {
                                throw error
                            }
                            response = Buffer.from(characteristic.value, 'base64').toString('ascii');
                            responseHandler(response);
                        }
                    },
                    transactionId);
                console.log('BleService connection done - ' + device.name);
                console.log("transaction id: " + transactionId)
                connectionHandler(device);
            })
            .catch((error) => {
                // Handle errors
                console.log('BleService error - ' + error);
                errorHandler(error);
            });
    }

    setActDevice(deviceName) {
        this.actDevice = this.devices.get(deviceName);
    }

    getActDevice() {
        return this.actDevice;
    }

    sendCommandToActDevice(command) {
        if (this.actDevice) {
            this.actDevice.writeCharacteristicWithResponseForService(
                serviceUUID,
                characteristicsUUID,
                Buffer.from(command).toString('base64'),
                null
            );
        }
    }

    shutdown() {
        this.manager.cancelTransaction(transactionId);
        this.subscription.remove();
        this.actDevice.cancelConnection().then(device => console.log('BleService disconnected') ).catch(error => console.log('Failed with ' + error) );
        this.actDevice = null;
    }
}

// Singleton pattern in ES6
export default new BleService();
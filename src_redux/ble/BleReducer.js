import * as ActionType from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';


const default_state_ble_connection = {
    lastUpdate: Date.now(),
    isConnecting: false,
    isConnected: false,
    isScanning: false,
    scannedDevices: [],
    device: {
        name: 'Unknown',
        version: 1,
    },
    response: [],
    error: '',
};
export const BleConnectionReducer = (state = default_state_ble_connection, action) => {
    switch (action.type) {
        case ActionType.START_CONNECTING:
            return Object.assign({}, state, {isConnecting: true, isConnected: false});
        case ActionType.SUCCESS_CONNECTING:
            return Object.assign({}, state, {isConnecting: false, isConnected: true, lastUpdate: Date.now()});
        case ActionType.FAILURE_CONNECTING:
            return Object.assign({}, state, {
                isConnecting: false,
                isConnected: false,
                device: {...state.device, name: 'Unknown'},
                lastUpdate: Date.now(),
            });
        case ActionType.IS_CONNECTED:
            console.log('i am called with: ' + action.robot.name);
            return Object.assign({}, state, {
                isConnecting: false,
                isConnected: true,
                lastUpdate: Date.now(),
                device: {...state.device, name: action.robot.name},
            });
        case ActionType.UPDATE_DEVICE_VERSION:
            return Object.assign({}, state, {device: {...state.device, version: action.version}});
        case ActionType.BLE_RESPONSE:
            return state;
        case ActionType.SUCCESS_SCANNING:
            return Object.assign({}, state, {scannedDevices: [...state.scannedDevices, action.robot]});
        case ActionType.FAILURE_SCANNING:
            return Object.assign({}, state, {error: action.error, isScanning: false, scannedDevices: []});
        case ActionType.START_SCANNING:
            return Object.assign({}, state, {isScanning: true});
        case ActionType.STOP_SCANNING:
            RobotProxy.stopScanning();
            return Object.assign({}, state, {isScanning: false, scannedDevices: []});


        default:
            return state;

    }
};



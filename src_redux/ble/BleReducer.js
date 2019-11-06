import * as ActionType from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';


const default_state_ble_connection = {
    active_device: '',
    lastUpdate: Date.now(),
    isConnecting: false,
    isConnected: false,
    isScanning: false,
    scannedDevices: [],
    device: {
        name: 'Unknown',
        version: 1,
        isRecording: false,
        isRunning: false,
        isUploading: false,
        isDownloading: false,
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
            console.log('my version is ' + action.version);
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
        case ActionType.DISCONNECT:
            RobotProxy.disconnect();
            return default_state_ble_connection;
        case ActionType.SET_BLE_DEVICE:
            RobotProxy.setRobot(action.device);
            return Object.assign({}, state, {active_device: action.device});
        case ActionType.STOP_ROBOT:
            return Object.assign({}, state, {device: {...state.device, isRunning: false}});
        case ActionType.RUN_ROBOT:
            return Object.assign({}, state, {device: {...state.device, isRunning: true}});
        case ActionType.SUCCESS_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: false}});
        case ActionType.START_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: true}});
        case ActionType.FAILURE_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: false}});
        default:
            return state;

    }
};



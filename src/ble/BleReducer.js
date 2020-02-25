import * as ActionType from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';
import i18n from '../../resources/locales/i18n';


const default_state_ble_connection = {
    active_device: '',
    lastUpdate: Date.now(),
    isConnecting: false,
    isConnected: false,
    isScanning: false,
    receivedDownloads: [],
    scannedDevices: [],
    device: {
        name: '',
        version: 1,
        isRecording: false,
        isRunning: false,
        isUploading: false,
        isDownloading: false,
        isGoing: false,
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

                device: {...state.device, name: ''},
                lastUpdate: Date.now(),
            });
        case ActionType.LOST_CONNECTION:
            RobotProxy.disconnect();
            return default_state_ble_connection;
        case ActionType.IS_CONNECTED:
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
            return Object.assign({}, state, {scannedDevices: [...state.scannedDevices, action.robot], error: ''});
        case ActionType.ENABLED_SCANNING:
            return Object.assign({}, state, {error: action.error});
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
            return Object.assign({}, state, {
                device: {
                    ...state.device,
                    isRunning: false,
                    isGoing: false,
                    isRecording: false,
                    isUploading: false,
                    isDownloading: false,
                },
            });
        case ActionType.RUN_ROBOT:
            return Object.assign({}, state, {device: {...state.device, isRunning: true}});
        case ActionType.SUCCESS_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: false, isUploading: false}});
        case ActionType.START_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: true}});
        case ActionType.FAILURE_RECORDING:
            return Object.assign({}, state, {device: {...state.device, isRecording: false}});
        case ActionType.GO_ROBOT:

            return Object.assign({}, state, {device: {...state.device, isGoing: true}});
        case ActionType.FAILURE_UPLOADING:
            return Object.assign({}, state, {device: {...state.device, isUploading: false}});
        case ActionType.SUCCESS_UPLOADING:
            return Object.assign({}, state, {device: {...state.device, isUploading: false, isRecording: false}});
        case ActionType.START_UPLOADING:
            return Object.assign({}, state, {device: {...state.device, isUploading: true}});
        case ActionType.START_DOWNLOADING:
            return Object.assign({}, state, {device: {...state.device, isDownloading: true}, receivedDownloads: []});
        case ActionType.SUCCESS_DOWNLOADING:
            return Object.assign({}, state, {device: {...state.device, isDownloading: false}});
        case ActionType.FAILURE_DOWNLOADING:
            return Object.assign({}, state, {device: {...state.device, isDownloading: false}});
        case ActionType.APPEND_CHUNK:
            return Object.assign({}, state, {
                receivedDownloads: [
                    ...state.receivedDownloads,
                    ...action.chunk
                ],
            });
        default:
            return state;

    }
};



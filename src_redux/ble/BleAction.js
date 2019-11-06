import * as ActionTypes from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';
import store from '../store/store';
import BleService from './BleService';
import * as settingsAction from '../settings/SettingsAction';
import {handleResponse} from './ResponseActionHandler';

export const connectToBle = () => ({
    type: ActionTypes.START_CONNECTING,
});
export const connectedToBle = (robot) => ({
    type: ActionTypes.IS_CONNECTED,
    robot
});
export const connectionFailed = (error) => ({
    type: ActionTypes.FAILURE_CONNECTING,
});
export const bleResponse = (response) => ({
    type: ActionTypes.BLE_RESPONSE,
    response: response,
});
export const updateDeviceVersion = (version) => ({
    type: ActionTypes.UPDATE_DEVICE_VERSION,
    version: version,
});
export const startScanning = () => ({
    type: ActionTypes.START_SCANNING,
});
export const failedScanning = (error) => ({
    type: ActionTypes.FAILURE_SCANNING,
    error,
});
export const succesScanning = (robot) => ({
    type: ActionTypes.SUCCESS_SCANNING,
    robot,
});
export const stopScanning = () => ({
    type: ActionTypes.STOP_SCANNING,
});


export const scanningForDevices = () => {
    return (dispatch, getState) => {
        dispatch(startScanning());
        RobotProxy.scanningForRobots((error) => {
            dispatch(failedScanning(error));
        }, (robot) => {
            dispatch(succesScanning(robot));
        });
    };
};

export const connectToDevice = () => {
    return (dispatch, getState) => {
        dispatch(connectToBle());
        RobotProxy.connect2((response) => {
            let a = handleResponse(response);
            //console.log(a);
            dispatch(a);
        }, (robot) => {
            console.log(robot.name);
            dispatch(connectedToBle(robot));
        }, (error) => {
            dispatch(connectionFailed(error));
        });
    };
};


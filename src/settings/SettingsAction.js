import * as ActionTypes from '../GlobalActionTypes';
import RobotProxy from './../ble/RobotProxy';
import {failedUplaod, startUpload} from '../ble/BleAction';

export const setDuration = (duration) => ({
    type: ActionTypes.SET_DURATION,
    duration,
});
export const setInterval = (interval) => ({
    type: ActionTypes.SET_INTERVALL,
    interval,
});

export const grantLocation = (isGranted) => ({
    type: ActionTypes.GRANT_LOCATION,
    isGranted,
});

export const setBLEState = (bleState) => ({
    type: ActionTypes.BLE_STATE,
    bleState,
});

export const setIntervalAndSendToRobby = (inter) => {
        return (dispatch, getState) => {
            RobotProxy.setInterval(inter).then(res => {
            });
        };
    };

export const setLanguage = (language) => ({
    type: ActionTypes.SET_LANGUAGE,
    language
});



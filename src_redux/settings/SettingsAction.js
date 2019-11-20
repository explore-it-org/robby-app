import * as ActionTypes from '../GlobalActionTypes';
import RobotProxy from './../ble/RobotProxy';
import {failedUplaod, startUpload} from '../ble/BleAction';

export const setDuration = (duration) => ({
    type: ActionTypes.SET_DURATION,
    duration,
});
export const _setInterval = (interval) => ({
    type: ActionTypes.SET_INTERVALL,
    interval,
});
export const setLoops = (loops) => ({
    type: ActionTypes.SET_LOOPS,
    loops,
});


export const setInterval = (inter) => {
        return (dispatch, getState) => {
            RobotProxy.setInterval(inter).then(res => {
                dispatch(_setInterval(inter));
            });
        };
    }
;


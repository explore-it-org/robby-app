import * as ActionTypes from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';
import {mainHandler} from './ResponseActionHandler';
import {} from '../database/DatabaseAction';
import {
    clearProgram,
    emptyInstructionList,
    receiveDownload,
} from '../programmingtabs/stepprogramming/ActiveInstructionAction';
import {Program, ProgramType} from '../model/DatabaseModels';
import {Alert} from 'react-native';


export const connectToBle = () => ({
    type: ActionTypes.START_CONNECTING,
});
export const connectedToBle = (robot) => ({
    type: ActionTypes.IS_CONNECTED,
    robot,
});
export const connectionFailed = (error) => ({
    type: ActionTypes.FAILURE_CONNECTING,
});
export const disconnect = () => ({
    type: ActionTypes.DISCONNECT,
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
export const scanningEnabled = (error) => ({
    type: ActionTypes.ENABLED_SCANNING,
    error,
});
export const stopScanning = () => ({
    type: ActionTypes.STOP_SCANNING,
});

export const setDevice = (device) => ({
    type: ActionTypes.SET_BLE_DEVICE,
    device,
});

export const stoppedRobot = () => ({
    type: ActionTypes.STOP_ROBOT,
});

export const ranRobot = () => ({
    type: ActionTypes.RUN_ROBOT,
});

export const bleError = (error) => ({
    type: ActionTypes.BLE_ERROR,
    error,
});


export const runRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.run().then(res => {
            dispatch(ranRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });

    };
};

export const didGoRobot = () => ({
    type: ActionTypes.GO_ROBOT,
});

export const goRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.go().then(res => {
            dispatch(didGoRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });
    };
};


export const stopRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.stop().then(res => {
            dispatch(stoppedRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });
    };
};

export const tryRecording = () => ({
    type: ActionTypes.START_RECORDING,
});
export const successRecording = () => ({
    type: ActionTypes.SUCCESS_RECORDING,
});
export const errorRecording = (error) => ({
    type: ActionTypes.FAILURE_RECORDING,
    error,
});

export const startRecording = () => {
    return (dispatch, getState) => {
        let duration = getState().Settings.duration;
        let interval = getState().Settings.interval;
        let version = getState().BLEConnection.device.version;
        RobotProxy.record(duration, interval, version).then(res => {
            dispatch(tryRecording());
        }).catch(error => {
            dispatch(errorRecording(error));
        });
    };
};
export const scanningForDevices = () => {
    return (dispatch, getState) => {
        dispatch(startScanning());
        RobotProxy.scanningForRobots((error) => {
            dispatch(failedScanning(error));
            Alert.alert('ble error', error);
        }, (robot) => {
            dispatch(succesScanning(robot));
        });
    };
};

export const scanStatus = () => {
    return (dispatch, getState) => {
        RobotProxy.testScan((error) => {
            RobotProxy.stopScanning();
            dispatch(failedScanning(error));
        }, (success) => {
            RobotProxy.stopScanning();
            dispatch(scanningEnabled());
        });
    };
};
export const connectToDevice = () => {
    return (dispatch, getState) => {
        dispatch(connectToBle());
        RobotProxy.connect2((response) => {
            dispatch(mainHandler(response));
        }, (robot) => {
            console.log(robot.name);
            dispatch(connectedToBle(robot));
        }, (error) => {
            dispatch(connectionFailed(error));
        });
    };
};
export const startUpload = () => ({
    type: ActionTypes.START_UPLOADING,
});

export const successUplaod = () => ({
    type: ActionTypes.SUCCESS_UPLOADING,
});

export const failedUplaod = (error) => ({
    type: ActionTypes.FAILURE_UPLOADING,
    error,
});
export const uploadToRobot = (ActiveProgram) => {
    return (dispatch, getState) => {
        let a = null;
        if (ActiveProgram === 'Stepprogramming') {
            a = getState().ActiveProgram.ActiveProgram.flatten();
            console.log(a);
        } else {
            a = getState().ActiveBlock.Active_Block.flatten();
            console.log(a);
        }
        dispatch(startUpload());
        RobotProxy.upload(a, getState().BLEConnection.device.version).then(res => {

        }).catch(error => {
            dispatch(failedUplaod());
        });
    };
};

export const startDownloading = () => ({
    type: ActionTypes.START_DOWNLOADING,
});
export const errorDownloading = (error) => ({
    type: ActionTypes.FAILURE_DOWNLOADING,
    error,
});
export const successDownloading = () => ({
    type: ActionTypes.SUCCESS_DOWNLOADING,
});

export const finishedDownloading = () => {
    return (dispatch, getState) => {
        dispatch(successDownloading());
        dispatch(receiveDownload(new Program('', ProgramType.STEPS, getState().BLEConnection.receivedDownloads)));
    };
};
export const receivedChunck = (chunk) => ({
    type: ActionTypes.RECEIVED_CHUNK,
    chunk,
});


export const downloadToDevice = () => {
    return (dispatch, getState) => {
        dispatch(startDownloading());
        dispatch(emptyInstructionList());
        RobotProxy.download().then(res => {

        }).catch(error => {
            dispatch(errorDownloading(error));
        });
    };
};

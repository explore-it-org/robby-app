import * as ActionTypes from '../GlobalActionTypes';


export const connectToBle = () => ({
    type: ActionTypes.START_CONNECTING,
}), connectedToBle = () => ({
    type: ActionTypes.START_CONNECTING,
}), connetionFailed = (error) => ({
    type: ActionTypes.FAILURE_CONNECTING,
}), bleResponse = (response) => ({
    type: ActionTypes.BLE_RESPONSE,
    response: response,
}), updateDeviceVersion = (version) => ({
    type: ActionTypes.UPDATE_DEVICE_VERSION,
    version: version,
});

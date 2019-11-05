import * as ActionType from '../GlobalActionTypes';



const default_state_ble_connection = {
    lastUpdate: Date.now(),
    isConnecting: false,
    isConnected: false,
    device: {
        name: 'Unknown',
        version: 1,
    },
    response: [],
};
export const BleConnectionReducer = (state = default_state_ble_connection, action) => {
    switch (action.typeof) {
        case ActionType.START_CONNECTING:
            return Object.assign({}, state, {isConnecting: true, isConnected: false});
        case ActionType.SUCCESS_CONNECTING:
            return Object.assign({}, state, {isConnecting: false, isConnected: true, lastUpdate: Date.now()});
        case ActionType.FAILURE_CONNECTING:
            return Object.assign({}, state, {
                isConnecting: false,
                isConnected: false,
                deviceName: 'Unknown',
                lastUpdate: Date.now(),
            });
        case ActionType.UPDATE_DEVICE_VERSION:
            return Object.assign({}, state, {device: {version: action.version}});
        case ActionType.BLE_RESPONSE:
            return state;

        default:
            return state;

    }
};



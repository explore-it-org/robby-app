import * as ActionType from '../GlobalActionTypes';


const default_state_settings = {
    lastUpdate: Date.now(),
    duration: 5,
    interval: 0,
    isGranted: false,
    language: undefined,
    bleState: '',
    visible: false,
    showExtendedRobotInfo: false,

};
export const SettingsReducer = (state = default_state_settings, action) => {
    switch (action.type) {
        case ActionType.SET_INTERVALL:
            return Object.assign({}, state, {interval: action.interval, lastUpdate: Date.now()});
        case ActionType.SET_DURATION:
            return Object.assign({}, state, {duration: action.duration, lastUpdate: Date.now()});
        case ActionType.SET_LANGUAGE:
            return Object.assign({}, state, {language: action.language, lastUpdate: Date.now()});
        case ActionType.GRANT_LOCATION:
            return Object.assign({}, state, {isGranted: action.isGranted});
        case ActionType.BLE_STATE:
            return Object.assign({}, state, {bleState: action.bleState});
        case ActionType.TOGGLE_SETTINGS:
            return Object.assign({}, state, {visible: !state.visible});
        case ActionType.SET_EXTENDED_ROBOT_INFO:
            return Object.assign({}, state, {showExtendedRobotInfo: action.showExtended, lastUpdate: Date.now()});
        default:
            return state;
    }
};



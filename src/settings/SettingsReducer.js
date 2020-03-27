import * as ActionTypes from '../GlobalActionTypes';


const default_state_settings = {
    lastUpdate: Date.now(),
    duration: 1,
    interval: 0,
    isGranted: false,
    language: undefined,
    bleState: '',
    visible: false,
    selectedAlgorithm: 1

};
export const SettingsReducer = (state = default_state_settings, action) => {
    switch (action.type) {
        case ActionTypes.SET_INTERVALL:
            return Object.assign({}, state, { interval: action.interval, lastUpdate: Date.now() });
        case ActionTypes.SET_DURATION:
            return Object.assign({}, state, { duration: action.duration, lastUpdate: Date.now() });
        case ActionTypes.SET_LANGUAGE:
            return Object.assign({}, state, { language: action.language, lastUpdat: Date.now() });
        case ActionTypes.SET_ALGORITHM:
            return Object.assign({}, state, { selectedAlgorithm: action.algorithm, lastUpdat: Date.now() });
        case ActionTypes.GRANT_LOCATION:
            return Object.assign({}, state, { isGranted: action.isGranted });
        case ActionTypes.BLE_STATE:
            return Object.assign({}, state, { bleState: action.bleState });
        case ActionTypes.TOGGLE_SETTINGS:
            return Object.assign({}, state, { visible: !state.visible });
        default:
            return state;
    }
};



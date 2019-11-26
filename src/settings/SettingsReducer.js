import * as ActionType from '../GlobalActionTypes';


const default_state_settings = {
    lastUpdate: Date.now(),
    duration: 1,
    interval: 0,
    isGranted: false,
    language: undefined,
    bleState: '',

};
export const SettingsReducer = (state = default_state_settings, action) => {
    switch (action.type) {
        case ActionType.SET_INTERVALL:
            if (action.interval === '') {
                action.interval = 1;
            }
            return Object.assign({}, state, {interval: action.interval, lastUpdate: Date.now()});
        case ActionType.SET_DURATION:
            console.log(Object.assign({}, state, {duration: action.duration, lastUpdate: Date.now()}));
            return Object.assign({}, state, {duration: action.duration, lastUpdate: Date.now()});
        case ActionType.SET_LANGUAGE:
            return Object.assign({}, state, {language: action.language, lastUpdat: Date.now()});
        case ActionType.GRANT_LOCATION:
            return Object.assign({}, state, {isGranted: action.isGranted});
        case ActionType.BLE_STATE:
            return Object.assign({}, state, {bleState: action.bleState});
        default:
            return state;
    }
};



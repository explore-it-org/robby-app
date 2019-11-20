import * as ActionType from '../GlobalActionTypes';


const default_state_settings = {
    lastUpdate: Date.now(),
    duration: 1,
    loops: 1,
    interval: 0,

};
export const SettingsReducer = (state = default_state_settings, action) => {
    switch (action.type) {
        case ActionType.SET_LOOPS:
            return Object.assign({}, state, {loops: action.loops, lastUpdate: Date.now()});
        case ActionType.SET_INTERVALL:
            if (action.interval === '') {
                action.interval = 1;
            }
            return Object.assign({}, state, {interval: action.interval, lastUpdate: Date.now()});
        case ActionType.SET_DURATION:
            console.log(Object.assign({}, state, {duration: action.duration, lastUpdate: Date.now()}));
            return Object.assign({}, state, {duration: action.duration, lastUpdate: Date.now()});
        default:
            return state;
    }
};



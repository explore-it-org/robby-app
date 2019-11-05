import * as ActionTypes from '../GlobalActionTypes';


export const setDuration = (duration) => ({
    type: ActionTypes.SET_DURATION,
    duration,
});
export const setInterval = (interval) => ({
    type: ActionTypes.SET_INTERVALL,
    interval,
});
export const setLoops = (loops) => ({
    type: ActionTypes.SET_LOOPS,
    loops,
});

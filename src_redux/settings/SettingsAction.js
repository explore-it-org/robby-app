import * as ActionTypes from '../GlobalActionTypes';


export const setDuration = (duration) => ({
    type: ActionTypes.SET_DURATION,
    duration: duration,
}), setInterval = (interval) => ({
    type: ActionTypes.SET_INTERVALL,
    interval: interval,
}), setLoops = (loops) => ({
    type: ActionTypes.SET_LOOPS,
    loops: loops,
});

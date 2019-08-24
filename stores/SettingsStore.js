import i18n from '../locales/i18n'

let duration = 5; // 1-80
let interval = 0; // 1-50, 0 means disconnected
let intervalChangeListeners = []

//let calibration_left; // 1-20
//let calibration_right; // 1-20

let deviceName = i18n.t('SettingsStore.noConnection'); // if undefined: no connection
let deviceNameChangeListeners = [];

let loops = 1;


function getDeviceName() : string {
    return deviceName;
}

/**
 * Changes the device name in this store. Clients interested to be informed whenever the
 * device name changes can register a listener.
 * @param new_name the new name is passed as an object of the form { device: <name> }
 */
function setDeviceName(new_name) {
    deviceName = new_name.device;
    deviceNameChangeListeners.forEach(cb => {
        cb(deviceName);
    });
}

/**
 * Adds a listener which is invoked whenever the device name chanes.
 * Such a listener is registered in:
 * - App.js
 * - Programming.js
 * - Settings.js
 *
 * @param fn function to be invoked, type: (String) => {}
 */
function addDeviceNameChangeListener(fn) {
    deviceNameChangeListeners.push(fn);
}

function getLoopCounter() : number {
    return loops;
}

function setLoopCounter(value) {
    loops = value;
}

function getDuration() : number {
    return duration;
}

function setDuration(value) {
    duration = value;
}

function getInterval() : number {
    return interval;
}

function setInterval(value) {
    interval = value;
    intervalChangeListeners.forEach(listener => { listener(value); });
}

function addIntervalChangeListener(fn) {
    intervalChangeListeners.push(fn);
}


export {
    getDeviceName,
    setDeviceName,
    addDeviceNameChangeListener,

    getInterval,
    setInterval,
    addIntervalChangeListener,

    getLoopCounter,
    setLoopCounter,

    getDuration,
    setDuration
}
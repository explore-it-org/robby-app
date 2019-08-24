import i18n from '../locales/i18n'

//let calibration_left; // 1-20
//let calibration_right; // 1-20

let deviceName = i18n.t('SettingsStore.noConnection'); // if undefined: no connection
let deviceNameChangeListeners = [];

function getDeviceName() : string {
    return deviceName;
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

/**
 * Changes the device name in this store. Clients interested to be informed whenever the
 * device name changes can register a listener.
 * @param new_name the new name is passed as an object of the form { device: <name> }
 */
function setDeviceName(new_name) {
    deviceName = new_name.device;
    deviceNameChangeListeners.forEach(listener => { listener(deviceName); });
}

let loops = 1;

function getLoopCounter() : number {
    return loops;
}

function setLoopCounter(value) {
    loops = value;
}

let duration = 5; // 1-80

function getDuration() : number {
    return duration;
}

function setDuration(value) {
    duration = value;
}

let interval = 0; // 1-50, 0 means disconnected
let intervalChangeListeners = []

function getInterval() : number {
    return interval;
}

function addIntervalChangeListener(fn) {
    intervalChangeListeners.push(fn);
}

function setInterval(value) {
    interval = value;
    intervalChangeListeners.forEach(listener => { listener(value); });
}

let connected = false;
let connectedChangeListeners = []

function isConnected() : boolean {
    return connected;
}

function addConnectedChangeListener(fn) {
    connectedChangeListeners.push(fn);
}

function setConnected(c) {
    connected = c
    connectedChangeListeners.forEach(listener => { listener(c); });
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
    setDuration,

    isConnected,
    setConnected,
    addConnectedChangeListener
}
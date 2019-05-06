import i18n from '../locales/i18n'

let duration = 1; // 1-80
let interval = 1; // 1-50

let calibration_left; // 1-20
let calibration_right; // 1-20

let device_name = i18n.t('SettingsStore.noConnection'); // if undefined: no connection
let callbacks = [];

let loops = 1;

function update_device_name(new_name) {
    device_name=new_name.device;
    callbacks.forEach(cb => {
        cb(device_name);
    });
}

function set_update_device_name_callback(fn) {
    callbacks.push(fn);
}

function set_loops(n) {
    loops = n;
}

export {
    duration,
    interval,
    device_name,
    update_device_name,
    calibration_left,
    set_update_device_name_callback,
    loops,
    set_loops
}
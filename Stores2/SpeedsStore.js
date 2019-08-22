import { AsyncStorage } from "react-native"

let speeds = [{left: 0, right: 0}]; // containing pairs of speed instructions of left and right wheel in 1-100%
let callbacks = [];

function add(value) {
    speeds.push(value);
    update_speeds();
    return speeds
}

function add_at(value, index) {
    speeds.splice(index, 0, value);
    update_speeds()
}

function move(old_index, new_index) {
    if (new_index >= speeds.length) {
        let k = new_index - speeds.length + 1;
        while (k--) {
            speeds.push(undefined);
        }
    }
    speeds.splice(new_index, 0, speeds.splice(old_index, 1)[0]);
    update_speeds()
}

function remove(index=-1) {
    speeds.splice(index,1);
    update_speeds();
}

function remove_all() {
    speeds = []
    update_speeds()
}

function update_leftspeed(index, new_speed){
    speeds[index].left = new_speed
    update_speeds()
}

function update_rightspeed(index, new_speed){
    speeds[index].right = new_speed
    update_speeds()
}

function set_update_speeds_callback(fn) {
    callbacks.push(fn);
}

function update_speeds() {
    callbacks.forEach(cb => {
        cb(speeds);
    });
}

storeSpeeds = async () => {
    try {
        await AsyncStorage.setItem('speeds', speeds);
    } catch (error) {
        // Error saving data
    }
};

retrieveSpeeds = async () => {
    try {
        const value = await AsyncStorage.getItem('speeds');
        if (value !== null) {
            speeds = value
        }
    } catch (error) {
        // Error retrieving data
    }
};

export {
    add,
    add_at,
    move,
    remove,
    remove_all,
    update_leftspeed,
    update_rightspeed,
    set_update_speeds_callback,
    speeds,
    //storeSpeeds,
    //retrieveSpeeds
};
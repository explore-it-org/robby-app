import * as settingsAction from '../settings/SettingsAction';
import BleService from './BleService';
import * as bleAction from './BleAction';
import {Instruction} from '../model/DatabaseModels';
import store from '../store/store';
import {resolve} from 'react-native-svg/src/lib/resolve';
let downloading = false;
let linecount = 0;

export const mainHandler = (response) => {

    switch (store.getState().BLEConnection.device.version) {
        case 1:
            return handleResponse1(response);
        case 2:
        case 3:
        case 4:
            return handleResponse3(response);
        case 5:
        case 6:
        default:
            return handleResponse6(response);
    }
};

const handleResponse1 = (response) => {
    if (response.startsWith('VER')) {
        return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
    }
    return bleAction.bleResponse('');
};

const convertStringToByteArray = (str) => {
    String.prototype.encodeHex = function () {
    var bytes = [];
    for (var i = 0; i < this.length; ++i) {
     bytes.push(this.charCodeAt(i));
    }
    return bytes;
    };
   
    var byteArray = str.encodeHex();
    console.log(byteArray);
    return byteArray
}

const toHexString = (byteArray) => {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

/**
 * All return value must be plain
 */
export const handleResponse3 = (response) => {
    console.log(toHexString(convertStringToByteArray(response)));
    if (response.startsWith('VER')) {
        return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
    } else if (response.startsWith('I=')) {
        // Response to I?:  I=02
        return settingsAction.setInterval(parseInt(response.substring(2)));
    } else if (response.match('\\b[0-9]{3}\\b,\\b[0-9]{3}\\b')) {
        let read_instructions = response.trim().split(',');
        let instruction = new Instruction(Math.trunc(read_instructions[1] / 2.55 + 0.5), Math.trunc(read_instructions[0] / 2.55 + 0.5));
        return bleAction.receivedChunck([instruction]);
    } else {
        response = response.trim().toLowerCase();
        switch (response) {
            case (',,,,'):
                // finished download (beam)
                return bleAction.finishedDownloading();
            case ('_sr_'):
                // stop
                this.isLearning = false;
                return bleAction.stoppedRobot();
            case ('full'):
                // finished learning or uploading
                // var res = {type: this.isLearning ? 'finishedLearning' : 'finishedUpload'};
                return bleAction.successUplaod();
            case ('_end'):
                // done driving
                var res = {type: 'finishedDriving'};
                this.loops--;
                if (this.loops > 0) {
                    BleService.sendCommandToActDevice('G');
                } else {
                    return bleAction.stoppedRobot();
                }
                break;
            default:
                return bleAction.bleResponse('');
        }
    }
    return bleAction.bleResponse('');
};
function createMultiArray(packet){
    let result = [];
    while (packet.length > 0) {

        let chunk = packet.splice(0,2)
      
        result.push(chunk);
      }

      return result;
}
export const handleResponse6 = (response) => {
    console.log(toHexString(convertStringToByteArray(response)));
    if (response.startsWith('VER')) {
        return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
    } else if (response.startsWith('I=')) {
        // Response to I?:  I=02
        return settingsAction.setInterval(parseInt(response.substring(2)));
    } else if(response.trim().toLowerCase() === '_sr_') {
        // stop
        this.isLearning = false;
        return bleAction.stoppedRobot();
    } else if(response.trim().toLowerCase() === 'full') {
        // finished learning or uploading
                // var res = {type: this.isLearning ? 'finishedLearning' : 'finishedUpload'};
                return bleAction.successUplaod();
    } else if(response.trim().toLowerCase() === '_end') {
        // done driving
        var res = {type: 'finishedDriving'};
        this.loops--;
        if (this.loops > 0) {
            BleService.sendCommandToActDevice('G');
        } else {
            return bleAction.stoppedRobot();
        }
    }else{
        if(this.downloading){
            if(this.linecount > 0){
            let multiArray = createMultiArray(convertStringToByteArray(response));
            let instructions = [];
            for(arr in multiArray){
                var left = arr[0];
                var right = arr[1];
                let instruction = new Instruction(Math.trunc(left / 2.55 + 0.5), Math.trunc(right / 2.55 + 0.5));
                instructions.push(instruction);
            }
            return bleAction.receivedChunck(instructions);
        }else{
            this.downloading = false;
            return bleAction.finishedDownloading();
        }
        }else{
            this.linecount = parseInt('0x' + toHexString(convertStringToByteArray(response)));
            console.log("linecount " + linecount);
            this.downloading = true;
            return bleAction.bleResponse('');
        }
    }
    return bleAction.bleResponse('');
}
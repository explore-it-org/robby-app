import * as settingsAction from '../settings/SettingsAction';
import BleService from './BleService';
import * as bleAction from './BleAction';
import {Instruction} from '../model/DatabaseModels';
import store from '../store/store';
import {resolve} from 'react-native-svg/src/lib/resolve';
let downloading = false;
let linecount = -1;
let previousLine = -1;
let lostLines = [];

export const mainHandler = (response) => {

    switch (store.getState().BLEConnection.device.version) {
        case 1:
            response = response.toString(
                'latin1',
            );
            return handleResponse1(response);
        case 2:
        case 3:
        case 4:
            response = response.toString(
                'latin1',
            );
            return handleResponse3(response);
        case 5:
        case 6:
            return handleResponse6(response);
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
        let buffer = response;
        buffer = [...buffer]; // converting to javascript array
        response = response.toString(
            'latin1',
        );
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
        return bleAction.bleResponse('');
    }else{
        if(linecount >= 0 && store.getState().BLEConnection.device.isDownloading){
            if(linecount > 0 && buffer.length > 1){
                let pointer = buffer.shift();
                // compare to previous line
                console.log('pointer: ', pointer, ' previous: ', previousLine);
                if(previousLine + 1 !== pointer){
                    lostLines.push(pointer - 1);
                }
                previousLine = pointer;
                let multiArray = createMultiArray(buffer);
                let instructions = [];
                multiArray.forEach((arr) => {
                    var left = arr[0];
                    var right = arr[1];
                    let instruction = new Instruction(Math.trunc(left / 2.55 + 0.5), Math.trunc(right / 2.55 + 0.5));
                    instructions.push(instruction);
                });
                linecount--;
                return bleAction.receivedChunck(instructions);
            }else{
                if(lostLines.length){
                    // request the lost lines...
                    console.log("lost lines: ", lostLines);
                }
                downloading = false;
                linecount = -1;
                return bleAction.finishedDownloading();
            }
        }else if(buffer.length == 2){
            linecount = Math.ceil((parseInt('0x' + toHexString(buffer))) / 18);
            console.log(linecount);
            console.log(parseInt('0x' + toHexString(buffer)));
            downloading = true;
            previousLine = -1;
            lostLines = [];
            return bleAction.bleResponse('');
        }
    }
    return bleAction.bleResponse('');
}
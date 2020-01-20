import * as bleAction from './BleAction';
import * as settingsAction from '../settings/SettingsAction';
import BleService from './BleService';
import { Instruction } from '../model/DatabaseModels';

export class ResponseManager {
    constructor(){
        if(! ResponseManager.instance){
            this._handlers = {
                1: new ResponseHandlerV1(),
                2: new ResponseHandlerV3(),
                3:new ResponseHandlerV3(),
                4:new ResponseHandlerV3(),
                5:new ResponseHandlerV6(),
                6: new ResponseHandlerV6()
            };
            ResponseManager.instance = this;
        }

        return ResponseManager.instance;
    }

    getHandler(version){
        return this._handlers[version];
    }
    
}
export class ResponseHandler{
    constructor(){
        this._downloading = false;
    }

    set downloading(downloading){
        this._downloading = downloading;
    }

    get downloading(){
        return this._downloading;
    }

    startDownloading(){
        this._downloading = true; 
    }

    finishedDownloading(){
        this._downloading = false;
        return bleAction.finishedDownloading();
    }

    errorDownloading(error){
        this._downloading = false;
        return bleAction.errorDownloading(error);
    }

    handleResponse(response){}

}

class ResponseHandlerV3 extends ResponseHandler{
    
    startDownloading(){
        super.startDownloading();
        return BleService.sendCommandToActDevice('B');
    }

    handleResponse(response){
        response = response.toString(
            'latin1',
        );
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
                    return bleAction.stoppedRobot();
                case ('full'):
                    // finished learning or uploading
                    return bleAction.successUplaod();
                case ('_end'):
                    // done driving
                    return bleAction.stoppedRobot();
                default:
                    return bleAction.bleResponse('');
            }
        }
        return bleAction.bleResponse('');
    }
}


class ResponseHandlerV1 extends ResponseHandler{
    handleResponse(response){
        response = response.toString(
            'latin1',
        );
        if (response.startsWith('VER')) {
            return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
        }
        return bleAction.bleResponse('');
    }
}

class ResponseHandlerV6 extends ResponseHandler{

    constructor(){
        super();
        this._previousLine = -1;
        this._lostLines = [];
        this._linecounter = -1;
    }

    toHexString(byteArray){
        return Array.from(byteArray, function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
      }

    startDownloading(){
        super.startDownloading();
        return BleService.sendCommandToActDevice('B');
    }
    
    handleResponse(response){
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
        return bleAction.stoppedRobot();
    } else if(response.trim().toLowerCase() === 'full') {
        return bleAction.successUplaod();
    } else if(response.trim().toLowerCase() === '_end') {
        return bleAction.stoppedRobot();
    }else{
        if(this._linecounter >= 0 && this._downloading){
            if(this._linecounter > 0 && buffer.length > 1){
                let pointer = buffer.shift();
                if(this._previousLine + 1 !== pointer){
                    this._lostLines.push(pointer - 1);
                }
                this._previousLine = pointer;
                let instructions = [];
                for(let i = 0; i < (buffer.length / 2); i++){
                    var left = buffer[i*2];
                    var right = buffer[i*2 + 1];
                    let instruction = new Instruction(Math.trunc(left / 2.55 + 0.5), Math.trunc(right / 2.55 + 0.5));
                    instructions.push(instruction);
                }
                this._linecounter--;
                return bleAction.receivedChunck(instructions);
            }else{
                if(this._lostLines.length){
                    // request the lost lines...
                    console.log("lost lines: ", lostLines);
                }
                this._linecounter = -1;
                return this.finishedDownloading();
            }
        }else if(buffer.length == 2){
            this._linecounter = Math.ceil((parseInt('0x' + this.toHexString(buffer)) + 1) / 18);
            this._previousLine = -1;
            this._lostLines = [];
            return bleAction.bleResponse('');
        }
    }
    return bleAction.bleResponse('');
    }
}
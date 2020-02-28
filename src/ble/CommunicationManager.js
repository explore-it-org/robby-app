import * as bleAction from './BleAction';
import * as settingsAction from '../settings/SettingsAction';
import BleService from './BleService';
import { Instruction } from '../model/DatabaseModels';
import i18n from '../../resources/locales/i18n';
import RobotProxy from './RobotProxy';
import { Alert } from 'react-native';

export class CommunicationManager {
    constructor() {
        if(! CommunicationManager.instance) {
            this._handlers = {
                1: new CommunicationHandlerV1(),
                2: new CommunicationHandlerV3(),
                3: new CommunicationHandlerV3(),
                4: new CommunicationHandlerV3(),
                9: new CommunicationHandlerV6()
            };
            CommunicationManager.instance = this;
        }

        return CommunicationManager.instance;
    }

    getHandler(version){
        return this._handlers[version] || new CommunicationHandlerV1();
    }

    getSupportedVersions(){
        return Object.keys(this._handlers).map((key) => {
            // TODO Kommentar wäre hilfreich warum parseint nötig ist. Variante wäre oben statt Ints 1,2,3 Strings "1", "2", "3".
            return parseInt(key);
        });
    }
    
}
export class CommunicationHandler{
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

    record(duration, interval){
        // TODO: kann hier nicht auch ein Promise.reject
        //       return Promise.reject(new Error('This should never happen'));
        //       zurückgegeben werden?
        // Variante: Eine Exception werfen.
    }

    handleResponse(response){}

    upload(instructions){}

}

// TODO rename to BootstrapHandler
class CommunicationHandlerV1 extends CommunicationHandler{
    handleResponse(response){
        response = response.toString(
            'latin1',
        );
        if (response.startsWith('VER')) {
            let version = parseInt(response.substring(4));
            
            let supportedVersions = new CommunicationManager().getSupportedVersions();
            if(!supportedVersions.includes(version)){
                if(version > Math.max(...supportedVersions)){
                    Alert.alert(i18n.t('Programming.unsupportedAppVersionTitle'), i18n.t('Programming.unsupportedAppVersionMessage')); 
                }else{
                    Alert.alert(i18n.t('Programming.unsupportedRobotVersionTitle'), i18n.t('Programming.unsupportedRobotVersionMessage')); 
                }
                RobotProxy.disconnect();
                return bleAction.bleResponse('');   
            }
            return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
        }
        return bleAction.bleResponse('');
    }

    record(duration, interval){
        // TODO kann das weggelassen werden? Dann sollte das record aus der Basisklasse aufgerufen werden.
        //what to do here?
    }

    upload(instructions){
        // and here?
    }
}

class CommunicationHandlerV3 extends CommunicationHandler{
    
    startDownloading(){
        super.startDownloading();
        return BleService.sendCommandToActDevice('B');
    }

    handleResponse(response){
        response = response.toString(
            'latin1',
        );
        if (response.startsWith('VER')) {
            return Promise.reject(new Error('This should never happen'));
        } else if (response.startsWith('I=')) {
            // Response to `I?`:  I=02
            return settingsAction.setInterval(parseInt(response.substring(2)));
        } else if (response.match('\\b[0-9]{3}\\b,\\b[0-9]{3}\\b')) {
            let read_instructions = response.trim().split(',');
            let instruction = new Instruction(Math.trunc(read_instructions[1] / 2.55 + 0.5), Math.trunc(read_instructions[0] / 2.55 + 0.5));
            return bleAction.receivedChunk([instruction]);
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
    }

    record(duration, interval){
        return BleService.sendCommandToActDevice('F')
            .then((c) => {
                var hex = Number(duration * 2 - 1).toString(16).toUpperCase();
                while (hex.length < 4) {
                    hex = '0' + hex;
                }
                return BleService.sendCommandToActDevice('d' + hex);
            })
            .then((c) => {
                return BleService.sendCommandToActDevice('L');
            });
    }

    upload(instructions){
        var promise = BleService.sendCommandToActDevice('F')
            .then((c) => {
                var hex = Number(instructions.length * 2 - 1).toString(16).toUpperCase();
                while (hex.length < 4) {
                    hex = '0' + hex;
                }
                return BleService.sendCommandToActDevice('d' + hex)
            })
            .then((d) =>{
                return BleService.sendCommandToActDevice('E');
            });

            for (let i = 0; i < instructions.length; i++) {
                let item = instructions[i];
                let speed = this.speed_padding(item.left) + ',' + this.speed_padding(item.right) + 'xx';
                promise = promise.then((c) => {
                    return BleService.sendCommandToActDevice(speed)
                });
            }

            return promise.then((c) => {
                return BleService.sendCommandToActDevice('end');
            });
    }

    speed_padding(speed) {
        if (speed !== 0) {
            speed = parseInt(speed * 2.55 + 0.5);
        }
        speed = String(speed);
        while (speed.length < 3) {
            speed = '0' + speed;
        }
        return speed;
    }
}

class CommunicationHandlerV6 extends CommunicationHandler{

    constructor(){
        super();
        this._expectedLine = 0;
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
        this._linecounter = -1;
        return BleService.sendCommandToActDevice('B');
    }
    
    handleResponse(response){
        let buffer = [...response];
        if(!this._downloading){
            response = response.toString(
                'latin1',
            );
            if (response.startsWith('VER')) {
                return Promise.reject(new Error('This should never happen'));
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
            }
        } else {
            if(this._linecounter === -1) {
                this._linecounter = Math.ceil((parseInt('0x' + this.toHexString(buffer)) + 1) / 18);
                this._expectedLine = 0;
                this._lostLines = [];
                return bleAction.bleResponse('');
            } else {
                // TODO rename pointer
                let pointer = buffer.shift();

                if(this._expectedLine !== pointer){
                    // TODO hier werden nicht alle verlorenen Linien aufgenommen.
                    //      es fehlen: expectedLine, expectedLine+1, ..., pointer-1
                    // TODO bei mehr als 256 Paketen (also etwa mehr als 2400 Zeilen) stimmen die Zeilennummern nicht mehr.
                    this._lostLines.push(pointer - 1);
                }
                // TODO check ob das Modulo richtig ist.
                this._expectedLine = (pointer+1) % 256;
                let instructions = [];
                for(let i = 0; i < (buffer.length / 2); i++){
                    var left = buffer[i*2];
                    var right = buffer[i*2 + 1];
                    let instruction = new Instruction(Math.trunc(left / 2.55 + 0.5), Math.trunc(right / 2.55 + 0.5));
                    instructions.push(instruction);
                }
                this._linecounter--;
                if(this._linecounter === 0){
                    if(this._lostLines.length){
                        // request the lost lines...
                        alert("lost lines: ", lostLines);
                    }

                    // TODO stopDownlaoding()
                    return bleAction.receivedChunk(instructions, true);
                }
                return bleAction.receivedChunk(instructions, false);
            }
        }
        return bleAction.bleResponse('');
    }

    record(duration, interval){
        return BleService.sendCommandToActDevice('F')
            .then((c) => {
                var hex = Number(interval * duration * 2 - 1).toString(16).toUpperCase();
                while (hex.length < 4) {
                    hex = '0' + hex;
                }
                return BleService.sendCommandToActDevice('d' + hex);
            })
            .then((c) => {
                return BleService.sendCommandToActDevice('L');
            });
    }

    upload(instructions){
        return BleService.sendCommandToActDevice('F')
            .then((c) => {
                var hex = Number(instructions.length * 2 - 1).toString(16).toUpperCase();
                while (hex.length < 4) {
                    hex = '0' + hex;
                }
                return BleService.sendCommandToActDevice('d' + hex);
            })
            .then((c) => {
                return BleService.sendCommandToActDevice('E');
            })
            .then((c) => {
                let bytes = new Uint8Array(instructions.length * 2);
                for (let i = 0; i < instructions.length; i++) {
                    let item = instructions[i];
                    let left = item.left !== 0 ? parseInt(item.left * 2.55 + 0.5) : 0;
                    let right = item.right !== 0 ? parseInt(item.right * 2.55 + 0.5) : 0;
                    bytes[2 * i] = left;
                    bytes[2 * i + 1] = right;
                }
                return BleService.sendCommandToActDevice(bytes);
            })
            .then((c) => {
                return BleService.sendCommandToActDevice('end');
            });
    }
}
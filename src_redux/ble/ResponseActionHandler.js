import * as settingsAction from '../settings/SettingsAction';
import BleService from './BleService';
import * as bleAction from './BleAction';

export const handleResponse = (response) => {

    /**
     * All response must be given to the reducer
     */
    console.log('New Response in');
    console.log(response);
    if (response.startsWith('VER')) {
        return bleAction.updateDeviceVersion(parseInt(response.substring(4)));
    } else if (response.startsWith('I=')) {
        // Response to I?:  I=02
        return settingsAction.setInterval(parseInt(response.substring(2)));
    } else if (response.match('\\b[0-9]{3}\\b,\\b[0-9]{3}\\b')) {
        let read_instructions = response.trim().split(',');
        let speed_l = Math.trunc(read_instructions[0] / 2.55 + 0.5);
        let speed_r = Math.trunc(read_instructions[1] / 2.55 + 0.5);
        var res = {type: 'speedLine', left: speed_l, right: speed_r};
        // TODO implemented reducer
        return bleAction.bleResponse('');
    } else {
        response = response.trim().toLowerCase();
        switch (response) {
            case (',,,,'):
                // finished download (beam)
                return bleAction.succcessDownloading();
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
                    BleService.sendCommandToActDevice2('G');
                } else {
                    return bleAction.stoppedRobot();
                }
                break;
            default:
                return bleAction.bleResponse('');
        }
    }
    bleAction.bleResponse('');
};

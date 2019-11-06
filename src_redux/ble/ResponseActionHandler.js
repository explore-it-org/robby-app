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
        let speed_l = read_instructions[0] / 2.55 + 0.5;
        let speed_r = read_instructions[1] / 2.55 + 0.5;
        if (speed_l < 0) {
            speed_l = 0;
        }
        if (speed_r < 0) {
            speed_r = 0;
        }
        var res = {type: 'speedLine', left: Math.trunc(speed_l), right: Math.trunc(speed_r)};

        // TODO implemented reducer
        return bleAction.bleResponse('');
    } else {
        response = response.trim().toLowerCase();
        switch (response) {
            case (',,,,'):
                // finished download (beam)
                return bleAction.bleResponse('finishedDownload');
            case ('_sr_'):
                // stop
                this.isLearning = false;
                return bleAction.bleResponse('stop');
            case ('full'):
                // finished learning or uploading
                // var res = {type: this.isLearning ? 'finishedLearning' : 'finishedUpload'};
                return bleAction.bleResponse('finishedUpload');

            case ('_end'):
                // done driving
                var res = {type: 'finishedDriving'};
                this.loops--;
                if (this.loops > 0) {
                    BleService.sendCommandToActDevice2('G');
                } else {
                    return bleAction.bleResponse('finishedDriving');
                }
                break;
            default:
                break;
        }
    }
};

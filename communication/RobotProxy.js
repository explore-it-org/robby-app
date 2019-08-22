import BleService from './BleService'
import { throwStatement } from '@babel/types';

class RobotProxy {
    constructor() {
        isConnected = false;
        isLearning = false;
        loops = 0;
    }

    setRobot(robotDevice) {
        if (! this.isConnected) {
            BleService.setActDevice(robotDevice);
        }
    }

    scanningForRobots(errorHandler, deviceHandler) {
        if (! this.isConnected) {
            BleService.scanningForRobots(errorHandler, deviceHandler)
        }
    }

    stopScanning() {
        if (! this.isConnected) {
            BleService.stopScanning()
        }
    }

    connect(responseHandler, connectionHandler, errorHandler) {
        BleService.connectToActDevice(
            (response) => {
                this.handleResponse(responseHandler, response);
            },
            (robot) => {
                this.isConnected = true;
                connectionHandler(robot);
            },
            errorHandler
        );
    }

    disconnect() {
        if (this.isConnected) {
            BleService.shutdown();
            this.isConnected = false;
        } else {
            console.log("Warning: robot already disconnected!")
        }
    }

    run() {
        if (this.isConnected) {
            BleService.sendCommandToActDevice('R');
        }
    }

    // Starts robot
    go(loops) {
        if (this.isConnected) {
            this.loops = loops;
            BleService.sendCommandToActDevice('G');
        }
    }

    // Stops robot
    stop() {
        if (this.isConnected) {
            this.isLearning = false;
            this.loops = 0;
            BleService.sendCommandToActDevice('S');
        }
    }

    record(loops) {
        if (this.isConnected) {
            this.isLearning = true;
            BleService.sendCommandToActDevice('F');
            BleService.sendCommandToActDevice('D' + loops);
            BleService.sendCommandToActDevice('L');
        }
    }

    speed_padding(speed) {
        if (speed !== 0)
            speed = parseInt(speed * 2.55 + 0.5);
        speed = String(speed);
        while (speed.length < 3) { speed = "0" + speed; }
        return speed
    }

    // Uploads speed entries from the app to the robot
    upload(speeds) {
        if (this.isConnected) {
            BleService.sendCommandToActDevice('F');
            BleService.sendCommandToActDevice('D' + speeds.length);
            BleService.sendCommandToActDevice('I1');
            BleService.sendCommandToActDevice('E');
            for (let i = 0; i < speeds.length; i++) {
                let item = speeds[i];
                let speed = this.speed_padding(item.left) + ',' + this.speed_padding(item.right) + 'xx';
                BleService.sendCommandToActDevice(speed);
            }
            BleService.sendCommandToActDevice(',,,,');
        }
    }

    // Downloads speed entries from the robot to the app
    download() {
        if (this.isConnected) {
            this.isLearning = false;
            BleService.sendCommandToActDevice('B');
        }
    }

    // handles responses from the robot
    handleResponse(responseHandler, response) {
        console.log("Response: " + response)
        if (response.match("\\b[0-9]{3}\\b,\\b[0-9]{3}\\b")) {
            let read_speeds = response.trim().split(',');
            let speed_l = read_speeds[0] / 2.55 + 0.5;
            let speed_r = read_speeds[1] / 2.55 + 0.5;
            if (speed_l < 0)
                speed_l = 0;
            if (speed_r < 0)
                speed_r = 0;
            var res = {type: 'speedLine', left: Math.trunc(speed_l), right: Math.trunc(speed_r)}
            responseHandler(res)
        } else {
            response = response.trim().toLowerCase() 
            switch (response) {     
                case (',,,,'):
                    // finished download (beam)
                    responseHandler({type: 'finishedDownload'});
                    break;
                case ('_sr_'):
                    // stop
                    this.isLearning = false;
                    responseHandler({type: 'stop'});
                    break;
                case ('full'):
                    // finished learning or uploading
                    var res = {type: this.isLearning ? 'finishedLearning' : 'finishedUpload' };
                    responseHandler(res);
                    break;
                case ('_end'): 
                    // done driving
                    var res = {type: 'finishedDriving'};
                    this.loops--;
                    if(this.loops > 0) {
                        BleService.sendCommandToActDevice('G');
                    } else {
                        responseHandler(res);
                    }
                    break;
                default:
                    break;
            }   
        }    
    }   
}

// Singleton pattern in ES6
export default new RobotProxy();
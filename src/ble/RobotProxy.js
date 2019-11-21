import BleService from './BleService';
import * as bleActions from './BleAction';
import store from '../store/store';

// import { throwStatement } from '@babel/types';

class RobotProxy {
    isLearning: boolean;
    loops: number;

    constructor() {
        isConnected = false;
        this.isLearning = false;

        this.loops = 0;
        version = 0;
    }

    setRobot(robotDevice) {
        if (!this.isConnected) {
            BleService.setActDevice(robotDevice);
        }
    }

    testScan(errorHandler, successHandler) {
        if (!this.isConnected) {
            BleService.checkDeviceScanStatus(errorHandler, successHandler);
        }
    }

    scanningForRobots(errorHandler, deviceHandler) {
        if (!this.isConnected) {
            BleService.scanningForRobots(errorHandler, deviceHandler);
        }
    }

    scanningForRobotsRedux() {
        //let dispatch = store.dispatch;
        console.log('we have began scanning for devices');
        return function (dispatch) {
            console.log('pelae');
            dispatch(bleActions.startScanning());
            return BleService.scanningForRobots(
                (error) => {
                    dispatch(bleActions.failedScanning(error));
                },
                (error) => {
                    dispatch(bleActions.failedScanning(error));
                },
            );

        };
    }

    stopScanning() {
        if (!this.isConnected) {
            BleService.stopScanning();
        }
    }

    connect() {
        return function (dispatch) {
            dispatch(bleActions.connectToBle());
            return BleService.connectToActDevice(
                (response) => {
                    handleResposneRedux(response);
                },
                (robot) => {
                    dispatch(bleActions.connectedToBle());
                    BleService.sendCommandToActDevice('Z');
                    BleService.sendCommandToActDevice('I?');
                },
                (error) => dispatch(bleActions.connectionFailed(error)),
            );
        };
    }

    connect2(responseHandler, connectionHandler, errorHandler) {
        BleService.connectToActDevice(
            (response) => {
                responseHandler(response);
                //this.handleResponse(responseHandler, response);
            },
            (robot) => {
                this.isConnected = true;
                this.version = 1; // default version if no version number is published
                BleService.sendCommandToActDevice('Z') // Version request
                    .then((c) => {
                        connectionHandler(robot); // enables buttons in the GUI
                    })
                    .then(() => {
                        // connection established, query for I now
                        return BleService.sendCommandToActDevice('I?');
                    });
            },
            errorHandler,
        );
    }

    disconnect() {
        if (this.isConnected) {
            BleService.shutdown();
            this.isConnected = false;
            this.version = 0;
        } else {
            console.log('Warning: robot already disconnected!');
        }
    }

    run() {
        if (this.isConnected) {
            return BleService.sendCommandToActDevice('R');
        }
    }

    // Starts robot
    go(loops) {
        if (this.isConnected) {
            this.loops = loops;
            return BleService.sendCommandToActDevice('G');

        }
    }

    // Stops robot
    stop() {
        if (this.isConnected) {
            this.isLearning = false;
            this.loops = 0;
            return BleService.sendCommandToActDevice('S');

        }
    }

    record(duration, interval, version) {
        if (this.isConnected) {
            this.isLearning = true;
            switch (version) {
                case 1:
                    return BleService.sendCommandToActDevice('F')
                        .then((c) => {
                            return BleService.sendCommandToActDevice('D' + duration);
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice('L');
                        });

                case 2:
                case 3:
                case 4:
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

                default:
                    // TODO return promise
                    console.log('record: version not supported: ' + this.version);
            }
        }
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


    // Uploads speed entries from the app to the robot
    upload(instructions, version) {
        if (this.isConnected) {
            switch (version) {
                case 1:
                    var promise = BleService.sendCommandToActDevice('F')
                        .then((c) => {
                            return BleService.sendCommandToActDevice('D' + instructions.length);
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice('I1');
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice('E');
                        });

                    for (let i = 0; i < instructions.length; i++) {
                        let item = instructions[i];
                        let speed = this.speed_padding(item.left) + ',' + this.speed_padding(item.right) + 'xx';
                        promise = promise.then((c) => {
                            return BleService.sendCommandToActDevice(speed);
                        });
                    }
                    return promise.then((c) => {
                        return BleService.sendCommandToActDevice('end');
                    });

                case 2:
                case 3:
                case 4:
                    var promise = BleService.sendCommandToActDevice('F')
                        .then((c) => {
                            var hex = Number(instructions.length * 2 - 1).toString(16).toUpperCase();
                            while (hex.length < 4) {
                                hex = '0' + hex;
                            }
                            return BleService.sendCommandToActDevice('d' + hex);
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice('E');
                        });

                    for (let i = 0; i < instructions.length; i++) {
                        let item = instructions[i];
                        let speed = this.speed_padding(item.left) + ',' + this.speed_padding(item.right) + 'xx';
                        promise = promise.then((c) => {
                            return BleService.sendCommandToActDevice(speed);
                        });
                    }
                    return promise.then((c) => {
                        return BleService.sendCommandToActDevice('end');
                    });
                default:
                    // TODO return promise
                    console.log('upload: version not supported: ' + this.version);
            }
        }
    }

    // Downloads speed entries from the robot to the app
    download() {
        if (this.isConnected) {
            this.isLearning = false;
            return BleService.sendCommandToActDevice('B');

        }
    }

    setInterval(interval) {
        if (this.isConnected) {
            // Argument check is done by the robot, i.e. arguments must meet (0 <= interval <= 50)
            return BleService.sendCommandToActDevice('I' + interval)
                .then((c) => {
                    BleService.sendCommandToActDevice('I?');
                });
        }
    }


    // handles responses from the robot
    handleResponse(responseHandler, response) {
        console.log('Response: ' + response + ' (len ' + response.length + ')');
        if (response.startsWith('VER')) {
            console.log('Protocol Version: ' + response);
            this.version = parseInt(response.substring(4));
        } else if (response.startsWith('I=')) {
            // Response to I?:  I=02
            console.log('Interval: ' + response);
            let value = parseInt(response.substring(2));

            responseHandler({type: 'interval', value: value});
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
            responseHandler(res);
        } else {
            response = response.trim().toLowerCase();
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
                    var res = {type: this.isLearning ? 'finishedLearning' : 'finishedUpload'};
                    responseHandler(res);
                    break;
                case ('_end'):
                    // done driving
                    var res = {type: 'finishedDriving'};
                    this.loops--;
                    if (this.loops > 0) {
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

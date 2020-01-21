import BleService from './BleService';
import * as bleActions from './BleAction';
import store from '../store/store';

// import { throwStatement } from '@babel/types';

class RobotProxy {
    isLearning: boolean;

    constructor() {
        this.isLearning = false;

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
        return function (dispatch) {
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

    connect2(responseHandler, connectionHandler, errorHandler, disconnectHandler) {
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
            (error) => {
                disconnectHandler(error);
            }
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
    go() {
        if (this.isConnected) {
            return BleService.sendCommandToActDevice('G');
        }
    }

    // Stops robot
    stop() {
        if (this.isConnected) {
            this.isLearning = false;
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
                case 6:

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
                    case 6:
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
                        })
                        .then((c) =>{
                            let bytes = new Uint8Array(instructions.length * 2);
                        for (let i = 0; i < instructions.length; i++) {
                            let item = instructions[i];
                            let left = item.left !== 0 ? parseInt(item.left * 2.55 + 0.5) : 0;
                            let right = item.right !== 0 ? parseInt(item.right * 2.55 + 0.5) : 0;
                            bytes[2 * i] = left;
                            bytes[2 * i + 1] = right;
                        }
                            return BleService.sendCommandToActDevice(bytes);
                        });
                        return promise.then((c) => {
                            return BleService.sendCommandToActDevice('end');
                        });
                    default:
                        return new Promise(function(resolve, reject) {
                            console.log('upload: version not supported: ' + this.version);
                        });
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
}


// Singleton pattern in ES6
export default new RobotProxy();

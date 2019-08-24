import BleService from './BleService'
import { throwStatement } from '@babel/types';

class RobotProxy {
    constructor() {
        isConnected = false;
        isLearning = false;
        loops = 0;
        version = 0;
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
                this.version = 1; // default version if no version number is published
                BleService.sendCommandToActDevice2('Z') // Version request
                    .then((c) => {
                        connectionHandler(robot); // enables buttons in the GUI
                    })
                    .then(() => {
                        // connection established, query for I now
                        return BleService.sendCommandToActDevice2("I?")
                    })
                    .catch((e) => {
                        console.log("Device not set")
                        console.log(e)
                    });
            },
            errorHandler
        );
    }

    disconnect() {
        if (this.isConnected) {
            BleService.shutdown();
            this.isConnected = false;
            this.version = 0;
        } else {
            console.log("Warning: robot already disconnected!")
        }
    }

    run() {
        if (this.isConnected) {
            BleService.sendCommandToActDevice2('R')
                .catch((e) => {
                    console.log("Device not set")
                    console.log(e)
                });
        }
    }

    // Starts robot
    go(loops) {
        if (this.isConnected) {
            this.loops = loops;
            BleService.sendCommandToActDevice2('G')
                .catch((e) => {
                    console.log("Device not set")
                    console.log(e)
                });
        }
    }

    // Stops robot
    stop() {
        if (this.isConnected) {
            this.isLearning = false;
            this.loops = 0;
            BleService.sendCommandToActDevice2('S')
                .catch((e) => {
                    console.log("Device not set")
                    console.log(e)
                });
        }
    }

    record(duration, interval) {
        if (this.isConnected) {
            this.isLearning = true;
            switch(this.version) {
                case 1:
                    BleService.sendCommandToActDevice('F');
                    BleService.sendCommandToActDevice('D' + duration);
                    BleService.sendCommandToActDevice('L');
                    break;
                case 2:
                case 3:
                    BleService.sendCommandToActDevice2('F')
                        .then((c) => {
                            var hex = Number(interval * duration * 2 - 1).toString(16).toUpperCase();
                            while (hex.length < 4) {
                                hex = "0" + hex;
                            }
                            return BleService.sendCommandToActDevice2('d' + hex);
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice2('L');
                        })
                        .catch((e) => {
                            console.log("Device not set")
                            console.log(e)
                        });

                    break;
                default:
                    console.log("record: version not supported: " + this.version)
            }
        }
    }

    speed_padding(speed) {
        if (speed !== 0) speed = parseInt(speed * 2.55 + 0.5);
        speed = String(speed);
        while (speed.length < 3) { speed = "0" + speed; }
        return speed
    }


    // Uploads speed entries from the app to the robot
    upload(speeds) {
        if (this.isConnected) {
            switch(this.version) {
                case 1:
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
                    break;

                case 2:
                case 3:
                    var promise = BleService.sendCommandToActDevice2('F')
                        .then((c) => {
                            var hex = Number(speeds.length * 2 - 1).toString(16).toUpperCase();
                            while (hex.length < 4) {
                                hex = "0" + hex;
                            }
                            return BleService.sendCommandToActDevice2('d' + hex)
                        })
                        .then((c) => {
                            return BleService.sendCommandToActDevice2('E');
                        });

                    for (let i = 0; i < speeds.length; i++) {
                        let item = speeds[i];
                        let speed = this.speed_padding(item.left) + ',' + this.speed_padding(item.right) + 'xx';
                        promise = promise.then((c) => {
                            return BleService.sendCommandToActDevice2(speed);
                        })
                    }
                    promise.then((c) => {
                        return BleService.sendCommandToActDevice2('end');
                    }).catch((e) => {
                        console.log("Device not set")
                        console.log(e)
                    })
                    break;
                default:
                    console.log("upload: version not supported: " + this.version)
            }
        }
    }

    // Downloads speed entries from the robot to the app
    download() {
        if (this.isConnected) {
            this.isLearning = false;
            BleService.sendCommandToActDevice2('B')
                .catch((e) => {
                    console.log("Device not set")
                    console.log(e)
                });
        }
    }

    setInterval(interval) {
        if (this.isConnected) {
            // Argument check is done by the robot, i.e. arguments must meet (0 <= interval <= 50)
            BleService.sendCommandToActDevice2("I"+interval)
                .then((c) => {
                    BleService.sendCommandToActDevice2("I?")
                })
                .catch((e) => {
                    console.log("Device not set")
                    console.log(e)
                });
        }
    }

    // handles responses from the robot
    handleResponse(responseHandler, response) {
        console.log("Response: " + response + " (len " + response.length + ")")
        if (response.startsWith("VER")) {
            console.log("Protocol Version: " + response);
            this.version = parseInt(response.substring(4));
        } else if(response.startsWith("I=")) {
            // Response to I?:  I=02
            console.log("Interval: " + response);
            let value = parseInt(response.substring(2));
            responseHandler({type: 'interval', value: value})
        } else if (response.match("\\b[0-9]{3}\\b,\\b[0-9]{3}\\b")) {
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
                        BleService.sendCommandToActDevice2('G')
                            .catch((e) => {
                                console.log("Device not set")
                                console.log(e)
                            });
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
import BleService from './BleService';
import * as bleActions from './BleAction';
import store from '../store/store';
import { CommunicationManager } from './CommunicationManager';

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
            return new CommunicationManager().getHandler(version).record(duration, interval);
        }else{
            alert("APPARENTLY NOT CONNECTED");
        }
    }


    // Uploads speed entries from the app to the robot
    upload(instructions, version) {
        return new CommunicationManager().getHandler(version).upload(instructions);
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

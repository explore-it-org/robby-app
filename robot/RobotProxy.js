import BleService from '../communication/BleService'

class RobotProxy {
    constructor() {
        isConnected = false;
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

    connect(responseHandler, connectionHandler, errorHandler) {
        BleService.connectToActDevice(
            responseHandler,
            (robot) => {
                this.isConnected = true;
                connectionHandler(robot);
            },
            errorHandler);
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
    go() {
        if (this.isConnected) {
            BleService.sendCommandToActDevice('G');
        }
    }

    // Stops robot
    stop() {
        if (this.isConnected) {
            BleService.sendCommandToActDevice('S');
        }
    }

    record(loops) {
        if (this.isConnected) {
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
            BleService.sendCommandToActDevice('B');
        }
    }
}

// Singleton pattern in ES6
export default new RobotProxy();
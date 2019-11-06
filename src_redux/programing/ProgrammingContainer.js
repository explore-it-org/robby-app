import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    scanningForDevices,
    connectToDevice,
    stopScanning,
    disconnect,
    setDevice,
    stopRobot,
    runRobot, startRecording, goRobot, uploadToRobot, downloadToDevice,
} from '../ble/BleAction';
import {} from '../database/DatabaseAction';

import ProgrammingComponent from './ProgrammingComponent';
import RobotProxy from '../ble/RobotProxy';
import {setDuration, setInterval, setLoops} from '../settings/SettingsAction';

const mapStateToProps = state => ({
    Settings: state.Settings,
    BLEConnection: state.BLEConnection,
    Program: state.Program,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            scanForRobot: scanningForDevices,
            connectToRobot: connectToDevice,
            stopScanning: stopScanning,
            disconnect: disconnect,
            setActiveDevice: setDevice,
            stopRobot: stopRobot,
            runRobot: runRobot,
            startRecording: startRecording,
            goRobot: goRobot,
            upload: uploadToRobot,
            download: downloadToDevice,
        }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(ProgrammingComponent);

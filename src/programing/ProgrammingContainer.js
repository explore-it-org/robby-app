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
import {clearBlock} from '../programmingtabs/blockprogramming/ActiveBlockAction';
import {clearProgram} from '../programmingtabs/stepprogramming/ActiveInstructionAction';
import {saveProgram} from '../database/DatabaseAction';

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
            clearBlock: clearBlock,
            clearProgram: clearProgram,
            saveProgram: saveProgram
        }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(ProgrammingComponent);

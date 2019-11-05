import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setDuration, setInterval, setLoops} from './SettingsAction';
import BleAction from '../ble/BleAction';
import SettingsComponent from './SettingsComponent';

const mapStateToProps = state => ({
    Settings: state.Settings,
    BLEConnection: state.BLEConnection,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            setDuration,
            setInterval,
            setLoops,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SettingsComponent);

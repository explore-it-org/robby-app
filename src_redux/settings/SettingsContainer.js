import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SettingsAction from './SettingsAction';
import BleAction from '../ble/BleAction';
import SettingsComponent from './SettingsComponent';

const mapStateToProps = state => ({
    Settings: state.Settings,
    BLEConnection: state.BLEConnection,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(Object.assign({}, SettingsAction, BleAction), dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps())(SettingsComponent);

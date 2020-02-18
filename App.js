import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import {DrawerNavigatorItems, createDrawerNavigator} from 'react-navigation-drawer';
import ProgrammingContainer from './src/programing/ProgrammingContainer';
import Settings from './src/settings/SettingsContainer';
import {View, Text, StyleSheet, Alert, Platform, NativeModules} from 'react-native';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import {grantLocation, setBLEState, setLanguage} from './src/settings/SettingsAction';
import i18n from './resources/locales/i18n';
import BleService from './src/ble/BleService';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {scanningEnabled} from './src/ble/BleAction';

class App extends Component {


    componentDidMount() {
        BleService.requestLocationPermission().then(a => {
            this.props.grantLocation(a);
        });
        BleService.checkBluetoothState(a => this.props.setBLEState(a));
        /*BleService.checkDeviceScanStatus(a => {
            BleService.stopScanning();
            this.props.scanningEnabled(a);
        }, b => {
            BleService.stopScanning();
            this.props.scanningEnabled('');
        });*/
        if (this.props.Settings.language) {
            i18n.locale = this.props.Settings.language;
        } else {
            if (Platform.OS === 'ios') {
                // iOS:
                let locale;
                try {
                    locale = NativeModules.SettingsManager.settings.AppleLocale.split('_')[0];
                } catch (e) {
                    locale = 'en';
                }
                i18n.defaultLocale = locale;
            } else {
                // Android:
                i18n.defaultLocale = NativeModules.I18nManager.localeIdentifier.split('_')[0];
            }
            i18n.locale = i18n.defaultLocale;
            this.props.setLanguage(i18n.locale);
        }
    }

    render() {
        return <ProgrammingContainer/>;
    }
}

const mapStateToProps = state => ({
    Settings: state.Settings,
    BLEConnection: state.BLEConnection,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            grantLocation,
            setBLEState,
            scanningEnabled,
            setLanguage
        }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    deviceName: {
        flex: 1,
        backgroundColor: '#2E5266',
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerItems: {
        flex: 3,
        flexDirection: 'column',
    },
    footer: {
        backgroundColor: '#2E5266',
        height: 50,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2E5266',
        flexDirection: 'row',
    },
});

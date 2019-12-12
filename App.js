import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import {DrawerNavigatorItems, createDrawerNavigator} from 'react-navigation-drawer';
import ProgrammingContainer from './src/programing/ProgrammingContainer';
import Settings from './src/settings/SettingsContainer';
import {View, Text, StyleSheet, Alert, Platform, NativeModules} from 'react-native';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import {grantLocation, setBLEState} from './src/settings/SettingsAction';
import i18n from './resources/locales/i18n';
import BleService from './src/ble/BleService';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

class App extends Component {


    componentDidMount() {
        BleService.requestLocationPermission().then(a => {
            this.props.grantLocation(a);
        });
        BleService.checkBluetoothState(a => this.props.setBLEState(a));
        if(this.props.Settings.language) {
            i18n.locale = this.props.Settings.language;
        } else {
            if(Platform.OS === "ios"){
                // iOS:
                i18n.defaultLocale = NativeModules.SettingsManager.settings.AppleLocale.split('_')[0];
            }else{
                // Android:
                i18n.defaultLocale = NativeModules.I18nManager.localeIdentifier.split('_')[0];
            }
            i18n.locale =  i18n.defaultLocale;
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
        }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    deviceName: {
        flex: 1,
        backgroundColor: '#9c27b0',
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        ...ifIphoneX(
            {
                paddingTop: getStatusBarHeight() + 10,
            },
            {},
        ),
    },
    drawerItems: {
        flex: 3,
        flexDirection: 'column',
    },
    footer: {
        backgroundColor: '#9c27b0',
        height: 50,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#9c27b0',
        flexDirection: 'row',
    },
});

import React, {Component} from 'react';
import { createDrawerNavigator, createAppContainer, DrawerItems} from "react-navigation";
import Programming from "./components/screens/programming/Programming";
import Settings from "./components/screens/settings/Settings";
import BleService from "./communication/BleService";
import {addDeviceNameChangeListener, getDeviceName} from "./stores/SettingsStore";
import { View, Text, StyleSheet } from "react-native";
import {getStatusBarHeight, ifIphoneX} from "react-native-iphone-x-helper";
import { version } from './package.json';
import i18n from './locales/i18n'

export default class App extends Component {
    state = {device: undefined};

    componentWillMount() {
        BleService.requestLocationPermission();
    }
    render() {return (<DrawerContainer />);}
}

class DrawerContent extends Component {
    state = {
        device_name: getDeviceName(),
    };
    constructor() {
        super();

        addDeviceNameChangeListener(name => {
            this.setState({ device_name: name });
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.deviceName}>
                    <Text
                        style={{ color: 'white', fontSize: 30 }}>
                            {this.state.device_name}
                    </Text>
                </View>
                <View style ={styles.drawerItems}>
                    <DrawerItems {...this.props} />
                </View>
                <View style={styles.footer}>
                    <Text
                        style={{
                            flex: 1,
                            marginLeft: 15,
                            color: 'white',
                            fontWeight: 'bold',
                        }}
                    >
                        robby app
                    </Text>
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            marginRight: 15,
                            color: 'white',
                            fontWeight: 'bold',
                        }}
                    >
                        v{version}
                    </Text>
                </View>
            </View>
        );
    }
}


const DrawerNavigator = createDrawerNavigator(
    {
        [i18n.t('App.programming')] : {screen: Programming},
        [i18n.t('App.settings')] : {screen: Settings}
    },
{
    contentComponent: DrawerContent,
});

const DrawerContainer = createAppContainer(DrawerNavigator);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    deviceName: {
        flex: 1,
        backgroundColor: '#9c27b0',
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        ...ifIphoneX({
                paddingTop: getStatusBarHeight() + 10,
            }, {}
        )
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
})

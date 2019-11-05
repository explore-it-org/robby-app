import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import {DrawerNavigatorItems, createDrawerNavigator} from 'react-navigation-drawer';
// import Programming from './src/components/screens/programming/Programming';
import Settings from './src_redux/settings/SettingsContainer';
import BleService from './src_redux/ble/BleService';


import {View, Text, StyleSheet} from 'react-native';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
// import {version} from './package.json';
import i18n from './resources/locales/i18n';
import GLOBAL from './src/utility/Global';
import {DatabaseTest} from './src/utility/DatabaseTest';

import {connect} from 'react-redux';

import * as ut from './src/utility/AppSettings';

class App extends Component {


    componentDidMount() {
        let isGranted = BleService.requestLocationPermission();
        // dispatch isGranted to settings dispatcher this.props.dispatch()
        //let databasetest = new DatabaseTest();

        // databasetest.clearDatabase();
        // databasetest.recurive();
        //databasetest.findOneByPK();
        //databasetest.updatingEntries();
        //databasetest.createDatabaseEntries();
        // databasetest.creatingDatabaseEntriesWithDependencies();
        ////
    }

    render() {
        return <DrawerContainer/>;
    }
}

export default connect()(App);

class DrawerContent extends Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.deviceName}>
                    <Text style={{color: 'white', fontSize: 30}}>
                        {this.props.BLEConnection.device.name}
                    </Text>
                </View>
                <View style={styles.drawerItems}>
                    <DrawerNavigatorItems {...this.props} />
                </View>
                <View style={styles.footer}>
                    <Text
                        style={{
                            flex: 1,
                            marginLeft: 15,
                            color: 'white',
                            fontWeight: 'bold',
                        }}>
                        {GLOBAL.APP_NAME}
                    </Text>
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            marginRight: 15,
                            color: 'white',
                            fontWeight: 'bold',
                        }}>
                        v{GLOBAL.VERSION}
                    </Text>
                </View>
            </View>
        );
    }
}


const mapStateToProps = state => ({
    Settings: state.Settings,
    BLEConnection: state.BLEConnection,
});
const ReduxNavigator = connect(mapStateToProps)(DrawerContent);


const DrawerNavigator = createDrawerNavigator(
    {
        // [i18n.t('App.programming')]: {screen: Programming},
        [i18n.t('App.settings')]: {screen: Settings},
    },
    {
        contentComponent: ReduxNavigator,
    },
);


const DrawerContainer = createAppContainer(DrawerNavigator);

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

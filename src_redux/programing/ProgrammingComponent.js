import React, {Component} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Appbar} from 'react-native-paper';
import RobotProxy from '../ble/RobotProxy';
import {createAppContainer} from 'react-navigation';
//import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {MainTab, MixedViewTab, SecondTab} from './tabs/index';
// import RobotProxy from '../../../communication/RobotProxy';
// import {instructions, add, removeAll, addSpeedChangeListener, clearInstructions, storeInstructions} from '../../../stores/InstructionsStore';
//import {blocks, addBlocksChangeListener} from '../../../stores/BlocksStore'
/*import {
    addDeviceNameChangeListener,
    getDeviceName,
    setDeviceName,
    setConnected,
    getLoopCounter,
    getDuration,
    getInterval,
    setInterval,
} from '../../../stores/SettingsStore';*/
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import i18n from '../../resources/locales/i18n';
import {connectToDevice} from '../ble/BleAction';
// import {storeBlocks, clearBlocksProgram} from '../../../stores/BlocksStore';


export default class ProgrammingComponent extends Component {
    state = {
        visible: false,
        device: '',
        stop_btn_disabled: true,

        currentRoute: 'First',
        save_and_new_btn_disabled: false,
        remaining_btns_disabled: false,
        ble_connection: {
            allowed: false,
            errormessage: '',
        },
    };


    componentDidMount(): void {
        /*
        RobotProxy.testScan(err => {
                this.setState({
                    ble_connection: {
                        allowed: false,
                        errormessage: err.message,
                    },
                });
                this.openBLEErrorAlert();
                console.log('error state is set to ' + this.state.ble_connection.allowed);
            },
            dh => {
                this.setState({
                    ble_connection: {
                        allowed: true,
                        errormessage: '',
                    },
                });
                RobotProxy.stopScanning();
                console.log('state is set to ' + this.state.ble_connection.allowed);
            });*/
    }

    /*
        openBLEErrorAlert() {
            Alert.alert('BLE Error', this.state.ble_connection.errormessage);
        }*/

    // gets the current screen from navigation state
    getActiveRouteName(navigationState) {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this.getActiveRouteName(route);
        }
        return route.routeName;
    }


    /*
        // handles messages from the communcation system
        handleCommunicationMessages(name) {
            setDeviceName({device: name.substr(name.length - 5)});
            setConnected(true);
            this.setState({
                visible: false,
                device: name,
                remaining_btns_disabled: false,
                stop_btn_disabled: true,
            });
        }*/


    render() {
        return (
            <View style={[styles.container]}>
                <SinglePickerMaterialDialog
                    title={i18n.t('Programming.chooseDevice')}
                    items={this.props.BLEConnection.scannedDevices.map((row, index) => ({
                        key: index.toString(),
                        label: row,
                        selected: false,
                    }))}
                    visible={this.props.BLEConnection.isScanning}
                    onCancel={() => {
                        this.props.stopScanning();
                    }}
                    onOk={
                        result => {
                            this.props.stopScanning();
                            if (result.selectedLabel) {
                                this.props.setActiveDevice(result.selectedLabel);
                                this.props.connectToRobot();
                            }
                        }
                    }
                    colorAccent="#9c27b0"
                />
                <Appbar>
                    <Appbar.Action icon="menu" size={32} onPress={() => this.props.navigation.openDrawer()}/>
                    <Appbar.Content style={{position: 'absolute', left: 40}} title="Explore-it" size={32}/>
                    <Appbar.Content style={{position: 'absolute', right: 40}}
                                    title={this.props.BLEConnection.device.name}
                                    subtitle={i18n.t('Programming.device')}
                                    size={32}/>
                    <Appbar.Action icon={(this.props.BLEConnection.isConnected) ? 'bluetooth-connected' : 'bluetooth'}
                                   style={{position: 'absolute', right: 0}}
                                   size={32}
                        // disabled={this.state.ble_connection.allowed}
                                   onPress={() => {
                                       console.log('lets start scanning');
                                       if (this.props.BLEConnection.isConnected) {
                                           console.log('try to disconnected');
                                           this.props.disconnect();
                                       } else {
                                           this.props.scanForRobot();
                                       }
                                   }}/>
                </Appbar>

                <Appbar style={styles.bottom}>
                    <Appbar.Action icon="stop" size={32}
                                   disabled={false}
                                   onPress={() => {
                                       this.props.stopRobot();
                                   }}/>
                    <Appbar.Action icon="play-arrow"
                                   size={32}
                                   disabled={false}
                                   onPress={() => {
                                       this.props.runRobot();
                                   }}/>
                    <Appbar.Action icon="fiber-manual-record"
                                   size={32}
                                   disabled={this.state.remaining_btns_disabled}
                                   onPress={() => {
                                       this.props.startRecording();
                                   }}/>
                    <Appbar.Action icon="fast-forward"
                                   size={32}
                                   disabled={this.state.remaining_btns_disabled}
                                   onPress={() => {
                                       this.setState({
                                           stop_btn_disabled: false,
                                           remaining_btns_disabled: true,
                                       });
                                       RobotProxy.go(getLoopCounter()).catch(e => this.handleDisconnect());
                                   }}/>
                    <Appbar.Action icon="file-download"
                                   size={32}
                                   disabled={this.state.remaining_btns_disabled}
                                   onPress={() => {
                                       this.setState({
                                           stop_btn_disabled: true,
                                           remaining_btns_disabled: true,
                                       });
                                       removeAll();
                                       RobotProxy.download().catch(e => this.handleDisconnect());
                                   }}/>
                    <Appbar.Action icon="file-upload"
                                   size={32}
                                   disabled={this.state.remaining_btns_disabled}
                                   onPress={() => {
                                       this.setState({
                                           stop_btn_disabled: true,
                                           remaining_btns_disabled: true,
                                       });
                                       RobotProxy.upload(this.state.speeds).catch(e => {
                                           console.log(2);
                                           this.handleDisconnect();
                                       });
                                   }}/>
                    <Appbar.Action icon="save"
                                   size={32}
                                   disabled={this.state.save_and_new_btn_disabled}
                                   onPress={() => {
                                       this.save();
                                   }}/>
                    <Appbar.Action icon="delete"
                                   size={32}
                                   disabled={this.state.save_and_new_btn_disabled}
                                   onPress={() => {
                                       this.clear();
                                   }}/>
                </Appbar>
            </View>
        );
    }
}

/*
const TabNavigator = createMaterialTopTabNavigator({
    First: {
        screen: MainTab,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="menu" size={24} color={tintColor}/>
            ),
        },
    },
    Second:{
        screen: SecondTab,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="page-layout-body" size={24} color={tintColor}/>
            ),
        }
    },
    Third: {
        screen: MixedViewTab,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="content-copy" size={24} color={tintColor}/>
            ),
        },
    },
}, {
    tabBarOptions: {
        activeTintColor: '#9c27b0',
        inactiveTintColor: 'gray',
        showLabel: false,
        indicatorStyle: {
            backgroundColor: '#9c27b0',
        },
        style: {
            backgroundColor: 'white',
        },
        showIcon: true,
    },
});

const TabContainer = createAppContainer(TabNavigator);
*/
const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...ifIphoneX({
            paddingTop: getStatusBarHeight() + 10,
        }, {}),
    },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    col: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        margin: 5,
    },
    row: {
        height: 60,
        margin: 10,
    },
    view: {
        marginBottom: 55,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});


/*  <TabContainer
      onNavigationStateChange={(prevState, currentState, action) => {
          const currentScreen = this.getActiveRouteName(currentState);
          const prevScreen = this.getActiveRouteName(prevState);
          this.setState({currentRoute: currentScreen});
          switch (currentScreen) {
              case 'First':
                  this.setState({save_and_new_btn_disabled: false});
                  this.save = () => {
                      // storeInstructions();
                  };
                  this.clear = () => {
                      //clearInstructions();
                  };
                  break;
              case 'Second':
                  this.setState({save_and_new_btn_disabled: false});
                  this.save = () => {
                      storeBlocks();
                  };
                  this.clear = () => {
                      clearBlocksProgram();
                  };
                  break;
              default:
                  this.setState({save_and_new_btn_disabled: true});
                  this.clear = undefined;
                  this.save = undefined;
                  break;
          }
      }}
  />*/

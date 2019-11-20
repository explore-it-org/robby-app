import React, {Component} from 'react';
import {StyleSheet, View, Alert, ToastAndroid} from 'react-native';
import {Appbar} from 'react-native-paper';
import RobotProxy from '../ble/RobotProxy';
import {createAppContainer} from 'react-navigation';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {MainTab, MixedViewTab, StepprogrammingTab} from './tabs/index';
// import RobotProxy from '../../../communication/RobotProxy';
// import {instructions, add, removeAll, addSpeedChangeListener, clearInstructions, storeInstructions} from '../../../stores/InstructionsStore';
//import {blocks, addBlocksChangeListener} from '../../../stores/BlocksStore'

import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import i18n from '../../resources/locales/i18n';
import {connectToDevice} from '../ble/BleAction';
import OverviewContainer from '../programmingtabs/overview/OverviewContainer';
import StepProgrammingComponent from '../programmingtabs/stepprogramming/StepProgrammingComponent';
import StepProgrammingContainer from '../programmingtabs/stepprogramming/StepProgrammingContainer';
import BlockProgrammingContainer from '../programmingtabs/blockprogramming/BlockProgrammingContainer';
import {
    clearBlock,
} from '../programmingtabs/blockprogramming/ActiveBlockAction';
// import {storeBlocks, clearBlocksProgram} from '../../../stores/BlocksStore';


export default class ProgrammingComponent extends Component {

    state = {
        currentRoute: 'Stepprogramming',
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        let prev = prevProps.Program.lastChange;
        let now = this.props.Program.lastChange;
        if (prev !== now) {
            switch (now.status) {
                case 'success':
                    ToastAndroid.show(now.operation + ' ' + now.status, ToastAndroid.SHORT);
                    break;
                case 'failure':
                    Alert.alert(now.operation, now.error);
            }

        }
    }

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

    clear = () => {
        this.props.clearProgram();
    };

    save = () => {
        this.props.saveProgram('Stepprogramming');
    };

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
                                   disabled={this.props.BLEConnection.isConnecting}
                                   onPress={() => {
                                       if (this.props.BLEConnection.isConnected) {
                                           this.props.disconnect();
                                       } else {
                                           this.props.scanForRobot();
                                       }
                                   }}/>
                </Appbar>

                <TabContainer
                    onNavigationStateChange={(prevState, currentState, action) => {
                        const currentScreen = this.getActiveRouteName(currentState);
                        const prevScreen = this.getActiveRouteName(prevState);
                        this.save = () => {
                            this.props.saveProgram(currentScreen);
                        };
                        switch (currentScreen) {
                            case 'Stepprogramming':
                                // this.setState({save_and_new_btn_disabled: false});
                                this.clear = () => {
                                    this.props.clearProgram();
                                };
                                break;
                            case 'Blockprogramming':
                                // this.setState({save_and_new_btn_disabled: false});
                                this.clear = () => {
                                    this.props.clearBlock();
                                };
                                break;
                            default:
                                /*this.setState({save_and_new_btn_disabled: true});*/
                                this.clear = undefined;
                                this.save = undefined;
                                break;
                        }
                    }}
                />

                <Appbar style={styles.bottom}>
                    <Appbar.Action icon="stop" size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   !(this.props.BLEConnection.device.isUploading ||
                                       this.props.BLEConnection.device.isGoing ||
                                       this.props.BLEConnection.device.isRecording ||
                                       this.props.BLEConnection.device.isRunning ||
                                       this.props.BLEConnection.device.isDownloading)}
                                   onPress={() => {
                                       this.props.stopRobot();
                                   }}/>
                    <Appbar.Action icon="play-arrow"
                                   size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.props.runRobot();
                                   }}/>
                    <Appbar.Action icon="fiber-manual-record"
                                   size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.props.startRecording();
                                   }}/>
                    <Appbar.Action icon="fast-forward"
                                   size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.props.goRobot();
                                   }}/>
                    <Appbar.Action icon="file-download"
                                   size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.props.download();
                                       //TabNavigator.navigate('Stepprogramming');
                                       //TabContainer.navigate('Stepprogramming');
                                       this.props.navigation.navigate('Stepprogramming');
                                       //navigator.navigate('Stepprogramming');
                                   }}/>
                    <Appbar.Action icon="file-upload"
                                   size={32}
                                   disabled={!this.props.BLEConnection.isConnected ||
                                   this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       console.log(this.state.currentRoute);
                                       this.props.upload(this.state.currentRoute);
                                   }}/>
                    <Appbar.Action icon="save"
                                   size={32}
                                   disabled={this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.save();
                                   }}/>
                    <Appbar.Action icon="delete"
                                   size={32}
                                   disabled={this.props.BLEConnection.device.isUploading ||
                                   this.props.BLEConnection.device.isGoing ||
                                   this.props.BLEConnection.device.isRecording ||
                                   this.props.BLEConnection.device.isRunning ||
                                   this.props.BLEConnection.device.isDownloading}
                                   onPress={() => {
                                       this.clear();
                                   }}/>
                </Appbar>
            </View>
        );
    }
}


const TabNavigator = createMaterialTopTabNavigator({
    Stepprogramming: {
        screen: StepProgrammingContainer,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="page-layout-body" size={24} color={tintColor}/>
            ),
        },
    },
    Blockprogramming: {
        screen: BlockProgrammingContainer,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="content-copy" size={24} color={tintColor}/>
            ),
        },
    },
    Overview: {
        screen: OverviewContainer,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <MaterialCommunityIcon name="menu" size={24} color={tintColor}/>
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




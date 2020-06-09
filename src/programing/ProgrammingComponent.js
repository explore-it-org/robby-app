import React, {Component} from 'react';
import {StyleSheet, View, Alert, ToastAndroid, Image, SafeAreaViewComponent} from 'react-native';
import {Appbar, Button, IconButton, Modal, Portal} from 'react-native-paper';
import {createAppContainer, NavigationActions} from 'react-navigation';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import i18n from '../../resources/locales/i18n';
import OverviewContainer from '../programmingtabs/overview/OverviewContainer';
import StepProgrammingContainer from '../programmingtabs/stepprogramming/StepProgrammingContainer';
import BlockProgrammingContainer from '../programmingtabs/blockprogramming/BlockProgrammingContainer';
import BleService from '../ble/BleService';
import Toast from '../controls/Toast';
import SettingsContainer from '../settings/SettingsContainer';
import CustomIcon from '../utillity/CustomIcon';
import { Program } from '../model/DatabaseModels';


export default class ProgrammingComponent extends Component {


    state = {
        currentRoute: 'Stepprogramming',
        clearButtonDisabled: false,
        saveButtonDisabled: false, // TODO: Move to redux and disable button when program not dirty
        uploadButtonDisable: false,
        iconSize: 26,
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        let prev = prevProps.Program.lastChange;
        let now = this.props.Program.lastChange;
        if (prev !== now) {
            if (now.status === i18n.t('RoboticsDatabase.success')) {
                Toast.show(now.status, 2000); // TODO show propper message??
            } else {
                Alert.alert(now.status, now.error);
            }
        }
        prev = prevProps.BLEConnection.device;
        now = this.props.BLEConnection.device;
        if (prev !== now) {
            if (prev.isUploading && !now.isUploading) {
                Toast.show(i18n.t('Programming.uploadMessage'), 2000);
            } else if (prev.isDownloading && !now.isDownloading) {
                Toast.show(i18n.t('Programming.downloadMessage'), 2000);
            } else if (prev.isRecording && !now.isRecording) {
                Toast.show(i18n.t('Programming.recordMessage'), 2000);
            } else if (prev.isGoing && !now.isGoing) {
                Toast.show(i18n.t('Programming.driveMessage'), 2000);
            }
        }

    }

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
        let settingsPage = this.props.Settings.visible ? <Portal><SettingsContainer/></Portal> : undefined;

        let deviceName = this.props.BLEConnection.isConnected ?
            <Appbar.Content style={{position: 'absolute', right: 80}}
                            title={this.props.BLEConnection.device.name.substr(this.props.BLEConnection.device.name.length - 5)}
                            size={this.state.iconSize}/>
            :
            <Appbar.Content style={{position: 'absolute', right: 80}}
                            title={i18n.t('Programming.noConnectedDevice')}
                            size={this.state.iconSize}/>;

        return (
            <View style={[styles.container]}>
                {settingsPage}
                <SinglePickerMaterialDialog
                    title={i18n.t('Programming.chooseDevice')}
                    items={this.props.BLEConnection.scannedDevices.map((row, index) => ({
                        key: index.toString(),
                        label: row.substr(row.length - 5),
                        selected: false,
                        val: row
                    }))}
                    visible={this.props.BLEConnection.isScanning}
                    onCancel={() => {
                        this.props.stopScanning();
                    }}
                    onOk={
                        result => {
                            console.log(result);                            this.props.stopScanning();
                            if (result.selectedValue) {
                                this.props.setActiveDevice(result.selectedValue);
                                this.props.connectToRobot();
                            }
                        }
                    }
                    colorAccent='#1E3888'
                />


                <Appbar>
                    
                    <Appbar.Content style={{position: 'absolute', left: 88}} title="Robotics"
                                    size={this.state.iconSize}/>
                    <Image style={{width: 80, resizeMode: 'contain', left: 10}} source={require('../../resources/icon/logo.png')}></Image>
                        <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="gear" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        style={{position: 'absolute', right: 0}}
                        onPress={() => this.props.toggleSettings()}/>
                       
                    {deviceName}
                    <Appbar.Action
                        icon={({size, color}) => (
                            (this.props.BLEConnection.isConnected) ?
                                <CustomIcon name="bluetooth" size={size} color={color}/> :
                                <CustomIcon name="bluetooth-disabled" size={size} color={color}/>
                        )}
                        //{(this.props.BLEConnection.isConnected) ? 'bluetooth-connected' : 'bluetooth'}
                        style={{position: 'absolute', right: 40}}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.isConnecting}
                        onPress={() => {
                            //  this.props.scanStatus(); this will break a lot of things
                            if (!this.props.Settings.isGranted) {
                                BleService.requestLocationPermission().then(a => {
                                    this.props.grantLocation(a);
                                });
                            } else if (this.props.Settings.bleState !== 'PoweredOn') {
                                Alert.alert(i18n.t('Programming.bluetoothNotTurnedOnTitle'), i18n.t('Programming.bluetoothNotTurnedOnMessage'));
                            } else if (this.props.BLEConnection.isConnected) {
                                this.props.disconnect();
                            } else {
                                this.props.scanForRobot();
                            }
                        }}/>
                </Appbar>

                <TabContainer
                    ref={nav => (this.navigator = nav)}
                    onNavigationStateChange={(prevState, currentState, action) => {
                        const currentScreen = this.getActiveRouteName(currentState);
                        const prevScreen = this.getActiveRouteName(prevState);
                        this.save = () => {
                            this.props.saveProgram(currentScreen);
                        };
                        this.setState({currentRoute: currentScreen});
                        switch (currentScreen) {
                            case 'Stepprogramming':
                                this.setState({clearButtonDisabled: false});
                                this.setState({saveButtonDisabled: false});
                                this.setState({uploadButtonDisable: false});
                                this.clear = () => {
                                    this.props.clearProgram();
                                };
                                break;
                            case 'Blockprogramming':
                                this.setState({clearButtonDisabled: false});
                                this.setState({saveButtonDisabled: false});
                                this.setState({uploadButtonDisable: false});
                                this.clear = () => {
                                    this.props.clearBlock();
                                };
                                break;
                            default:
                                this.clear = () => {
                                };
                                this.save = () => {
                                };
                                this.setState({clearButtonDisabled: true});
                                this.setState({saveButtonDisabled: true});
                                this.setState({uploadButtonDisable: true});
                                break;
                        }
                    }}
                />

                <Appbar style={styles.bottom}>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="stop" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        !(this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading)}
                        onPress={() => {
                            this.props.stopRobot();
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="play" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading}
                        onPress={() => {
                            this.props.runRobot();
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="record" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading}
                        onPress={() => {
                            this.props.startRecording();
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="playcode" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading}
                        onPress={() => {
                            this.props.goRobot();
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="download" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading}
                        onPress={() => {
                            this.props.download();
                            this.navigator && this.navigator.dispatch(NavigationActions.navigate({routeName: 'Stepprogramming'}));
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="upload" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                        this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading ||
                        this.state.uploadButtonDisable && this.props.Overview.selectedProgramIndex < 0}
                        onPress={() => {
                            let instructions = null;
                            if (this.state.currentRoute === 'Stepprogramming') {
                                instructions = Program.flatten(this.props.ActiveProgram.ActiveProgram);
                            } else if (this.state.currentRoute === 'Blockprogramming') {
                                instructions = Program.flatten(this.props.ActiveBlock.Active_Block);
                            } else {
                                instructions = Program.flatten(this.props.Overview.selectedProgram);
                            }

                            if (instructions.length == 0) {
                                Alert.alert(i18n.t("Settings.error"), i18n.t("Programming.emptyProgram"), [{ text: "OK", onPress: () => { } } ]);
                                
                            } else if (instructions.length > 4096) {
                                Alert.alert(i18n.t("Settings.error"), i18n.format(i18n.t("Programming.programTooLong"), instructions.length), [{ text: "OK", onPress: () => { } } ])
                            } else {
                                this.props.upload(instructions);
                            }

                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="save" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading ||
                        this.state.saveButtonDisabled}
                        onPress={() => {
                            this.save();
                        }}/>
                    <Appbar.Action
                        icon={({size, color}) => (
                            <CustomIcon name="new" size={size} color={color}/>
                        )}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.device.isUploading ||
                        this.props.BLEConnection.device.isGoing ||
                        this.props.BLEConnection.device.isRecording ||
                        this.props.BLEConnection.device.isRunning ||
                        this.props.BLEConnection.device.isDownloading ||
                        this.state.clearButtonDisabled}
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
        swipeEnabled: true,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <CustomIcon name="step1" size={24} color={tintColor}/>
            ),
        },
    },
    Blockprogramming: {
        screen: BlockProgrammingContainer,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <CustomIcon name="step2" size={24} color={tintColor}/>
            ),
        },
    },
    Overview: {
        screen: OverviewContainer,
        navigationOptions: {
            tabBarIcon: ({tintColor}) => (
                <CustomIcon name="step3" size={24} color={tintColor}/>
            ),
        },
    },
}, {
    tabBarOptions: {
        activeTintColor: '#1E3888',
        inactiveTintColor: 'gray',
        showLabel: false,
        indicatorStyle: {
            backgroundColor: '#1E3888',
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
    },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-evenly',
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
        zIndex: 999,
    },
});




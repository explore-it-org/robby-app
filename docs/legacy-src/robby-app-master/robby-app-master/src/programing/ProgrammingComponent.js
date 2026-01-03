import React, { Component } from 'react';
import { StyleSheet, View, Alert, Image, Platform, PermissionsAndroid } from 'react-native';
import { Appbar, Portal } from 'react-native-paper';
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
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createAppContainer, NavigationActions } from 'react-navigation';


export default class ProgrammingComponent extends Component {


    state = {
        currentRoute: 'Stepprogramming',
        clearButtonDisabled: false,
        saveButtonDisabled: false, // TODO: Move to redux and disable button when program not dirty
        uploadButtonDisable: false,
        iconSize: 26,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        let prev = prevProps.Program.lastChange;
        let now = this.props.Program.lastChange;
        if (prev !== now) {
            if (now.status === "success") {
                Toast.show(now.message, 2000);
            } else {
                Alert.alert(i18n.t("RoboticsDatabase.failureTitle"), now.error);
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
        let settingsPage = this.props.Settings.visible ? <Portal><SettingsContainer /></Portal> : undefined;

        let deviceName = this.props.BLEConnection.isConnected ?
            <Appbar.Content style={{ position: 'absolute', right: 80 }}
                title={this.props.BLEConnection.device.name.substr(this.props.BLEConnection.device.name.length - 5)}
                size={this.state.iconSize} />
            :
            <Appbar.Content style={{ position: 'absolute', right: 80 }}
                title={i18n.t('Programming.noConnectedDevice')}
                size={this.state.iconSize} />;

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
                            this.props.stopScanning();
                            if (result.selectedValue) {
                                this.props.setActiveDevice(result.selectedValue);
                                this.props.connectToRobot();
                            }
                        }
                    }
                    colorAccent='#1E3888'
                />


                <Appbar>

                    <Appbar.Content style={{ position: 'absolute', left: 88 }} title="Robotics"
                        size={this.state.iconSize} />
                    <Image style={{ width: 80, resizeMode: 'contain', left: 10 }} source={require('../../resources/icon/logo.png')}></Image>
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="gear" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        style={{ position: 'absolute', right: 0 }}
                        animated={false}
                        onPress={() => this.props.toggleSettings()}
                    />

                    {deviceName}
                    <Appbar.Action
                        icon={({ size, color }) => (
                            (this.props.BLEConnection.isConnected) ?
                                <CustomIcon name="bluetooth" size={size} color={color} /> :
                                <CustomIcon name="bluetooth-disabled" size={size} color={color} />
                        )}
                        //{(this.props.BLEConnection.isConnected) ? 'bluetooth-connected' : 'bluetooth'}
                        style={{ position: 'absolute', right: 40 }}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.isConnecting}
                        animated={false}
                        onPress={() => {
                            if (!this.props.Settings.isGranted) {
                                BleService.requestLocationPermission().then(a => {
                                    this.props.grantLocation(a);
                                });
                            } else if (this.props.Settings.bleState !== 'PoweredOn') {
                                Alert.alert(i18n.t('Programming.bluetoothNotTurnedOnTitle'), i18n.t('Programming.bluetoothNotTurnedOnMessage'));
                            } else if (this.props.BLEConnection.isConnected) {
                                this.props.disconnect();
                            } else {
                                withBlePermissions(() => {
                                    this.props.scanForRobot();
                                });
                            }
                        }} />
                </Appbar>

                <TabContainer
                    ref={nav => (this.navigator = nav)}
                    onNavigationStateChange={(prevState, currentState, action) => {
                        const currentScreen = this.getActiveRouteName(currentState);
                        const prevScreen = this.getActiveRouteName(prevState);
                        this.save = () => {
                            this.props.saveProgram(currentScreen);
                        };
                        this.setState({ currentRoute: currentScreen });
                        switch (currentScreen) {
                            case 'Stepprogramming':
                                this.setState({ clearButtonDisabled: false });
                                this.setState({ saveButtonDisabled: false });
                                this.setState({ uploadButtonDisable: false });
                                this.clear = () => {
                                    this.props.clearProgram();
                                };
                                break;
                            case 'Blockprogramming':
                                this.setState({ clearButtonDisabled: false });
                                this.setState({ saveButtonDisabled: false });
                                this.setState({ uploadButtonDisable: false });
                                this.clear = () => {
                                    this.props.clearBlock();
                                    this.props.loadChildren();
                                };
                                this.props.loadChildren();
                                break;
                            default:
                                this.clear = () => {
                                };
                                this.save = () => {
                                };
                                this.setState({ clearButtonDisabled: true });
                                this.setState({ saveButtonDisabled: true });
                                this.setState({ uploadButtonDisable: true });
                                break;
                        }
                    }}
                />

                <Appbar style={styles.bottom}>
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="stop" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            !(this.props.BLEConnection.device.isUploading ||
                                this.props.BLEConnection.device.isGoing ||
                                this.props.BLEConnection.device.isRecording ||
                                this.props.BLEConnection.device.isRunning ||
                                this.props.BLEConnection.device.isDownloading)}
                        animated={false}
                        onPress={() => {
                            this.props.stopRobot();
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="play" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading}
                        animated={false}
                        onPress={() => {
                            this.props.runRobot();
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="record" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading}
                        animated={false}
                        onPress={() => {
                            this.props.startRecording();
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="playcode" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading}
                        animated={false}
                        onPress={() => {
                            this.props.goRobot();
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="download" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading}
                        animated={false}
                        onPress={() => {
                            this.props.download();
                            this.navigator && this.navigator.dispatch(NavigationActions.navigate({ routeName: 'Stepprogramming' }));
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="upload" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={!this.props.BLEConnection.isConnected ||
                            this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading ||
                            this.state.uploadButtonDisable && this.props.Overview.selectedProgramIndex < 0}
                        animated={false}
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
                                Alert.alert(i18n.t("Programming.emptyProgramTitle"), i18n.t("Programming.emptyProgramMessage"), [{ text: "OK", onPress: () => { } }]);

                            } else if (instructions.length > 4096) {
                                Alert.alert(i18n.t("Programming.programTooLongTitle"), i18n.format(i18n.t("Programming.programTooLongMessage"), instructions.length), [{ text: "OK", onPress: () => { } }])
                            } else {
                                this.props.upload(instructions);
                            }

                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="save" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading ||
                            this.state.saveButtonDisabled}
                        animated={false}
                        onPress={() => {
                            this.save();
                        }} />
                    <Appbar.Action
                        icon={({ size, color }) => (
                            <CustomIcon name="new" size={size} color={color} />
                        )}
                        size={this.state.iconSize}
                        disabled={this.props.BLEConnection.device.isUploading ||
                            this.props.BLEConnection.device.isGoing ||
                            this.props.BLEConnection.device.isRecording ||
                            this.props.BLEConnection.device.isRunning ||
                            this.props.BLEConnection.device.isDownloading ||
                            this.state.clearButtonDisabled}
                        animated={false}
                        onPress={() => {
                            this.clear();
                        }} />
                </Appbar>
            </View>
        );
    }
}

function withBlePermissions(action) {
    if (Platform.OS !== 'android' || Platform.Version < 32) {
        action();
        return;
    }

    console.info("Requesting bluetooth permissions");

    console.info("Requesting permission android.permission.BLUETOOTH_SCAN");
    PermissionsAndroid.request('android.permission.BLUETOOTH_SCAN', {
        title: 'Berechtigung für Bluetooth-Scan',
        message:
            'explore-it Robotics benötigt ihre Zustimmung um Bluetooth-Geräte in der Nähe zu finden.',
        buttonNeutral: 'Später Fragen',
        buttonNegative: 'Abbrechen',
        buttonPositive: 'Zustimmen',
    }).then(result => {
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
            console.info("BLUETOOTH_SCAN permission granted");

            console.info("Requesting permission android.permission.BLUETOOTH_CONNECT");
            PermissionsAndroid.request('android.permission.BLUETOOTH_CONNECT', {
                title: 'Berechtigung für Bluetooth-Verbindung',
                message:
                    'explore-it Robotics benötigt ihre Zustimmung um sich zu Bluetooth-Geräten zu verbinden.',
                buttonNeutral: 'Später Fragen',
                buttonNegative: 'Abbrechen',
                buttonPositive: 'Zustimmen',
            }).then(result => {
                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    console.info("BLUETOOTH_CONNECT permission granted");

                    console.info("Requesting permission android.permission.NEARBY_WIFI_DEVICES");
                    PermissionsAndroid.request('android.permission.NEARBY_WIFI_DEVICES', {
                        title: 'Berechtigung für Geräte in der Nähe',
                        message:
                            'explore-it Robotics benötigt ihre Zustimmung um sich zu Bluetooth-Geräten in ihrer Nähe zu verbinden.',
                        buttonNeutral: 'Später Fragen',
                        buttonNegative: 'Abbrechen',
                        buttonPositive: 'Zustimmen',
                    }).then(result => {
                        if (result === PermissionsAndroid.RESULTS.GRANTED) {
                            console.info("NEARBY_WIFI_DEVICES permission granted");
                            action();
                        } else {
                            console.warn("NEARBY_WIFI_DEVICES permission denied");
                        }
                    });
                } else {
                    console.warn("BLUETOOTH_CONNECT permission denied");
                }
            });
        } else {
            console.warn("BLUETOOTH_SCAN permission denied");
        }
    });
}

const TabNavigator = createMaterialTopTabNavigator({
    Stepprogramming: {
        screen: StepProgrammingContainer,
        swipeEnabled: true,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <CustomIcon name="step1" size={24} color={tintColor} />
            ),
        },
    },
    Blockprogramming: {
        screen: BlockProgrammingContainer,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <CustomIcon name="step2" size={24} color={tintColor} />
            ),
        },
    },
    Overview: {
        screen: OverviewContainer,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <CustomIcon name="step3" size={24} color={tintColor} />
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




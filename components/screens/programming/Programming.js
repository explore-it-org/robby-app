import React, { Component } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { createMaterialTopTabNavigator, createAppContainer } from "react-navigation";
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTab, MixedViewTab } from "./tabs/index";
import RobotProxy from '../../../communication/RobotProxy';
import { speeds, add, removeAll, addSpeedChangeListener } from '../../../stores/SpeedsStore';
import { addDeviceNameChangeListener, getDeviceName, setDeviceName, setConnected, getLoopCounter, getDuration, getInterval, setInterval } from "../../../stores/SettingsStore";
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper'
import SinglePickerMaterialDialog from '../../materialdialog/SinglePickerMaterialDialog'
import i18n from '../../../locales/i18n'

export default class Programming extends Component {
    state = {
        device_name: getDeviceName(),
        sub_title: i18n.t('Programming.device'),
        visible: false,
        device: undefined,
        devices: [],
        speeds: speeds,
        stop_btn_disabled: true,
        remaining_btns_disabled: true
    };

    constructor(props) {
        super(props);
        addDeviceNameChangeListener((name) => { this.setState({ device_name: name }); });
        addSpeedChangeListener((speeds) => { this.setState({ speeds: speeds }); });
    }

    // handles messages from the communcation system
    handleCommunicationMessages(name) {
        setDeviceName({ device: name.substr(name.length - 5) });
        setConnected(true);
        this.setState({
            visible: false,
            device: name,
            remaining_btns_disabled: false,
            stop_btn_disabled: true
        });
    }

    handleResponse(res) {
        switch (res.type) {
            case 'interval':
                setInterval(res.value)
                break;
            case 'speedLine':
                add({ left: res.left, right: res.right })
                break
            case 'finishedDownload':
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true
                });
                Alert.alert(i18n.t('Programming.download'), i18n.t('Programming.downloadMessage'));
                break
            case 'finishedDriving':
                Alert.alert(i18n.t('Programming.drive'), i18n.t('Programming.driveMessage'));
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true,
                });
                break
            case 'stop':
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true,
                });
                break
            case 'finishedLearning':
                Alert.alert(i18n.t('Programming.record'), i18n.t('Programming.recordMessage'));
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true
                });
                break
            case 'finishedUpload':
                Alert.alert(i18n.t('Programming.upload'), i18n.t('Programming.uploadMessage'));
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true
                });
                break
            default:
                break
        }
    }

    render() {
        return (
            <View style={[styles.container]}>
                <SinglePickerMaterialDialog
                    title = {i18n.t('Programming.chooseDevice')}
                    items = {this.state.devices.map((row, index) => ({key: index.toString(), label: row, selected: false }))}
                    visible = {this.state.visible}
                    onCancel = {
                        () => {
                            this.setState({
                                visible: false
                            });
                            RobotProxy.stopScanning();
                        }
                    }
                    onOk = {
                        result => {
                            this.setState({
                                visible: false
                            });
                            RobotProxy.stopScanning();

                            if(result.selectedLabel) {
                                setDeviceName({ device: i18n.t('Programming.connecting')})
                                let deviceName = result.selectedLabel;
                                RobotProxy.setRobot(deviceName);
                                RobotProxy.connect(
                                    // callback for all messages from the robot
                                    (response) => {
                                        this.handleResponse(response)
                                    },
                                    // callback if communication is established successfully
                                    (robot) => {
                                        this.handleCommunicationMessages(robot.name);
                                    },
                                    // handle all errors
                                    (error) => {
                                        console.log("Error: " + error);
                                        setDeviceName({ device: i18n.t('Programming.noConnection')});
                                        setInterval(0);
                                        setConnected(false);
                                        this.setState({
                                            remaining_btns_disabled: true,
                                            stop_btn_disabled: true
                                        });
                                        RobotProxy.disconnect();
                                        Alert.alert("Error", i18n.t('Programming.connectionError'));
                                    }
                                );
                            }
                        }
                    }
                    colorAccent="#9c27b0"
                />
                <Appbar>
                    <Appbar.Action icon="menu" size={32} onPress={() => this.props.navigation.openDrawer()} />
                    <Appbar.Content style={{ position: 'absolute', left: 40 }} title="Explore-it" size={32} />
                    <Appbar.Content style={{ position: 'absolute', right: 0 }}
                        title={this.state.device_name}
                        subtitle={this.state.sub_title}
                        size={32} />
                </Appbar>
                <TabContainer />
                <Appbar style={styles.bottom}>
                    <Appbar.Action icon="stop" size={32}
                        disabled={this.state.stop_btn_disabled}
                        onPress={() => {
                            RobotProxy.stop();
                        }} />
                    <Appbar.Action icon="play-arrow"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                stop_btn_disabled: false,
                                remaining_btns_disabled: true
                            });
                            RobotProxy.run();
                        }} />
                    <Appbar.Action icon="fiber-manual-record"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                stop_btn_disabled: false,
                                remaining_btns_disabled: true
                            });
                            RobotProxy.record(getDuration(), getInterval());
                        }} />
                    <Appbar.Action icon="fast-forward"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                stop_btn_disabled: false,
                                remaining_btns_disabled: true
                            });
                            RobotProxy.go(getLoopCounter());
                        }} />
                    <Appbar.Action icon="file-download"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                stop_btn_disabled: true,
                                remaining_btns_disabled: true
                            });
                            removeAll();
                            RobotProxy.download();
                        }} />
                    <Appbar.Action icon="file-upload"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                stop_btn_disabled: true,
                                remaining_btns_disabled: true
                            });
                            RobotProxy.upload(this.state.speeds);
                        }} />
                    <Appbar.Action icon={(this.state.device) ? "bluetooth-connected" : "bluetooth"} style={{ position: 'absolute', right: 0 }}
                        size={32}
                        onPress={() => {
                            if (RobotProxy.isConnected) {
                                RobotProxy.disconnect();
                                setDeviceName({ device: i18n.t('Programming.noConnection')});
                                setInterval(0);
                                setConnected(false);
                                this.setState({
                                    device: undefined,
                                    remaining_btns_disabled: true,
                                    stop_btn_disabled: true
                                });
                            } else {
                                // init scanning for robots over ble
                                this.setState({
                                    devices: []
                                });
                                RobotProxy.scanningForRobots((error) => {
                                    console.log(error);
                                }, (device) => {
                                    // collect all devices found and publish them in the Dialog
                                    let devices = this.state.devices;
                                    devices.push(device);
                                    this.setState({ devices: devices.sort() });
                                });
                                setTimeout(() => {
                                    this.setState({ visible: true });
                                }, 500);
                            }
                        }} />
                </Appbar>
            </View>
        );
    }
}

const TabNavigator = createMaterialTopTabNavigator({
    First: {
        screen: MainTab,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <MaterialCommunityIcon name="menu" size={24} color={tintColor} />
            )
        },
    },
    Second: {
        screen: MixedViewTab,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <MaterialCommunityIcon name="page-layout-body" size={24} color={tintColor} />
            )
        },
    }
}, {
        tabBarOptions: {
            activeTintColor: '#9c27b0',
            inactiveTintColor: 'gray',
            showLabel: false,
            indicatorStyle: {
                backgroundColor: '#9c27b0'
            },
            style: {
                backgroundColor: 'white',
            },
            showIcon: true
        }
    });

const TabContainer = createAppContainer(TabNavigator);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...ifIphoneX({
            paddingTop: getStatusBarHeight() + 10,
        }, {

            })
    },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0
    },
    col: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        margin: 5
    },
    row: {
        height: 60,
        margin: 10
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

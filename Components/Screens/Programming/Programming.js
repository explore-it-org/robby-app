import React, { Component } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { createMaterialTopTabNavigator, createAppContainer } from "react-navigation";
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTab, MixedViewTab, BlockViewTab } from "./Tabs/index";
import RobotProxy from '../../../robot/RobotProxy';
import { speeds, add, remove_all, set_update_speeds_callback } from '../../../Stores/SpeedsStore';
import { set_update_device_name_callback, device_name, update_device_name, loops } from "../../../Stores/SettingsStore";
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper'
import { SinglePickerMaterialDialog } from "react-native-material-dialog";
import i18n from '../../../locales/i18n'

export default class Programming extends Component {
    state = {
        device_name: device_name,
        sub_title: i18n.t('Programming.device'),
        visible: false,
        device: undefined,
        devices: [],
        is_learning: false,
        speeds: speeds,
        stop_btn_disabled: true,
        remaining_btns_disabled: true,
        btn_disabled_states: {
            play: false,
            record: false,
            run: false,
            download: false,
            upload: false
        },
        loop_counter: 0
    };

    constructor(props) {
        super(props);
        set_update_device_name_callback((name) => { this.setState({ device_name: name }); });
        set_update_speeds_callback((speeds) => { this.setState({ speeds: speeds }); });
    }

    // handles responses from the robot
    handleResponse(response) {
        console.log("Response: " + response)
        if (response.match("\\b[0-9]{3}\\b,\\b[0-9]{3}\\b")) {
            // speed values from beam
            let read_speeds = response.trim().split(',');
            let speed_l = read_speeds[0] / 2.55 + 0.5;
            let speed_r = read_speeds[1] / 2.55 + 0.5;
            if (speed_l < 0)
                speed_l = 0;
            if (speed_r < 0)
                speed_r = 0;
            add({ left: parseInt(speed_l), right: parseInt(speed_r) })
        }
        if (response.trim().toLowerCase() === ',,,,') {
            // finished beam
            this.setState({ is_learning: false });
            Alert.alert(i18n.t("Programming.download"), i18n.t('Programming.downloadMessage'));
            this.setState({
                remaining_btns_disabled: false,
                stop_btn_disabled: true
            });
        }
        if (response.trim().toLowerCase() === '_sr_') {
            this.setState({
                is_learning: false,
                remaining_btns_disabled: false,
                stop_btn_disabled: true,
                loop_counter: 0
            });
        }
        if (this.state.is_learning) {
            if (response.trim().toLowerCase() === 'full') {
                // done learning
                Alert.alert(i18n.t("Programming.record"), i18n.t('Programming.recordMessage'));
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true
                });
            }
        } else {
            if (response.trim().toLowerCase() === 'full') {
                // done uploading
                Alert.alert(i18n.t("Programming.upload"), i18n.t('Programming.uploadMessage'));
                this.setState({
                    remaining_btns_disabled: false,
                    stop_btn_disabled: true
                });
            } else if (response.trim().toLowerCase() === '_end') {
                // done driving
                if (this.state.loop_counter === loops) {
                    Alert.alert(i18n.t("Programming.drive"), i18n.t('Programming.driveMessage'));
                    this.setState({
                        remaining_btns_disabled: false,
                        stop_btn_disabled: true,
                        loop_counter: 0
                    });
                } else {
                    RobotProxy.go()
                    this.setState({
                        loop_counter: this.state.loop_counter + 1
                    });
                }
            }
        }
    }

    // handles messages from the communcation system
    handleCommunicationMessages(name) {
        update_device_name({ device: name.substr(name.length - 5) });
        this.setState({
            visible: false,
            device: name,
            remaining_btns_disabled: false,
            stop_btn_disabled: true
        });
    }

    render() {
        return (
            <View style={[styles.container]}>
                <SinglePickerMaterialDialog
                    title={i18n.t('Programming.chooseDevice')}
                    items={this.state.devices.map((row, index) => ({ value: index, label: row }))}
                    visible={this.state.visible}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={result => {
                        this.setState({
                            visible: false
                        });
                        update_device_name({ device: i18n.t('Programming.connecting')})
                        let deviceName = result.selectedItem.label;
                        RobotProxy.setRobot(deviceName);
                        RobotProxy.connect(
                            // callback for all messages from the robot
                            (response) => {
                                this.handleResponse(response);
                            },
                            // callback if communication is established successfully
                            (robot) => {
                                this.handleCommunicationMessages(robot.name);
                            },
                            // handle all errors
                            (error) => {
                                console.log("Error: " + error);
                                update_device_name({ device: i18n.t('Programming.noConnection')})
                                this.setState({
                                    remaining_btns_disabled: true,
                                    stop_btn_disabled: true
                                });
                                RobotProxy.disconnect();
                                Alert.alert("Error", i18n.t('Programming.connectionError'));
                            });
                    }}
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
                                remaining_btns_disabled: true,
                                stop_btn_disabled: false,
                                loop_counter: this.state.loop_counter + 1
                            });
                            RobotProxy.go();
                        }} />
                    <Appbar.Action icon="fiber-manual-record"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                remaining_btns_disabled: true,
                                stop_btn_disabled: false,
                                is_learning: true
                            });
                            RobotProxy.record(loops);
                        }} />
                    <Appbar.Action icon="fast-forward"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                remaining_btns_disabled: true,
                                stop_btn_disabled: false
                            });
                            RobotProxy.run();
                        }} />
                    <Appbar.Action icon="file-download"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({
                                remaining_btns_disabled: true,
                                stop_btn_disabled: true
                            });
                            remove_all();
                            RobotProxy.download();
                        }} />
                    <Appbar.Action icon="file-upload"
                        size={32}
                        disabled={this.state.remaining_btns_disabled}
                        onPress={() => {
                            this.setState({ remaining_btns_disabled: true });
                            RobotProxy.upload(this.state.speeds);
                        }} />
                    <Appbar.Action icon={(this.state.device) ? "bluetooth-connected" : "bluetooth"} style={{ position: 'absolute', right: 0 }}
                        size={32}
                        onPress={() => {
                            if (RobotProxy.isConnected) {
                                RobotProxy.disconnect();
                                update_device_name({ device: i18n.t('Programming.noConnection')})
                                this.setState({
                                    device: undefined,
                                    remaining_btns_disabled: true,
                                    stop_btn_disabled: true
                                })
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
                                    this.setState({ devices: devices });
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
    },
    Third: {
        screen: BlockViewTab,
        navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
                <MaterialCommunityIcon name="page-layout-header" size={24} color={tintColor} />
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

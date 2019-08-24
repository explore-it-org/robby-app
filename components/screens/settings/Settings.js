import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { Appbar } from 'react-native-paper';

import { getDeviceName, addDeviceNameChangeListener } from "../../../stores/SettingsStore";
import { getInterval, addIntervalChangeListener } from "../../../stores/SettingsStore";
import { getLoopCounter, setLoopCounter } from "../../../stores/SettingsStore";
import { getDuration, setDuration } from "../../../stores/SettingsStore";
import { isConnected, addConnectedChangeListener } from "../../../stores/SettingsStore";

//import { Icon } from 'react-native-elements';
//import CalibrationInput from './CalibrationInput';
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper';
import i18n from '../../../locales/i18n';
import RobotProxy from '../../../communication/RobotProxy';


export default class Settings extends Component {

    state = {
        device_name: getDeviceName(),
        sub_title: i18n.t('Settings.device'),
        loops: getLoopCounter().toString(),
        duration: getDuration().toString(),
        interval: getInterval() == 0 ? "" : getInterval().toString(),
        connected: isConnected()
    };

    constructor() {
        super();
        addDeviceNameChangeListener(name => { this.setState({ device_name: name }); });
        addIntervalChangeListener(value => { this.setState({ interval: value == 0 ? "" : value.toString() }); })
        addConnectedChangeListener(value => { this.setState({ connected: isConnected() }); });
    }

    render() {
        return (
            <View style={[styles.container]}>
                <Appbar>
                    <Appbar.Action icon="menu" size={32} onPress={() => this.props.navigation.openDrawer()} />
                    <Appbar.Content style={{ position: 'absolute', left: 40 }} title="Explore-it" size={32} />
                    <Appbar.Content style={{ position: 'absolute', right: 0 }}
                        title={this.state.device_name}
                        subtitle={this.state.sub_title} size={32} />
                </Appbar>

                <View style={{ flex: 1, padding: 40 }}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.settings')}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={{ height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.interval')}
                        </Text>
                        <TextInput
                            style={{ padding: 5, width: 60, height: 50, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                            keyboardType='numeric'
                            textAlign={'center'}
                            mode="outlined"
                            editable={this.state.connected}
                            onChangeText={(text) => {
                                this.setState({
                                    interval: text
                                });
                                if(text.length > 0) {
                                    const value = parseInt(text);
                                    RobotProxy.setInterval(value)
                                }
                            }}
                            value={this.state.interval}
                        />
                        <Text style={{ height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.interval-unit')}
                        </Text>
                    </View>


                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.learn')}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={{ height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.duration')}
                        </Text>
                        <TextInput
                            style={{ padding: 5, width: 60, height: 50, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                            keyboardType='numeric'
                            textAlign={'center'}
                            mode="outlined"
                            onChangeText={(text) => {
                                const d = (text.length === 0) ? 0 : parseInt(text);
                                this.setState({
                                    duration: text
                                });
                                setDuration(d)
                            }}
                            value={this.state.duration}
                        />
                        <Text style={{ height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.duration-unit')}
                        </Text>
                    </View>

                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.play')}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={{ height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.loops')}
                        </Text>
                        <TextInput
                            style={{ padding: 5, width: 60, height: 50, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                            keyboardType='numeric'
                            textAlign={'center'}
                            mode="outlined"
                            onChangeText={(text) => {
                                const nr = (text.length === 0) ? 0 : parseInt(text);
                                this.setState({
                                    loops: text
                                });
                                setLoopCounter(nr)
                            }}
                            value={this.state.loops}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

//                    <Text style={{marginTop: 20, fontSize: 16, fontWeight: 'bold'}}>
//                        {i18n.t('Settings.calibrate')}
//                    </Text>
//                    <View style={{ flex: 1, flexDirection: 'row'}}>
//                        <CalibrationInput val={5} limit={20} />
//                        <View style={{ flex: 1, alignItems: 'center', height: 220, justifyContent: 'center'}}>
//                            <Icon
//                                reverse
//                                name='play-arrow'
//                                color='#9c27b0'
//                                size={32}
//                                onPress={() => alert('run')} />
//                        </View>
//                        <CalibrationInput val={19} limit={20} />
//                    </View>

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        ...ifIphoneX({
            paddingTop: getStatusBarHeight() + 10,
            }, {
            }
        )
    }
})
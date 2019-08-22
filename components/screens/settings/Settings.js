import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { Icon } from 'react-native-elements';
import { Appbar } from 'react-native-paper';
import { set_update_device_name_callback, device_name, loops, set_loops } from "../../../stores/SettingsStore";
import CalibrationInput from './CalibrationInput';
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper';
import i18n from '../../../locales/i18n';

export default class Settings extends Component {

    state = {
        device_name: device_name,
        sub_title: i18n.t('Settings.device'),
        loops: loops.toString()
    };

    constructor() {
        super();
        set_update_device_name_callback((name) => { this.setState({ device_name: name }); });
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
                        {i18n.t('Settings.learn')}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={{ height: 50, width: '20%'}}>
                            {i18n.t('Settings.interval')}
                            </Text>
                        <TextInput
                            style={{ padding: 5, height: 50, width: 60, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                            keyboardType='numeric'
                            textAlign={'center'}
                            mode="outlined"
                        />
                        <Text style={{ height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.duration')}
                        </Text>
                        <TextInput
                            style={{ padding: 5, width: 60, height: 50, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                            keyboardType='numeric'
                            textAlign={'center'}
                            mode="outlined"
                        />
                    </View>
                    <Button
                        title={i18n.t('Settings.save')}
                        color="#9c27b0"
                        onPress={() => alert('something')} />
                    <Text style={{marginTop: 20, fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        Loops:
                    </Text>
                    <TextInput
                        style={{ marginLeft: 20, height: 50, width: 60, borderWidth: 1, borderColor: 'grey', backgroundColor: 'white', justifyContent: 'center' }}
                        keyboardType='numeric'
                        textAlign={'center'}
                        mode="outlined"
                        onChangeText={(text) => {
                            const nr = (text.length === 0) ? 0 : parseInt(text);
                            this.setState({
                                loops: text
                            });
                            set_loops(nr)
                        }}
                        value={this.state.loops}
                    />
                    <Text style={{marginTop: 20, fontSize: 16, fontWeight: 'bold'}}>
                        {i18n.t('Settings.calibrate')}
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row'}}>
                        <CalibrationInput val={5} limit={20} />
                        <View style={{ flex: 1, alignItems: 'center', height: 220, justifyContent: 'center'}}>
                            <Icon
                                reverse
                                name='play-arrow'
                                color='#9c27b0'
                                size={32}
                                onPress={() => alert('run')} />
                        </View>
                        <CalibrationInput val={19} limit={20} />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        ...ifIphoneX({
            paddingTop: getStatusBarHeight() + 10,
        }, {

            })
    }
})
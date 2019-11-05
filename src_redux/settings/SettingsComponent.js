import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Button} from 'react-native';
import {Appbar} from 'react-native-paper';


//import { Icon } from 'react-native-elements';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import i18n from '../../resources/locales/i18n';
import {duration} from '@material-ui/core/styles';


class SettingsComponent extends Component {

    componentDidMount(): void {
        console.log(this.props);
    }

    changeInterval(interval) {
        this.props.setInterval(interval.length === 0 ? 0 : parseInt(interval));

    }

    changeDuration(duration) {
        console.log(duration);
        this.props.setDuration(duration.length === 0 ? 0 : parseInt(duration));

    }

    changeLoops(loops) {
        this.props.setLoops(loops.length === 0 ? 0 : parseInt(loops));
    }


    render() {
        return (
            <View style={[styles.container]}>
                <Appbar>
                    <Appbar.Action
                        icon="menu"
                        size={32}
                        onPress={() => this.props.navigation.openDrawer()}
                    />
                    <Appbar.Content
                        style={{position: 'absolute', left: 40}}
                        title="Explore-it"
                        size={32}
                    />
                    <Appbar.Content
                        style={{position: 'absolute', right: 0}}
                        title={this.props.BLEConnection.device.name}
                        subtitle={i18n.t('Settings.device')}
                        size={32}
                    />
                </Appbar>

                <View style={{flex: 1, padding: 40}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.settings')}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Text style={{height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.interval')}
                        </Text>
                        <TextInput
                            style={{
                                padding: 5,
                                width: 60,
                                height: 50,
                                borderWidth: 1,
                                borderColor: 'grey',
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}
                            keyboardType="numeric"
                            textAlign={'center'}
                            mode="outlined"
                            editable={this.props.BLEConnection.isConnected}
                            onChangeText={text => this.changeInterval(text)}
                            value={this.props.Settings.interval.toString()}
                        />
                        <Text style={{height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.interval-unit')}
                        </Text>
                    </View>

                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.learn')}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Text style={{height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.duration')}
                        </Text>
                        <TextInput
                            style={{
                                padding: 5,
                                width: 60,
                                height: 50,
                                borderWidth: 1,
                                borderColor: 'grey',
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}
                            keyboardType="numeric"
                            textAlign={'center'}
                            mode="outlined"
                            onChangeText={text => this.changeDuration(text)}
                            value={this.props.Settings.duration.toString()}
                        />
                        <Text style={{height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.duration-unit')}
                        </Text>
                    </View>

                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.play')}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Text style={{height: 50, width: '20%', marginLeft: 40}}>
                            {i18n.t('Settings.loops')}
                        </Text>
                        <TextInput
                            style={{
                                padding: 5,
                                width: 60,
                                height: 50,
                                borderWidth: 1,
                                borderColor: 'grey',
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}
                            keyboardType="numeric"
                            textAlign={'center'}
                            mode="outlined"
                            onChangeText={text => this.changeLoops(text)}
                            value={this.props.Settings.loops.toString()}
                        />
                    </View>
                </View>
            </View>
        )
            ;
    }
}

//                    <Text style={{marginTop: 20, fontSize: 16, fontWeight: 'bold'}}>
//                        {i18n.t('SettingsComponent.calibrate')}
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
        ...ifIphoneX(
            {
                paddingTop: getStatusBarHeight() + 10,
            },
            {},
        ),
    },
});

export default SettingsComponent;

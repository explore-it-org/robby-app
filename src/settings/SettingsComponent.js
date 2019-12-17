import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {Appbar} from 'react-native-paper';


//import { Icon } from 'react-native-elements';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import i18n from '../../resources/locales/i18n';
import {Picker} from 'native-base';
import Toast from '../controls/Toast';
import {toggleSettings} from './SettingsAction';


class SettingsComponent extends Component {

    state = {
        lastUpdate: 0,
    };


    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        let prev = prevProps.Settings.lastUpdate;
        let now = this.props.Settings.lastUpdate;
        if (prev !== now) {
            Toast.show(i18n.t('Settings.updated'));
        }
    }

    actuallyChangeInterval(interval) {
        if (this.state.lastUpdate === interval) {
            this.props.setIntervalAndSendToRobby(interval.length === 0 ? 0 : parseInt(interval));
        }
    }

    changeInterval(interval) {
        this.props.setInterval(interval);
        this.setState({lastUpdate: interval});
        setTimeout(() => {
            this.actuallyChangeInterval(interval);
        }, 400);


    }

    changeDuration(duration) {
        if (duration) {
            this.props.setDuration(parseInt(duration));
        } else {
            this.props.setDuration();
        }
    }


    renderIntervalField = () => {
        if (this.props.BLEConnection.isConnected) {
            return (
                <View>
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
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}
                            keyboardType="numeric"
                            textAlign={'center'}
                            mode="outlined"
                            onChangeText={text => this.changeInterval(text)}
                            value={this.props.Settings.interval.toString()}
                        />
                        <Text style={{height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.interval-unit')}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    render() {
        this.items = Object.assign([], []);
        Object.values(i18n.translations).forEach(
            k => this.items.push(<Picker.Item key={k.languageTag} label={k.language} value={k.languageTag}
                                              testID={k.language}/>),
        );
        return (
            <View style={[styles.container]}>
                <Appbar>
                    <Appbar.Action
                        icon="close"
                        size={32}
                        onPress={() => this.props.toggleSettings()}
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
                            onFocus={() => {
                                this.changeDuration('');
                            }}
                            onChangeText={text => this.changeDuration(text)}
                            value={this.props.Settings.duration.toString()
                            }
                        />
                        <Text style={{height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.duration-unit')}
                        </Text>
                    </View>
                    {this.renderIntervalField()}
                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingBottom: 15}}>
                        {i18n.t('Settings.language')}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Picker
                            style={{
                                padding: 5,
                                width: 60,
                                height: 50,
                                backgroundColor: 'white',
                                justifyContent: 'center',
                            }}
                            selectedValue={this.props.Settings.language}
                            textAlign={'center'}
                            onValueChange={(itemValue, itemIndex) => {
                                this.props.setLanguage(itemValue);
                                i18n.locale = itemValue;
                            }}>
                            {this.items}
                        </Picker>
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

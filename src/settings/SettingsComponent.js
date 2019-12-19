import React, {Component} from 'react';
import {Image, Linking, Picker, SafeAreaView, StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {Appbar} from 'react-native-paper';


//import { Icon } from 'react-native-elements';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import i18n from '../../resources/locales/i18n';
import Toast from '../controls/Toast';
import {toggleSettings} from './SettingsAction';
import SettingsContainer from './SettingsContainer';
import NumericInput from '../controls/NumericInput';


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
                <View style={{flex: 0, marginTop: 25}}>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Text style={{fontSize: 16, height: 50, width: '20%', marginLeft: 10, fontWeight: 'bold'}}>
                            {i18n.t('Settings.interval')}
                        </Text>
                        <View style={{width: '20%', height: 50, marginTop: -12.5, marginLeft: 10}}>
                            <NumericInput
                                onchange={text => this.changeInterval(text)}
                                val={this.props.Settings.interval !== undefined ? this.props.Settings.interval.toString() : ''}
                            />
                        </View>
                        <Text style={{height: 50, marginLeft: 20}}>
                            {i18n.t('Settings.interval-unit')}
                        </Text>
                    </View>
                    <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}}/>
                </View>
            );
        }
    };

    render() {
        this.items = Object.assign([], []);
        let hr = <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}}/>;
        Object.values(i18n.translations).forEach(
            k => this.items.push(<Picker.Item key={k.languageTag} label={k.language} value={k.languageTag}
                                              testID={k.language}/>),
        );

        let deviceName = this.props.BLEConnection.isConnected ?
            <Appbar.Content style={{position: 'absolute', right: 40}}
                            title={this.props.BLEConnection.device.name}
                            size={32}/>
            :
            <Appbar.Content style={{position: 'absolute', right: 40}}
                            title={i18n.t('Programming.noConnectedDevice')}
                            size={32}/>;

        return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor: '#2E5266',
            }}>
                <View style={[styles.container]}>
                    <Appbar>
                        <Appbar.Action
                            icon="close"
                            size={26}
                            onPress={() => this.props.toggleSettings()}
                        />
                        <Appbar.Content
                            style={{position: 'absolute', left: 40}}
                            title="Explore-it"
                            size={32}
                        />
                        {deviceName}
                    </Appbar>

                    <View style={{flex: 0, padding: 10, marginTop: 25}}>

                        <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>

                            <View>

                                <View style={{flexDirection: 'row', marginBottom: 10}}>
                                    <Text style={{
                                        fontSize: 16,
                                        height: 50,
                                        width: '20%',
                                        marginLeft: 10,
                                        fontWeight: 'bold',
                                    }}>
                                        {i18n.t('Settings.duration')}
                                    </Text>
                                    <View style={{width: '20%', height: 50, marginTop: -12.5, marginLeft: 10}}>
                                        <NumericInput
                                            onchange={text => this.changeDuration(text)}
                                            val={this.props.Settings.duration !== undefined ? this.props.Settings.duration.toString() : ''}
                                        />
                                    </View>
                                    <Text style={{height: 50, marginLeft: 20}}>
                                        {i18n.t('Settings.duration-unit')}
                                    </Text>
                                </View>


                                {hr}

                                {this.renderIntervalField()}

                                <Text style={{
                                    fontSize: 16,
                                    marginLeft: 10,
                                    marginTop: 25,
                                    fontWeight: 'bold',
                                    paddingBottom: 15,
                                }}>
                                    {i18n.t('Settings.language')}
                                </Text>
                                <View style={{flexDirection: 'row', marginBottom: 10}}>

                                    <Picker
                                        style={{
                                            padding: 5,
                                            marginRight: 10,
                                            flex: 1,
                                            height: 50,
                                            backgroundColor: 'white',
                                            justifyContent: 'center',
                                            marginLeft: 10,
                                            borderRadius: 5,
                                            overflow: 'hidden',
                                        }}
                                        selectedValue={this.props.Settings.language}
                                        textAlign={'center'}
                                        onValueChange={(itemValue, itemIndex) => {
                                            this.props.setLanguage(itemValue);
                                            i18n.locale = itemValue;
                                            this.props.forceReloadBlocks();
                                        }}>
                                        {this.items}
                                    </Picker>
                                </View>
                                {hr}


                            </View>

                            <View style={{}}>

                                <View style={{
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    paddingVertical: 100,
                                }}>
                                    <Image style={{alignSelf: 'flex-end', opacity: 0.7}}
                                           source={require('../../resources/icon/logo.png')}/>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
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
    },
});

export default SettingsComponent;

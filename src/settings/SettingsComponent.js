import React, {Component} from 'react';
import {
    Alert,
    Image,
    Linking,
    Picker,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityComponent,
    View,
} from 'react-native';
import {Text, TextInput} from 'react-native';
import {Appbar} from 'react-native-paper';
import GLOBAL from '../utillity/Global';


//import { Icon } from 'react-native-elements';
import {getStatusBarHeight, ifIphoneX} from 'react-native-iphone-x-helper';
import i18n from '../../resources/locales/i18n';
import Toast from '../controls/Toast';
import {setDuration, setInterval, toggleSettings} from './SettingsAction';
import SettingsContainer from './SettingsContainer';
import NumericInput from '../controls/NumericInput';


class SettingsComponent extends Component {

    state = {
        lastUpdate: 0,
        duration: this.props.Settings.duration.toString(),
        interval: this.props.Settings.interval.toString(),
    };


    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        let prev = prevProps.Settings.lastUpdate;
        let now = this.props.Settings.lastUpdate;
        if (prev !== now) {
            Toast.show(i18n.t('Settings.updated'));
        }
    }

    actuallyChangeInterval() {
        let newInterval = parseInt(this.state.interval);
        if (!isNaN(newInterval)) {
            this.props.setIntervalAndSendToRobby(newInterval);
        } else {
            this.setState({duration: this.props.Settings.interval.toString()});
        }
    }

    changeInterval(interval) {
        let newText = '';
        let numbers = '0123456789';
        if (parseInt(interval) > 50) {
            Alert.alert('error', 'to big');
            newText = '50';
        } else {
            for (let i = 0; i < interval.length; i++) {
                if (numbers.indexOf(interval[i]) > -1) {
                    newText = newText + interval[i];
                } else {
                    Alert.alert(i18n.t('SpeedInput.invalidEntry'), i18n.t('SpeedInput.invalidEntryMessage'));
                }
            }
        }
        this.setState({interval: newText});
    }

    changeDuration(duration) {
        let newText = '';
        let numbers = '0123456789';
        if (parseInt(duration) > 80) {
            Alert.alert('error', 'to big');
            newText = '80';
        } else {
            for (let i = 0; i < duration.length; i++) {
                if (numbers.indexOf(duration[i]) > -1) {
                    newText = newText + duration[i];
                } else {
                    Alert.alert(i18n.t('SpeedInput.invalidEntry'), i18n.t('SpeedInput.invalidEntryMessage'));
                }
            }
        }
        this.setState({duration: newText});
    }

    actuallyChangeDuration() {
        let newDuration = parseInt(this.state.duration);
        if (!isNaN(newDuration)) {
            this.props.setDuration(newDuration);
        } else {
            this.setState({duration: this.props.Settings.duration.toString()});
        }

    }


    renderIntervalField = () => {
        if (!this.props.BLEConnection.isConnected) {
            return (
                <View style={{marginTop: 10}}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginBottom: 10,
                    }}>
                        <View style={{flex: 1}}/>
                        <View style={{flex: 4, alignSelf: 'center'}}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}>
                                {i18n.t('Settings.interval')}
                            </Text>
                        </View>
                        <View style={{flex: 4, alignSelf: 'center'}}>
                            <TextInput
                                style={styles.input}
                                keyboardType='numeric'
                                onChangeText={(text) => this.changeInterval(text)}
                                textAlign={'center'}
                                value={this.state.interval}
                                onFocus={() => {
                                    this.setState({interval: ''});
                                }}
                                onBlur={() => {
                                    this.actuallyChangeInterval();
                                }}
                            />
                        </View>
                        <View style={{flex: 6, alignSelf: 'center', marginLeft: 5}}>
                            <Text style={{}}>
                                {i18n.t('Settings.interval-unit')}
                            </Text>
                        </View>
                        <View style={{flex: 4}}/>
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

                        <View>
                            <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>


                                <View>

                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        marginBottom: 10,
                                    }}>
                                        <View style={{flex: 1}}/>
                                        <View style={{flex: 4, alignSelf: 'center'}}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                            }}>
                                                {i18n.t('Settings.duration')}
                                            </Text>
                                        </View>
                                        <View style={{flex: 4, alignSelf: 'center'}}>
                                            <TextInput
                                                style={styles.input}
                                                keyboardType='numeric'
                                                onChangeText={(text) => this.changeDuration(text)}
                                                textAlign={'center'}
                                                value={this.state.duration}
                                                onFocus={() => {
                                                    this.setState({duration: ''});
                                                }}
                                                onBlur={() => {
                                                    this.actuallyChangeDuration();
                                                }}
                                            />
                                        </View>
                                        <View style={{flex: 6, alignSelf: 'center', marginLeft: 5}}>
                                            <Text style={{}}>
                                                {i18n.t('Settings.duration-unit')}
                                            </Text>
                                        </View>
                                        <View style={{flex: 4}}/>
                                    </View>
                                    {hr}


                                    {this.renderIntervalField()}

                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    marginVertical: 10,
                                }}>
                                    <View style={{flex: 1}}/>
                                    <View style={{flex: 4, alignSelf: 'center'}}>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: 'bold',
                                        }}>
                                            {i18n.t('Settings.language')}
                                        </Text>
                                    </View>
                                    <View style={{flex: 10, alignSelf: 'center'}}>
                                        <Picker
                                            style={styles.input}
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
                                    <View style={{flex: 4}}/>
                                </View>
                                {hr}

                            </View>

                            <View style={{}}>
                                <TouchableOpacity
                                    onPress={() => Linking.openURL('https://www.explore-it.org/').catch((err) => console.error('An error occurred', err))}
                                >
                                    <View style={{
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        paddingTop: 100,
                                    }}>
                                        <Image style={{alignSelf: 'flex-end', opacity: 0.7}}
                                               source={require('../../resources/icon/logo.png')}/>
                                    </View>

                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            flexDirection: 'row',
                                            marginTop: 40,
                                        }}>
                                        <Text
                                            style={{fontFamily: 'Jost-Medium', fontSize: 20, color: 'blue'}}
                                        >Explore-it </Text>
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                    }}>
                                    <Text
                                        style={{fontFamily: 'Jost-Thin', color: 'grey'}}>v{GLOBAL.VERSION}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    input: {
        fontFamily: 'Jost-Book',
        borderRadius: 5,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
});

export default SettingsComponent;

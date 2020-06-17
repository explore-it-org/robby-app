import React, {Component} from 'react';
import {
    Alert,
    Image,
    SafeAreaView, ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Platform,
    Linking,
} from 'react-native';
import {Picker} from '@react-native-community/picker';
import {Text, TextInput} from 'react-native';
import {Appbar} from 'react-native-paper';
import GLOBAL from '../utillity/Global';
import i18n from '../../resources/locales/i18n';
import Toast from '../controls/Toast';
import LanguageInput from '../controls/LanguageInput';
import CustomIcon from '../utillity/CustomIcon';


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
            Toast.show(i18n.t('Settings.updatedMessage'), 2000);
        }
    }

    actuallyChangeInterval() {
        let newInterval = parseInt(this.state.interval);
        if (!isNaN(newInterval)) {
            this.props.setIntervalAndSendToRobby(newInterval);
        } else {
            this.setState({interval: this.props.Settings.interval.toString()});
        }
    }

    changeInterval(interval) {
        let newText = '';
        let numbers = '0123456789';
        if (parseInt(interval) > 50) {
            Alert.alert(i18n.t('Settings.enteredIntervalTooBigTitle'), i18n.t('Settings.enteredIntervalTooBigMessage'));
            newText = '50';
        }else if(parseInt(interval) === 0){
                newText = '1';
        } else {
            for (let i = 0; i < interval.length; i++) {
                if (numbers.indexOf(interval[i]) > -1) {
                    newText = newText + interval[i];
                } else {
                    Alert.alert(i18n.t('Settings.invalidIntervalTitle'), i18n.t('Settings.invalidIntervalMessage'));
                }
            }
        }
        this.setState({interval: newText});
    }

    changeDuration(duration) {
        let newText = '';
        let numbers = '0123456789';
        if (parseInt(duration) > 80) {
            Alert.alert(i18n.t('Settings.enteredDurationTooBigTitle'), i18n.t('Settings.enteredDurationTooBigMessage'));
            newText = '80';
        }else if(parseInt(duration) === 0){
            newText = '1';
        } else {
            for (let i = 0; i < duration.length; i++) {
                if (numbers.indexOf(duration[i]) > -1) {
                    newText = newText + duration[i];
                } else {
                    Alert.alert(i18n.t('Settings.invalidDurationMessage'), i18n.t('Settings.invalidDurationMessage'));
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

    renderPicker = () => {
        if(Platform.OS === 'ios'){
            return(
            <LanguageInput 
                pickerItems={this.languages}
                selectedItem={this.props.Settings.language}
                onValueChange={(itemValue) => {
                    this.props.setLanguage(itemValue);
                    i18n.locale = itemValue;
                    this.props.forceReloadBlocks();
                }}
            ></LanguageInput>)
        }else{
            return (
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
            )
        }
    }
    renderIntervalField = () => {
        if (this.props.BLEConnection.isConnected) {
            return (
                <View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginBottom: 5,
                    }}>
                        <View style={{flex: 1}}/>
                        <View style={{flex: 17, alignSelf: 'center'}}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}>
                                {i18n.t('Settings.interval')}
                            </Text>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginBottom: 10,
                    }}>
                        <View style={{flex: 1}}/>
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
                        <View style={{flex: 11, alignSelf: 'center', marginLeft: 5}}>
                            <Text style={{}}>
                                {i18n.t('Settings.interval-unit')}
                            </Text>
                        </View>
                        <View style={{flex: 2}}/>
                    </View>
                    <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}}/>
                </View>
            );
        }
    };

    renderRobotVersion(){
        if (this.props.BLEConnection.isConnected) {
        let hr = <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}}/>;
        return (
            <View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginVertical: 10,
            }}>
                <View style={{flex: 1}}/>
                <View style={{flex: 5, alignSelf: 'center'}}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}>
                        {i18n.t('Settings.robotVersion')}
                    </Text>
                </View>
                <View style={{flex: 10, alignSelf: 'center'}}>
                    <Text>
                    VER {this.props.BLEConnection.device.version.toString().padStart(3,'0')}
                    </Text>
                </View>
                <View style={{flex: 2}}/>
            </View>
            {hr}
            </View>
            )
        }
    }

    render() {
        this.items = Object.assign([], []);
        let hr = <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1}}/>;
        Object.values(i18n.translations).forEach(
            k => this.items.push(<Picker.Item key={k.languageTag} label={k.language} value={k.languageTag}
                                              testID={k.language}/>),
        );
        this.languages = Object.assign([], []);
        Object.values(i18n.translations).forEach(
            k => this.languages.push({value: k.languageTag, text: k.language}),
        );


        let deviceName = this.props.BLEConnection.isConnected ?
            <Appbar.Content style={{position: 'absolute', right: 80}}
                            title={this.props.BLEConnection.device.name.substr(this.props.BLEConnection.device.name.length - 5)}
                            size={32}/>
            :
            <Appbar.Content style={{position: 'absolute', right: 80}}
                            title={i18n.t('Programming.noConnectedDevice')}
                            size={32}/>;

        return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor: 'white'
                //backgroundColor: '#2E5266',
            }}>
                <ScrollView style={{
                    flex: 1,
                    backgroundColor: 'white',

                }}>
                    <View style={[styles.container]}>
                        <Appbar>
                        <Appbar.Action
                        icon={({size, color}) => (
                            (this.props.BLEConnection.isConnected) ?
                                <CustomIcon name="bluetooth" size={size} color={color}/> :
                                <CustomIcon name="bluetooth-disabled" size={size} color={color}/>
                        )}
                        //{(this.props.BLEConnection.isConnected) ? 'bluetooth-connected' : 'bluetooth'}
                        style={{position: 'absolute', right: 40}}
                        size={26}
                        disabled={true}
                        onPress={() => {
                        }}/>
                            <Appbar.Action
                                icon="close"
                                size={26}
                                onPress={() => this.props.toggleSettings()}
                                style={{position: 'absolute', right: 0}}
                            />
                            <Appbar.Content
                                style={{position: 'absolute', left: 80}}
                                title="Robotics"
                                size={32}
                            />
                            <Image style={{width: 80, resizeMode: 'contain', left: 10}} source={require('../../resources/icon/logo.png')}></Image>
                            {deviceName}
                        </Appbar>

                        <View style={{flex: 0, padding: 10, marginTop: 10}}>

                            <View>
                                <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <View>
                                    {this.renderIntervalField()}
                                    <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            marginTop: 10,
                                            marginBottom: 5
                                        }}>
                                            <View style={{flex: 1}}/>
                                            <View style={{flex: 17, alignSelf: 'center'}}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontWeight: 'bold',
                                                }}>
                                                    {i18n.t('Settings.duration')}
                                                </Text>
                                            </View>
                                    </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            marginBottom: 10
                                        }}>
                                            <View style={{flex: 1}}/> 
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
                                            <View style={{flex: 11, alignSelf: 'center', marginLeft: 5}}>
                                                <Text style={{}}>
                                                    {i18n.t('Settings.duration-unit')}
                                                </Text>
                                            </View>
                                            <View style={{flex: 2}}/>
                                        </View>
                                        {hr}

                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        marginVertical: 10,
                                    }}>
                                        <View style={{flex: 1}}/>
                                        <View style={{flex: 5, alignSelf: 'center'}}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                            }}>
                                                {i18n.t('Settings.language')}
                                            </Text>
                                        </View>
                                        <View style={{flex: 10, alignSelf: 'center'}}>
                                            {this.renderPicker()}
                                        </View>
                                        <View style={{flex: 2}}/>
                                    </View>
                                    {hr}
                                    {this.renderRobotVersion()}
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(i18n.t("Settings.websiteURL")).catch((err) => console.error('An error occurred', err))}
                            >
                                <View style={{
                                        justifyContent: 'center',
                                        flexDirection: 'row'
                                    }}>
                                <Image style={{width: 160, resizeMode: 'contain'}} source={require('../../resources/icon/logo.png')}></Image>
                                </View>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        marginTop: 10,
                                    }}>
                                    <Text
                                        style={{fontFamily: 'Jost-Medium', fontSize: 20, color: 'blue'}}>
                                        www.explore-it.org
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                }}>
                            </View>

                            <View
                                style={{
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                }}>
                                <Text
                                    style={{fontFamily: 'Jost-Thin', marginTop: 10, marginBottom: 20}}>v{GLOBAL.VERSION}</Text>
                            </View>
                        </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomView: {
        width: '100%',
        height: 50,
        backgroundColor: '#EE5407',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', //Here is the trick
        bottom: 0, //Here is the trick
    },
    input: {
        fontFamily: 'Jost-Book',
        justifyContent: 'center',
        height: 50,
        borderRadius: 5,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
});

export default SettingsComponent;

import { Component } from 'react';
import {
    StyleSheet, View, TextInput,
    FlatList, TouchableOpacity,
    Image, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { FAB } from 'react-native-paper';
import React from 'react';
import SpeedInput from '../../controls/SpeedInput';
import i18n from '../../../resources/locales/i18n';
import CustomIcon from '../../utillity/CustomIcon';
import { Text } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';


export default class StepProgrammingComponent extends Component {


    render() {
        let select_controls;
        if (this.props.Instruction.selectedIndex >= 0) {
            select_controls =
                <View style={{ flexDirection: 'row', marginRight: 20 }}>

                    <FAB
                        //disabled={this.props.Instruction.selectedIndex === 0} disabling move up and down button produces unexpected behaviour
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="up" size={size} color={color} />
                        )}
                        onPress={() => {
                            this.props.moveUp();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="down" size={size} color={color} />
                        )}
                        onPress={() => {
                            this.props.moveDown();
                        }}
                    />
                    <FAB
                        disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="deletelight" size={size} color={color} />
                        )}
                        onPress={() => {
                            this.props.deleteInstruction();
                        }}
                    />
                </View>;
        }
        let step_content;
        if (this.props.BLE.device.isDownloading) {
            step_content =
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color='#2E5266' />
                </View>;
        }

        // TODO remove all style

        return (
            <View style={[styles.view, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 8, flexDirection: 'row' }}>
                        <TextInput
                            placeholder={i18n.t('Programming.programName')}
                            maxLength={30}
                            style={{
                                textAlign: 'center',
                                fontSize: 16,
                                flex: 2,
                                height: 40,
                                borderBottomColor: '#2E5266',
                                borderBottomWidth: 1.0,
                                fontFamily: 'Jost-Medium',
                            }}
                            value={this.props.Instruction.ActiveProgram.name} onChangeText={text => {
                                this.props.setName(text);
                            }} />
                    </View>
                    <View style={{ flex: 1 }} />
                </View>


                <View style={{ width: '100%', flexDirection: 'row', paddingBottom: 30 }}>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-start' }}>
                        <Image source={require('../../../resources/icon/wheeldarkx.png')}
                            style={{ width: 20, height: 20 }} />
                        <View style={{ textAlign: 'center', marginLeft: 5 }}>
                            <Text style={{ fontSize: 16 }}>{i18n.t('MainTab.left')}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 4, textAlign: 'center' }}>
                        <Text style={{ textAlign: 'center', fontSize: 16 }}>{i18n.t('MainTab.speed')}</Text>
                    </View>


                    <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <View style={{ marginRight: 5 }}>
                            <Text style={{ fontSize: 16 }}>{i18n.t('MainTab.right')}</Text>
                        </View>
                        <Image source={require('../../../resources/icon/wheeldarkx.png')}
                            style={{ width: 20, height: 20 }} />
                    </View>
                    <View style={{ flex: 1 }} />

                </View>

                {step_content}
                <ScrollView>
                    {/* This FlatList is Wrapped in a ScrollView to fix an Issue with the Android Keyboard 
                         instantly loosing focus on tapping into a textfield in the lower part of the list */}
                    <FlatList
                        data={this.props.Instruction.ActiveProgram.steps}
                        //extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        ref={ref => { this.blockList = ref; this.previousContentHeight = 0 }}
                        renderItem={({ item, index }) => (

                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => {
                                    if (this.props.Instruction.selectedIndex === parseInt(index)) {
                                        this.props.setActiveIndex(-1);
                                    } else {
                                        this.props.setActiveIndex(parseInt(index));
                                    }
                                }}>
                                <View key={index}
                                    style={parseInt(index) === this.props.Instruction.selectedIndex ? styles.selected_row : styles.row}>
                                    <SpeedInput
                                        style={{ flex: 1 }}
                                        onchange={(text) => {
                                            this.props.setActiveIndex(-1);
                                            this.props.changeLeftSpeed(parseInt(text), parseInt(index));
                                        }}
                                        val={item.left}
                                        val1={100 - item.left}
                                        col1={'#FFFFFF'}
                                        val2={item.left}
                                        col2={'#D6F5EE'}
                                        left={true}
                                    />
                                    <SpeedInput
                                        style={{ flex: 1 }}
                                        onchange={(text) => {
                                            this.props.setActiveIndex(-1);
                                            this.props.changeRightSpeed(parseInt(text), parseInt(index));
                                        }}
                                        val={item.right}
                                        val1={item.right}
                                        col1={'#CEE0F4'}
                                        val2={100 - item.right}
                                        col2={'#FFFFFF'}
                                        left={false}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </ScrollView>
                <View style={styles.fabLine}>
                    {select_controls}
                    <FAB
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="plus" size={size} color={color} />
                        )}
                        onPress={() => {
                            this.props.addInstruction();
                            //this.blockList.scrollToEnd({animated: true});
                        }}
                    />

                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    col: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        margin: 5,
    },
    row: {
        height: 60,
        margin: 0,
        flex: 1,
        flexDirection: 'row',
    },
    selected_row: {
        height: 60,
        margin: 0,
        flex: 1,
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0,
    },
    view: {
        marginBottom: 55,
        backgroundColor: 'white',
    },
    fab: {
        margin: 7,
    },
    delete: {},
    move_up: {},
    move_down: {},
    fabLine: {
        position: 'absolute',
        bottom: 18,
        flex: 1,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

});


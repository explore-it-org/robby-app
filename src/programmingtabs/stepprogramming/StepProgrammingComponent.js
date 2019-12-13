import {Component} from 'react';
import {
    StyleSheet, View, Text, TextInput,
    FlatList,
    TouchableOpacity,
    Platform,
    ScrollView, Alert, Image,
} from 'react-native';
import {FAB} from 'react-native-paper';
import React from 'react';
import SpeedInput from '../../controls/SpeedInput';
import i18n from '../../../resources/locales/i18n';
import CustomIcon from '../../utillity/CustomIcon';


export default class StepProgrammingComponent extends Component {


    render() {
        let select_controls;
        if (this.props.Instruction.selectedIndex >= 0) {
            select_controls =
                <View>
                    <FAB
                        disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
                        style={styles.delete}
                        icon={({size, color}) => (
                            <CustomIcon name="deletelight" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.deleteInstruction();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex === 0} disabling move up and down button produces unexpected behaviour
                        style={styles.move_up}
                        icon={({size, color}) => (
                            <CustomIcon name="up" size={size} color={color}/>
                        )}
                        onPress={() => {
                            console.log('move down clicked');
                            this.props.moveUp();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
                        style={styles.move_down}
                        icon={({size, color}) => (
                            <CustomIcon name="down" size={size} color={color}/>
                        )}
                        onPress={() => {
                            console.log('move up clicked');
                            this.props.moveDown();
                        }}
                    />
                </View>;
        }

        // TODO remove all style

        return (
            <View style={[styles.view, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
                <View style={{marginTop: 30, marginBottom: 20, height: 40, width: '80%', flexDirection: 'row'}}>
                    <TextInput
                        placeholder={i18n.t('Programming.programName')}
                        style={{
                            textAlign: 'center',
                            flex: 2,
                            height: 40,
                            borderBottomColor: '#828282',
                            borderBottomWidth: 1.0,
                        }} value={this.props.Instruction.ActiveProgram.name} onChangeText={text => {
                        this.props.setName(text);
                    }}/>
                </View>

                <View style={{marginTop: 30, height: 30, width: '100%', flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 35}}>
                        <Image source={require('../../../resources/icon/wheeldarkx.png')}
                               style={{width: 25, height: 25}}/>
                        <Text style={{textAlign: 'center', flex: 1}}>L</Text>
                    </View>
                    <Text style={{flex: 2, textAlign: 'center'}}>{i18n.t('MainTab.speed')}</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginRight: 35}}>
                        <Text style={{textAlign: 'center', flex: 1}}>R</Text>
                        <Image source={require('../../../resources/icon/wheeldarkx.png')}
                               style={{width: 25, height: 25}}/>
                    </View>

                </View>


                <ScrollView
                    style={{backgroundColor: 'white'}}
                    resetScrollToCoords={{x: 0, y: 0}}
                    scrollEnabled={true}>
                    <FlatList
                        data={this.props.Instruction.ActiveProgram.steps}
                        //extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => (
                            <TouchableOpacity
                                style={{width: '100%'}}
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
                                        style={{flex: 1}}
                                        onchange={(text) => {
                                            this.props.setActiveIndex(-1);
                                            this.props.changeLeftSpeed(parseInt(text), parseInt(index));
                                        }}
                                        val={item.left}
                                        val1={100 - item.left}
                                        col1={'#FFFFFF'}
                                        val2={item.left}
                                        col2={'#D6F5EE'}
                                    />
                                    <SpeedInput
                                        style={{flex: 1}}
                                        onchange={(text) => {
                                            this.props.setActiveIndex(-1);
                                            this.props.changeRightSpeed(parseInt(text), parseInt(index));
                                        }}
                                        val={item.right}
                                        val1={item.right}
                                        col1={'#CEE0F4'}
                                        val2={100 - item.right}
                                        col2={'#FFFFFF'}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </ScrollView>
                <View>
                    <FAB
                        style={styles.fab}
                        icon={({size, color}) => (
                            <CustomIcon name="plus" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.addInstruction();
                        }}
                    />
                </View>
                {select_controls}
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
        width: '100%',
        flexDirection: 'row',
    },
    selected_row: {
        height: 60,
        margin: 0,
        width: '100%',
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0,
    },
    view: {
        marginBottom: 55,
        backgroundColor: 'white',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: -200,
        bottom: 18,
    },
    delete: {
        position: 'absolute',
        margin: 16,
        right: -105,
        bottom: 18,
    },
    move_up: {
        position: 'absolute',
        margin: 16,
        right: -30,
        bottom: 18,
    },
    move_down: {
        position: 'absolute',
        margin: 16,
        right: 45,
        bottom: 18,
    },
});


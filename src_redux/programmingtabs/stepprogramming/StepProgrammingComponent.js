import {Component} from 'react';
import {
    StyleSheet, View, Text, TextInput,
    FlatList,
    TouchableOpacity,
    Platform,
    ScrollView,
} from 'react-native';
import {FAB} from 'react-native-paper';
import React from 'react';
import SpeedInput from '../../controls/SpeedInput';
import i18n from '../../../resources/locales/i18n';
import {changeLeftSpeed} from './ActiveProgramAction';


export default class StepProgrammingComponent extends Component {
    /*   state = {
           instructions: instructions,
           selected: -1, // id of currently selected row
           programName: '',
       };


       onChangeLeft(index, text) {
           updateLeftSpeed(index, parseInt(text));
           this.setState({
               selected: -1,
           });
       }

       onChangeRight(index, text) {
           updateRightSpeed(index, parseInt(text));
           this.setState({
               selected: -1,
           });
       }
   */
    render() {
        let select_controls;
        if (this.props.Instruction.selectedIndex >= 0) {
            select_controls =
                <View>
                    <FAB
                        disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
                        style={styles.delete}
                        icon="delete"
                        onPress={() => {
                            this.props.deleteInstruction();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex === 0} disabling move up and down button produces unexpected behaviour
                        style={styles.move_up}
                        icon="arrow-upward"
                        onPress={() => {
                            console.log('move down clicked');
                            this.props.moveUp();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
                        style={styles.move_down}
                        icon="arrow-downward"
                        onPress={() => {
                            console.log('move up clicked');
                            this.props.moveDown();
                        }}
                    />
                </View>;
        }

        return (
            <View style={[styles.view, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
                <View style={{marginTop: 30, marginBottom: 20, height: 40, width: '80%', flexDirection: 'row'}}>
                    <TextInput placeholder='Program name...' style={{
                        textAlign: 'center',
                        flex: 2,
                        height: 40,
                        borderBottomColor: '#828282',
                        borderBottomWidth: 1.0,
                    }} value={this.props.Instruction.ActiveProgram.name} onChangeText={text => {
                        this.props.setName(text);
                    }}/>
                </View>
                <View style={{marginTop: 30, height: 20, width: '100%', flexDirection: 'row'}}>
                    <Text style={{flex: 1, textAlign: 'center'}}>L</Text>
                    <Text style={{flex: 2, textAlign: 'center'}}>{i18n.t('MainTab.speed')}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}}>R</Text>
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
                                        onchange={(text) => {
                                            this.props.setActiveIndex(parseInt(index));
                                            this.props.changeLeftSpeed(parseInt(text));
                                        }}
                                        val={item.left}
                                        val1={100 - item.left}
                                        col1={'#FAFAFA'}
                                        val2={item.left}
                                        col2={'#E2F7F2'}
                                    />
                                    <SpeedInput
                                        onchange={(text) => {
                                            this.props.setActiveIndex(parseInt(index));
                                            this.props.changeRightSpeed(parseInt(text));
                                        }}
                                        val={item.right}
                                        val1={item.right}
                                        col1={'#E4F1FF'}
                                        val2={100 - item.right}
                                        col2={'#FAFAFA'}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </ScrollView>
                <View>
                    <FAB
                        style={styles.fab}
                        icon="add"
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


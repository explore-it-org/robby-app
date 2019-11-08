import {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Picker,
    Button,
} from 'react-native';
import {FAB} from 'react-native-paper';
import React from 'react';
import ProgramInput from '../../controls/ProgramInput';
import {Block} from '../../model/DatabaseModels';


export default class BlockProgrammingComponent extends Component {

    // TODO: Replace static text with translated Text!!


    render() {
        let items = [<Picker.Item label='Select a program'/>];
        this.props.Block.possibleChildren.forEach((p) => {
            items.push(<Picker.Item label={p.name} value={p.id}/>);
        });
        let select_controls;
        if (this.props.Block.selectedBlockIndex >= 0) {
            select_controls =
                <View>
                    <FAB
                        //disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
                        style={styles.delete}
                        icon="delete"
                        onPress={() => {
                            this.props.deleteBlock();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex === 0} disabling move up and down button produces unexpected behaviour
                        style={styles.move_up}
                        icon="arrow-upward"
                        onPress={() => {
                            console.log('move down clicked');
                            this.props.moveUpBlock();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
                        style={styles.move_down}
                        icon="arrow-downward"
                        onPress={() => {
                            console.log('move up clicked');
                            this.props.moveDownBlock();
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
                    }} value={this.props.Block.Active_Block.name} onChangeText={text => {
                        this.props.setBlockName(text);
                    }}/>
                </View>
                <ScrollView
                    style={{backgroundColor: 'white'}}
                    resetScrollToCoords={{x: 0, y: 0}}
                    scrollEnabled={true}>
                    <FlatList
                        data={this.props.Block.Active_Block.blocks}
                        //extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => (
                            <TouchableOpacity index={index}
                                //style={parseInt(index) === this.props.Block.selectedBlockIndex ? styles.selected_row : styles.row}
                                              onPress={() => {
                                                  this.props.setActiveBlockIndex(index);
                                              }}>

                                <ProgramInput index={index}
                                    //selected={this.props.Block.Active_Block.selectedBlockIndex}
                                              pickerItems={items}
                                              selectedProgram={34}
                                              onRepeatValueChange={(value) => {
                                                  //this.props.changeReps(value);
                                              }
                                              }
                                              onProgramSelectionChange={(value) => {
                                                  //TODO this.props.change refrenz
                                              }}

                                              val={this.props.Block.Active_Block.blocks[index].ref}></ProgramInput>

                            </TouchableOpacity>
                        )}/>
                </ScrollView>
                <View>
                    <FAB
                        style={styles.fab}
                        icon="add"
                        onPress={() => {
                            this.props.addBlock();
                        }}
                    />
                </View>
                {select_controls}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    row: {
        height: 60,
        margin: 0,
        width: '100%',
        flexDirection: 'row',
        alignContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: '#FAFAFA',
    },
    selected_row: {
        height: 60,
        margin: 0,
        width: '100%',
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0,
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: '#FAFAFA',
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
    numinput: {
        justifyContent: 'center',
        zIndex: 1,
        flexDirection: 'row',
        width: '30%',
        height: '70%',
    },
});

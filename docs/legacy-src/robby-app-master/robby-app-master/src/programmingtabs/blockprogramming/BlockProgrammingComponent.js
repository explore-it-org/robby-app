import { Component } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
} from 'react-native';
import { FAB } from 'react-native-paper';
import React from 'react';
import ProgramInput from '../../controls/ProgramInput';
import i18n from '../../../resources/locales/i18n';
import CustomIcon from '../../utillity/CustomIcon';
import RecycleProgrammingList from '../../controls/RecycleProgrammingList';
import { Text } from 'react-native-elements';
import { Program } from '../../model/DatabaseModels';

export default class BlockProgrammingComponent extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.Block.Active_Block.blocks.length - prevProps.Block.Active_Block.blocks.length === 1) {
            this.recycleProgrammingList.scrollToIndex();
        }
    }

    initList(ref) {
        this.blockList = ref;
    }

    renderProgramInput = (type, data, index, extendedState) => {
        return ( 
            <TouchableOpacity
                style={
                    data.index ===
                        this.props.Block.selectedBlockIndex
                        ? styles.selected_row
                        : styles.row
                }
                onPress={() => {
                    this.props.setActiveBlockIndex(data.index);
                }}>

                <ProgramInput
                    selected={this.props.Block.selectedBlockIndex}
                    pickerItems={extendedState.possibleChildren}
                    selectedProgram={data.item.ref || -1}
                    onRepeatValueChange={(value) => {
                        this.props.setActiveBlockIndex(-1);
                        this.props.changeReps(parseInt(value), data.index);
                    }}
                    onProgramSelectionChange={(value) => {
                        this.props.setActiveBlockIndex(-1);
                        this.props.changeSelectedID(value, data.index);
                    }}
                    val={data.item.rep}
                    />
            </TouchableOpacity>
        )
    }

    render() {
        let select_controls;
        if (this.props.Block.selectedBlockIndex >= 0) {
            select_controls =
                <View style={{ flexDirection: 'row', marginRight: 20 }}>

                    <FAB
                        disabled={this.props.Block.selectedBlockIndex === 0} 
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="up" size={size} color={color} />
                    )}
                        animated={false}
                        onPress={() => {
                            this.props.moveUpBlock();
                            this.recycleProgrammingList.scrollToIndex(this.props.Block.selectedBlockIndex - 1);
                        }}
                    />
                    <FAB
                        disabled={this.props.Block.selectedBlockIndex >= this.props.Block.Active_Block.blocks.length - 1}
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="down" size={size} color={color} />
                    )}
                        animated={false}
                        onPress={() => {
                            this.props.moveDownBlock();
                            this.recycleProgrammingList.scrollToIndex(this.props.Block.selectedBlockIndex + 1);
                        }}
                    />
                    <FAB
                        disabled={this.props.Block.Active_Block.blocks.length <= 1}
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="deletelight" size={size} color={color} />
                    )}
                        animated={false}
                        onPress={() => {
                            this.props.deleteBlock();
                            this.recycleProgrammingList.scrollToIndex(this.props.Block.selectedBlockIndex);
                        }}
                    />
                </View>;
        }

        // TODO remove all style elements
        return (
            <View
                style={[styles.view, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>

                <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0}>
                    <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 8, flexDirection: 'row' }}>
                            <TextInput
                                placeholder={i18n.t('Programming.programName')}
                                maxLength={30}
                                style={{
                                    fontFamily: 'Jost-Medium',
                                    fontSize: 16,
                                    textAlign: 'center',
                                    flex: 2,
                                    height: 40,
                                    borderBottomColor: '#2E5266',
                                    borderBottomWidth: 1.0,
                                }}
                                value={this.props.Block.Active_Block.name}
                                onChangeText={text => {
                                    this.props.setBlockName(text);
                                }} />
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: "center", paddingBottom: 15 }}>
                        <Text>{i18n.t('Programming.length')} {Program.flatten(this.props.Block.Active_Block).length}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: '100%' }}>
                        {this.props.Block.Active_Block.blocks.length > 0 ? <RecycleProgrammingList
                            ref={ref => this.recycleProgrammingList = ref}
                            data={this.props.Block.Active_Block.blocks}
                            renderItem={this.renderProgramInput}
                            selectedIndex={this.props.Block.selectedBlockIndex}
                            extendedState={{possibleChildren: this.props.Block.possibleChildren}}
                        /> : <View />}
                    </View>

                </KeyboardAvoidingView>
                <View style={styles.fabLine}>
                    {select_controls}
                    <FAB
                        style={styles.fab}
                        icon={({ size, color }) => (
                            <CustomIcon name="plus" size={size} color={color} />
                        )}
                        animated={false}
                        onPress={() => {
                            this.props.addBlock();
                        }}
                    />

                </View>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    row: {
        height: 60,
        margin: 0,
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#FAFAFA',
    },
    selected_row: {
        height: 60,
        margin: 0,
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1.0,
        paddingVertical: 10,
        alignContent: 'center',
        borderColor: '#d6d6d6',
        backgroundColor: '#FAFAFA',
    },
    view: {
        marginBottom: 55,
        backgroundColor: 'white',
        width: '100%'
    },
    fab: {
        margin: 7,
    },
    numinput: {
        justifyContent: 'center',
        zIndex: 1,
        flexDirection: 'row',
        width: '30%',
        height: '70%',
    },
    fabLine: {
        position: 'absolute',
        bottom: 18,
        flex: 1,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },




    container: {
        borderColor: 'grey',
        borderWidth: 1,
        padding: 15
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'stretch'
    },
    text: {
        fontSize: 18
    },
    headerFooterContainer: {
        padding: 10,
        alignItems: 'center'
    },
    clearButton: { backgroundColor: 'grey', borderRadius: 5, marginRight: 10, padding: 5 },
    optionContainer: {
        padding: 10,
        borderBottomColor: 'grey',
        borderBottomWidth: 1
    },
    optionInnerContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    box: {
        width: 20,
        height: 20,
        marginRight: 10
    }
});

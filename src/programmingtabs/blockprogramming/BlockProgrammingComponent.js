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
import i18n from '../../../resources/locales/i18n';
import CustomIcon from '../../utillity/CustomIcon';


export default class BlockProgrammingComponent extends Component {

    render() {
        this.items = Object.assign([], []);
        this.items = [<Picker.Item key={0} label={i18n.t('BlockProgramming.programSelectionPrompt')}/>];

        this.props.Block.possibleChildren.forEach((p) => {
            this.items.push(<Picker.Item key={p.id} label={p.name} value={p.id} testID={p.id}/>);
        });
        let select_controls;
        if (this.props.Block.selectedBlockIndex >= 0) {
            select_controls =
                <View style={{flexDirection: 'row', marginRight: 20}}>

                    <FAB
                        //disabled={this.props.Instruction.selectedIndex === 0} disabling move up and down button produces unexpected behaviour
                        style={styles.fab}
                        icon={({size, color}) => (
                            <CustomIcon name="up" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.moveUpBlock();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
                        style={styles.fab}
                        icon={({size, color}) => (
                            <CustomIcon name="down" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.moveDownBlock();
                        }}
                    />
                    <FAB
                        //disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
                        style={styles.fab}
                        icon={({size, color}) => (
                            <CustomIcon name="deletelight" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.deleteBlock();
                        }}
                    />
                </View>;
        }

        // TODO remove all style elements
        return (
            <View
                style={[styles.view, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>

                <View style={{flexDirection: 'row', paddingVertical: 20}}>
                    <View style={{flex: 1}}/>
                    <View style={{flex: 8, flexDirection: 'row'}}>
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
                            }}/>
                    </View>
                    <View style={{flex: 1}}/>
                </View>

                <ScrollView
                    style={{backgroundColor: 'white'}}
                    resetScrollToCoords={{x: 0, y: 0}}
                    scrollEnabled={true}
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{        
                        this.scrollView.scrollToEnd({animated: true});
                    }}
                    >
                    <FlatList
                        data={this.props.Block.Active_Block.blocks}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderProgramInput}/>
                </ScrollView>
                <View style={styles.fabLine}>
                    {select_controls}
                    <FAB
                        style={styles.fab}
                        icon={({size, color}) => (
                            <CustomIcon name="plus" size={size} color={color}/>
                        )}
                        onPress={() => {
                            this.props.addBlock();
                        }}
                    />

                </View>

            </View>
        );
    }

    renderProgramInput = ({item, index}) => (
        <TouchableOpacity index={index}
                          style={parseInt(index) === this.props.Block.selectedBlockIndex ? styles.selected_row : styles.row}
                          onPress={() => {
                              this.props.setActiveBlockIndex(index);
                          }}>
            <ProgramInput index={index}
                          selected={this.props.Block.Active_Block.selectedBlockIndex}
                          pickerItems={this.props.Block.possibleChildren}
                          selectedProgram={this.props.Block.Active_Block.blocks[index].ref}
                          onRepeatValueChange={(value) => {
                              this.props.setActiveBlockIndex(-1);
                              this.props.changeReps(parseInt(value), index);
                          }}
                          onProgramSelectionChange={(value) => {
                              this.props.setActiveBlockIndex(-1);
                              this.props.changeSelectedID(value, index);
                          }}
                          val={this.props.Block.Active_Block.blocks[index].rep}/>
        </TouchableOpacity>
    );

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
});
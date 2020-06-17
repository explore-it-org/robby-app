import {Component} from 'react';
import {StyleSheet, View, Alert, TextComponent} from 'react-native';
import React from 'react';
import NumericInput from './NumericInput';
import i18n from '../../resources/locales/i18n';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import {Text} from 'react-native-paper';
import {Button, FAB, IconButton} from 'react-native-paper';
import CustomIcon from '../utillity/CustomIcon';


export default class ProgramInput extends Component {

    state = {
        pickerOpen: false,
    };

    onChanged = (text) => {
        let newText = '';
        let numbers = '0123456789';
        if (parseInt(text) > 100) {
            Alert.alert(i18n.t('SpeedInput.invalidEntryTitle'), i18n.t('SpeedInput.invalidEntryMessage'));
            newText = '100';
        } else {
            for (let i = 0; i < text.length; i++) {
                if (numbers.indexOf(text[i]) > -1) {
                    newText = newText + text[i];
                } else {
                    Alert.alert(i18n.t('SpeedInput.invalidEntryTitle'), i18n.t('SpeedInput.invalidEntryMessage'));
                }
            }
        }
        this.props.onRepeatValueChange(parseInt(newText));
    };

    render() {
        const index = this.props.index;
        const selectItem = this.props.pickerItems.find(v => v.id === this.props.selectedProgram);
        const selectedText = selectItem === undefined ? i18n.t('BlockProgramming.programSelectionPrompt') : selectItem.name;
        return (

            <View key={this.props.selectedProgram}
                  style={
                      parseInt(index) === this.props.selected ?
                          styles.selected_row :
                          styles.row}>

                <View style={{flex: 1}}/>

                <View style={{flex: 1}}>
                    <NumericInput
                        onchange={this.props.onRepeatValueChange}
                        val={this.props.val === null ? 0 : this.props.val}/>
                </View>

                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                    <Text style={{alignSelf: 'center', fontSize: 16}}> x </Text>
                </View>


                <View style={{flex: 5, flexDirection: 'column', justifyContent: 'center'}}>
                    <Text style={{fontSize: 16}}>{selectedText}</Text>
                </View>

                <View style={{flex: 1, justifyContent: 'center'}}>
                    <IconButton
                        icon={({size, color}) => (
                            <CustomIcon name="edit" size={size} color={color}/>
                        )}
                        size={20}
                        color={'gray'}
                        onPress={() => this.setState({pickerOpen: true})}
                    />
                </View>

                <View style={{flex: 1}}/>

                <SinglePickerMaterialDialog
                    title={i18n.t("BlockProgramming.programSelectionPromptTitle")}
                    selected={selectedText}
                    items={this.props.pickerItems.map(v => ({
                        key: v.id,
                        label: v.name,
                        selected: v.name === selectedText,
                    }))}
                    visible={this.state.pickerOpen}
                    onCancel={() => {
                        this.setState({pickerOpen: false});
                    }}
                    onOk={
                        result => {
                            this.setState({pickerOpen: false});
                            if (result.selectedLabel) {
                                this.props.onProgramSelectionChange(this.props.pickerItems.find(v => v.name === result.selectedLabel).id);
                            }
                        }
                    }
                    colorAccent='#1E3888'
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    row: {
        width: '100%',
        flexDirection: 'row',
    },
    selected_row: {
        width: '100%',
        flexDirection: 'row',
    },
    numinput: {
        justifyContent: 'center',
        zIndex: 1,
        flexDirection: 'row',
        width: '30%',
        height: '70%',

    },

});
/*
this.props.selectedProgram}
 */

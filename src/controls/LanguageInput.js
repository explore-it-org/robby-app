import {Component} from 'react';
import {StyleSheet, View, Alert, Picker, TextComponent} from 'react-native';
import React from 'react';
import NumericInput from './NumericInput';
import i18n from '../../resources/locales/i18n';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import {Text} from 'react-native-paper';
import {Button, FAB, IconButton} from 'react-native-paper';
import CustomIcon from '../utillity/CustomIcon';
import { TouchableOpacity } from 'react-native-gesture-handler';


export default class LanguageInput extends Component {

    state = {
        pickerOpen: false,
    };

   

    render() {
        const index = this.props.index;
        const selectItem = this.props.pickerItems.find(v => v.value === this.props.selectedItem);
        const selectedText = selectItem === undefined ? i18n.t('BlockProgramming.programSelectionPrompt') : selectItem.text;
        return (

            <View key={this.props.selectedLanguage}
                  style={
                      parseInt(index) === this.props.selected ?
                          styles.selected_row :
                          styles.row}>
                <TouchableOpacity style={{flex:1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}} 
                    onPress={() => this.setState({pickerOpen: true})}>
                <View style={{}}>
                    <Text style={{fontSize: 16}}>{selectedText}</Text>
                </View>
                
                <View>
                    <IconButton
                        icon={({size, color}) => (
                            <CustomIcon name="edit" size={size} color={color}/>
                        )}
                        size={20}
                        color={'gray'}
                        onPress={() => this.setState({pickerOpen: true})}
                    />
                </View>
                </TouchableOpacity>
                

                <View style={{flex: 1}}/>

                <SinglePickerMaterialDialog
                    selected={selectedText}
                    items={this.props.pickerItems.map(v => ({
                        key: v.value,
                        label: v.text,
                        selected: v.text === selectedText,
                    }))}
                    visible={this.state.pickerOpen}
                    onCancel={() => {
                        this.setState({pickerOpen: false});
                    }}
                    onOk={
                        result => {
                            this.setState({pickerOpen: false});
                            console.log('okeay');
                            if (result.selectedLabel) {
                                this.props.onValueChange(this.props.pickerItems.find(v => v.text === result.selectedLabel).value);
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

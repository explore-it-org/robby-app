import React, { Component }  from 'react';
import { StyleSheet, View, Alert, TextComponent } from 'react-native';
import NumericInput from './NumericInput';
import i18n from '../../resources/locales/i18n';
import SingleProgramPickerMaterialDialog from '../materialdialog/SingleProgramPickerMaterialDialog';
import { Text, Colors } from 'react-native-paper';
import { Button, FAB, IconButton } from 'react-native-paper';
import CustomIcon from '../utillity/CustomIcon';
import { ProgramType } from '../model/DatabaseModels';
import { Image } from 'react-native-elements';


export default class ProgramInput extends Component {

    state = {
        pickerOpen: false,
    };

    onChanged = (text) => {
        let newText = '';
        let numbers = '0123456789';
            for (let i = 0; i < text.length; i++) {
                if (numbers.indexOf(text[i]) > -1) {
                    newText = newText + text[i];
                } else {
                    Alert.alert(i18n.t('SpeedInput.invalidEntryTitle'), i18n.t('SpeedInput.invalidEntryMessage'));
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

                <View style={{ flex: 1 }} />

                <View style={{ flex: 1 }}>
                    <NumericInput
                        onchange={this.onChanged}
                        val={this.props.val === null ? 0 : this.props.val} />
                </View>

                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ alignSelf: 'center', fontSize: 16 }}> x </Text>
                </View>


                <View style={{ flex: 5, flexDirection: 'column', justifyContent: 'center', alignContent: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'flex-start', alignItems:'center' }}>
                            {this.renderItemType(selectItem)}
                        </View>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'flex-start', alignItems:'center' }}>
                            <Text style={{ fontSize: 16 }}>{selectedText}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <IconButton
                        icon={({ size, color }) => (
                            <CustomIcon name="edit" size={size} color={color} />
                        )}
                        size={20}
                        color={'gray'}
                        onPress={() => {
                            this.setState({ pickerOpen: true });
                    }}

                    />
                </View>

                <View style={{ flex: 1 }} />

                <SingleProgramPickerMaterialDialog
                    title={i18n.t("BlockProgramming.programSelectionPromptTitle")}
                    selected={selectedText}
                    items={this.props.pickerItems.map(v => ({
                        key: v.id,
                        label: v.name,
                        selected: v.name === selectedText,
                        type: v.programType
                    }))}
                    visible={this.state.pickerOpen}
                    onCancel={() => {
                        this.setState({ pickerOpen: false });
                    }}
                    extraData={this.props.pickerItems}
                    onOk={
                        result => {
                            this.setState({ pickerOpen: false });
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
    renderItemType = (program) => {
        if(!program){
             // program = undefined
             return (
                <View></View>
            )
        } else if (program.programType === ProgramType.STEPS) {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', paddingRight: 10 }}>
                    <Image source={require('../../resources/icon/wheeldarkx.png')}
                        style={{
                            width: 20, height: 20,

                        }} />
                </View>
            )
        } else {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', paddingRight: 10 }}>
                    <CustomIcon name="step2" size={20} color={Colors.grey700} />
                </View>
            )
        }
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

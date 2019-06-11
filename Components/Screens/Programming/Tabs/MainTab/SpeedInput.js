import { Component } from "react";
import { StyleSheet, View, Alert } from "react-native";
import React from "react";
import NumericInput from "./NumericInput";
import i18n from '../../../../../locales/i18n'

export default class SpeedInput extends Component {
    // checks input changes of component NumericInput before upcalling and
    // updating application state
    onChanged = (text) => {
        let newText = '';
        let numbers = '0123456789';

        if (parseInt(text) > 100) {
            Alert.alert(i18n.t('SpeedInput.invalidEntry'), i18n.t('SpeedInput.invalidEntryMessage'));
            newText = '100';
        } else {
            for (let i = 0; i < text.length; i++) {
                if (numbers.indexOf(text[i]) > -1) {
                    newText = newText + text[i];
                } else {
                    Alert.alert(i18n.t('SpeedInput.invalidEntry'), i18n.t('SpeedInput.invalidEntryMessage'));
                }
            }
        }
        this.props.onchange(newText);
    }

    render() {
        const flexValLeft = isNaN(this.props.val1) ? 0 : this.props.val1;
        const flexValRight = isNaN(this.props.val2) ? 0 : this.props.val2;
        return (
            <View style={styles.outer}>
                <View style={styles.progressbar}>
                    <View style={{ backgroundColor: this.props.col1, flex: flexValLeft }} />
                    <View style={{ backgroundColor: this.props.col2, flex: flexValRight }} />
                </View>
                <View style={styles.numinput}>
                    <NumericInput onchange={this.onChanged} val={this.props.val} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    outer: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressbar: {
        position: 'absolute',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        zIndex: 0
    },
    numinput: {
        position: 'absolute',
        justifyContent: 'center',
        zIndex: 1,
        flexDirection: 'row',
        width: '30%',
        height: '70%'
    }

});

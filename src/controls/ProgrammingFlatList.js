import { Component } from 'react';
import { StyleSheet, View, Alert, TextComponent, Platform } from 'react-native';
import React from 'react';
import NumericInput from './NumericInput';
import i18n from '../../resources/locales/i18n';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import { Text } from 'react-native-paper';
import { Button, FAB, IconButton } from 'react-native-paper';
import CustomIcon from '../utillity/CustomIcon';
import { TouchableOpacity, ScrollView, FlatList } from 'react-native-gesture-handler';


export default class ProgrammingFlatList extends Component {

    renderAndroidFlatList() {
        return (
            <ScrollView>
                {/* This FlatList is Wrapped in a ScrollView to fix an Issue with the Android Keyboard 
                    apprearing and instantly disappearing on tapping into a textfield in the lower part of the list */}
                {this.renderFlatList()}
            </ScrollView>
        )
    }

    renderFlatList() {
        return (
            <FlatList
                data={this.props.data}
                keyExtractor={this.props.keyExtractor}
                renderItem={this.props.renderItem}
                ref={ref=> this.props.bindRef(ref)}
            />
        )
    }

    render() {
        if (Platform.OS === 'ios') {
            return this.renderFlatList();
        } else {
            return this.renderAndroidFlatList();
        }
    }
}

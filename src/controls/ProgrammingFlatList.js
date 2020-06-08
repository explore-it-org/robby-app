import {Component} from 'react';
import {StyleSheet, View, Alert, TextComponent, Platform} from 'react-native';
import React from 'react';
import NumericInput from './NumericInput';
import i18n from '../../resources/locales/i18n';
import SinglePickerMaterialDialog from '../materialdialog/SinglePickerMaterialDialog';
import {Text} from 'react-native-paper';
import {Button, FAB, IconButton} from 'react-native-paper';
import CustomIcon from '../utillity/CustomIcon';
import { TouchableOpacity, ScrollView, FlatList } from 'react-native-gesture-handler';


export default class ProgrammingFlatList extends Component {

   renderAndroidFlatList(){
    return (
        <ScrollView>
            {this.renderFlatList()}
        </ScrollView>
    )
   }

   renderFlatList(){
    return (
        <FlatList
            data={this.props.data}
            keyExtractor={this.props.keyExtractor}
            ref={this.props.ref}
            renderItem={this.props.renderItem}
        />
    )
   }

    render() {
        if(Platform.OS === 'android'){
            return this.renderAndroidFlatList();
        }else{
            return this.renderFlatList();
        }
    }
}

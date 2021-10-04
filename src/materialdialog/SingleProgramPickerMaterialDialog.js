import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, TouchableOpacity, View, FlatList} from 'react-native';
import {material} from 'react-native-typography';
import { Icon } from 'react-native-vector-icons/dist/MaterialIcons';
import MaterialDialog from './MaterialDialog';
import {Colors} from 'react-native-paper';
import colors from './colors';
import { ProgramType } from '../model/DatabaseModels';
import CustomIcon from '../utillity/CustomIcon';
import { Image } from 'react-native-elements';

export default class SingleProgramPickerMaterialDialog extends PureComponent {

    state = {
        selectedLabel: undefined,
        selectedValue: undefined,
        visible: false,
    };

    onRowPress(item) {
        this.setState({
            selectedLabel: item.label,
            selectedValue: item.val
        });
    }

    // The new static getDerivedStateFromProps lifecycle is invoked after a component is instantiated as well as
    // before it is re-rendered. It can return an object to update state, or null to indicate that the new props
    // do not require any state updates.
    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.visible) {
            return {
                selected: props.selected,
                visible: props.visible,
                selectedLabel: undefined,
                selectedValue: undefined,
            };
        }
        // Return null to indicate no change to state.
        return null;
    }

    renderItem = ({item}) => {
        return (
            <TouchableOpacity key={item.value} onPress={() => {
                this.setState({selected: undefined});
                this.onRowPress(item);
            }}>
                <View style={styles.rowContainer}>
                    <View style={styles.iconContainer}>
                        <Icon
                            name={item.selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                            color={this.props.colorAccent}
                            size={24}
                        />
                    </View>
                    {this.renderItemType(item.type)}
                    <Text style={material.subheading}>{item.label}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    renderItemType = (type) => {
        if(type === ProgramType.STEPS){
            return (
                <View style={{justifyContent: 'flex-start', alignItems: 'center', paddingRight: 10 }}>
                    <Image source={require('../../resources/icon/wheeldarkx.png')}
                        style={{
                            width: 20, height: 20,
                            
                        }} />
                </View>
            )
        } else if(type === ProgramType.BLOCKS){
            return (
                <View style={{justifyContent: 'flex-start', alignItems: 'center', paddingRight: 10 }}>
                    <CustomIcon name="step2" size={20} color={Colors.grey700}/>
                </View>
            )
        } else {
            // type = undefined
            return (
                <View></View>
            )
        }
    }


    render() {
        /*
        Props can change so we have to re-compute the items state. Because children elements are only dependent
        from the item list, only changes in this list will force a re-render!
        This pattern is called "memoization helper" and replaces 'componentWillReceiveProps()' which is unsafe.
        */

        const rows = this.props.items.map((item => {
            item.selected = item.label === this.state.selectedLabel || item.label === this.state.selected;
            return item;
        }));
        return (
            <MaterialDialog
                title={this.props.title}
                titleColor={this.props.titleColor}
                colorAccent={this.props.colorAccent}
                visible={this.props.visible}
                okLabel={this.props.okLabel}
                scrolled={this.props.scrolled}
                cancelLabel={this.props.cancelLabel}
                onCancel={() => {
                    this.setState({selectedLabel: undefined});
                    this.props.onCancel();
                }}
                onOk={() => {
                    const selectedLabel = this.state.selectedLabel;
                    const selectedValue = this.state.selectedValue;
                    this.setState({selectedLabel: undefined, selectedValue: undefined});
                    this.props.onOk({
                        selectedLabel,
                        selectedValue
                    });
                }}
            >
                <FlatList
                    data={rows}
                    renderItem={this.renderItem}
                    extraData={this.state.visible}
                />
            </MaterialDialog>
        );
    }
}

const styles = StyleSheet.create({
    rowContainer: {
        height: 56,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
});

SingleProgramPickerMaterialDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string,
    titleColor: PropTypes.string,
    colorAccent: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    cancelLabel: PropTypes.string,
    okLabel: PropTypes.string,
    scrolled: PropTypes.bool,
};

SingleProgramPickerMaterialDialog.defaultProps = {
    title: undefined,
    titleColor: undefined,
    colorAccent: colors.androidColorAccent,
    cancelLabel: undefined,
    okLabel: undefined,
    scrolled: false,
    selected: undefined,
};

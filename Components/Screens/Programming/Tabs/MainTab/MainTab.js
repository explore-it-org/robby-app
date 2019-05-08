import { Component } from "react";
import { StyleSheet, View, Text, KeyboardAvoidingView, FlatList, TouchableOpacity, Platform } from "react-native";
import SpeedInput from "./SpeedInput";
import { FAB } from "react-native-paper";
import React from "react";
import {
    speeds,
    add,
    add_at,
    update_leftspeed,
    update_rightspeed,
    move,
    remove,
    set_update_speeds_callback,
    //storeSpeeds,
    //retrieveSpeeds
} from '../../../../../Stores/SpeedsStore'
import i18n from '../../../../../locales/i18n';

export default class MainTab extends Component {
    state = {
        speeds: speeds,
        selected: -1, // id of currently selected row
    };

    componentWillMount() {
        //retrieveSpeeds;
    }

    componentWillUnmount() {
        //storeSpeeds;
    }

    constructor(props) {
        super(props);
        set_update_speeds_callback((speeds) => { this.setState({ speeds: speeds }); });
    }

    onChangeLeft(index, text) {
        update_leftspeed(index, parseInt(text));
    }

    onChangeRight(index, text) {
        update_rightspeed(index, parseInt(text));
    }

    render() {
        let select_controls;
        if (this.state.selected >= 0) {
            select_controls =
                <View>
                    <FAB
                        disabled={speeds.length <= 1}
                        style={styles.delete}
                        icon="delete"
                        onPress={() => {
                            let curr = this.state.selected;
                            remove(curr);
                            this.setState({ selected: curr - 1 })
                        }}
                    />
                    <FAB
                        disabled={this.state.selected == 0}
                        style={styles.move_up}
                        icon="arrow-upward"
                        onPress={() => {
                            let curr = this.state.selected;
                            move(curr, curr - 1);
                            this.setState({ 
                                selected: curr - 1
                            })
                        }}
                    />
                    <FAB
                        disabled={this.state.selected >= speeds.length - 1}
                        style={styles.move_down}
                        icon="arrow-downward"
                        onPress={() => {
                            let curr = this.state.selected;
                            move(curr, curr + 1);
                            this.setState({ 
                                selected: curr + 1
                            });
                        }}
                    />
                </View>
        }

        const keyboardVerticalOffset = Platform.OS === 'ios' ? 150 : -80
        const behavior = Platform.OS === 'ios' ? 'padding' : 'position'
        return (
            <View style={[styles.view, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{marginTop: 30, height: 20, width: '100%', flexDirection: 'row'}}>
                    <Text style={{ flex: 1, textAlign: 'center' }}>L</Text>
                    <Text style={{ flex: 2, textAlign: 'center' }}>{i18n.t('MainTab.speed')}</Text>
                    <Text style={{ flex: 1, textAlign: 'center' }}>R</Text>
                </View>
                <KeyboardAvoidingView behavior={behavior} keyboardVerticalOffset={keyboardVerticalOffset}>
                    <FlatList
                        data={this.state.speeds}
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    if (this.state.selected == parseInt(index)) {
                                        this.setState({ selected: -1 })
                                    } else {
                                        this.setState({ selected: parseInt(index) })
                                    }
                                }}>
                                <View key={index} style={parseInt(index) == this.state.selected ? styles.selected_row : styles.row}>
                                    <SpeedInput
                                        onchange={(text) => this.onChangeLeft(index, text)}
                                        val={item.left}
                                        val1={100 - item.left}
                                        col1={'#FAFAFA'}
                                        val2={item.left}
                                        col2={'#E2F7F2'}
                                    />
                                    <SpeedInput
                                        onchange={(text) => this.onChangeRight(index, text)}
                                        val={item.right}
                                        val1={item.right}
                                        col1={'#E4F1FF'}
                                        val2={100 - item.right}
                                        col2={'#FAFAFA'}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </KeyboardAvoidingView>
                <View>
                <FAB
                    style={styles.fab}
                    icon="add"
                    onPress={() => {
                        let curr = this.state.selected;
                        if (curr == -1) {
                            add({ left: 0, right: 0 });
                        } else {
                            add_at({ left: 0, right: 0 }, curr + 1)
                        }
                    }}
                />
                </View>
                {select_controls}
            </View>
        );
    }

    _deleteItem(id) {
        this.setState({
            rowToDelete: id
        });
    }

}

const styles = StyleSheet.create({
    col: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        margin: 5
    },
    row: {
        height: 60,
        margin: 0,
        width: '100%', 
        flexDirection: 'row'
    },
    selected_row: {
        height: 60,
        margin: 0,
        width: '100%', 
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0
    },
    view: {
        marginBottom: 55,
        backgroundColor: 'white',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: -200,
        bottom: 18
    },
    delete: {
        position: 'absolute',
        margin: 16,
        right: -105,
        bottom: 18
    },
    move_up: {
        position: 'absolute',
        margin: 16,
        right: -30,
        bottom: 18
    },
    move_down: {
        position: 'absolute',
        margin: 16,
        right: 45,
        bottom: 18
    }
});


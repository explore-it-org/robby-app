import {Component} from "react";
import {StyleSheet, View, TextInput, Alert, TouchableHighlight, Text} from "react-native";
import React from "react";
import {Icon} from "react-native-elements";

export default class App extends Component {
    state = {
        value: this.props.val.toString(),
        upper_max: this.props.limit.toString()
    };


    onPlus(){
        let old_val = parseInt(this.state.value);
        if(old_val < this.state.upper_max)
            this.setState({value: old_val+1})
    }

    onMinus(){
        let old_val = parseInt(this.state.value);
        if(old_val > 0)
            this.setState({value: old_val-1})
    }

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column', margin: 20}}>
                <View style={styles.outer}>
                    <View style={styles.buttons}>
                        <TouchableHighlight onPress={() => this.onPlus()} underlayColor="white"
                                            style={{width: '100%', height: '50%', borderWidth: 1, borderColor:'#9c27b0', backgroundColor:'#FAFAFA'}}
                        >
                            <View style={styles.btn_label}>
                                <Icon name='add'
                                      color='#9c27b0'
                                      size={32}/>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => this.onMinus()} underlayColor="white"
                                            style={{width: '100%', height: '50%', borderWidth: 1, borderColor:'#9c27b0', backgroundColor:'#FAFAFA'}}
                        >

                            <View style={styles.btn_label_btm}>
                                <Icon name='remove'
                                      color='#9c27b0'
                                      size={32}/>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={styles.number}>
                        <Text style={{fontSize: 30, color: 'white'}}>
                            {this.state.value}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    outer: {
        height: 180,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttons: {
        position: 'absolute',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        zIndex: 0
    },
    btn_label: {
        margin: '10%'
    },
    btn_label_btm: {
        flex: 1,
        flexDirection: 'column',
        justifyContent:'flex-end',
        margin: '10%'
    },
    number: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        flexDirection: 'row',
        backgroundColor: '#9c27b0',
        borderRadius: 25,
        height: 50,
        width: 50
    }
});

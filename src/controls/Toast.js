import {Component} from 'react';
import {StyleSheet, View, TextInput, Easing} from 'react-native';
import React from 'react';
import {Text} from 'react-native-elements';
import Animated from 'react-native-reanimated';

export default class Toast extends Component {
    state = {
        message: '',
        opacity: new Animated.Value(0.0),
    };

    static show(message) {
        Toast.__singletonRef.__show(message);
    }

    constructor(props) {
        super(props);
        Toast.__singletonRef = this;
    }

    __show = (message) => {
        this.setState({message: message});
        Animated.timing(
            this.state.opacity, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
            },
        ).start(() => {
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
            }).start(() => {
                Animated.timing(
                    this.state.opacity,
                    {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.linear,
                    },
                ).start();
            });
        });
    };

    render() {
        return (
            <Animated.View style={{
                backgroundColor: 'rgb(101, 101, 101)',
                paddingHorizontal: 15,
                paddingVertical: 7,
                borderRadius: 20,
                borderColor: 'white',
                borderStyle: 'solid',
                borderWidth: 0,
                position: 'absolute',
                bottom: '20%',
                zIndex: 99999999,
                alignSelf: 'center',
                opacity: this.state.opacity,
            }}>
                <Text style={{color: 'white', fontFamily: 'Jost-Light'}}>{this.state.message}</Text>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({});

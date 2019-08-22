import React from "react";
import {View} from "react-native";
import {Text} from "react-native-paper";

export default class BlockViewScreen extends React.Component {
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text>Third!</Text>
            </View>
        );
    }
}

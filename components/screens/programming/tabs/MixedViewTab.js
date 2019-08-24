import React from "react";
import {View} from "react-native";
import {Text} from "react-native-paper";

export default class MixedViewScreen extends React.Component {
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text>Load and Store (to be implemented)</Text>
            </View>
        );
    }
}

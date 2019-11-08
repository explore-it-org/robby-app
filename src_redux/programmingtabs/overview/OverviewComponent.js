import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, FlatList, TouchableOpacity, Button} from 'react-native';
import {Text} from 'react-native-paper';
import {duplicate, remove} from '../../database/DatabaseAction';

export default class OverviewComponent extends Component {

    componentDidMount(): void {
        console.log('i get called' + this.props.Program.Programs);
    }

    /*
        load(item){
            if(item.programType === ProgramType.STEPS){
                loadSpeedProgramByName(item.name);
                this.props.navigation.navigate("First");
            }else{
                loadProgramByName(item.name);
                this.props.navigation.navigate("Second");
            }
        }
    */
    render() {
        return (
            <View style={[styles.view, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
                <ScrollView
                    style={{backgroundColor: 'white', width: '100%'}}
                    resetScrollToCoords={{x: 0, y: 0}}
                    scrollEnabled={true}>
                    <FlatList
                        data={this.props.Program.Programs}
                        //extraData={this.state}
                        style={{width: '100%'}}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => (
                            <TouchableOpacity
                                style={{width: '100%', flexDirection: 'row'}}
                                onPress={() => {
                                    //this.load(item);
                                }}>
                                <View style={{padding: 20, width: '100%', flexDirection: 'row'}}>
                                    <Text style={{flex: 1}}>
                                        {item.name}
                                    </Text>
                                    <View style={{marginRight: 20}}>
                                        <Button onPress={() => {
                                            this.props.remove(item.id);
                                        }} title="Delete"/>
                                    </View>
                                    <View style={{marginRight: 20}}>
                                        <Button title="Duplicate" onPress={() => {
                                            this.props.duplicate(item);
                                        }}/>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </ScrollView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    col: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        margin: 5,
    },
    row: {
        height: 60,
        margin: 0,
        width: '100%',
        flexDirection: 'row',
        alignContent: 'center',
    },
    selected_row: {
        height: 60,
        margin: 0,
        width: '100%',
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0,
    },
    view: {
        marginBottom: 55,
        backgroundColor: 'white',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: -200,
        bottom: 18,
    },
    delete: {
        position: 'absolute',
        margin: 16,
        right: -105,
        bottom: 18,
    },
    move_up: {
        position: 'absolute',
        margin: 16,
        right: -30,
        bottom: 18,
    },
    move_down: {
        position: 'absolute',
        margin: 16,
        right: 45,
        bottom: 18,
    },
    numinput: {
        justifyContent: 'center',
        zIndex: 1,
        flexDirection: 'row',
        width: '30%',
        height: '70%',
    },
});

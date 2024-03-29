import { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { FAB } from 'react-native-paper';
import React from 'react';
import SpeedInput from '../../controls/SpeedInput';
import i18n from '../../../resources/locales/i18n';
import CustomIcon from '../../utillity/CustomIcon';
import { Text } from 'react-native-paper';
import RecycleProgrammingList from '../../controls/RecycleProgrammingList';

export default class StepProgrammingComponent extends Component {

  initList(ref) {
    this.blockList = ref;
  }

  renderItem = (type, data) => {
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
        flex: 1,
        flexDirection: 'row',
      },
      selected_row: {
        height: 60,
        margin: 0,
        flex: 1,
        flexDirection: 'row',
        borderColor: '#d6d6d6',
        borderWidth: 1.0,
      },
    });
    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => {
          if (
            this.props.Instruction.selectedIndex ===
            parseInt(data.index)
          ) {
            this.props.setActiveIndex(-1);
          } else {
            this.props.setActiveIndex(parseInt(data.index));
          }
        }}>
        <View
          style={
            parseInt(data.index) ===
              this.props.Instruction.selectedIndex
              ? styles.selected_row
              : styles.row
          }>
          <SpeedInput
            style={{ flex: 1 }}
            onchange={text => {
              this.props.setActiveIndex(-1);
              this.props.changeLeftSpeed(
                parseInt(text),
                parseInt(data.index),
              );
            }}
            val={data.item.left}
            val1={100 - data.item.left}
            col1={'#FFFFFF'}
            val2={data.item.left}
            col2={'#D6F5EE'}
            left={true}
          />
          <SpeedInput
            style={{ flex: 1 }}
            onchange={text => {
              this.props.setActiveIndex(-1);
              this.props.changeRightSpeed(
                parseInt(text),
                parseInt(data.index),
              );
            }}
            val={data.item.right}
            val1={data.item.right}
            col1={'#CEE0F4'}
            val2={100 - data.item.right}
            col2={'#FFFFFF'}
            left={false}
          />
        </View>
      </TouchableOpacity>
    )
  };

  render() {
    let select_controls;
    if (this.props.Instruction.selectedIndex >= 0) {
      select_controls = (
        <View style={{ flexDirection: 'row', marginRight: 20 }}>
          <FAB
            disabled={this.props.Instruction.selectedIndex === 0}
            style={styles.fab}
            icon={({ size, color }) => (
              <CustomIcon name="up" size={size} color={color} />
            )}
            animated={false}
            onPress={() => {
              this.props.moveUp();
            }}
          />
          <FAB
            disabled={this.props.Instruction.selectedIndex >= this.props.Instruction.ActiveProgram.steps.length - 1}
            style={styles.fab}
            icon={({ size, color }) => (
              <CustomIcon name="down" size={size} color={color} />
            )}
            animated={false}
            onPress={() => {
              this.props.moveDown();
            }}
          />
          <FAB
            disabled={this.props.Instruction.ActiveProgram.steps.length <= 1}
            style={styles.fab}
            icon={({ size, color }) => (
              <CustomIcon name="deletelight" size={size} color={color} />
            )}
            animated={false}
            onPress={() => {
              this.props.deleteInstruction();
            }}
          />
        </View>
      );
    }
    let loadingIndicator;
    if (this.props.BLE.device.isDownloading) {
      loadingIndicator = (
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2E5266" />
        </View>
      );
    }

    // TODO remove all style

    return (
      <View
        style={[
          styles.view,
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
        ]}>

        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS == 'ios' ? 128 : 0}>
          <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 8, flexDirection: 'row' }}>
              <TextInput
                placeholder={i18n.t('Programming.programName')}
                maxLength={30}
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  flex: 2,
                  height: 40,
                  borderBottomColor: '#2E5266',
                  borderBottomWidth: 1.0,
                  fontFamily: 'Jost-Medium',
                }}
                value={this.props.Instruction.ActiveProgram.name}
                onChangeText={text => {
                  this.props.setName(text);
                }}
              />
            </View>
            <View style={{ flex: 1 }} />
          </View>

          <View
            style={{ width: '100%', flexDirection: 'row', paddingBottom: 15 }}>
            <View style={{ flex: 1 }} />
            <View
              style={{
                flex: 2,
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}>
              <Image
                source={require('../../../resources/icon/wheeldarkx.png')}
                style={{ width: 20, height: 20 }}
              />
              <View style={{ textAlign: 'center', marginLeft: 5 }}>
                <Text style={{ fontSize: 16 }}>{i18n.t('MainTab.left')}</Text>
              </View>
            </View>
            <View style={{ flex: 4, textAlign: 'center' }}>
              <Text style={{ textAlign: 'center', fontSize: 16 }}>
                {i18n.t('MainTab.speed')} {i18n.t('Programming.length')} {this.props.Instruction.ActiveProgram.steps.length}
              </Text>
            </View>

            <View
              style={{
                flex: 2,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <View style={{ marginRight: 5 }}>
                <Text style={{ fontSize: 16 }}>{i18n.t('MainTab.right')}</Text>
              </View>
              <Image
                source={require('../../../resources/icon/wheeldarkx.png')}
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flex: 1 }} />
          </View>

          {loadingIndicator}

          <View style={{ flex: 1, minHeight: 1, minWidth: 1 }}>
            {this.props.Instruction.ActiveProgram.steps.length > 0 ? <RecycleProgrammingList
              style={{ flex: 1 }}
              data={this.props.Instruction.ActiveProgram.steps}
              renderItem={this.renderItem}
              selectedIndex={this.props.Instruction.selectedIndex}
              extendedState={{selectedIndex: this.props.Instruction.selectedIndex}}
            /> : <View />}
          </View>

        </KeyboardAvoidingView>
        <View style={styles.fabLine}>
          {select_controls}
          <FAB
            style={styles.fab}
            icon={({ size, color }) => (
              <CustomIcon name="plus" size={size} color={color} />
            )}
            animated={false}
            onPress={() => {
              this.props.addInstruction();
              //this.blockList.scrollToEnd({animated: true});
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15
  },
  col: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    margin: 5,
  },
  row: {
    height: 60,
    margin: 0,
    flex: 1,
    flexDirection: 'row',
  },
  selected_row: {
    height: 60,
    margin: 0,
    flex: 1,
    flexDirection: 'row',
    borderColor: '#d6d6d6',
    borderWidth: 1.0,
  },
  view: {
    marginBottom: 55,
    backgroundColor: 'white',
  },
  fab: {
    margin: 7,
  },
  delete: {},
  move_up: {},
  move_down: {},
  fabLine: {
    position: 'absolute',
    bottom: 18,
    flex: 1,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
});

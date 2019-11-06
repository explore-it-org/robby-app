import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { material } from 'react-native-typography';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialDialog from './MaterialDialog';

import colors from './colors';

export default class SinglePickerMaterialDialog extends PureComponent {

  state = {
    selectedLabel: undefined,
    visible: false
  };

  onRowPress(item) {
    this.setState({
      selectedLabel: item.label
    });
  }

    // The new static getDerivedStateFromProps lifecycle is invoked after a component is instantiated as well as
    // before it is re-rendered. It can return an object to update state, or null to indicate that the new props
    // do not require any state updates.
    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                selectedLabel: undefined
            };
        }
        // Return null to indicate no change to state.
        return null;
    }

  renderItem = ({ item }) => {
    return (
      <TouchableOpacity key={item.value} onPress={() => this.onRowPress(item)}>
        <View style={styles.rowContainer}>
          <View style={styles.iconContainer}>
            <Icon
              name={item.selected ? 'radio-button-checked' : 'radio-button-unchecked'}
              color={this.props.colorAccent}
              size={24}
            />
          </View>
          <Text style={material.subheading}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    )
  };



  render() {
    /*
    Props can change so we have to re-compute the items state. Because children elements are only dependent
    from the item list, only changes in this list will force a re-render!
    This pattern is called "memoization helper" and replaces 'componentWillReceiveProps()' which is unsafe.
    */

    const rows = this.props.items.map((item => {
      item.selected = item.label === this.state.selectedLabel
      return item
    }))

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
          this.setState({ selectedLabel: undefined })
          this.props.onCancel();
        }}
        onOk={() => {
          const selectedLabel = this.state.selectedLabel
          this.setState({ selectedLabel: undefined })
          this.props.onOk({
            selectedLabel: this.state.selectedLabel
          })
        }}
      >
        <FlatList
          data={rows}
          renderItem={this.renderItem}
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

SinglePickerMaterialDialog.propTypes = {
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

SinglePickerMaterialDialog.defaultProps = {
  title: undefined,
  titleColor: undefined,
  colorAccent: colors.androidColorAccent,
  cancelLabel: undefined,
  okLabel: undefined,
  scrolled: false,
};

/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import equal from 'fast-deep-equal'

/***
 * To test out just copy this component and render in you root component
 */
export default class RecycleProgrammingList extends React.Component {
  constructor(args) {
    super(args);

    let { width } = Dimensions.get('window');

    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this._layoutProvider = new LayoutProvider(
      index => {
        return 0;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = 60;
      },
    );

    this.state = {
      dataProvider: dataProvider.cloneWithRows(this.props.data.map(item => {
        return {
          item,
          index: this.props.data.indexOf(item),
        };
      })),
    };
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.data, prevProps.data) || !equal(this.props.selectedIndex, prevProps.selectedIndex)) {
      let dataProvider = new DataProvider((r1, r2) => {
        return r1 !== r2;
      });
      this.setState({
        dataProvider: dataProvider.cloneWithRows(this.props.data.map(item => {
          return {
            item,
            index: this.props.data.indexOf(item),
          };
        })),
      })
    }
  }

  render() {
    return (
      <RecyclerListView
        layoutProvider={this._layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this.props.renderItem}
      />
    );
  }
}

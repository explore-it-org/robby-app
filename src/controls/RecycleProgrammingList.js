import React from 'react';
import { Dimensions } from 'react-native';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import equal from 'fast-deep-equal'

export default class RecycleProgrammingList extends React.Component {
  ref = null;

  constructor(args) {
    super(args);

    let { width } = Dimensions.get('window');

    let dataProvider = new DataProvider((r1, r2) => {
      return !equal(r1, r2);
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
    if (!equal(this.props.data, prevProps.data)) {
      this.updateDataState(() => {
        if (this.props.selectedIndex  >= 0) {
          this.scrollToIndex(this.props.selectedIndex);
        } else {
          this.scrollToIndex(this.props.data.length - 1);
        }
      });
    } else if (!equal(this.props.selectedIndex, prevProps.selectedIndex)) {
      this.updateDataState(() => { })
    }
  }

  updateDataState(callback) {
    let dataProvider = new DataProvider((r1, r2) => {
      return !equal(r1,  r2);
    });
    this.setState({
      dataProvider: dataProvider.cloneWithRows(this.props.data.map(item => {
        return {
          item,
          index: this.props.data.indexOf(item),
        };
      })),
    }, callback);
  }

  render() {
    // NOTE: extendedState is necessary for the recyclerlist to re-render its children
    return (
      <RecyclerListView
        ref={ref => {
          this.ref = ref;
        }}
        layoutProvider={this._layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this.props.renderItem}
        extendedState={this.props.extendedState}
      />
    );
  }

  scrollToIndex(index) {
    if(index > 0){
      this.ref.scrollToIndex(index, true);
    }
  }

  scrollToTop() {
    this.ref.scrollToTop(true);
  }

  scrollToEnd() {
    this.ref.scrollToEnd(true);
  }
}

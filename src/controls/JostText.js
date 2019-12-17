import React, {Component} from 'react';
import {Text} from 'react-native';

export class JostText extends Component {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <Text {...this.props} style={{fontFamily: 'Jost-500-Medium', textAlign: 'center'}}>
                {this.props.children}
            </Text>
        );
    }
}

export class JostTextHeader extends Component {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <Text {...this.props} style={{fontFamily: 'Jost-900-Black', textAlign: 'center'}}>
                {this.props.children}
            </Text>
        );
    }
}

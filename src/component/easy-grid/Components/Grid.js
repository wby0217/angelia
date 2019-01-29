/* @flow */


import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import computeProps from '../Utils/computeProps';
import _ from 'lodash';
import Col from './Col';
import Row from './Row';


export default class GridNB extends Component {
    prepareRootProps() {
        const type = {
            flex: 1,
            flexDirection: this.ifRow() ? 'column' : 'row'
        };

        const defaultProps = {
            style: type
        };

        return computeProps(this.props, defaultProps);
    }

    ifRow() {
        let row = false;
        React.Children.forEach(this.props.children, (child) => {
            if (child.type == Row) { row = true; }
        });
        return row;
    }

    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    }

    render() {
        if (this.props.onPress) {
            return (
              <TouchableOpacity onPress={this.props.onPress}>
                <View
                  ref={component => this._root = component}
                  {...this.props}
                  {...this.prepareRootProps()}
                >{this.props.children}</View>
              </TouchableOpacity>
            );
        }

        return (
          <View
            ref={component => this._root = component}
            {...this.props}
            {...this.prepareRootProps()}
          >{this.props.children}</View>
        );
    }

}

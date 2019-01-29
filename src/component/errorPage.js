import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native';

import NetworkTool from '../utils/netWorkTool'

export default class ErrorPage extends Component {
    render() {
        const { type, desc } = this.props;
        switch (type) {
            case 'networkError':
                return (
                <View style={styles.container}>
                    <Image source={require('../assets/images/nonet.png')}
                        style={styles.noMsgImg}
                    />
                    <View
                        style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ backgroundColor: 'transparent', color: '#333' }}>{desc || NetworkTool.NOT_NETWORK}</Text>
                    </View>
                </View>
                );
            case 'noData':
                return (
                <View style={styles.container}>
                    <Image source={require('../assets/images/nodata.png')}
                        style={styles.noMsgImg}
                    />
                    <View
                        style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ backgroundColor: 'transparent', color: '#333' }}>{desc || '暂无数据'}</Text>
                    </View>
                </View>
                );
            default:
            return (
                <View style={styles.container}>
                    <Image source={require('../assets/images/nodata.png')}
                        style={styles.noMsgImg}
                    />
                    <View
                        style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ backgroundColor: 'transparent', color: '#333' }}>{desc || '暂无数据'}</Text>
                    </View>
                </View>
                );
        }
    }
}
const styles =StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        alignItems: 'center'
    },
    noMsgImg: {
        height: 200,
        resizeMode: 'contain',
    }
});
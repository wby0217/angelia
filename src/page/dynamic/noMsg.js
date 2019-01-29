import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native';

export default class NoMsg extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Image source={require('../../assets/images/no_msg.webp')}
                    style={styles.noMsgImg}
                />
                <Text style={{ backgroundColor: 'transparent', color: '#333' }}>您还没有消息哟</Text>
            </View>
        );
    }
}
const styles =StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        alignItems: 'center'
    },
    noMsgImg: {
        width: 120,
        resizeMode: 'contain'
    }
});
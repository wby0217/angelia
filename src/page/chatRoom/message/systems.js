import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default class Systems extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { messageStatus, data } = this.props.content;
        if (messageStatus.typeDesc === 'tips') {
            return (
                <View style={styles.systems}>
                    <Text style={styles.textTip}>{ data.messageContent }</Text>
                </View>
            )
        } else if (messageStatus.typeDesc === 'prize') {
            return (
                <View style={styles.lottery}>
                    <Text style={styles.textTip}>第{data.issueNo}期已经开奖</Text>
                    <Text style={[styles.textTip,{letterSpacing: 4}]}>{ data.prizeNum }</Text>
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    systems: {
        width: (width-30),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        paddingVertical: 5,
    },
    lottery: {
        width: (width-30),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        borderColor: '#D1D1D1',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 4,
        paddingVertical: 5,
    },
    textTip: {
        color: '#666',
        fontSize: 12,
        paddingVertical:2,
    },
})
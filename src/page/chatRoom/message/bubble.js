import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    Platform
} from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../../store';
const isIos = Platform.OS === 'ios';
const { width } = Dimensions.get('window');
import { Icon } from '../../../component/customicons';

inject('betStore');
observer

export default class Bubble extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newStatus: null,
            iconType: true,
        };
    }
    render() {
        const { messageStatus, textMessage, orderMessage } = this.props.content;
        const { position, typeDesc, status }  = messageStatus;
        const { messageListIndex } = this.props;
        return (
            <View style={[styles.container, styles[position].container]}>
                {
                    typeDesc === 'order' && (
                        <View style={styles.bettingWrp}>
                            <View style={styles.bettingTop}>
                                    <View style={styles.infoWrap}>
                                        <Text style={styles.playName}>{orderMessage.menuName}</Text>
                                        <Text style={styles.betLength}>({orderMessage.orderCount}注)</Text>
                                    </View>
                                    <Text style={styles.issueInfo} numberOfLines={1}>
                                        {
                                            !!orderMessage.content && orderMessage.content.length > 0 ? (
                                                `${orderMessage.playType[0].display} - ${orderMessage.content}`
                                            ) : (
                                                orderMessage.playType.map(elem => elem.display).join(', ')
                                            )
                                        }
                                    </Text>
                            </View>
                            <View style={styles.bettingBottom}>
                                <View style={styles.betAmount}>
                                    <Icon name='icon-wallet-bag' size={14} color='#F38D0B'/>
                                    <Text style={styles.betContent}>{orderMessage.betTotalAmount.toFixed(2)} 元</Text>
                                </View>
                                {
                                    (position === 'right' && status !== 'success') ? (
                                        <View></View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={()=>{
                                                betStore.showOrderDetail(messageListIndex);
                                            }}
                                        >
                                            <Text style={styles.betInfo}>查看详情></Text>
                                        </TouchableOpacity>
                                    )}
                            </View>
                        </View>
                    )
                }
                { typeDesc === 'message' && (
                    <View style={[styles.messageWrp, styles[position].message]}>
                        <Text style={styles.messageText}>{textMessage}</Text>
                    </View>
                )}
                <View style={[styles[position].arrow, typeDesc==='order' && styles[position].bettingArrow]} />
            </View>
        );
    }
}
const styles = {
    bettingWrp: {
        width: width * 0.62,
        height: 80,
        overflow: 'hidden',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: '#fff',
    },
    betAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    betContent:{
        color: '#F38D0B',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft:5
    },
    bettingTop: {
        height: 55,
        paddingHorizontal: 15,
        backgroundColor: '#F38D0B',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent: 'center',
    },
    bettingBottom: {
        flexDirection: 'row',
        minHeight: 25,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    moneyIcon: {
        width: 14,
        height: 13,
    },
    infoWrap: {
        flexDirection: 'row',
    },
    issueInfo: {
        flexDirection: 'row',
        height: 22,
        lineHeight: 22,
        fontSize: 14,
        overflow: 'hidden',
        color: '#fff'
    },
    playName: {
        lineHeight: 22,
        fontSize: 14,
        color:'#fff',
        fontWeight: 'bold',
        marginRight: 14,
    },
    betInfo: {
        fontSize:13,
        color:'#999'
    },
    betLength: {
        lineHeight: 22,
        color:'#fff',
        fontSize: 14,
    },
    messageWrp: {
        maxWidth: width * 0.6,
        paddingVertical: 4,
        paddingHorizontal: 7,
        borderRadius: 5,
    },
    messageText: {
        minHeight: 24,
        alignSelf: 'flex-start',
        color: '#545454',
        lineHeight: isIos ? 24 : 21,
        paddingBottom: isIos ? 0 : 2,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    left: StyleSheet.create({
        container: {
            alignItems: 'flex-start',
            paddingLeft: 5,
        },
        bettingArrow: {
            borderRightColor:'#f38d0b'
        },
        arrow: {
            position: 'absolute',
            left: -7,
            top: 5,
            width:0,
            height:0,
            borderStyle:'solid',
            borderWidth:6,
            borderTopColor:'#F4F4F4',
            borderLeftColor:'#F4F4F4',
            borderBottomColor:'#F4F4F4',
            borderRightColor:'#FFF'
        },
        message: {
            backgroundColor: '#fff',
        }
    }),
    right: StyleSheet.create({
        container: {
            alignItems: 'flex-end',
        },
        bettingArrow: {
            borderLeftColor:'#f38d0b'
        },
        arrow: {
            position: 'absolute',
            right: -12,
            top: 8,
            width:0,
            height:0,
            borderStyle:'solid',
            borderWidth:6,
            borderTopColor:'#F4F4F4',
            borderLeftColor:'#A0E75A',
            borderBottomColor:'#F4F4F4',
            borderRightColor:'#F4F4F4'
        },
        message: {
            backgroundColor: '#A0E75A',
            borderColor:'#6FB44D',
        }
    })
};
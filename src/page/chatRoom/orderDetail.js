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
    Platform,
    ScrollView
} from 'react-native';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Feather'
import uuid from 'uuid';
const { width, height } = Dimensions.get('window');
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../store';
const isIos = Platform.OS === 'ios';

@inject('betStore')
@observer

export default class OrderDetail extends Component {
    constructor(props) {
        super(props);
        this.alongWithSubmitBet = this.alongWithSubmitBet.bind(this);
        this.navigate = props.navigation.navigate;
    }
    alongWithSubmitBet() {
        const { showIssueNoChangeNotice } = this.props;
        const { orderDetail, orderMessage } = betStore.orderInfoForDetail;
        const { betTotalAmount, issueNo } = orderMessage;
        const curIssueNo = betStore.curIssueInfo.issueNo;
        if (curIssueNo !== issueNo) {
            showIssueNoChangeNotice()
                .then(() => betStore.sendBetFollowOrder(betStore.orderInfoForDetail))
                .catch(() => {})
        } else {
            betStore.sendBetFollowOrder(betStore.orderInfoForDetail);
        }

    }
    render() {
        const { orderDetail, orderMessage, messageStatus } = betStore.orderInfoForDetail;
        const { betTotalAmount, menuName, issueNo, orderCount } = orderMessage;
        const { position } = messageStatus;
        return (
            <Modal
                style={styles.modal}
                isOpen = {betStore.orderDetailStatus}
                swipeToClose={false}
                backdropPressToClose={false}
                position="center">
                <View style={styles.header}>
                    <View style={[styles.betDataWrap,{borderBottomColor:'#D01305'}]}>
                        <Image style={styles.dataIcon} source={require('../../assets/images/dataIcon.png')}/>
                        <Text style={styles.details}>{`${issueNo}期`}</Text>
                    </View>
                    <View style={[styles.betDataWrap,{marginTop: 5}]}>
                        <Text style={[styles.details,{fontWeight: 'bold'}]}>{menuName}</Text>
                    </View>
                    <View style={[styles.betDataWrap,{marginBottom: 6,justifyContent: 'space-between'}]}>
                        <Text style={[styles.details]}>
                            下注
                            <Text style={styles.betTotalAmount}> {betTotalAmount.toFixed(2)} </Text>
                            元 (共{orderCount}注)
                        </Text>
                        {   position !== 'right' &&
                            <TouchableOpacity style={styles.betBtn}
                                              onPress={()=>{this.alongWithSubmitBet()}}>
                                <Text style={{color:'#DF2214'}}>一键跟单</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <ScrollView style={{backgroundColor: '#FFF'}}>
                    {
                        !!orderDetail && orderDetail.map((item,index)=>(
                            <TouchableOpacity key={index}
                                              style={styles.betItem}
                                              onPress={()=>{
                                                  betStore.hideOrderDetail();
                                                  position === 'right' &&
                                                  this.navigate('GameRecordDetail',{orderId: item.orderId})}}>
                                <Text style={styles.betItemText}>
                                    {`${item.playName} ${!!item.playContent ? item.playContent : ''}`}
                                </Text>
                                { position === 'right' && <Icon name='chevron-right' style={styles.rightIcon}/> }
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
                <View style={{marginVertical: 20}}>
                    <TouchableOpacity style={styles.close}
                                      onPress={()=>{ betStore.hideOrderDetail() }}>
                        <Icon name='x-circle' style={styles.closeIcon}/>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}
const styles = {
    modal: {
        flexDirection: 'column',
        width: width * 0.78,
        height: height* 0.62,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    header: {
        width: width * 0.78,
        height: 90,
        backgroundColor: '#DF2214',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    betDataWrap: {
        flexDirection: 'row',
        height: 26,
        paddingHorizontal: 15,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DF2214',
        backgroundColor: 'transparent',
    },
    details: {
        marginRight: 10,
        color: '#fff',
    },
    dataIcon: {
        width: 13,
        height: 12,
        marginRight: 8,
    },
    betTotalAmount: {
        color:'#F8E71C',
        fontWeight: 'bold'
    },
    betBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 68,
        height: 22,
        backgroundColor: '#F8E71C',
        borderRadius: 5,
    },
    close: {
        width: 31,
        height: 31
    },
    betItem: {
        width: width * 0.78 - 28 ,
        minHeight: 40,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E3E3E3',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 14,
    },
    betItemText: {
        color: '#333',
        lineHeight: 30,
        marginVertical: 5,
        backgroundColor: 'transparent',
    },
    rightIcon: {
        width: 18,
        color:'#E3E3E3',
        fontSize:25,
    },
    closeIcon: {
        color:'#E3E3E3',
        fontSize:32,
    }
};
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    LayoutAnimation,
    Platform
} from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../../store';
import { Alert, showToast } from '../../../utils';
const isIos = Platform.OS === 'ios';
import CustomKeyboard from 'react-native-custom-keyboard';
import {profileStore} from "../../../store/index";

const { width } = Dimensions.get('window');

@inject('betStore')
@observer
export default class Bottom extends Component {
    constructor(props){
        super(props);
        const { betMinAmount } = betStore.playList[betStore.activeTabIndex];
        this.state={
            isOpenKeyboard: false,
            isSubmitting: false,
        };
        this.clickTime = new Date();
        this.onPressBetHandle = this.onPressBetHandle.bind(this);
        this.toggleCustomKeyboard = this.toggleCustomKeyboard.bind(this);
        this.checkSubmitBtnStatus = this.checkSubmitBtnStatus.bind(this);
        this.checkBalance = this.checkBalance.bind(this);
        if (!!betMinAmount){
            betStore.changeBetAmount(betMinAmount);
        } else {
            betStore.changeBetAmount(0);
        }
    }
    toggleCustomKeyboard (status) {
        this.setState({
            isOpenKeyboard: status!== undefined ? status : !this.state.isOpenKeyboard
        }, () => {
            LayoutAnimation.configureNext({
                duration: 300,
                create: {
                    type: LayoutAnimation.Types.linear,
                    property: LayoutAnimation.Properties.scaleXY,
                },
                update: {
                    type: LayoutAnimation.Types.linear,
                },
            })

        })
    }
    onKeyboardPress (amount) {
        if (amount.length > 10) return false;
        let betAmount = 0;
        if (!!amount) {
            betAmount = amount.replace(/^(\.)/, '').replace(/(\.{2})/g, '.');
        };
        betStore.changeBetAmount(betAmount)
    }
    checkBalance () {
        const { betTotalAmount } = betStore;
        const { balance } = profileStore.userInfo;
        if (betTotalAmount <= balance) {
            return Promise.resolve()
        } else {
            this.Alert.alert('', '余额不足',[{
                text: '取消',
                onPress: () => {}
            }, {
                text: '去充值',
                onPress: () => {
                    betStore.betPanelStatus = false;
                    this.props.navigate('ChildPayIn');
                }
            }]);
            return Promise.reject()
        }
    }
    onPressBetHandle () {
        const { betMaxAmount, betMinAmount } = betStore.playList[betStore.activeTabIndex];
        const { isOpenKeyboard } = this.state;
        const {betAmount} = betStore;
        if(betMaxAmount!==0 && betAmount > betMaxAmount) return showToast(`投注金额不能大于${betMaxAmount}元`);
        if(betAmount < betMinAmount) return showToast(`投注金额不能小于${betMinAmount}元`);
        const curTime = new Date();
        if (curTime - this.clickTime < 500) return false;
        this.clickTime = curTime;
        if(/^\d+(\.\d{1,2})?$/.test(betAmount)) {
            isOpenKeyboard && this.keyboard.close();
            this.checkBalance()
                .then(() => betStore.submitBet(betAmount))
                .catch(err => {
                    if (!!err && !!err.message) {
                        showToast(err.message)
                    }
                })
        }else {
            showToast(`投注金额最多两位小数`);
        }
    }
    checkSubmitBtnStatus (meta, selectedLen, amount) {
        const { isIssueClosed } = this.props;
        if (meta === 'zhengMaGg' ) {
            return !isIssueClosed && betStore.selectedBall.length >= 2 && amount > 0;
        } else {
            return !isIssueClosed && selectedLen > 0 && amount > 0;
        }
    }

    render () {
        const { isOpenKeyboard } = this.state;
        const { onPressRefButton, isIssueClosed } = this.props;
        const { betTotalAmount, orderCount, betAmount } = betStore;

        const meta = betStore.playList[betStore.activeTabIndex].meta;
        const isSubmit = this.checkSubmitBtnStatus(meta, orderCount, betAmount);
        return (
            <View style={[styles.container, isOpenKeyboard && {height: 274}]}>
                <Text style={styles.orderBar}>
                    {`${orderCount} 注共`}
                    <Text style={{color:'#EC0909'}}>
                        { betTotalAmount }
                    </Text>
                    元
                </Text>
                <View style={styles.betBox}>
                    <TouchableOpacity
                        style={styles.refBtn}
                        onPress={() => {
                            isOpenKeyboard && this.keyboard.close();
                            onPressRefButton && onPressRefButton();
                        }}>
                        <Image
                            style={{width:20,height:20}}
                            source={require('../../../assets/images/icon_ref.png')} />
                        <Text style={styles.blueColor}>说明</Text>
                    </TouchableOpacity>
                    <View style={styles.amountInput}>
                        <Text>单注</Text>
                        <Text style={styles.input}
                              onPress={() => {
                                  if (isOpenKeyboard) {
                                      this.keyboard.close();
                                  } else {
                                      this.toggleCustomKeyboard(true)
                                  }

                              }}>
                            { !!betAmount ? parseFloat(betAmount) : '请输入' }
                        </Text>
                        <Text>元</Text>
                    </View>
                    <TouchableOpacity
                        onPress={()=>{this.onPressBetHandle()}}
                        disabled={!isSubmit}
                        style={[styles.betBtn, !isSubmit && styles.disabledBtn]}>
                        <Text style={{ color: '#fff'}}>
                            {isIssueClosed ? '封盘中' : '投注'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <CustomKeyboard
                    ref={(keyboard) => {this.keyboard=keyboard}}
                    isOpen={isOpenKeyboard}
                    backdrop={false}
                    defaultValue={ betAmount }
                    underlayColor={'#E3E3E3'}
                    onClosedHandle={() => {this.toggleCustomKeyboard(false)}}
                    onButtonPress={() => {isSubmit && this.onPressBetHandle()}}
                    onTextChange={(text) => {this.onKeyboardPress(text)}}/>
                <Alert ref={ ref => this.Alert = ref } />
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        height: 74,
    },
    orderBar: {
        width: width,
        height: 24,
        lineHeight: 24,
        backgroundColor: '#E5E9F2',
        textAlign: 'center',
    },
    betBox: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    refBtn: {
        width: 54,
        height: 50,
        borderRightColor: '#A7A7A7',
        borderRightWidth: StyleSheet.hairlineWidth,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    blueColor: {
        color: '#4A90E2',
        fontSize: 12,
        padding: 3
    },
    amountInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width:105,
        height: 30,
        lineHeight: isIos ? 16 : 12,
        backgroundColor: '#F7F7F7',
        borderColor: '#DADADA',
        borderWidth: StyleSheet.hairlineWidth,
        textAlign: 'center',
        color: '#666',
        borderRadius: 5,
        marginHorizontal: 8,
        fontSize: 16,
        paddingVertical: 8,
    },
    betBtn: {
        width: 60,
        height: 30,
        borderColor: '#EC0909',
        backgroundColor: '#EC0909',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    disabledBtn: {
        backgroundColor: '#AEAEAE',
        borderColor: '#AEAEAE',
    }
});
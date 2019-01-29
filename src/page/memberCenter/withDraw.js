import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Platform,
    Image,
    StyleSheet,
} from 'react-native';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation';

import { memberBankCard } from '../../assets/style';
import AppButton from '../../component/appButton';
import memberService from '../../service/memberService';
import Spinner from 'react-native-spinner';
import Password from 'react-native-password';
import { showToast, verification, formatBankCardNo, formatAmount } from '../../utils';
import errorHandle from '../../service/errorHandle';
import Header from '../../component/header';
import CustomKeyboard from 'react-native-custom-keyboard';


const styles = memberBankCard;
const isIos = Platform.OS === 'ios' ;
export default class WidthDraw extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bankCard: {},
            userInfo: {},
            isCanSubmit: false,
            isConnecting: false,
            isOpenModal: false,
            amount: '',
            fundsPassword: '',
            isOpenKeyboard: true,
            keyboardType: 'amount'
        };
        this.setButtonStatus = this.setButtonStatus.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.togglePasswordInput = this.togglePasswordInput.bind(this);
        this.openPasswordInput = this.openPasswordInput.bind(this);
        this.toggleCustomKeyboard = this.toggleCustomKeyboard.bind(this);
        this.onKeyboardPress = this.onKeyboardPress.bind(this);
        this.onKeyboardConfirm = this.onKeyboardConfirm.bind(this);
        this.headerRight = this.headerRight.bind(this);
        this.navigate = props.navigation.navigate;
        this.navigation = props.navigation;
    };

    async getBankCardList() {
        try {
            const res = await memberService.restoreUserBankCardFromStorage();
            console.log('提现，获取银行卡信息');
            console.log(res);
            this.setState({bankCard: res})
        } catch (err) {
            console.log(err);
        }
    };

    getUserInfo() {
        memberService.getUserInfo().then(res => {
            console.log('提现， 获取用户信息');
            console.log(res);
            this.setState({
                userInfo: {...res}
            })
        }).catch(err => {
            errorHandle(err).then(res => {
                if(res.routeName && res.routeName) {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: res.routeName})]
                    });
                    this.props.navigation.dispatch(resetActions);
                }
            })
        })
    };

    setButtonStatus() {
        this.setState({
            isCanSubmit: !!this.state.amount
        })
    };

    submitForm(text) {
        const pwd = text || this.state.fundsPassword;
        if (pwd.length === 6) {
            const cardNo = this.state.bankCard.list[0].cardNumber;
            const data ={
                cardNumber: cardNo,
                amount: parseFloat(this.state.amount),
                fundsPassword: pwd
            };
            this.toggleSpinner(true);
            memberService.withDraw(data).then(res => {
                this.toggleSpinner(false);
                showToast(res.message, {onHide: () => {
                    this.togglePasswordInput(false, () => {
                        this.navigation.goBack();
                    });
                }})
            }).catch(err => {
                this.toggleSpinner(false);
                errorHandle(err).then(res => {
                    if(res.routeName && res.routeName) {
                        const resetActions = NavigationActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: res.routeName})]
                        });
                        this.props.navigation.dispatch(resetActions);
                    }
                });
            })
        }
    };

    toggleSpinner(status, done) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        }, () => {
            done && done()
        });
    };

    togglePasswordInput(status, done) {
        this.setState({
            isOpenModal: status !== undefined ? status : !this.state.isOpenModal
        }, () => {
            done && done()
        });
    };
    openPasswordInput() {
        const {userInfo} = this.state;
        const allowWithDrawAmount = userInfo.allowWithDrawAmount ? userInfo.allowWithDrawAmount : userInfo.balance;
        console.log(this.state.amount , allowWithDrawAmount);
        const amount = parseFloat(this.state.amount);
        if (!amount) {
            return showToast('请输入正确的金额', {
                onHide: () => {
                    this.setState({
                        amount: ''
                    });
                }
            })
        }
        if (amount > parseFloat(allowWithDrawAmount)) {
            return showToast('输入金额不能大于可提现金额');
        }
       if (amount < userInfo.withdrawMinAmount) {
            return showToast(`当前最小提现金额为 ${userInfo.withdrawMinAmount} 元`);
        }
        if (amount > userInfo.withdrawMaxAmount) {
            return showToast(`当前最大提现金额为 ${userInfo.withdrawMaxAmount} 元`)
        }
        return this.togglePasswordInput(true, () => {
            this.setState({
                keyboardType: 'fundsPassword'
            })
        });
    };
    toggleCustomKeyboard (status, done) {
        this.setState({
            isOpenKeyboard: status !== undefined ? status : !this.state.isOpenKeyboard
        }, () => {
            done && done()
        })
    }
    onKeyboardPress (text) {
        if (this.state.keyboardType === 'amount') {
            this.setState({ amount: text }, () => {
                this.setButtonStatus()
            });
        } else {
            this.setState({ fundsPassword: text })
        }
    }
    onKeyboardConfirm (text) {
        const { keyboardType } = this.state;
        if (keyboardType === 'amount') {
            this.openPasswordInput();
        } else if (keyboardType === 'fundsPassword'){

        }
    }
    componentWillMount() {
        this.getBankCardList();
        this.getUserInfo();
    };
    headerRight() {
        return (
            <TouchableOpacity onPress={()=>{
                this.navigate('HtmlPage', {
                    title: '提现说明',
                    type: 'withdrawalsDesc'
                })
            }}>
                <Text style={{color: '#FFF'}}>
                    提现说明
                </Text>
            </TouchableOpacity>
        )
    }
    render() {
        const {bankCard, userInfo, isCanSubmit, isConnecting, amount, isOpenModal, isOpenKeyboard, fundsPassword, keyboardType} = this.state;
        const bankCardList = bankCard.list ? bankCard.list[0] : [];
        return (
            <View style={widthDrawStyle.container}>
                <Header headerTitle = '提现'
                        headerRight={this.headerRight}
                        navigation = {this.navigation}/>
                <Text style={widthDrawStyle.userInfo}>
                    {userInfo.username} 余额：<Text
                    style={{color: '#FF1000'}}>{userInfo.balance}</Text>元
                </Text>
                <View style={styles.cardList}>
                    {
                        bankCardList.bankIcon ? (
                            <Image style={styles.bankIcon}
                                   source={{uri: bankCardList.bankIcon}}/>
                        ) : (
                            <Image style={styles.bankIcon}
                                   source={require('../../assets/images/bankIcon.png')}/>
                        )
                    }
                    <View>
                        <Text style={styles.bank}>{bankCardList.bankName}</Text>
                        <Text
                            style={styles.text}>{formatBankCardNo(bankCardList.cardNumber)}</Text>
                    </View>
                </View>
                <View style={widthDrawStyle.inputBox}>
                    <Text style={widthDrawStyle.title}>提现金额</Text>
                    <View style={{flexDirection: 'row'}}>
                        <View style={widthDrawStyle.symbol}>
                            <Text style={{fontSize: 28}}>¥</Text>
                        </View>
                        <Text style={[widthDrawStyle.input, {color: !!amount ? '#333' : '#999'}]}
                              onPress={() => this.toggleCustomKeyboard(!isOpenKeyboard, () => {
                                  this.setState({
                                      keyboardType: 'amount'
                                  });
                              })}>
                            {!!amount ? amount : '0.00'}
                        </Text>
                    </View>
                    <Text style={widthDrawStyle.tips}>
                        可提现金额:
                        <Text>{userInfo.allowWithDrawAmount}</Text>
                        元
                    </Text>
                </View>
                <AppButton
                    style={{marginHorizontal: 10}}
                    title="下一步"
                    isDisabled={!isCanSubmit}
                    onPressHandle={() => {
                        this.toggleCustomKeyboard(true, () => {
                            this.onKeyboardConfirm();
                        })
                    }}
                />
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={"正在加载"}
                         textStyle={{color: '#333', fontSize: 16}}/>
                <Modal style={widthDrawStyle.modal}
                       position={"top"}
                       ref={"modal"}
                       swipeToClose={false}
                       backdropPressToClose={false}
                       onClosed={() => this.togglePasswordInput(false)}
                       isOpen={isOpenModal}>
                    <View style={widthDrawStyle.modalTopBar}>
                        <Icon style={widthDrawStyle.modalCloseBtn}
                              name="ios-close-circle-outline"
                              size={24} color="#5B5B5B"
                              onPress={() => this.togglePasswordInput(false, () => {
                                  this.setState({
                                      fundsPassword: '',
                                      isOpenKeyboard: false,
                                      keyboardType: 'amount'
                                  })
                              })}/>
                        <Text style={widthDrawStyle.modalTitle}>请输入资金密码</Text>
                    </View>
                    <Text style={widthDrawStyle.subTitle}>提现</Text>
                    <Text style={widthDrawStyle.amount}>¥ {parseFloat(amount).toFixed(2)}</Text>
                    <Password maxLength={6}
                              onChange={(text) => {this.submitForm(text)}}
                              onPress={() => {this.toggleCustomKeyboard(true)}}
                              password={fundsPassword}/>
                </Modal>
                <CustomKeyboard isOpen={isOpenKeyboard}
                                defaultValue={keyboardType === 'amount' ? amount : fundsPassword}
                                backdrop={keyboardType === 'amount'}
                                underlayColor={'#E3E3E3'}
                                onClosedHandle={() => this.toggleCustomKeyboard(false)}
                                onButtonPress={(text) => {this.onKeyboardConfirm(text)}}
                                onTextChange={(text) => {this.onKeyboardPress(text)}}/>
            </View>
        )
    }
}
const widthDrawStyle = StyleSheet.create({
    container: {
        flex: 1
    },
    userInfo: {
        padding: 10
    },
    inputBox: {
        backgroundColor: '#FFF',
        padding: 10,
        marginBottom: 30,
        flexDirection: 'column'
    },
    title: {
        paddingBottom: 20,
        fontSize: 14,
        color: '#666',
    },
    symbol:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: isIos ? 30 : 60,
    },
    inputFile: {
        flexDirection: 'row',
        alignItems: 'center' ,
        justifyContent:'flex-start',
    },
    input: {
        fontSize: 28,
        flex: 10,
        height: isIos ? 30 : 'auto',
        paddingVertical: isIos ? 0 : 11,
    },
    tips: {
        color: '#6A6A6A',
        paddingVertical: 10,

    },
    modal: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 270,
        height: 190,
        borderRadius: 8,
        marginTop: 100,
    },
    modalTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding:10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5',
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    amount: {
        fontSize: 34,
        marginBottom: 10},
    modalCloseBtn: {
        flex: 1,
    },
    modalTitle: {
        flex: 2,
        color: '#333',
        fontSize: 16
    }
})

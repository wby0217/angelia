import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    Image,
    ScrollView,
    AppState,
    Linking,
} from 'react-native';
import { observer, inject } from 'mobx-react/native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from '../component/customTabBar';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinner';
import { NavigationActions } from 'react-navigation';

import { payGroupStore, profileStore } from '../store';
import { getPayTypeList, rechargeOnline, getFriendsPayAccount } from '../service';
import memberService from '../service/memberService';
import { checkIsLogin } from '../service/authService';
import errorHandle from '../service/errorHandle';
import * as Utils from '../utils';
import PayTypeItem from './payIn/payTypeItem';
import { CARDLIST, PAYTYPELIST } from './payIn/payCardList';
import CustomKeyboard from 'react-native-custom-keyboard';
import ScrollableTabBar from '../component/scrollerTabBar';
import Alert from '../utils/alert';
import Header from '../component/header';

const { width, height } = Dimensions.get('window');

@inject('payGroupStore')
@observer
class PayIn extends Component {
    constructor (props) {
        super(props)
        this.state = {
            payInMount: '',
            payTypeList: [],
            payTypeId: '',
            bankId: '',
            bankList: [],
            userInfo: {},
            isConnecting: false,
            isShowBankList: false,
            isOpenKeyboard: false,
            routeName: props.navigation.routeName
        };
        this.rechargeInfo = {};
        this.selectedRechargeType = {};
        this.selectedBankId = -1;
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.fetchPayTypeList = this.fetchPayTypeList.bind(this);
        this.restoreBankListFromStorage = this.restoreBankListFromStorage.bind(this);
        this.renderBankList = this.renderBankList.bind(this);
        this.selectRechargeType = this.selectRechargeType.bind(this);
        this.toggleShowBankList = this.toggleShowBankList.bind(this);
        this.requestOnlineRecharge = this.requestOnlineRecharge.bind(this);
        this.requestOfflineQRPay = this.requestOfflineQRPay.bind(this);
        this.onKeyboardPress = this.onKeyboardPress.bind(this);
        this.navigation = props.navigation;
        this.navigate = props.navigation.navigate;
        this.headerRight = this.headerRight.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused) {
            this.getPayInData();
        }
    }
    componentWillMount() {
        console.log('====== profileStore =======', profileStore);
        this.getPayInData();
    };
    getPayInData () {
        if (profileStore.isLogin) {
            profileStore.fetchUserInfo();
            this.restoreBankListFromStorage().catch((err) => errorHandle(err))
        }
    };
    fetchPayTypeList () {
        return getPayTypeList().then((res) => {
            this.setState({
                payTypeList: res.list,
            });
            return Promise.resolve();
        }).catch(err => {
            return Promise.reject(err);
        });
    };
    restoreBankListFromStorage() {
        return memberService.restoreBankListFromStorage().then(res => {
            console.log('restoreBankListFromStorage===', res);
            this.setState({
                bankList: res.list
            });
            return Promise.resolve();
        }).catch(err => Promise.reject(err))
    };
    fetchUserInfo () {
        return memberService.getUserInfo().then(res => {
            this.setState({
                userInfo: res
            });
            return Promise.resolve();
        }).catch(err => Promise.reject(err));
    };
    toggleSpinner (status, callback) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        }, () => {
            callback && callback()
        });
    };
    toggleShowBankList (status, callback) {
        this.setState ({
            isShowBankList: status ? status : !this.state.isShowBankList
        }, () => {
            callback && callback();
        })
    };
    requestOnlineRecharge () {
        const { payInMount } = this.state;
        const data = {
            amount: payInMount,
            payTypeId: this.selectedRechargeType.id
        };
        const actionType = this.selectedRechargeType.actionType;
        if ( this.selectedBankId >= 0) { data.bankId = this.selectedBankId};
        this.toggleSpinner(true);
        rechargeOnline(data).then(res => {
            this.toggleSpinner(false);
            console.log('rechargeOnline', res);
            console.log('selectedRechargeType', this.selectedRechargeType);
            this.rechargeInfo = Object.assign(res, this.selectedRechargeType);
            /* 操作类型 1、在线扫码支付，2、网银支付、3、公司入账，4、 线下二维码支付 */
            if (actionType === 2 || actionType === 7) {
                Linking.canOpenURL(res.rechargeUrl).then(supported => {
                    if (supported) {
                        return Linking.openURL(res.rechargeUrl);
                    } else {
                        return showToast('不能打开该网址!', {
                            onHide: () => Promise.reject()
                        });
                    }
                }).then(() => {
                    this.navigate('RechargeResult', {...this.rechargeInfo })
                }).catch(err => {
                    console.log('canOpenURL', err);
                })
            } else if (actionType === 1) {
                this.navigate('ShowRechargeCode', {rechargeInfo: this.rechargeInfo})
            }
        }).catch(err => {
            this.toggleSpinner(false);
            console.log('rechargeOnline err', err);
            errorHandle(err).then(res => {
                res.routeName && this.navigate(res.routeName)
            })
        })
    };
    requestOfflineQRPay () {
        this.toggleSpinner(true);
        const { payInMount } = this.state;
        const rechargeInfo = Object.assign({amount: parseFloat(payInMount)}, this.selectedRechargeType);
        getFriendsPayAccount({payTypeId: this.selectedRechargeType.id}).then(res => {
            this.toggleSpinner(false);
            this.navigate('FriendPay', {rechargeInfo: rechargeInfo, payAccount: res.data});
        }).catch(err => {
            this.toggleSpinner(false);
            console.log(err);
            errorHandle(err).then(res => {
                res.routeName && this.navigate(res.routeName)
            })
        })
    }
    selectRechargeType (rechargeType) {
        console.log(rechargeType);
        this.selectedRechargeType = rechargeType;
        this.selectedBankId = -1;
        const { payInMount } = this.state;
        /* 操作类型 1、在线扫码支付，2、网银支付、3、公司入账，4、 线下二维码支付  7、一键支付 */
        switch (rechargeType.actionType) {
            case 3:
                this.navigate('BankAccountList', {payInMount});
                break;
            case 2:
                this.toggleShowBankList(true);
                break;
            case 1:
            case 7:
                this.requestOnlineRecharge();
                break;
            default:
                this.requestOfflineQRPay();
                break;
        }
    };
    onPressBankHandle (item) {
        this.selectedBankId = item.id;
        this.toggleShowBankList(false, () => {
            setTimeout(this.requestOnlineRecharge, 400);
        });
    };
    renderBankList (bankList) {
        return  !!bankList && bankList.map((item, index) => {
            const imageUrl = item.image ? {uri: item.image} : require('../assets/images/bankIcon.png');
            return (
                <TouchableOpacity style={styles.bankItem}
                                  onPress={() => this.onPressBankHandle(item)}
                                  key={index}>
                    <Image style={styles.bankIcon} source={imageUrl} />
                    <Text style={styles.bankName}>{item.name}</Text>
                </TouchableOpacity>
            )
        })
    };
    toggleCustomKeyboard (status, done) {
        this.setState({
            isOpenKeyboard: status !== undefined ? status : !this.state.isOpenKeyboard
        }, () => {
            done && done()
        })
    }
    onKeyboardPress (text) {
        this.setState({ payInMount: text.replace(/^(\.)/, '').replace(/(\.{2})/g, '.') })
    }
    headerRight() {
        return (
            <TouchableOpacity onPress={() => {
                this.navigate('HtmlPage', {
                    title: '充值说明',
                    type: 'rechargeDesc'
                })
            }}>
                <Text style={{color: '#FFF'}}>充值说明</Text>
            </TouchableOpacity>
        )
    }
    render() {
        const { isConnecting,payInMount, bankList, isShowBankList, isOpenKeyboard} = this.state;
        const { isLogin, userInfo } = profileStore;
        return (
            <View style={styles.container }>
                <Header headerTitle = '充值'
                        navigation={this.navigation}
                        headerRight={this.headerRight}
                        headerLeft={this.navigation.state.routeName === 'ChildPayIn' ? undefined : null} />
                <View style={styles.payTypeListWarp}>
                    {isLogin ? payGroupStore.payGroup && payGroupStore.payGroup.totalNum > 0 && (
                        <View style={{flex: 1}}>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingTop:10 }}>
                                <Text style={{ color: '#43ACFA' }}>
                                    {isLogin ? ( userInfo.username ? userInfo.username : userInfo.userNickname ) : '..'}
                                </Text>
                                <Text style={{ marginLeft: 5 }}>余额: </Text>
                                <Text style={{ color: '#EC0909' }}>{userInfo.balance || '0.00'}</Text>
                                <Text> 元</Text>
                            </View>
                            <View style={styles.amountInput}>
                                <Text style={{ width: 70, paddingBottom: 0 }}>充值金额:</Text>
                                <Text style={[styles.amountText,  {color: !!payInMount ? '#333' : '#999'}]}
                                      onPress={() => this.toggleCustomKeyboard(true)}>
                                    {payInMount ? payInMount : '请输入充值金额'}
                                </Text>
                            </View>
                            <View style={styles.amountList}>
                                {CARDLIST.length && CARDLIST.map((item, index) =>
                                    <TouchableOpacity
                                        onPress={() => this.setState({ payInMount: item.value})}
                                        key={index}
                                        style={[styles.cardItem]}
                                        activeOpacity={0.8}>
                                        <Text style={payInMount === item.value ? styles.cardIsActiveText : null}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={{ fontSize: 14, color: '#999999' , padding: 10}}>选择支付方式</Text>
                            <ScrollableTabView
                                renderTabBar={() => payGroupStore.payGroup.totalNum > 4 ? <ScrollableTabBar/> : <DefaultTabBar/>}
                                tabBarUnderlineStyle={{ backgroundColor: '#FF0033',height: 2 }}
                                tabBarActiveTextColor="#DD1B00"
                                tabBarInactiveTextColor="#2D2D2D"
                                tabBarBackgroundColor="#fff"
                                initialPage={0}>
                                { payGroupStore.payGroup.list.map((item, index) => {
                                    return <PayTypeItem key={index}
                                                        tabLabel={item.groupName}
                                                        params={item}
                                                        userInfo={userInfo}
                                                        payInMount={payInMount}
                                                        bankList={bankList}
                                                        onSelected={this.selectRechargeType}
                                                        navigation={this.props.navigation}/>
                                })}
                            </ScrollableTabView>
                        </View>
                    ) : (
                        <View style={styles.noLogin}>
                            <Image style={styles.noLoginIcon} source={require('../assets/images/loginTip.png')}/>
                            <Text style={styles.tip}>登录后才能充值哟</Text>
                            <TouchableOpacity style={styles.loginTips}
                                              onPress={() => {
                                                  const resetActions = NavigationActions.reset({
                                                      index: 0,
                                                      actions: [NavigationActions.navigate({routeName: 'Login'})]
                                                  });
                                                  this.props.navigation.dispatch(resetActions);
                                              }}>
                                <Text style={styles.loginLink}>点击立即登录</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textStyle={{color: '#333', fontSize: 16}} />
                <Modal style={styles.bankListModal}
                       position={"bottom"}
                       backdropPressToClose={false}
                       swipeToClose={false}
                       isOpen={isShowBankList}>
                    <View style={styles.modalTitleBar}>
                        <Text style={styles.titleText}>请选择银行</Text>
                        <TouchableOpacity onPress={() => this.toggleShowBankList(false)}>
                            <Icon size={16} name="times-circle" color="#999"/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {this.renderBankList(bankList)}
                    </ScrollView>
                </Modal>
                <CustomKeyboard isOpen={isOpenKeyboard}
                                defaultValue={ payInMount }
                                underlayColor={'#E3E3E3'}
                                onClosedHandle={() => this.toggleCustomKeyboard(false)}
                                onButtonPress={(text) => {this.toggleCustomKeyboard(false)}}
                                onTextChange={(text) => {this.onKeyboardPress(text)}}/>
                <Alert ref={ ref => this.Alert = ref } />
            </View>
        );
    };
    componentWillUnmount () {
        this.toggleShowBankList(false);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 10,
        backgroundColor: '#F6F6F6',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    amountInput: {
        backgroundColor: '#fff',
        padding: 10,
        marginTop: 10,
        flexDirection: 'row' ,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E1E1E1',
        borderTopColor: '#E1E1E1'
    },
    amountText: {
        flex:1,
        paddingLeft: 5,
        height: 20,
        paddingVertical: 0,
        fontSize: 14,
        color: '#666',
        justifyContent: 'center'
    },
    amountList: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingVertical: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E1E1E1',
    },
    cardItem: {
        backgroundColor: '#fff',
        width: width/4,
        alignItems: 'center',
        paddingVertical: 10,
    },
    activeClass: {
        backgroundColor: '#FF2841',
    },
    activeTextClass: {
        color: '#DF2214'
    },
    payTypeListWarp: {
        flex:1,
        backgroundColor: '#fff',
    },
    payTypeList: {
        flex:1,
        flexDirection: 'column',
        height: 50,
        paddingVertical: 5,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: StyleSheet.hairlineWidth,
        justifyContent: 'space-around'
    },
    bankListModal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height-200,
    },

    modalTitleBar: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5'
    },
    noLogin: {
        flex: 1,
        alignItems: 'center'
    },
    tip: {
        height: 60,
        lineHeight: 60,
        color:'#666',
        fontSize:14,
        marginBottom: 53,
    },
    noLoginIcon: {
        width:width/1.8,
        height:height/4,
        marginTop: 60
    },
    cardIsActiveText: {
        color: '#DF2214',
        fontWeight: 'bold'
    },
    loginTips: {
        width: 230,
        height: 40,
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: '#DF2214',
        borderRadius: 5,
        alignSelf: 'center',
    },
    loginLink: {
        fontSize: 16,
        color: '#FFF',
    },
    titleText: {
        flex: 10,
        fontSize: 14,

    },
    bankItem: {
        flex: 1,
        flexDirection: 'row',
        width: width,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5'
    },
    bankIcon: {
        width: 30,
        height: 30,
        marginRight:20
    },
});

export default withNavigationFocus(PayIn, 'PayIn');

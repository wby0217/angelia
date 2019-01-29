import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Platform,
    NativeModules
} from 'react-native';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { NavigationActions } from 'react-navigation';

import Spinner from 'react-native-spinner';
import ListItem from '../../component/listItem';
import memberService from '../../service/memberService';
import { showToast } from '../../utils';
import errorHandle from '../../service/errorHandle';
import networkTool from "../../utils/netWorkTool";

const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
const isIPhoneX = NativeModules.DeviceInfo.isIPhoneX_deprecated;

class MemberWallet extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props){
        super(props);
        this.state = {
            userInfo: {
                balance: 0.00,
            },
            isConnecting: false,
            bankCard: {},
            network: true
        }
        this.switchNavigate = this.switchNavigate.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.getPageData = this.getPageData.bind(this);
        this.getBankCardInfo = this.getBankCardInfo.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.navigate = props.navigation.navigate;

    };
    getBalance() {
        return memberService.getUserInfo().then(res => {
            console.log('mywallet 获取用户信息 ======');
            console.log(res);
            this.setState({
                userInfo: {...res}
            });
            return Promise.resolve();
        }).catch(err => {
            console.log(err);
            return Promise.reject(err);
        })
    };
    getBankCardInfo () {
        return memberService.restoreUserBankCardFromStorage().then(res => {
            console.log('mywallet 获取银行卡信息 ======');
            console.log(res);
            this.setState({
                bankCard: res
            });
            return Promise.resolve();
        }).catch(err => {
            console.log(err);
            return Promise.reject(err);
        })
    };
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    switchNavigate (routeName) {
        if (!this.state.network) return showToast(networkTool.NOT_NETWORK);
        const { userInfo, bankCard } = this.state;
        if ( userInfo.telephone === '' ) {
            return showToast('请绑定手机号码', {onHide: ()=> this.navigate('MemberPhoneNumber')})
        };
        if ( !!!userInfo.isSetFundsPW ) {
            return showToast('请设置提现密码', {onHide: ()=> this.navigate('SetFundsPassword')})
        };
        if ( !bankCard.totalNum > 0 ) {
            return showToast('请绑定银行卡', {onHide: ()=> this.navigate('BindBankCard')})
        }
        this.navigate(routeName);
    }
    getPageData () {
        this.toggleSpinner(true);
        this.getBalance()
            .then(this.getBankCardInfo)
            .then(() => this.toggleSpinner(false))
            .catch(err => {
                this.toggleSpinner(false);
                errorHandle(err).then(res => {
                    if(res && res.routeName){
                        const resetActions = NavigationActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: res.routeName})]
                        });
                        this.props.navigation.dispatch(resetActions);
                    }
                    if (res.network && res.network === 'error') {
                        this.setState({network: false})
                    }
                })
            })
    };
    componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused) {
            this.getPageData();
        }
    }
    componentWillMount() {
        this.getPageData();
    };
    render () {
        const { goBack } = this.props.navigation;
        const { userInfo , isConnecting} = this.state;
        return (
            <View style={styles.container}>
                <ImageBackground style={[styles.myWalletHeaderBg,{height: isIPhoneX ? 185 : 175,}]} source={require('../../assets/images/my_wallet_header_bg.png')}>
                    <View style={[styles.myWalletHeader,{paddingTop: isIos ? (isIPhoneX ? 40 : 30) : 20,}]}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => goBack(null)}>
                            <Image style={styles.iconBack} source={require('../../assets/images/icon_back.webp')} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitile}>我的钱包</Text>
                    </View>
                    <View style={styles.accountInfo}>
                        <Text style={[styles.accountText, {marginLeft: 5}]}>账户余额（元）</Text>
                        <Text style={[styles.accountText, styles.amount]}>
                            { userInfo.balance.toFixed(2) }
                        </Text>
                    </View>
                </ImageBackground>
                <ListItem
                    title="充值"
                    iconName = 'icon-purse'
                    bgColor='#43AFEF'
                    onPresshandle = {() => this.navigate('ChildPayIn')}
                />
                <ListItem
                    title="提现"
                    iconName = 'icon-withdraw'
                    bgColor='#FFA200'
                    onPresshandle = {() => {this.switchNavigate('WithDraw')}}
                />
                <ListItem
                    style={{marginTop: 10}}
                    title="充值记录"
                    iconName = 'icon-topup-record'
                    bgColor='#FFA200'
                    onPresshandle = {() => {this.navigate('RechargeRecord')}}
                />
                <ListItem
                    title="提现记录"
                    iconName = 'icon-expend-record'
                    bgColor='#5FCF67'
                    onPresshandle = {() => {this.navigate('WithDrawRecord')}}
                />
                <ListItem
                    style={{marginTop: 10}}
                    title="我的银行卡"
                    iconName = 'icon-bank-card'
                    bgColor='#FF7200'
                    onPresshandle = {() => {this.switchNavigate('MemberBankCard')}}
                />
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={"正在加载"}
                         textStyle={{color: '#333', fontSize: 16}} />
            </View>
        )
    }
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    myWalletHeaderBg: {
        width: width,
        flexDirection: 'column',
    },
    myWalletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10
    },
    backBtn: {
        flex: 0.5
    },
    iconBack: {
        height: 20,
        width: 10
    },
    headerTitile: {
        flex: 0.8,
        fontSize: 18,
        backgroundColor: 'transparent',
        color: '#FFF',
    },
    accountInfo: {
        flexDirection: 'column',
        marginTop: 30,
        marginHorizontal: 15,
    },
    accountText: {
        backgroundColor: 'transparent',
        color: '#FFF',
        fontSize: 14
    },
    amount: {
        fontSize: 40,
        marginTop: 20,
    },
    myWalletList: {
        flexDirection: 'column',

    }
});

export default withNavigationFocus(MemberWallet, 'MemberWallet');
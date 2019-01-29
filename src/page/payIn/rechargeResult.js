import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    InteractionManager,
    Platform,
    Image,
    ScrollView,
    Linking,
    AppState
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';

import AppButton from '../../component/appButton';
import { getRechargeInfo } from '../../service'
import errorHandle from '../../service/errorHandle'
import Spinner from 'react-native-spinner';
import Header from '../../component/header'

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios' ? true : false;
class RechargeResult extends Component {
    constructor(props){
        super(props);
        this.state = {
            isConnecting: false,
            rechargeResult: {},
            appState: AppState.currentState,
            buttonValue: '查询充值结果',
            isDisabled: false,
            timing: 0
        };
        this.timer = null;
        this.navigation = props.navigation;
        this.navigate = props.navigation.navigate;
        this.rechargeInfo = props.navigation.state.params;
        this.countTime = 0;
        this.getRechargeResult = this.getRechargeResult.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.onButtonPress = this.onButtonPress.bind(this);
        this.headerRight = this.headerRight.bind(this);
        this.startTiming = this.startTiming.bind(this);
    }
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        })
    }
    getRechargeResult () {
        this.toggleSpinner(true);
        getRechargeInfo({orderNo: this.rechargeInfo.orderNo})
            .then(res => this.setState({rechargeResult: res.data}, () => {console.log('充值结果===', res)}))
            .then(() => this.toggleSpinner(false))
            .catch(err => {
                this.toggleSpinner(false);
                errorHandle(err).then(err => {
                    if (err.routeName && err.routeName==='Login') {
                        this.navigate('Login')
                    }
                })
            })
    }
    handleAppStateChange (nextAppState) {
        console.log('current appState ===', this.state.appState);
        console.log('nextAppState appState ===', nextAppState);
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.getRechargeResult()
        }
        this.setState({appState: nextAppState});
    };
    onButtonPress () {
        if (!!this.state.rechargeResult.status) {
            this.navigate('PayIn');
        } else {
            this.startTiming();
            this.getRechargeResult();
        }
    }
    headerRight() {
        return (
            <TouchableOpacity onPress={() => this.navigation.navigate('ServiceCenter')}>
                <Text style={{color: '#FFF',}}>客服</Text>
            </TouchableOpacity>
        )
    }
    startTiming() {
        this.countTime += 15;
        this.setState({
            timing: this.countTime
        }, () => {
            this.timer = setInterval(() => {
                if (this.state.timing === 0) {
                    clearInterval(this.timer);
                    this.setState({
                        isDisabled: false,
                        buttonValue: '查询充值结果'
                    });
                } else {
                    this.setState({
                        isDisabled: true,
                        timing: this.state.timing-1,
                        buttonValue: `请在 ${this.state.timing} 秒后再次查询`
                    });
                }
            }, 1000)
        });

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isFocused) {
            this.getRechargeResult();
        }
    }
    componentDidMount () {
        InteractionManager.runAfterInteractions(() => {
            this.getRechargeResult();
        });
        AppState.addEventListener('change', this.handleAppStateChange)
    }
    componentWillUnmount () {
        AppState.removeEventListener('change', this.handleAppStateChange);
        this.timer && clearInterval(this.timer);
    }
    render () {
        const { rechargeResult, isConnecting, buttonValue, isDisabled} = this.state;
        const resultIcon = !!rechargeResult.status ? (rechargeResult.status === 1 ? 'check' : 'times') : 'ellipsis-h';
        const resultText = !!rechargeResult.status ? (rechargeResult.status === 1 ? '充值成功' : '充值失败') : '充值未到账';
        return (
            <View style={styles.container}>
                <Header headerTitle="充值结果"
                        navigation={this.navigation}
                        headerRight={this.headerRight}/>
                <View style={styles.content}>
                    <View style={[styles.infoItem, {alignItems: isIOS ? 'center' : 'flex-start'}]}>
                        <View style={[styles.iconWarp,
                                    styles.warpBig,
                                    {marginTop: isIOS ? -2 : 0}]}>
                            <Icon color="#FFF" name="cny" size={24}/>
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.status}>充值完成，已提交成功</Text>
                            <Text style={styles.subInfo}>充值金额：{rechargeResult.rechargeAmount} 元</Text>
                        </View>
                    </View>
                    <View style={[styles.infoItem,
                                isIOS && styles.pt20,
                                { borderLeftColor: !!rechargeResult.status ? '#FF9F00': '#D2D2D2'  }]}>
                        <View style={[styles.iconWarp, styles.warpSmall, {
                            backgroundColor: !!rechargeResult.status ? '#FF9F00': '#D2D2D2'  }]}>
                            <Icon name="ellipsis-h" color="#FFF" size={18}/>
                        </View>
                        <View style={[styles.infoText,
                                     {borderLeftColor: !isIOS && !!rechargeResult.status ? '#FF9F00': '#D2D2D2'}]}>
                            <Text style={styles.status}>努力充值中</Text>
                            <Text style={styles.subInfo}>如果您已支付，预计1分钟到账，如未到账请联系客服</Text>
                        </View>
                    </View>

                    <View style={[styles.infoItem,
                                isIOS && styles.pt20,
                                {paddingBottom: 0},
                                {borderLeftColor: rechargeResult.status !== 2 ? '#D2D2D2' : '#FF9F00'}]}>
                        <View style={[styles.iconWarp, styles.warpSmall, {marginBottom: -2},
                            {backgroundColor:  rechargeResult.status !== 2 ? '#D2D2D2' : '#FF9F00'}]}>
                            <Icon color="#FFF" size={18} name={resultIcon}  />
                        </View>
                        <View style={[styles.infoText,
                                     {paddingBottom: 0},
                                     {borderLeftColor: !isIOS && rechargeResult.status !== 2 ? '#D2D2D2' : '#FF9F00' }]}>
                            <Text style={styles.status}>{resultText}</Text>
                        </View>
                    </View>
                </View>
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={"正在更新充值结果..."}
                         textStyle={{color: '#333', fontSize: 16}} />
                <AppButton style={styles.appBtn}
                           isDisabled = {isDisabled}
                           title={!!rechargeResult.status ? "完成" : buttonValue}
                           onPressHandle={() => this.onButtonPress()}/>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    pt20: {
        paddingTop: 20,
    },
    content: {
        marginVertical: 40,
        paddingLeft: isIOS ? 60 : 40,
        paddingRight: 20,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: isIOS ? 20 : 0,
        borderLeftWidth: isIOS ? 2 : 0,
        borderLeftColor: '#FF9F00',
        paddingLeft: isIOS? 0 : 24,
    },
    iconWarp: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF9F00',
    },
    warpBig: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginLeft: -24,
    },
    warpSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: -16,
        marginRight: 8
    },
    infoText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 5,
        paddingLeft: isIOS ? 20 : 44,
        marginLeft: isIOS ? 0 : -24,
        paddingBottom: isIOS ? 0 : 20,
        borderLeftWidth: isIOS ? 0 : 2,
        borderLeftColor: '#FF9F00',
    },
    status: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        paddingBottom: 5,
    },
    subInfo: {
        fontSize: 14,
        color: '#666',
    },
    appBtn: {
        marginHorizontal: 20
    }
});

export default withNavigationFocus(RechargeResult, 'RechargeResult');
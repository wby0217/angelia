import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import codePush from "react-native-code-push";
import { profileStore } from '../../store';
import { NavigationActions } from 'react-navigation';

import Spinner from 'react-native-spinner';
import ListItem from '../../component/listItem';
import AppButton from "../../component/appButton";
import { signOut } from "../../service/authService";
import { formatPhone } from "../../utils";
import memberService from "../../service/memberService";
import errorHandle from "../../service/errorHandle";
import networkTool from "../../utils/netWorkTool";
import { showToast, verification } from '../../utils';
import updateList from '../../config/updateLog';
const versionLog = {
    ios: require('../../../updateLog/log.ios.json'),
    android: require('../../../updateLog/log.android.json')
}
import Header from '../../component/header';
const updateLog = versionLog[Platform.OS]


const { height } = Dimensions.get('window');

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };
class MemberSettings extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props){
        super(props);
        this.state = {
            isConnecting: false,
            network: true,
            bankCard: {},
            userInfo: {},
            updateInfo: ''
        };
        this.switchNavigate = this.switchNavigate.bind(this);
        this.cleanCache = this.cleanCache.bind(this);
        this.signOut = this.signOut.bind(this);
        this.entryBankCardInfo = this.entryBankCardInfo.bind(this);
        this.onPressBindPhoneNum = this.onPressBindPhoneNum.bind(this);
        this.fetchVersion = this.fetchVersion.bind(this);
        this.navigate = props.navigation.navigate;
        this.navigation = props.navigation;
        console.log(updateLog)
    };
    cleanCache () {
        storage.remove({key: 'lotteryCategory'})
            .then(storage.remove({key: 'getRechargeType'}))
            .then(storage.remove({key: 'userInfo'}))
            .then(storage.remove({key: 'bankList'}))
            .then(storage.remove({key: 'userBankCard'}))
            .then(storage.remove({key: 'appSettings'}))
            .then(storage.remove({key: 'payGroup'}))
            .then(storage.remove({key: 'carouselList'}))
            .then(() => showToast('清除成功'))
            .catch(err => console.log(err))
    };
    signOut () {
        this.setState({
            isConnecting: true,
        });
         signOut().then(res => {
            profileStore.clearUserInfo();
            this.setState({isConnecting: false});
            this.navigation.goBack();
        }).catch(err => {
            this.setState({isConnecting: false});
            profileStore.clearUserInfo();
             this.navigation.goBack();
        })
    };
    switchNavigate (routeName) {
        this.navigate(routeName)
    };
    onPressBindPhoneNum () {
        if (!this.state.network) return showToast(networkTool.NOT_NETWORK);
        const { userInfo } = this.state;
        if (userInfo.telephone === undefined) {
            return false;
        }
        if (userInfo.telephone) {
            return showToast('手机号码已绑定，如需解绑请联系客服');
        }
        this.switchNavigate('MemberPhoneNumber')
    };
    async setUserInfoState () {
        try {
            const res = await memberService.getUserInfo();
            console.log('settings 用户信息', res);
            this.setState ({
                userInfo: {...res}
            })
        } catch (err) {
            console.log('settings 用户信息', err);
            errorHandle(err).then(res => {
                if(res && res.routeName){
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: res.routeName})]
                    });
                    this.props.navigation.dispatch(resetActions);
                };
                if (err.network && err.network==='error') {
                   this.setState({
                       network: false
                   })
                }
                storage.load({key: 'userInfo'}).then(res => {
                    this.setState({
                        userInfo: res
                    });
                })
            });
        }

    };
    async getBankCardList () {
        try {
            const res = await memberService.restoreUserBankCardFromStorage();
            console.log('settings 银行卡信息');
            console.log(res);
            this.setState({bankCard: res})
        } catch (err) {
            console.log(err);
        }
    };
    entryBankCardInfo () {
        if (!this.state.network) return showToast(networkTool.NOT_NETWORK);
        const { userInfo, bankCard } = this.state;

        if ( userInfo.telephone === '' ) {
            return showToast('请绑定手机号码', {onHide: ()=> this.navigate('MemberPhoneNumber')})
        };
        if ( !userInfo.isSetFundsPW ) {
            return showToast('请设置提现密码', {onHide: ()=> this.navigate('SetFundsPassword')})
        };
        const routeName = bankCard.totalNum > 0 ? 'MemberBankCard' : 'BindBankCard';
        this.switchNavigate(routeName);
    };
    codePushStatusDidChange(status) {
        switch (status) {
            case codePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({
                    updateInfo: '正在检查更新'
                })
                break;
            case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({
                    updateInfo: '正在下载更新包'
                })
                break;
            case codePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({
                    updateInfo: '正在安装'
                })
                break;
            case codePush.SyncStatus.UP_TO_DATE:
                this.setState({
                    updateInfo: `当前是最新版本${updateLog[0].version}`
                });
                break;
            case codePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({
                    updateInfo: '更新完成'
                })
                break;
        }
    }

    codePushDownloadDidProgress(progress) {
        this.setState({
            updateInfo: `正在下载新配置${(progress.receivedBytes / progress.totalBytes * 100).toFixed(2)}%`
        })
    }
    fetchVersion () {
        codePush.sync(
            {
                updateDialog: {
                    descriptionPrefix: '提示: ',
                    mandatoryContinueButtonLabel: '确定',
                    mandatoryUpdateMessage: '有可用更新，必须安装',
                    optionalIgnoreButtonLabel: '稍后',
                    optionalInstallButtonLabel: '后台更新',
                    optionalUpdateMessage: '有新版本了，是否更新？',
                    title: '更新提示'
                },
                installMode: codePush.InstallMode.IMMEDIATE
            },
            this.codePushStatusDidChange.bind(this),
            this.codePushDownloadDidProgress.bind(this)
        ).catch(err => {
            this.setState({
                updateInfo: '获取版本失败'
            })
        })

    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused) {
            this.setUserInfoState();
            this.getBankCardList();
        }
    }
    componentWillMount () {
        this.setUserInfoState();
        this.getBankCardList();
    };
    render () {
        const { userInfo, bankCard, isConnecting , updateInfo} = this.state;
        return (
            <View style={styles.mySettingsList}>
                <Header headerTitle = '设置中心'
                        navigation = {this.navigation}/>
                <ScrollView style={{height: height}}>
                    <ListItem title="绑定银行卡"
                              remind={bankCard.totalNum > 0 ? "已绑定" :
                                  bankCard.totalNum === undefined ? "正在加载..." : "未绑定"}
                              onPresshandle={() => {this.entryBankCardInfo()}}/>
                    <ListItem title="修改密码"
                              onPresshandle={() => {
                                  this.switchNavigate('ModifyPassword');
                              }}/>
                    <ListItem title="提现密码"
                              remind={userInfo.isSetFundsPW ? "已设置" :
                                  userInfo.isSetFundsPW === undefined ? "正在加载..." : "未设置"}
                              onPresshandle={() => {
                                  const routeName = userInfo.isSetFundsPW ?
                                      'ModifyFundsPassword' : 'SetFundsPassword';
                                  this.switchNavigate(routeName);
                              }}
                    />
                    <ListItem title="手机绑定"
                              remind={userInfo.telephone ? formatPhone(userInfo.telephone) :
                                  userInfo.telephone === undefined ? "正在加载..." : "手机还未绑定"}
                              onPresshandle={() => this.onPressBindPhoneNum()}
                    />
                    <ListItem title="清除缓存" onPresshandle={this.cleanCache}/>
                    <ListItem title="版本检测"
                              remind={updateInfo}
                              onPresshandle={this.fetchVersion}/>
                    <AppButton style={styles.logoutBtn}
                               title="安全退出" onPressHandle={this.signOut}/>
                    <View style={{ flex: 1 }}>
                        <Spinner visible={isConnecting}
                                 color="#333"
                                 overlayColor="transparent"
                                 textContent={"正在加载"}
                                 textStyle={{color: '#333', fontSize: 16}} />
                    </View>
                </ScrollView>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    mySettingsList: {
        flexDirection: 'column'
    },
    logoutBtn: {
        marginHorizontal: 10,
        marginVertical: 10
    }
});

export default withNavigationFocus(MemberSettings, 'MemberSettings');
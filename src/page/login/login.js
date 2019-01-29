import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    NativeModules
} from 'react-native';
import { observer, inject } from 'mobx-react/native';
import JPushModule from 'jpush-react-native';

import { showToast } from '../../utils';
import Spinner from 'react-native-spinner';
import {signIn, requestWeChatLogin, thirdSignIn} from '../../service/authService';
import TextInputLabel from '../../component/textInputLabel'
import AppButton from '../../component/appButton'
import config from '../../config';
import verify from '../../config/verify';
import errorHandle from '../../service/errorHandle';
import { sendUserDeviceInfo } from '../../service';
import {profileStore, appSettingStore, payGroupStore} from "../../store/index";
import { Icon } from '../../component/customicons'

const { width, height } = Dimensions.get('window');
const dismissKeyboard = require('dismissKeyboard');
const isIos = Platform.OS === 'ios';

@inject('payGroupStore')
@observer
class Login extends Component {
    static navigationOptions = {
        header: null
    };
    constructor (props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isCanLogin: false,
            isConnecting: false,
            needComplete: null
        };
        this.signIn = this.signIn.bind(this);
        this.onPressThirdSignIn = this.onPressThirdSignIn.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.goBack = props.navigation.goBack;
        this.navigation = props.navigation;
    };
    toggleSpinner (status, callBack) {
        this.setState({
            isConnecting: status ? status : !this.state.isConnecting
        }, () => {
            callBack && callBack()
        });
    };
    verification (data) {
        if(data.username && !verify.username.test(data.username)){
            showToast('请输入以大小写字母开头6-16个字符的用户名', {
                onHidden: () => {
                    this.setState({
                        isCanSubmit: false
                    })
                }
            })
            return false;
        };
        if(data.password && !verify.easyPassword.test(data.password)){
            showToast('请输入6-12个字符至少包含1个字母及数字', {
                onHidden: () => {
                    this.setState({
                        isCanSubmit: false
                    })
                }
            });
            return false;
        };
        return true;
    };
    signIn() {
        const data = {
            username: this.state.username,
            password: this.state.password
        };
        if(this.verification(data)){
            this.toggleSpinner(true);
            signIn(data).then(res => {
                this.toggleSpinner(false, () => {
                    profileStore.getUserInfoFromStorage();
                    payGroupStore.fetchPayGroup();
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Main'})]
                    });
                    this.navigation.dispatch(resetActions);
                });

            }).catch(err => {
                this.toggleSpinner(false, () => {
                    errorHandle(err);
                });
            })
        }

    };
    onPressThirdSignIn (platform) {
        this.toggleSpinner(true);
        const thirdType = platform === 0 ? 2 : (platform === 1 ? 3 : 1);
        NativeModules.UMShareModule.auth(platform,(code,result,message) =>{
            if (code === 200){
                thirdSignIn(result,thirdType)
                    .then((res)=>{this.setState({needComplete: res.data.needComplete})})
                    .then(() => profileStore.getUserInfoFromStorage())
                    .then(() => payGroupStore.fetchPayGroup())
                    .then(()=>{
                        JPushModule.getRegistrationID(id => {
                            sendUserDeviceInfo({platform: Platform.ios ? 1 : 2, deviceCode: id})
                        });
                    })
                    .then(() => {this.toggleSpinner(false)})
                    .then(() => {
                    let resetActions
                        if(this.state.needComplete === 1) {
                            resetActions = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({
                                    routeName: 'ThirdPartyPerfectingInfo',
                                    params: { type: 'fromLogin' }
                                })]
                            });
                        } else {
                            resetActions = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({ routeName: 'Main'})]
                            });
                        }
                        this.navigation.dispatch(resetActions);
                    })
                    .catch(err => {
                        this.toggleSpinner(false, () => {
                            return showToast('登录失败！' + err.message);
                        });
                    })
            } else if(code === -1) {
                this.toggleSpinner(false);
            } else {
                this.toggleSpinner(false,()=>{
                    return showToast('登录失败');
                });
            }
        });
    }
    setButtonStatus () {
        this.setState({
            isCanLogin: (this.state.username && this.state.password)
        })
    };
    render () {
        const { socialQQAppId, socialWechatAppId, socialSinaWeiboAppId } = NativeModules.AppConfigurationModule;
        const isIPhoneX = NativeModules.DeviceInfo.isIPhoneX_deprecated;
        return (
            <View style={styles.container}>
                <View style={[styles.authHeader, {height: isIPhoneX ? 74 : 54}]}>
                    <TouchableOpacity style={styles.headerLeft} onPress={() => {this.navigation.navigate('MyCenter')}} >
                        <Image
                            style={styles.closeIcon}
                            source={require('../../assets/images/icon_close.webp')}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={{fontSize: 18}}>{ `${appSettingStore.appSettings.appName}登录` }</Text>
                    </View>
                    <TouchableOpacity style={styles.headerRight}>
                        <Text
                            onPress={() => {this.navigation.navigate('Register')}}
                            style = {styles.rightBtn}>
                            注册
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={ styles.form }>
                    <TextInputLabel
                        val={this.state.username }
                        isAutoFocus={true}
                        leftIcon= {{name: 'user', color: '#C9C9C9'}}
                        placeholder="请输入用户名"
                        onChangeTextHandle={(username) => {
                            this.setState({username}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <TextInputLabel
                        val={this.state.password}
                        leftIcon= {{name: 'lock', color: '#C9C9C9'}}
                        isPassword={true}
                        placeholder="请输入密码"
                        onChangeTextHandle={(password) => {
                            this.setState({password}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <View style={styles.textBtnWrp}>
                        <TouchableOpacity onPress={() => {
                            const {navigate} = this.props.navigation;
                            navigate('ResetPassword');
                        }}>
                            <Text style={styles.textBtn}>忘记密码？</Text>
                        </TouchableOpacity>
                    </View>
                    <AppButton
                        title="登录"
                        isDisabled={!this.state.isCanLogin}
                        onPressHandle={this.signIn}
                    />
                    {!socialQQAppId  && !socialWechatAppId  && !socialSinaWeiboAppId ? null : (
                        <View style={styles.signBox}>
                            <View style={{borderColor: '#E5E5E5', borderTopWidth:1, width:width -40 , height: 1}}></View>
                            <Text style={styles.signTitle}>第三方账号登录</Text>
                            <View style={styles.signList}>
                                {!!socialWechatAppId && (
                                    <TouchableOpacity style={styles.icon} onPress={() => this.onPressThirdSignIn(2)}>
                                        <Icon name='icon-cycle-wechat' color='#51C332' size={38}/>
                                    </TouchableOpacity>
                                )}
                                {!!socialQQAppId && (
                                    <TouchableOpacity style={styles.icon} onPress={() => this.onPressThirdSignIn(0)}>
                                        <Icon name='icon-qq' color='#1296db' size={38}/>
                                    </TouchableOpacity>
                                )}
                                {!!socialSinaWeiboAppId && (
                                    <TouchableOpacity style={styles.icon} onPress={() => this.onPressThirdSignIn(1)}>
                                        <Icon name='icon-weibo' color='#d81e06' size={38}/>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
                <Spinner visible={this.state.isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={""}
                         onPressHandle={() => this.toggleSpinner()}
                         textStyle={{color: '#333', fontSize: 16}} />
            </View>
        )
    };
    componentWillUnmount() {
        dismissKeyboard();
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        height: height,
        backgroundColor: '#FFF'
    },
    authHeader: {
        flexDirection: 'row',
        width: width,
        paddingHorizontal: 15,
        height: isIos ? 54 : 44,
        alignItems: 'flex-end',
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 5,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    icon: {
        marginHorizontal: 10,
    },
    close: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    rightBtn: {
        fontSize: 15,
        color: '#333',
    },
    form: {
        flex: 1,
        width: width ,
        paddingHorizontal: 20,
        paddingTop: isIos ? 56 : 66,
    },
    textBtnWrp: {
        alignItems: 'flex-end'
    },
    textBtn: {
        paddingVertical: 8,
        color: '#999',
        fontSize: 13
    },
    signBox: {
        marginTop: 40,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: width-40,
        paddingTop: 10
    },
    signTitle: {
        color: '#666',
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        marginTop: -9
    },
    signList: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    signWay: {
        width: 35,
        height: 35,
        marginHorizontal: 10,
    }
});

export default Login

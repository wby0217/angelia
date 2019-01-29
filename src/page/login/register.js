import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    WebView,
    NativeModules
} from 'react-native';
import JPushModule from 'jpush-react-native';
import { observer, inject } from 'mobx-react/native';
import { NavigationActions } from 'react-navigation';
import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome';
import HTMLView from 'react-native-htmlview';

import Spinner from 'react-native-spinner';
import { showToast, verification, Alert } from '../../utils';
import { instructionsService } from '../../service';
import config  from '../../config';
import TextInputLabel from '../../component/textInputLabel';
import AppButton from '../../component/appButton';
import {register}  from '../../service/authService';
import ErrorPage from '../../component/errorPage'
import { sendUserDeviceInfo } from '../../service';
import { payGroupStore, profileStore } from '../../store';
import { appSettingStore } from "../../store/index";

const { width, height } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
const dismissKeyboard = require('dismissKeyboard');
@inject('payGroupStore')
@observer
class Register extends Component {
    static navigationOptions = {
        header: null
    };
    constructor (props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            captcha: '',
            referrer: '',
            isCanSubmit: false,
            isConnecting: false,
            needRefreshCaptcha: false,
            content: undefined,
            checkBox: true,
            isOpen: false,
        };
        this.isHasNetWork = true;
        this.setButtonStatus = this.setButtonStatus.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.onAfterRefreshCaptcha = this.onAfterRefreshCaptcha.bind(this);
        this.navigate = props.navigation.navigate;
        this.getInstruction = this.getInstruction.bind(this);
    };
    toggleSpinner (status, callback) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        }, () => {
            callback && callback()
        });
    };
    setButtonStatus () {
        const {username, password, captcha, checkBox} = this.state;
        this.setState({
            isCanSubmit: (!!(username && password && captcha && checkBox))
        })
    };
    submitForm () {
        const data = {
            username: this.state.username,
            password: this.state.password,
            checkCode: this.state.captcha
        };
        this.state.referrer ? data.InvitationCode = this.state.referrer : data;
        console.log(verification(data) );
        if (verification(data) === 'success'){
            this.toggleSpinner(true);
            register(data)
                .then((res) => {
                    profileStore.getUserInfoFromStorage();
                    payGroupStore.fetchPayGroup();
                    this.toggleSpinner(false, () => {
                        showToast(res.message, {
                            onHide: () => {
                                const resetActions = NavigationActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Main'})]
                                });
                                this.props.navigation.dispatch(resetActions);
                            }
                        })
                    });
                })
                .catch(err => {
                    console.log(err);
                    this.toggleSpinner(false, () => {
                        showToast(err.message)
                    });
                    this.setState({needRefreshCaptcha: true})
                })
        } else {
            this.setState({needRefreshCaptcha: true})
        }
    };
    onAfterRefreshCaptcha () {
        this.setState({needRefreshCaptcha: false})
    };
    componentDidMount () {
    }
    getInstruction() {
        instructionsService({params:{ configKey: 'userRegisterDesc' }})
            .then((data) => {
                console.log(1234,data)
                this.setState({ content: data.userRegisterDesc , isOpen: true})
            })
            .catch((err) => {
                console.log(err)
            })
    }
    render () {
        const { content, checkBox } = this.state;
        const isIPhoneX = NativeModules.DeviceInfo.isIPhoneX_deprecated;
        return (
            <View style={styles.container}>
                <View style={[styles.authHeader, {height: isIPhoneX ? 74 : 54}]}>
                    <TouchableOpacity style={styles.headerLeft} onPress={() => {this.navigate('MyCenter')}} >
                        <Image
                            style={styles.closeIcon}
                            source={require('../../assets/images/icon_close.webp')}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={{fontSize: 18}}>{ `${appSettingStore.appSettings.appName}注册` }</Text>
                    </View>
                    <TouchableOpacity style={styles.headerRight}>
                        <Text
                            onPress={() => {this.navigate('Login')}}
                            style = {styles.rightBtn}
                        >
                            登录
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={ styles.form }>
                    <TextInputLabel
                        val={this.state.username }
                        isAutoFocus={true}
                        labelText= '账号'
                        placeholder="大小写字母开头6-16个字符"
                        maxLength={16}
                        minLength={6}
                        onChangeTextHandle={(username) => {
                            this.setState({username}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <TextInputLabel
                        val={this.state.password}
                        labelText="密码"
                        isPassword={true}
                        placeholder="6-12个字符至少包含1个字母及数字"
                        maxLength={12}
                        minLength={6}
                        onChangeTextHandle={(password) => {
                            this.setState({password}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <TextInputLabel
                        val={this.state.captcha}
                        labelText="验证码"
                        hasCaptcha={true}
                        refreshCaptcha={this.state.needRefreshCaptcha}
                        afterRefreshCaptcha={this.onAfterRefreshCaptcha}
                        keyboardType={"numeric"}
                        maxLength={4}
                        onChangeTextHandle={(captcha) => {
                            this.setState({captcha}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <TextInputLabel
                        val={this.state.referrer}
                        labelText="介绍人"
                        placeholder="可选填"
                        onChangeTextHandle={(referrer) => {
                            this.setState({referrer}, () => {
                                this.setButtonStatus();
                            });
                        }}
                    />
                    <View style={styles.checkboxWrap}>
                        <TouchableOpacity onPress={() => this.setState({checkBox: !this.state.checkBox},() => {
                            this.setButtonStatus();
                        }) }>
                            <Icon style={styles.checkBox}
                                  name={checkBox ? 'check-square' : 'square-o'}
                                  size={14}
                                  color="#666"/>
                        </TouchableOpacity>
                        <Text style={{fontSize:12, color: '#666'}}>我已满合法博彩年龄，且同意各项 </Text>
                        <TouchableOpacity onPress={() => {this.getInstruction()}}>
                            <Text style={styles.agreement}>“开户协议”</Text>
                        </TouchableOpacity>
                    </View>
                    <AppButton
                        style={{marginTop: 35}}
                        title="立即注册"
                        isDisabled={!this.state.isCanSubmit}
                        onPressHandle={this.submitForm}
                    />
                    <Spinner visible={this.state.isConnecting}
                             color="#333"
                             overlayColor="transparent"
                             textContent={""}
                             textStyle={{color: '#333', fontSize: 16}} />
                </ScrollView>
                <Modal isOpen={this.state.isOpen} swipeToClose={false} onClosed={() => this.setState({isOpen: false})} style={[styles.modal]} position={"center"} >
                    <View style={{backgroundColor:'#fff'}}>
                        <TouchableOpacity style={styles.close} onPress={() => this.setState({isOpen: false})}>
                            <Image style={styles.down} source={require('../../assets/images/down.png')}/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {!!content ? (
                            <HTMLView stylesheet={styles} value={content}/>
                        ) : (
                            <ErrorPage type="networkError" desc="出错了，请关闭后在进入！" />
                        )}
                    </ScrollView>
                </Modal>
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
        flex: 1,
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
   close: {
        height: isIos ? 54 : 44,
    },
    down:{
        width: 28,
        height: 14,
        marginTop: isIos ? 30 : 20,
        marginLeft: 10,
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
    agreeItem: {
        paddingVertical: 5,
        backgroundColor: '#FFF'
    },
    checkboxWrap: {
        flexDirection: 'row',
        marginTop: 15,
    },
    agreement: {
        fontSize: 12,
        color: '#ff0033',
        textDecorationLine: 'underline'
    },
    checkBox: {
        width: 13,
        height: 13,
        marginLeft: 2,
        marginRight: 4,
    },
    widowWrap: {
        paddingHorizontal: 40,
        paddingTop:70,
        paddingBottom: 60,
    },
    modal: {
        height: height,
        backgroundColor: '#f7f7f7'
    },
    btn: {
        color: '#ff0033',
        fontSize: 14,
    },
    scroll:{

    },
    btnWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
});


export default Register

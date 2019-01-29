import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { memberFormStyles } from '../../assets/style';
import AppButton from '../../component/appButton';
import memberService from '../../service/memberService';
import Spinner from 'react-native-spinner';
import { showToast, verification } from '../../utils';
import errorHandle from '../../service/errorHandle';
import config from '../../config';
import Header from '../../component/header';

const countdownTime = config.connect.countdownTime;
const styles = memberFormStyles;
export default class ResetPassword extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            isConnecting: false,
            telephone: '',
            password: '',
            messageCode: '',
            isCanSubmit: false,
            isStartCountdown: false,
            countdown: countdownTime
        };
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.sendCode = this.sendCode.bind(this);
        this.countdown = this.countdown.bind(this);
        this.resetCountdown = this.resetCountdown.bind(this);
        this.navigate = props.navigation.navigate;
        this.navigation = props.navigation;
    };
    resetCountdown () {
        clearInterval(this.timer);
        this.setState({
            isStartCountdown: false,
            countdown: countdownTime,
            telephone: '',
        })
    };
    countdown () {
        if(this.timer) {
            this.resetCountdown();
        };
        this.setState({
            isStartCountdown: true
        });
        this.timer = setInterval(()=>{
            if(this.state.countdown > 0) {
                this.setState({
                    countdown: this.state.countdown - 1
                })
            } else {
                this.resetCountdown();
            }
        }, 1000)
    };
    sendCode () {
        const { telephone } = this.state;
        const data = {telephone: telephone};
        const validate = verification(data);
        if( telephone === '' ) {
            return showToast('手机号码不能为空');
        }
        if( validate === 'success'){
            this.toggleSpinner(true);
            memberService.sendCode(data).then(res => {
                this.toggleSpinner(false);
                showToast(res.message, {onShown: ()=> this.countdown()});
            }).catch(err => {
                this.toggleSpinner(false);
                showToast(err.message, {onHide: () => errorHandle(err.code)});
            })
        } else {
            if (validate === 'telephone') {
                this.setState({
                    telephone: ''
                })
            }
        }
    };
    setButtonStatus () {
        this.setState({
            isCanSubmit: (!!this.state.messageCode && !!this.state.password)
        })
    };
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    submitForm () {
        const data = {
            telephone: this.state.telephone,
            password: this.state.password,
            messageCode: this.state.messageCode
        };
        const validate = verification(data);
        this.toggleSpinner(true);
        if (validate === 'success') {
            memberService.resetPassword(data).then(res => {
                this.toggleSpinner(false);
                showToast(res.message, {
                    onHide: () => this.navigate('Login')
                })
            }).catch(err => {
                this.toggleSpinner(false);
                errorHandle(err).then(res => {
                    res && res.routeName && this.navigate(res.routeName)
                })
            })
        } else {
            this.toggleSpinner(false);
        }
    }
    render () {
        const { telephone, messageCode, password, isConnecting, isCanSubmit, isStartCountdown, countdown} = this.state;
        return (
            <View style={styles.container}>
                <Header headerTitle = '找回密码'
                        navigation = {this.navigation}/>
                <View style={styles.inputFile}>
                    <Icon iconStyle={styles.inputIcon} width={30} name="mobile" size={28} color={'#C9C9C9'}/>
                    <TextInput style={styles.inputText}
                               placeholder="请输入您的手机号码"
                               autoCapitalize={"none"}
                               keyboardType={"numeric"}
                               maxLength={11}
                               value={telephone}
                               autoFocus
                               underlineColorAndroid='transparent'
                               onChangeText={(text) => {
                                   this.setState({
                                       telephone: text
                                   }, () => {
                                       this.setButtonStatus()
                                   })
                               }}/>
                </View>
                <View style={styles.inputFile}>
                    <Icon name="envelope-o" size={16} color={'#C9C9C9'}/>
                    <TextInput  style={styles.inputText}
                                value={messageCode}
                                placeholder="请输入短信验证吗"
                                autoCapitalize={"none"}
                                keyboardType={"numeric"}
                                underlineColorAndroid='transparent'
                                onChangeText={(text) => {
                                    this.setState({
                                        messageCode: text
                                    }, () => {
                                        this.setButtonStatus()
                                    })
                                }}/>
                    { !isStartCountdown ? (
                        <TouchableOpacity style={styles.messCaptcha} onPress={this.sendCode}>
                            <Text style={styles.textBtn}>获取验证码</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{paddingLeft: 10}}>
                            <Text style={{fontSize: 14, color: '#999'}}>{`${countdown}s后重新获取`}</Text>
                        </View>
                    )
                    }

                </View>
                <View style={styles.inputFile}>
                    <Icon iconStyle={styles.inputIcon} width={24} name="lock" size={24} color={'#C9C9C9'}/>
                    <TextInput style={styles.inputText}
                               placeholder="请重设您的登录密码"
                               autoCapitalize={"none"}
                               value={password}
                               secureTextEntry={true}
                               maxLength={12}
                               underlineColorAndroid='transparent'
                               onChangeText={(text) => {
                                   this.setState({
                                       password: text
                                   }, () => {
                                       this.setButtonStatus()
                                   })
                               }}/>
                </View>
                <AppButton
                    title="确认修改"
                    style={styles.appBtn}
                    isDisabled={!isCanSubmit}
                    onPressHandle={() => {
                        this.submitForm();
                    }}
                />
                <View style={{ flex: 1 }}>
                    <Spinner visible={isConnecting}
                             color="#333"
                             overlayColor="transparent"
                             textContent={"正在加载"}
                             textStyle={{color: '#333', fontSize: 16}} />
                </View>
            </View>
        )
    };
    componentWillUnmount () {
        if(this.timer){
            this.resetCountdown();
        }
    };
}
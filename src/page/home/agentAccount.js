import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import accountService from '../../service/accountService';
import Spinner from 'react-native-spinner';
import errorHandle from '../../service/errorHandle';
import verification from '../../utils/verification';
import {showToast} from '../../utils';
const { width } = Dimensions.get('window');
const dismissKeyboard = require('dismissKeyboard');
export default class AgentAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            rePassword: '',
            isConnecting: false,
            isCanSubmit: false
        };
        this.setButtonStatus = this.setButtonStatus.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    };
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    setButtonStatus() {
        this.setState({
            isCanSubmit: this.state.username && this.state.password && this.state.rePassword
        })
    };
    onSubmit(){
        if(!this.state.isCanSubmit) return false;
        const data = {
            username: this.state.username,
            password: this.state.password,
        };
        const validate = verification(data);
        if (validate === 'success') {
            if (data.password === this.state.rePassword) {
                this.toggleSpinner(true);
                accountService.addMember(data).then(res => {
                    this.toggleSpinner(false);
                    showToast(res.message, {
                        onHide: () => {
                            this.setState({
                                username: '',
                                password: '',
                                rePassword: ''
                            }, () => {
                                this.setButtonStatus()
                            })
                        }
                    })
                }).catch(err => {
                    this.toggleSpinner(false);
                    errorHandle(err);
                })
            } else {
                showToast('两次输入的密码不一致，请重新输入')
            }
        }
    };
    render() {
        const {username, password, rePassword, isCanSubmit, isConnecting} = this.state;
        return(
            <View style={styles.container}>
                <View style={styles.form}>
                    <View style={styles.inputFlied}>
                        <Icon
                            style={styles.inputIcon}
                            name={"user"}
                            size={20}
                            color={'#C9C9C9'}
                        />
                        <TextInput
                            style={styles.input}
                            value={username}
                            autoCapitalize={"none"}
                            underlineColorAndroid='transparent'
                            onChangeText={(text) => {
                                this.setState({
                                    username: text
                                }, () => {
                                    this.setButtonStatus()
                                })
                            }}
                            placeholder="请输入用户名"
                        />
                    </View>
                    <View style={styles.inputFlied}>
                        <Icon
                            style={styles.inputIcon}
                            name={"lock"}
                            size={20}
                            color={'#C9C9C9'}
                        />
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="请输入登录密码"
                            autoCapitalize={"none"}
                            secureTextEntry={true}
                            underlineColorAndroid='transparent'
                            onChangeText={(text) => {
                                this.setState({
                                    password: text
                                }, () => {
                                    this.setButtonStatus()
                                })
                            }}
                        />
                    </View>
                    <View style={[styles.inputFlied, {borderBottomWidth:0}]}>
                        <Icon
                            style={styles.inputIcon}
                            name={"lock"}
                            size={20}
                            color={'#C9C9C9'}
                        />
                        <TextInput
                            style={styles.input}
                            value={rePassword}
                            placeholder="再次输入密码"
                            secureTextEntry={true}
                            autoCapitalize={"none"}
                            underlineColorAndroid='transparent'
                            onChangeText={(text) => {
                                this.setState({
                                    rePassword: text
                                }, () => {
                                    this.setButtonStatus()
                                })
                            }}
                        />
                    </View>
                </View>
                <View style={styles.tipBar}>
                    <Image style={styles.tipIcon} source={require('../../assets/images/icon_tips.webp')} />
                    <Text style={styles.tipText}>密码为6-12个字母及数字的组合</Text>
                </View>
                <TouchableOpacity
                    onPress={this.onSubmit}
                    activeOpacity={isCanSubmit ? 0.2 : 1}
                    style={[styles.submitBtn, {
                        backgroundColor: isCanSubmit ? '#FFEC2E': '#E2E2E2',
                    }]}>
                    <Text style={{color: isCanSubmit ? '#756900': '#FFF'}}>确认</Text>
                </TouchableOpacity>
                <View style={styles.rulesBar}>
                    <Text style={[styles.rules, {fontSize: 16,marginBottom: 5}]}>代理规则说明</Text>
                    <Text style={styles.rules}>1.条件：VIP分享所发展的用户每天投注满10次。</Text>
                    <Text style={styles.rules}>2.佣金：按下线用户有效投注额为准</Text>
                </View>
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={"正在加载"}
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
        flex: 1,
        marginHorizontal:15,
        marginVertical: 20
    },
    form: {
        backgroundColor: '#FFF',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    inputFlied: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 50,
        paddingHorizontal: 5,
        borderBottomColor: '#C9C9C9',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    inputIcon: {
        flex: 1,
        alignItems: 'center',
    },
    input: {
        flex: 10,
        alignItems: 'center',
        fontSize: 14
    },
    tipBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 10,
    },
    tipIcon: {
        width: 12,
        height: 16,
        marginRight: 5,
    },
    tipText: {
        fontSize:14,
        color: '#F7A92D'
    },
    submitBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width -30,
        height: 40,
        borderRadius: 5,
    },
    rulesBar: {
        marginTop: 30,
        marginHorizontal: 10,
    },
    rules: {
        color: '#999',
        paddingVertical: 5,
        fontSize: 14,
    }
});
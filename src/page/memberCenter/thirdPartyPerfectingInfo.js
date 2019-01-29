import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation';

import AppButton from '../../component/appButton';
import memberService from '../../service/memberService';
import Spinner from 'react-native-spinner';
import { showToast, verification } from '../../utils';
import errorHandle  from '../../service/errorHandle';
import Header from '../../component/header';
const { width, height } = Dimensions.get('window');

export default class ThirdPartyPerfectingInfo extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            isConnecting: false,
            username: '',
            password: '',
            isCanSubmit: false
        }
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.headerLeft = this.headerLeft.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.navigate = props.navigation.navigate;
        this.goBack = props.navigation.goBack;
        this.navigation = props.navigation;
    };
    setButtonStatus () {
        this.setState({
            isCanSubmit: (!!this.state.username && !!this.state.password)
        })
    };
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    submitForm () {
        const { type } = this.props.navigation.state.params;
        const data = {
            username: this.state.username,
            password: this.state.password
        };
        const validate = verification(data);
        if (validate === 'success') {
            const params = {
                username: this.state.username,
                password: this.state.password
            };
            this.toggleSpinner(true);
            memberService.thirdPartyPerfectingInfo(params)
                .then(res => {
                    this.toggleSpinner(false);
                    showToast('保存成功', {
                        onHide: () => {
                            const resetActions = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({
                                    routeName: type ==='fromMemberCenter' ? 'MyCenter' : 'Main'
                                })]
                            });
                            this.props.navigation.dispatch(resetActions);
                        }
                    });
                }).catch(err => {
                this.toggleSpinner(false);
                errorHandle(err).then(res => {
                    if(res && res.routeName){
                        const resetActions = NavigationActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({
                                routeName: res.routeName,
                            })]
                        });
                        this.props.navigation.dispatch(resetActions);
                    }
                })
            })
        }
    };
    headerLeft() {
        return (
            <TouchableOpacity style = {styles.backCont} onPress={() => this.navigation.goBack() }>
                <Image style = {styles.backIcon} source={require('../../assets/images/back.png')}/>
            </TouchableOpacity>
        )
    }
    render () {
        const { username, password, isConnecting, isCanSubmit} = this.state;
        const { type } = this.props.navigation.state.params;
        return (
            <View>
                <Header headerTitle = '完善资料'
                        headerLeft = {type !== 'fromMemberCenter' ? null : this.headerLeft}/>
                <View style={styles.container}>
                    <View style={styles.inputFile}>
                        <Text>账户名称</Text>
                        <TextInput style={styles.inputText}
                                   placeholder="请输入账户名称"
                                   autoCapitalize={"none"}
                                   value={username}
                                   maxLength={16}
                                   underlineColorAndroid='transparent'
                                   onChangeText={(text) => {
                                       this.setState({
                                           username: text
                                       }, () => {
                                           this.setButtonStatus()
                                       })
                                   }}/>
                    </View>
                    <View style={styles.inputFile}>
                        <Text>账户密码</Text>
                        <TextInput style={styles.inputText}
                                   placeholder="6-12个字符至少包含1个字母及数字"
                                   autoCapitalize={"none"}
                                   value={password}
                                   secureTextEntry={true}
                                   maxLength={12}
                                   minLength={6}
                                   underlineColorAndroid='transparent'
                                   onChangeText={(text) => {
                                       this.setState({
                                           password: text
                                       }, () => {
                                           this.setButtonStatus()
                                       })
                                   }}/>
                    </View>
                        <View style={styles.btnWrap}>
                            {   type !== 'fromMemberCenter' &&
                                <AppButton
                                    title="跳过"
                                    style={styles.smallBtn}
                                    onPressHandle={() => {
                                        const resetActions = NavigationActions.reset({
                                            index: 0,
                                            actions: [NavigationActions.navigate({
                                                routeName: 'Main',
                                            })]
                                        });
                                        this.props.navigation.dispatch(resetActions);
                                    }}/>
                            }
                            <AppButton
                                title="保存"
                                style={type !== 'fromMemberCenter' ? styles.smallBtn : styles.bigBtn}
                                isDisabled={!isCanSubmit}
                                onPressHandle={() => {
                                    this.submitForm();
                                }}/>
                        </View>
                    <View style={{ flex: 1 }}>
                        <Spinner visible={isConnecting}
                                 color="#333"
                                 overlayColor="transparent"
                                 textContent={"正在加载"}
                                 textStyle={{color: '#333', fontSize: 16}} />
                    </View>
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
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    inputFile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#FFF',
        height: 40,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 10
    },
    inputIcon: {
        flex: 1,
    },
    inputText: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 16
    },
    messCaptcha: {
        paddingLeft: 10,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderColor: '#C9C9C9'
    },
    textBtn: {
        fontSize: 14,
        color: '#00FFFF'
    },
    backIcon: {
        width: 12,
        height: 20,
        marginRight: 10,
        tintColor: '#FFF',
    },
    btnWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallBtn: {
        width: (width-30)/2,
    },
    bigBtn: {
        width: (width-20),
    }
})
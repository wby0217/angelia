import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView
} from 'react-native';
import { observer, inject } from 'mobx-react/native';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-spinner';
import memberService from '../../service/memberService';
import errorHandle from '../../service/errorHandle';
import { showToast } from '../../utils';
import Header from '../../component/header';
import {profileStore} from "../../store/index";
const dismissKeyboard = require('dismissKeyboard');
const { width, height } = Dimensions.get('window');

@observer
export default class MemberAgentCenter extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props){
        super(props);
        this.state = {
            contact: '',
            qq: '',
            isConnecting: false,
            isCanSubmit: false
        }
        this.submit = this.submit.bind(this);
        this.setButtonStatus = this.setButtonStatus.bind(this);
        this.navigate = props.navigation.navigate;
        this.navigation = props.navigation;
    }
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    setButtonStatus() {
        this.setState({
            isCanSubmit:  this.state.contact || this.state.qq
        })
    };
    submit () {
        if (!this.state.isCanSubmit ) return showToast('请填写您的联系方式');
        const data = {
            contact: this.state.contact,
            qq: this.state.qq,
            agent: 1
        };
        this.toggleSpinner(true);
        memberService.updMemberInfo(data)
            .then(res => {
                profileStore.fetchUserInfo();
                return res;
            })
            .then(res => {
                this.toggleSpinner(false);
                showToast(res.message, {
                    onHide: () => {
                        this.navigate('MyCenter');
                    }
                });
            }).catch(err => {
                console.log(err);
                this.toggleSpinner(false);
                errorHandle(err).then(res => {
                    console.log(res);
                    if(res && res.routeName) {
                        const resetActions = NavigationActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: res.routeName})]
                        });
                        this.props.navigation.dispatch(resetActions);
                    }
                })
            })
    };
    render () {
        const { isConnecting, contact, qq } = this.state;
        return (
            <ScrollView>
                <Header headerTitle = '代理中心'
                        navigation = {this.navigation}/>
                <LinearGradient style={styles.container}
                               colors={['#CCECFF', '#F1FAFF']} >
                   <ImageBackground style={styles.MyAgentBg} source={require('../../assets/images/my_agent_bg.png')}>
                       <Text style={styles.agentTitle}>填写您的代理信息</Text>
                       <ImageBackground style={[styles.inputBg, {marginTop: 50}]}
                           source={require('../../assets/images/my_agent_input.webp')}>
                           <TextInput style={styles.inputFile}
                                      autoCapitalize = "none"
                                      placeholder="请输入您的联系电话"
                                      keyboardType={"numeric"}
                                      underlineColorAndroid='transparent'
                                      value={contact}
                                      onChangeText={(text) => {
                                          this.setState({
                                              contact: text
                                          }, () => {
                                              this.setButtonStatus()
                                          })
                                      }}
                           />
                       </ImageBackground>
                       <ImageBackground style={styles.inputBg}
                              source={require('../../assets/images/my_agent_input.webp')}>
                           <TextInput
                               style={styles.inputFile}
                               keyboardType={"numeric"}
                               placeholder="请输入您的联系 QQ"
                               autoCapitalize = "none"
                               underlineColorAndroid='transparent'
                               value={qq}
                               onChangeText={(text) => {
                                   this.setState({
                                       qq: text
                                   }, () => {
                                       this.setButtonStatus()
                                   })
                               }}
                           />
                       </ImageBackground>
                       <TouchableOpacity onPress={this.submit}>
                           <ImageBackground style={styles.submitBtn} source={require('../../assets/images/my_agent_btn.webp')}>
                               <Text style={styles.submitBtnText}>确定提交</Text>
                           </ImageBackground>
                       </TouchableOpacity>
                   </ImageBackground>
                   <Spinner visible={isConnecting}
                            color="#333"
                            overlayColor="transparent"
                            textContent={"正在加载"}
                            textStyle={{color: '#333', fontSize: 16}} />
                </LinearGradient>
            </ScrollView>
       )
    };
    componentWillUnmount() {
        dismissKeyboard();
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // backgroundColor: '#CCECFF',
        height: height
    },
    MyAgentBg: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: (width - 335)/2,
        width: 335,
        height: 449,
        //resizeMode: 'contain',
    },
    agentTitle: {
        marginTop: 120,
        fontSize: 20,
        color: '#FB4444',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        letterSpacing: 3
    },
    inputBg: {
        height: 40,
        width: 254,
        marginTop: 10,
        paddingHorizontal: 10,
        //resizeMode: 'contain',
    },
    inputFile: {
        flex: 1,
        fontSize: 14,
    },
    submitBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 254,
        height: 40,
        marginTop: 20,
        //resizeMode: 'stretch',
    },
    submitBtnText: {
        color: '#CE900B',
        backgroundColor:'transparent',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 3,
        paddingTop: 7
    },

})
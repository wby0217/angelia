import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ImageBackground,
    Text,
    View,
    Dimensions,
    Alert,
    Platform
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import { observer } from 'mobx-react/native';

import MemberMenuButton from '../../component/memberMenuButton';
import { myAssets, myFavoriteList } from '../../config/memberCenterMenu';
import AppButton from "../../component/appButton";
import memberService from "../../service/memberService";
import { checkIsLogin } from "../../service/authService";
import errorHandle from '../../service/errorHandle';
import { showToast } from '../../utils';
import config from '../../config';
import { Icon } from '../../component/customicons'
import { profileStore } from '../../store';

const path = require('path');  
const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';

@observer
class MyCenter extends Component {
    constructor (props) {
        super(props);
        this.state = {
            isLogin: false,
            bankCard: {},
            userInfo: {},
            isModalDisable: false,
            avatar: ''
        };
        this.onClickMenuBtn = this.onClickMenuBtn.bind(this);
        this.onPressMenuButton = this.onPressMenuButton.bind(this);
        this.entryWithDraw = this.entryWithDraw.bind(this);
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
        this.getBankCardList = this.getBankCardList.bind(this);
        this.restoreUserInfoFromStorage = this.restoreUserInfoFromStorage.bind(this);
        this.getPageData = this.getPageData.bind(this);
        this.getLevelImage = this.getLevelImage.bind(this);
        this.navigate = props.navigation.navigate;
    };
    onClickMenuBtn (routeName) {
        if (routeName === 'Login' || routeName === 'Register') {
            const resetActions = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: routeName})]
            });
            this.props.navigation.dispatch(resetActions);
        } else {
            const curTime = new Date();
            if (curTime - this.clickTime < 500) return false;
            this.clickTime = curTime;
            this.navigate(routeName);
        }
    };
    async getBankCardList () {
        try {
            const res = await memberService.restoreUserBankCardFromStorage();
            console.log('银行卡信息', res);
            this.setState({bankCard: res});
            return Promise.resolve()
        } catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    };
    entryWithDraw () {
        const { bankCard } = this.state;
        const {userInfo, isLogin} = profileStore;
        if (!isLogin) {
            return showToast('您还未登录，请先登录', {
                onHide: () => {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login'})]
                    });
                    this.props.navigation.dispatch(resetActions);
                }
            })
        }
        if ( userInfo.telephone === '' ) {
            return showToast('请绑定手机号码', {onHide: ()=> this.navigate('MemberPhoneNumber')})
        };
        if ( !!!userInfo.isSetFundsPW ) {
            return showToast('请设置提现密码', {onHide: ()=> this.navigate('SetFundsPassword')})
        };
        if ( !bankCard.totalNum > 0 ) {
            return showToast('请绑定银行卡', {onHide: ()=> this.navigate('BindBankCard')})
        }
        const curTime = new Date();
        if (curTime - this.clickTime < 500) return false;
        this.clickTime = curTime;
        this.navigate('WithDraw');
    };
    getLevelImage () {
        if (!profileStore.isLogin) return false;
        switch (profileStore.userInfo.level) {
            case 1:
                return require('../../assets/images/level1.png');
            case 2:
                return require('../../assets/images/level2.png');
            case 3:
                return require('../../assets/images/level3.png');
            case 4:
                return require('../../assets/images/level4.png');
            case 5:
                return require('../../assets/images/level5.png');
            case 6:
                return require('../../assets/images/level6.png');
            default:
                return require('../../assets/images/level1.png');
        }

    };
    restoreUserInfoFromStorage () {
        memberService.restoreUserInfoFromStorage()
            .then(res => {
                console.log('用户信息', res);
                profileStore.storeUserInfo(res);
                return Promise.resolve()
            }).catch(err => {
                console.log('用户未登录');
                return Promise.reject(err)

        })
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.isFocused){
            this.getPageData();
        }
    };
    getPageData () {
        checkIsLogin()
            .then(this.restoreUserInfoFromStorage)
            .then(this.getBankCardList)
            .catch(err => {
                console.log(err);
                if (err.name === 'NotFoundError') {
                    profileStore.clearUserInfo();
                }
            })
    };
    componentWillMount () {
        this.getPageData()
    };
    selectPhotoTapped() {
        if (!profileStore.isLogin) return;
        const options = {
            title:'选择相片',
            takePhotoButtonTitle: '摄像头',
            chooseFromLibraryButtonTitle: '相册',
            cancelButtonTitle: '取消',
            quality: 0.3,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };
        ImagePicker.showImagePicker(options, (response) => {
            if(response.didCancel) {
            } else if(response.error) {
                console.log('报错')
            } else if(response.customButton) {
                console.log('用户输入自定义按钮')
            } else {
                if(!response.uri){
                    return ;
                }
                const suffix = path.extname(response.uri);
                let imageType = '';
                if(suffix === '.jpg' || suffix === '.jpeg'){
                    imageType = 'data:image/jpeg;base64,';
                }else if(suffix === '.png'){
                    imageType = 'data:image/png;base64,';
                }else{
                   return showToast('暂不支持此图片类型!');
                }
                this.setState({
                    userInfo: {avatar: response.uri}
                });
                memberService.updateMemberInfo({ avatar: imageType+response.data })
                .then((res) => { profileStore.storeUserInfo(res) })
                .catch(err => {
                    errorHandle(err).then(res => {
                        if (res.routeName && res.routeName === 'Login') {
                            this.setState({
                                isLogin: false
                            })
                        }
                    })
                })
            }

        })
    }
    onPressMenuButton (routeName) {
        const { isLogin } = profileStore;
        const { needComplete } = profileStore.userInfo;
        if (isLogin || routeName === 'AboutUs') {
            const curTime = new Date();
            if (curTime - this.clickTime < 300) return false;
            this.clickTime = curTime;
            if(routeName === 'ModifyMemberInfo') {
                if(!!profileStore.userInfo && needComplete === 1) {
                    this.navigate('ThirdPartyPerfectingInfo',{type: 'fromMemberCenter'});
                }else {
                    this.navigate(routeName);
                }
            } else {
                this.navigate(routeName);
            }
        } else {
            showToast('您还未登录，请先登录', {
                onHide: () => {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login'})]
                    });
                    this.props.navigation.dispatch(resetActions);
                }
            })
        }
    };
    render() {
        const {userInfo, isLogin} = profileStore;
        const avatar = (isLogin && userInfo.avatar) ? {uri: userInfo.avatar} : require('../../assets/images/my_avatar.webp');
        return (
            <View style={styles.container}>
                <ImageBackground style={styles.profileWarp} source={require('../../assets/images/my_header_bg_new.webp')}>
                    <TouchableWithoutFeedback onPress={this.selectPhotoTapped.bind(this)}>
                        <Image style={styles.avatar} source={avatar}/>
                    </TouchableWithoutFeedback>
                    {
                        isLogin ? (
                            <View style={styles.userInfo}>
                                <View style={styles.userInfoItem}>
                                    <Text style={styles.username} numberOfLines={1} onPress={() => this.onPressMenuButton('ModifyMemberInfo')}>
                                        {userInfo.userNickname ? userInfo.userNickname : userInfo.username}
                                    </Text>
                                    <TouchableOpacity onPress={() =>{
                                        this.navigate('HtmlPage',{title: '等级说明', type: 'userLevelDesc'})}}
                                                      activeOpacity={0.5}>
                                        <Image style={styles.userLevel} source={this.getLevelImage()} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.userInfoItem}>
                                    <Text style={styles.loginTime}
                                          numberOfLines={1}
                                          onPress={() => this.onPressMenuButton('ModifyMemberInfo')}>
                                        {userInfo.slogan ? userInfo.slogan : config.userInfo.defaultSlogan}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => this.onPressMenuButton('ModifyMemberInfo')}
                                                  activeOpacity={1}
                                                  style={styles.userInformation}>
                                    <Icon name='icon-right-arrow-normal' style={{color:'#fff',width:18,fontSize:25,}}/>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.myButton}>
                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={() => { this.onClickMenuBtn('Login') }}
                                >
                                    <Text style={styles.loginText}>登录</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={() => { this.onClickMenuBtn('Register') }}
                                >
                                    <Text style={styles.registerText}>注册</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </ImageBackground>
                <View style={styles.cashFlowBar}>
                    <TouchableOpacity style={styles.cashFlowItem} onPress={() => { this.onPressMenuButton('ChildPayIn')}}>
                        <Icon name='icon-bank-card' size={28} color='#555'/>
                        <Text style={styles.cashFlowBtn}>充值</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cashFlowItem]} onPress={this.entryWithDraw}>
                        <Icon name='icon-withdraw' size={24} color='#555'/>
                        <Text style={styles.cashFlowBtn}>提现</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <View style={styles.boxTitle}>
                        <Icon name='icon-fund' size={17} color='#555' style={{marginRight:5}}/>
                        <Text>我的资产</Text>
                    </View>
                    <View style={styles.boxes}>
                        {
                            myAssets.map((item, index) => {
                                return (
                                    <MemberMenuButton
                                        key={`box${index}`}
                                        renderIcon={item.renderIcon}
                                        bgColor={item.bgColor}
                                        title={item.title}
                                        routerName={item.routeName}
                                        onPressHandle={() => {this.onPressMenuButton(item.routeName)}}
                                        apperance = {{marginTop: -1,borderColor: '#E5E5E5', borderWidth: StyleSheet.hairlineWidth,  height: 95}}
                                    />)
                            })
                        }

                    </View>
                    <View style={[styles.boxTitle, {marginTop: 10}]}>
                        <Icon name='icon-more-block' size={17} color='#666' style={{marginRight:5}}/>
                        <Text>我的常用</Text>
                    </View>
                    <View style={styles.boxes}>
                        {
                            myFavoriteList.map((item, index) => {
                                return (
                                    <MemberMenuButton
                                        key={`box${index}`}
                                        renderIcon={item.renderIcon}
                                        bgColor={item.bgColor}
                                        title={item.title}
                                        routerName={item.routeName}
                                        onPressHandle={() => {this.onPressMenuButton(item.routeName)}}
                                        apperance = {{
                                            borderColor: '#E5E5E5',
                                            borderWidth: StyleSheet.hairlineWidth,
                                            marginTop: -1,
                                            height: 95}}
                                    />)
                            })
                        }

                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7'
    },
    profileWarp: {
        flexDirection: 'row',
        padding: 10,
        width: width,
        height: 145,
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#DF2214'
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        marginRight: 10,
        marginTop: 20,
        borderColor: 'transparent'
    },
    userInfo: {
        flexDirection: 'column',
        flex: 2,
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 2,
        marginTop: 20,
    },
    userInfoItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height:28,
    },
    username: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
        overflow: 'hidden'
    },
    userLevel: {
        width: 80,
        height:15,
        marginLeft: 10,
    },
    userInformation: {
        position: 'absolute',
        right: 0,
    },
    loginTime: {
        width: 190,
        fontSize: 13,
        color: '#FFF',
    },
    myButton: {
        flexDirection: 'row',
        flex: 2,
        paddingTop: 20
    },
    loginButton: {
        width:  74,
        height: 25,
        marginRight: 12,
        backgroundColor: '#AB0C00',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent:'center',
    },
    loginText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#fff',
    },
    registerButton: {
        width:  74,
        height: 25,
        marginRight: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent:'center',
        borderColor: '#fff',
        borderWidth: StyleSheet.hairlineWidth,
    },
    registerText: {
        fontSize: 14,
        color: '#FFF',
    },
    cashFlowBar: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginBottom: 10
    },
    cashFlowItem: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        borderColor: '#E5E5E5',
        borderLeftWidth: StyleSheet.hairlineWidth
    },
    cashFlowIcon: {
        width: 25,
        height: 20,
        marginRight: 5,
    },
    cashFlowBtn: {
        color: '#333',
        fontSize: 14,
        padding: 5
    },
    boxTitle: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        height:35,
        paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFF'
    },
    titleIcon: {
        height: 17,
        width: 17,
        marginRight: 5,
    },
    boxes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#FFF'
    },
    menuBox: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E5E5',
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 140,
        width: 260

    }
})
export default withNavigationFocus(MyCenter, 'MyCenter');
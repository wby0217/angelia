import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
    Platform,
    InteractionManager
} from 'react-native';
import JPushModule from 'jpush-react-native';
import { NavigationActions } from 'react-navigation';
import CarouselHeader from './home/carousel';
import { observer, inject } from 'mobx-react/native';
import {CachedImage} from "react-native-img-cache";
import { withNavigationFocus } from 'react-navigation-is-focused-hoc';
import Notice from './home/notice';
import { lotteryCategory, sendUserDeviceInfo } from '../service';
import memberService from '../service/memberService';
import { checkIsLogin } from '../service/authService';
import * as Utils from '../utils';
import NetWorkTool from '../utils/netWorkTool';
import { homeMenuList } from '../config/homeMenu';
import { Icon } from "../component/customicons";
import errorHandle from "../service/errorHandle";
import { profileStore } from '../store';

const { width } = Dimensions.get('window');

@observer
class Home extends Component {
    constructor (props) {
        super(props)
        this.state = {
            isLogin: false,
            lotteryTypeList: [],
            appSettings: {},
            networkError: false,
        };
        this.timer = null;
        this.lotteryListRow = 0;
        this.clickTime = new Date();
        this.navigate = props.navigation.navigate;
        this.onPressMenuHandle = this.onPressMenuHandle.bind(this);
        this.renderLotteryList = this.renderLotteryList.bind(this);
        this.networkChangeHandle = this.networkChangeHandle.bind(this);
    };
    onPressMenuHandle (routeName) {
        console.log(routeName);
        const { networkError} = this.state;
        if (networkError) return Utils.showToast(NetWorkTool.NOT_NETWORK);
        if ( !profileStore.isLogin ) {
            return Utils.showToast('请先登录!',{
                onHidden: () => {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login'})]
                    });
                    this.props.navigation.dispatch(resetActions);
                }
            });
        }
        if (routeName === 'CenterAgent') {
            if (profileStore.userInfo.isAgent === 0) {
                return Utils.showToast('您还不是代理，请先注册代理！');
            } else if (profileStore.userInfo.isAgent === 2) {
                return Utils.showToast('您申请的代理还在审核中，请耐心等待！');
            }
        }
        const curTime = new Date();
        if (curTime - this.clickTime < 500) return false;
        this.clickTime = curTime;
        return this.navigate(routeName);
    };
    restoreLotteryCategoryFromStorage() {
        return storage.load({key: 'lotteryCategory'}).then((res) => {
            this.setState({lotteryTypeList: res.list});
            this.lotteryListRow = Math.ceil(res.totalNum/3);
            return Promise.resolve();
        }).catch(err => {
            return Promise.reject(err);
        })
    };
    checkIsLogin () {
        return new Promise ((resolve, reject) => {
            if (profileStore.isLogin) {
                return resolve()
            } else {
                return reject()
            }
        })

    }
    getPageData () {
        this.restoreLotteryCategoryFromStorage()
            .catch(err => {
                errorHandle(err).then(res => {
                    if (res.network && res.network === 'error') {
                        this.setState({networkError: true});
                    }
                })

            })
    };
    componentWillReceiveProps(nextProps) {
        if(!nextProps.isFocused) {
        } else {
            this.getPageData();
        }
    }
    networkChangeHandle (status) {
        const networkStatus = status.type.toLocaleLowerCase();
        if (networkStatus !== 'none') {
            this.getPageData();
            this.setState({ networkError: false });
        } else {
            this.setState({ networkError: true });
        }
    }
    componentWillMount() {
        InteractionManager.runAfterInteractions(() => {
            NetWorkTool.checkNetworkState((status) => {
                if (status === 'none') {
                    Utils.showToast(NetWorkTool.NOT_NETWORK,
                        {duration: 1000, onHide: () => {
                            this.setState({
                                networkError: true
                            });
                        }});
                }
            });
        });
        this.getPageData();

        NetWorkTool.addEventListener('connectionChange', this.networkChangeHandle);
        JPushModule.getRegistrationID(id => {
            this.checkIsLogin()
                .then(() => sendUserDeviceInfo({platform: Platform.OS === 'ios' ? 1 : 2, deviceCode: id}))
                .catch(err => console.log('send user device Info', err));
        })
    }
    componentWillUnmount () {
        NetWorkTool.removeEventListener('connectionChange', this.networkChangeHandle)
    }
    toRoomList({item}) {
        const { networkError } = this.state;
        if (networkError) return Utils.showToast(NetWorkTool.NOT_NETWORK);
        if(!profileStore.isLogin) {
            Utils.showToast('请先登录!',{
                onHidden: () => {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login'})]
                    });
                    this.props.navigation.dispatch(resetActions);
                }
            });
        } else {
            const curTime = new Date();
            if (curTime - this.clickTime < 500) return false;
            this.clickTime = curTime;
            this.navigate('RoomList', { lotteryId: item.LotteryId, categoryId: item.categoryId })
        }
    };
    renderLotteryList (list) {
        return (
            !!list && list.map((item, index) => {
                const imageUrl = !!item.imageUrl ? {uri: item.imageUrl} : require('../assets/images/defaultLotteryIcon.png');
                return (
                    <TouchableOpacity onPress={this.toRoomList.bind(this, {item})}
                                      activeOpacity={0.8}
                                      key={index}
                                      style={[styles.lotteryListItem,
                                          index >= (this.lotteryListRow * 3 - 3) ? {borderBottomWidth: 0} : null]}>
                        <CachedImage source={imageUrl} style={{width: 50, height: 50}} mutable/>
                        <Text style={{marginTop: 10, marginBottom: 8}}>{item.LotteryName}</Text>
                        <TouchableOpacity activeOpacity={0.9}
                                          style={styles.lotteryRule}
                                          onPress={() => {
                                              const curTime = new Date();
                                              if (curTime - this.clickTime < 500) return false;
                                              this.clickTime = curTime;
                                              this.navigate('HtmlPage', {
                                                  title: '游戏玩法',
                                                  LotteryId: item.LotteryId,
                                                  type: 'rule'
                                              });
                                          }}>
                            <Text style={{fontSize: 11, color: '#666', paddingHorizontal: 5}}>玩法规则</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>)
            })
        )
    }
    render() {
        const { lotteryTypeList } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8F8F8', flexDirection: 'column' }}>
                <CarouselHeader {...this.props} />
                <TouchableOpacity style={{paddingTop:8}}
                                  onPress={() => this.navigate('Dynamic')}
                                  activeOpacity={0.8}>
                    <Notice />
                </TouchableOpacity>
                <View style={styles.listBtnView}>
                    { homeMenuList.length && homeMenuList.map((item, index) =>
                        <TouchableOpacity
                            onPress={() => this.onPressMenuHandle(item.routeName)}
                            activeOpacity={0.8}
                            key={index}
                            style={styles.listBtnItem}
                        >
                            <Image
                                source={item.imageUrl}
                                style={{ width: 40, height: 40, marginBottom: 8 }}
                            />
                            <Text>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.lotteryListView}>
                    <View style={styles.lotteryListTitle}>
                        <Icon name='icon-hot' color="#FF0033" size={18} style={{marginLeft: 10, marginRight: 5}}/>
                        <Text>热门游戏</Text>
                    </View>
                    <View style={styles.lotteryList}>
                        {this.renderLotteryList(lotteryTypeList)}
                    </View>
                </View>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    listBtnView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderColor: '#EFEFEF',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    listBtnItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    lotteryListView:{
        borderColor: '#EFEFEF',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: '#fff',
    },
    lotteryListTitle: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    lotteryList: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    lotteryListItem: {
        width: (width-2)/3,
        height: 135,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: 1,
        paddingHorizontal: 0,
        margin: 0
    },
    lotteryRule: {
        borderColor: '#C7C7C7',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 3
    },
    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9DD6EB'
    },

    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#97CAE5'
    },

    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9'
    },
});

export default withNavigationFocus(Home, 'Home');
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  ScrollView,
    Platform,
    ImageBackground,
  InteractionManager
} from 'react-native';
import {CachedImage} from "react-native-img-cache";
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-spinner';
import { roomListService } from '../../service';
import memberService from "../../service/memberService";
import errorHandle from '../../service/errorHandle';
import { showToast, Alert } from '../../utils';
import Header from '../../component/header';
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../store';

const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
const BGLIST = {
        'general': require('../../assets/images/general_grade.webp'),
        'middle': require('../../assets/images/mid_grade.webp'),
        'higher': require('../../assets/images/high_grade.webp')
    };

const Background = isIos ? ImageBackground : CachedImage;
@inject('betStore')
@observer
export default class RoomList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            roomList: [],
            userInfo: {},
            isConnecting: false
        };
        this.navigate = props.navigation.navigate;
        this.params = props.navigation.state.params;
        this.navigation = props.navigation;
        this.clickTime = new Date();
        this.fetchRoomListData = this.fetchRoomListData.bind(this);
        this.toggleIsLoading = this.toggleIsLoading.bind(this);
        this.onPressRight = this.onPressRight.bind(this) ;
    }
    toggleIsLoading(status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        })
    }
    componentWillMount() {
        this.fetchRoomListData()
    }
    fetchRoomListData () {
        this.toggleIsLoading(true);
        const { lotteryId } = this.params;
        memberService.getUserInfo()
            .then(res => this.setState({userInfo: res}))
            .then(() => roomListService({lotteryId}))
            .then(res => this.setState({roomList: res.list}))
            .then(() => this.toggleIsLoading(false))
            .catch(err => {
                console.log(err);
                this.toggleIsLoading(false);
                errorHandle(err).then(res => {
                    if(res.routeName && res.routeName) {
                        const resetActions = NavigationActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: res.routeName})]
                        });
                        this.props.navigation.dispatch(resetActions);
                    }
                })

            })

    }
    componentWillUnmount () {
    }
    intoBetChatRoom(roomInfo) {
        const { level, username, userId, avatar } = this.state.userInfo;
        const { limitUserLevel } = roomInfo;
        if(level < limitUserLevel) {
            this._alert.alert('', '用户等级太low,赶快去充值提升等级吧！',[
                {text: '取消', onPress: () => {}},
                {text: '去充值', onPress: () => this.navigate('ChildPayIn')}
            ])
        } else {
            betStore.roomInfo = {...Object.assign(roomInfo, {categoryId: this.params.categoryId })};
            const curTime = new Date();
            if (curTime - this.clickTime < 300) return false;
            this.clickTime = curTime;
            this.navigate('ChatRoom');
        }
    }
    onPressRight() {
        const { lotteryId } = this.navigation.state.params;
        this.props.navigation.navigate('MsgDetails',{ title: '游戏玩法',LotteryId: lotteryId, type: 'rule' });
    }
    render() {
        const { roomList } = this.state;
        return (
            <View style={{flex:1}}>
                <Header headerTitle="房间列表"
                        navigation = {this.navigation}/>
                <ScrollView style={{flex:1}}>
                    {!!roomList && roomList.map((item, index) =>
                        <TouchableOpacity onPress={this.intoBetChatRoom.bind(this, item)}
                                          activeOpacity={0.8}
                                          style={{ marginTop: 10,flexDirection: 'row' }}
                                          key={index}>
                            <ImageBackground source={{ uri: item.roomImageUrl, cache: 'force-cache'}}
                                        style={{height: 100, width}}
                                        resizeMode={Image.resizeMode.contain}>
                                <Text style={styles.personNum}>{item.onlineUserNum}人</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    )}
                    <Spinner visible={this.state.isConnecting}
                             color="#333"
                             overlayColor="transparent"
                             textContent={"正在加载"}
                             textStyle={{color: '#333', fontSize: 16}} />
                    <Alert ref={ ref => this._alert = ref } />
                </ScrollView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    personNum: {
        color: '#fff',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0)',
        bottom: 17,
        left: 90
    },
    betMount: {
        color: '#823900',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0)',
        top: 32,
        left: width/2
    },
});

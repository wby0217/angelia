import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
    TextInput,
    Button,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    AppState,
    Animated,
    NetInfo,
    LayoutAnimation,
} from 'react-native';
import uuid from 'uuid';
import Immutable from 'immutable';
import { observer, inject } from 'mobx-react/native';
import Header from '../../component/header';
import StatusBar from './statusBar';
import { StyleConfig } from '../../assets/style';
import Message from './message';
import { HistoryIssueList, HistoryIssueTouchBar } from './historyIssue';
import Spinner from 'react-native-spinner';
import { playTypeOddsService, lotteryIssueService, issueListService, genBetOrderService } from '../../service';
import errorHandle from '../../service/errorHandle';
import networkTool from '../../utils/netWorkTool';
import { showToast, Alert, arrayCombine } from '../../utils';
import BetPanel from "./betPanel";
import OrderDetail from './orderDetail'
import { betStore, appSettingStore, socketStore } from '../../store';
import { Icon } from '../../component/customicons';

const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
const { width } = Dimensions.get('window');

@inject('betStore')
@observer
export default class BetChatRoom extends Component {
    constructor (props){
        super(props);
        this.state={
            inputMessage: '',
            showHistoryIssue: false,
            issueList: [],
            isConnecting: false,
            locationOfIssueList: {},
            btnText: 'order',
            inputText: '',
            appState: AppState.currentState,
            isIssueClosed: false,
            curIssueNo: '',
            networkStatus: ''
        };
        this.navigation = props.navigation;
        this.socket = null;
        this.contentLength = 0;
        this.visibleLength = 0;
        this.scrollOffsetY = 0;
        this.onCloseHistoryIssue = this.onCloseHistoryIssue.bind(this);
        this.showHistoryIssue = this.showHistoryIssue.bind(this);
        this.headerRight = this.headerRight.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.intoLotteryChart = this.intoLotteryChart.bind(this);
        this.onSendMessage = this.onSendMessage.bind(this);
        this.scrollToEnd = this.scrollToEnd.bind(this);
        this.toggleBetPanel = this.toggleBetPanel.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.networkChangeHandle = this.networkChangeHandle.bind(this);
        this.checkNetworkStatus = this.checkNetworkStatus.bind(this);
        this.showIssueNoChangeNotice = this.showIssueNoChangeNotice.bind(this);
        this.timer = [];
    }
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    toggleBetPanel (status) {
        betStore.betPanelStatus = status !== undefined ? status : !betStore.betPanelStatus;
    }
    headerRight () {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => {this.intoLotteryChart()}}>
                    <Image
                        source={require('../../assets/images/icon_trend.webp')}
                        style={styles.headerIcon}
                        resizeMode={Image.resizeMode.contain}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.navigation.navigate('MemberGameRecord')}>
                    <Image
                        source={require('../../assets/images/icon_bet_order.webp')}
                        style={styles.headerIcon}
                        resizeMode={Image.resizeMode.contain}
                    />
                </TouchableOpacity>
            </View>
        )
    }
    intoLotteryChart () {
        const {lotteryId,  categoryId } = betStore.roomInfo;
        const { navigate } = this.navigation;
        switch ( categoryId ) {
            case 1:
            case 2:
            case 4:
            case 5:
                return navigate('MultiGridChart', {lotteryId, categoryId, loading: false});
            case 3:
                return navigate('TwentyEightChart', {lotteryId, categoryId, loading: false});
            case 6:
                return navigate('LhcChart', {lotteryId, categoryId, loading: false});
        }
    }
    scrollToEnd () {
        const offsetY = this.contentLength - this.visibleLength;
        this.flatList.scrollToOffset({
            offset: offsetY > 0 ? offsetY : 0
        })
    }
    onCloseHistoryIssue () {
        this.setState({
            showHistoryIssue: false
        })
    }
    showHistoryIssue (location) {
        betStore.getHistoryLotteryList();
        this.setState({
            locationOfIssueList: location,
            showHistoryIssue: true
        })
    }

    onSendMessage () {
        const { networkStatus } = this.state;
        if (!this.state.inputMessage) return false;
        const { speakAllow } = betStore.roomInfo;
        if (!speakAllow ) return showToast('聊天室禁止发言');
        const message = {
            actId: uuid(),
            type: 2,
            textMessage: this.state.inputMessage
        };
        const newMessage = socketStore.splitMessageForChat(message,networkStatus);
        socketStore.sendSocketMessage(newMessage);
        this.setState({inputMessage: ''})
    }

    handleAppStateChange (nextAppState) {
        const { appState } = this.state;
        if (appState.match(/inactive|background/) && nextAppState.app_state === 'active') {
            socketStore.connectWebSocket();
            betStore.getHistoryLotteryList();
            this.statusBar.getLotteryIssue();
        } else {
            socketStore.stopWebSocket();
        }
        this.setState({appState: nextAppState.app_state});
    };
    onResubmitBet (orderInfo, msgIndex) {
        const {isIssueClosed} = this.state;
        const curIssueNo = betStore.curIssueInfo.issueNo;
        const messageList = Immutable.fromJS(socketStore.messageList).toJS();
        if (isIssueClosed) {
            showToast('当前彩期已封盘，请稍后重试!');
        } else if (curIssueNo !== orderInfo.data.issueNo) {
            this.Alert.alert('', '当前彩期已变更，是否重新下注！',[
                {text: '取消', onPress: () => {}},
                {text: '确定', onPress: () => {
                    messageList[msgIndex].data.issueNo = curIssueNo;
                    messageList[msgIndex].data.status = 'loading';
                    betStore.messageList = messageList;
                    betStore.reSubmitBet(messageList[msgIndex])
                }}
            ]);
        } else {
            messageList[msgIndex].data.status = 'loading';
            socketStore.messageList = messageList;
            betStore.reSubmitBet(messageList[msgIndex])
        }
    }
    showIssueNoChangeNotice () {
        return new Promise((resolve, reject) => {
            this.Alert.alert('', '当前彩期已变更，是否重新下注！',[
                {text: '取消', onPress: () => reject()},
                {text: '确定', onPress: () => resolve()}
            ])
        });

    }
    networkChangeHandle (status) {
        const prevStatus = this.state.networkStatus;
        const networkStatus = status.type.toLocaleLowerCase();
        this.setState({networkStatus}, () => {
            if (networkStatus === 'none') {
                LayoutAnimation.configureNext({
                    duration: 300,
                    create: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.scaleXY,
                    },
                    update: {
                        type: LayoutAnimation.Types.linear,
                    },
                });
                socketStore.stopWebSocket();
            } else if(prevStatus.match(/none/)) {
                socketStore.connectWebSocket();
                betStore.getHistoryLotteryList();
                this.statusBar.getLotteryIssue();
            }
        });
    }
    checkNetworkStatus () {
        networkTool.checkNetworkState(networkStatus => {
            this.setState({networkStatus}, () => {
                if (networkStatus !== 'none') {
                    socketStore.connectWebSocket();
                    betStore.getHistoryLotteryList();
                    this.statusBar.getLotteryIssue();
                }
            })
        })
    }
    componentWillMount () {
        betStore.fetchPlayList();
        networkTool.checkNetworkState(networkStatus => {
            this.setState({networkStatus})
        });
        socketStore.connectWebSocket();
        betStore.getHistoryLotteryList();
        this.subscriptions = [
            AppState.addListener('appStateDidChange', this.handleAppStateChange),
        ];
        networkTool.addEventListener('connectionChange', this.networkChangeHandle);
    }
    componentWillUnmount () {
        socketStore.stopWebSocket();
        this.subscriptions.forEach((sub) => sub.remove());
        this.timer.forEach((item) => clearTimeout(item));
        networkTool.removeEventListener('connectionChange', this.networkChangeHandle);
        betStore.clearIssueList();
        socketStore.cleanMessageList();
        betStore.cleanSelectedBall();
        betStore.cleanSelectedContent();
    }
    render () {
        const { showHistoryIssue, locationOfIssueList, isConnecting, btnText, inputMessage,isIssueClosed, curIssueNo, networkStatus} = this.state;
        const {issueList} =betStore;
        const {messageList } =socketStore;
        return (
            <Container style={styles.container} behavior="padding">
                <Header
                    headerTitle={`${betStore.roomInfo.roomName}聊天室`}
                    backgroundColor={StyleConfig.headerBgColor}
                    navigation={this.navigation}
                    headerRight={this.headerRight}/>
                <TouchableOpacity
                    style={[styles.networkBar, networkStatus==='none' && {height: 30}]}
                    onPress={() => {
                        this.checkNetworkStatus()
                    }}>
                    <Icon color='#df2214' size={15} name='icon-warn-fail' style={styles.statusIcon}/>
                    <Text style={styles.font12}>网络异常，请稍检查网络后重试！</Text>
                </TouchableOpacity>
                <StatusBar
                    ref={(statusBar) => this.statusBar = statusBar}
                    lotteryId={betStore.roomInfo.lotteryId}
                    onUpdating={(status) => this.toggleSpinner(status)}
                    navigation={this.navigation}
                    onClose={() => {
                        this.setState({isIssueClosed: true})
                    }}
                    onStart={(issueInfo) => {
                        betStore.curIssueInfo = issueInfo;
                        this.setState({isIssueClosed: false, curIssueNo: issueInfo.issueNo})
                    }}
                />
                <HistoryIssueTouchBar
                    categoryId={betStore.roomInfo.categoryId}
                    onPress={(location) => this.showHistoryIssue(location)}/>
                <HistoryIssueList
                    showHistoryIssue={showHistoryIssue}
                    onShow={() => {}}
                    categoryId={betStore.roomInfo.categoryId}
                    onClose={this.onCloseHistoryIssue}
                    location={locationOfIssueList}
                    onPressLoadMore={() => {
                        this.onCloseHistoryIssue();
                        this.intoLotteryChart();
                    }}
                />
                <FlatList
                    onScroll={(event) => {
                        this.scrollOffsetY = event.nativeEvent.contentOffset.y;
                    }}
                    style={styles.chatListView}
                    ref={(ref) => { this.flatList = ref}}
                    onLayout={(event) => {
                        this.visibleLength = event.nativeEvent.layout.height;
                        this.scrollToEnd();
                    }}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        const self = this;
                        this.contentLength = contentHeight;
                        this.timer[0] = setTimeout(() => {
                            if (contentHeight - self.scrollOffsetY < 2.5 * self.visibleLength) {
                                self.scrollToEnd()
                            }
                        }, 100)

                    }}
                    data={messageList}
                    extraData={this.state}
                    keyExtractor={(item, index) => index}
                    renderItem={({item, index}) => {
                          return (
                              <Message
                                  messageListIndex={index}
                                  messageContent={item}
                                  onRetry={(orderInfo, msgIndex) => this.onResubmitBet(orderInfo, msgIndex)}
                              />
                          )
                      }}/>
                <View style={styles.betInput}>
                    <TextInput style={styles.messageInput}
                               value={inputMessage}
                               autoCapitalize="none"
                               maxLength={120}
                               returnKeyType="send"
                               returnKeyLabel="发送"
                               underlineColorAndroid='transparent'
                               onSubmitEditing={this.onSendMessage}
                               onChangeText={(inputMessage) => this.setState({inputMessage})}
                    />
                    <TouchableHighlight style={styles.messageBtn}
                                        underlayColor={'#EFEFEF'}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            this.toggleBetPanel(true);
                                        }}>
                        <Text style={{ color: '#EC0909'}}>
                            投注
                        </Text>
                    </TouchableHighlight>
                </View>
                <Spinner visible={isConnecting}
                            color="#333"
                            overlayColor="transparent"
                            textContent={"正在加载"}
                            textStyle={{color: '#333', fontSize: 16}} />
                <BetPanel
                    ref={(betPanel) => this.betPanel = betPanel}
                    onUpdateOrderStatus={(actId, status, index) => {this.updateMessageStatus(actId, status, index)}}
                    isOpen={betStore.betPanelStatus}
                    issueNo={curIssueNo}
                    navigation={this.props.navigation}
                    isIssueClosed={isIssueClosed}
                    onClosedHandle={() => this.toggleBetPanel(false)} />
                <OrderDetail
                    showIssueNoChangeNotice = {this.showIssueNoChangeNotice}
                    navigation = {this.props.navigation}/>
                <Alert ref={ ref => this.Alert = ref } />
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2'
    },
    graySym: {
        color: '#B0B9C9'
    },
    headerIcon : {
        width: 20,
        height: 20,
        marginLeft: 10,
        marginTop: 5
    },
    fontColor: {
        color: '#606060'
    },
    font12: {
        fontSize: 12
    },
    touchBar: {
        flexDirection: 'column',
        backgroundColor: '#FFF'
    },
    chatListView: {
        flex: 1,
        paddingHorizontal: 10,
    },
    betInput: {
        flexDirection: 'row',
        padding: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7D7D7',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageInput : {
        flex: 1,
        height: 30,
        backgroundColor: '#EBEBEB',
        borderRadius: 5,
        marginRight: 10,
        padding: 0,
        paddingLeft: 5,
        fontSize: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageBtn: {
        width: 60,
        height: 29,
        borderColor: '#EC0909',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkBar: {
        width: width,
        backgroundColor: '#FFF0F0',
        flexDirection: 'row',
        height: 0,
        justifyContent:'flex-start',
        alignItems: 'center',
        paddingHorizontal: 10,
        overflow: 'hidden'
    },
    statusIcon: {
        marginRight: 5
    }
});
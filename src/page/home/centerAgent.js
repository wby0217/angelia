import React, { Component } from 'react';
import {
    View,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    Dimensions
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import { Icon } from '../../component/customicons';
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import DefaultTabBar from '../../component/customTabBar';
import ShareAgentCode from './shareAgentCode';
import AgentAcc from './agentAccount';
import Header from '../../component/header';
import Modal from 'react-native-modalbox';
const { width, height } = Dimensions.get('window');

export default class Dynamic extends Component {
    static navigationOptions =  {
            header: null
    };
    constructor (props) {
        super(props);
        this.navigation = props.navigation;
        this.state = {
            isOpen: false
        };
        this.onOpenShareModal = this.onOpenShareModal.bind(this);
        this.closeShareModal = this.closeShareModal.bind(this);
    }
    onOpenShareModal() {
        this.setState({isOpen: true});
    }
    closeShareModal() {
        this.setState({isOpen: false});
    }
    render() {
        const { isOpen } = this.state;
        return (
            <View style={{flex: 1}}>
                <Header headerTitle = '代理中心'
                        navigation = {this.navigation}/>
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar />}
                    tabBarUnderlineStyle={{ backgroundColor: '#FFEC2E',height: 2 }}
                    tabBarActiveTextColor="#FFEC2E"
                    tabBarInactiveTextColor="#FFF"
                    tabBarBackgroundColor="#B10023"
                    initialPage={0}
                    onChangeTab = {Keyboard.dismiss}>
                    <AgentAcc tabLabel="直接开户" {...this.props} />
                    <ShareAgentCode
                        tabLabel="分享链接"
                        onOpenShareModal={this.onOpenShareModal}
                        ref={(shareAgentCode)=> this.shareAgentCode = shareAgentCode}
                        {...this.props} />
                </ScrollableTabView>
                <Modal
                    style={styles.modal}
                    isOpen = {isOpen}
                    swipeToClose={false}
                    onClosed={()=>{this.closeShareModal()}}
                    position="bottom">
                    <Text style={styles.title}>分享</Text>
                    <View style={styles.shareBtnWrap}>
                        <TouchableOpacity style={styles.shareBtn} onPress={()=>{this.shareAgentCode.onPressThirdShare(2)}}>
                            <Image  style={styles.signWay}
                                    source={require('../../assets/images/friend.png')}/>
                            <Text style={styles.shareText}>微信好友</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={()=>{this.shareAgentCode.onPressThirdShare(3)}}>
                            <Image  style={styles.signWay}
                                    source={require('../../assets/images/circleFriends.png')}/>
                            <Text style={styles.shareText}>朋友圈</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={()=>{this.shareAgentCode.onPressThirdShare(0)}}>
                            <Image  style={styles.signWay}
                                    source={require('../../assets/images/qq.png')}/>
                            <Text style={styles.shareText}>qq好友</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={()=>{this.shareAgentCode.onPressThirdShare(4)}}>
                            <Image  style={styles.signWay}
                                    source={require('../../assets/images/qqSpace.png')}/>
                            <Text style={styles.shareText}>qq空间</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={()=>{this.shareAgentCode.onPressThirdShare(1)}}>
                            <Image  style={styles.signWay}
                                    source={require('../../assets/images/weibo.png')}/>
                            <Text style={styles.shareText}>新浪微博</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={()=>{this.closeShareModal()}} style={styles.button}>
                        <Text style={{color: '#4A90E2',fontWeight: '600'}}>取消</Text>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    modal: {
        height: 165,
    },
    signWay: {
        width: 35,
        height: 35,
    },
    shareBtn: {
        width: (width-40)/5,
        alignItems: 'center'
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        backgroundColor: '#f8f8f8',
    },
    title: {
        width: 50,
        position: 'absolute',
        left: width/2 - 25,
        color: '#999',
        textAlign:'center',
        lineHeight:35,
        backgroundColor: '#ffffff',
        zIndex:2,
    },
    shareBtnWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom:14,
        marginTop:18,
        paddingTop:22,
        borderTopWidth:1,
        borderColor:'#eee'
    },
    shareText: {
        lineHeight:34,
        fontSize: 12,
        textAlign:'center',
        color: '#999'
    }
});
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import { observer, inject } from 'mobx-react/native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ScrollableTabBar from '../../../component/scrollerTabBar';
import DrawerPanel from './drawerPanel'
import Bottom from './bottom'
import SelectionArea from './selectionArea';
import SelectionAreaLHC from './selectionArea/lhc';
import { getPlayList, genBetOrderService } from '../../../service';
import errorHandle from '../../../service/errorHandle';
import { showToast } from '../../../utils';
import { betStore } from '../../../store';

import uuid from 'uuid';
//
@inject('betStore')
@observer
export default class BetPanel extends Component {
    constructor(props){
        super(props);
        this.state = {
            drawerContent: '',
            viewWidth: 0,
            viewHeight: 0,
            selectedBall: [],
            isOpen: false,
        };
        this.navigate = props.navigation.navigate;
        this.selectionTab = [];
        this.selectedPrevMenu = [];
        this.selectedBallDisplay = [];
        this.SelectionArea = betStore.roomInfo.categoryId === 6 ? SelectionAreaLHC : SelectionArea;

        this.onClosedHandle = this.onClosedHandle.bind(this);
        this.renderSettingsIcon = this.renderSettingsIcon.bind(this);
        this.openDrawerPanel = this.openDrawerPanel.bind(this);

    }
    onClosedHandle () {
        betStore.cleanSelectedBall();
        betStore.cleanSelectedContent();
        betStore.activeTabIndex = 0;
        const { onClosedHandle } = this.props;
        onClosedHandle && onClosedHandle()
    }
    openDrawerPanel (type) {
        this.setState({
            drawerContent: type
        }, () => {
            this.drawer.toggleSlide(true);
        })
    }
    renderSettingsIcon () {
        return (
            <TouchableOpacity
                style={styles.rightIcon}
                onPress={() => {this.openDrawerPanel('PLAY_SETTINGS')}}>
                <Icon name="cog" size={24} color="#959595" />
            </TouchableOpacity>
        )
    }

    componentWillMount () {

    }
    render () {
        const { isOpen, isIssueClosed} = this.props;
        const { drawerContent, selectedBall} = this.state;
        const { playList, roomInfo } = betStore;
        return (
            <Modal
                style={[styles.modal]}
                isOpen = {isOpen}
                swipeToClose={false}
                onClosed={this.onClosedHandle}
                position="bottom">
                {
                    playList.length > 0 ? (
                        <ScrollableTabView
                            renderTabBar={() => {
                                return (
                                    <ScrollableTabBar
                                        style={styles.shadow}
                                        onPress={() => {}}
                                        right={this.renderSettingsIcon}
                                        rightWidth={40} />
                                )
                            }}
                            onChangeTab={({i}) => {
                                betStore.cleanSelectedBall();
                                betStore.cleanSelectedContent();
                                betStore.activeTabIndex = i;
                                !!playList[i].content && this.selectionTab[i].hasContentView.resetSelected();
                            }}
                            ref={(tabView) => { this.tabView = tabView }}
                            tabBarUnderlineStyle={{ backgroundColor: '#FF0033',height: 2 }}
                            tabBarActiveTextColor="#DD1B00"
                            tabBarInactiveTextColor="#2D2D2D"
                            tabBarBackgroundColor="#fff"
                            initialPage={0}>
                            { playList.map((item, index) => {
                                return (
                                    <this.SelectionArea
                                        ref={(selection) => this.selectionTab[index] = selection }
                                        key={item.id}
                                        playInfo={item}
                                        tabLabel={item.label} />
                                )
                            })}
                        </ScrollableTabView>
                    ): ( <View style={{flex: 1}} /> )
                }
                <Bottom
                    navigate={this.navigate}
                    selectedBall={selectedBall}
                    isIssueClosed={isIssueClosed}
                    onPressBetButton={(betAmount) => {this.submitBet(betAmount)}}
                    onPressRefButton={() => {this.openDrawerPanel('PLAY_REF')}}/>
                <DrawerPanel
                    ref={(drawer) => {this.drawer = drawer}}
                    content={drawerContent}
                    lotteryId={roomInfo.lotteryId}
                    playList={playList}/>
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    modal: {
        height: 460,
        backgroundColor: '#fff'
    },
    rightIcon: {
        width: 40,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: '#DDD',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    shadow: {
        borderBottomColor: '#DDD',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        marginBottom: 2,
    }
});
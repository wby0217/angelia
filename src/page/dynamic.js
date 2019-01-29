import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import Header from '../component/header';
import DefaultTabBar from '../component/customTabBar';
import MyMsg from './dynamic/myMsg';
import Notice from './dynamic/notice';

export default class Dynamic extends Component {
    constructor (props) {
        super(props);
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        if(nextProps.isFocused) {

        }
    }
    render() {
        return (
            <View style={{flex:1}}>
                <Header headerTitle = '动态' headerLeft={null}/>
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar />}
                    tabBarUnderlineStyle={{ backgroundColor: '#FF0033',height: 2 }}
                    tabBarActiveTextColor="#FF0033"
                    tabBarInactiveTextColor="#999"
                    tabBarBackgroundColor="#fff"
                    initialPage={0}
                >
                    <Notice tabLabel="消息公告" {...this.props} />
                    <MyMsg tabLabel="我的消息" {...this.props} />
                </ScrollableTabView>
            </View>
        );
    }
}

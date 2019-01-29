import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import { Home, PayIn, Dynamic, MyCenter } from '../page';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AWIcon from 'react-native-vector-icons/FontAwesome';
import TabBarItem from './tabBarItem';

const MyTabs = TabNavigator({
    Home: {
        screen: Home,
        navigationOptions: {
            header: null,
            tabBarLabel: '首页',
            headerBackTitle: null,
            tabBarIcon: ({focused, tintColor}) => (
                <TabBarItem
                    focused={focused}
                    normalImage={require('../assets/images/index_icon.webp')}
                    selectedImage={require('../assets/images/index_icon_active.webp')}
                />
            ),
            // headerLeft: <Icon name="home" size={28} color='#fff' />,
            headerStyle: {
                backgroundColor: '#55C0FE',
                height: Platform.OS === 'ios'? 64 : 44
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                alignSelf: 'center'
            }
        }
    },
    PayIn: {
        screen: PayIn,
        navigationOptions: {
        headerTitle: '充值',
        tabBarLabel: '充值',
        headerBackTitle: null,
        headerLeft: null,
        tabBarIcon: ({focused, tintColor}) => (
            <TabBarItem
                focused={focused}
                normalImage={require('../assets/images/payin_icon.webp')}
                selectedImage={require('../assets/images/payin_icon_active.webp')}
            />
        ),
        headerStyle: {
                backgroundColor: '#FF0033',
                height: Platform.OS === 'ios'? 64 : 44
            },
        headerTintColor: '#fff',
        headerTitleStyle: {
            alignSelf: 'center'
        },
    }
    },
    Dynamic: {
        screen: Dynamic,
        navigationOptions: {
            headerTitle: '动态',
            tabBarLabel: '动态',
            headerLeft: null,
            tabBarIcon: ({focused, tintColor}) => (
                <TabBarItem
                    focused={focused}
                    normalImage={require('../assets/images/dynamic_icon.webp')}
                    selectedImage={require('../assets/images/dynamic_icon_active.webp')}
                />
            ),
        headerStyle: {
            backgroundColor: '#FF0033',
            height: Platform.OS === 'ios'? 64 : 44
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            alignSelf: 'center'
            }
        }
    },
    MyCenter: {
        screen: MyCenter,
        navigationOptions: {
            tabBarLabel: '我的',
            header: null,
            tabBarIcon: ({focused, tintColor}) => (
                <TabBarItem
                    focused={focused}
                    normalImage={require('../assets/images/mycenter_icon.webp')}
                    selectedImage={require('../assets/images/mycenter_icon_active.webp')}
                />
            )
        }
    }
},{
    tabBarOptions: {
        inactiveTintColor: '#929292',
        activeTintColor: '#FF0033',
        indicatorStyle: {height: 0},
        labelStyle: {
            fontSize: 12,
            margin: 0,
            flexDirection: 'row',
            justifyContent: 'center'
        },
        showIcon: true,
        style: {
            backgroundColor: '#fff',
            marginVertical: 0,
            padding: 0,
        },
        tabStyle: {
            padding: 0,
            margin: 0
        },
        iconStyle: {
            flexDirection: 'row',
            justifyContent: 'center'
        }
    },
    animationEnabled: false,
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    initialRouteName: 'Home',
    lazy: true
});

export default MyTabs;
// app总入口

import React, { Component } from 'react';
import {
    InteractionManager,
    StatusBar,
    BackHandler,
    Platform
} from 'react-native';
import JPushModule from 'jpush-react-native';
import { updateFocus } from 'react-navigation-is-focused-hoc';
import Routers from '../navigators/scene';
import * as Utils from '../utils';

const isAndroid =  Platform.OS === 'android'
export default class Container extends Component {
    constructor (props) {
        super(props);
        this.state = {
           curRouteName: ''
        };
        this.backHandler = this.backHandler.bind(this)
    };
    backHandler () {
        const { curRouteName } = this.state;
        if (curRouteName === 'Main') {
            if (this.lastBackPressed && this.lastBackPressed + 3000 >= Date.now()) {
                return BackHandler.exitApp();
            }
            this.lastBackPressed = Date.now();
            Utils.showToast('再次点击退出');
            return true;
        } else {
            return false;
        }
    };
    componentDidMount() {
        this.timer = setInterval( () => {
            // console.log(123)
        }, 1000);
        JPushModule.addReceiveNotificationListener((map) => {
            console.log("jpush alertContent: " + map.alertContent);
            console.log("jpush extras: " + map.extras);
            // var extra = JSON.parse(map.extras);
            // console.log(extra.key + ": " + extra.value);
        });
        JPushModule.addReceiveOpenNotificationListener((map) => {
            console.log("jpush Opening notification!");
            console.log("jpush map.extra: " + map.key);
        });
        isAndroid && BackHandler.addEventListener('hardwareBackPress', this.backHandler)
    };
    render() {
        return (
            <Routers
                onNavigationStateChange={(prevState, currentState) => {
                    updateFocus(currentState);
                    StatusBar.setBarStyle('light-content');
                    InteractionManager.runAfterInteractions(() => {
                        const { index, routes } = currentState;
                        const routeName = routes[index].routeName;
                        if (routeName === 'Login' || routeName === 'Register') {
                            StatusBar.setBarStyle('dark-content');
                        }
                        this.setState({
                            curRouteName: routeName
                        })
                    });
                }}
            />
        );
    };
    componentWillUnmount() {
        JPushModule.removeReceiveCustomMsgListener();
        JPushModule.removeReceiveNotificationListener();
        clearInterval(this.timer);
        isAndroid && BackHandler.removeEventListener('hardwareBackPress', this.backHandler)
    }
}
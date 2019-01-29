import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Animated,
    StatusBar,
    ImageBackground
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { observer, inject } from 'mobx-react/native';

import codePush from "react-native-code-push";
import { appSettingStore } from '../../store';
import config from '../../config';

const { width, height} = Dimensions.get('window');
@inject('appSettingStore')
@observer
export default class Splash extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            updateInfo: '正在加载配置',
            bounceValue: new Animated.Value(1),
            isDestroy: false
        };
        this.checkUpdate = this.checkUpdate.bind(this);
    };
    codePushDownloadDidProgress(progress) {
        this.setState({
            updateInfo: `正在下载新配置${(progress.receivedBytes / progress.totalBytes * 100).toFixed(2)}%`
        })
    };
    codePushStatusDidChange(status) {
        switch (status) {
            case codePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({
                    updateInfo: '正在检查新配置'
                });
                break;
            case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                break;
            case codePush.SyncStatus.INSTALLING_UPDATE:
                break;
            case codePush.SyncStatus.UP_TO_DATE:
                this.setState({
                    updateInfo: '正在安装配置内容'
                });
                break;
            case codePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({
                    updateInfo: '将重新打开应用'
                });
                break
        }
    };
    checkUpdate() {
        this.timer = setTimeout(() => {
            this.setState({
                updateInfo: '当前是最新配置',
                isDestroy: true,
            }, () => {
                this.startAnimate();
            });
        }, 10000);
        codePush.checkForUpdate()
            .then((update) => this.state.isDestroy ? Promise.reject() : Promise.resolve(update))
            .then((update) => {
                console.log('codepush update=========',  update);
                !!this.timer && clearTimeout(this.timer);
                if (!!update) {
                    return  codePush.sync({installMode: codePush.InstallMode.IMMEDIATE},
                        this.codePushStatusDidChange.bind(this),
                        this.codePushDownloadDidProgress.bind(this)
                    )
                } else {
                    return Promise.reject();
                }
            })
            .then(() => codePush.notifyAppReady())
            .then(() => this.setState({updateInfo: '当前是最新配置'}, () => {this.startAnimate()}))
            .catch(err => {
                console.log('codepush update=========err',  err);
                !!this.timer && clearTimeout(this.timer);
                if (this.state.isDestroy) return false;
                this.setState({updateInfo: '当前是最新配置'},() => {
                    this.startAnimate();
                });
            });
    };
    startAnimate () {
        Animated.timing(
            this.state.bounceValue, {toValue: 1.2, duration: 2000}
        ).start();
    };
    componentDidMount() {
        this.checkUpdate();
        this.state.bounceValue.addListener(({value}) => {
            if(value === 1.2) {
                this.setState({isDestroy: true}, () => {
                    const resetActions = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({
                            routeName: 'Main',
                        })]
                    });
                    this.props.navigation.dispatch(resetActions);
                });
            }
        });
        StatusBar.setBarStyle('dark-content');
    };
    render() {
        const {updateInfo} = this.state;
        const splashImage = !!appSettingStore.appSettings.splash ?
            {uri: appSettingStore.appSettings.splash, cache: 'force-cache'} : require('../../assets/images/splash.png');
        return (
            <ImageBackground style={styles.container} source={splashImage}>
                <Text style={{color:'#333',fontSize: 20,marginBottom: height/4.2,backgroundColor: 'transparent'}}>一起聊天一起投注</Text>
                <Text style={styles.tip}>{updateInfo}</Text>
            </ImageBackground>
        );
    };
    componentWillUnmount() {
        !!this.timer && clearTimeout(this.timer);
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    tip: {
        backgroundColor: 'transparent',
        color: '#999',
    }
});
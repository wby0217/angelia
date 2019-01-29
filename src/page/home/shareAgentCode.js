import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Clipboard,
    ImageBackground,
    NativeModules
} from 'react-native';

import { showToast } from '../../utils';
import accountService from '../../service/accountService'
import errorHandle from '../../service/errorHandle'
const { width, height } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';

export default class ShareAgentCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            img: '',
            url: ''
        };
        this.onPressThirdShare = this.onPressThirdShare.bind(this);
        this.copyUrl = this.copyUrl.bind(this);
    };
    fetchAgentQRCode () {
        accountService.getAgentShareUrl().then(res => {
            console.log('getAgentShareUrl===', res);
            this.setState({
                img: res.data.agentQrCode,
                url: res.data.agentShareUrl
            })
        }).catch(err => {
            console.log('getAgentShareUrl===', err)
            errorHandle(err).then(res => {
                if (res.routerName && res.routerName === 'Login') {
                    this.props.navigation.navigate('Login');
                }
            })
        })
    }
    onPressThirdShare(platform) {
        const { img, url } = this.state;
        const title = '来自朋友的一封邀请函';
        const text = '赶快加入我们吧，一起欢乐开奖，快乐致富！';
        NativeModules.UMShareModule.share(text,img,url,title,platform,(code,message) =>{
            if(code === 200) {
                return showToast('分享成功');
            } else if(code !== 200 && code !== -1) {
                return showToast(message);
            }
        });
    }
    copyUrl () {
        Clipboard.setString(this.state.url);
        showToast('复制成功');
    }
    componentWillMount() {
        this.fetchAgentQRCode()
    };
    render() {
        const { img } = this.state;
        return(
            <ImageBackground style={styles.background} source={require('../../assets/images/agent_center_bg.png')} >
                <View style={styles.qrcode}>
                    {!!img && <Image style={styles.qrImage} source={{uri: img}} />}
                </View>
                <View style={styles.btnWrap}>
                    <TouchableOpacity style={styles.sharingBtn} onPress={this.copyUrl}>
                        <Text style={styles.btnTitle}>复制链接</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sharingBtn} onPress={()=>{this.props.onOpenShareModal()}}>
                        <Text style={styles.btnTitle}>分享</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }
};

const styles = StyleSheet.create({
    container: {
    },
    background: {
        width: width,
        height: isIos ? height-108 : height-100,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bottom: {
        width: width,
        resizeMode: 'contain'
    },
    qrcode: {
        width: 190,
        height: 190,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30 ,
    },
    qrImage: {
        width: 170,
        height: 170,
    },
    sharingBtn: {
        backgroundColor: '#FFEB00',
        height: 44,
        width: 120,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isIos ? 50 : 70,
        marginHorizontal: 10,
    },
    btnTitle: {
        color: '#756900',
        fontSize: 16,
        fontWeight: 'bold',

    },
    btnWrap: {
        flexDirection: 'row',
    },
});
import React, { Component } from 'react';import {    View,    Text,    Image,    StyleSheet,    TouchableOpacity,    CameraRoll,    takeSnapshot,    PermissionsAndroid,    Linking,    Platform,    Dimensions,    WebView,    ScrollView,    UIManager} from 'react-native';import Spinner from 'react-native-spinner';import { showToast, verification } from '../../utils';import Header from '../../component/header';const isAndroid = Platform.OS != 'ios';let RNFetchBlob = null;if (isAndroid) {    RNFetchBlob = require('react-native-fetch-blob').default;}const { width, height } = Dimensions.get('window');export default class ShowRechargeCode extends Component {    static navigationOptions = {        header: null    };    constructor(props) {        super(props);        this.state = {            imgUrl: '',            isConnecting: false,        };        this.rechargeInfo = props.navigation.state.params.rechargeInfo;        this.toggleSpinner = this.toggleSpinner.bind(this);        this.screenShot = this.screenShot.bind(this);        this.requestPermission = this.requestPermission.bind(this);        this.navigation = props.navigation;        this.enterRechargeResult = this.enterRechargeResult.bind(this);        this.checkIsSupportedOpenURL = this.checkIsSupportedOpenURL.bind(this);    };    toggleSpinner (status) {        this.setState({            isConnecting: status !== undefined ? status : !this.state.isConnecting        });    };    async requestPermission () {        try {            let result = await PermissionsAndroid.request(                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,                {                    title: ' 权限请求 ',                    message: ' 该应用需要如下权限 ' + ' 保存图片 ' + ' 请授权! '                },            );            if (result) {                this.saveImageAndLinking()            }        } catch (err) {            showToast(err);        }    };    fetchImageBlob(rechargeInfo) {        return new Promise ((resolve, reject) => {            if (!isAndroid) {                resolve(rechargeInfo)            } else {                RNFetchBlob                    .config({fileCache : true, appendExt : 'png'})                    .fetch('GET', rechargeInfo.codeImageUrl)                    .then(res => {                        rechargeInfo.codeImageUrl = res.path();                        return resolve(rechargeInfo);                    })                    .catch(err => reject(err))            }        });    };    checkIsSupportedOpenURL (supported) {        const { navigate } = this.navigation;        if (supported) {             Linking.openURL(this.rechargeInfo.scheme).then(() => {                 navigate('RechargeResult', {...this.rechargeInfo});            }).catch(err => Promise.reject(err));        } else {            showToast(`已保存截图, 请下载安装${this.rechargeInfo.shortName}扫码支付!`, {                duration: 800,                onHide: () => navigate('RechargeResult', {...this.rechargeInfo})            });        }    }    takeSnapshot () {        takeSnapshot(this.webview, { format: 'png', quality: 1 })            .then(uri => CameraRoll.saveToCameraRoll(uri))            .then(() => Linking.canOpenURL(this.rechargeInfo.scheme))            .then(supported => this.checkIsSupportedOpenURL(supported))            .catch((err) => showToast(err.message || '保存出错'), {duration: 800})    };    saveQrCode (rechargeInfo) {        this.fetchImageBlob(rechargeInfo)            .then(res => CameraRoll.saveToCameraRoll(rechargeInfo.codeImageUrl))            .then(() => showToast('保存成功'))            .then(() => this.rechargeInfo.scheme && Linking.canOpenURL(this.rechargeInfo.scheme))            .then(supported => this.checkIsSupportedOpenURL(supported))            .catch(err => showToast('保存图片出错，您还可以截图保存二维码', {duration: 800}))    };    saveImageAndLinking () {        if (this.rechargeInfo.rechargeUrl) {            this.takeSnapshot()        } else if (this.rechargeInfo.codeImageUrl) {            this.saveQrCode(this.rechargeInfo)        }    };    screenShot() {        isAndroid ? this.requestPermission() : this.saveImageAndLinking();    };    enterRechargeResult () {        const { navigate } = this.props.navigation;        navigate('RechargeResult', {...this.rechargeInfo});    };    render () {        const {isConnecting } = this.state;        return (            <View style={{flex: 1}}>                <Header headerTitle = '扫码充值' navigation = {this.navigation}                        headerRight = {this.headerRight} />                <ScrollView style={styles.container}>                    {this.rechargeInfo.rechargeUrl ? (                        <WebView style={{width: width, height: height/2 + 50 }}                                 ref={(ref) => { this.webview = ref; }}                                 decelerationRate="normal"                                 source={{uri: this.rechargeInfo.rechargeUrl }}                                 scrollEnabled={true}                                 startInLoadingState={true}                                 domStorageEnabled={true}                                 javaScriptEnabled={true}                        />                    ) : (                        <View style={styles.padding10}>                            <Text style={styles.info}>{this.rechargeInfo.name}信息：</Text>                            <Text style={styles.info}>订单号：{this.rechargeInfo.orderNo}</Text>                            <Text style={styles.info}>充值金额：{this.rechargeInfo.amount}</Text>                            <View style={styles.codeImage}>                                <Image style={styles.imageCode} source={{uri: this.rechargeInfo.codeImageUrl}} />                            </View>                        </View>                    )}                    < View style={styles.btnBar}>                        { !isAndroid && (                            <TouchableOpacity style={styles.btn} onPress={this.screenShot}>                                <Text style={styles.btnTitle}>立即充值</Text>                            </TouchableOpacity>                        )}                        <TouchableOpacity  style={styles.btn} onPress={this.enterRechargeResult}>                            <Text style={styles.btnTitle}>我已经支付</Text>                        </TouchableOpacity>                    </View>                    <View style={styles.padding10}>                        <Text style={styles.info}>扫码步骤：</Text>                        <Text style={styles.info}>                            1.{(this.rechargeInfo.codeImageUrl || !isAndroid ) ? `点“立即充值”将自动为您` : ''}                            截屏并保存到相册，同时打开{this.rechargeInfo.shortName}。                        </Text>                        <Text style={styles.info}>2.请在微信中打开“扫一扫”。</Text>                        <Text style={styles.info}>3.在扫一扫中点击右上角，选择“从相册选取二维码”选取截屏点图片。</Text>                        <Text style={styles.info}>4.输入您欲充值点金额并进行转账。如充值未及时到账请联系在线客服</Text>                    </View>                    <Spinner visible={isConnecting}                             color="#333"                             overlayColor="transparent"                             textContent={"正在加载"}                             textStyle={{color: '#333', fontSize: 16}} />                </ScrollView>            </View>        )    };}const styles = StyleSheet.create({    container: {        flex: 1,    },    padding10: {        padding: 10,    },    info: {        fontSize: 14,        marginBottom: 5,    },    codeImage: {        flexDirection: 'row',        justifyContent: 'center',        alignItems: 'center',        marginTop: 20,    },    imageCode: {        width: 180,        height: 180,        backgroundColor: '#FFF'    },    btnBar: {        flexDirection: 'row',        justifyContent: 'center',        alignItems: 'center',        marginVertical: 10,    },    btn: {        backgroundColor: '#FF0033',        paddingVertical: 3,        borderRadius: 5,        marginHorizontal: 15,    },    btnTitle: {        fontSize: 16,        paddingVertical: 8,        paddingHorizontal: 20,        color: '#FFF'    }});
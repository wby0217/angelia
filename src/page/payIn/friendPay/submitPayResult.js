import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
    Linking,
    Platform,
    Button,
} from 'react-native';
import DatePicker from 'react-native-datepicker';

import Spinner from 'react-native-spinner';
import AppButton from '../../../component/appButton';
import { submitFriendPay } from '../../../service'
import errorHandle from '../../../service/errorHandle'
import {showToast} from "../../../utils/index";

export default class SubmitPayResult extends Component {
    constructor(props) {
        super(props);
        this.rechargeInfo = props.params.rechargeInfo;
        this.payAccount = props.params.payAccount;
        this.state = {
            isConnecting: false,
            isCanSubmit: false,
            userName: '',
            amount: this.rechargeInfo.amount.toString(),
            date: '',
            account: '',

        };
        this.onButtonPress = this.onButtonPress.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.getDate = this.getDate.bind(this);
        this.navigation = props.navigation;
    }
    getDate(date) {
        this.setState({
            date: date
        }, () => this.setButtonStatus());

    }
    toggleSpinner (status) {
        this.setState({
            isConnecting: status !== undefined ? status : !this.state.isConnecting
        });
    };
    onButtonPress() {
        const data = {
            amount: this.state.amount,
            rechargeDate: this.state.date,
            remark: this.state.account,
            rechargeAccountId: this.payAccount.payAccountId,
        };
        this.toggleSpinner(true);
        submitFriendPay(data).then(res => {
            this.toggleSpinner(false);
            showToast(res.message, {onHide: () => {
                this.navigation.navigate('PayIn');
            }})
        }).catch(err => {
            this.toggleSpinner(false);
            errorHandle(err);
        })
    }
    setButtonStatus () {
        this.setState({
            isCanSubmit: ( !!this.state.amount && !!this.state.date && !!this.state.account)
        })
    };
    render () {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.wrap}>
                    <Text style={styles.label}>充值金额：</Text>
                    <TextInput
                        style={styles.form}
                        placeholder = '请输入充值金额'
                        value = {this.state.amount}
                        autoCapitalize={"none"}
                        keyboardType={"numeric"}
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => {
                            this.setState({amount:text}, () => this.setButtonStatus());
                        }}
                    />
                </View>
                <View style={styles.wrap}>
                    <Text style={styles.label}>存入时间：</Text>
                    <DatePicker
                        style={styles.form}
                        mode="datetime"
                        format="YYYY-MM-DD HH:mm"
                        customStyles={{
                            dateIcon: { display: 'none' },
                            dateInput: { borderWidth: 0,height:30,position: 'absolute',top:-4,left:0}
                            }}
                        onDateChange={this.getDate}
                        placeholder="请输入存入时间"
                        date= {this.state.date}
                    />
                </View>
                <View style={styles.wrap}>
                    <Text style={styles.label}>{this.rechargeInfo.shortName}账号：</Text>
                    <TextInput
                        style={styles.form}
                        placeholder="请输入您的账号"
                        autoCapitalize={"none"}
                        value = {this.state.account}
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => {
                            this.setState({account:text}, () => this.setButtonStatus())
                        }}
                    />
                </View>
                <View style={styles.btnWrap}>
                    <AppButton
                        style={styles.button}
                        isDisabled={!this.state.isCanSubmit}
                        onPressHandle={()=>{
                            this.state.isCanSubmit && this.onButtonPress();
                        }}
                        title="立即提单"
                    />
                </View>
                <Spinner visible={this.state.isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textStyle={{color: '#333', fontSize: 16}} />
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingTop:30,
    },
    wrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
    },
    btnWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginLeft: 20,
        marginRight: 20,
    },
    label:{
        flex: 2,
    },
    form: {
        flex: 5,
        height: 34,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 3,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        overflow: 'hidden'
    },
    button:{
        flex: 1,
    }
});
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
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showToast } from '../../../utils';
import { rechargeTransfer } from '../../../service';
import Spinner from 'react-native-spinner';
import Header from '../../../component/header';

const { width } = Dimensions.get('window');
export default class BankAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isConnecting: false,
            disabledBtn: false
        };
        this.navigation = props.navigation;
        console.log('check info =====', props.navigation.state.params);
    }
    componentWillUnmount () {
        clearTimeout(this.timer);
    }
    submitInfo = () => {
        this.setState({
            isConnecting: true
        })
        const { navigate, state } = this.props.navigation;
        const { amount, saveBank, saveDate, saveType, selectBank, userName } = state.params;
        const params = {
            amount,
            userName,
            rechargeAccountId: selectBank.id,
            rechargeType: saveType.id,
            rechargeDate: saveDate,
            rechargeBankId: saveBank.id
        };
        rechargeTransfer(params)
        .then(ret => {
            this.setState({
                isConnecting: false
            });
            showToast('信息提交成功!',{
                onHidden: () => {
                    navigate('PayIn');
                }
            })
        })
        .catch(err => {
            showToast(err);
            this.setState({
                isConnecting: false
            })
        })
    }
    render() {
        const { navigate, state } = this.props.navigation;
        const { amount, saveBank, saveDate, saveType, selectBank, userName } = state.params;
        const { isConnecting, disabledBtn } = this.state;
        return (
            <View style={styles.container}>
                <Header headerTitle = '平台收款'
                        backgroundColor= '#FF0033'
                        navigation = {this.navigation}/>
                <ScrollView>
                <View style={styles.headerTitle}>
                    <Text style={{ color: '#17A84B' }}>1 选择存款账户</Text>
                    <Icon name="angle-right" color="#CFCFCF" size={24} />
                    <Text style={{ color: '#17A84B' }}>2 填写信息</Text>
                    <Icon name="angle-right" color="#CFCFCF" size={24} />
                    <Text style={{ color: '#17A84B' }}>3 核对信息</Text>
                </View>
                    <View style={ styles.infoListItem }>
                        <View style={styles.itemRow}>
                            <Text>存款人姓名</Text>
                            <Text>{userName}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text>存款金额</Text>
                            <Text>{parseFloat(amount)}元</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text>存入银行</Text>
                            <Text>{selectBank.name}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text>存款方式</Text>
                            <Text>{saveType.name}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text>存款时间</Text>
                            <Text>{saveDate}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text>您使用的银行</Text>
                            <Text>{saveBank.name}</Text>
                        </View>
                    </View>
                    <View style={styles.nextStep}>
                        <TouchableOpacity
                            style={[styles.nextStepInner]}
                            onPress={() => {
                                this.submitInfo()
                            }}
                            disabled={disabledBtn}
                            onPressIn={() => {
                                this.setState({
                                    disabledBtn: true
                                }, () => {
                                    this.timer = setTimeout(() => this.setState({
                                        disabledBtn: false
                                    }), 3000);
                                });
                            }}
                        >
                            <Text style={styles.nextStepTxt}>确认</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Spinner visible={isConnecting}
                    color="#333"
                    overlayColor="transparent"
                    textContent={"正在加载"}
                    textStyle={{color: '#333', fontSize: 16}} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F9',
        flex: 1
    },
    headerTitle: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    infoListItem: {
        backgroundColor: '#fff',
        marginTop: 10,

    },
    nextStep: {
        marginTop: 50,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextStepInner: {
        flex: 1,
        width: width / 1.08,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF0033',
        borderRadius: 5,
    },
    nextStepTxt: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        alignItems: 'center',
        height: 50,
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: StyleSheet.hairlineWidth
    }
})


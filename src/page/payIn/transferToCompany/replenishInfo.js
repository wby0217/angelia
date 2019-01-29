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
import DatePicker from 'react-native-datepicker';
import Spinner from 'react-native-spinner';
import { getDepositBankList } from '../../../service';
import AppPicker from '../../../component/filter-box/appPicker';
import memberService from '../../../service/memberService';
import AppDatePicker from '../../../component/filter-box/appDatePicker';
import { showToast, filterBankById } from '../../../utils';
import moment from 'moment';
import _ from 'lodash';
import Header from '../../../component/header';

const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
export default class BankAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            bankCardList: [],
            selectedId: '',
            isConnecting: true,
            isOpenAppPicker: false,
            isOpenTypePicker: false,
            bankList: [],
            typeList: [],
            saveType: {},
            saveBank: {},
            saveDate: '',
            userName: '',
            amount: '',
            verify: false
        }
        this.getDate = this.getDate.bind(this);
        this.navigation = props.navigation;
    }
    componentDidMount() {
        const payInMount = this.props.navigation.state.params.payInMount;
        getDepositBankList()
        .then((ret) => {
            this.setState({
                bankCardList: ret.list,
                isConnecting: false,
                selectedId: ret.list[0].id
            });
        })
        .catch((err) => {
            this.setState({
                isConnecting: false
            });
        })
        memberService.restoreBankListFromStorage().then(res => {
            this.setState({
                bankList: res.list,
                amount: payInMount
            })
        }).catch(err => {
            console.log(err);
        })
        storage.load({
            key: 'getRechargeType'
        })
        .then(ret => {
            this.setState({
                typeList: ret
            })
        })
        .catch(err => {
            console.log(err)
        })
    }
    closeAppPicker (id) {
      const { bankList } = this.state;
        if(typeof id !== 'undefined') {
            const bankName = bankList[id].name;
            this.setState({
                isOpenAppPicker: false,
                saveBank: {
                    id: bankList[id].id,
                    name: bankName
                }
            }, () => {
                this.verifyForm();
            });
        }else {
            this.setState({
                isOpenAppPicker: false
            })
        }
    }
    closeTypePicker (id) {
       const { typeList } = this.state;
       if(typeof id !== 'undefined') {
           const typeName = typeList[id].typeName
           this.setState({
               isOpenTypePicker: false,
               saveType: {
                   id: typeList[id].typeId,
                   name: typeName
               }
           }, () => {
               this.verifyForm();
           })
       }else {
           this.setState({
               isOpenTypePicker: false
           })
       }
    }
    getDate(date) {
        this.setState({
            saveDate: date
        }, () => {
            this.verifyForm();
        });
    }
    toCheckInfo = () => {
        const { navigate, state } = this.props.navigation;
        const {userName, amount, saveBank, saveType, saveDate, verify } = this.state;
        const { selectBank } = state.params;
        if(!verify) return;
        navigate('CheckInfo',{
            userName,
            amount,
            selectBank,
            saveType,
            saveDate,
            saveBank
        });
    }
    verifyForm = () => {
        const {userName, amount, saveBank, saveType, saveDate, verify } = this.state;
        if(userName && amount && !_.isEmpty(saveBank) && !_.isEmpty(saveType) && saveDate ){
            this.setState({
                verify: true
            })
        } else {
           verify && this.setState({
                verify: false
            })
        }
    }
    render() {
        const { bankCardList, isConnecting, selectedId, bankList, isOpenAppPicker, isOpenTypePicker, typeList, saveDate, saveBank, saveType, amount, verify } = this.state;
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
                    <Text>3 核对信息</Text>
                </View>
                    <View style={ styles.infoListItem }>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>姓名</Text>
                            </View>
                            <TextInput
                                underlineColorAndroid="transparent"
                                placeholderTextColor='#cccccc'
                                placeholder="存款人姓名"
                                onChangeText={ value => {
                                    this.setState({
                                        userName: value
                                    });
                                }}
                                onBlur={() => {
                                    this.verifyForm();
                                }}
                                style={[styles.inputItem,{ textAlign: 'right'}]}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>方式</Text>
                            </View>
                            <TouchableOpacity
                                style={{ flex: 7, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                                onPress={() => {
                                    this.setState({
                                        isOpenTypePicker: true
                                    })
                                }}
                            >
                                {!_.isEmpty(saveType) ?
                                    <Text style={{ marginRight: 10, color: '#333' }}>{saveType.name}</Text>
                                    :
                                    <Text style={{ marginRight: 10, color: '#CCCCCC' }}>选择存款方式</Text>
                                }
                                <Icon name="angle-right" color="#CFCFCF" size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>银行</Text>
                            </View>
                            <TouchableOpacity
                                style={{ flex: 7, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                                onPress={() => {
                                    this.setState({
                                        isOpenAppPicker: true
                                    })
                                }}
                            >
                                {!_.isEmpty(saveBank) ?
                                    <Text style={{ marginRight: 10, color: '#333' }}>{saveBank.name}</Text>
                                    :
                                    <Text style={{ marginRight: 10, color: '#CCCCCC' }}>请选择银行</Text>
                                }
                                <Icon name="angle-right" color="#CFCFCF" size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>金额</Text>
                            </View>
                            <View
                                style={{ flex: 7, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                            >
                                <Text>{parseFloat(amount)}元</Text>
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>存款时间</Text>
                            </View>
                            <View
                                style={{ flex: 7, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                            >
                                <DatePicker
                                    mode="datetime"
                                    format="YYYY-MM-DD HH:mm"
                                    customStyles={{dateIcon: { display: 'none' }, dateInput: { borderWidth: 0}}}
                                    onDateChange={this.getDate}
                                    placeholder="请选择存款日期"
                                    date= {this.state.saveDate}
                                />
                                <Icon name="angle-right" color="#CFCFCF" size={24} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.nextStep}>
                        <TouchableOpacity
                            style={[styles.nextStepInner, verify ? {backgroundColor: '#FF0033'} : null]}
                            onPress={() => {
                                this.toCheckInfo();
                            }}
                            activeOpacity={verify ? 0.5 : 1}
                        >
                            <Text style={[styles.nextStepTxt, verify ? {color: '#fff'}: null]}>下一步</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
                <Spinner visible={isConnecting}
                    color="#333"
                    overlayColor="transparent"
                    textContent={"正在加载"}
                    textStyle={{color: '#333', fontSize: 16}} />
                <AppPicker style={styles.picker}
                           isOpen={isOpenAppPicker}
                           list={bankList}
                           listItemLabel="name"
                           selectedId={bankList.length && bankList[0].id}
                           onCloseHandle={this.closeAppPicker.bind(this)}/>
                <AppPicker style={styles.picker}
                           isOpen={isOpenTypePicker}
                           list={typeList}
                           listItemLabel="typeName"
                           selectedId={bankList.length && bankList[0].typeId}
                           onCloseHandle={this.closeTypePicker.bind(this)}/>
            </View>
        )
    }
}
const filterTypeById = (typeList, id) => {
    let typeName = '';
     typeList.some((elem) => {
         if (elem.typeId === id) {
             typeName = elem.typeName;
             return true;
         }
    })
    return typeName;
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
        backgroundColor: '#DFDFE9',
        borderRadius: 5,
    },
    nextStepTxt: {
        color: '#9898A8',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputItem: {
        flex: 7,
        padding : 0,
        fontSize: 14,
    },
    inputRow: {
        flexDirection: 'row',
        height: 50,
        marginHorizontal: 10,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: StyleSheet.hairlineWidth 
    },
    picker: {
        position: 'absolute'
    }
})


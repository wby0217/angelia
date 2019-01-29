import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinner';
import { getDepositBankList } from '../../../service';
import { showToast } from '../../../utils';
import Header from '../../../component/header';

const { width } = Dimensions.get('window');
export default class BankAccount extends Component {
    defaultBankIcon = require('../../../assets/images/bankIcon.png');
    constructor(props) {
        super(props);
        this.state = {
            bankCardList: undefined,
            selectedBank: {},
            isConnecting: true,
            isAllowNext: false
        };
        this.navigation = props.navigation
    }
    componentDidMount() {
        getDepositBankList()
        .then((ret) => {
            this.setState({
                bankCardList: ret.list,
                isConnecting: false,
                selectedBank: ret.list[0],
                isAllowNext: !!ret.list
            });
        })
        .catch((err) => {
            this.setState({
                isConnecting: false,
                isAllowNext: false
            });
        })
    }
    onSelected = (selectedBank) => {
        this.setState({
            selectedBank
        });
    }
    render() {
        const { bankCardList, isConnecting, selectedBank, isAllowNext } = this.state;
        const { navigate, state } = this.props.navigation;
        const { payInMount } = state.params;
        return (
            <View style={styles.container}>
                <Header headerTitle = '平台收款'
                        backgroundColor= '#FF0033'
                        navigation = {this.navigation}/>
                <View style={styles.headerTitle}>
                    <Text style={{ color: '#17A84B' }}>1 选择存款账户</Text>
                    <Icon name="angle-right" color="#CFCFCF" size={24} />
                    <Text>2 填写信息</Text>
                    <Icon name="angle-right" color="#CFCFCF" size={24} />
                    <Text>3 核对信息</Text>
                </View>
                <ScrollView>
                {!!bankCardList && bankCardList.length ? bankCardList.map((item, index) => {
                    return (
                        <TouchableOpacity
                            style={styles.bankListItem}
                            key={index}
                            onPress={() => {
                                this.onSelected(item)
                            }}
                        >
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                {selectedBank.id === item.id ? <Icon name="check-circle" size={24}  color="#17A84B" />
                                :
                                <Icon name="circle" size={24} color="#DFDFE9" />
                                }
                            </View>
                            <View style={{ flexDirection: 'column', flex: 5, paddingHorizontal: 10 }}>
                                <View style={{ flexDirection: 'row', height: 36, alignItems: 'center' }}>
                                    <Image
                                        source={item.image? { uri: item.image }: this.defaultBankIcon}
                                        style={{ width: 25, height: 25, resizeMode: 'contain', marginRight: 10}}    
                                    />
                                    <Text>{item.name}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', height: 24, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text>{item.account.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 ")}</Text>
                                    <Text style={{ color: '#333' }}>{item.userName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }) : ( bankCardList !== undefined &&
                        <View style={styles.emptyTip}>
                            <Text>暂无收款账号，请重新选择充值渠道！</Text>
                        </View>)}
                <View style={styles.nextStep}>
                    <TouchableOpacity
                        style={[styles.nextStepInner,{ backgroundColor:  isAllowNext ?  '#FF0033' : '#DFDFE9' } ]}
                        onPress={() => {
                            if(!selectedBank) return;
                            navigate('ReplenishInfo', {selectBank: selectedBank, payInMount})
                        }}
                        activeOpacity={isAllowNext ? 0.5 : 1}
                    >
                        <Text style={[styles.nextStepTxt, isAllowNext ? {color: '#fff'} : null]}>下一步</Text>
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
    bankListItem: {
        backgroundColor: '#fff',
        marginTop: 10,
        flexDirection: 'row',
        height: 60
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

        borderRadius: 5,
    },
    nextStepTxt: {
        color: '#9898A8',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyTip: {
        flex: 1,
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
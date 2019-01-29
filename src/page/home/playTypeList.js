import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Immutable from 'immutable';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';
import Swiper from 'react-native-swiper';
import { showToast, Alert } from '../../utils';

const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
export default class PlayTypeList extends Component{
    constructor(props) {
        super(props)
        this.state = {
            data : [1,2,3,4,5,6,7,8,9,0,11,12,14,13,15,16,17,18,19,20],
            betMount: '',
            selectId: [],
            playTypeName: '',
            scopeArr: [],
            pIndex: 0,
            disabledBtn: false
        };
        this.toGenOrder = this.toGenOrder.bind(this);
        this.selectedRoom = props.selectedRoom;
        this.selectId = [];
        this.playTypeName = [];
        console.log('playTypeList====', props);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if( Immutable.is(this.state, nextState)){
            return false;
        }else{
            return true
        }
    }
    componentDidMount() {
        this.keyboardDidShowListener = Platform.OS === 'ios' ?
        Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this)) : Keyboard.addListener('keyboardDidShow', this.updateKeyboardSpace.bind(this))
        this.keyboardDidHideListener = Platform.OS === 'ios' ?
        Keyboard.addListener('keyboardWillHide', this.resetKeyboardSpace.bind(this)): Keyboard.addListener('keyboardDidHide', this.resetKeyboardSpace.bind(this));
    
        const { oddItem } = this.props;
        _.map(oddItem, (item, index)=> {
            this.playTypeName.push(item.playTypeName)
        });
        const scopeArr =[];
        for( let i=0; i < this.playTypeName.length; i++ ) {
            scopeArr.push({ minY: (i * 150 - 50), maxY: ((i+1) * 150 - 50), playTypeName: this.playTypeName[i] });
        }
        this.setState({
            playTypeName: this.playTypeName[0],
            scopeArr
        });
    }
    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        clearTimeout(this.timer);
    }
    updateKeyboardSpace(frames) {
        if(!frames.endCoordinates){
            return;
        }
        let keyboardSpace = frames.endCoordinates.height;
        isIos && this.props.changeAmountTextKeyboard(keyboardSpace)
    }
    resetKeyboardSpace(frames) {
        this.props.changeAmountTextKeyboard(0)
    }
    isActive = (playId) => {
        const { pIndex } = this.state;
        if(!this.selectId.length) {
            return false;
        }
        if(this.selectId[pIndex] === undefined) {
            this.selectId[pIndex] = [];
        }
        if(this.selectId[pIndex].indexOf(playId) > -1) {
            return true;
        } else {
            return false;
        }
    }
    changeSelectId = (playId) => {
        const { pIndex } = this.state;
        if(this.selectId.length && this.selectId[pIndex].indexOf(playId) > -1) {
            _.remove(this.selectId[pIndex], (n) => n == playId)
            this.setState({
                selectId: this.selectId[pIndex].join('-')
            })
        } else {
            if(this.selectId[pIndex] === undefined) {
                this.selectId[pIndex] = [];
            }
            this.selectId[pIndex].push(playId)
            this.setState({
                selectId: this.selectId[pIndex].join('-')
            })
        }
    }
    changePlayTypeName = (scrollY) => {
        const { scopeArr, playTypeName } = this.state;
        let result = [];
        if(scrollY < 0) {
            result.push({ item: scopeArr[0].playTypeName, index: 0 })
        } else {
            result = scopeArr.map((item, index) => {
                if(scrollY >= item.minY && scrollY < item.maxY) {
                    return {item: item.playTypeName, index};
                }
            });
        }
        const playTypeNames = _.filter(result, (n) => n !== undefined);
        if(playTypeNames[0] && playTypeName !== playTypeNames[0].item) {
            this.setState({
                playTypeName: playTypeNames[0].item,
                pIndex: playTypeNames[0].index
            })
        }
    }
    toGenOrder() {
        const { toGenBetOrder, userInfo, navigation } = this.props;
        const { betMount, playTypeName, pIndex } = this.state;
        const { maxBet, minBet } = this.selectedRoom;
        if(!this.selectId[pIndex] || !this.selectId[pIndex].length ) {
           return showToast('请选择玩法的赔率!');
        };
        if(!betMount) {
           return showToast('请输入下注金额!');
        };
        if(parseFloat(betMount) > userInfo.balance) {
            this._alert.alert('', '余额不足',[{
                text: '取消',
                onPress: () => {}
            }, {
                text: '去充值',
                onPress: () => {
                    navigation.navigate('PayIn');
                }
            }])
            return;
        }
       toGenBetOrder({ playIds: this.selectId[pIndex], betMount: parseFloat(betMount), playTypeName });

    }
    renderItem({ rates, index }) {
        return(
            <View
                key={index}
                style={{ height: 150, flexDirection: 'row',  flexWrap: 'wrap', paddingBottom: 30 }}
                onLayout={(event) => {
                }}
            >
                <ScrollView contentContainerStyle={{ flexDirection: 'row',  flexWrap: 'wrap' }}>
                    {rates && rates.length ? rates.map((item,i)=>
                    <TouchableWithoutFeedback
                            onPress={() => {
                                this.changeSelectId(item.playId);
                            }}
                            key={i}
                        >
                            <View style={[styles.item]}>
                                <View style={[styles.itemTextView, this.isActive(item.playId) ? styles.activeClass : null]}>
                                    <Text style={styles.itemText}>{item.downType}</Text>
                                    <Text style={[styles.itemText,{fontSize: 12}]}>{item.rate}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>)
                        :
                        null
                        }
                </ScrollView>
            </View>
        )
    }
    render() {
        const { rates, oddItem, navigation, lotteryId } = this.props;
        const { playTypeName, betMount, disabledBtn } = this.state;
        return (
            <KeyboardAvoidingView behavior="padding">
                <View style={{ alignItems: 'center'}}>
                    <Text style={styles.playTypeNameText}>{playTypeName}</Text>
                </View>
                <View style={{ height: 150, marginTop: 10, }}>
                    <ScrollView
                        scrollEventThrottle={16}
                        pagingEnabled={true}
                        onScroll={(event) => {
                             const scrollY = event.nativeEvent.contentOffset;
                             this.changePlayTypeName(scrollY.y)
                        }}
                        ref={ref => this.scrollview = ref}
                        style={{ flex: 1 }}
                    >
                        <View style={styles.container}>
                        {oddItem.length ? oddItem.map((item, index) => {
                            return this.renderItem({ rates: item.rates, index })
                        }): null}
                        </View>
                    </ScrollView>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around', width: width * 0.9, marginTop: 10 }}>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{ borderColor: '#fff', borderWidth: 1, padding: 5, borderRadius: 3 }}
                                        onPress={() => {
                                            navigation.navigate('MsgDetails', { title: '游戏玩法', LotteryId: lotteryId, type: 'rule' });
                                        }}
                                    >
                                        <Text style={{ color: '#fff' }}>赔率说明</Text>
                                    </TouchableOpacity>
                                    {/*<TouchableOpacity*/}
                                        {/*activeOpacity={1}*/}
                                        {/*style={styles.betBtn}*/}
                                        {/*onPress={() => {*/}
                                            {/*this.setState({*/}
                                                {/*betMount: this.selectedRoom.minBet*/}
                                            {/*})*/}
                                        {/*}}*/}
                                    {/*>*/}
                                        {/*<Text style={{ color: '#fff' }}>最小投注</Text>*/}
                                    {/*</TouchableOpacity>*/}
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={styles.betBtn}
                                        onPress={() => {
                                            if(!betMount) return;
                                            this.setState({
                                                betMount: (parseFloat(betMount) * 2).toString()
                                            })
                                        }}
                                    >
                                        <Text style={{ color: '#fff' }}>双倍投注</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: width * 0.9, marginTop: 25 }}>
                                    <Text style={{ color: '#fff'}} >投注金额</Text>
                                    <Icon name="jpy" color="#fff" />
                                    <TextInput
                                        maxLength={10}
                                        keyboardType="numeric"
                                        underlineColorAndroid="transparent"
                                        style={{ backgroundColor: '#fff', width: (width*0.9-180), height: 28,  fontSize: 12, textAlignVertical: 'center', paddingLeft: 3, paddingVertical: 0 }}
                                        onChangeText={(text) => this.setState({
                                            betMount: text
                                        })}
                                        value={`${betMount}`}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{ backgroundColor: '#41CC44', padding: 5, borderRadius: 5, marginRight: 5 }}
                                        onPress={this.toGenOrder}
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
                                        <Text style={{ color: '#fff' }}>立即投注</Text>
                                    </TouchableOpacity>
                                </View>
                    <View style={{ height: 60 }} />
                    <Alert ref={ ref => this._alert = ref } />
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10
    },
    item: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
        width: width * 0.9 / 5 - 8,
        marginTop: 5
    },
    itemTextView: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2
    },
    activeClass: {
        borderColor: '#fff',
        borderWidth: 1,
        shadowColor:'#fff',
        shadowOffset:{height:0.5,width:0.5},
        shadowOpacity:0.8,
    },
    itemText: {
        color: '#fff',
        marginTop: 5
    },
    betBtn: {
        backgroundColor:'#18A2F5',
        borderColor: '#18A2F5',
        borderWidth: 1,
        padding: 5,
        borderRadius: 3
    },
    playTypeNameText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10
    } 
});
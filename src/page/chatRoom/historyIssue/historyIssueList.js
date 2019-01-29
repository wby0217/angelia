import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    TextInput,
    Button,
    Dimensions
} from 'react-native';
import { StyleConfig } from '../../../assets/style';
import Icon from 'react-native-vector-icons/FontAwesome';
import lhcConfig from '../../../config/lhcConfig'
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../../store';

const { width, height } = Dimensions.get('window');

@observer
export default class HistoryIssueList extends Component {
    constructor (props){
        super(props);
        this.renderLoadMoreBtn = this.renderLoadMoreBtn.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
    }
    renderLoadMoreBtn () {
        const { onPressLoadMore } = this.props;
        return (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => !!onPressLoadMore && onPressLoadMore()}>
                <Text style={[styles.loadMoreText, styles.font12]}>查看历史开奖</Text>
                <Icon name="angle-right" color="#81777A" style={styles.loadMoreText} size={16}/>
            </TouchableOpacity>
        )
    }
    onCloseModal () {
        const { onClose } = this.props;
        onClose && onClose();
    }
    renderIssuePrizeNum (prize) {
        const { categoryId } = this.props;
        const len = prize.prizeNum.length;
        switch (categoryId) {
            case 1:
            case 3:
            case 5:
            case 4:
                return (
                    <View style={styles.issueResult}>
                        {prize.prizeNum.map((item, index) => {
                            return(
                                <View key={index}  style={{flexDirection:'row'}}>
                                    <Text style={styles.resultTxt} key={index}>{item}</Text>
                                    <Text style={styles.graySym}>
                                        {index < len - 2 ? ' + ' : index === len-2 && ' = '}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                );
            case 2:
                return (
                    <View style={styles.issueResult}>
                        {prize.prizeNum.map((item, index) => {
                            return (
                                <Text style={[styles.resultTxt, index===len-1 && {color: '#0076FF'}]}
                                      key={index}>
                                    {item}
                                </Text>
                            )
                        })}
                    </View>
                );
            case 6:
                return (
                    <View style={styles.issueResult}>
                        {prize.prizeNum.map((item, index )=> {
                            if ( index > 6) return null;
                            const itemStr = item.toString().length < 2 ? `0${item.toString()}` : item.toString()
                            return (
                                <View style={{flexDirection: 'row'}} key={index}>
                                    {index === 6 && <Text style={styles.lhcSym}>+</Text>}
                                    <View style={styles.lhcWrp}>
                                        <Text style={[styles.lhcNum, styles[lhcConfig.number[itemStr]]]}>
                                            {itemStr}
                                        </Text>
                                        <Text style={styles.lhcZoc}>{prize.prizeZodiac[index]}</Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                );
            default:
                return (
                    <View style={styles.issueResult}>
                        {prize.prizeNum.map((item, index) => {
                            return <Text style={styles.resultTxt} key={index}>{item}</Text>
                        })}
                    </View>
                )
        }

    }
    render () {
        const { showHistoryIssue, location } = this.props;
        const issueList = betStore.issueList;
        const marginTop = (!!location && location.pageY ) || 0;
        if (issueList === 0 ) return ;
        return (
            <Modal onShow={() => {}}
                   animationType={'fade'}
                   visible={showHistoryIssue}
                   onRequestClose={() => this.onCloseModal()}
                   transparent={true}>
                <View style={[styles.container, {marginTop}]}>
                    { !!issueList && issueList.map((item, index) => {
                        if (index === 0) return;
                        return (
                            <View style={[styles.issueItem, index%2 === 0 && {backgroundColor: '#FFF'}]}
                                  key={index}>
                                <Text style={styles.fontColor}>
                                    {`第 ${item.issueNo} 期`}
                                </Text>
                                {this.renderIssuePrizeNum(item)}
                            </View>
                        )
                    })}
                    {this.renderLoadMoreBtn()}
                    <TouchableOpacity style={{flex: 1}} onPress={this.onCloseModal} />
                </View>
                <TouchableOpacity style={[styles.absolute]} onPress={this.onCloseModal} />
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 0,
        backgroundColor: 'transparent'
    },
    fontColor: {
        color: '#606060'
    },
    issueItem: {
        flexDirection: 'row',
        height: 38,
        backgroundColor: '#F6F6F6',
        paddingHorizontal: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E9E8E8'
    },
    issueResult: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal:10,
    },
    resultTxt: {
        color: '#575757',
        marginHorizontal: 5,

    },
    loadMoreBtn: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems:'center'
    },
    loadMoreText: {
        color: '#81777A',
        backgroundColor: 'transparent',
        marginHorizontal: StyleConfig.space1
    },
    graySym: {
        color: '#B0B9C9'
    },
    red: {
        color: '#EF2525',
    },
    green: {
        color: '#38BE4F'
    },
    blue: {
        color: '#0E86E3'
    },
    lhcWrp: {
        flexDirection: 'column',
        marginHorizontal: 5
    },
    lhcNum: {
        lineHeight: 18,
        color: '#FFF',
        fontSize: 14,
        width: 18,
        textAlign: 'center'
    },
    lhcZoc: {
        fontSize: 10,
        color: '#9AA5BC',
        alignSelf: 'center',
        lineHeight: 10,
    },
    lhcSym: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#B0B9C9',
        lineHeight: 22,
    }
});
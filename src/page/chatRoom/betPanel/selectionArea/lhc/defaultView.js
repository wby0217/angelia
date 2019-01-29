import React, { Component } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ImageBackground
} from 'react-native';
import lhcConfig from '../../../../../config/lhcConfig';
import { selectionStyles, selectionBallArea } from '../../../../../assets/style';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showToast, arrayCombine } from "../../../../../utils/index";

const { width } = Dimensions.get('window');
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../../../../store';

@observer
export default class DefaultView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMenuIndex: 0,
        };
        const playInfo = props.playInfo;
        this.renderBallArea = this.renderBallArea.bind(this);
        this.renderBallItem = this.renderBallItem.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.selectLianXiaoLianWeiBall = this.selectLianXiaoLianWeiBall.bind(this);
        this.selectedGroupIndex = [];
        this.tabMenu = props.playInfo.label;
        this.subMenu = props.playInfo.menu && props.playInfo.menu[0].label;
        
    }

    getSelectionStyle (rateItem, rateArr) {
        const len = rateArr.length;
        if (!!rateItem.content) {
            return 'larger'
        } else {
            return len > 3 ? 'middle' : 'larger'
        }
    }
    getDisplayTextColor (display) {
        if (/红/.test(display)) {
            return {color: '#EC0909'};
        } else if (/绿/.test(display)) {
            return {color: '#00AD15'};
        } else if (/蓝/.test(display)) {
            return {color: '#0A74B9'};
        } else {
            return {color: '#333'};
        }
    }
    selectLianXiaoLianWeiBall (rateItem) {
        const { selectedMenuIndex } = this.state;
        const { minLimit, maxLimit } = this.props.playInfo.menu[selectedMenuIndex].playType[0];

        if (!!maxLimit && betStore.selectedBall.length === maxLimit) {
            return showToast(`最多只能选择 ${maxLimit}`)
        }
        betStore.selectBall(rateItem, minLimit);
    }
    renderBallItem (rateItem, rateIndex, rateArr, playTypeName) {
        const type = typeof rateItem.display;
        const isString = type === 'string';
        const size = isString && this.getSelectionStyle(rateItem, rateArr);
        const isInclude = betStore.isInclude(rateItem);
        const meta = this.props.playInfo.meta;
        return (
            <TouchableOpacity
                key={rateIndex}
                style={[
                    selectionBallArea.center,
                    selectionBallArea[type].wrap,
                    !isString && selectionBallArea[type].smallWrap,
                    isString && selectionBallArea.string[size],
                    isString && size === 'middle' && (rateIndex+1) % 4 === 0 && {marginRight:0},
                    isString && size === 'larger' && (rateIndex+1) % 3 === 0 && {marginRight:0},
                    isString && isInclude && selectionBallArea.selectedBg
                ]}
                onPress={() => {
                    rateItem.tabMenu = this.tabMenu;
                    rateItem.subMenu = this.subMenu;
                    rateItem.groupName = playTypeName;
                    if (meta === 'zhengMaGg') {
                        betStore.selectZhengMaGgBall(rateItem)
                    } else if (meta === 'lianXiaoLianWei') {
                        this.selectLianXiaoLianWeiBall(rateItem)
                    } else {
                        betStore.selectBall(rateItem);
                    }
                }}
            >
                { isString ? (
                    <Text style={[
                        selectionBallArea.string.display,
                        this.getDisplayTextColor(rateItem.display),
                        isInclude && {color: '#FFF'}
                    ]}>
                        {rateItem.display}
                    </Text>
                ) : (
                    <View style={[
                        selectionBallArea.number.display,
                        isInclude && selectionBallArea.selectedBg
                    ]}>
                        <Text style={[
                            selectionBallArea.number.displayText,
                            isInclude && {color: '#FFF'},
                        ]}>
                            {rateItem.display}
                        </Text>
                    </View>
                )}
                <Text style={[
                    selectionBallArea.ratio,
                    isString && isInclude && {color: '#FFF'}]}>
                    {rateItem.rate}
                </Text>
                {!!rateItem.content && (
                    <Text style={{color: isInclude ? '#FFF': '#999', fontSize: 12}}>
                        { rateItem.content.join(' ') }
                    </Text>
                )}
            </TouchableOpacity>
        )
    }
    renderBallArea (playType) {
        const len = playType.length ;
        return playType.map((item, index) => {
            const { playTypeName, rates } = item;
            return (
                <View style={[selectionBallArea.container]} key={index}>
                    { !!playTypeName && len > 1 && (
                        <ImageBackground
                            resizeMode="stretch"
                            style={selectionBallArea.titleBg}
                            source={require('../../../../../assets/images/headingBg.png')}>
                            <Text style={selectionBallArea.leftText}>{playTypeName}</Text>
                        </ImageBackground>
                    )}
                    <View style={[selectionBallArea.selectionBox]}>
                        { rates.map((rateItem, rateIndex, rateArr) => {
                            return this.renderBallItem(rateItem, rateIndex, rateArr, playTypeName)
                        })}
                    </View>
                </View>
            )
        })
    }
    renderMenu (menu) {
        const { selectedMenuIndex } = this.state;
        return (
            <View style={selectionStyles.menuBar}>
                { menu.map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                selectionStyles.menuItem,
                                (index+1)%4 === 0 && {marginRight: 0},
                                selectedMenuIndex === index && {borderColor: '#EC0909'}
                            ]}
                            onPress={()=>{
                                this.setState({
                                    selectedMenuIndex: index,
                                });
                                this.subMenu = item.label;
                                betStore.cleanSelectedBall()
                            }}>
                            <Text style={ selectedMenuIndex === index && {color: '#EC0909'}}>
                                {item.label}
                            </Text>
                            { selectedMenuIndex === index && (
                                <Image
                                    style={selectionStyles.selectedIcon}
                                    source={require('../../../../../assets/images/bet_selected_bg.png')}/>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }
    render () {
        const { playType, menu, meta } = this.props.playInfo;
        const { selectedMenuIndex } = this.state;
        const selection = !!menu ? menu[selectedMenuIndex].playType : playType;
        const limit = !!menu && selection[0].minLimit;
        return (
            <ScrollView style={selectionStyles.wrap}>
                { !!menu && this.renderMenu(menu) }
                <View style={styles.tipsWrp}>
                    { limit && (
                        <Text style={[styles.tips, styles.limitTip]}>
                            <Icon name="bell-o" color="#999" size={12}/>
                            {` 至少选中 ${limit} 个号码`}
                        </Text>
                    )}
                    { meta === 'zhengMaGg' && (
                        <Text style={[styles.tips, styles.limitTip]}>
                            <Icon name="bell-o" color="#999" size={12}/>
                            {` 必须两组玩法以上`}
                        </Text>
                    )}
                    { betStore.computedRate !== undefined &&
                        <Text style={[styles.tips, styles.rateTip]}>当前赔率: {betStore.computedRate}</Text>
                    }

                </View>
                { this.renderBallArea(selection) }
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    tipsWrp: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    tips: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    rateTip: {
        flex: 1,
        color: '#FF0000',
        fontSize: 14
    },
    limitTip: {
        flex: 2,
        color: '#999',
        fontSize: 12,
    }
});
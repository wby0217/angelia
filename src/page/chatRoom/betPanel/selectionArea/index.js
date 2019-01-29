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
import { selectionStyles, selectionBallArea } from '../../../../assets/style';
import { observer, inject } from 'mobx-react/native';
import { betStore } from '../../../../store';

const { width } = Dimensions.get('window');
@inject('betStore')
@observer
export default class SelectionArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMenuIndex: 0,
            selectedBall: [],
        };
        this.renderBallArea = this.renderBallArea.bind(this);
        this.renderBallItem = this.renderBallItem.bind(this);
        this.tabMenu = props.playInfo.label;
        this.subMenu = props.playInfo.menu && props.playInfo.menu[0].label;
    }

    getSelectionStyle (len) {
        switch (len) {
            case 1:
            case 2:
            case 3:
                return 'larger';
            case 5:
                return 'small';
            default:
            case 4:
                return 'middle';
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
    renderBallItem (rateItem, rateIndex, rateArr, playTypeName) {
        const size = this.getSelectionStyle(rateArr.length);
        const type = typeof rateItem.display;
        const isString = type === 'string';
        const isInclude = betStore.isInclude(rateItem);
        return (
            <TouchableOpacity
                key={rateIndex}
                style={[
                    selectionBallArea.center,
                    selectionBallArea[type].wrap,
                    !isString && rateItem.display.toString().length >= 3 ? selectionBallArea[type].largerWrap : selectionBallArea[type].smallWrap,
                    isString && selectionBallArea.string[size],
                    isString && size === 'small' && (rateIndex+1) % 5 === 0 && {marginRight:0},
                    isString && size === 'middle' && (rateIndex+1) % 4 === 0 && {marginRight:0},
                    isString && size === 'larger' && (rateIndex+1) % 3 === 0 && {marginRight:0},
                    isString && isInclude && selectionBallArea.selectedBg
                ]}
                onPress={() => {
                    rateItem.tabMenu = this.tabMenu;
                    rateItem.subMenu = this.subMenu;
                    rateItem.groupName = playTypeName;
                    betStore.selectBall(rateItem)
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
                        rateItem.display.toString().length >= 3 && selectionBallArea.number.larger,
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
            </TouchableOpacity>
        )
    }
    renderBallArea (playType) {
        const len = playType.length ;
        return playType.map((item, index) => {
            const { playTypeName, rates } = item;
            return (
                <View style={[selectionBallArea.container]} key={index}>
                    { !!playTypeName && len >1 && (
                        <ImageBackground
                            resizeMode="stretch"
                            style={selectionBallArea.titleBg}
                            source={require('../../../../assets/images/headingBg.png')}>
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
    render () {
        const { playType, menu } = this.props.playInfo;
        const { selectedMenuIndex } = this.state;
        const selection = !!menu ? menu[selectedMenuIndex].playType : playType;

        return (
            <ScrollView style={selectionStyles.wrap}>
                { !!menu &&  (
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
                                            selectedMenuIndex: index
                                        });
                                        betStore.cleanSelectedBall();
                                        this.subMenu = item.label;

                                    }}>
                                    <Text style={ selectedMenuIndex === index && {color: '#EC0909'}}>
                                        {item.label}
                                    </Text>
                                    { selectedMenuIndex === index && (
                                        <Image
                                            style={selectionStyles.selectedIcon}
                                            source={require('../../../../assets/images/bet_selected_bg.png')}/>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}
                { this.renderBallArea(selection) }
            </ScrollView>
        )
    }
}

import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
export default class LoadMoreFooter extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { itemLength, isLoadAll } =this.props;
        return (
            <View style={styles.footer}>
                {this.props.isLoadAll ? null :  <ActivityIndicator size="small" color='#666' />}
                <Text style={[styles.footerTitle,!isLoadAll && {marginLeft: 10,}]}>
                    {!isLoadAll ? '正在加载……' : (
                        itemLength === 0 ? '暂无数据' : '已加载全部'
                    )}
                </Text>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    footerTitle: {
        fontSize: 15,
        color: '#666'
    }
});

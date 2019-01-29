import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Dimensions,
    Button,
    PickerIOS,
    Platform,
    DatePickerIOS,
    TouchableOpacity,
} from 'react-native';

import PickerAndroid from './pickerAndroid';
import AppButton from '../appButton';
const { width, height } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
const Picker = isIos ? PickerIOS : PickerAndroid;

export default class AppPicker extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedId: this.props.selectedId || 0
        };
        this.onValueChange = this.onValueChange.bind(this);
        this.closePicker = this.closePicker.bind(this);
        this.closeLotteryPicker = this.closeLotteryPicker.bind(this);
    };
    onValueChange (value) {
        this.setState({
            selectedId: value
        })
    };
    closeLotteryPicker () {
        this.props.onCloseHandle && this.props.onCloseHandle(this.state.selectedId);
    };
    closePicker () {
        this.props.onCloseHandle && this.props.onCloseHandle();
    };
    render () {
        const {selectedId } = this.state;
        const {list, label, listItemLabel, listItemValue} = this.props;
        if ( !this.props.isOpen ) return <View />;
        return (
            <View style={[styles.wrapper, this.props.style]}>
                <View style={styles.pickerTopBox}>
                    <TouchableOpacity style={styles.leftBtn} onPress={this.closePicker}>
                        <Text style={{color: '#666',fontSize:16}}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rightBtn} onPress={this.closeLotteryPicker}>
                        <Text style={{color: '#46cf98',fontSize:16}}>确定</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.pickerBox}>
                    <Picker style={styles.lotteryPicker}
                            selectedValue={selectedId} onValueChange={this.onValueChange}>
                        {list && list.map((item, index) => {
                           return <Picker.Item label={ item[listItemLabel]}
                                               value={listItemValue ? item[listItemValue] : index}
                                               key={index} />
                        })}
                    </Picker>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        width: width,
        height: height,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    pickerBox: {
        width: width,
        height: 280,
        backgroundColor:'#FFF',
        padding: 5,
    },
    rightBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        width: 80,
        height: 40,
    },
    leftBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        width: 80,
        height: 40,
    },
    pickerTopBox: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 40,
        padding: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    }
})
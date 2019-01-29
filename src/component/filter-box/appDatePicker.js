import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Dimensions,
    Platform,
    Button,
    Picker,
    DatePickerIOS,
    DatePickerAndroid,
    Animated,
    DeviceEventEmitter,
    NativeAppEventEmitter
} from 'react-native';
import Modal from 'react-native-modalbox';
import DatePicker from 'react-native-datepicker';

import AppButton from '../appButton';

const isIos = Platform.OS === 'ios';

export default class AppDatePicker extends Component {
    constructor(props){
        super(props);
        this.state = {
            isOpen: this.props.isOpen,
            date: this.props.date || new Date(),
            maxDate: this.props.maxDate || new Date()
        }
        this.onDateChange = this.onDateChange.bind(this);
        this.close = this.close.bind(this);
    };
    async openDatePickerAndroid() {
        const options = {
            maxDate: this.state.maxDate,
            mode: 'calendar',
            date: this.state.date
        };
        try {
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            if (action === DatePickerAndroid.dismissedAction) {

            } else {
                const date = new Date(year, month, day);
                this.onDateChange(date);
            }
            this.close();
        } catch ({code, message}) {
            console.warn(`Error in example '${stateKey}': `, message);
        }
    };
    onDateChange (date) {
        this.setState({
            date: date
        });
    };
    open(){

    };
    close () {
        this.setState({
            isOpen: false
        }, () => {
            this.props.onCloseHandle && this.props.onCloseHandle(this.state.date);
        })
    };
    componentDidMount () {
        const emitter = isIos ? NativeAppEventEmitter : DeviceEventEmitter;
        this.subscription = emitter.addListener('openDatePickerAndroid', () => {
            this.openDatePickerAndroid();
        })
    };
    render () {
        if (isIos && this.props.isOpen) {
            return (
                <View style={styles.wrapper}>
                    {
                        isIos && (
                            <Animated.View>
                                <DatePickerIOS date={this.state.date}
                                               maximumDate={this.state.maxDate}
                                               mode="date"
                                               onDateChange={this.onDateChange}
                                               style={styles.datePick}
                                />
                                <AppButton style={{margin: 5,width: width-10, backgroundColor: '#FFF'}}
                                           title="确定"
                                           onPressHandle={this.close}
                                />
                            </Animated.View>
                        )}
                </View>
            )
        } else {
            return  <View />
        }

    };
    componentWillUnmount(){
        this.subscription.remove();
    };
}
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    wrapper: {
        height: height,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 100,
    },
    datePick: {
        backgroundColor: '#FFF',
        height: 200,
        width: width-10,
        marginHorizontal: 5,
        marginTop: height-310,
        borderRadius: 5
    },
    btnBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        borderRadius: 5,
        padding: 5,
    },
    tips: {
        flex: 2,
        alignSelf: 'center'
    },

})
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import _ from 'lodash';

const moment = require('moment');
require('moment/locale/zh-cn');
moment.locale('zh-cn');
export default class CountDown extends Component {
    static defaultProps = {
        date: new Date(),
        hours: '时',
        mins: '分',
        segs: '秒',
        onEnd: () => {},
        onStart: () => {}
    };
    constructor(props) {
        super(props);
        this.state = {
            timer: {},
            isBlock: false
        };
        this.interval = null;
        this.onTiming = this.onTiming.bind(this);
        this.mounted = false;
        console.log('countdown-----------', props);
        console.log(parseInt(moment(new Date).unix()))
    }
    componentWillMount() {
        this.mounted = false;
    }
    componentDidMount() {
        const { endTime, onEnd, serverTime, startTime, fetchDiffTimes, fetchDelayTimes, onStart } = this.props;
        const endSeconds = endTime+ fetchDiffTimes + fetchDelayTimes;
        const startSeconds = startTime + fetchDiffTimes + fetchDelayTimes;
        this.calculateTime({
            endSeconds,
            startSeconds,
        });
    }
    componentWillReceiveProps(nextProps) {
        const { endTime, onEnd, serverTime, startTime, fetchDiffTimes, fetchDelayTimes, onStart } = nextProps;
        if(this.props.startTime !== startTime){
            const endSeconds =endTime+ fetchDiffTimes + fetchDelayTimes;
            const startSeconds = startTime + fetchDiffTimes + fetchDelayTimes;
            this.calculateTime({
                endSeconds,
                startSeconds,
            });
        }
   }
    componentWillUnmount() {
        this.mounted = true;
        this.stop();
    }
    calculateTime = ({endSeconds, startSeconds}) => {

        if((parseInt(moment(new Date).unix())) >= startSeconds) {
            this.onTiming(endSeconds);
            !this.mounted && this.setState({
                isBlock: false
            });
        } else {
          const diffTimes = startSeconds - parseInt(moment(new Date).unix());
          !this.mounted && this.setState({
              isBlock: true
          })
          this.timers = setTimeout(() => {
                this.onTiming(endSeconds);
                !this.mounted && this.setState({
                    isBlock: false
                });
          }, diffTimes * 1000)
        }
    }
    onTiming(endSeconds) {
        const { onEnd, onStart } = this.props;
        onStart();
        this.interval = setInterval(() => {
            const dateStamp = this.getDateOfData(endSeconds);
            if(dateStamp) {
                !this.mounted && this.setState({
                    timer: dateStamp
                })
            } else {
                this.stop();
                onEnd();
                !this.mounted && this.setState({
                    isBlock: true
                })
            }
        }, 1000)
    }
    getDateOfData(endSeconds) {
        let diffTimestamp = endSeconds - parseInt(moment(new Date).unix());
        if(diffTimestamp <= 0){
            return false;
        }
        const timeObj = {
            years: 0,
            days: 0,
            hours: 0,
            min: 0,
            sec: 0,
            millisec: 0
        };
        const yearTimestamp = 365.25 * 86400;
        if(diffTimestamp >= yearTimestamp) {
            timeObj.years = Math.floor(diffTimestamp / yearTimestamp );
            diffTimestamp -= timeObj.years * yearTimestamp;
        }
        if(diffTimestamp >= 86400) {
            timeObj.days = Math.floor(diffTimestamp / 86400);
            diffTimestamp -= timeObj.days * 86400;
        }
        if(diffTimestamp >= 3600) {
            timeObj.hours = Math.floor(diffTimestamp / 3600);
            diffTimestamp -= timeObj.hours * 3600;
        }
        if(diffTimestamp >= 60) {
            timeObj.min = Math.floor(diffTimestamp / 60);
            diffTimestamp -= timeObj.min * 60;
        }
        timeObj.sec = diffTimestamp;
        return timeObj;
    }
    stop() {
        clearInterval(this.interval);
    }
    render() {
        const { timer, isBlock} = this.state;
        const { mins, segs, textStyle } = this.props;
        return (
            <View>
            {!_.isEmpty(timer) ? !isBlock ? <View style={styles.container}>
                    <Text style={textStyle}>{this.leadingZeros(timer.min)}</Text>
                    <Text style={textStyle}>{mins}</Text>
                    <Text style={textStyle}>{this.leadingZeros(timer.sec)}</Text>
                    <Text style={textStyle}>{segs}</Text>
                </View>
                :
                <Text style={{ color: '#59CD8A' }}>已封盘</Text>
                :
                !isBlock?
                <Text style={{ color: '#59CD8A' }}>加载中...</Text>
                :
                <Text style={{ color: '#59CD8A' }}>已封盘</Text>
                }
            </View>
        )
    }
    leadingZeros(num, length = null) {
        let length_ = length;
        let num_ = num;
        if (length_ === null) {
        length_ = 2;
        }
        num_ = String(num_);
        while (num_.length < length_) {
        num_ = '0' + num_;
        }
        return num_;
    }
    getServerTimeDiff(serverTime, fetchDiffTimes) {
       const servTimes =  serverTime;
       const localTimes = parseInt(moment(new Date).unix());
       return (servTimes + parseInt(fetchDiffTimes) - localTimes);
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    }
});
const toTimestamp = (dateStr) => {
    return new Date(dateStr).getTime();
}
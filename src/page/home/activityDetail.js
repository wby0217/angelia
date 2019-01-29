import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { activityDetailService } from '../../service';
import errorHandle from '../../service/errorHandle';
import ErrorPage from '../../component/errorPage';
import _ from 'lodash';
import Header from '../../component/header';
import HTMLView from 'react-native-htmlview';

const moment = require('moment');
require('moment/locale/zh-cn');
moment.locale('zh-cn');
const { width } = Dimensions.get('window');
export default class ActivityDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeDetail: {}
        };
        this.navigation = props.navigation
    }
    componentDidMount() {
        const { state } = this.props.navigation;
        const { activityId } = state.params;
        activityDetailService({ activityId })
        .then(res => {
            this.setState({
                activeDetail: res
            });
        })
        .catch(err => {
            errorHandle(err)
        })
    }
    render () {
        const { activeDetail } = this.state;
        return (
            <View style={styles.container}>
                <Header headerTitle={'活动详情'} navigation={this.navigation} />
                {_.isEmpty(activeDetail) ? <ErrorPage/>:
                <ScrollView style={{margin: 10}}>
                    <View style={{ borderBottomColor: '#E5E5E5', borderBottomWidth: StyleSheet.hairlineWidth }}>
                        <Text style={{ fontSize: 18 }}>{activeDetail.activityName}</Text>
                        <Text style={{ color: '#666666', fontSize: 12, marginVertical: 10 }}>活动时间: {moment(activeDetail.startTime).format('YYYY-MM-DD')} 至 {moment(activeDetail.endTime).format('YYYY-MM-DD')}</Text>
                    </View>
                    <Image
                        source={{uri: activeDetail.imageUrl}}
                        style={styles.banner}
                    />
                    <HTMLView value={activeDetail.content}/>
                </ScrollView>
                }
            </View>

        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    banner: {
        width: width - 20,
        height: width * 260 / 750,
        resizeMode: 'contain'
    }
});

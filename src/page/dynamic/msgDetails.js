import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image
} from 'react-native';
import HTMLView from 'react-native-htmlview';
import { ruleInfoService, noticeDetailsService } from '../../service';
import ErrorPage from '../../component/errorPage';
import _ from 'lodash';
import Header from '../../component/header';
import errorHandle from '../../service/errorHandle'

export default class MsgDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {}
        };
        this.navigation = props.navigation
    }
    componentDidMount() {
        const { state } = this.props.navigation;
        const { noticeId, msgType } = state.params;
        noticeDetailsService({noticeId, type:msgType})
            .then((ret) => {
                this.setState({ data: ret })
            })
            .catch(err => {
                errorHandle(err).then(res => {
                    if (res.routeName && res.routeName === 'Login') {
                        this.navigation.navigate('Login');
                    }
                })
            })
    }
    render () {
        const { data } = this.state;
        return (
            <View style={styles.container}>
                <Header headerTitle = {this.navigation.state.params.title || '公告'}
                        navigation = {this.navigation}/>
                {_.isEmpty(data) ? <ErrorPage /> :
                <ScrollView style = {styles.content}>
                    <Text style={{ marginBottom: 5 }}>{ data.title }</Text>
                    <Text style={{ color: '#999999', fontSize: 12 }}>{data.datetime}</Text>
                    <HTMLView value={data.content} />
                </ScrollView>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderBottomColor: '#EFEFEF',
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
});

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react/native';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    WebView,
} from 'react-native';
import HTMLView from 'react-native-htmlview';
import Spinner from 'react-native-spinner';
import { ruleInfoService, instructionsService } from '../../service';
import ErrorPage from '../../component/errorPage'
import { appSettingStore } from '../../store';
import Header from '../../component/header';

@inject('appSettingStore')
@observer
export default class HTMLpage extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props){
        super(props);
        this.state = {
            content: undefined,
            isConnecting: false
        };
        this.navigation = props.navigation;
    };
    componentDidMount() {
        const { state } = this.props.navigation;
        const { type, LotteryId } = state.params;
        this.setState({isConnecting: true});
        if(type === 'rule') {
            ruleInfoService({ params: {lotteryId: LotteryId} })
                .then((data) => {
                    this.setState({
                        content: data.content,
                        isConnecting: false
                    })
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({
                        isConnecting: false,
                        content: ''
                    });
                })
        } else {
            instructionsService({params: { configKey: type }})
                .then((data) => {
                    this.setState({content: data[type], isConnecting: false })
                })
                .catch((err) => {
                    console.log(err)
                    this.setState({
                        isConnecting: false,
                        content: ''
                    });
                })
        }
    };
    render () {
        const { state } = this.props.navigation;
        const { title } = state.params;
        const {content, isConnecting} = this.state;
        return (
            <View style={{flex:1}}>
                <Header headerTitle = {title}
                        navigation = {this.navigation}/>
                <ScrollView style={{backgroundColor:'#fff'}}>
                    {!!content ? (
                        <HTMLView stylesheet={styles} value={content}/>
                    ) : (
                        content !== undefined && (<ErrorPage type="noData" />)
                    )}
                </ScrollView>
                <Spinner visible={isConnecting}
                         color="#333"
                         overlayColor="transparent"
                         textContent={"正在加载"}
                         textStyle={{color: '#333', fontSize: 16}}/>
            </View>
        )
    }
};
const styles = StyleSheet.create({
    span:{
        height: 60,
        color: 'red',
    },
    p:{
        color: '#666',
        lineHeight: 20,
        padding: 10,
    },
    div: {
        height: 30,
        lineHeight: 30,
    }
});
{/*<WebView*/}
{/*automaticallyAdjustContentInsets={false}*/}
{/*source={{html: this.htmlHeader + content}}*/}
{/*/>*/}
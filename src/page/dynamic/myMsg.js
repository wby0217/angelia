import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
    Image,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { noticeListService } from '../../service';
import  errorHandle  from '../../service/errorHandle';
import { checkIsLogin } from '../../service/authService';
import LoadMoreFooter from '../../component/loadMoreFooter';

export default class MyMsg extends Component {
        constructor (props) {
        super(props)
        this.state = {
            size: 20,
            totalPage: 1,
            loading: false,
            refreshing: false,
            dataList: [],
            isLogin: false,
        }
        this.pageIndex = 0;
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.navigate = this.props.navigation.navigate;
    }
    _renderItem({item,index}) {
       const { navigate } = this.props.navigation;
       const icon = item.isRead ? require('../../assets/images/email-read.png') : require('../../assets/images/email-not-read.png');
       return (<TouchableOpacity key={index}
                    style={styles.notcieRow}
                    onPress={() => {
                        navigate('MsgDetails', { title: '我的消息', type: 'msg', noticeId: item.id , msgType: 2});
                        setTimeout(this.onRefresh, 800);
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center',height: 40 }}>
                        <Image source={icon} style={styles.readIcon}/>
                        <Text style={{color: item.isRead ? '#8D8D8D' : '#333', marginLeft: 5}}>
                            {item.title}
                        </Text>
                    </View>
                    <Text style={{color: item.isRead ? '#8D8D8D' : '#333'}}>{item.datetime}</Text>
                </TouchableOpacity>)
    }
    handleLoadMore() {
        this.pageIndex ++;
        this.fetchData();
    }
    renderFooter = () => <LoadMoreFooter isLoadAll={this.state.loading}/>
    onRefresh() {
        this.pageIndex = 1;
        this.setState({
            refreshing: true,
            loading: false
        });
        this.fetchData();
    }
    fetchData() {
        const { totalPage, dataList, size } = this.state;
        const data = {
            size,
            pageIndex: this.pageIndex,
            type: 2,
        };
        if(this.pageIndex > totalPage) {
            this.setState({
                loading: true
            });
            return;
        }
        noticeListService(data)
        .then((data) => {
            console.log('my message', data);
            if (data.totalNum === 0) {
                this.setState({
                    loading: true,
                    refreshing: false
                });
            } else {
                this.setState({
                    dataList: this.pageIndex === 1 ? data.list : dataList.concat(data.list),
                    totalPage: data.totalPage,
                    refreshing: false
                });
            }
        })
        .catch((err) => {
            this.setState({refreshing: false})
            errorHandle(err).then(err => {
                if (err.routeName && err.routeName === 'Login') {
                    this.setState({isLogin: false})
                }

            })
        });
    };
    checkIsLoginHanlde () {
        checkIsLogin().then(() => {
            this.setState({
                isLogin: true,
            })
        }).catch(() => {
            this.setState({
                isLogin: false,
            })
        })
    };
    componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused) {
            this.checkIsLoginHanlde();
        }
    }
    componentDidMount () {
        this.checkIsLoginHanlde();
    };
    render() {
        const { isLogin } = this.state;
        return (
            <View style={[{ flex: 1, paddingHorizontal: 10 }, isLogin ? '' : styles.center]}>
                {
                    isLogin ? (
                        <FlatList
                            data={this.state.dataList}
                            keyExtractor={(item, index) => index}
                            renderItem={this._renderItem}
                            refreshing={this.state.refreshing}
                            onEndReached={this.handleLoadMore}
                            onEndReachedThreshold={0}
                            ListFooterComponent = {this.renderFooter}
                            style={{ flex: 1 }}
                            onRefresh = {this.onRefresh}
                        />
                    ) : (
                        <TouchableOpacity style={styles.loginTips} onPress={() => {
                            const resetActions = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({routeName: 'Login'})]
                            });
                            this.props.navigation.dispatch(resetActions);
                        }}>
                            <Text style={styles.loginLink}>点击立即登录</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    }
}
const styles = StyleSheet.create({
    notcieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 5,
        paddingHorizontal: 8
    },
    noticeImage: {
        width: 30,
        height: 30,
        marginVertical: 5,
        marginRight: 5
    },
    center: {
        justifyContent:'center',
        alignItems: 'center',
    },
    loginTips: {
        padding: 15,
        backgroundColor: '#FF0033',
        borderRadius: 5,
    },
    loginLink: {
        fontSize: 16,
        color: '#FFF',
    },
    readIcon: {
        width: 25,
        resizeMode: 'contain'
    }
});

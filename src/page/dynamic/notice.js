import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { noticeListService } from '../../service';
import  errorHandle  from '../../service/errorHandle';
import LoadMoreFooter from '../../component/loadMoreFooter';

export default class Notice extends Component {

    constructor (props) {
        super(props)
        this.state = {
            size: 20,
            totalPage: 1,
            loading: false,
            refreshing: false,
            dataList: []
        }
        this.pageIndex = 0;
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }
    _renderItem({item,index}) {
       const { navigate } = this.props.navigation;
       return (<TouchableOpacity
                    style={styles.notcieRow}
                    onPress={() => {
                        navigate('MsgDetails', { title: '系统公告', type: 'msg', noticeId: item.id, msgType: 1});
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center',height: 40 }}>
                        <View style={{ backgroundColor: '#FF9A2B', padding: 3, borderRadius: 6  }}>
                            <Text style={{ color: '#fff', fontSize: 12}}>{item.tag}</Text>
                        </View>
                        <Text style={{ color: '#333333', marginLeft: 5 }}>{item.title}</Text>
                    </View>
                    <Text style={{ color: '#CCCCCC' }}>{item.datetime}</Text>
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
        })
        this.fetchData();
    }
    fetchData() {
        const { totalPage, dataList, size } = this.state;
        const data = {
            size,
            pageIndex: this.pageIndex,
            type: 1
        };
        if(this.pageIndex > totalPage) {
            this.setState({
                loading: true
            });
            return;
        }
        noticeListService(data)
        .then((data) => {
            console.log('notice===', data);
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
            console.log('notice===', err);
            errorHandle(err).then(err => {
                this.setState({refreshing: false})
            })
        })
    }
    render() {
        return (
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <FlatList
                    data={this.state.dataList}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => index}
                    refreshing={this.state.refreshing}
                    onEndReached={this.handleLoadMore}
                    onEndReachedThreshold={0}
                    ListFooterComponent = {this.renderFooter}
                    style={{ flex: 1 }}
                    onRefresh = {this.onRefresh}/>

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
    }
});

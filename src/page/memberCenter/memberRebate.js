import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TouchableHighlight
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import LoadMoreFooter from '../../component/loadMoreFooter';
import errorHandle from '../../service/errorHandle';
import accountService from '../../service/accountService';
import { listStyles } from '../../assets/style';
import FilterBox from '../../component/filter-box';
import { showToast } from '../../utils';
import Header from '../../component/header';

const styles = listStyles;
export default class MemberEarnings extends Component {
    static navigationOptions = ({ navigation }) =>  ({
        header: null
    });
    constructor(props) {
        super(props);
        this.size = 20;
        this.currentPage = 0;
        this.startTime = '';
        this.endTime = '';
        this.state = {
            isOpenFilterBar: false,
            isLoadingMore: false,
            isRefreshing: false,
            isFetching: false,
            dataSource: [],
            isConnecting: false,
        }
        this.toggleFilterBar = this.toggleFilterBar.bind(this);
        this.renderTableRow = this.renderTableRow.bind(this);
        this.renderLoadMore = this.renderLoadMore.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.onRefreshTable = this.onRefreshTable.bind(this);
        this.navigate = props.navigation.navigate;
        this.navigation = props.navigation;
        this.headerRight = this.headerRight.bind(this);
    };
    toggleFilterBar (status) {
        const barStatus = status ? status : !this.state.isOpenFilterBar;
        this.setState({
            isOpenFilterBar: barStatus,
        })
    };
    renderTableRow({ item, index }){
        return(
            <View style={[styles.tableRow, {backgroundColor: index%2 === 0 ? '#F7F7F7' : '#FFF'}]} key={index}>
                <View  style={styles.tableCell}>
                    <Text style={{color: '#DD1B00'}}>{item.betAmount}</Text>
                </View>
                <View  style={styles.tableCell}>
                    <Text  style={{color: '#DE2838'}}>{item.rebateAmount}</Text>
                </View>
                <View  style={[styles.tableCell, {flex: 2}]}>
                    <Text style={{color: '#5B5B5B'}}>{item.dateTime}</Text>
                </View>
                <View  style={styles.tableCell}>
                    <Text  style={{color: '#2F2F2F'}}>{item.roomLevel}</Text>
                </View>
            </View>
        )
    }
    renderLoadMore () {
        return <LoadMoreFooter isLoadAll={this.state.isLoadingMore}/>;
    };
    renderListHeader () {
        return  (
            <View style={styles.header}>
                <View  style={styles.tableCell}>
                <Text style={styles.headerTextColor}>下注金额</Text>
                </View>
                <View  style={styles.tableCell}>
                    <Text  style={styles.headerTextColor}>回水金额</Text>
                </View>
                <View  style={[styles.tableCell, {flex: 2}]}>
                    <Text style={styles.headerTextColor}>变动日期</Text>
                </View>
                <View  style={styles.tableCell}>
                    <Text  style={styles.headerTextColor}>房间等级</Text>
                </View>
            </View>
        )
    };
    componentWillMount() {
        this.props.navigation.setParams({ toggleFilterBar: this.toggleFilterBar.bind(this) });
    };
    onPressRight() {
        this.navigate('HtmlPage', {
            title: '回水规则',
            type: 'rebateDesc'
            }
        )
    }
    headerRight() {
        return (
            <TouchableOpacity onPress={()=>this.onPressRight()}>
                <Text style={{color: '#FFF'}}>
                    回水规则
                </Text>
            </TouchableOpacity>
        )
    }
    render(){
        const { dataSource, isRefreshing, isOpenFilterBar } = this.state;

        return(
            <View style={styles.container}>
                <Header headerTitle = '我的回水'
                        headerRight = {this.headerRight}
                        navigation = {this.navigation}/>
                <FilterBox ref="filter"
                           onPressHandle={this.toggleFilterBar}
                           isOpenFilterBar={isOpenFilterBar}
                           onClosehandle={() => this.toggleFilterBar(false)}
                           onSubmitHandle={(data) => this.onSubmitHandle(data)}
                           isShowAppPick={true}
                />
                {this.renderListHeader()}
                <FlatList style={{flex: 1}}
                          data={dataSource}
                          onEndReachedThreshold={0.5}
                          keyExtractor={(item, index) => index}
                          onEndReached = {() => this.loadMore()}
                          renderItem={(rowData) => this.renderTableRow(rowData)}
                          ListFooterComponent={() => this.renderLoadMore()}
                          refreshing= {isRefreshing}
                          onRefresh={ this.onRefreshTable.bind(this) }
                />
            </View>
        );
    };
    onRefreshTable () {
        this.currentPage = 1;
        this.setState({
            isRefreshing: true,
            isLoadingMore: true,
        }, () => {
            this.fetchRecord()
        })
    };
    loadMore () {
        if (this.state.isFetching) return false;
        this.setState({
            isLoadingMore: false
        }, () => {
            this.currentPage ++ ;
            this.fetchRecord();
        });
    };
    onSubmitHandle (data) {
        if ( data.startTime ) {
            this.startTime = data.startTime;
        } else {
            return showToast('请输入开始时间');
        };
        if ( data.endTime ) {
            this.endTime = data.endTime;
        } else {
            return showToast('请输入结束时间');
        };
        if ( new Date(data.startTime) > new Date(data.endTime) ) return showToast('开始时间不能大于结束时间');
        this.currentPage = 1;
        this.setState({
            isOpenFilterBar: false
        }, () => {
            this.fetchRecord();
        })

    };
    onErrorHandle (err) {
        errorHandle(err).then(res => {
            if(res && res.routeName){
                const resetActions = NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: res.routeName})]
                });
                this.props.navigation.dispatch(resetActions);
            }
        })
    };
    fetchRecord () {
        this.setState({
            isFetching: true,
        });
        const data = {
            size: this.size,
            page: this.currentPage,
        };
        if (this.startTime) { data.startTime = this.startTime };
        if (this.endTime) {data.endTime = this.endTime};
        if (this.roomLevel) {data.roomLevel = this.roomLevel};
        if (this.totalPage && data.page > this.totalPage) {
            this.setState({
                isLoadingMore: true,
            })
            return false;
        }
        accountService.getRebateList(data).then(res => {
            console.log(res);
            this.totalPage = res.data.totalPage;
            if(res.data.totalNum === 0) {
                this.setState ({
                    isRefreshing: false,
                    isLoadingMore: true,
                    isFetching: false,
                    dataSource: this.currentPage === 1 ? [] : this.state.dataSource
                });
            } else {
                this.setState({
                    isRefreshing: false,
                    isFetching: false,
                    isLoadingMore: true,
                    dataSource: this.currentPage === 1 ? res.data.list : [...this.state.dataSource, ...res.data.list]
                });
            }
        }).catch(err => {
            console.log(err);
            this.setState ({
                isRefreshing: false,
                isFetching: false,
                isLoadingMore: true
            });
            this.onErrorHandle(err);
        });
    };
}

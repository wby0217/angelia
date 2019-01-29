import React, { Component } from 'react';import {    StyleSheet,    View,    Text,    TouchableOpacity,    FlatList,    TouchableHighlight} from 'react-native';import { NavigationActions } from 'react-navigation';import LoadMoreFooter from '../../component/loadMoreFooter';import errorHandle from '../../service/errorHandle';import accountService from '../../service/accountService';import { listStyles } from '../../assets/style';import FilterBox from '../../component/filter-box';import { showToast } from '../../utils';import Header from '../../component/header';const styles = listStyles;export default class MemberEarnings extends Component {    static navigationOptions = ({ navigation }) =>  ({        header: null    });    constructor(props) {        super(props);        this.size = 20;        this.currentPage = 0;        this.startTime = '';        this.endTime = '';        this.lotteryId = '';        this.state = {            isOpenFilterBar: false,            lotteryCategory: [],            isRefreshing: false,            isFetching: false,        }        this.toggleFilterBar = this.toggleFilterBar.bind(this);        this.renderLoadMore = this.renderLoadMore.bind(this);        this.renderTableRow = this.renderTableRow.bind(this);        this.loadMore = this.loadMore.bind(this);        this.onRefreshTable = this.onRefreshTable.bind(this);        this.onSubmitHandle = this.onSubmitHandle.bind(this);        this.navigate = props.navigation.navigate;        this.navigation = props.navigation;        this.headerRight = this.headerRight.bind(this)    };    toggleFilterBar (status) {        const barStatus = status ? status : !this.state.isOpenFilterBar;        this.setState({            isOpenFilterBar: barStatus,            agentIncome: {}        })    };    renderLoadMore () {        return <LoadMoreFooter isLoadAll={this.state.isLoadingMore}/>;    };    headerRight() {        return (            <TouchableOpacity onPress={() => this.toggleFilterBar() }>                <Text style={{color: '#FFF'}}>筛选</Text>            </TouchableOpacity>        )    }    renderTableRow({ item, index }){        return(            <View style={[styles.tableRow, {backgroundColor: index%2 === 0 ? '#F7F7F7' : '#FFF'}]}>                <View  style={styles.tableCell}>                    <Text  style={{color: '#DD1B00'}}>{item.rebate}</Text></View>                <View  style={styles.tableCell}>                    <Text  style={{color: '#DD1B00'}}>{item.rebatePercent}</Text></View>                <View  style={[styles.tableCell, {flex: 2}]}>                    <Text style={{color: '#5B5B5B'}}>{item.datetime}</Text>                </View>                <View  style={styles.tableCell}>                    <Text style={{color: '#F1841F'}}>{item.gainAmount}</Text>                </View>            </View>        )    }    renderListHeader () {        return  (            <View style={styles.header}>                <View  style={styles.tableCell}>                <Text style={styles.headerTextColor}>收益</Text>                </View>                <View  style={styles.tableCell}>                <Text style={styles.headerTextColor}>返点比例</Text>                </View>                <View  style={[styles.tableCell, {flex: 2}]}>                    <Text  style={styles.headerTextColor}>时间</Text>                </View>                <View  style={styles.tableCell}>                <Text  style={styles.headerTextColor}>盈亏</Text>                </View>            </View>        )    };    componentWillMount() {        this.props.navigation.setParams({ toggleFilterBar: this.toggleFilterBar.bind(this) });    };    render(){        const { dataSource, isRefreshing, isOpenFilterBar } = this.state;        return(            <View style={styles.container}>                <Header headerTitle = '我的收益'                        headerRight={this.headerRight}                        navigation = {this.navigation}/>                <FilterBox ref="filter"                           onPressHandle={this.toggleFilterBar}                           isOpenFilterBar={isOpenFilterBar}                           onClosehandle={() => this.toggleFilterBar(false)}                           onSubmitHandle={(data) => this.onSubmitHandle(data)}                           isShowAppPick={false}                />                {this.renderListHeader()}                <FlatList style={{flex: 1}}                          data={dataSource}                          onEndReachedThreshold={0.5}                          onEndReached = {() => this.loadMore()}                          renderItem={(rowData) => this.renderTableRow(rowData)}                          ListFooterComponent={() => this.renderLoadMore()}                          refreshing= {isRefreshing}                          onRefresh={ this.onRefreshTable.bind(this) }                />            </View>        );    };    onRefreshTable () {        this.currentPage = 1;        this.setState({            isRefreshing: true,            isLoadingMore: true,        }, () => {            this.fetchRecord()        })    };    loadMore () {        if (this.state.isFetching) return false;        this.setState({            isLoadingMore: false        }, () => {            this.currentPage ++ ;            this.fetchRecord();        });    };    onSubmitHandle (data) {        if ( data.startTime ) {            this.startTime = data.startTime;        } else {            return showToast('请输入开始时间');        };        if ( data.endTime ) {            this.endTime = data.endTime;        } else {            return showToast('请输入结束时间');        };        if ( new Date(data.startTime) > new Date(data.endTime) ) return showToast('开始时间不能大于结束时间');        this.currentPage = 1;        this.setState({            isOpenFilterBar: false        }, () => {            this.fetchRecord();        })    };    onErrorHandle (err) {        errorHandle(err).then(res => {            if(res && res.routeName){                const resetActions = NavigationActions.reset({                    index: 0,                    actions: [NavigationActions.navigate({ routeName: res.routeName})]                });                this.props.navigation.dispatch(resetActions);            }        })    };    fetchRecord () {        this.setState({            isFetching: true,        });        const data = {            size: this.size,            page: this.currentPage,        };        if (this.startTime) { data.startTime = this.startTime };        if (this.endTime) {data.endTime = this.endTime};        if (this.totalPage && data.page > this.totalPage) {            this.setState({                isLoadingMore: true,            });            return false;        };        console.log(data);        accountService.getAgentIncomeList(data).then(res => {            console.log(res);            this.totalPage = res.data.totalPage;            if(res.data.totalNum === 0) {                this.setState ({                    isRefreshing: false,                    isLoadingMore: true,                    isFetching: false,                });            } else {                this.setState({                    isRefreshing: false,                    isLoadingMore: true,                    isFetching: false,                    dataSource: this.currentPage === 1 ? res.data.list : [...this.state.dataSource, ...res.data.list]                });            }        }).catch(err => {            console.log(err);            this.setState ({                isRefreshing: false,                isLoadingMore: true,                isFetching: false,            });            this.onErrorHandle(err);        });    };}
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
import { carouselListService } from '../../service';
import errorHandle from '../../service/errorHandle';
import ErrorPage from '../../component/errorPage';
import Header from '../../component/header';

const { width, height } = Dimensions.get('window');
const moment = require('moment');
require('moment/locale/zh-cn');
moment.locale('zh-cn');
export default class ActivityList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
        this.navigation = props.navigation;
    }
    componentDidMount() {
        carouselListService()
        .then((data) => {
            this.setState({
                data: data.list
            })
        })
        .catch(err => {
            errorHandle(err)
        })
    }
    render () {
        const { data } = this.state;
        const { navigate } = this.props.navigation;
        return (
            <View>
                <Header headerTitle = '优惠活动'
                        backgroundColor = '#FF0033'
                        navigation = {this.navigation}/>
                <ScrollView style={styles.container}>
                    {data.length ? data.map((item, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    navigate('ActivityDetail', {...item});
                                }}
                                key={index}
                            >
                                <View style={styles.itemView}>
                                    <Text>{item.activityName}</Text>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.banner}
                                    />
                                    <View style={styles.bottomView}>
                                        <Text style={{ color: '#666666', fontSize: 13 }}>活动时间: {moment(item.startTime).format('YYYY-MM-DD')}至{moment(item.endTime).format('YYYY-MM-DD')}</Text>
                                        <View
                                            style={styles.detailBtn}
                                        >
                                            <Text style={{ color: '#999999', fontSize: 12 }}>查看详情</Text>
                                            <Image
                                                source={require('../../assets/images/icon_next.png')}
                                                style={{ width: 12, height: 14, resizeMode: 'contain' }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }): <ErrorPage/>}

                        {/*<View style={styles.itemView}>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999, justifyContent: 'center', borderRadius: 5 }}>
                            <Image
                                source={require('../../assets/images/icon_end.png')}
                                style={{ width: 110,resizeMode: 'contain', alignSelf: 'center', }}
                            />
                        </View>
                        <Text>加入趣彩，天天添彩添财</Text>
                        <Image
                            source={require('../../assets/images/2.png')}
                            style={styles.banner}
                        />
                        <View style={styles.bottomView}>
                            <Text style={{ color: '#666666', fontSize: 13 }}>活动时间: 2017-6-20至2017-7-30</Text>
                            <View
                                style={styles.detailBtn}
                            >
                                <Text style={{ color: '#999999', fontSize: 12 }}>查看详情</Text>
                                <Image
                                    source={require('../../assets/images/icon_next.png')}
                                    style={{ width: 12, height: 14, resizeMode: 'contain' }}
                                />
                            </View>
                        </View>
                    </View>*/}
                    </ScrollView>
            </View>

        )
    }
}
const styles = StyleSheet.create({
    container: {
        height: height,
        padding: 10
    },
    itemView: {
        padding: 10,
        borderColor: '#E5E5E5',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginBottom: 10
    },
    banner: {
        width: width - 40,
        height: width * 260 / 750,
        resizeMode: 'contain'
    },
    bottomView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    detailBtn: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    }
});

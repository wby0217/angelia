import React, { Component } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Swiper from 'react-native-swiper';
import {CachedImage} from "react-native-img-cache";
import { HttpFetch, showToast } from '../../utils';
import { carouselListService } from '../../service';
import { defaultErrorHandle } from '../../service/errorHandle';

const { width } = Dimensions.get('window');
export default class CarouselHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            swipershow: false
        };
        this.clickTime = new Date();
    }
    componentDidMount() {
        carouselListService()
            .then((data) => {
                this.setState({
                    data: data.list,
                    swipershow: !!data.list.length
                });
                return data
            })
            .then(data => {
                storage.save({
                    key: 'carouselList',
                    data: data,
                    expires: 1000*3600*24
                });
            })
            .catch(err => {
                defaultErrorHandle(err)
                    .then(() => storage.load({key: 'carouselList'}))
                    .then(res => this.setState({data: res.list, swipershow: !!res.list.length}))
                    .catch(err => {console.log(err)})
            })
    }
    componentWillUnmount() {
        console.log('CarouselHeader un mount')
    }
    render() {
        const { data, swipershow } = this.state;
        if (swipershow ) {
            return (
                <Swiper
                    showsButtons={false}
                    width={width}
                    height={width * 260 / 750}
                    buttonWrapperStyle={{ alignItems: 'flex-start'}}
                    dotColor="#D9D9D9"
                    activeDotColor="#000000"
                    dotStyle={{ bottom: 0}}
                    activeDotStyle={{ bottom: 0 }}
                    autoplay={true}
                    showsPagination={true}
                    paginationStyle={{ bottom: 0 }}
                >
                    {
                        data && data.length && Array.from(data).map((item, i) =>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.banner}
                                    key={i}
                                    onPress={() => {
                                        const curTime = new Date();
                                        if (curTime - this.clickTime < 3000) return false;
                                        this.clickTime = curTime;
                                        this.props.navigation.navigate('ActivityList', {...item});
                                    }}>
                                    <CachedImage
                                        style={styles.banner}
                                        source={
                                            !!item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/banner.png')}
                                        resizeMode={Image.resizeMode.contain}
                                        mutable
                                    />
                                </TouchableOpacity>
                            )
                    }
                </Swiper>
            )
        } else {
            return <View style={styles.banner} ><Image style={styles.banner} source={require('../../assets/images/banner.png')}/></View>
        }
    }
}
const styles = StyleSheet.create({
    banner: {
        width,
        height: width * 260 / 750
    }
});

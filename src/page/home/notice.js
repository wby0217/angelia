import React, { Component } from 'react';
import {
    View,
    Text,
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Swiper from '../../vendor/react-native-vertical-swiper';
import Marquee from '../../component/react-native-marquee';
import { noticeListService } from '../../service';
import { Icon } from '../../component/customicons';

const { width } = Dimensions.get('window');
export default class CarouselHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notice: [],
            swiperShow: false,
            translateY: new Animated.Value(0)
        }
        this.timer = null;
    }
    componentWillMount() {
        noticeListService()
        .then((data) => {
            this.setState({
                notice: data.list
            }, () => {
                this.loopNotice(3000,this.state.notice);
            });
        })
        .catch((err) => {
            console.log(err)
        })
    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    loopNotice = (timer, data) => {
       const translatesY = genTanslateYArr(data, -35);
       const dataLength = data.length;
       let _index = 0;
       this.timer = setInterval(() => {
            _index ++;
             if(_index >= dataLength) {
                _index = 0;
                Animated.timing(this.state.translateY, {
                    toValue: translatesY[_index],
                    duration: 0
                }).start();
             } else {
                 Animated.timing(this.state.translateY, {
                    toValue: translatesY[_index],
                    duration: 500
                }).start();
             }
       }, timer || 2000)
    }
    render() {
        const { translateY } = this.state;
        return (
          <View style={styles.notice}>
            <Image
                source={require('../../assets/images/new_notice.webp')}
                style={{ width: 45, height: 35}}
                resizeMode={Image.resizeMode.contain}
            />
                <ScrollView
                    style={{ flex: 1, height: 35 }}
                    ref="scrollView"
                    showsVerticalScrollIndicator= {false}
                >
                    {/*<View style={{ height: 35, justifyContent: 'center', }} ref="firstView">
                        <Marquee>
                            {this.state.notice.map((item)=> {
                                return `<div style="height: 35px; line-height: 35px"><span style="border: 1px solid #F6A623; color:#F6A623; border-radius: 5px; padding: 2px; margin-right: 2px ">${item.tag}</span>${item.title}</div>`
                            })}
                        </Marquee>
                    </View>*/}
                    {this.state.notice.length ? this.state.notice.map((item, index) =>
                        <Animated.View key={index} style={[styles.slide,{transform: [{ translateY }]}]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', height: 35, alignItems: 'center'}}>
                                <Text style={styles.noticeTag}>{item.tag}</Text>
                                <Text>{item.title}</Text>
                            </View>
                        </Animated.View>
                    ): <View/>
                    }
                </ScrollView>
              <Icon name='icon-more-arrows' size={20} color='#DCDCDC' style={{marginRight:10}}/>
          </View>
        );
    }
}
const genTanslateYArr = (data, number) => {
    if(!data.length) return [];
    const arr = [];
    let n = 0;
    data.map((item, index) => {
        arr.push( n )
        n = n + number;
    });
    return arr;
}
const styles = StyleSheet.create({
    notice: {
        height: 35,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        borderColor: '#EFEFEF',
        shadowColor:'#BBBBBB',
        shadowOffset:{height:0.5,width:0.5},
        shadowOpacity:0.8,
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
    import: {
        color: '#F6A623',
        borderColor: '#F6A623',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 3,
        paddingVertical: 2,
        marginRight: 5,
    },
    noticeTag: {
        color: '#F6A623',
        borderColor: '#F6A623',
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginRight: 5,
        borderRadius: 5,
        marginLeft: 7,
        fontSize:12,
    },
    slide: {
        height: 35,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    slide1: {
        height: 35,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#9DD6EB'
  },

  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#97CAE5'
  },

  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#92BBD9'
  },
  text: {
    color: '#000',
    fontSize: 13,
  },
  noticeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
  }
});

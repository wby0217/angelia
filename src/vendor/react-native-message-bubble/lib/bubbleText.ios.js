/**
 * react-native-message-bubble
 * https://github.com/pop-xiaodong/react-native-message-bubble
 */

'use strict';

import React, {Component} from 'react';
 import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import AWIcon from 'react-native-vector-icons/FontAwesome';
import EvilIconsIcon from 'react-native-vector-icons/EvilIcons';
import Spinner from 'react-native-spinkit';

var window = Dimensions.get('window');

export default class BubbleText extends Component {
  constructor(props) {
    super(props)
    this.state = {
        viewHight: null,
        viewWidth: window.width/3*2,
        opacity: 0,
        isLoading: false
    }
  }
  render() {
    var {viewHight, viewWidth, opacity, isLoading} = this.state;
    var {messageType, messages, betAmount, issueNo, playName, userName, userLevelId, userAvatar, messageContent, orderStatus, _index, status } = this.props;
   switch(messageType) {
        case 'betMsg':
          return(
            <View style={styles.rowLeft}>
              <Image style={[styles.userImage, {marginLeft: 10, marginRight: 3, borderRadius: 17 }]} source={userAvatar ? {uri: userAvatar} : require('./img/person.png')}/>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View><Text style={{ fontSize: 12, marginLeft: 8, color: '#333' }}>{userName}</Text></View>
                  <Image source={switchPic(userLevelId)} style={{ height: 14,width: 90, resizeMode: 'contain'}} />
                </View>
                <Image
                capInsets={{top: 30, left: 13, bottom: 18, right: 13}}
                resizeMode='stretch'
                source={require('./img/message_bubble_left_red.png')}
                onLayout={(e) => {
                  this.LeftText.measure((a, b, width, height, px, py) =>{
                    this.setState({
                      viewHight: height,
                      viewWidth: width,
                      opacity: 1,
                    });
                  });
                }}
                style={{justifyContent: 'center', width: viewWidth, height: viewHight, opacity: opacity }}
                >
                    <View
                      ref={v => this.LeftText = v}
                      style={{ paddingHorizontal: 18 }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', height: 35 }}>
                        <Text style={{ fontSize: 12, color: '#fff' }}><AWIcon name="clock-o" /> {issueNo}期</Text>
                        <Text style={{ fontSize: 12, color: '#fff' }}>金额:{betAmount}元</Text>
                      </View>
                      <View style={{ height: 30, justifyContent: 'flex-start',  backgroundColor: 'transparent' }}>
                          <Text style={{ fontSize: 12, color: '#fff' }}>投注类型: {playName}</Text>
                      </View>
                    </View>
                </Image>
              </View>
            </View>
          );
      case 'chat':
        return (
          <View style={styles.rowLeft}>
              <Image style={[styles.userImage, {marginLeft: 10, marginRight: 3, borderRadius: 17 }]} source={userAvatar? {uri: userAvatar} : require('./img/person.png')}/>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View><Text style={{ fontSize: 12, marginLeft: 8, color: '#333' }}>{userName}</Text></View>
                  <Image source={switchPic(userLevelId)} style={{ height: 14,width: 90, resizeMode: 'contain'}} />
                </View>
                <Image
                capInsets={{top: 30, left: 13, bottom: 18, right: 13}}
                resizeMode='stretch'
                source={require('./img/message_bubble_left.png')}
                onLayout={(e) => {
                  this.LeftText.measure((a, b, width, height, px, py) =>{
                    this.setState({
                      viewHight: height,
                      viewWidth: width,
                      opacity: 1,
                    });
                  });
                }}
                style={{justifyContent: 'center', width: viewWidth, height: viewHight, opacity: opacity}}
                >
                  <Text
                    ref={v => this.LeftText = v}
                    numberOfLines={0}
                    style={styles.messagesLeft}>{messageContent}</Text>
                </Image>
              </View>
            </View>
        );
      case 'sendMsg':
          return(
              <View style={styles.rowRight}>
                <Image
                  capInsets={{top: 30, left: 13, bottom: 18, right: 13}}
                  resizeMode='stretch'
                  source={require('./img/message_bubble_right.png')}
                  onLayout={(e) => {
                    this.rightText.measure((a, b, width, height, px, py) =>{
                      if (width != viewWidth || height != viewHight) {
                        this.setState({
                          viewHight: height,
                          viewWidth: width,
                          opacity: 1,
                        });
                      }
                    });
                  }}
                  style={{justifyContent: 'center', width: viewWidth, height: viewHight, opacity: opacity}}
                  >
                    <Text
                      ref={v => this.rightText = v}
                      numberOfLines={0}
                      style={styles.messagesRight}>{messages}</Text>
                  </Image>
                <Image style={[styles.userImage, {marginRight: 10, marginLeft: 3, borderRadius: 17 }]} source={userAvatar? { uri: userAvatar } : require('./img/person.png')}/>
              </View>
          );
      case 'sendBet':
        return(
          <View style={styles.rowRight}>
                <View
                  style={{ height: viewHight, justifyContent: 'center' }}
                >
                {status ?
                <AWIcon name="check-circle" style={{ marginBottom: 8 }} color="#70CD7B" />:
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      isLoading: true
                    }, () => {
                        this.props.reloadGenOrderById(_index,(result) => {
                              this.setState({
                                isLoading: false
                              })
                        });
                    });
                    
                  }}
                >
                  {
                    !isLoading? <AWIcon name="exclamation-circle" style={{ marginBottom: 8 }} color="#DF2214" /> :
                    <Spinner type="FadingCircleAlt" size={12} color="#333333" isVisible={true} />
                  }
                </TouchableOpacity>
                }
                </View>
                <Image
                  capInsets={{top: 30, left: 13, bottom: 18, right: 13}}
                  resizeMode='stretch'
                  source={require('./img/message_bubble_right_blue.png')}
                  onLayout={(e) => {
                    this.rightText.measure((a, b, width, height, px, py) =>{
                      if (width != viewWidth || height != viewHight) {
                        this.setState({
                          viewHight: height,
                          viewWidth: width,
                          opacity: 1,
                        });
                      }
                    });
                  }}
                  style={{justifyContent: 'center', width: viewWidth, height: viewHight, opacity: opacity}}
                  >
                    <View
                      ref={v => this.rightText = v}
                      style={{ paddingHorizontal: 18 }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', height: 35 }}>
                        
                        <Text style={{ fontSize: 12, color: '#fff' }}><AWIcon name="clock-o" /> {issueNo}期</Text>
                        <Text style={{ fontSize: 12, color: '#fff' }}>金额:{betAmount}元</Text>
                      </View>
                      <View style={{ height: 30, justifyContent: 'flex-start',  backgroundColor: 'transparent' }}>
                          <Text style={{ fontSize: 12, color: '#fff' }}>投注类型: {playName}</Text>
                      </View>
                    </View>
                  </Image>
                <Image style={[styles.userImage, {marginRight: 10, marginLeft: 3, borderRadius: 17 }]} source={ userAvatar? {uri: userAvatar } : require('./img/person.png')}/>
          </View>
        )
        default:
          return <View/>
    }
  }
}

const switchPic = (userLevelId) => {
  switch (userLevelId) {
      case 1: 
        return require('./img/level1.png');
      case 2:
        return require('./img/level2.png');
      case 3: 
        return require('./img/level3.png');
      case 4:
        return require('./img/level4.png');
      case 5: 
        return require('./img/level5.png');
      case 6:
        return require('./img/level6.png');
      default:
        return require('./img/level1.png');
  }
}
var styles = StyleSheet.create({
  rowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rowLeft: {
    flexDirection: 'row',
  },
  messagesRight: {
    alignSelf: 'flex-end',
    fontSize: 14,
    paddingLeft: 14,
    paddingRight: 17,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
    color: '#333'
  },
  messagesLeft: {
    alignSelf: 'flex-start',
    fontSize: 14,
    paddingHorizontal: 17,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
    color: '#333'
  },
  userImage: {
    marginTop: 2,
    height: 35,
    width: 35,
  },
});

module.exports = BubbleText;

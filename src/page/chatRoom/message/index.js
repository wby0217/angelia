import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import Avatar from './avatar';
import Bubble from './bubble';
import Systems from './systems'
import Status from './status'

export default class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            position: '',
        };
        this.getLevelImage = this.getLevelImage.bind(this);
        this.renderUserInfo = this.renderUserInfo.bind(this);
        this.onResubmitOrder = this.onResubmitOrder.bind(this);
    };
    getLevelImage (level) {
        switch (level) {
            case 1:
                return require('../../../assets/images/level1.png');
            case 2:
                return require('../../../assets/images/level2.png');
            case 3:
                return require('../../../assets/images/level3.png');
            case 4:
                return require('../../../assets/images/level4.png');
            case 5:
                return require('../../../assets/images/level5.png');
            case 6:
                return require('../../../assets/images/level6.png');
            default:
                return require('../../../assets/images/level1.png');
        }
    };

    componentWillMount() {
        const { type } = this.props.messageContent;
        switch (type) {
            case 1:
                this.props.messageContent.messageStatus = {};
                this.props.messageContent.messageStatus.position = 'left';
                this.props.messageContent.messageStatus.typeDesc = 'order';
                break;
            case 2:
                this.props.messageContent.messageStatus = {};
                this.props.messageContent.messageStatus.position = 'left';
                this.props.messageContent.messageStatus.typeDesc = 'message';
                break;
            case 3:
                this.props.messageContent.messageStatus = {};
                this.props.messageContent.messageStatus.position = 'center';
                this.props.messageContent.messageStatus.typeDesc = 'tips';
                break;
            case 4:
                this.props.messageContent.messageStatus = {};
                this.props.messageContent.messageStatus.position = 'center';
                this.props.messageContent.messageStatus.typeDesc = 'prize';
                break;
        }
    };
    renderUserInfo() {
        const { username, level } = this.props.messageContent.user;
        return (
            <View style={styles.userInfo}>
                <Text style={[styles.font10, {paddingTop: 4}]}>{username}</Text>
                <Image style={styles.levelImage} source={this.getLevelImage(level)}/>
            </View>
        )
    };
    onResubmitOrder () {
        const { onRetry, messageContent, messageListIndex } = this.props;
        !!onRetry && onRetry(messageContent, messageListIndex);
    }
    render () {
        const { messageContent, getLayoutHeight, messageListIndex } = this.props;
        const { messageStatus, orderMessage, user } = messageContent;
        const { position, status, typeDesc } = messageStatus;
        return (
            <View style={[styles.container, styles[position]]}
                  onLayout={(event) => {getLayoutHeight && getLayoutHeight(event.nativeEvent.layout)}}>
                { position === 'left'  &&  (<Avatar position="left" avatar={user.avatar}/>)}
                { position === 'right'  &&  (
                    <Status
                        condition={status}
                        typeDesc = {typeDesc}
                        messageListIndex = {messageListIndex}
                        onRetry={(status) => this.onResubmitOrder(status)}/>
                )}
                { position === 'center' ?  (<Systems content={messageContent}/>) : (
                    <View style={[styles.bubble, styles[`${position}Align`]]}>
                        { position === 'left' && this.renderUserInfo() }
                        <Bubble content={messageContent} messageListIndex={messageListIndex} />
                    </View>
                )}
                { position === 'right' && (<Avatar position="right" avatar={user.avatar}/>) }
            </View>
        );
    };
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    left: {
        justifyContent: 'flex-start'
    },
    right: {
        justifyContent: 'flex-end'
    },
    center: {
        justifyContent: 'center'
    },
    time: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    timeBlock: {
        color: '#999',
        fontSize: 12,
    },
    font10: {
        fontSize: 10
    },
    userInfo: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
    levelImage: {
        width: 75,
        height: 15,
        marginHorizontal: 5,
    },
    bubble: {
        flexDirection: 'column',
        alignItems:'flex-start'
    },
    leftAlign: {
        alignItems: 'flex-start'
    },
    rightAlign: {
        alignItems: 'flex-end'
    }
});
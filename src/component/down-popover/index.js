import React, { Component } from 'react';
import {
    View,
    Text,
    Modal,
    Animated,
    Easing,
    StyleSheet,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';

const isIos = Platform.OS === 'ios';
export default class DownPopover extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fadeInValue: new Animated.Value(0)
        }
        this.showOrHide = this.showOrHide.bind(this);
    }
    componentDidMount() {
        this.showOrHide();
    }
    componentWillReceiveProps(nextProps) {
        const { visible: willVisible } = nextProps;
        if(willVisible != this.props.visible) {
            this.showOrHide(nextProps);
        }
    }
    showOrHide(prop) {
        const { visible } = prop || this.props;
        const commonConfig = {
                    duration: 300,
                    easing: visible ? Easing.out(Easing.back()) : Easing.inOut(Easing.quad),
                }
                Animated.timing(
                    this.state.fadeInValue,
                    {
                        toValue: visible ? 1 : 0,
                        ...commonConfig
                    }
                ).start();
    }
    render() {
        const {showOrHide, titleView, children, buttonRect, visible, arrow, containerStyle} = this.props;
        return(
            <Modal
              transparent
              visible = {visible}
              showOrHide={this.showOrHide}
              onRequestClose={()=>{}}
            >
                <View style={{top: buttonRect.y,  marginHorizontal: 15 }}>{titleView}</View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ flex:1, marginTop: -10, top: isIos ?(buttonRect.y+buttonRect.h) : (buttonRect.y+buttonRect.h)-26, alignItems: 'center' }}
                    onPress={() => {
                        showOrHide(() => {})
                    }}
                >
                    <Animated.View style={[styles.shade, { opacity: this.state.fadeInValue }]} />
                    {arrow ? <View style={[styles.triangle,{left:buttonRect.w/2}]}><Icon name="caret-up" color="#ffffff" size={24} /></View> : null}
                    <TouchableWithoutFeedback
                                onPress={ null}
                                >
                        <Animated.View style={[{ top: -24, backgroundColor: '#fff', opacity: this.state.fadeInValue, width: (buttonRect.w-30) }, containerStyle]}>
                            {children}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        )
    }
}

DownPopover.defaultProps = {
    visible: false,
    titleView: null,
    arrow: true,
    showOrHide: () => {}
};

const styles = StyleSheet.create({
    shade: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    triangle: {
        backgroundColor:'rgba(0,0,0,0)',
        top:-5,
        width:24,
        height:24,
        position:'absolute',
        right:9
    }
});

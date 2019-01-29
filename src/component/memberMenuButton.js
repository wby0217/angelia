import React, { Component } from 'react';import {    View,    Text,    Image,    TouchableOpacity,    PropTypes,    StyleSheet,    Dimensions} from 'react-native';import { Icon } from '../component/customicons'const { width } = Dimensions.get('window');export default class MemberMenuButton extends Component {    constructor(props) {        super(props);        this.onClick = this.onClick.bind(this);  // 需要在回调函数中使用this,必须使用bind(this)来绑定    };    onClick () {        if (this.props.onPressHandle ) {            this.props.onPressHandle();        }    };    render () {        return (            <TouchableOpacity  onPress={ this.onClick } >                <View style={[this.props.apperance, styles.menuWarp]}>                    <View style={[styles.iconImg,{backgroundColor: this.props.bgColor}]}>                        <Icon name={this.props.renderIcon} style={styles.icon}/>                    </View>                    {/*<Image style={styles.iconImg} source={this.props.renderIcon}/>*/}                    <Text style={styles.showText}>{this.props.title}</Text>                </View>            </TouchableOpacity>        )    }}const styles = StyleSheet.create({    menuWarp: {        width: width/3,        alignItems:'center',        justifyContent: 'center',    },    iconImg: {        justifyContent: 'center',        alignItems: 'center',        width: 38,        height: 38,        borderRadius: 19,        marginBottom: 2    },    showText: {        fontSize: 14,        color: '#666',        marginTop: 10,    },    icon: {        color: '#fff',        fontSize: 22,        backgroundColor: 'transparent'    }});
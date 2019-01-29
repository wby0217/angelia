import React,{Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    WebView,
    Dimensions
} from 'react-native';
import _ from 'lodash';
const {width,height} = Dimensions.get('window');
export default class Marquee extends Component{
    constructor(props){
        super(props)     
    }
    static defaultProps = {
        text: "测试marquee"
    }
    render(){
        const {text,children} = this.props;
        const newStr = children.toString().replace(/,/g, '');
        const _html = `<meta name="format-detection" content="telephone=no,email=no,adress=no"/><marquee hspace=0 vspace=0 loop=infinite scrollamount="1.5" direction="up" height=35 ><div style="white-space: nowrap; color:#666666;font-size:14px;position:relative;top:3px">${newStr}</div></marquee>`
        return(
            <WebView 
                automaticallyAdjustContentInsets={false}
                source={{html:_html}}
            />
        )
    }
}
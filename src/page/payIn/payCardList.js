import uuid from 'uuid';
export const CARDLIST = [
        {
            id: uuid.v4(),
            name: '50元',
            value: 50
        },
        {
            id: uuid.v4(),
            name: '100元',
            value: 100
        },
        {
            id: uuid.v4(),
            name: '300元',
            value: 300
        },
        {
            id: uuid.v4(),
            name: '500元',
            value: 500
        },
        {
            id: uuid.v4(),
            name: '800元',
            value: 800
        },
        {
            id: uuid.v4(),
            name: '1000元',
            value: 1000
        },
        {
            id: uuid.v4(),
            name: '2000元',
            value: 2000
        },
        {
            id: uuid.v4(),
            name: '3000元',
            value: 3000
        },
    ]

export const PAYTYPELIST= [
    {
        id: uuid.v4(),
        icon: require('../../assets/images/icon_balance.webp'),
        typeName: '客服大额支付',
        desc: '银行转账.支付宝扫码.微信支付（推荐)'
    },
    {
        id: uuid.v4(),
        icon: require('../../assets/images/unionpay_icon.webp'),
        typeName: '网银在线支付',
        desc: '更便捷／3分钟到账'
    },
    {
        id: uuid.v4(),
        icon: require('../../assets/images/icon_balance.webp'),
        typeName: '微信扫码支付',
        desc: '金额范围:1-5000元,推荐使用,支付后立即到账'
    },
    {
        id: uuid.v4(),
        icon: require('../../assets/images/wechat_icon.webp'),
        typeName: '微信APP支付',
        desc: '银行转账.支付宝扫码.微信支付（推荐)'
    },
    {
        id: uuid.v4(),
        icon: require('../../assets/images/icon_wechat_scan.webp'),
        typeName: '支付宝扫一扫',
        desc: '金额范围:1-3000元,推荐使用,支付后立即到账'
    },
    {
        id: uuid.v4(),
        icon: require('../../assets/images/icon_alipay.webp'),
        typeName: '支付宝支付',
        desc: '银行转账.支付宝扫码.微信支付（推荐)'
    },
]
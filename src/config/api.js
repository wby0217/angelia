import { NativeModules } from 'react-native';
const { AppConfigurationModule } = NativeModules;

export default {
    host: AppConfigurationModule.apiServer,
    captcha: '/General/captcha',
    signIn: '/mobile/User/signIn',
    signOut: '/mobile/User/signOut',
    register: '/mobile/User/signUp',
    thirdSignIn: '/mobile/User/ThirdSignIn',
    settings: '/mobile/AppConfig/config',
    devicesInfo: '/mobile/User/saveUserDevice',
    wechat: {
        accessToken: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        refreshToken: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        userInfo: 'https://api.weixin.qq.com/sns/userinfo'
    },
    home: {
        roomList: '/mobile/Room/roomList',
        noticeList: '/mobile/Notice/noticeList',
        playTypeOdds: '/mobile/Room/playList',
        ruleInfo: '/mobile/Lottery/getLotteryInfo',
        lotteryCategory: '/mobile/Lottery/lotteryList',
        lotteryIssues: '/mobile/Lottery/lotteryIssue',
        carouselList: '/mobile/Activity/activityList',
        issueList: '/mobile/Lottery/pastIssueList',
        genBetOrder: '/mobile/Room/bet',
        noticeDetails: '/mobile/Notice/noticeDetail',
        activityDetail: '/mobile/Activity/activityDetail',
        instructionsService: '/mobile/AppConfig/getDesc',
        getPlayList: '/mobile/Room/getPlayListV3',
        saveMenuSetting: '/mobile/Lottery/saveMenuSetting',
    },
    member: {
        sendCode: '/mobile/User/sendCode',
        bindPhone: '/mobile/User/bindPhone',
        userInfo: '/mobile/User/userInfo',
        setFundsPassword: '/mobile/User/setFundsPassword',
        modifyFundsPassword: '/mobile/User/modifyFundsPassword',
        modifyPassword: '/mobile/User/modifyPassword',
        resetPassword: '/mobile/User/resetPassword',
        addBankCard: '/mobile/User/addBankCard',
        userBankCard: '/mobile/User/bankCardList',
        bankList: '/mobile/User/bankList',
        updMemberInfo: '/mobile/User/modifyUserInfo',
        updateMemberInfo: '/mobile/User/modifyUserInfo',
        withDraw: '/mobile/User/withdrawals',
        luckLottery: '/mobile/LuckyLottery/lucky',
        luckLotteryRecord: '/mobile/LuckyLottery/luckyList',
        gameRecord: '/mobile/User/orderList',
        accountRecord: '/mobile/User/balanceChangeList',
        rebateList: '/mobile/User/rebateList',
        orderList: '/mobile/Order/orderList',
        orderDetail: '/mobile/Order/detail',
        withdrawalsList: '/mobile/User/withdrawalsList',
        rechargeList: '/mobile/Recharge/rechargeList',
        prizeList: '/mobile/LuckyLottery/prizeList',
        luckDraw: '/mobile/LuckyLottery/lucky',
        luckDrawRecord: '/mobile/LuckyLottery/luckyList',
        thirdPartyPerfectingInfo: '/mobile/User/completeAccount'
    },
    agent: {
        registerAgent: '/mobile/Agent/registerAgent',
        agentIncome: '/mobile/Agent/agentIncome',
        addMember: '/mobile/Agent/addMember',
        agentShareUrl: '/mobile/Agent/agentShareUrl'
    },
    payIn:  {
        payGroup: '/mobile/Recharge/getPayGroup',
        payTypeList: '/mobile/Recharge/payTypeList', //银行支付类型-线下支付
        RechargeType: '/mobile/Recharge/companyRechargeType', //充值类型-线下支付
        depositBankList: '/mobile/Recharge/depositBankList', //公司的入款账号-线下支付
        rechargeTransfer: '/mobile/Recharge/rechargeTransfer', //提交入款信息-线下支付
        onlineRecharge: '/mobile/Recharge/rechargeOnline', //线上支付
        getFriendsPayAccount: '/mobile/Recharge/getFriendsPayAccount', //线下二维码支付
        rechargeFriendsPay: '/mobile/Recharge/rechargeFriendsPay', //线下二维码支付提交表单
        rechargeInfo: '/mobile/Recharge/rechargeInfo' //充值详情
    }
}
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Tabs from './tabar';
import RoomList from '../page/home/roomList';   // 房间列表
import BetChatRoom from '../page/chatRoom';    // 下注会话
import Login from '../page/login/login';
import Register from '../page/login/register';
import MsgDetails from '../page/dynamic/msgDetails'; // 我的消息详情
import MemberWallet from '../page/memberCenter/memberWallet';
import MemberSettings from '../page/memberCenter/memberSettings';
import MemberAgentCenter from '../page/memberCenter/memberAgentCenter';
import MemberLuckDraw from '../page/memberCenter/memberLuckDraw';
import MemberLuckDrawRecord from '../page/memberCenter/memberLuckDrawRecord';
import MemberPhoneNumber from '../page/memberCenter/memberPhoneNumber';
import MemberRebate from '../page/memberCenter/memberRebate';
import MemberAccountRecord from '../page/memberCenter/memberAccountRecord';
import SetFundsPassword from '../page/memberCenter/setFundsPassword';
import ModifyFundsPassword from '../page/memberCenter/modidyFundsPassword';
import ModifyPassword from '../page/memberCenter/modifyPassword';
import ModifyMemberInfo from '../page/memberCenter/modifyMemberInfo';
import ThirdPartyPerfectingInfo from '../page/memberCenter/thirdPartyPerfectingInfo'
import ResetPassword from '../page/memberCenter/resetPassword';
import BindBankCard from '../page/memberCenter/bindBankCard';
import MemberBankCard from '../page/memberCenter/memberBankCard';
import MemberGameRecord from '../page/memberCenter/memberGameRecord';
import GameRecordDetail from '../page/memberCenter/memberGameRecord/recordDetail';
import MemberEarnings from '../page/memberCenter/memberEarnings';
import WithDrawRecord from '../page/memberCenter/withDrawRecord';
import RechargeRecord from '../page/memberCenter/rechargeRecord';
import AboutUs from '../page/memberCenter/aboutUs';
import WithDraw from '../page/memberCenter/withDraw';
import MultiGridChart from '../page/home/charts/multiGridChart' //时时彩和11选五走势图
import TwentyEightChart from '../page/home/charts/twentyEightChart'//28类投注走势图
import LhcChart from '../page/home/charts/lhcChart'
import ActivityList from '../page/home/activityList';   // 活动列表
import ActivityDetail from '../page/home/activityDetail';  // 活动详情
import CenterAgent from '../page/home/centerAgent'; // 代理中心
import BankAccountList from '../page/payIn/transferToCompany'; // 公司入款 账户列表
import ReplenishInfo from '../page/payIn/transferToCompany/replenishInfo'; // 平台收款 填写信息
import CheckInfo from '../page/payIn/transferToCompany/checkInfo'; // 平台收款 核对信息
import RechargeResult from '../page/payIn/rechargeResult'; // 充值结果
import ShowRechargeCode from '../page/payIn/showRechargeCode';  //在线充值 二维码
import FriendPay from '../page/payIn/friendPay';  //线下 二维码支付
import HtmlPage from '../page/memberCenter/htmlPage'
import Splash from '../page/splash';
import { PayIn } from '../page';
import ServiceCenter from '../page/home/serviceCenter'

const MainModalNavigator = StackNavigator({
    Login: {
        screen: Login,
    },
    Register: {
        screen: Register
    }
}, {
    mode: 'modal',
    initialRouteName: 'Login'
})
const MainCardNavigator = StackNavigator({
    Main: {
        screen: Tabs
    },Splash: {
        screen: Splash
    },
    RoomList: {
        screen: RoomList
    },
    ChatRoom: {
        screen: BetChatRoom
    },
    Login: {
        screen: Login,
    },
    Register: {
        screen: Register
    },
    MsgDetails: {
        screen: MsgDetails
    },
    MemberWallet: {
        screen: MemberWallet
    },
    MemberSettings: {
        screen: MemberSettings
    },
    MemberAgentCenter: {
        screen: MemberAgentCenter
    },
    MemberLuckDraw: {
        screen: MemberLuckDraw
    },
    MemberPhoneNumber: {
        screen: MemberPhoneNumber
    },
    MemberLuckDrawRecord: {
        screen: MemberLuckDrawRecord
    },
    MemberRebate: {
        screen: MemberRebate
	},
    MemberAccountRecord: {
        screen: MemberAccountRecord
    },
    SetFundsPassword: {
        screen: SetFundsPassword
    },
    ModifyFundsPassword: {
        screen: ModifyFundsPassword
    },
    ModifyPassword: {
        screen: ModifyPassword
    },
    ModifyMemberInfo: {
      screen: ModifyMemberInfo
    },
    ThirdPartyPerfectingInfo: {
        screen: ThirdPartyPerfectingInfo
    },
    ResetPassword: {
        screen: ResetPassword
    },
    BindBankCard: {
        screen: BindBankCard
    },
    MemberBankCard: {
        screen: MemberBankCard
    },
    MemberGameRecord: {
        screen: MemberGameRecord
    },
    GameRecordDetail: {
        screen: GameRecordDetail
    },
    MemberEarnings: {
        screen: MemberEarnings
    },
    MultiGridChart: {
        screen: MultiGridChart
    },
    TwentyEightChart: {
        screen: TwentyEightChart
    },
    LhcChart: {
        screen: LhcChart
    },
    ActivityList: {
        screen: ActivityList
    },
    ActivityDetail: {
        screen: ActivityDetail
    },
    WithDraw: {
        screen: WithDraw
    },
    WithDrawRecord: {
        screen: WithDrawRecord
    },
    RechargeRecord: {
        screen: RechargeRecord
    },
    AboutUs: {
        screen: AboutUs
    },
    CenterAgent: {
        screen: CenterAgent
    },
    BankAccountList: {
        screen: BankAccountList
    },
    ReplenishInfo: {
        screen: ReplenishInfo
    },
    CheckInfo: {
        screen: CheckInfo
    },
    ShowRechargeCode: {
        screen: ShowRechargeCode
    },
    ChildPayIn: {
        screen: PayIn
    },
    ServiceCenter: {
        screen: ServiceCenter
    },
    FriendPay: {
        screen: FriendPay
    },
    RechargeResult: {
        screen: RechargeResult
    },
    HtmlPage: {
        screen: HtmlPage
    }
},{
    navigationOptions: {
        header: null
},
    initialRouteName: 'Splash'
});
export default MainCardNavigator;

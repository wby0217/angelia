import Api from '../config/api';
import { post } from './request';
const home = Api.home;
const host = Api.host;
const payIn = Api.payIn;
const commonFetch = ({ url, params }) => {
    url = host + url;
    return new Promise((resolve, reject) => {
        post(url, params).then((ret) => {
            resolve && resolve(ret.data)
        })
        .catch(err => {
            // if (err.message ) {
            //     if (err.message === 'Network request failed') {
            //         err.message = '网络异常';
            //     }
            // }
            reject && reject(err)
        })
    });
}

// 房间列表请求接口
export const roomListService = (params) => commonFetch({ url: home.roomList, params });

// 通知列表请求接口
export const noticeListService = (params) => commonFetch({ url: home.noticeList, params });

// 玩法赔率请求接口
export const playTypeOddsService = (params) => commonFetch({ url: home.playTypeOdds, params });

// 玩法规则说明
export const ruleInfoService = ({ params }) => commonFetch({ url: home.ruleInfo, params});

// 玩法列表
export const lotteryCategory = () => commonFetch({ url: home.lotteryCategory });

// 彩期倒计时
export const lotteryIssueService = (params) => commonFetch({ url: home.lotteryIssues, params });

// 轮播图列表展示
export const carouselListService = () => commonFetch({ url: home.carouselList });

// 往期彩期
export const issueListService = (params) => commonFetch({ url: home.issueList, params });

// 下单接口
export const genBetOrderService = (params) => commonFetch({ url: home.genBetOrder, params})

// 获取银行支付渠道列表
export const getPayTypeList = () => commonFetch({ url: payIn.payTypeList });

//获取支付渠道分组
export const getPayGroup =  () => post(host + payIn.payGroup);

// 获取公司入款账号
export const getDepositBankList = () => commonFetch({ url: payIn.depositBankList });

// 入款方式
export const getRechargeType = () => commonFetch({ url: payIn.RechargeType });

// 平台收款充值接口
export const rechargeTransfer = (params) => commonFetch({ url: payIn.rechargeTransfer, params });

//充值线上支付
export const rechargeOnline = (params) => commonFetch({ url: payIn.onlineRecharge, params });

export const getRechargeInfo = (params) => post(host + payIn.rechargeInfo, params );

// 消息详情
export const noticeDetailsService = (params) => commonFetch({ url: home.noticeDetails, params });

// 活动说明
export const activityDetailService = (params) => commonFetch({ url: home.activityDetail, params })

//app 配置
export const getSettings = () => commonFetch({ url: Api.settings});

//线下二维码支付-获取支付账号
export const getFriendsPayAccount = (params) => post(host + payIn.getFriendsPayAccount, params);

//线下二维码支付-提交充值记录
export const submitFriendPay = (params) => post(host + payIn.rechargeFriendsPay, params);

//用户设备信息
export const sendUserDeviceInfo = (params) => post(host + Api.devicesInfo, params);

//抽奖说明 提现说明 充值说明 用户等级说明 用户注册协议说明 返水说明
export const instructionsService = ({ params }) => commonFetch({ url: home.instructionsService, params});

//玩法赔率
export const getPlayList = (params) => commonFetch({ url: home.getPlayList, params});

//菜单排序
export const saveMenuSetting = (params) => commonFetch({ url: home.saveMenuSetting, params});

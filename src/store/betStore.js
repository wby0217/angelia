import { autorun, observable, computed, action, toJs } from 'mobx';
import _ from 'lodash';
import { getPlayList, genBetOrderService, issueListService } from '../service';
import memberService from '../service/memberService';
import errorHandle from '../service/errorHandle';
import { arrayCombine } from "../utils/index";
import uuid from 'uuid';
import Immutable from 'immutable';
import {betStore, profileStore, socketStore} from "./index";


export default class BetStore {
    @observable roomInfo: Object = {};
    @observable playList: Object = {};
    @observable issueList: Array = [];
    @observable selectedBall: Array = [];
    @observable separateBall: Array = []; //separate selected ball
    @observable selectedContent: Array = [];
    @observable separateContent: Array = [];
    @observable curIssueInfo: Object = {};
    @observable orderInfo: Object = {};
    @observable betPanelStatus: Boolean = false;
    @observable activeTabIndex: Number = 0;
    @observable orderDetailStatus: Boolean = false;
    @observable orderInfoForDetail: Object = {};
    @observable betAmount: Number = 0;
    constructor(){
        this.heXiaoBZTotalRateSum = 0;
        this.orderInfoForDetail = {
            messageStatus: {
                position: ''
            },
            orderMessage: {
                betAmount: 0,
                betTotalAmount: 0,
                issueNo: '',
                menuName: ''
            },
            orderDetail: []
        };
        this.selectedMinLimit = 0;
    }

    @computed get orderCount () {
        const { meta, content } = this.playList[this.activeTabIndex];
        switch (meta) {
            case 'zhengMaGg':
                return `${this.selectedBall.length} 串 1`;
            case 'heXiao':
                return this.selectedBall.length >= 2 ? 1 : 0;
            case 'lianXiaoLianWei':
                return this.separateBall.length;
            default:
                if (!!content ){
                    return this.separateContent.length;
                } else {
                    return this.selectedBall.length;
                }
        }
    }
    @computed get betTotalAmount () {
        const { meta } = this.playList[this.activeTabIndex];
        if (meta === 'zhengMaGg') {
            return this.betAmount.toFixed(2)
        } else {
            return (this.orderCount * this.betAmount).toFixed(2)
        }
    }
    @computed get computedRate () {
        const { meta } = this.playList[this.activeTabIndex];
        if (meta === 'zhengMaGg') {
            return !!this.selectedBall.length ?
                (
                    this.selectedBall.map(elem => Number(elem.rate)).reduce((sum, rate) => sum * rate).toFixed(3)
                ) : '0.000'

        } else if (meta === 'heXiao') {
            const len = this.selectedBall.length;
            if (!len)   return '0.000';
            const selectedBallRateSum = this.selectedBall.map(elem => Number(elem.rate)).reduce((sum, rate) => sum + rate);
            if (this.selectedBall[0].subMenu === '中') {
                return (selectedBallRateSum/(len * len)).toFixed(3)
            } else {
                this.heXiaoBZTotalRateSum = this.getHeXiaoBZTotalRateSum();
                return ((this.heXiaoBZTotalRateSum - selectedBallRateSum)/((12 - len)*(12 - len))).toFixed(3);

            }
        }
    }
    @action showOrderDetail (messageListIndex) {
        const orderMessage = socketStore.messageList[messageListIndex];
        this.orderInfoForDetail = orderMessage;
        this.orderDetailStatus = true;
    }
    @action hideOrderDetail () {

        this.orderDetailStatus = false;
    }
    @action changeBetAmount (amount) {
        this.betAmount = parseFloat(amount);
    }
    @action cleanSelectedBall () {
        this.selectedBall = [];
        this.separateBall = [];
        this.selectedMinLimit = 0;
    }
    @action cleanSelectedContent () {
        this.selectedContent = [];
        this.separateContent =[];
        this.selectedMinLimit = 0;
    }

    isInclude (rateItem) {
        return this.selectedBall.filter(elem => elem.id === rateItem.id).length > 0
    }
    checkBalance (betAmount) {
        return betAmount > profileStore.userInfo.balance ? Promise.reject({message: '余额不足'}) : Promise.resolve();
    }
    //used in default
    @action selectBall (rateItem, minLimit) {
        const isInclude = this.isInclude(rateItem);
        if (isInclude) {
            this.selectedBall = this.selectedBall.filter(elem => elem.id !== rateItem.id);
        } else {
            this.selectedBall = [...this.selectedBall, rateItem];
        }
        if ( !minLimit ) return ;
        this.selectedMinLimit = minLimit;
        this.separateBall = arrayCombine(this.selectedBall, minLimit);
    }
    @action selectContent (rateItem, minLimit) {
        const isIncludeContent = this.selectedContent.includes(rateItem);
        if (isIncludeContent){
            this.selectedContent = this.selectedContent.filter(elem => elem !== rateItem);
        } else {
            this.selectedContent = [...this.selectedContent, rateItem];
        }
        if ( !minLimit ) return ;
        this.selectedMinLimit = minLimit;

        this.separateContent = arrayCombine(this.selectedContent, minLimit);
    }
    //used in lhc-hexiao
    selectBallByMenu (rateItem) {
        this.selectedBall = rateItem;
    }
    //used in zhengMaGg
    selectZhengMaGgBall (rateItem) {
        const isInclude = this.isInclude(rateItem);
        if (isInclude) {
            this.selectedBall = this.selectedBall.filter(elem => elem.id !== rateItem.id);
        } else {
            this.selectedBall = this.selectedBall.filter(elem => elem.groupName !== rateItem.groupName).concat(rateItem);
        }
    }
    // used in has content
    selectHasContentBall (rateItem) {
        this.selectedBall = [ rateItem ];
    }

    fetchPlayList () {
        const { lotteryId, roomId } = this.roomInfo;
        getPlayList({ lotteryId, roomId }).then((res) => {
            this.playList =  res;
        }).catch((err) => {
            console.log(err)
        })
    }

    submitBet () {
        const orderInfo = this.splitOrderMessage();
        const newMessage = socketStore.splitMessageForChat(Object.assign({type: 1}, orderInfo));
        this.betPanelStatus = false;

        this.sendBetOrder(orderInfo)
            .then((res) => {
                socketStore.updateMessageStatus(orderInfo.actId, true, res.list);
                newMessage.message.orderDetail = res.list;
                socketStore.sendSocketMessage(newMessage)
            })
            .then(() => profileStore.fetchUserInfo())
            .then(() => this.cleanSelectedBall())
            .then(() => this.cleanSelectedContent())
            .catch(err => {
                socketStore.updateMessageStatus(orderInfo.actId, false);
                errorHandle(err)
            })
    }
    splitOrderMessage () {
        const actId = uuid();
        const {issueNo} = this.curIssueInfo;
        const {meta } = this.playList[this.activeTabIndex];
        const {subMenu, tabMenu  } = this.selectedBall[0];
        let orderInfo = {
            actId,
            orderMessage: {
                menuName: !!subMenu ? `${tabMenu} ${subMenu}` : tabMenu,
                playType: this.selectedBall.map((elem, index) => {
                    return {
                        id: elem.id,
                        display: !!elem.groupName ? `${elem.groupName}-${elem.display}` : elem.display
                    }
                }),
                orderCount: this.orderCount,
                issueNo,
                betTotalAmount : meta === 'zhengMaGg' ?  this.betAmount : this.betAmount * this.orderCount,
                betAmount: this.betAmount,
                meta,
            }
        };
        if (this.selectedContent){
            orderInfo.orderMessage.content = this.selectedContent.join(',')
        }
        return orderInfo
    }
    sendBetOrder (orderMessage) {
        const {lotteryId, roomId} = this.roomInfo;
        const {issueNo} = this.curIssueInfo;
        const playId = this.selectedBall.map(elem => elem.id).join(',');
        const body = {
            actId: orderMessage.actId,
            lotteryId,
            roomId,
            issueNo,
            playId,
            betAmount: this.betAmount
        };
        if (!!this.selectedContent.length) {
            body.content = this.selectedContent.join(',');
        }
        return genBetOrderService(body)
    }

    //跟单操作
    sendBetFollowOrder(orderInfo) {
        const { orderMessage } = orderInfo;
        const {lotteryId, roomId} = this.roomInfo;
        const actId = uuid();
        const { userId, username, avatar, level } = profileStore.userInfo;
        const user = {userId, username, avatar, level};
        const messageStatus = {
            position: 'right',
            typeDesc: 'order',
            status: 'loading'
        };
        const body = {
            actId,
            lotteryId,
            roomId,
            issueNo: this.curIssueInfo.issueNo,
            playId: orderMessage.playType.map(elem => elem.id).join(','),
            betAmount: orderMessage.betAmount
        };
        if (!!orderMessage.content) {
            body.content = orderMessage.content;
        }
        socketStore.concatNewMessage({
            actId,
            user,
            orderMessage,
            messageStatus
        });
        genBetOrderService(body)
            .then((res) => {
                socketStore.updateMessageStatus(actId, true, res.list);
                socketStore.sendSocketMessage({
                    actId,
                    message: {
                        type: 1,
                        user,
                        messageStatus,
                        orderMessage,
                        orderDetail: res.list,
                    }
                })
               this.hideOrderDetail();
            })
            .then(() => profileStore.fetchUserInfo())
            .catch(err => {
                socketStore.updateMessageStatus(actId, false);
                this.hideOrderDetail();
                errorHandle(err)
            })

    }
    reSubmitBet (messageListIndex) {
        socketStore.messageList[messageListIndex].messageStatus.status = 'loading';
        socketStore.messageList[messageListIndex].orderMessage.issueNo = this.curIssueInfo.issueNo;
        // console.log('========reSubmitBet ========', socketStore.messageList[messageListIndex]);
        const { orderMessage, actId, user, messageStatus } = socketStore.messageList[messageListIndex];
        this.checkBalance(orderMessage.betTotalAmount)
            .then(() => {
                const {lotteryId, roomId} = this.roomInfo;
                const { betAmount, playType, issueNo } = orderMessage;
                return genBetOrderService({
                    actId,
                    lotteryId,
                    roomId,
                    issueNo,
                    playId: playType.map(elem => elem.id).join(','),
                    betAmount
                })
            })
            .then(res => {
                socketStore.updateMessageStatus(actId, true, res.list);
                socketStore.messageList[messageListIndex].orderDetail = res.list;
                socketStore.sendSocketMessage({
                    actId,
                    message: {
                        type: 1,
                        user,
                        messageStatus,
                        orderMessage,
                        orderDetail: res.list,
                    }
                })
            })
            .then(() => profileStore.fetchUserInfo())
            .catch(err => {
                socketStore.updateMessageStatus(actId, false);
                errorHandle(err)
            })
    }

    getHeXiaoBZTotalRateSum () {
        const heXiao =  this.playList.filter(item => item.meta ==='heXiao');
        if (heXiao.length > 0) {
            return heXiao[0]['menu']
                .filter(item => item.label === '不中')[0]['playType'][0]['rates']
                .map(item => Number(item.rate))
                .reduce((sum, item) => sum + item)
        }
    }

    @action getHistoryLotteryList (size=7) {
        issueListService({lotteryId: this.roomInfo.lotteryId, size}).then(res => {
            this.issueList = res.list;
        }).catch(err => {
            console.log('can not fetch issue list: ', err)
        })
    }
    @action clearIssueList () {
        this.issueList = []
    }

}

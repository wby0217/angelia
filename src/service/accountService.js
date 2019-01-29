import { post } from './request';
import api from '../config/api';

const host = api.host;
const member = api.member;
const agent = api.agent;

const getAccountRecord =(data) => post(`${host}${member.accountRecord}`, data);
const getRebateList =(data) => post(`${host}${member.rebateList}`, data);
const getOrderList =(data) => post(`${host}${member.orderList}`, data);
const getOrderDetail =(data) => post(`${host}${member.orderDetail}`, data);
const getRechargeList =(data) => post(`${host}${member.rechargeList}`, data);
const getWithdrawalsList =(data) => post(`${host}${member.withdrawalsList}`, data);
const getAgentIncomeList =(data) => post(`${host}${agent.agentIncome}`, data);
const getPrizeList = () => post(`${host}${member.prizeList}`);
const getDrawResult = () => post(`${host}${member.luckDraw}`);
const getLuckDrawRecord = (data) => post(`${host}${member.luckDrawRecord}`, data);
const addMember = (data) => post(`${host}${agent.addMember}`, data);
const getAgentShareUrl = (data) => post(`${host}${agent.agentShareUrl}`);


export default {
    getAccountRecord,
    getRebateList,
    getOrderList,
    getOrderDetail,
    getRechargeList,
    getWithdrawalsList,
    getAgentIncomeList,
    getPrizeList,
    getDrawResult,
    getLuckDrawRecord,
    addMember,
    getAgentShareUrl
}

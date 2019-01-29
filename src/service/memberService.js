import { post } from './request';
import api from '../config/api';
const host = api.host;
const member = api.member;

const sendCode = (data) => post(`${host}${member.sendCode}`, data);
const bindPhone = (data) => post(`${host}${member.bindPhone}`, data);

const setFundsPassword = (data) => post(`${host}${member.setFundsPassword}`, data);
const ModifyFundsPassword = (data) => post(`${host}${member.modifyFundsPassword}`, data);
const resetPassword = (data) => post(`${host}${member.resetPassword}`, data);
const modifyPassword = (data) => post(`${host}${member.modifyPassword}`, data);
const updMemberInfo = (data) => post(`${host}${member.updMemberInfo}`, data);
const withDraw = (data) => post(`${host}${member.withDraw}`, data);

async function getUserInfo () {
    try {
        const res = await post(`${host}${member.userInfo}`);
        storage.save({
            key: 'userInfo',
            data: {...res.data}
        });
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
}
async function restoreUserInfoFromStorage () {
    try {
        const result = await storage.load({key: 'userInfo'});
        return Promise.resolve(result);
    } catch (err) {
        try {
            const res = await getUserInfo();
            return Promise.resolve(res)
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.reject(err);
    }
}

async function updateMemberInfo (data) {
    try {
        const res = await post(`${host}${member.updateMemberInfo}`, data);
        storage.save({
            key: 'userInfo',
            data: {...res.data}
        });
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }

}

async function thirdPartyPerfectingInfo (data) {
    try {
        const res = await post(`${host}${member.thirdPartyPerfectingInfo}`, data);
        storage.save({
            key: 'userInfo',
            data: {...res.data}
        });
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
}

async function getUserBankCard () {
    try {
        const res = await post(`${host}${member.userBankCard}`);
        storage.save({
            key: 'userBankCard',
            data: {...res.data}
        })
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
};

async function addBankcard (data) {
    try {
        const res = await post(`${host}${member.addBankCard}`, data);
        storage.save({
            key: 'userBankCard',
            data: {...res.data}
        });
        return Promise.resolve(res);
    } catch (err) {
        return Promise.reject(err);
    }
}


async function restoreUserBankCardFromStorage () {
    try {
        const result = await storage.load({key: 'userBankCard'});
        return Promise.resolve(result);
    } catch (err) {
        //TODO Test
        try {
            const res = await getUserBankCard();
            return Promise.resolve(res)
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

async function getBankList () {
    try {
        const res = await post(`${host}${member.bankList}`);
        storage.save({
            key: 'bankList',
            data: {...res.data}
        })
        return Promise.resolve(res.data);
    } catch (err) {
        return Promise.reject(err);
    }
}

async function restoreBankListFromStorage () {
    try {
        const result = await storage.load({key: 'bankList'});
        return Promise.resolve(result);
    } catch (err) {
        try {
            const res = await getBankList();
            return Promise.resolve(res)
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default {
    sendCode,
    bindPhone,
    getUserInfo,
    setFundsPassword,
    ModifyFundsPassword,
    modifyPassword,
    resetPassword,
    getUserBankCard,
    restoreUserBankCardFromStorage,
    addBankcard,
    restoreUserInfoFromStorage,
    getBankList,
    restoreBankListFromStorage,
    updMemberInfo,
    updateMemberInfo,
    withDraw,
    thirdPartyPerfectingInfo
}
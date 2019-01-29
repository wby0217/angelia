import { lotteryCategory, getRechargeType, getSettings, getPayGroup } from './index'
import  memberService  from './memberService'

storage.sync = {
    lotteryCategory (params) {
        const { resolve, reject } = params;
        lotteryCategory()
        .then(ret => {
            storage.save({
                key: 'lotteryCategory',
                data: ret,
                expires: 1000*3600*24
            });
            resolve && resolve(ret);
        })
        .catch(err => {
            let message = '请求失败';
            if (err.message ) {
                if (err.message === 'Network request failed') {
                    message = '网络异常';
                } else {
                    message = err.message;
                }
            }
            reject && reject(new Error(message));
        })
    },
    getRechargeType (params) {
        // 存款类型 缓存
        const { resolve, reject } = params;
        getRechargeType()
        .then(ret => {
            storage.save({
                key: 'getRechargeType',
                data: ret,
                expires: 1000*3600*24
            });
            resolve && resolve(ret);
        })
        .catch(err => {
            let message = '请求失败';
            if (err.message ) {
                if (err.message === 'Network request failed') {
                    message = '网络异常';
                } else {
                    message = err.message;
                }
            }
            reject && reject(new Error(message));
        })
    },
    payGroup (params) {
        const { resolve, reject } = params;
        getPayGroup().then(res => {
            storage.save({
                key: 'payGroup',
                data: res.data,
                expires: 1000*3600*24
            });
            resolve && resolve(res.data);
        }).catch(err => {
            reject && reject(err)
        })
    },
    userInfo (params) {
        const { resolve, reject } = params;
        memberService.getUserInfo()
            .then(res => resolve && resolve(res))
            .catch(err => {reject && reject(err)})
    },
    appSettings (params) {
        const { resolve, reject } = params;
        getSettings().then(res => {
            storage.save({
                key: 'appSettings',
                data: res,
                expires: 1000*3600*24
            });
            resolve && resolve(res);
        }).catch(err => {
            let message = '请求失败';
            if (err.message ) {
                if (err.message === 'Network request failed') {
                    message = '网络异常';
                } else {
                    message = err.message;
                }
            }
            reject && reject(new Error(message));
        })
    }
};

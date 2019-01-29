import { post , get} from './request';
import config from '../config';
import api from '../config/api';

const host = api.host;
const agent = api.agent;
const wechatUri = api.wechat;
const wechat = config.wechat;


function saveUserInfo(res){
     storage.save({
        key: 'userInfo',  // 注意:请不要在key中使用_下划线符号!
        data: {
            ...res.data
        },
        expires: null
    });
}

export function cleanUserInfo () {
    storage.remove({key: 'userInfo'});
    storage.remove({key: 'authToken'});
    storage.remove({key: 'userBankCard'});
}

// function sendWeChatAuthRequest() {
//     //return WeChat.sendAuthRequest(wechat.userInfoScope, wechat.state)
// }

// function getWeChatAccessToken (res) {
//     const data = {
//         appid: wechat.appId,
//         secret: wechat.appSecret,
//         code: res.code,
//         grant_type: 'authorization_code'
//     };
//     return get(wechatUri.accessToken, data)
// }

// function getWeChatUserInfo (res) {
//     const data = {
//         access_token: res.access_token,
//         openid: res.openid
//     };
//     return get(wechatUri.userInfo, data)
// }

export function thirdSignIn (result, thirdType) {
    const data ={
        thirdTokenId: result.uid,
        thirdNickName: result.name && result.name.trim() ,
        thirdType: thirdType,
        thirdAvatar: result.iconurl,
    };
    const uri = host + api.thirdSignIn;
    return new Promise((resolve, reject) => {
        post(uri, data).then(res => {
            console.log('weChatSignIn======', res);
            saveUserInfo(res);
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

// export function requestWeChatLogin (thirdType) {
//     return WeChat.registerApp(wechat.appId)
//         .then(sendWeChatAuthRequest)
//         .then(getWeChatAccessToken)
//         .then(getWeChatUserInfo)
//         .then((res) => {return weChatSignIn(res, thirdType)})
//         .then(res => Promise.resolve(res))
//         .catch(err => {
//             err.message = err.errStr || err.errmsg;
//             return Promise.reject(err)
//         })
// }

export function register (data) {
    const uri = host + api.register;
    return new Promise((resolve, reject) => {
        post(uri, data).then(res => {
            saveUserInfo(res)
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}


export function signOut () {
    const uri = host + api.signOut;
    return post(uri).then(()=>{
        cleanUserInfo();
    });
}

export function signIn (data) {
    const uri = host + api.signIn;
    return new Promise((resolve, reject) => {
        post(uri, data).then(res => {
            saveUserInfo(res);
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}


export function agentRegister (data) {
    return new Promise((resolve, reject) => {
        post(`${host}${agent.registerAgent}`, data).then(res => {
            saveUserInfo(res);
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

export function checkIsLogin () {
    return new Promise ((resolve, reject) => {
        storage.load({key: 'authToken'})
            .then((res) => {
                resolve(res);
            }).catch(err => {
                err.routeName = 'Login';
                reject(err)
        });
    })

}

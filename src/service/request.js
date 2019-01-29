import api from '../config/api';
import config from '../config';
import { generateSignString } from '../utils';
import uuid from 'uuid';


const timeout = config.connect.fetchTimeOut;
function filterCode (res) {
    return res.code === 200  ? Promise.resolve(res) : Promise.reject(res);
}
function filterWeChatCode (res) {
    // errcode is wechat response value
    return !res.errcode || res.errcode == 0 ? Promise.resolve(res) : Promise.reject(res);
}

function filterJSON(res) {
    try{
        return res.json();
    }
    catch(e){
        return Promise.reject(e);
    }
}

function filterStatus(res) {
    if (res.ok) {
        return res;
    } else {
        return Promise.reject(res);
    }
}

function saveToken(res){
    const token = res.headers.get('auth-token');
    if (token){
        storage.save({
            key: 'authToken',  // 注意:请不要在key中使用_下划线符号!
            data: {
                token: token,
            }
        });
    }
    return res;
}

function timeoutFetch(ms, promise) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("请求超时"));
        }, ms);
        promise.then((res) => {
                clearTimeout(timer);
                resolve(res);
            }).catch((err) => {
                clearTimeout(timer);
                console.log(err);
                reject(err);
            });
    })
}

function request(uri, type='POST',  headers = {}, data = {}){
    let fetchOption = {
        method: type,
        headers: headers,
        credentials: 'include',
        mode: 'cors',
        cache: 'headers'
    };
    if(type === 'POST') {
      fetchOption.body = JSON.stringify(data);
    }
    return timeoutFetch(timeout, fetch(uri, fetchOption))
        .then(filterStatus)
        .then(saveToken)
        .then(filterJSON)
        .then(filterCode)

}

function weChatRequest(uri, type='GET',  headers = {}, data = {}) {
    let fetchOption = {
        method: type,
        headers: headers,
        credentials: 'include',
        mode: 'cors',
        cache: 'headers'
    };
    if(type === 'POST') {
        fetchOption.body = JSON.stringify(data);
    }
    return timeoutFetch(timeout, fetch(uri, fetchOption))
        .then(filterStatus)
        .then(saveToken)
        .then(filterJSON)
        .then(filterWeChatCode)
}

export async function post(uri, data = {}, headers = {}) {
    const nonce = uuid.v4();
    const params = Object.assign({nonce}, data);
    headers['Sign'] = generateSignString(params);

    if( !headers['Content-type'] ) {
        headers['Content-type'] = 'application/json; charset=utf-8';
    }
    if (!headers['Accept']) {
        headers['Accept'] = 'application/json';
    }
    try {
        const value = await storage.load({key: 'authToken'});
        if ( value !== null) {
            headers['Auth-token'] = value.token;
        }
    } catch (err) {
        console.log(err);
    }
    console.log(uri);
    return request(uri, "POST", headers, params);
}

export async function get(uri, data = {}, headers = {}) {
    if (data) {
        let dataArray = [];
        Object.keys(data).forEach(key => dataArray.push(key + '=' + encodeURIComponent(data[key])))
        if (uri.search(/\?/) === -1) {
            uri += '?' + dataArray.join('&')
        } else {
            uri += '&' + dataArray.join('&')
        }
    }
    console.log(uri);
    return weChatRequest(uri, "GET", headers);
}

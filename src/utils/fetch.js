/**
 * create2017-03-28
 * by wm20111003@gmail.com
 * fetch 针对RN项目进行二次封装
 */
import _ from 'lodash';
import Api from '../config/api';

const host = Api.host;
/**
 * @param url | req | timeout
 *  url string
 *  req  object
 *  timeout number
 *
 *  GET和HEAD请求不能存在body
 *  GET和HEAD一样,但HEAD中包涵头部信息
 */
const myHeaders = new Headers();
// myHeaders.append('X-Custom-Header', 'ProcessThisImmediately');
const httpFetch = {
    getJSON() {
        return _fetchConversion(arguments, METHOD.GET, dataType.JSON);
    },
    getIMG() {
        return _fetchConversion(arguments, METHOD.GET, dataType.blob);
    },
    getTEXT() {
        return _fetchConversion(arguments, METHOD.GET, dataType.TEXT);
    },
    getVIDEO() {
        return _fetchConversion(arguments, METHOD.GET.dataType.ARRAYBUFF);
    },
    getFormData() {
        return _fetchConversion(arguments, METHOD.GET, dataType.FORMDATA);
    },
    post() {
        // myHeaders.append('Content-type', 'application/json;charset=utf-8');
        return _fetchConversion(arguments, METHOD.POST, dataType.JSON);
    },
    put() {
        // myHeaders.append('Content-type', 'application/json;charset=utf-8');
        return _fetchConversion(arguments, METHOD.PUT, dataType.JSON);
    },
    delete() {
        // myHeaders.append('Content-type', 'application/json;charset=utf-8');
        return _fetchConversion(arguments, METHOD.DELETE, dataType.JSON);
    }
};
const dataType = {
    TEXT(res) {
        return res.text();
    },
    JSON(res) {
        return res.json();
    },
    BLOB(res) {
        return res.blob();
    },
    ARRAYBUFF(res) {
        return res.arrayBuffer();
    },
    FORMDATA(res) {
        return res.formData();
    }
};
const METHOD = {
    'POST': 'POST',
    'GET': 'GET',
    'PUT': 'PUT',
    'DELETE': 'DELETE',
    'PATCH': 'PATCH'
};
// 模拟实现   fetch timeout
const _fetchAbort = (fetchPromise, timeout = 30000) => {
    let abortFn = null;
      // 这是一个可以被reject的promise
    const abortPromise = new Promise((resolve, reject) => {
        abortFn = () => reject('timeout');
    });
      // 这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
    const abortablePromise = Promise.race([
        fetchPromise,
        abortPromise
    ]);
    setTimeout(() => {
        abortFn();
    }, timeout);
    return abortablePromise;
};
// 将参数拼接到url上面
const toNewUrl = (url, body) => {
    const arr = [];
    _.isObject(body) && _.forEach(body, (n, k) => {
        arr.push(k.concat('=', n));
    });
    const str = arr.join('&');
    return (url.indexOf('?') > 0) ? url.concat('&', str) : url.concat('?', str);
};
// 参数转换函数
let _fetchConversion = (params, method, resType) => {
  // argument中第一次参数约定为 string  url  第二个参数 object 传入request
    const _form = new FormData();// _form._parts
    const args = Array.prototype.slice.call(params);
    let url = '';
    let req = {};
    let timeout;
    args.length && _(args).forEach((n) => {
        _.isString(n) && (url = n);
        _.isObject(n) && (req = n);
        _.isNumber(n) && (timeout = n);
    });
    if (method === 'GET' && req && req.body) {
        // myHeaders.append('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        url = toNewUrl(url || req.url, req.body);
        delete req.body;
    } else {
        // myHeaders.append('Content-type', 'text/plain;charset=UTF-8');
        if (req && req.body && _.isObject(req.body)) {
            _.map(req.body, (value, key) => {
                _form.append(key, value);
            });
        }
        delete req.body;
    }
    if (req && req.token) {
        myHeaders.append('Auth-Token', req.token);
    }
    req && req.url && (req.url = host.concat(req.url));
    url && (url = host.concat(url));
    req = new Request(url, _.assign({ credentials: 'include', mode: 'cors', cache: 'headers', headers: myHeaders }, req && req, _form._parts.length && { body: _form }, url && { url }, method && { method }));
    return _fetchAbort(fetch(req), timeout).then(resType);
};

export const toLoginOrReg = (url, params) => new Promise((resolve, reject) => {
    url = host.concat(url);
    let token = '';
    fetch(url, { method: 'POST', body: params })
    .then(res => {
        token = res.headers.get('Auth-Token');
        return res.json();
    })
    .then(json => { resolve(Object.assign({}, json, { token })); })
    .catch(err => reject(err));
});

export default httpFetch;

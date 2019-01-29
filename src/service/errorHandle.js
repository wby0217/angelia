import { showToast } from '../utils';
import { cleanUserInfo } from "./authService";
import networkTool from "../utils/netWorkTool";

export default function errorHandle (err) {
    const networkError  =  err.status === 403 || err.status === 404  || err.status === 500 ;
    return new Promise((resolve) => {
        if (!err.code) {
            if (networkError || (err.message && err.message === 'Network request failed')){
                err.network = 'error';
                showToast(networkTool.NOT_NETWORK);
                return resolve(err);
            }
            if (err.name && err.name === 'NotFoundError') {
                return resolve(err);
            }
            if (err.name && err.name === 'SyntaxError') {
                showToast('服务器出现问题，请稍后再试！');
                return resolve(err);
            }
            showToast(err.message);
            return resolve(err);
        };
        if ((err.code >= 101000 && err.code <= 101003) || err.code === 101021) {
            showToast(err.message, {
                onHide: () => {
                    cleanUserInfo();
                    resolve({routeName: 'Login'});
                }
            })
        } else {
            showToast(err.message, {
                onHide: () => {
                    resolve(err);
                }
            })
        }
    })
};

export const defaultErrorHandle = (err) => {
    const networkError  =  err.status === 403 || err.status === 404  || err.status === 500 ;
    if (networkError || (err.message && err.message === 'Network request' +
            ' failed')){
        err.network = 'error';
        return Promise.resolve(err);
    }
};
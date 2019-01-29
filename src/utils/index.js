import Toast from 'react-native-root-toast';
import HttpFetch from './fetch';
import CacheStorage from './cacheStorage';
import verification from './verification';
import Alert from './alert';
import config from '../config'
const md5 = require('md5');

const formatPhone = (phone) => {
    return phone.substr(0, 3) + '****' + phone.substr(7, 11);
}

const formatBankCardNo = (bankCardNo) => {
    if (!bankCardNo) return '';
    return bankCardNo.replace(/(\d{4})(?=\d)/g, "$1 ");

};
const precision = 2;
function formatPrecision(value) {
    var result = parseFloat(value).toFixed(precision);
    return result;
}
const formatAmount = (value) => {
    var valueStr = value.toString();
    if (valueStr && valueStr === '') {
        return '0.00';
    } else {
        if (valueStr.split('.').length < 2) {
            return formatPrecision(value);
        }
        else {
            if (valueStr.split('.')[1].length > precision) {
                return formatPrecision(value * 10);
            }
            if (valueStr.split('.')[1].length < precision) {
                return formatPrecision(value / 10);
            }
            if (valueStr.split('.')[1].length === precision) {
                return formatPrecision(value);
            }
        }
    }
}

const showToast = (error, options) => {
    const message = typeof(error) === 'object' ? error.message : error;
    return Toast.show(message,
        Object.assign({duration: 500, position: Toast.positions.CENTER}, options));
};

const filterBankById = (bankList, id) => {
    let bankName = '';
     bankList.some((elem) => {
         if (elem.id === id) {
             bankName = elem.bankName;
             return true;
         }
    })
    return bankName;
};

const sortObj = (obj) => {
    let sortKeys = Object.keys(obj).sort();
    let newObj = {};
    for (let key of sortKeys) {
        let val = obj[key]
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                newObj[key] = sortArray(val)
            } else if (!Array.isArray(val) && Object.keys(val).length > 0) {
                newObj[key] = sortObj(val)
            } else {
                newObj[key] = val
            }
        } else {
            newObj[key] = val
        }
    }
    return newObj
}

const sortArray = (arr) => {
    let newArr = []
    for (let i = 0; i < arr.length; i++) {
        let val = arr[i]
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                newArr[i] =  sortArray(val)
            } else if (Object.keys(val).length > 0) {
                newArr[i] = sortObj(val)
            } else {
                newArr[i] = val
            }
        } else {
            newArr[i] = val
        }
    }

    return newArr
}

const generateSignString = (data) => {
    let content = sortObj(Object.assign({}, data))
    let keys = Object.keys(content).sort()
    let newArr = []
    for (let key of keys) {
        let val = content[key]
        if(val !== undefined && val !== null && val !== ''){
            if (typeof val === 'object') {
                val = JSON.stringify(val)
            }
            newArr.push(`${key}=${val}`)
        }
    }
    let contentStr = newArr.join('&');
    contentStr += config.sign;
    return md5(contentStr)
};

// 组合排列 算法，用于拆单

const arrayCombine = (targetArr, n) => {
    const len = targetArr.length;
    if (!len || len < n) return [];
    if (len === n) return [targetArr];
    const flatArr  = getFlatArr(len, n);
    let resultArr = [];
    flatArr.forEach((item) => {
        const tempArr = [];
        item.forEach((subItem, subIndex) => {
            subItem === 1 && tempArr.push(targetArr[subIndex]);
        });
        resultArr.push(tempArr);
    });
    return resultArr;
};

const getFlatArr = (m, n) => {
    let flagArr = Array.from({length: m}, (item, index) => index < n ? 1 : 0);
    let resultArr = [flagArr.concat()];
    let isEnd = false;

    while (!isEnd) {
        let leftCount = 0;
        for (i = 0; i < m - 1; i++) {
            if (flagArr[i] === 1 && flagArr[i+1] === 0) {
                for(j = 0; j < i; j++) {
                    flagArr[j] = j < leftCount ? 1 : 0;
                }
                flagArr[i] = 0;
                flagArr[i+1] = 1;
                const tempArr = flagArr.concat();
                resultArr.push(tempArr);
                if(!flagArr.slice(-n).includes(0)) {
                    isEnd = true;
                }
                break;
            }
            flagArr[i] === 1 && leftCount++;
        }
    }
    return resultArr;
};




export {
    HttpFetch,
    CacheStorage,
    verification,
    formatPhone,
    showToast,
    filterBankById,
    formatBankCardNo,
    formatAmount,
    Alert,
    generateSignString,
    arrayCombine
};
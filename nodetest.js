"use strict";
var dateFormat = require('dateformat');
var now = new Date();
var genVersion = require('./updateLog');

const initVersionInfo = {
    version: 'V1.0.0',
    updateTime: dateFormat(now, "yyyy-mm-dd HH:MM:ss"),
    updateContent: '这个人很懒,没有任何备注~'
}
const questions = [
    {
        type: 'input',
        name: 'remark',
        message: '请输入更新简要:',
        validate: (value) => {
            if(value) {
                return true;
            } else {
                return '请留下备注信息~'
            }
        }
    }
];
genVersion(initVersionInfo, 'ios');

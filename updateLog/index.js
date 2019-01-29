
// codepush后生成新的版本日志
const fs = require('fs');
const path = require('path');
module.exports = function (data, platform)  {
    const logFilePath = path.resolve(__dirname, `log.${platform}.json`);
    if(fs.existsSync(logFilePath)) {
        const app = fs.readFileSync(logFilePath, 'utf8');
        let newArr = JSON.parse(app);
        const newVersion = incrementHandle(newArr[0].version);
        data.version = newVersion;
        if(newArr.length > 9) {newArr = newArr.slice(0, 10)}
        // 只保存log最近的10条记录
        newArr.unshift(data)
        fs.writeFile(logFilePath, JSON.stringify(newArr, null, 4), (err) => {
            if(err) throw err;
            console.log(`======${platform}=====log写入成功=========`, newVersion)
        })
        // app.push(data)
    } else {
        var arr = [];
        arr.push(data);
        fs.writeFile(logFilePath,JSON.stringify(arr, null, 4) , (err) => {
            if(err) throw err;
            console.log('===========log文件已生成=========')
        })
    }
}

// 根据出入版本号自增版本
const incrementHandle = (version) => {
    if(/^V/.test(version)) {
        const newVersion = version.replace(/V/,'');
        const versionCharArr = newVersion.split('.');
        let digits = parseInt(versionCharArr[versionCharArr.length - 1]) + 1;
        let tens = parseInt(versionCharArr[1]);
        let hundreds =  parseInt(versionCharArr[0]);
        if(digits >= 10) {
            tens ++;
            digits = 0;
        } else if(tens >= 10) {
            hundreds ++;
            tens = 0;
        }
        return `V${hundreds}.${tens}.${digits}`;
    } else {
        console.log('请检查版本号是否有关键字母V！');
        return null;
    }
}
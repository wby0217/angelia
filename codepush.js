var dateFormat = require('dateformat');
const { execSync } = require("child_process")
var genVersion = require('./updateLog');

const apps = [
  {
    name: 'wancai',
    user: 'lotteryChat',
    config: 'wancai',
    app_android: 'wc-android',
    app_ios: 'wc-ios',
    version_android: '1.0.0',
    version_ios: '1.0.0',
  },
  {
    name: 'develop',
    user: 'lotteryChat',
    config: 'develop',
    app_android: 'develop-android',
    app_ios: 'develop-ios',
    version_android: '1.0.0',
    version_ios: '1.0.0',
  }
]

const codepush = {
  lotteryChat: {
    email: 'lotteryChat@kosun.com',
    key: 'ZbHmLinHA1BnBb0VjpN7hsirjIhK8ksvOPxlc'
  }
}
const initVersionInfo = {
  version: 'V1.0.0',
  updateTime: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
  updateContent: '这个人很懒,没有任何备注~'
}

let log = 'codepush start!'
console.log(log)

let params = process.argv
let platform = 'all'
let appName = null
let deployment = 'Production'
if (params[2]) {
  platform = params[2]
}
if (params[4]) {
  deployment = params[4]
}

const doPush = (app) => {
  console.log(`=================== ${app.name} ${platform} start ===================`);

  // execSync(`cp -f scripts/config/${app.config}/* src/config/`, {stdio: [0, 1, 2]})

  try {
    execSync('code-push logout', {stdio: [0, 1, 2]})
  } catch (e) {
    console.log(e.toString());
  } finally {
    execSync(`code-push login http://api.codepush.cc --accessKey ${codepush[app.user].key}`, {stdio: [0, 1, 2]})
  }
  try {
    execSync(`code-push release-react ${app['app_' + platform]} ${platform} -d ${deployment} -t ${app['version_' + platform]}`, {stdio: [0, 1, 2]})
  } catch (e) {
    console.log(e.toString())
  } finally {
    console.log(`=================== ${app.name} ${platform} end ===================`);
  }
}

if (params[3]) {
  appName = params[3]
  let app = apps.filter(n => n.name === appName)[0]
  if (!app) {
    console.log('Please enter the correct application name')
  } else {
    console.log(app.name);
    doPush(app)
    genVersion(initVersionInfo, platform)
  }
} else {
  if (platform == 'all') {
    let platforms = ['ios', 'android']
    for (let pf of platforms) {
      platform = pf
      genVersion(initVersionInfo, platform)
      for (let app of apps) {
        doPush(app)
      }
    }
  } else {
    for (let app of apps) {
      doPush(app)
    }
  }
}

log = 'codepush end!'
console.log(log)

import JPushModule from 'jpush-react-native';export const pushEvent = () => {    JPushModule.addReceiveNotificationListener((map) => {        console.log("alertContent: " + map.alertContent);        console.log("extras: " + map.extras);        // var extra = JSON.parse(map.extras);        // console.log(extra.key + ": " + extra.value);    });}export const pushEventListener = () => {    JPushModule.addReceiveOpenNotificationListener((map) => {        console.log("Opening notification!");        console.log("map.extra: " + map.key);    });}
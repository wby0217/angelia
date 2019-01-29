//
//  AppDelegate+Service.m
//  BasicShell
//
//  Created by Mike on 29/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "AppDelegate+Service.h"
#import "AppConfigurationModule.h"

@implementation AppDelegate (Service)

- (void)configService {
  AppConfigurationModule *config = [AppConfigurationModule sharedInstance];
  NSString *umengAppKey = config.umengAppKey;
  NSString *jpushAppKey = config.jpushAppKey;
  NSString *channelId   = config.channelId;
  if (umengAppKey.length>0) {
    [self configUmengWithAppKey:umengAppKey andChannel:channelId];
  }
  if (jpushAppKey.length>0) {
    [self configJpushWithAppKey:jpushAppKey andChannel:channelId];
  }
}

- (void)configUmengWithAppKey:(NSString *)appKey andChannel:(NSString *)channel {
    SEL sel = NSSelectorFromString(@"setWraperType:wrapperVersion:");
    if ([UMConfigure respondsToSelector:sel]) {
        [UMConfigure performSelector:sel withObject:@"react-native" withObject:@"1.0"];
    }
    [UMConfigure initWithAppkey:appKey channel:channel];
    
#ifdef DEBUG
    [UMConfigure setLogEnabled:YES];
#endif
    [MobClick setScenarioType:E_UM_NORMAL];
    [UMPushModule registerWithLaunchOptions:self.launchOptions];
    [self configUSharePlatforms];
    
    [UMErrorCatch initErrorCatch];
}

// TODO: 配置分享
- (void)configUSharePlatforms {
    AppConfigurationModule *config = [AppConfigurationModule sharedInstance];
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession
                                          appKey:config.socialWechatAppId
                                       appSecret:config.socialWechatAppSecret
                                     redirectURL:nil];
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ
                                          appKey:config.socialQQAppId
                                       appSecret:config.socialWechatAppSecret
                                     redirectURL:config.socialQQAppCallback];
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:config.socialSinaWeiboAppId
                                       appSecret:config.socialSinaWeiboAppSecret
                                     redirectURL:config.socialSinaWeiboAppCallback];
}

- (void)configJpushWithAppKey:(NSString *)appKey andChannel:(NSString *)channel {
    JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
    entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound;
    [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
    [JPUSHService setupWithOption:self.launchOptions appKey:appKey
                          channel:channel apsForProduction:true];
}

#pragma mark - 处理推送

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [UMPushModule application:application didRegisterDeviceToken:deviceToken];
    [JPUSHService registerDeviceToken:deviceToken];
}

//iOS 7 Remote Notification
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler {
    [UMPushModule application:application didReceiveRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    [UMPushModule application:application didReceiveRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
    [UMPushModule application:application didReceiveRemoteNotification:notification.userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:notification.userInfo];
}

#pragma mark - 处理极光推送

- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
    NSDictionary * userInfo = notification.request.content.userInfo;
    if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        [JPUSHService handleRemoteNotification:userInfo];
        [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
    }
    completionHandler(UNNotificationPresentationOptionAlert);
}

- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
    NSDictionary * userInfo = response.notification.request.content.userInfo;
    if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        [JPUSHService handleRemoteNotification:userInfo];
        [[NSNotificationCenter defaultCenter] postNotificationName:kJPFOpenNotification object:userInfo];
    }
    completionHandler();
}

#pragma mark - 处理友盟推送


#pragma mark - 处理跳转

// ios 8.x or older
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
    //6.3的新的API调用，是为了兼容国外平台(例如:新版facebookSDK,VK等)的调用[如果用6.2的api调用会没有回调],对国内平台没有影响
    BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url sourceApplication:sourceApplication annotation:annotation];
    if (!result) {
        // 其他如支付等SDK的回调
    }
    return [RCTLinkingManager application:application openURL:url
                        sourceApplication:sourceApplication annotation:annotation];
}

// ios 9.0+
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
            options:(NSDictionary<NSString*, id> *)options
{
    //6.3的新的API调用，是为了兼容国外平台(例如:新版facebookSDK,VK等)的调用[如果用6.2的api调用会没有回调],对国内平台没有影响
    BOOL result = [[UMSocialManager defaultManager]  handleOpenURL:url options:options];
    if (!result) {
        // 其他如支付等SDK的回调
    }
    return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
    BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url];
    if (!result) {
        // 其他如支付等SDK的回调
    }
    return [RCTLinkingManager application:application openURL:url options:nil];
}

@end

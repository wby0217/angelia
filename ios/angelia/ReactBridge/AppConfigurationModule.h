//
//  AppConfigurationModule.h
//  angelia
//
//  Created by Mike on 05/12/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface AppConfigurationModule : NSObject <RCTBridgeModule>

+ (instancetype)sharedInstance;

@property (nonatomic, strong) NSString *apiServer;
@property (nonatomic, strong) NSString *channelId;
@property (nonatomic, strong) NSString *umengAppKey;
@property (nonatomic, strong) NSString *jpushAppKey;

@property (nonatomic, strong) NSString *codePushKey;
@property (nonatomic, strong) NSString *codePushServerURL;
@property (nonatomic, strong) NSString *codePushAppVersion;

@property (nonatomic, strong) NSString *socialWechatAppId;
@property (nonatomic, strong) NSString *socialWechatAppSecret;

@property (nonatomic, strong) NSString *socialQQAppId;
@property (nonatomic, strong) NSString *socialQQAppSecret;
@property (nonatomic, strong) NSString *socialQQAppCallback;

@property (nonatomic, strong) NSString *socialSinaWeiboAppId;
@property (nonatomic, strong) NSString *socialSinaWeiboAppSecret;
@property (nonatomic, strong) NSString *socialSinaWeiboAppCallback;

@end

//
//  ConfigurationKeys.m
//  angelia
//
//  Created by Mike on 05/12/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "AppConfigurationModule.h"
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <sys/utsname.h>

@implementation AppConfigurationModule

RCT_EXPORT_MODULE();

- (NSDictionary<NSString *, id> *)constantsToExport {
    AppConfigurationModule *keys = [AppConfigurationModule sharedInstance];
    return @{@"apiServer":keys.apiServer,
             @"channel":keys.channelId,
             @"umengAppKey":keys.umengAppKey,
             @"jpushAppKey":keys.jpushAppKey,
             @"codePushKey":keys.codePushKey,
             @"codePushServerURL":keys.codePushServerURL,
             @"socialWechatAppId":keys.socialWechatAppId,
             @"socialWechatAppSecret":keys.socialWechatAppSecret,
             @"socialQQAppId":keys.socialQQAppId,
             @"socialQQAppSecret":keys.socialQQAppSecret,
             @"socialQQAppCallback":keys.socialQQAppCallback,
             @"socialSinaWeiboAppId":keys.socialSinaWeiboAppId,
             @"socialSinaWeiboAppSecret":keys.socialSinaWeiboAppSecret,
             @"socialSinaWeiboAppCallback":keys.socialSinaWeiboAppCallback,
             @"deviceModel":[self deviceModel] // @"iPhone10,3" -> @"iPhone X (CDMA)"  @"iPhone10,6" -> @"iPhone X (GSM)"
             };
}

- (NSString *)deviceModel {
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString *deviceModel = [NSString stringWithCString:systemInfo.machine
                                               encoding:NSUTF8StringEncoding];
    return deviceModel;
}

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    static AppConfigurationModule *keys;
    dispatch_once(&onceToken, ^{
        keys = [[AppConfigurationModule alloc] init];
    });
    return keys;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
#ifdef DEBUG
        self.apiServer   = @"https://api.wc.kosun.net";
        self.channelId     = @"test";
        self.umengAppKey = @"5a3bbe388f4a9d0a350002be";
        self.jpushAppKey = @"b3f940c3bbc1f7759afc602f";

        self.codePushKey        = @"mVrBpflNHnfN8DVDIsfkPJJWJjhg4ksvOXqog";
        self.codePushServerURL  = @"http://api.codepush.cc/";
        self.codePushAppVersion = @"1.0.0";

        self.socialWechatAppId     = @"wx9ac888ff8ba6a7a2";
        self.socialWechatAppSecret = @"7c56e1a631cd048f002ab4fff7ed109d";

        self.socialQQAppId       = @"";
        self.socialQQAppSecret   = @"";
        self.socialQQAppCallback = @"";

        self.socialSinaWeiboAppId       = @"";
        self.socialSinaWeiboAppSecret   = @"";
        self.socialSinaWeiboAppCallback = @"";
#else
        self.apiServer   = @"todo-apiServer";
        self.channelId     = @"todo-channel";
        self.umengAppKey = @"todo-umengAppKey";
        self.jpushAppKey = @"todo-jpushAppKey";

        self.codePushKey        = @"todo-codePushKey";
        self.codePushServerURL  = @"todo-codePushServerURL";
        self.codePushAppVersion = @"1.0.0";

        self.socialWechatAppId     = @"todo-socialWechatAppId";
        self.socialWechatAppSecret = @"todo-socialWechatAppSecret";

        self.socialQQAppId       = @"todo-socialQQAppId";
        self.socialQQAppSecret   = @"todo-socialQQAppSecret";
        self.socialQQAppCallback = @"todo-socialQQAppCallback";

        self.socialSinaWeiboAppId       = @"todo-socialSinaWeiboAppId";
        self.socialSinaWeiboAppSecret   = @"todo-socialSinaWeiboAppSecret";
        self.socialSinaWeiboAppCallback = @"todo-socialSinaWeiboAppCallback";
#endif
    }
    return self;
}

@end

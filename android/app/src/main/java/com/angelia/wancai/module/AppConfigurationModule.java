package com.angelia.wancai.module;

import com.angelia.wancai.MainApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public class AppConfigurationModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext context;

    public AppConfigurationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "AppConfigurationModule";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("apiServer", MainApplication.getAppConfiguration().apiServer);
        constants.put("codePushKey", MainApplication.getAppConfiguration().codepushKey);
        constants.put("codePushServerUrl", MainApplication.getAppConfiguration().codepushServerUrl);
        constants.put("channel", MainApplication.getAppConfiguration().channel);
        constants.put("umengAppKey", MainApplication.getAppConfiguration().umengAppKey);
        constants.put("umengAppSecret", MainApplication.getAppConfiguration().umengAppSecret);
        constants.put("jpushAppKey", MainApplication.getAppConfiguration().jpushAppKey);
        // keys
        constants.put("socialWechatAppId", MainApplication.getAppConfiguration().socialWechatAppId);
        constants.put("socialWechatAppSecret", MainApplication.getAppConfiguration().socialWechatAppSecret);
        constants.put("socialQQAppId", MainApplication.getAppConfiguration().socialQQAppId);
        constants.put("socialQQAppSecret", MainApplication.getAppConfiguration().socialQQAppSecret);
        constants.put("socialQQAppCallback", MainApplication.getAppConfiguration().socialQQAppCallback);
        constants.put("socialSinaWeiboAppId", MainApplication.getAppConfiguration().socialSinaWeiboAppId);
        constants.put("socialSinaWeiboAppSecret", MainApplication.getAppConfiguration().socialSinaWeiboAppSecret);
        constants.put("socialSinaWeiboAppCallback", MainApplication.getAppConfiguration().socialSinaWeiboAppCallback);
        return constants;
    }
}

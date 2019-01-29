package com.angelia.wancai;

import android.text.TextUtils;

import com.BV.LinearGradient.LinearGradientPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.angelia.wancai.entity.AppConfiguration;
import com.angelia.wancai.module.AppPackage;
import com.angelia.wancai.umeng.DplusReactPackage;
import com.angelia.wancai.umeng.RNUMConfigure;
import com.angelia.wancai.umeng.UMengPushApplication;
import com.angelia.wancai.utils.AppConfigurationUtils;
import com.angelia.wancai.utils.ObjectUtils;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
import com.meituan.android.walle.WalleChannelReader;
import com.microsoft.codepush.react.CodePush;
import com.oblador.vectoricons.VectorIconsPackage;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.error.UMErrorCatch;
import com.umeng.socialize.PlatformConfig;
import com.umeng.socialize.UMShareAPI;

import java.util.Arrays;
import java.util.List;

import cn.jpush.android.api.JPushInterface;
import cn.jpush.reactnativejpush.JPushPackage;

public class MainApplication extends UMengPushApplication implements ReactApplication {

    private static MainApplication sMainApplication;

    private AppConfiguration appConfiguration;
    private CodePush codePush;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNFetchBlobPackage(),
                    new ImagePickerPackage(),
                    new LinearGradientPackage(),
                    new VectorIconsPackage(),
                    new JPushPackage(true, true),
                    new DplusReactPackage(),
                    new AppPackage(),
                    codePush
            );
        }

        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);

        this.sMainApplication = this;
        config();
        AppConfigurationUtils.resetConfigurationFromServer(this);
    }

    public static MainApplication getMainApplication() {
        return sMainApplication;
    }

    public static AppConfiguration getAppConfiguration() {
        return sMainApplication.appConfiguration;
    }

    public void config() {
        appConfiguration = ObjectUtils.readObject(this, Constants.APP_CONFIGURATION);
        if (appConfiguration == null) {
            appConfiguration = getLocalAppConfig();
        }
        configCodepush();
        configUmeng();
        configJPush();
    }

    private void configUmeng() {
        UMConfigure.setLogEnabled(BuildConfig.DEBUG);
        //初始化组件化基础库, 统计SDK/推送SDK/分享SDK都必须调用此初始化接口
        RNUMConfigure.init(this, appConfiguration.umengAppKey, appConfiguration.channel, UMConfigure.DEVICE_TYPE_PHONE,
                appConfiguration.umengAppSecret);
        PlatformConfig.setWeixin(appConfiguration.socialWechatAppId, appConfiguration.socialWechatAppSecret);
        PlatformConfig.setSinaWeibo(appConfiguration.socialSinaWeiboAppId, appConfiguration.socialSinaWeiboAppSecret, appConfiguration.socialSinaWeiboAppCallback);
        PlatformConfig.setQQZone(appConfiguration.socialQQAppId, appConfiguration.socialQQAppSecret);
        initPush();
        UMShareAPI.get(this);
        UMErrorCatch.init();
    }

    private void configCodepush() {
        String codepushServerUrl = appConfiguration.codepushServerUrl;
        String codepushKey = appConfiguration.codepushKey;
        CodePush.overrideAppVersion(appConfiguration.codepushAppVersion);

        if (TextUtils.isEmpty(codepushServerUrl)) {
            codePush = new CodePush(codepushKey, getApplicationContext(), BuildConfig.DEBUG);
        } else {
            codePush = new CodePush(codepushKey, getApplicationContext(), BuildConfig.DEBUG, codepushServerUrl);
        }
    }

    private void configJPush() {
        // modify meta data through hook
        JPushInterface.init(this);
    }

    private AppConfiguration getLocalAppConfig() {
        AppConfiguration configuration = new AppConfiguration();
        String channel = WalleChannelReader.getChannel(this);
        configuration.channel = TextUtils.isEmpty(channel) ? BuildConfig.APP_CHANNEL : channel;
        configuration.umengAppKey = BuildConfig.UMENG_APPKEY;
        configuration.umengAppSecret = BuildConfig.UMENG_MESSAGE_SECRET;
        configuration.codepushKey = BuildConfig.CODE_PUSH_KEY;
        configuration.codepushServerUrl = BuildConfig.CODE_PUSH_SERVER_URL;
        configuration.jpushAppKey = BuildConfig.JPUSH_APPKEY;
        configuration.apiServer = BuildConfig.API_SERVER;
        configuration.socialWechatAppId = BuildConfig.WECHAT_APP_ID;
        configuration.socialWechatAppSecret = BuildConfig.WECHAT_APP_SECRET;
        configuration.socialQQAppId = BuildConfig.QQ_APP_ID;
        configuration.socialQQAppSecret = BuildConfig.QQ_APP_SECRET;
        configuration.socialQQAppCallback = BuildConfig.QQ_APP_CALLBACK;
        configuration.socialSinaWeiboAppId = BuildConfig.SINA_APP_ID;
        configuration.socialSinaWeiboAppSecret = BuildConfig.SINA_APP_SECRET;
        configuration.socialSinaWeiboAppCallback = BuildConfig.SINA_APP_CALLBACK;
        return configuration;
    }
}

package com.angelia.wancai.entity;

import java.io.Serializable;

public class AppConfiguration implements Serializable {

    public String umengAppKey;
    public String umengAppSecret;
    public String codepushKey;
    public String codepushAppVersion = "1.0.0";
    public String codepushServerUrl;
    public String channel;
    public String jpushAppKey;

    public String socialWechatAppId;
    public String socialWechatAppSecret;
    public String socialQQAppId;
    public String socialQQAppSecret;
    public String socialQQAppCallback;
    public String socialSinaWeiboAppId;
    public String socialSinaWeiboAppSecret;
    public String socialSinaWeiboAppCallback;

    public String apiServer;
}

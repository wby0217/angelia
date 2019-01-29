package com.angelia.wancai.utils;

import android.content.Context;
import android.text.TextUtils;

import com.angelia.wancai.Constants;
import com.angelia.wancai.MainApplication;
import com.angelia.wancai.entity.AppConfiguration;

import org.json.JSONObject;

import java.io.IOException;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class AppConfigurationUtils {

    public static final void resetConfigurationFromServer(final Context context) {

        String url = "https://ps-app-api.kosun.rocks:8888/Index/getBasicsInfo";

        OkHttpClient okHttpClient = new OkHttpClient.Builder().hostnameVerifier(new HostnameVerifier() {
            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        }).build();
        Request request = new Request.Builder().url(url).post(
                new FormBody.Builder()
                        .add("uniqueId", context.getPackageName())
                        .add("buildVersionCode", String.valueOf(CommonUtils.getVersionCode(context)))
                        .add("platform", "2")
                        .build()).build();
        Call call = okHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                // do nothing
                e.printStackTrace();
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response != null && response.isSuccessful()) {
                    String jsonResponse = response.body().string();
                    JSONObject jsonObject = JSONUtils.parseJSONObjectFromString(jsonResponse);

                    int code = JSONUtils.getInt("code", jsonObject);
                    if (code == 200) {
                        AppConfiguration appConfiguration = MainApplication.getAppConfiguration();
                        String codepushKey = appConfiguration.codepushKey;
                        String umengAppKey = appConfiguration.umengAppKey;
                        String jpushAppKey = appConfiguration.jpushAppKey;
                        JSONObject result = JSONUtils.getJSONObject("data", jsonObject);
                        appConfiguration.apiServer = CommonUtils.getNotNullString(JSONUtils.getString("apiServer", result).trim(), appConfiguration.apiServer);
                        appConfiguration.umengAppKey = CommonUtils.getNotNullString(JSONUtils.getString("umengAppKey", result).trim(), appConfiguration.umengAppKey);
                        appConfiguration.umengAppSecret = CommonUtils.getNotNullString(JSONUtils.getString("umengMessageSecret", result).trim(), appConfiguration.umengAppSecret);
                        appConfiguration.codepushServerUrl = CommonUtils.getNotNullString(JSONUtils.getString("codePushServerUrl", result).trim(), appConfiguration.codepushServerUrl);
                        appConfiguration.codepushKey = CommonUtils.getNotNullString(JSONUtils.getString("codePushKey", result).trim(), appConfiguration.codepushKey);
                        appConfiguration.codepushAppVersion = CommonUtils.getNotNullString(JSONUtils.getString("codePushAppVersion", result).trim(), appConfiguration.codepushAppVersion);
                        appConfiguration.channel = CommonUtils.getNotNullString(JSONUtils.getString("channelId", result).trim(), appConfiguration.channel);
                        appConfiguration.jpushAppKey = CommonUtils.getNotNullString(JSONUtils.getString("jpushAppKey", result).trim(), appConfiguration.jpushAppKey);
                        ObjectUtils.writeObject(context, Constants.APP_CONFIGURATION, appConfiguration);
                        if (!TextUtils.equals(codepushKey, appConfiguration.codepushKey) ||
                                !TextUtils.equals(umengAppKey, appConfiguration.umengAppKey) ||
                                !TextUtils.equals(jpushAppKey, appConfiguration.jpushAppKey)) {
                            MainApplication.getMainApplication().config();
                        }
                    }
                }
            }
        });
    }
}

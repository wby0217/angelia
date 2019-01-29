package com.angelia.wancai.utils;

import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;

public class JSONUtils {
    public static JSONObject parseJSONObjectFromString(String json) {
        JSONObject jsonObj = new JSONObject();
        if (!TextUtils.isEmpty(json)) {
            try {
                jsonObj = new JSONObject(json);
            } catch (JSONException var3) {
                var3.printStackTrace();
            }
        }

        return jsonObj;
    }

    public static JSONArray parseJSONArrayFromString(String json) {
        JSONArray jsonArray = new JSONArray();
        if (!TextUtils.isEmpty(json)) {
            try {
                jsonArray = new JSONArray(json);
            } catch (JSONException var3) {
                var3.printStackTrace();
            }
        }

        return jsonArray;
    }

    public static boolean getBoolean(String key, JSONObject json) {
        return getBoolean(key, json, false);
    }

    public static boolean getBoolean(String key, JSONObject json, boolean defaultValue) {
        boolean value = defaultValue;
        if (json == null) {
            return false;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getInt(key) == 1;
                }
            } catch (JSONException var5) {
                var5.printStackTrace();
            }

            return value;
        }
    }

    public static int getInt(String key, JSONObject json) {
        return getInt(key, json, 0);
    }

    public static int getInt(String key, JSONObject json, int defaultValue) {
        int value = defaultValue;
        if (json == null) {
            return defaultValue;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getInt(key);
                }
            } catch (JSONException var5) {
                var5.printStackTrace();
            }

            return value;
        }
    }

    public static long getLong(String key, JSONObject json) {
        long value = 0L;
        if (json == null) {
            return value;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getLong(key);
                }
            } catch (JSONException var5) {
                var5.printStackTrace();
            }

            return value;
        }
    }

    public static String getString(String key, JSONObject json) {
        String value = "";
        if (json == null) {
            return value;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getString(key);
                }
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

            return value;
        }
    }

    public static void putObject(String key, Object value, JSONObject json) {
        if (json != null) {
            try {
                json.put(key, value);
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

        }
    }

    public static JSONArray getJSONArray(String key, JSONObject json) {
        JSONArray value = new JSONArray();
        if (json == null) {
            return value;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getJSONArray(key);
                }
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

            return value;
        }
    }

    public static JSONObject getJSONObject(int index, JSONArray json) {
        JSONObject value = new JSONObject();
        if (json != null && json.length() != 0) {
            try {
                value = json.getJSONObject(index);
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

            return value;
        } else {
            return value;
        }
    }

    public static String getString(int index, JSONArray json) {
        String value = "";
        if (json != null && json.length() != 0) {
            try {
                value = json.getString(index);
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

            return value;
        } else {
            return value;
        }
    }

    public static JSONObject getJSONObject(String key, JSONObject json) {
        JSONObject value = new JSONObject();
        if (json == null) {
            return value;
        } else {
            try {
                if (json.has(key)) {
                    value = json.getJSONObject(key);
                }
            } catch (JSONException var4) {
                var4.printStackTrace();
            }

            return value;
        }
    }

    public static String toJsonString(String value, String key) {
        if (TextUtils.isEmpty(value)) {
            return "";
        } else {
            ArrayList arrayList = new ArrayList();
            arrayList.add(value);
            return toJsonString(arrayList, key);
        }
    }

    public static String toJsonString(ArrayList<String> arrayList, String key) {
        if (arrayList != null && arrayList.size() > 0) {
            JSONArray jsonArray = new JSONArray();
            Iterator i$ = arrayList.iterator();

            while (i$.hasNext()) {
                String s = (String) i$.next();
                JSONObject jsonObject = new JSONObject();

                try {
                    jsonObject.put(key, s);
                    jsonArray.put(jsonObject);
                } catch (JSONException var7) {
                    var7.printStackTrace();
                }
            }

            return jsonArray.toString();
        } else {
            return "";
        }
    }
}

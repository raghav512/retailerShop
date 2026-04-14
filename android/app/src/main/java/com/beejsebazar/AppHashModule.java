package com.beejsebazar;

import android.content.Context;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;

public class AppHashModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppHashModule";
    private static final String HASH_TYPE = "SHA-256";
    private static final int NUM_HASHED_BYTES = 9;
    private static final int NUM_BASE64_CHAR = 11;

    AppHashModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AppHashModule";
    }

    @ReactMethod
    public void getAppHash(Promise promise) {
        try {
            String packageName = getReactApplicationContext().getPackageName();
            String hash = getAppSignature(getReactApplicationContext(), packageName);
            Log.d(TAG, "App Hash: " + hash);
            promise.resolve(hash);
        } catch (Exception e) {
            Log.e(TAG, "Error getting app hash", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    private String getAppSignature(Context context, String packageName) {
        try {
            PackageManager packageManager = context.getPackageManager();
            Signature[] signatures = packageManager.getPackageInfo(packageName,
                    PackageManager.GET_SIGNATURES).signatures;
            
            String appSignature = null;
            for (Signature signature : signatures) {
                // GOOGLE OFFICIAL REQUIREMENT: packageName + " " + signature
                String appInfo = packageName + " " + signature.toCharsString();
                
                MessageDigest md = MessageDigest.getInstance(HASH_TYPE);
                md.update(appInfo.getBytes(StandardCharsets.UTF_8));
                
                byte[] hashSignature = md.digest();
                hashSignature = Arrays.copyOfRange(hashSignature, 0, NUM_HASHED_BYTES);
                
                String base64Hash = Base64.encodeToString(hashSignature, Base64.NO_PADDING | Base64.NO_WRAP);
                base64Hash = base64Hash.substring(0, NUM_BASE64_CHAR);
                
                appSignature = base64Hash;
                Log.d(TAG, "Package: " + packageName + " -- Hash: " + appSignature);
            }
            return appSignature;
        } catch (Exception e) {
            Log.e(TAG, "Error", e);
            return null;
        }
    }
}

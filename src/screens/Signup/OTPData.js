import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { showAlert } from "../../common/reusableComponent/CustomAlert";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/AuthSlice";
import apiService from "../../Redux/apiService";
import BackHeader from "../../common/reusableComponent/BackHeader";
import { useTranslation } from "react-i18next";
import { setAccessToken, setUserData } from "../../Redux/Storage";
import messaging from '@react-native-firebase/messaging';
import SmsRetriever from 'react-native-sms-retriever';
import { getAppHash } from '../../utils/getAppHash';
import { FARMER_COLORS, FPO_COLORS, STAFF_COLORS } from "../../colorsList/ColorList";
import Icon from "react-native-vector-icons/Ionicons";

const OTPData = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // 🔹 Role handling
  const roleId = route.params?.roleId || "farmer";
  const mobile = route?.params?.mobile;

  const colorPalette =
    roleId === "farmer" ? FARMER_COLORS :
    roleId === "fpo" ? FPO_COLORS :
    roleId === "staff" ? STAFF_COLORS : FARMER_COLORS;

  const { primary, primaryLight, tintCard, textPrimary, textSecondary } = colorPalette;
  const disabledColor = "#D1D5DB";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let hashStr = '3LjoSYnrt8F';
    const initSmsListener = async () => {
      if (Platform.OS === 'android') {
        const dynamicHash = await getAppHash();
        if (dynamicHash) {
          hashStr = dynamicHash;
        }
        startSmsListener(hashStr);
      }
    };
    initSmsListener();

    return () => {
      if (Platform.OS === 'android') {
        SmsRetriever.removeSmsListener();
      }
    };
  }, []);

  const startSmsListener = async (appHash) => {
    try {
      console.log('🔄 Starting SMS Retriever...');
      const registered = await SmsRetriever.startSmsRetriever();
      console.log('✅ SMS Retriever registered:', registered);
      
      SmsRetriever.addSmsListener(event => {
        console.log('\n========== SMS RECEIVED ==========');
        console.log('📬 Full Event:', JSON.stringify(event, null, 2));
        console.log('📬 SMS Message:', event?.message);
        console.log('📬 Message Length:', event?.message?.length);
        
        if (event?.message) {
          const hasStartTag = event.message.includes('<#>');
          const hasAppHash = event.message.includes(appHash);
          
          console.log('\n--- FORMAT CHECK ---');
          console.log('✓ Has <#> tag:', hasStartTag ? '✅ YES' : '❌ NO');
          console.log(`✓ Has app hash (${appHash}):`, hasAppHash ? '✅ YES' : '❌ NO');
          
          if (!hasStartTag) {
            console.log('\n⚠️ ERROR: SMS missing <#> at start!');
            console.log(`⚠️ Backend must send: <#> Your OTP is 123456 ${appHash}`);
          }
          
          if (!hasAppHash) {
            console.log('\n⚠️ ERROR: SMS missing app hash!');
            console.log(`⚠️ Backend must add: ${appHash} at the end`);
          }
          
          console.log('\n--- OTP EXTRACTION ---');
          const otpMatch = /\d{6}/.exec(event.message);
          console.log('🔍 OTP Match:', otpMatch);
          
          if (otpMatch) {
            console.log('✅ OTP found:', otpMatch[0]);
            const otpArray = otpMatch[0].split('');
            console.log('✅ OTP Array:', otpArray);
            
            // Technically Google Play Services only forwards the SMS if it has the hash.
            // But we keep the condition as a safe fallback
            if (hasAppHash) {
              console.log('\n🎉 SMS FORMAT CORRECT! Auto-filling...');
              setOtp(otpArray);
              SmsRetriever.removeSmsListener();
              
              // Automatically check Focus
              inputRefs.current[5]?.focus();
            } else {
              console.log('\n❌ SMS FORMAT WRONG! Cannot auto-fill.');
              console.log(`❌ Required format: <#> Your OTP is ${otpMatch[0]} ${appHash}`);
            }
          } else {
            console.log('❌ No 6-digit OTP found');
          }
        } else {
          console.log('\n❌ NO MESSAGE IN EVENT!');
          console.log('❌ SMS Retriever not capturing SMS.');
          console.log(`❌ Backend MUST add: ${appHash}`);
        }
        
        console.log('========== END ==========\n');
      });
    } catch (error) {
      console.log('❌ SMS Retriever error:', error);
    }
  };

  // ✅ Handle OTP change
  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    
    // Handle paste or auto-fill of full OTP
    if (cleanText.length > 1) {
      const otpArray = cleanText.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastIndex = Math.min(index + otpArray.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }
    
    // Handle single digit input
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    // Move to next input
    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (!mobile) {
      showAlert({ type: 'warning', title: t("error"), message: t("mobile_required") });
      return;
    }

    setResendLoading(true);

    try {
      const payload = {
        mobile,
        role: roleId,
      };

      const response = await apiService.SendOtp(payload);

      if (response?.success) {
        showAlert({ type: 'success', title: t("success"), message: t("otp_resent_success") });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        showAlert({ type: 'error', title: t("error"), message: response?.message || t("otp_resend_failed") });
      }
    } catch (error) {
      console.log("❌ Resend OTP error:", error);
      showAlert({ type: 'error', title: t("error"), message: t("something_went_wrong") });
    } finally {
      setResendLoading(false);
    }
  };

  // ✅ Submit OTP
  // const submitOtp = async () => {
  //   const enteredOtp = otp.join("");

  //   if (enteredOtp.length !== 6) {
  //     Alert.alert(t("error"), t("enter_6_digit_otp"));
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //      // 🔥 Always get fresh FCM token
  //   const fcmToken = await messaging().getToken();
     

  //   const payload = {
  //     mobile,
  //     otp: enteredOtp,
  //     role: roleId,
  //   };

  //     console.log("📤 OTP Verify Payload:", payload);
  //     const response = await apiService.SendVerifyOtp(payload);

  //     console.log("✅ OTP Verify Response:", response);

  //     if (!response?.success) {
  //       Alert.alert(
  //         t("error"),
  //         response?.message || t("invalid_otp")
  //       );
  //       return;
  //     }

  //     // Extract token and user data
  //     const token = response?.token;
  //     const userData = response?.data || {};

  //     if (!token) {
  //       Alert.alert(t("error"), t("authentication_failed"));
  //       return;
  //     }

  //     // Save to storage
  //   await setAccessToken(token);
  //     await setUserData({
  //       ...userData,
  //       role: roleId,
  //     });

  //     // Update Redux store
  //     await dispatch(
  //       login.fulfilled({
  //         token,
  //         user: { ...userData, role: roleId },
  //         success: true,
  //       })
  //     );



  //   if (fcmToken) {
  //     await apiService.saveFcmToken({ fcmToken });
  //     console.log("✅ FCM token saved successfully");
  //   }


  //     console.log("🚀 Login completed, navigating based on role:", roleId);

  //     // Navigate based on role
  //     if (roleId === "farmer") {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Tabfarmer" }],
  //       });
  //     } else if (roleId === "fpo") {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "TabFPO" }],
  //       });
  //     } else {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "TabStackuser" }],
  //       });
  //     }
      
  //   } catch (error) {
  //     console.log("❌ OTP verify error:", error);

  //     Alert.alert(
  //       t("error"),
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       t("something_went_wrong")
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const submitOtp = async () => {
  const enteredOtp = otp.join("");

  if (enteredOtp.length !== 6) {
    showAlert({ type: 'warning', title: t("error"), message: t("enter_6_digit_otp") });
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Step 1: Verify OTP first (DO NOT call FCM before login)
    const payload = {
      mobile,
      otp: enteredOtp,
      role: roleId,
    };

    console.log("📤 OTP Verify Payload:", payload);

    const response = await apiService.SendVerifyOtp(payload);

    console.log("✅ OTP Verify Response:", response);

    if (!response?.success) {
      showAlert({ type: 'error', title: t("error"), message: response?.message || t("invalid_otp") });
      return;
    }

    const token = response?.token;
    const userData = response?.data || {};

    if (!token) {
      showAlert({ type: 'error', title: t("error"), message: t("authentication_failed") });
      return;
    }

    // ✅ Use the role from backend, NOT the selected role
    const actualRole = userData?.role?.toLowerCase() || roleId;

    // ✅ Validate if user's actual role matches the selected role
    if (actualRole !== roleId.toLowerCase()) {
      showAlert({ type: 'error', title: t("error"), message: `This number is registered as ${actualRole}. Please login from the correct section.` });
      return;
    }

    // ✅ Step 2: Save token
    await setAccessToken(token);

    await setUserData({
      ...userData,
      role: actualRole,
    });

    dispatch(
      login.fulfilled({
        token,
        user: { ...userData, role: actualRole },
        success: true,
      })
    );

    // ✅ Step 3: Get FCM token SAFELY (after login)
    try {
      await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      console.log("🔑 FCM Token:", fcmToken);

      if (fcmToken) {
        await apiService.saveFcmToken({ fcmToken });
        console.log("✅ FCM token saved successfully");
      } else {
        console.warn("⚠️ FCM token is null/empty — check google-services.json & Firebase setup");
      }
    } catch (fcmError) {
      // Log full error to help diagnose (code, message, native error)
      console.error("❌ FCM getToken failed:", {
        code: fcmError?.code,
        message: fcmError?.message,
        nativeErrorCode: fcmError?.nativeErrorCode,
        nativeErrorMessage: fcmError?.nativeErrorMessage,
        full: fcmError,
      });
      // Do NOT break login if FCM fails
    }

    console.log("🚀 Login completed with role:", actualRole);

    // ✅ Step 4: Navigate based on actual role
    if (actualRole === "farmer") {
      navigation.reset({
        index: 0,
        routes: [{ name: "TabFarmer" }],
      });
    } else if (actualRole === "fpo") {
      navigation.reset({
        index: 0,
        routes: [{ name: "TabFPO" }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "TabStackUser" }],
      });
    }

  } catch (error) {
    console.log("❌ OTP verify error:", error);

    showAlert({ type: 'error', title: t("error"), message: error?.response?.data?.message || error?.message || t("something_went_wrong") });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <BackHeader />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: primaryLight }]}>
          <Icon name="chatbubble-ellipses-outline" size={32} color="#fff" />
        </View>

        <Text style={[styles.title, { color: textPrimary }]}>{t("verify_mobile")}</Text>
        <Text style={[styles.subTitle, { color: textSecondary }]}>
          {t("otp_sent_to")} <Text style={[styles.mobileText, { color: primary }]}>{mobile}</Text>
        </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
              digit && [styles.otpInputFilled, { borderColor: primary, backgroundColor: tintCard }]
            ]}
            maxLength={index === 0 ? 6 : 1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!isLoading}
            textContentType={index === 0 ? "oneTimeCode" : "none"}
            autoComplete={index === 0 ? "sms-otp" : "off"}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: primaryLight },
          isLoading && [styles.disabledBtn, { backgroundColor: disabledColor }]
        ]}
        onPress={submitOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitTxt}>{t("verify_and_login")}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>{t("didnt_receive_otp")} </Text>
        <TouchableOpacity 
          onPress={handleResendOtp}
          disabled={resendLoading || isLoading}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color={primary} style={{marginLeft: 8}} />
          ) : (
            <Text style={[styles.resendLink, { color: primary }]}>{t("resend_otp")}</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

export default OTPData;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  subTitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 22,
  },
  mobileText: {
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1.5,
    width: 50,
    height: 55,
    borderRadius: 12,
    marginHorizontal: 5,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  otpInputFilled: {
    borderWidth: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtn: {
    paddingVertical: 16,
    width: "100%",
    borderRadius: 14,
    marginTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledBtn: {
    elevation: 0,
    shadowOpacity: 0,
  },
  submitTxt: {
    textAlign: "center",
    fontWeight: "600",
    color: "white",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  resendText: {
    fontSize: 14,
    color: "gray",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
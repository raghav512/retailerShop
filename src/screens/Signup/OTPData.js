import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../common/reusableComponent/CustomAlert';
import { useDispatch } from 'react-redux';
import { login } from '../../Redux/AuthSlice';
import apiService from '../../Redux/apiService';
import BackHeader from '../../common/reusableComponent/BackHeader';
import { useTranslation } from 'react-i18next';
import { setAccessToken, setUserData } from '../../Redux/Storage';
import messaging from '@react-native-firebase/messaging';
import {
  FARMER_COLORS,
  FPO_COLORS,
  STAFF_COLORS,
} from '../../colorsList/ColorList';
import Icon from 'react-native-vector-icons/Ionicons';
import { normalizeOtpRoleId, toOtpApiRole } from '../../utils/otpRole';

const OTPData = ({ route }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // 🔹 Role handling
  const roleId = route.params?.roleId || 'Farmer';
  const normalizedRole = normalizeOtpRoleId(roleId) || 'Farmer';
  const otpApiRole = toOtpApiRole(normalizedRole) || 'Farmer';
  const isFpoRole = normalizedRole === 'Retailer';
  const mobile = (route?.params?.mobile || '').toString().trim();

  const colorPalette =
    normalizedRole === 'Farmer'
      ? FARMER_COLORS
      : isFpoRole
      ? FPO_COLORS
      : normalizedRole === 'Staff'
      ? STAFF_COLORS
      : FARMER_COLORS;

  const { primary, primaryLight, tintCard, textPrimary, textSecondary } =
    colorPalette;
  const disabledColor = '#D1D5DB';

  // 🔹 Image URLs based on role
  const retailerImageUrl =
    'https://scontent.fjdh1-3.fna.fbcdn.net/v/t39.30808-6/485866580_1090035703137705_3246541318555590973_n.jpg?stp=cp6_dst-jpg_s720x720_tt6&_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=yEGyBc6WzL4Q7kNvwHUyP72&_nc_oc=AdolLiK0otCeVSz9gcpJYzvEpDpDQECXRo4tHPr_Kih-0StMdR_FCK5saBBHl-xaL8Q&_nc_zt=23&_nc_ht=scontent.fjdh1-3.fna&_nc_gid=0zJoFWPLQOAOxDiiCnU-ag&_nc_ss=7b289&oh=00_Af6_F57ZxwZXUlyojqoTfC9iNDt0Zr90lLl2fD0h4dIEHw&oe=69FF9035';
  const staffImageUrl =
    'https://geolife.com/dealer/maharashtra/assets/images/nade-krishi-seva-kendra-fertilizers-and-pesticides-murud.jpeg';
  const defaultImageUrl =
    'https://th.bing.com/th/id/OIG1.sGIyrNmTqoWI.CyRdMbt?pid=ImgGn';
  const imageUrl = isFpoRole
    ? retailerImageUrl
    : normalizedRole === 'Staff'
    ? staffImageUrl
    : defaultImageUrl;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);

  const resolveResponseRole = responsePayload => {
    const candidates = [
      { value: responsePayload?.data?.role, source: 'data.role' },
      { value: responsePayload?.data?.user?.role, source: 'data.user.role' },
      { value: responsePayload?.data?.roleId, source: 'data.roleId' },
      {
        value: responsePayload?.data?.user?.roleId,
        source: 'data.user.roleId',
      },
      { value: responsePayload?.role, source: 'role' },
    ];
    const match = candidates.find(candidate => candidate.value);
    const normalized = normalizeOtpRoleId(match?.value);
    return {
      role: normalized || '',
      source: match?.source || 'unknown',
    };
  };

  // ✅ Handle OTP change
  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');

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
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (!mobile) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('mobile_required'),
      });
      return;
    }

    setResendLoading(true);

    try {
      const payload = {
        mobile,
        role: otpApiRole,
      };

      console.log('🔁 Resend OTP context:', {
        mobile,
        routeRoleId: roleId,
        normalizedRole,
        requestRole: otpApiRole,
      });
      const response = await apiService.SendOtp(payload);

      if (response?.success) {
        showAlert({
          type: 'success',
          title: t('success'),
          message: t('otp_resent_success'),
        });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showAlert({
          type: 'error',
          title: t('error'),
          message: response?.message || t('otp_resend_failed'),
        });
      }
    } catch (error) {
      console.log('❌ Resend OTP error:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('something_went_wrong'),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const submitOtp = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('enter_6_digit_otp'),
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Step 1: Verify OTP first (DO NOT call FCM before login)
      const payload = {
        mobile,
        otp: enteredOtp,
        role: otpApiRole,
      };

      const response = await apiService.SendVerifyOtp(payload);

      if (!response?.success) {
        showAlert({
          type: 'error',
          title: t('error'),
          message: response?.message || t('invalid_otp'),
        });
        return;
      }

      const token = response?.token;
      const userData = response?.data || {};

      if (!token) {
        showAlert({
          type: 'error',
          title: t('error'),
          message: t('authentication_failed'),
        });
        return;
      }

      // ✅ Use the role from backend, NOT the selected role
      const resolvedRole = resolveResponseRole(response);
      const actualRole = resolvedRole.role || normalizedRole;
      const selectedRole = normalizedRole;
      const isRoleMatch = actualRole === selectedRole;

      // ✅ Validate if user's actual role matches the selected role
      if (!isRoleMatch) {
        showAlert({
          type: 'error',
          title: t('error'),
          message: `This number is registered as ${actualRole}. Please login from the correct section.`,
        });
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
        }),
      );

      // ✅ Step 3: Get FCM token SAFELY (after login)
      try {
        await messaging().registerDeviceForRemoteMessages();
        const fcmToken = await messaging().getToken();
        console.log('🔑 FCM Token:', fcmToken);

        if (fcmToken) {
          await apiService.saveFcmToken({ fcmToken });
          console.log('✅ FCM token saved successfully');
        } else {
          console.warn(
            '⚠️ FCM token is null/empty — check google-services.json & Firebase setup',
          );
        }
      } catch (fcmError) {
        // Log full error to help diagnose (code, message, native error)
        console.error('❌ FCM getToken failed:', {
          code: fcmError?.code,
          message: fcmError?.message,
          nativeErrorCode: fcmError?.nativeErrorCode,
          nativeErrorMessage: fcmError?.nativeErrorMessage,
          full: fcmError,
        });
        // Do NOT break login if FCM fails
      }

      console.log('🚀 Login completed with role:', actualRole);

      // Route and BindUser handle post-login role-based rendering.
      // Avoid resetting to undeclared tab route names from the auth stack.
      return;
    } catch (error) {
      console.log('❌ OTP verify error:', error);
      console.log('❌ OTP verify error details:', {
        routeRoleId: roleId,
        normalizedRole,
        requestRole: otpApiRole,
        status: error?.response?.status,
        backendMessage: error?.response?.data?.message,
      });

      showAlert({
        type: 'error',
        title: t('error'),
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('something_went_wrong'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackHeader />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: primaryLight }]}>
          <Icon name="chatbubble-ellipses-outline" size={32} color="#fff" />
        </View>

        <Text style={[styles.title, { color: textPrimary }]}>
          {t('verify_mobile')}
        </Text>
        <Text style={[styles.subTitle, { color: textSecondary }]}>
          {t('otp_sent_to')}{' '}
          <Text style={[styles.mobileText, { color: primary }]}>{mobile}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                styles.otpInputDefault,
                digit && [
                  styles.otpInputFilled,
                  { borderColor: primary, backgroundColor: tintCard },
                ],
              ]}
              maxLength={index === 0 ? 6 : 1}
              keyboardType="numeric"
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              editable={!isLoading}
              textContentType={index === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={index === 0 ? 'sms-otp' : 'off'}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: primaryLight },
            isLoading && [
              styles.disabledBtn,
              { backgroundColor: disabledColor },
            ],
          ]}
          onPress={submitOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitTxt}>{t('verify_and_login')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t('didnt_receive_otp')} </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendLoading || isLoading}
          >
            {resendLoading ? (
              <ActivityIndicator
                size="small"
                color={primary}
                style={styles.resendLoader}
              />
            ) : (
              <Text style={[styles.resendLink, { color: primary }]}>
                {t('resend_otp')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: imageUrl,
          }}
          style={styles.bottomImage}
          resizeMode="cover"
        />
      </View>
    </SafeAreaView>
  );
};

export default OTPData;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSpacer: {
    height: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 22,
  },
  mobileText: {
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1.5,
    width: 50,
    height: 55,
    borderRadius: 12,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  otpInputDefault: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtn: {
    paddingVertical: 16,
    width: '100%',
    borderRadius: 14,
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledBtn: {
    elevation: 0,
    shadowOpacity: 0,
  },
  submitTxt: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  resendText: {
    fontSize: 14,
    color: 'gray',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  resendLoader: {
    marginLeft: 8,
  },
  bottomImage: {
    width: '100%',
    height: 200,
    marginTop: 30,
    borderRadius: 16,
  },
});

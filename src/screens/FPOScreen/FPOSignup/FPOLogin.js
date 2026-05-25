import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { FPO_COLORS } from '../../../colorsList/ColorList';
import { normalizeOtpRoleId, toOtpApiRole } from '../../../utils/otpRole';

const FPOLogin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // 🔹 State
  const [loginType, setLoginType] = useState('mobile'); // gst | mobile
  // const [gst, setGst] = useState("");
  const [mobile, setMobile] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // 🔹 Role handling
  const roleId = normalizeOtpRoleId('retailer') || 'Retailer';
  const otpApiRole = toOtpApiRole(roleId) || 'Retailer';

  // 🔹 Role name mapping
  const roleName = t('role_fpo');

  // 🔹 Validations
  // const isValidGST = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim());
  const isValidMobile = /^\d{10}$/.test(mobile.trim());

  // 🔹 Login button validation
  const canLogin = isValidMobile;
  // const canLogin =
  //   (loginType === "mobile" && isValidMobile) ||
  //   (loginType === "gst" && isValidGST);

  /**
   * Handle Send OTP and Navigate
   */
  const handleLogin = async () => {
    if (!canLogin || otpLoading) return;

    setOtpLoading(true);

    try {
      // Prepare OTP payload based on login type
      const payload = { mobile: mobile.trim() };
      // const payload = loginType === "mobile"
      //   ? { mobile: mobile.trim() }
      //   : { gst: gst.trim() };

      // Add role if needed by your API
      payload.role = otpApiRole;

      // Call SendOtp API
      const response = await apiService.SendOtp(payload);

      // Check if OTP was sent successfully
      if (
        response &&
        (response.success === true ||
          response.status === 'success' ||
          response.message?.includes('sent'))
      ) {
        // Navigate to OTPData page with necessary params
        navigation.navigate('OTPData', {
          mobile: mobile.trim(),
          roleId: roleId,
          loginType: loginType,
          fromScreen: 'FPOLogin',
        });

        // Optional: Show success message
        // Alert.alert(
        //   t("success"),
        //   response?.message || t("otp_sent_success")
        // );
      } else {
        // Handle API response that doesn't indicate success
        showAlert({
          type: 'error',
          title: t('error'),
          message: response?.message || response?.error || t('otp_send_failed'),
        });
      }
    } catch (error) {
      console.log('Send OTP failed:', error);

      // Better error handling
      let errorMessage = t('something_went_wrong');

      if (error.response) {
        // Server responded with error
        console.log('Error response data:', error.response.data);
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = t('network_error');
      } else {
        // Something else happened
        errorMessage = error.message || t('something_went_wrong');
      }

      showAlert({ type: 'error', title: t('error'), message: errorMessage });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=90',
        }}
        style={styles.container}
        resizeMode="cover"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon name="business-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.title}>{t('fpo_login', { role: roleName })}</Text>
          <Text style={styles.subtitle}>{t('fpo_login_subtitle')}</Text>
        </View>

        {/* TOGGLE - Mobile/GST */}
        {/* 
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            loginType === "mobile" && styles.toggleActive,
          ]}
          onPress={() => {
            setLoginType("mobile");
            setGst(""); // Clear GST when switching
          }}
          disabled={otpLoading}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === "mobile" && styles.toggleTextActive,
            ]}
          >
            {t("mobile_number")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            loginType === "gst" && styles.toggleActive,
          ]}
          onPress={() => {
            setLoginType("gst");
            setMobile(""); // Clear mobile when switching
          }}
          disabled={otpLoading}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === "gst" && styles.toggleTextActive,
            ]}
          >
            {t("gst_number")}
          </Text>
        </TouchableOpacity>
      </View>
      */}

        {/* FORM */}
        <View style={styles.form}>
          {/* Dynamic field based on login type */}
          {/* {loginType === "mobile" ? ( */}
          <>
            <Text style={styles.label}>{t('mobile_number')}</Text>
            <View
              style={[
                styles.inputBox,
                mobile.length > 0 && !isValidMobile && styles.errorInput,
              ]}
            >
              <Icon
                name="call-outline"
                size={18}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder={t('enter_mobile')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
                style={styles.inputField}
                editable={!otpLoading}
              />
              {mobile.length > 0 && !isValidMobile && (
                <Icon name="alert-circle-outline" size={18} color="red" />
              )}
            </View>
          </>
          {/* ) : (
          <>
            <Text style={styles.label}>{t("gst_number")}</Text>
            <View style={[
              styles.inputBox,
              gst.length > 0 && !isValidGST && styles.errorInput
            ]}>
              <Icon name="document-text-outline" size={18} color="#6B7280" style={{marginRight: 8}} />
              <TextInput
                placeholder={t("enter_gst")}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={gst}
                onChangeText={setGst}
                style={styles.inputField}
                editable={!otpLoading}
              />
              {gst.length > 0 && !isValidGST && (
                <Icon name="alert-circle-outline" size={18} color="red" />
              )}
            </View>
          </>
        )} */}

          {/* LOGIN BUTTON - Now sends OTP */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              (!canLogin || otpLoading) && styles.disabledBtn,
            ]}
            disabled={!canLogin || otpLoading}
            onPress={handleLogin}
          >
            {otpLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.loginText, { marginLeft: 8 }]}>
                  {t('sending_otp')}
                </Text>
              </View>
            ) : (
              <Text style={styles.loginText}>{t('login_with_otp')}</Text>
            )}
          </TouchableOpacity>

          {/* REGISTER LINK */}
          {/*
        <View style={styles.registerRow}>
          <Text>{t("dont_have_account")} </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("FpoRegistration")}
            disabled={otpLoading}
          >
            <Text style={styles.registerText}>{t("register_as_fpo")}</Text>
          </TouchableOpacity>
        </View>
        */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default FPOLogin;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: '#EDF4FF',
    paddingVertical: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FPO_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FPO_COLORS.primary,
  },

  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },

  toggleRow: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },

  toggleActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  toggleText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  toggleTextActive: {
    color: FPO_COLORS.primary,
  },

  form: {
    paddingHorizontal: 20,
  },

  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    height: 50,
    backgroundColor: '#fff',
  },

  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 8,
  },

  errorInput: {
    borderColor: '#EF4444',
  },

  loginBtn: {
    backgroundColor: FPO_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },

  disabledBtn: {
    backgroundColor: '#BFDBFE',
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  registerText: {
    color: FPO_COLORS.primary,
    fontWeight: '600',
  },
});

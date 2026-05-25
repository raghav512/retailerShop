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
import { RETAILER_COLORS } from '../../../colorsList/ColorList';
import { normalizeOtpRoleId, toOtpApiRole } from '../../../utils/otpRole';

const RetailerLogin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // 🔹 State
  const [mobile, setMobile] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // 🔹 Role handling
  const roleId = normalizeOtpRoleId(route.params?.roleId || 'retailer') || 'retailer';
  const otpApiRole = toOtpApiRole(roleId) || 'Retailer';

  // 🔹 Role name mapping
  const roleName =
    roleId === 'retailer'
      ? t('role_retailer')
      : roleId === 'staff'
      ? t('role_staff')
      : roleId === 'farmer'
      ? t('role_farmer')
      : t('role_user');

  // 🔹 Validations
  const isValidMobile = /^\d{10}$/.test(mobile.trim());

  // 🔹 Login button validation
  const canLogin = isValidMobile;

  /**
   * Handle Send OTP and Navigate
   */
  const handleLogin = async () => {
    if (!canLogin || otpLoading) return;

    setOtpLoading(true);

    try {
      // Prepare OTP payload
      const payload = { mobile: mobile.trim() };

      // Add role if needed by your API
      payload.role = otpApiRole;

      console.log('Sending OTP with payload:', payload);

      // Call SendOtp API
      const response = await apiService.SendOtp(payload);

      console.log('OTP response:', response);

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
          loginType: 'mobile',
          fromScreen: 'RetailerLogin',
        });
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
        source={{ uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=90' }}
        style={styles.container}
        resizeMode="cover"
      >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Icon name="storefront-outline" size={28} color="#fff" />
        </View>
        <Text style={styles.title}>
          {t('Retailer login', { role: roleName })}
        </Text>
        {/* <Text style={styles.subtitle}>
          {t("retailer_login_subtitle")}
        </Text> */}
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {/* Mobile Number Field */}
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
            placeholder={t('mobile_placeholder')}
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
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default RetailerLogin;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: '#FFF4E5',
    paddingVertical: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: RETAILER_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: RETAILER_COLORS.primary,
  },

  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
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
    backgroundColor: RETAILER_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },

  disabledBtn: {
    backgroundColor: RETAILER_COLORS.primaryDisabled,
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

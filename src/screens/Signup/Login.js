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
import { showAlert } from '../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import apiService from '../../Redux/apiService';
import {
  FARMER_COLORS,
  FPO_COLORS,
  STAFF_COLORS,
} from '../../colorsList/ColorList';
import { normalizeOtpRoleId, toOtpApiRole } from '../../utils/otpRole';

const Login = () => {
  // 🔹 Hooks
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // 🔹 Role handling
  const roleId = route.params?.roleId || 'Farmer';
  const normalizedRole = normalizeOtpRoleId(roleId) || 'Farmer';
  const otpApiRole = toOtpApiRole(normalizedRole) || 'Farmer';
  const isFpoRole = normalizedRole === 'Retailer';

  console.log('Login screen received roleId:', roleId); // Debug log for roleId

  const roleName =
    normalizedRole === 'Farmer'
      ? t('role_farmer')
      : normalizedRole === 'Staff'
      ? t('role_staff')
      : isFpoRole
      ? t('role_fpo')
      : t('role_user');

  const colors =
    normalizedRole === 'Farmer'
      ? FARMER_COLORS
      : isFpoRole
      ? FPO_COLORS
      : normalizedRole === 'Staff'
      ? STAFF_COLORS
      : FARMER_COLORS;

  const { primary, primaryLight, tint, textPrimary, textSecondary } = colors;

  // 🔹 State
  const [mobile, setMobile] = useState(''); // Changed from phone to mobile
  const [isLoading, setIsLoading] = useState(false); // Added missing state

  // 🔹 Mobile number validation (India – 10 digits)
  const isValidMobile = /^\d{10}$/.test(mobile);

  const handleSendOtp = async () => {
    // 1️⃣ Validate mobile number
    if (!isValidMobile) {
      showAlert({
        type: 'warning',
        title: t('invalid_mobile_title'),
        message: t('invalid_mobile_message'),
      });
      return;
    }

    setIsLoading(true);

    try {
      // 2️⃣ Call SendOtp API with the correct field name 'mobile'
      const payload = {
        mobile: mobile, // ✅ CORRECT: backend expects {mobile}
        role: otpApiRole, // Backend accepts only Farmer/Staff/Retailer
      };

      console.log('Sending OTP with payload:', payload);

      const response = await apiService.SendOtp(payload);

      console.log('OTP response:', response);

      // 3️⃣ Check if OTP was sent successfully
      // Adjust this condition based on your actual API response structure
      if (
        response &&
        (response.success === true || response.status === 'success')
      ) {
        // Navigate to OTPData page with necessary params
        navigation.navigate('OTPData', {
          mobile: mobile, // Pass the mobile number
          roleId: normalizedRole,
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

      showAlert({
        type: 'error',
        title: t('error'),
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=90',
        }}
        style={styles.img}
        resizeMode="cover"
      >
        {/* 🔹 HEADER */}
        <View style={[styles.header, { backgroundColor: tint }]}>
          <View style={[styles.iconCircle, { backgroundColor: primaryLight }]}>
            <Icon name="phone-portrait-outline" size={28} color="#fff" />
          </View>

          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            {t('login_title', { role: roleName })}
          </Text>

          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            {t('login_subtitle')}
          </Text>
        </View>

        {/* 🔹 FORM */}
        <View style={styles.form}>
          {/* MOBILE */}
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
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              style={styles.inputField}
              editable={!isLoading}
            />
            {mobile.length > 0 && !isValidMobile && (
              <Icon name="alert-circle-outline" size={18} color="red" />
            )}
          </View>

          {/* SEND OTP BUTTON */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: primaryLight },
              (!isValidMobile || isLoading) && styles.disabledBtn,
            ]}
            disabled={!isValidMobile || isLoading}
            onPress={handleSendOtp}
          >
            {isLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.loginText, { marginLeft: 10 }]}>
                  {t('sending_otp')}
                </Text>
              </View>
            ) : (
              <Text style={styles.loginText}>{t('login_with_otp')}</Text>
            )}
          </TouchableOpacity>

          {/* REGISTER */}
          {/*
        <View style={styles.registerRow}>
          <Text>{t("no_account")} </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Screen1")}
            disabled={isLoading}
          >
            <Text style={styles.registerText}>
              {t("register_as", { role: roleName })}
            </Text>
          </TouchableOpacity>
        </View>
        */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles remain exactly the same as your original
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: 200,
  },
  img: {
    flex: 1,
    bottom: -30,
  },
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: '#FFF8DC',
    paddingVertical: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FARMER_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7A5800',
  },

  headerSubtitle: {
    fontSize: 13,
    color: FARMER_COLORS.primaryDark,
    marginTop: 4,
  },

  form: {
    padding: 22,
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
    backgroundColor: FARMER_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 16,
  },

  disabledBtn: {
    backgroundColor: '#D1D5DB',
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  orText: {
    marginHorizontal: 10,
    color: '#9CA3AF',
  },

  googleBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 15,
    paddingVertical: 14,
  },

  OTPBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
    backgroundColor: '#1559e0',
    borderRadius: 15,
    paddingVertical: 14,
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  googleText: {
    fontSize: 15,
    fontWeight: '500',
  },

  checkboxRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: FARMER_COLORS.primary,
    borderColor: FARMER_COLORS.primary,
  },

  checkMark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 3,
  },

  checkboxText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },

  link: {
    color: FARMER_COLORS.primary,
    fontWeight: '600',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  registerText: {
    color: FARMER_COLORS.primary,
    fontWeight: '600',
  },
});

export default Login;

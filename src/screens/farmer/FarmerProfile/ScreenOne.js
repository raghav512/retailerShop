import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import apiService from '../../../Redux/apiService';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FARMER_COLORS } from '../../../colorsList/ColorList';
import {
  validateFirstName,
  validateLastName,
  validateMobileNumber,
  validateVillage,
} from '../../../utils/validation';

const Screen1 = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(true);

  // Validation states
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    village: '',
  });

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Validation functions
  const validateField = (fieldName, value) => {
    let result = { isValid: true, message: '' };

    switch (fieldName) {
      case 'firstName':
        result = validateFirstName(value);
        break;
      case 'lastName':
        result = validateLastName(value);
        break;
      case 'mobile':
        result = validateMobileNumber(value);
        break;
      case 'village':
        result = validateVillage(value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.message,
    }));

    return result.isValid;
  };

  const handleFieldBlur = (fieldName, value) => {
    validateField(fieldName, value);
  };

  const clearError = fieldName => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  const fetchUserData = async () => {
    try {
      console.log('🔄 ScreenOne - Fetching user data...');
      const response = await apiService.getProfileDetails();
      console.log(
        '🔄 ScreenOne - Raw response:',
        JSON.stringify(response, null, 2),
      );

      const userData = response.data || response;
      console.log(
        '🔄 ScreenOne - Processed userData:',
        JSON.stringify(userData, null, 2),
      );

      if (userData) {
        setfirstName(userData.firstName || '');
        setlastName(userData.lastName || '');
        setMobile(userData.phone || '');
        setVillage(userData.village || '');
        setGender(userData.gender || 'Male');
        console.log('🔄 ScreenOne - Form populated with:', {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          village: userData.village,
          gender: userData.gender,
        });
      }
    } catch (error) {
      console.error('🔄 ScreenOne - Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    // Validate all fields
    const isFirstNameValid = validateField('firstName', firstName);
    const isLastNameValid = validateField('lastName', lastName);
    const isMobileValid = validateField('mobile', mobile);
    const isVillageValid = validateField('village', village);

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isMobileValid ||
      !isVillageValid
    ) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('please_fix_errors'),
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 ScreenOne - Current form values:', {
        firstName,
        lastName,
        mobile,
        village,
        gender,
      });

      const profileData = {
        firstName,
        lastName,
        phone: mobile,
        village,
        gender: gender.toLowerCase(),
      };

      console.log('🔄 ScreenOne - Sending profile data:', profileData);
      const response = await apiService.UpdateProfileData(profileData);
      console.log('🔄 ScreenOne - Profile updated:', response);

      showAlert({
        type: 'success',
        title: t('success'),
        message: t('profile_screens.profile_updated'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error('🔄 ScreenOne - Update profile error:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('profile_screens.profile_update_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {/* HEADER */}
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={FARMER_COLORS.textOnPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('profile_screens.personal_details')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <Icon
                name="person"
                size={20}
                color={FARMER_COLORS.primaryLight}
              />
            </View>

            <Text style={styles.cardTitle}>
              {t('profile_screens.edit_personal_details')}
            </Text>

            {/* FIRST NAME */}
            <Text style={styles.label}>{t('first_name')} *</Text>
            <TextInput
              placeholder={t('enter_first_name')}
              style={[styles.input, errors.firstName && styles.inputError]}
              value={firstName}
              onChangeText={text => {
                setfirstName(text);
                if (errors.firstName) clearError('firstName');
              }}
              onBlur={() => handleFieldBlur('firstName', firstName)}
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}

            {/* LAST NAME */}
            <Text style={styles.label}>{t('last_name')} *</Text>
            <TextInput
              placeholder={t('enter_last_name')}
              style={[styles.input, errors.lastName && styles.inputError]}
              value={lastName}
              onChangeText={text => {
                setlastName(text);
                if (errors.lastName) clearError('lastName');
              }}
              onBlur={() => handleFieldBlur('lastName', lastName)}
            />
            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}

            {/* MOBILE */}
            <Text style={styles.label}>{t('mobile_number')} *</Text>
            <TextInput
              placeholder={t('mobile_placeholder_short')}
              keyboardType="numeric"
              style={[styles.input, errors.mobile && styles.inputError]}
              value={mobile}
              maxLength={10}
              onChangeText={text => {
                setMobile(text);
                if (errors.mobile) clearError('mobile');
              }}
              onBlur={() => handleFieldBlur('mobile', mobile)}
            />
            {errors.mobile ? (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            ) : null}

            {/* GENDER */}
            <Text style={styles.label}>{t('gender')} *</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.genderBtn,
                    gender === item && styles.genderBtnActive,
                  ]}
                  onPress={() => setGender(item)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === item && styles.genderTextActive,
                    ]}
                  >
                    {t(item.toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* VILLAGE */}
            <Text style={styles.label}>{t('village')} *</Text>
            <TextInput
              placeholder={t('enter_village')}
              style={[styles.input, errors.village && styles.inputError]}
              value={village}
              onChangeText={text => {
                setVillage(text);
                if (errors.village) clearError('village');
              }}
              onBlur={() => handleFieldBlur('village', village)}
            />
            {errors.village ? (
              <Text style={styles.errorText}>{errors.village}</Text>
            ) : null}
          </View>

          {/* UPDATE BUTTON */}
          <TouchableOpacity
            style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.updateText}>
              {loading
                ? t('profile_screens.updating')
                : t('profile_screens.update')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Screen1;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: FARMER_COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: FARMER_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: FARMER_COLORS.inputBackground,
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FARMER_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.surface,
  },
  genderBtnActive: {
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    borderColor: FARMER_COLORS.primaryLight,
    borderWidth: 1.5,
  },
  genderText: {
    fontSize: 14,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  genderTextActive: {
    color: FARMER_COLORS.primaryLight,
    fontWeight: '700',
  },

  updateBtn: {
    backgroundColor: FARMER_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

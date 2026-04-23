import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

const BankDetails = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const cachedData = route?.params?.cachedUserData; // ✅ FIX: Get cached data

  const [bankName, setBankName] = useState(cachedData?.bankName || ''); // ✅ FIX: Initialize with cached data
  const [ifsc, setIfsc] = useState(cachedData?.ifscCode || '');
  const [accountNumber, setAccountNumber] = useState(cachedData?.accountNumber || '');
  const [loading, setLoading] = useState(false); // ✅ FIX: Start with false
  const [initialLoading, setInitialLoading] = useState(!cachedData); // ✅ FIX: Separate initial load state

  useEffect(() => {
    // ✅ FIX: Only fetch if no cached data
    if (!cachedData) {
      fetchUserData();
    }
  }, [cachedData]);

  const fetchUserData = async () => {
    try {
      const response = await apiService.getProfileDetails();
      const userData = response.data || response;

      if (userData) {
        setBankName(userData.bankName || '');
        setIfsc(userData.ifscCode || '');
        setAccountNumber(userData.accountNumber || '');
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    } finally {
      setInitialLoading(false); // ✅ FIX: Only hide initial loader
    }
  };

  const handleUpdate = async () => {
    if (!bankName || !ifsc || !accountNumber) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('profile_screens.fill_bank_details'),
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        bankName,
        ifscCode: ifsc.toUpperCase(),
        accountNumber,
      };

      await apiService.UpdateProfileData(profileData);
      showAlert({
        type: 'success',
        title: t('success'),
        message: t('profile_screens.bank_updated'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error('Update bank details error:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('profile_screens.bank_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('profile_screens.bank_details')}
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
            <Icon name="card" size={20} color={RETAILER_COLORS.primaryLight} />
          </View>

          <Text style={styles.cardTitle}>
            {t('profile_screens.bank_details')}
          </Text>
          <Text style={styles.cardSub}>
            {t('profile_screens.update_banking_info')}
          </Text>

          <Text style={styles.label}>{t('profile_screens.bank_name')}</Text>
          <TextInput
            placeholder={t('profile_screens.enter_bank_name')}
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
          />

          <Text style={styles.label}>{t('profile_screens.ifsc_code')}</Text>
          <TextInput
            placeholder={t('profile_screens.enter_ifsc')}
            style={styles.input}
            value={ifsc}
            onChangeText={setIfsc}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            {t('profile_screens.account_number')}
          </Text>
          <TextInput
            placeholder={t('profile_screens.enter_account_number')}
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueText}>
              {t('profile_screens.save_changes')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.tint,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: 6,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RETAILER_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RETAILER_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: '#4B5563',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAF8',
    fontSize: 15,
    color: '#1F2937',
  },
  continueBtn: {
    backgroundColor: RETAILER_COLORS.primaryLight,
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  continueBtnDisabled: {
    backgroundColor: RETAILER_COLORS.primaryDisabled,
    opacity: 1,
  },
  continueText: {
    color: RETAILER_COLORS.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default BankDetails;

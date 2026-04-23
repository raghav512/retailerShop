import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenSixth = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiService.getProfileDetails();
      const userData = response.data || response;

      if (userData) {
        setBankName(userData.bankName || "");
        setIfsc(userData.ifscCode || "");
        setAccountNumber(userData.accountNumber || "");
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!bankName || !ifsc || !accountNumber) {
      showAlert({ type: 'warning', title: t("error"), message: t("profile_screens.fill_bank_details") });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        bankName,
        ifscCode: ifsc.toUpperCase(),
        accountNumber
      };

      await apiService.UpdateProfileData(profileData);
      showAlert({ type: 'success', title: t("success"), message: t("profile_screens.bank_updated"), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('Update bank details error:', error);
      showAlert({ type: 'error', title: t("error"), message: t("profile_screens.bank_failed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={FARMER_COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile_screens.documents")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name="card" size={20} color={FARMER_COLORS.primaryLight} />
        </View>

        <Text style={styles.cardTitle}>{t("profile_screens.bank_details")}</Text>
        <Text style={styles.cardSub}>{t("profile_screens.update_banking_info")}</Text>

        <Text style={styles.label}>{t("profile_screens.bank_name")}</Text>
        <TextInput
          placeholder={t("profile_screens.enter_bank_name")}
          style={styles.input}
          value={bankName}
          onChangeText={setBankName}
        />

        <Text style={styles.label}>{t("profile_screens.ifsc_code")}</Text>
        <TextInput
          placeholder={t("profile_screens.enter_ifsc")}
          style={styles.input}
          value={ifsc}
          onChangeText={setIfsc}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>{t("profile_screens.account_number")}</Text>
        <TextInput
          placeholder={t("profile_screens.enter_account_number")}
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
          <Text style={styles.continueText}>{t("profile_screens.save_changes")}</Text>
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
    backgroundColor: FARMER_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "700",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardSub: {
    fontSize: 14,
    color: FARMER_COLORS.textSecondary,
    marginBottom: 24,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
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
  continueBtn: {
    backgroundColor: FARMER_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ScreenSixth;

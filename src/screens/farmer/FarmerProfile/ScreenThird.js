import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import apiService from "../../../Redux/apiService";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenThird = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const FARMER_CATEGORIES = [
    { id: "small", label: t("farmer_small") },
    { id: "medium", label: t("farmer_medium") },
    { id: "marginal", label: t("farmer_marginal") }
  ];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      console.log('🧑‍🌾 ScreenThird - Fetching user data...');
      const response = await apiService.getProfileDetails();
      console.log('🧑‍🌾 ScreenThird - Raw response:', JSON.stringify(response, null, 2));

      const userData = response.data || response;
      console.log('🧑‍🌾 ScreenThird - Processed userData:', JSON.stringify(userData, null, 2));

      if (userData) {
        setSelectedCategory(userData.farmerCategory || "");
        console.log('🧑‍🌾 ScreenThird - Form populated with:', {
          farmerCategory: userData.farmerCategory
        });
      }
    } catch (error) {
      console.error('🧑‍🌾 ScreenThird - Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) {
      showAlert({ type: 'warning', title: t("error"), message: t("select_farmer_category_alert") });
      return;
    }

    setLoading(true);
    try {
      console.log('🧑‍🌾 ScreenThird - Current form values:', {
        selectedCategory
      });

      const profileData = {
        farmerCategory: selectedCategory
      };

      console.log('🧑‍🌾 ScreenThird - Sending profile data:', profileData);
      const response = await apiService.UpdateProfileData(profileData);
      console.log('🧑‍🌾 ScreenThird - Profile updated:', response);

      showAlert({ type: 'success', title: t("success"), message: t("profile_screens.farmer_category_updated"), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('🧑\u200d🌾 ScreenThird - Update profile error:', error);
      showAlert({ type: 'error', title: t("error"), message: t("profile_screens.farmer_category_failed") });
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
        <Text style={styles.headerTitle}>{t("farmer_category")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name="people" size={20} color={FARMER_COLORS.primaryLight} />
        </View>

        <Text style={styles.cardTitle}>{t("farmer_category")}</Text>

        {/* FARMER CATEGORY */}
        <Text style={styles.label}>{t("farmer_category")} *</Text>

        {FARMER_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.radioOption}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={styles.radioButton}>
              {selectedCategory === category.id && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <Text style={styles.radioText}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* UPDATE BUTTON */}
      <TouchableOpacity
        style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
        onPress={handleUpdate}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.updateText}>{loading ? t("please_wait") : t("profile_screens.update")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ScreenThird;

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
    fontWeight: "700",
    marginBottom: 24,
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 8,
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: FARMER_COLORS.inputBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FARMER_COLORS.border,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: FARMER_COLORS.primaryLight,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: FARMER_COLORS.surface,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FARMER_COLORS.primaryLight,
  },
  radioText: {
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  updateBtn: {
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
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

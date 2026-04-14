import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchUserData();
  }, []);

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
          <Icon name="arrow-back" size={24} color="#1F2937" />
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
    backgroundColor: "#F4F6F8",
  },
  scrollContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  /* CARD */
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
  },

  /* FORM */
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
    color: "#4B5563",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAF8",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: FARMER_COLORS.primaryLight,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FARMER_COLORS.primaryLight,
  },
  radioText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },

  /* UPDATE BUTTON */
  updateBtn: {
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  updateBtnDisabled: {
    opacity: 0.7,
  },
  updateText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

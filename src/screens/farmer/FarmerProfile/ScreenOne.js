import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import apiService from "../../../Redux/apiService";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';


const Screen1 = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [gender, setGender] = useState("Male");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('🔄 ScreenOne - Fetching user data...');
      const response = await apiService.getProfileDetails();
      console.log('🔄 ScreenOne - Raw response:', JSON.stringify(response, null, 2));

      const userData = response.data || response;
      console.log('🔄 ScreenOne - Processed userData:', JSON.stringify(userData, null, 2));

      if (userData) {
        setfirstName(userData.firstName || "");
        setlastName(userData.lastName || "");
        setMobile(userData.phone || "");
        setVillage(userData.village || "");
        setGender(userData.gender || "Male");
        console.log('🔄 ScreenOne - Form populated with:', {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          village: userData.village,
          gender: userData.gender
        });
      }
    } catch (error) {
      console.error('🔄 ScreenOne - Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!firstName || !mobile || !village || !lastName) {
      showAlert({ type: 'warning', title: t("error"), message: t("fill_required_fields") });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 ScreenOne - Current form values:', {
        firstName,
        lastName,
        mobile,
        village,
        gender
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

      showAlert({ type: 'success', title: t("success"), message: t("profile_screens.profile_updated"), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('🔄 ScreenOne - Update profile error:', error);
      showAlert({ type: 'error', title: t("error"), message: t("profile_screens.profile_update_failed") });
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
        <Text style={styles.headerTitle}>{t("profile_screens.personal_details")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name="person" size={20} color={FARMER_COLORS.primaryLight} />
        </View>

        <Text style={styles.cardTitle}>{t("profile_screens.edit_personal_details")}</Text>

        {/* FULL NAME */}
        <Text style={styles.label}>{t("first_name")} *</Text>
        <TextInput
          placeholder={t("enter_first_name")}
          style={styles.input}
          value={firstName}
          onChangeText={setfirstName}
        />

        {/* FULL NAME */}
        <Text style={styles.label}>{t("last_name")} *</Text>
        <TextInput
          placeholder={t("enter_last_name")}
          style={styles.input}
          value={lastName}
          onChangeText={setlastName}
        />

        {/* MOBILE */}
        <Text style={styles.label}>{t("mobile_number")} *</Text>
        <TextInput
          placeholder={t("mobile_placeholder_short")}
          keyboardType="numeric"
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
        />

        {/* GENDER */}
        <Text style={styles.label}>{t("gender")} *</Text>
        <View style={styles.genderRow}>
          {["Male", "Female", "Other"].map((item) => (
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
        <Text style={styles.label}>{t("village")} *</Text>
        <TextInput
          placeholder={t("enter_village")}
          style={styles.input}
          value={village}
          onChangeText={setVillage}
        />
      </View>

      {/* UPDATE BUTTON */}
      <TouchableOpacity
        style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.updateText}>{loading ? t("profile_screens.updating") : t("profile_screens.update")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default Screen1;
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
    marginBottom: 8,
    marginTop: 16,
    color: "#4B5563",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAF8",
    fontSize: 15,
    color: "#1F2937",
  },

  /* GENDER */
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  genderBtn: {
    width: "31%",
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  genderBtnActive: {
    backgroundColor: "#FEF9E7",
    borderColor: FARMER_COLORS.primaryLight,
  },
  genderText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#b49509",
    fontWeight: "700",
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






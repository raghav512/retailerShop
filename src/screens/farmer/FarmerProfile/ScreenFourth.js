import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import apiService from "../../../Redux/apiService";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenFourth = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [cropName, setCropName] = useState("");
  const [season, setSeason] = useState("kharif");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiService.getProfileDetails();
      const userData = response.data || response;

      if (userData && userData.cropsGrown && userData.cropsGrown.length > 0) {
        const firstCrop = userData.cropsGrown[0];
        setCropName(firstCrop.cropName || "");
        setSeason(firstCrop.season || "kharif");
        setQuantity(firstCrop.quantityProduced || "");
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleUpdate = async () => {
    if (!cropName) {
      showAlert({ type: 'warning', title: t("error"), message: t("profile_screens.enter_crop_name_alert") });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        cropsGrown: [{
          cropName,
          season,
          quantityProduced: quantity
        }]
      };

      await apiService.UpdateProfileData(profileData);
      showAlert({ type: 'success', title: t("success"), message: t("profile_screens.crops_updated"), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('Update profile error:', error);
      showAlert({ type: 'error', title: t("error"), message: t("profile_screens.crops_failed") });
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
        <Text style={styles.headerTitle}>{t("profile_screens.crops_grown")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name="leaf" size={20} color={FARMER_COLORS.primaryLight} />
        </View>

        <Text style={styles.cardTitle}>{t("profile_screens.edit_crops_grown")}</Text>
        <Text style={styles.cardSubtitle}>{t("profile_screens.update_crop_info")}</Text>

        {loading ? (
          <ActivityIndicator color={FARMER_COLORS.primaryLight} style={{ marginTop: 20 }} />
        ) : (
          <>
            <Text style={styles.label}>{t("add_crop.crop_name")}</Text>
            <TextInput
              placeholder={t("add_crop.crop_name_placeholder")}
              style={styles.input}
              value={cropName}
              onChangeText={setCropName}
            />

            <Text style={styles.label}>{t("profile_screens.season")}</Text>
            <View style={styles.seasonContainer}>
              {["kharif", "rabi", "zaid"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.seasonBtn, season === s && styles.seasonBtnActive]}
                  onPress={() => setSeason(s)}
                >
                  <Text style={[styles.seasonText, season === s && styles.seasonTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t("profile_screens.quantity_produced")}</Text>
            <TextInput
              placeholder={t("profile_screens.enter_quantity")}
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
            />
          </>
        )}
      </View>

      {/* UPDATE BUTTON */}
      <TouchableOpacity
        style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
        onPress={handleUpdate}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateText}>{t("profile_screens.save_changes")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ScreenFourth;

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
    marginBottom: 4,
    color: "#1F2937",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
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

  seasonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  seasonBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  seasonBtnActive: {
    backgroundColor: "#FEF9E7",
    borderColor: FARMER_COLORS.primaryLight,
  },
  seasonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  seasonTextActive: {
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

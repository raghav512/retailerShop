import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import apiService from "../../../Redux/apiService";
import { launchImageLibrary } from "react-native-image-picker";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../Redux/Storage";
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import { validateFirstName, validateLastName, validateEmail } from '../../../utils/validation';

const THEME = STAFF_COLORS.primary;

const EditProfile = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const params = route?.params || {};

  const [formData, setFormData] = useState({ firstName: "", lastName: "", emailId: "" });
  const [errors, setErrors] = useState({ firstName: "", lastName: "", emailId: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageNew, setProfileImageNew] = useState(null);

  useEffect(() => {
    if (params.firstName || params.lastName || params.emailId) {
      setFormData({
        firstName: params.firstName || "",
        lastName: params.lastName || "",
        emailId: params.emailId || ""
      });
    }
    if (params.profileImage) {
      setProfileImage(params.profileImage);
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfileDetails();
      if (res) {
        setFormData({ firstName: res.firstName || "", lastName: res.lastName || "", emailId: res.emailId || "" });
        let imageUri = null;
        if (res?.profileImage) {
          if (typeof res.profileImage === "object" && res.profileImage.url) imageUri = res.profileImage.url;
          else if (typeof res.profileImage === "string" && res.profileImage !== "null" && res.profileImage !== "undefined") imageUri = res.profileImage;
        }
        setProfileImage(imageUri);
      }
    } catch (e) { console.log("Profile fetch error:", e); }
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.7, maxWidth: 400, maxHeight: 400, includeBase64: true }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets[0];
      setProfileImageNew(asset);
      setUploading(true);
      try {
        const token = await getAccessToken();
        const apiResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profileImage: `data:${asset.type};base64,${asset.base64}` }),
        });
        if (!apiResponse.ok) { const errorData = await apiResponse.json(); throw new Error(errorData.message || `HTTP error! status: ${apiResponse.status}`); }
        setProfileImage(asset.uri);
        setProfileImageNew(null);
        await fetchProfile();
        showAlert({ type: "success", title: t("edit_profile.success"), message: t("edit_profile.image_success") });
      } catch (error) {
        showAlert({ type: "error", title: t("edit_profile.error"), message: error.message || t("edit_profile.image_error") });

      } finally { setUploading(false); }
    });
  };

  const handleUpdate = async () => {
    const firstNameValidation = validateFirstName(formData.firstName);
    const lastNameValidation = validateLastName(formData.lastName);
    const emailValidation = validateEmail(formData.emailId, { required: false });

    const newErrors = {
      firstName: firstNameValidation.isValid ? "" : firstNameValidation.message,
      lastName: lastNameValidation.isValid ? "" : lastNameValidation.message,
      emailId: emailValidation.isValid ? "" : emailValidation.message,
    };

    setErrors(newErrors);

    if (newErrors.firstName || newErrors.lastName || newErrors.emailId) {
      showAlert({ type: "error", title: t("edit_profile.error"), message: t("edit_profile.validation_error") });
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessToken();
      const apiResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!apiResponse.ok) { const errorData = await apiResponse.json(); throw new Error(errorData.message || `HTTP error! status: ${apiResponse.status}`); }
      showAlert({ type: "success", title: t("edit_profile.success"), message: t("edit_profile.profile_success") });
      navigation.goBack();
    } catch (error) {
      showAlert({ type: "error", title: t("edit_profile.error"), message: t("edit_profile.profile_error") });

    } finally { setLoading(false); }
  };

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor={STAFF_COLORS.primary} translucent={false} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("edit_profile.title")}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.85}>
            {uploading ? (
              <View style={styles.avatar}>
                <ActivityIndicator color={THEME} size="large" />
              </View>
            ) : profileImageNew?.uri || profileImage ? (
              <Image source={{ uri: profileImageNew?.uri || profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                {initials ? (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                ) : (
                  <Icon name="person-outline" size={44} color={THEME} />
                )}
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Icon name="camera" size={15} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.avatarLabel}>{t("edit_profile.tap_to_change")}</Text>
          {uploading && <Text style={styles.uploadingText}>{t("edit_profile.uploading")}</Text>}
        </View>

        {/* FORM CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="person" size={16} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("edit_profile.personal_details")}</Text>
          </View>


          <Text style={styles.label}>{t("edit_profile.first_name")}</Text>
          <View style={[styles.inputWrapper, errors.firstName && styles.inputError]}>
            <Icon name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, firstName: text }));
                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
              }}
              onBlur={() => {
                const validation = validateFirstName(formData.firstName);
                if (!validation.isValid) {
                  setErrors(prev => ({ ...prev, firstName: validation.message }));
                }
              }}
              placeholder={t("edit_profile.enter_first_name")}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}


          <Text style={styles.label}>{t("edit_profile.last_name")}</Text>
          <View style={[styles.inputWrapper, errors.lastName && styles.inputError]}>
            <Icon name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, lastName: text }));
                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
              }}
              onBlur={() => {
                const validation = validateLastName(formData.lastName);
                if (!validation.isValid) {
                  setErrors(prev => ({ ...prev, lastName: validation.message }));
                }
              }}
              placeholder={t("edit_profile.enter_last_name")}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}


          <Text style={styles.label}>{t("edit_profile.email")}</Text>
          <View style={[styles.inputWrapper, errors.emailId && styles.inputError]}>
            <Icon name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.emailId}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, emailId: text }));
                if (errors.emailId) setErrors(prev => ({ ...prev, emailId: "" }));
              }}
              onBlur={() => {
                const validation = validateEmail(formData.emailId, { required: false });
                if (!validation.isValid) {
                  setErrors(prev => ({ ...prev, emailId: validation.message }));
                }
              }}
              placeholder={t("edit_profile.enter_email")}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.emailId ? <Text style={styles.errorText}>{errors.emailId}</Text> : null}
        </View>

        {/* UPDATE BUTTON */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.updateText}>{t("edit_profile.update_btn")}</Text>
            </>

          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  scroll: { padding: 20, paddingBottom: 40 },

  /* AVATAR */
  avatarSection: { alignItems: "center", marginBottom: 28, marginTop: 8 },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#FAF7E8",
    borderWidth: 3, borderColor: THEME,
    justifyContent: "center", alignItems: "center",
  },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: THEME,
  },
  avatarInitials: {
    fontSize: 32, fontWeight: "800", color: THEME,
  },
  cameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: THEME,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: "#F4F6F8",
    elevation: 4,
  },
  avatarLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  uploadingText: { fontSize: 12, color: THEME, fontWeight: "600", marginTop: 4 },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  sectionIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#FAF7E8", alignItems: "center", justifyContent: "center", marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  /* INPUTS */
  label: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    backgroundColor: "#FAFAFA", marginBottom: 16, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 15, color: "#1F2937" },

  /* BUTTON */
  updateBtn: {
    backgroundColor: STAFF_COLORS.primary, height: 56, borderRadius: 24,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
  updateText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  inputError: { borderColor: "#EF4444" },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: -12, marginBottom: 12, marginLeft: 4 },
});

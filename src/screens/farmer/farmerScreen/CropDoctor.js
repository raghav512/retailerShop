import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Dimensions,
  PermissionsAndroid,
  StatusBar,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { API_BASE_URL, GEMINI_API_KEY } from "@env";
import apiService from '../../../Redux/apiService';
import { getAccessToken } from '../../../Redux/Storage';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');
// Responsive font size calculation
const RFValue = (fontSize) => {
  const standardScreenWidth = 375;
  const scale = width / standardScreenWidth;
  return Math.round(fontSize * scale);
};

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is missing. Check your config file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ Maximum report limit
const MAX_REPORTS = 5;

export default function CropDoctor({ navigation }) {
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null); // ✅ Store base64 directly
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState("english");

  // ✅ Fix userId retrieval based on the stored user structure
  useEffect(() => {
    (async () => {
      try {
        // First try to get from userData key (as shown in logs)
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log("STORED USER DATA:", userData);
          const id = userData.id || userData._id;
          setUserId(id);
          console.log("User ID from userData:", id);
          return;
        }

        // Fallback to user key
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userObj = JSON.parse(userString);
          console.log("STORED USER (fallback):", userObj);
          const id = userObj.id || userObj._id;
          setUserId(id);
          console.log("User ID from user:", id);
          return;
        }

        // Final fallback to direct userId
        const directId = await AsyncStorage.getItem("userId");
        setUserId(directId);
        console.log("User ID (direct):", directId);

      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    })();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('crop_doctor_screen.camera_permission_title'),
            message: t('crop_doctor_screen.camera_permission_msg'),
            buttonNeutral: t('crop_doctor_screen.ask_me_later'),
            buttonNegative: t('crop_doctor_screen.cancel'),
            buttonPositive: t('crop_doctor_screen.ok'),
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE
        if (Platform.Version >= 33) {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const storageGranted = Platform.Version >= 33
          ? granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED
          : granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

        return cameraGranted && storageGranted;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      showAlert({
        type: 'warning',
        title: t('crop_doctor_screen.permission_required_title'),
        message: t('crop_doctor_screen.camera_permission_denied'),
        buttons: [{ text: t('crop_doctor_screen.ok') }]
      });
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.6,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.errorCode) {
        showAlert({ type: 'error', title: t('error'), message: response.errorMessage || t('crop_doctor_screen.camera_error') });
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setDiagnosis("");
        setIsSaved(false);
      }
    });
  };

  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      showAlert({
        type: 'warning',
        title: t('crop_doctor_screen.permission_required_title'),
        message: t('crop_doctor_screen.storage_permission_denied'),
        buttons: [{ text: t('crop_doctor_screen.ok') }]
      });
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.6,
    };

    launchImageLibrary(options, (response) => {
      if (response.errorCode) {
        showAlert({ type: 'error', title: t('error'), message: response.errorMessage || t('crop_doctor_screen.gallery_error') });
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setDiagnosis("");
        setIsSaved(false);
      }
    });
  };

  const handleDiagnose = async () => {
    if (!imageUri || !imageBase64) {
      showAlert({ type: 'warning', title: t('crop_doctor_screen.no_image_title'), message: t('crop_doctor_screen.please_select_image') });
      return;
    }

    if (!GEMINI_API_KEY) {
      showAlert({
        type: 'warning',
        title: t('crop_doctor_screen.config_error_title'),
        message: t('crop_doctor_screen.api_key_missing')
      });
      return;
    }

    setLoading(true);
    setDiagnosis("");
    setIsSaved(false);

    try {
      const promptText =
        "Analyze this crop leaf image and identify any disease. Provide response in this exact plain text format without markdown:\n\n" +
        "DISEASE NAME:\n" +
        "[Disease name here]\n\n" +
        "SYMPTOMS:\n" +
        "- [Symptom 1]\n" +
        "- [Symptom 2]\n" +
        "- [Symptom 3]\n\n" +
        "CAUSES:\n" +
        "[Explain what causes this disease]\n\n" +
        "TREATMENT:\n" +
        "- [Treatment step 1]\n" +
        "- [Treatment step 2]\n" +
        "- [Treatment step 3]\n\n" +
        "RECOMMENDED CHEMICALS:\n" +
        "- [Chemical/Fungicide/Pesticide name 1] - [Dosage and how to apply]\n" +
        "- [Chemical/Fungicide/Pesticide name 2] - [Dosage and how to apply]\n" +
        "- [Chemical/Fungicide/Pesticide name 3] - [Dosage and how to apply]\n\n" +
        "RECOMMENDED FERTILIZERS:\n" +
        "- [Fertilizer name 1] - [NPK ratio and application method]\n" +
        "- [Fertilizer name 2] - [NPK ratio and application method]\n\n" +
        "ORGANIC ALTERNATIVES:\n" +
        "- [Organic solution 1]\n" +
        "- [Organic solution 2]\n\n" +
        "PREVENTION:\n" +
        "- [Prevention tip 1]\n" +
        "- [Prevention tip 2]\n" +
        "- [Prevention tip 3]\n\n" +
        "Keep it simple and actionable. Use plain text only, no #, **, or markdown symbols. Provide specific chemical names, brands commonly available in India, exact dosages, and application methods.";

      const prompt = language === "hindi"
        ? promptText + "\n\nCRITICAL INSTRUCTION: You MUST provide the ENTIRE response and all of its content in Hindi language. Translate all headings, symptoms, treatments etc. to Hindi."
        : promptText;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const resultText = response.text();

      setDiagnosis(resultText || t('crop_doctor_screen.no_diagnosis_generated'));
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        showAlert({
          type: 'warning',
          title: t('crop_doctor_screen.daily_limit_title'),
          message: t('crop_doctor_screen.daily_limit_msg')
        });
      } else if (
        error.message?.includes('API key not valid') ||
        error.message?.includes('API_KEY_INVALID')
      ) {
        showAlert({
          type: 'error',
          title: t('crop_doctor_screen.api_key_error_title'),
          message: t('crop_doctor_screen.api_key_invalid')
        });
      } else {
        showAlert({ type: 'error', title: t('error'), message: t('crop_doctor_screen.analysis_failed') });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save diagnosis report
  const saveDiagnosis = async () => {
    if (!userId) {
      showAlert({ type: 'warning', title: t('crop_doctor_screen.login_required'), message: t('crop_doctor_screen.login_to_save') });
      return;
    }

    if (!diagnosis || !imageUri) {
      showAlert({ type: 'error', title: t('error'), message: t('crop_doctor_screen.no_diagnosis') });
      return;
    }

    if (isSaved) {
      const message = t('crop_doctor_screen.already_saved');
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        showAlert({ type: 'info', title: t('crop_doctor_screen.already_saved_title'), message });
      }
      return;
    }

    setSaving(true);

    try {
      // Check report count
      let reportCount = 0;
      try {
        const reports = await apiService.getUserReports(userId);
        reportCount = reports.data?.length || 0;
        console.log("Current report count:", reportCount);
      } catch (countError) {
        console.log("No existing reports or error fetching count:", countError.message);
        // Continue with save even if we can't get count
      }

      if (reportCount >= MAX_REPORTS) {
        const message = t('crop_doctor_screen.max_reports_msg', { max: MAX_REPORTS });

        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.LONG);
        }

        showAlert({
          type: 'warning',
          title: t('crop_doctor_screen.storage_limit'),
          message: t('crop_doctor_screen.max_reports_msg', { max: MAX_REPORTS }),
          buttons: [{ text: t('cart.cancel'), style: 'cancel' }]
        });
        setSaving(false);
        return;
      }

      // Create payload with base64 image
      const payload = {
        userId: userId,
        diagnosis: diagnosis,
        diagnosisImage: `data:image/jpeg;base64,${imageBase64}`,
      };

      console.log("📤 Saving diagnosis with payload:");
      console.log("- userId:", userId);
      console.log("- diagnosis length:", diagnosis.length);
      console.log("- diagnosisImage format: base64");
      console.log("- diagnosisImage size:", imageBase64?.length || 0, "chars");
      console.log("- Full payload keys:", Object.keys(payload));

      const token = await getAccessToken();
      console.log("- token exists:", !!token);
      console.log("- token preview:", token ? token.substring(0, 20) + '...' : 'none');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/crop-doctor/saveReport`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      console.log("✅ Save response:", JSON.stringify(response.data, null, 2));

      if (response.data.status === "success") {
        setIsSaved(true);

        if (Platform.OS === "android") {
          ToastAndroid.show(t('crop_doctor_screen.save_success_toast'), ToastAndroid.SHORT);
        }

        showAlert({
          type: 'success',
          title: t('success'),
          message: t('crop_doctor_screen.save_success_alert'),
          buttons: [
            { text: t('crop_doctor_screen.view_reports'), onPress: () => navigation.navigate('DiagonsisHistory') },
            { text: t('crop_doctor_screen.new_analysis'), onPress: () => { setImageUri(null); setImageBase64(null); setDiagnosis(''); setIsSaved(false); } },
          ]
        });
      } else {
        throw new Error(response.data.message || t('crop_doctor_screen.save_failed'));
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);

      if (error.response?.status === 401) {
        showAlert({
          type: 'warning',
          title: t('crop_doctor_screen.session_expired'),
          message: t('crop_doctor_screen.login_again'),
          buttons: [{ text: t('crop_doctor_screen.login'), onPress: () => navigation.navigate('Login') }]
        });
      } else {
        showAlert({
          type: 'error',
          title: t('error'),
          message: error.response?.data?.message || t('crop_doctor_screen.save_failed')
        });
      }
    } finally {
      setSaving(false);
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.headerSpacer} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={FARMER_COLORS.textOnPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="leaf" size={28} color={FARMER_COLORS.textOnPrimary} />
            <Text style={styles.headerTitle}>{t('crop_doctor_screen.title')}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Content */}
        {!imageUri ? (
          <View style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="image-plus"
                size={60}
                color={FARMER_COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>{t('crop_doctor_screen.no_image')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('crop_doctor_screen.upload_prompt')}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={openCamera}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.buttonText}>{t('crop_doctor_screen.camera')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openGallery}
              >
                <Ionicons name="images" size={24} color={FARMER_COLORS.primary} />
                <Text style={styles.secondaryButtonText}>{t('crop_doctor_screen.gallery')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                  setDiagnosis("");
                  setIsSaved(false);
                }}
              >
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            {!diagnosis && !loading && (
              <>
                <View style={styles.languageToggleContainer}>
                  <Text style={styles.languageToggleLabel}>{t('crop_doctor_screen.select_lang')}</Text>
                  <View style={styles.languageToggleButtons}>
                    <TouchableOpacity
                      style={[styles.langButton, language === "english" && styles.langButtonActive]}
                      onPress={() => setLanguage("english")}
                    >
                      <Text style={[styles.langButtonText, language === "english" && styles.langButtonTextActive]}>English</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.langButton, language === "hindi" && styles.langButtonActive]}
                      onPress={() => setLanguage("hindi")}
                    >
                      <Text style={[styles.langButtonText, language === "hindi" && styles.langButtonTextActive]}>हिंदी</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={handleDiagnose}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="microscope"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.analyzeText}>{t('crop_doctor_screen.analyze')}</Text>
                </TouchableOpacity>
              </>
            )}

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={FARMER_COLORS.primary} />
                <Text style={styles.loadingText}>{t('crop_doctor_screen.analyzing')}</Text>
              </View>
            )}

            {diagnosis && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="document-text" size={24} color={FARMER_COLORS.primary} />
                  <Text style={styles.resultTitle}>{t('crop_doctor_screen.report_title')}</Text>
                  {isSaved && (
                    <View style={styles.savedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={FARMER_COLORS.primary}
                      />
                      <Text style={styles.savedBadgeText}>{t('crop_doctor_screen.saved')}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.resultContent}>
                  <Text style={styles.resultText}>{diagnosis}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (saving || isSaved) && styles.saveButtonDisabled,
                    ]}
                    onPress={saveDiagnosis}
                    disabled={saving || isSaved}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : isSaved ? (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.saveButtonText}>{t('crop_doctor_screen.saved')}</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="save-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.saveButtonText}>{t('crop_doctor_screen.save')}</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => {
                      setImageUri(null);
                      setImageBase64(null);
                      setDiagnosis("");
                      setIsSaved(false);
                    }}
                  >
                    <Ionicons name="refresh" size={20} color={FARMER_COLORS.primary} />
                    <Text style={styles.newButtonText}>{t('crop_doctor_screen.new_analysis_btn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Fixed Bottom Button - View Reports */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.viewReportsButton}
          onPress={() => navigation.navigate("DiagonsisHistory")}
          activeOpacity={0.8}
        >
          <Ionicons name="folder-open-outline" size={24} color="#ffffff" />
          <Text style={styles.viewReportsText}>{t('crop_doctor_screen.view_reports')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  headerSpacer: {
    height: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "800",
    color: FARMER_COLORS.textOnPrimary,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(142, 171, 83, 0.15)',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: FARMER_COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: RFValue(14),
    color: FARMER_COLORS.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(142, 171, 83, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.3)',
    gap: 6,
  },
  quickActionText: {
    color: FARMER_COLORS.primary,
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: FARMER_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 24,
    gap: 8,
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: RFValue(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: FARMER_COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.3)',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 24,
    gap: 8,
  },
  secondaryButtonText: {
    color: FARMER_COLORS.textPrimary,
    fontSize: RFValue(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  imageCard: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  image: {
    width: "100%",
    height: 380,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(142, 171, 83, 0.9)",
    borderRadius: 20,
    padding: 4,
  },
  languageToggleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  languageToggleLabel: {
    fontSize: RFValue(14),
    color: FARMER_COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  languageToggleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  langButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.2)',
    backgroundColor: FARMER_COLORS.surface,
    alignItems: "center",
  },
  langButtonActive: {
    backgroundColor: FARMER_COLORS.primary,
    borderColor: FARMER_COLORS.primary,
  },
  langButtonText: {
    color: FARMER_COLORS.textSecondary,
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  langButtonTextActive: {
    color: FARMER_COLORS.textOnPrimary,
    fontWeight: "700",
  },
  analyzeButton: {
    backgroundColor: FARMER_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
    elevation: 3,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  analyzeText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: RFValue(16),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  loadingBox: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  loadingText: {
    fontSize: RFValue(15),
    color: FARMER_COLORS.textPrimary,
    marginTop: 16,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142, 171, 83, 0.1)',
  },
  resultTitle: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: FARMER_COLORS.textPrimary,
    marginLeft: 10,
    flex: 1,
    letterSpacing: 0.3,
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(142, 171, 83, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.3)',
  },
  savedBadgeText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    color: FARMER_COLORS.primary,
    letterSpacing: 0.3,
  },
  resultContent: {
    marginBottom: 24,
  },
  resultText: {
    fontSize: RFValue(15),
    color: FARMER_COLORS.textSecondary,
    lineHeight: 26,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FARMER_COLORS.primary,
    padding: 16,
    borderRadius: 24,
    gap: 8,
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(142, 171, 83, 0.4)',
    opacity: 0.8,
  },
  saveButtonText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: RFValue(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  newButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FARMER_COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.3)',
    padding: 16,
    borderRadius: 24,
    gap: 8,
  },
  newButtonText: {
    color: FARMER_COLORS.textPrimary,
    fontSize: RFValue(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  viewReportsButton: {
    backgroundColor: FARMER_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 28,
    gap: 10,
    elevation: 4,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  viewReportsText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: RFValue(16),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

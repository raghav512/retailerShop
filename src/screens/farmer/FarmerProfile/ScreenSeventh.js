
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { pick, types } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenSeventh = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [soilCard, setSoilCard] = useState(null);
  const [labReport, setLabReport] = useState(null);
  const [govDoc, setGovDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);


  console.log("Base Url: ", API_BASE_URL)

  const pickDocument = async (setter) => {
    try {
      const result = await pick({
        type: [types.pdf, types.allFiles],
        allowMultiSelection: false,
      });

      const file = result[0];
      setter({
        uri: file.uri || file.fileCopyUri,
        name: file.name || file.fileName,
        type: file.type || file.mime,
        size: file.size,
      });
    } catch (error) {
      if (error.code === "DOCUMENT_PICKER_CANCELED") {
        return;
      } else {
        console.log('Picker error:', error);
        showAlert({ type: 'error', title: t('error'), message: t('profile_screens.docs_failed') });
      }
    }
  };

  const handleSave = async () => {
    if (!soilCard && !labReport && !govDoc) {
      showAlert({ type: 'warning', title: t('error'), message: t('profile_screens.upload_at_least_one') });
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken();
      const payload = {};

      if (soilCard) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(soilCard.uri, 'base64');
        payload.soilHealthCard = `data:${soilCard.type || 'application/pdf'};base64,${base64}`;
      }

      if (labReport) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(labReport.uri, 'base64');
        payload.labReport = `data:${labReport.type || 'application/pdf'};base64,${base64}`;
      }

      if (govDoc) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(govDoc.uri, 'base64');
        payload.govtSchemeDocs = `data:${govDoc.type || 'application/pdf'};base64,${base64}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      showAlert({ type: 'success', title: t('success'), message: t('profile_screens.docs_uploaded'), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('Upload error:', error.message);
      showAlert({ type: 'error', title: t('error'), message: error.message || t('profile_screens.docs_failed') });
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
        <Text style={styles.headerTitle}>{t("profile_screens.document_upload")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("profile_screens.upload_documents")}</Text>
        <Text style={styles.cardSub}>{t("profile_screens.upload_supporting_docs")}</Text>

        {/* Soil Health Card */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadBox, soilCard && styles.uploadBoxActive]}
            onPress={() => pickDocument(setSoilCard)}
          >
            <Text style={styles.uploadText}>
              {soilCard ? soilCard.name : t("profile_screens.upload_soil_card")}
            </Text>
          </TouchableOpacity>
          {soilCard && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setSoilCard(null)}
            >
              <Icon name="close-circle" size={20} color="#D32F2F" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lab Report */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadBox, labReport && styles.uploadBoxActive]}
            onPress={() => pickDocument(setLabReport)}
          >
            <Text style={styles.uploadText}>
              {labReport ? labReport.name : t("profile_screens.upload_lab_report")}
            </Text>
          </TouchableOpacity>
          {labReport && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setLabReport(null)}
            >
              <Icon name="close-circle" size={20} color="#D32F2F" />
            </TouchableOpacity>
          )}
        </View>

        {/* Government Document */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadBox, govDoc && styles.uploadBoxActive]}
            onPress={() => pickDocument(setGovDoc)}
          >
            <Text style={styles.uploadText}>
              {govDoc ? govDoc.name : t("profile_screens.upload_gov_doc")}
            </Text>
          </TouchableOpacity>
          {govDoc && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setGovDoc(null)}
            >
              <Icon name="close-circle" size={20} color="#D32F2F" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={[styles.completeBtn, loading && styles.completeBtnDisabled]}
        disabled={loading}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.completeText}>{t("profile_screens.save_documents")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />

      {/* DISCLAIMER SECTION */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          {t("profile_screens.disclaimer_text")}
        </Text>

        <TouchableOpacity onPress={() => setShowMoreInfo(!showMoreInfo)}>
          <Text style={styles.moreInfoText}>
            {showMoreInfo ? t("profile_screens.hide_details") : t("profile_screens.view_details")}
          </Text>
        </TouchableOpacity>

        {showMoreInfo && (
          <Text style={styles.moreInfoContent}>
            {t("profile_screens.disclaimer_content_1")}{'\n\n'}
            {t("profile_screens.disclaimer_content_2")}{'\n\n'}
            {t("profile_screens.disclaimer_content_3")}
          </Text>
        )}
      </View>

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
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: FARMER_COLORS.border,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FARMER_COLORS.inputBackground,
  },
  removeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  uploadBoxActive: {
    backgroundColor: FARMER_COLORS.primaryLight + '10',
    borderColor: FARMER_COLORS.primaryLight,
  },
  uploadText: {
    fontSize: 14,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  completeBtn: {
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
  completeBtnDisabled: {
    opacity: 0.6,
  },
  completeText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disclaimerContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
  },

  disclaimerText: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
  },

  moreInfoText: {
    marginTop: 6,
    fontSize: 14,
    color: FARMER_COLORS.primaryLight,
    fontWeight: '700',
  },

  moreInfoContent: {
    marginTop: 8,
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },

});

export default ScreenSeventh;


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { pick, types } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

const Documents = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [businessLicense, setBusinessLicense] = useState(null);
  const [gstCertificate, setGstCertificate] = useState(null);
  const [tradeLicense, setTradeLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  console.log('Base Url: ', API_BASE_URL);

  const pickDocument = async setter => {
    try {
      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      const file = result[0];
      const fileUri = file.uri || file.fileCopyUri;
      const fileName = file.name || file.fileName || 'document';
      let fileType = file.type || file.mime || 'application/pdf';

      // Ensure valid MIME type
      if (!fileType || fileType === 'null' || fileType === 'undefined') {
        if (fileName.toLowerCase().endsWith('.pdf')) {
          fileType = 'application/pdf';
        } else if (fileName.match(/\.(jpg|jpeg)$/i)) {
          fileType = 'image/jpeg';
        } else if (fileName.toLowerCase().endsWith('.png')) {
          fileType = 'image/png';
        } else {
          fileType = 'application/pdf';
        }
      }

      setter({
        uri: fileUri,
        name: fileName,
        type: fileType,
        size: file.size,
      });
    } catch (error) {
      const isPickerCancelled =
        error?.code === 'OPERATION_CANCELED' ||
        error?.code === 'DOCUMENT_PICKER_CANCELED';

      if (isPickerCancelled) {
        return;
      } else {
        console.log('Picker error:', error);
        showAlert({
          type: 'error',
          title: t('error'),
          message: t('profile_screens.docs_failed'),
        });
      }
    }
  };

  const handleSave = async () => {
    if (!businessLicense && !gstCertificate && !tradeLicense) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('profile_screens.upload_at_least_one'),
      });
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken();
      const payload = {};

      if (businessLicense) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(
          businessLicense.uri,
          'base64',
        );
        payload.businessLicense = `data:${
          businessLicense.type || 'application/pdf'
        };base64,${base64}`;
      }

      if (gstCertificate) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(
          gstCertificate.uri,
          'base64',
        );
        payload.gstCertificate = `data:${
          gstCertificate.type || 'application/pdf'
        };base64,${base64}`;
      }

      if (tradeLicense) {
        const base64 = await ReactNativeBlobUtil.fs.readFile(
          tradeLicense.uri,
          'base64',
        );
        payload.tradeLicense = `data:${
          tradeLicense.type || 'application/pdf'
        };base64,${base64}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Upload failed: ${response.status}`,
        );
      }

      showAlert({
        type: 'success',
        title: t('success'),
        message: t('profile_screens.docs_uploaded'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error('Upload error:', error.message);
      showAlert({
        type: 'error',
        title: t('error'),
        message: error.message || t('profile_screens.docs_failed'),
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
          {t('profile_screens.document_upload')}
        </Text>
        <View style={styles.headerSpacerView} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('profile_screens.upload_documents')}
          </Text>
          <Text style={styles.cardSub}>
            {t('profile_screens.upload_business_docs')}
          </Text>

          {/* Business License */}
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                businessLicense && styles.uploadBoxActive,
              ]}
              onPress={() => pickDocument(setBusinessLicense)}
            >
              <Text style={styles.uploadText}>
                {businessLicense
                  ? businessLicense.name
                  : t('profile_screens.upload_business_license')}
              </Text>
            </TouchableOpacity>
            {businessLicense && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setBusinessLicense(null)}
              >
                <Icon name="close-circle" size={20} color="#D32F2F" />
              </TouchableOpacity>
            )}
          </View>

          {/* GST Certificate */}
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                gstCertificate && styles.uploadBoxActive,
              ]}
              onPress={() => pickDocument(setGstCertificate)}
            >
              <Text style={styles.uploadText}>
                {gstCertificate
                  ? gstCertificate.name
                  : t('profile_screens.upload_gst_certificate')}
              </Text>
            </TouchableOpacity>
            {gstCertificate && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setGstCertificate(null)}
              >
                <Icon name="close-circle" size={20} color="#D32F2F" />
              </TouchableOpacity>
            )}
          </View>

          {/* Trade License */}
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={[styles.uploadBox, tradeLicense && styles.uploadBoxActive]}
              onPress={() => pickDocument(setTradeLicense)}
            >
              <Text style={styles.uploadText}>
                {tradeLicense
                  ? tradeLicense.name
                  : t('profile_screens.upload_trade_license')}
              </Text>
            </TouchableOpacity>
            {tradeLicense && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setTradeLicense(null)}
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
            <Text style={styles.completeText}>
              {t('profile_screens.save_documents')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.sectionSpacer} />

        {/* DISCLAIMER SECTION */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {t('profile_screens.disclaimer_text')}
          </Text>

          <TouchableOpacity onPress={() => setShowMoreInfo(!showMoreInfo)}>
            <Text style={styles.moreInfoText}>
              {showMoreInfo
                ? t('profile_screens.hide_details')
                : t('profile_screens.view_details')}
            </Text>
          </TouchableOpacity>

          {showMoreInfo && (
            <Text style={styles.moreInfoContent}>
              {t('profile_screens.disclaimer_content_1')}
              {'\n\n'}
              {t('profile_screens.disclaimer_content_2')}
              {'\n\n'}
              {t('profile_screens.disclaimer_content_3')}
            </Text>
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
  headerSpacerView: {
    width: 40,
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
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAF8',
  },
  removeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  uploadBoxActive: {
    backgroundColor: RETAILER_COLORS.secondary,
    borderColor: RETAILER_COLORS.primaryLight,
  },
  uploadText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  completeBtn: {
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
  completeBtnDisabled: {
    backgroundColor: RETAILER_COLORS.primaryDisabled,
    opacity: 1,
  },
  completeText: {
    color: RETAILER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSpacer: {
    height: 30,
  },
  bottomSpacer: {
    height: 40,
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 8,
  },

  disclaimerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  moreInfoText: {
    marginTop: 6,
    fontSize: 14,
    color: RETAILER_COLORS.primaryLight,
    fontWeight: '700',
  },

  moreInfoContent: {
    marginTop: 8,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default Documents;

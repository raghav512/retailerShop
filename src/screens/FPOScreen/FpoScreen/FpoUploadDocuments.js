import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getAccessToken, getUserData } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const DOCUMENT_TYPES = [
  {
    key: 'seedLicense',
    labelKey: 'seed_license',
    icon: 'leaf-outline',
    color: '#4CAF50',
    maxCount: 1,
    identifierPrefix: 'SDL',
  },
  {
    key: 'fertilizerLicense',
    labelKey: 'fertilizer_license',
    icon: 'flask-outline',
    color: '#FF9800',
    maxCount: 1,
    identifierPrefix: 'FTL',
  },
  {
    key: 'procurementLicense',
    labelKey: 'procurement_license',
    icon: 'document-text-outline',
    color: '#2196F3',
    maxCount: 1,
    identifierPrefix: 'PRC',
  },
  {
    key: 'GSTCertificate',
    labelKey: 'gst_certificate',
    icon: 'receipt-outline',
    color: '#9C27B0',
    maxCount: 1,
    identifierPrefix: 'GST',
  },
  {
    key: 'PANCard',
    labelKey: 'pan_card',
    icon: 'card-outline',
    color: '#F44336',
    maxCount: 1,
    identifierPrefix: 'PAN',
  },
  {
    key: 'InsecticidesLicense',
    labelKey: 'insecticides_license',
    icon: 'bug-outline',
    color: '#795548',
    maxCount: 1,
    identifierPrefix: 'INS',
  },
  {
    key: 'FinancialDocuments',
    labelKey: 'financial_documents',
    icon: 'pie-chart-outline',
    color: '#8BC34A',
    maxCount: 3,
    identifierPrefix: 'FIN',
  },
  {
    key: 'OtherDocuments',
    labelKey: 'other_documents',
    icon: 'folder-open-outline',
    color: '#6D4C41',
    maxCount: 10,
    identifierPrefix: 'OTH',
    allowMultipleSelection: true,
  },
];

const createInitialDocumentsState = () =>
  DOCUMENT_TYPES.reduce((acc, docType) => {
    acc[docType.key] = docType.allowMultipleSelection ? [] : null;
    return acc;
  }, {});

const getDocumentTypeConfig = type =>
  DOCUMENT_TYPES.find(docType => docType.key === type);

const normalizeArray = value =>
  Array.isArray(value) ? value : value ? [value] : [];

const createPendingDocument = (file, replaceIndex = -1) => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  uri: file.uri || file.fileCopyUri,
  name: file.name || file.fileName || 'document',
  type: file.type || file.mime,
  size: file.size,
  replaceIndex,
});

const getDocumentIdentifier = (docType, index) =>
  `${docType.identifierPrefix}-${String(index + 1).padStart(2, '0')}`;

const getUploadedFileKey = (docTypeKey, upFile, index) =>
  upFile?._id ||
  upFile?.id ||
  upFile?.url ||
  upFile?.fileUrl ||
  upFile?.path ||
  upFile?.link ||
  upFile?.fileName ||
  upFile?.name ||
  `${docTypeKey}-${index}`;

const FpoUploadDocuments = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState(createInitialDocumentsState);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const getPendingDocuments = useCallback(
    type => normalizeArray(documents[type]),
    [documents],
  );

  const clearPendingDocuments = useCallback(type => {
    const docType = getDocumentTypeConfig(type);
    setDocuments(prev => ({
      ...prev,
      [type]: docType?.allowMultipleSelection ? [] : null,
    }));
  }, []);

  const removePendingDocument = useCallback((type, localId) => {
    const docType = getDocumentTypeConfig(type);

    setDocuments(prev => {
      const current = normalizeArray(prev[type]);
      const next = current.filter(item => item.localId !== localId);

      return {
        ...prev,
        [type]: docType?.allowMultipleSelection ? next : next[0] || null,
      };
    });
  }, []);

  const fetchUploadedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const userData = await getUserData();
      const userId = userData?.id || userData?._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const uploaded = {};
      let profileDataCache;

      const getProfileData = async () => {
        if (profileDataCache !== undefined) return profileDataCache;

        try {
          profileDataCache = await apiService.getProfileDetails();
        } catch (error) {
          console.error('Profile fallback error:', error);
          profileDataCache = null;
        }

        return profileDataCache;
      };

      for (const docType of DOCUMENT_TYPES) {
        try {
          let response = await fetch(
            `${API_BASE_URL}/api/admin/files/private?type=${docType.key}&userId=${userId}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            },
          );

          if (!response.ok) {
            response = await fetch(
              `${API_BASE_URL}/api/user/files/private?type=${docType.key}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              },
            );
          }

          if (response.ok) {
            const json = await response.json();
            const data = Array.isArray(json)
              ? json
              : Array.isArray(json?.data)
              ? json.data
              : Array.isArray(json?.files)
              ? json.files
              : [];

            if (data.length > 0) {
              uploaded[docType.key] = data;
              continue;
            }
          }

          const profileData = await getProfileData();
          const profileValue = profileData?.[docType.key];
          if (profileValue) {
            uploaded[docType.key] = normalizeArray(profileValue);
          }
        } catch (err) {
          console.error(`Error fetching ${docType.key}:`, err);
        }
      }

      setUploadedDocs(uploaded);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadedDocuments();
  }, [fetchUploadedDocuments]);

  const pickDocument = async (type, replaceIndex = -1) => {
    const docType = getDocumentTypeConfig(type);
    if (!docType) return;

    const uploadedArray = normalizeArray(uploadedDocs[type]);
    const pendingDocs = getPendingDocuments(type);
    const pendingNewCount = pendingDocs.filter(
      item => item.replaceIndex === -1,
    ).length;
    const remainingSlots =
      replaceIndex !== -1 || !docType.maxCount
        ? Number.MAX_SAFE_INTEGER
        : Math.max(
            docType.maxCount - uploadedArray.length - pendingNewCount,
            0,
          );

    if (remainingSlots === 0) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('document_limit_reached', { count: docType.maxCount }),
      });
      return;
    }

    try {
      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection:
          !!docType.allowMultipleSelection && replaceIndex === -1,
      });

      const selectedDocs = result
        .slice(0, remainingSlots)
        .map(file => createPendingDocument(file, replaceIndex));

      if (selectedDocs.length === 0) return;

      setDocuments(prev => {
        if (docType.allowMultipleSelection) {
          return {
            ...prev,
            [type]:
              replaceIndex === -1
                ? [...normalizeArray(prev[type]), ...selectedDocs]
                : selectedDocs,
          };
        }

        return {
          ...prev,
          [type]: selectedDocs[0],
        };
      });

      if (result.length > selectedDocs.length) {
        showAlert({
          type: 'info',
          title: t('file_selected_title'),
          message: t('files_selection_trimmed', {
            count: selectedDocs.length,
          }),
        });
        return;
      }

      showAlert({
        type: 'success',
        title: t('file_selected_title'),
        message:
          selectedDocs.length > 1
            ? t('files_selected_success', { count: selectedDocs.length })
            : t('file_selected_success', { name: selectedDocs[0].name }),
      });
    } catch (err) {
      const isPickerCancelled =
        err?.code === 'OPERATION_CANCELED' ||
        err?.code === 'DOCUMENT_PICKER_CANCELED';

      if (!isPickerCancelled) {
        console.error('Document picker error:', err);
      }
    }
  };

  const uploadDocument = async type => {
    const docType = getDocumentTypeConfig(type);
    const pendingDocs = getPendingDocuments(type);

    if (!docType || pendingDocs.length === 0) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('select_doc_first'),
      });
      return;
    }

    setUploading(type);
    try {
      const token = await getAccessToken();

      for (const doc of pendingDocs) {
        if (doc.replaceIndex !== undefined && doc.replaceIndex !== -1) {
          const deleteResponse = await fetch(
            `${API_BASE_URL}/api/user/update-profile`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                [`${type}_delete`]: doc.replaceIndex,
              }),
            },
          );

          const deleteJson = await deleteResponse.json();
          if (!deleteResponse.ok) {
            throw new Error(deleteJson?.message || t('failed_to_delete'));
          }
        }

        const base64 = await ReactNativeBlobUtil.fs.readFile(doc.uri, 'base64');
        const base64Data = `data:${
          doc.type || 'application/pdf'
        };base64,${base64}`;

        const payload = {
          [type]: base64Data,
          type,
        };

        const response = await fetch(
          `${API_BASE_URL}/api/user/update-profile`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.message || t('upload_failed'));
        }
      }

      showAlert({
        type: 'success',
        title: t('success'),
        message:
          pendingDocs.length > 1
            ? t('files_uploaded_successfully', { count: pendingDocs.length })
            : t('uploaded_successfully', { label: t(docType.labelKey) }),
      });

      clearPendingDocuments(type);
      fetchUploadedDocuments();
    } catch (err) {
      showAlert({
        type: 'error',
        title: t('upload_failed'),
        message: err.message || t('failed_to_upload'),
      });
    } finally {
      setUploading(null);
    }
  };

  const handleAction = async upFile => {
    const url = upFile?.url || upFile?.fileUrl || upFile?.path || upFile?.link;
    if (!url) {
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('url_not_available'),
      });
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (err) {
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('device_cant_open'),
      });
      console.error('View error:', err.message);
    }
  };

  const handleDownload = async upFile => {
    const url = upFile?.url || upFile?.fileUrl || upFile?.path || upFile?.link;
    if (!url) {
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('url_not_available'),
      });
      return;
    }

    try {
      showAlert({
        type: 'info',
        title: t('downloading'),
        message: t('download_started'),
        duration: 1500,
      });

      let extension = url.split('?')[0].split('.').pop();
      if (!extension || extension.length > 5) extension = 'pdf';

      let rawName =
        upFile.fileName || upFile.name || `document_${new Date().getTime()}`;
      if (!rawName.includes('.')) rawName += `.${extension}`;

      const fileName = rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_');

      const dirs = ReactNativeBlobUtil.fs.dirs;
      const downloadDir =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const configOptions =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                path: filePath,
                description: 'Downloading file.',
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };

      const res = await ReactNativeBlobUtil.config(configOptions).fetch(
        'GET',
        url,
      );

      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.previewDocument(res.path());
      } else {
        console.log('Downloaded successfully to:', res.path());
      }
    } catch (err) {
      console.error('Download Error:', err);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('download_failed'),
      });
    }
  };

  const handleDelete = async (docTypeKey, idx) => {
    const docType = getDocumentTypeConfig(docTypeKey);
    const documentId = docType ? getDocumentIdentifier(docType, idx) : idx + 1;

    showAlert({
      type: 'confirm',
      title: t('delete_file'),
      message: t('delete_confirm_msg', { index: documentId }),
      buttons: [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAccessToken();
              const response = await fetch(
                `${API_BASE_URL}/api/user/update-profile`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    [`${docTypeKey}_delete`]: idx,
                  }),
                },
              );

              const json = await response.json();
              if (!response.ok) {
                throw new Error(json?.message || t('failed_to_delete'));
              }

              showAlert({
                type: 'success',
                title: t('success'),
                message: t('file_deleted_success'),
              });
              fetchUploadedDocuments();
            } catch (err) {
              showAlert({
                type: 'error',
                title: t('error'),
                message: err.message || t('failed_to_delete'),
              });
              console.error('Delete error:', err);
            }
          },
        },
      ],
    });
  };

  const renderPendingDocuments = (docType, pendingDocs, isUploading) => {
    if (pendingDocs.length === 0) return null;

    return (
      <View style={styles.pendingContainer}>
        {pendingDocs.map((pendingDoc, index) => {
          const pendingLabel =
            pendingDoc.replaceIndex !== -1
              ? t('replacing_file', {
                  index: getDocumentIdentifier(
                    docType,
                    pendingDoc.replaceIndex,
                  ),
                })
              : t('ready_to_upload', {
                  id:
                    docType.allowMultipleSelection && pendingDocs.length > 1
                      ? `${docType.identifierPrefix}-NEW-${index + 1}`
                      : t('document_ready'),
                });

          return (
            <View key={pendingDoc.localId} style={styles.selectedDoc}>
              <View style={styles.docInfo}>
                <View style={styles.docInfoRow}>
                  <Icon name="document" size={16} color="#666" />
                  <Text style={styles.docName} numberOfLines={1}>
                    {pendingDoc.name}
                  </Text>
                </View>
                <Text style={styles.pendingLabel}>{pendingLabel}</Text>
              </View>

              <TouchableOpacity
                style={styles.pendingRemoveBtn}
                onPress={() =>
                  removePendingDocument(docType.key, pendingDoc.localId)
                }
                disabled={isUploading}
              >
                <Icon name="close-circle" size={18} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.btn, styles.selectBtn, styles.cancelBtn]}
            onPress={() => clearPendingDocuments(docType.key)}
            disabled={isUploading}
          >
            <Text style={[styles.btnText, styles.cancelBtnText]}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.uploadBtn]}
            onPress={() => uploadDocument(docType.key)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="cloud-upload-outline" size={16} color="#fff" />
                <Text style={[styles.btnText, styles.lightBtnText]}>
                  {t('upload')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDocumentCard = docType => {
    const pendingDocs = getPendingDocuments(docType.key);
    const uploadedArray = normalizeArray(uploadedDocs[docType.key]);
    const isUploading = uploading === docType.key;
    const pendingNewCount = pendingDocs.filter(
      item => item.replaceIndex === -1,
    ).length;
    const canAddNew = docType.maxCount
      ? uploadedArray.length + pendingNewCount < docType.maxCount
      : uploadedArray.length === 0;

    return (
      <View key={docType.key} style={styles.card}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${docType.color}18` },
          ]}
        >
          <Icon name={docType.icon} size={28} color={docType.color} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{t(docType.labelKey)}</Text>
          <Text style={styles.cardDesc}>
            {docType.maxCount > 1
              ? t('allowed_up_to', { count: docType.maxCount })
              : t('allowed_one_file')}
          </Text>

          {uploadedArray.map((upFile, idx) => {
            const fileName =
              upFile.fileName || upFile.name || `Document ${idx + 1}`;
            const documentId = getDocumentIdentifier(docType, idx);

            return (
              <View
                key={getUploadedFileKey(docType.key, upFile, idx)}
                style={styles.fileBlock}
              >
                <View style={[styles.uploadedDoc, styles.uploadedDocSpacing]}>
                  <View style={styles.docInfo}>
                    <View style={styles.docInfoRow}>
                      <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.uploadedText} numberOfLines={1}>
                        {fileName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.identifierBadge}>
                    <Text style={styles.identifierText}>{documentId}</Text>
                  </View>
                </View>

                {pendingDocs.length === 0 && (
                  <View style={[styles.cardActions, styles.wrapActions]}>
                    <TouchableOpacity
                      style={[styles.btn, styles.viewBtn]}
                      onPress={() => handleAction(upFile)}
                    >
                      <Icon
                        name="eye-outline"
                        size={14}
                        color={FPO_COLORS.primary}
                      />
                      <Text style={[styles.btnText, styles.viewBtnText]}>
                        {t('view')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btn, styles.downloadBtn]}
                      onPress={() => handleDownload(upFile)}
                    >
                      <Icon name="download-outline" size={14} color="#fff" />
                      <Text style={[styles.btnText, styles.lightBtnText]}>
                        {t('download')}
                      </Text>
                    </TouchableOpacity>

                    {docType.maxCount > 1 ? (
                      <TouchableOpacity
                        style={[styles.btn, styles.deleteBtn]}
                        onPress={() => handleDelete(docType.key, idx)}
                        disabled={isUploading}
                      >
                        <Icon name="trash-outline" size={14} color="#EF4444" />
                        <Text style={[styles.btnText, styles.deleteBtnText]}>
                          {t('delete')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.btn, styles.selectBtn]}
                        onPress={() => pickDocument(docType.key, idx)}
                        disabled={isUploading}
                      >
                        <Icon
                          name="swap-horizontal-outline"
                          size={14}
                          color="#FF9800"
                        />
                        <Text style={[styles.btnText, styles.replaceBtnText]}>
                          {t('replace')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {renderPendingDocuments(docType, pendingDocs, isUploading)}

          {pendingDocs.length === 0 && canAddNew && (
            <View
              style={[
                styles.cardActions,
                uploadedArray.length > 0 && styles.cardActionsTopSpacing,
              ]}
            >
              <TouchableOpacity
                style={[styles.btn, styles.selectBtn]}
                onPress={() => pickDocument(docType.key, -1)}
                disabled={isUploading}
              >
                <Icon
                  name="add-circle-outline"
                  size={16}
                  color={FPO_COLORS.primary}
                />
                <Text style={[styles.btnText, styles.viewBtnText]}>
                  {uploadedArray.length > 0 ? t('upload_new') : t('select')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadedArray.length === 0 && pendingDocs.length === 0 && (
            <Text style={styles.cardDesc}>{t('no_document_uploaded')}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t('upload_documents')}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
          <Text style={styles.loadingText}>{t('loading_documents')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('upload_documents')}</Text>
          <Text style={styles.headerSub}>{t('upload_licenses_desc')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Icon
              name="information-circle"
              size={22}
              color={FPO_COLORS.primary}
            />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{t('document_management')}</Text>
            <Text style={styles.infoDesc}>{t('document_management_desc')}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {DOCUMENT_TYPES.map(docType => renderDocumentCard(docType))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FpoUploadDocuments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  headerSpacer: { height: 6, backgroundColor: '#ffffff' },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
    marginBottom: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 3,
    fontWeight: '500',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 3,
    shadowColor: FPO_COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderLeftWidth: 4,
    borderLeftColor: FPO_COLORS.primary,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  cardsContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
  },

  fileBlock: {
    marginBottom: 12,
  },
  uploadedDoc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  uploadedDocSpacing: {
    marginBottom: 6,
  },
  uploadedText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    flex: 1,
  },
  identifierBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  identifierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },

  pendingContainer: {
    marginTop: 8,
    gap: 10,
  },
  selectedDoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  docInfo: {
    flex: 1,
  },
  docInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docName: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  pendingLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  pendingRemoveBtn: {
    padding: 2,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionsTopSpacing: {
    marginTop: 8,
  },
  wrapActions: {
    flexWrap: 'wrap',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  viewBtn: { backgroundColor: '#EFF6FF' },
  downloadBtn: { backgroundColor: FPO_COLORS.primary },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  selectBtn: { backgroundColor: '#EFF6FF' },
  cancelBtn: { backgroundColor: '#FFEBEE' },
  uploadBtn: { backgroundColor: FPO_COLORS.primary },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewBtnText: {
    color: FPO_COLORS.primary,
  },
  lightBtnText: {
    color: '#fff',
  },
  deleteBtnText: {
    color: '#EF4444',
  },
  replaceBtnText: {
    color: '#FF9800',
  },
  cancelBtnText: {
    color: '#D32F2F',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

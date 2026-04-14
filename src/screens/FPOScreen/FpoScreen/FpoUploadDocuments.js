import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { pick, types } from "@react-native-documents/picker";
import ReactNativeBlobUtil from "react-native-blob-util";
import { getAccessToken, getUserData } from "../../../Redux/Storage";
import { API_BASE_URL } from "../../../config";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const DOCUMENT_TYPES = [
  { key: "seedLicense", labelKey: "seed_license", label: "Seed License", icon: "leaf-outline", color: "#4CAF50", maxCount: 1 },
  { key: "fertilizerLicense", labelKey: "fertilizer_license", label: "Fertilizer License", icon: "flask-outline", color: "#FF9800", maxCount: 1 },
  { key: "procurementLicense", labelKey: "procurement_license", label: "Procurement License", icon: "document-text-outline", color: "#2196F3", maxCount: 1 },
  { key: "GSTCertificate", labelKey: "gst_certificate", label: "GST Certificate", icon: "receipt-outline", color: "#9C27B0", maxCount: 1 },
  { key: "CINCertificate", labelKey: "cin_certificate", label: "CIN Certificate", icon: "business-outline", color: "#607D8B", maxCount: 1 },
  { key: "PANCard", labelKey: "pan_card", label: "PAN Card", icon: "card-outline", color: "#F44336", maxCount: 1 },
  { key: "InsecticidesLicense", labelKey: "insecticides_license", label: "Insecticides License", icon: "bug-outline", color: "#795548", maxCount: 1 },
  { key: "CEODocuments", labelKey: "ceo_documents", label: "CEO Documents", icon: "person-outline", color: "#3F51B5", maxCount: 3 },
  { key: "BODDocuments", labelKey: "bod_documents", label: "BOD Documents", icon: "people-outline", color: "#009688", maxCount: 3 },
  { key: "FinancialDocuments", labelKey: "financial_documents", label: "Financial Documents", icon: "pie-chart-outline", color: "#8BC34A", maxCount: 3 },
];

const FpoUploadDocuments = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState({
    seedLicense: null,
    fertilizerLicense: null,
    procurementLicense: null,
    GSTCertificate: null,
    CINCertificate: null,
    PANCard: null,
    InsecticidesLicense: null,
    CEODocuments: null,
    BODDocuments: null,
    FinancialDocuments: null,
  });
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

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
      
      for (const docType of DOCUMENT_TYPES) {
        try {
          let response = await fetch(
            `${API_BASE_URL}/api/admin/files/private?type=${docType.key}&userId=${userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            response = await fetch(
              `${API_BASE_URL}/api/user/files/private?type=${docType.key}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );
          }

          if (response.ok) {
            const json = await response.json();
            const data = Array.isArray(json) ? json : 
                        Array.isArray(json?.data) ? json.data : 
                        Array.isArray(json?.files) ? json.files : [];
            
            if (data.length > 0) {
              uploaded[docType.key] = data; // store array of files
            } else {
              // Fallback to profile
              const profileData = await apiService.getProfileDetails();
              const pData = profileData?.[docType.key];
              if (pData) uploaded[docType.key] = Array.isArray(pData) ? pData : [pData];
            }
          } else {
             // Fallback to profile
             const profileData = await apiService.getProfileDetails();
             const pData = profileData?.[docType.key];
             if (pData) uploaded[docType.key] = Array.isArray(pData) ? pData : [pData];
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
    try {
      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      const file = result[0];
      const fileData = {
        uri: file.uri || file.fileCopyUri,
        name: file.name || file.fileName,
        type: file.type || file.mime,
        size: file.size,
        replaceIndex, // track which exact file we are replacing
      };

      setDocuments((prev) => ({
        ...prev,
        [type]: fileData,
      }));

      showAlert({ type: "success", title: t("file_selected_title"), message: t("file_selected_success", { name: fileData.name }) });
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") {
        console.error("Document picker error:", err);
      }
    }
  };

  const uploadDocument = async (type) => {
    const doc = documents[type];
    if (!doc) {
      showAlert({ type: "warning", title: t("error"), message: t("select_doc_first") });
      return;
    }

    setUploading(type);
    try {
      const token = await getAccessToken();

      // Step 1: If replacing a specific index, delete the old file first
      if (doc.replaceIndex !== undefined && doc.replaceIndex !== -1) {
        const deleteResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [`${type}_delete`]: doc.replaceIndex,
          }),
        });

        const deleteJson = await deleteResponse.json();
        if (!deleteResponse.ok) {
          throw new Error(deleteJson?.message || t("failed_to_delete"));
        }
      }

      // Step 2: Upload the new file
      const base64 = await ReactNativeBlobUtil.fs.readFile(doc.uri, 'base64');
      const base64Data = `data:${doc.type || 'application/pdf'};base64,${base64}`;

      const payload = {
        [type]: base64Data,
        type: type,
      };

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || t("upload_failed"));
      }

      showAlert({ type: "success", title: t("success"), message: t("uploaded_successfully", { label: t(DOCUMENT_TYPES.find(d => d.key === type)?.labelKey) }) });
      
      setDocuments((prev) => ({
        ...prev,
        [type]: null,
      }));

      fetchUploadedDocuments();
    } catch (err) {
      showAlert({ type: "error", title: t("upload_failed"), message: err.message || t("failed_to_upload") });
    } finally {
      setUploading(null);
    }
  };

  const handleAction = async (upFile) => {
    const url = upFile?.url || upFile?.fileUrl || upFile?.path || upFile?.link;
    if (!url) {
      showAlert({ type: "error", title: t("error"), message: t("url_not_available") });
      return;
    }
    
    try {
      await Linking.openURL(url);
    } catch (err) {
      showAlert({ type: "error", title: t("error"), message: t("device_cant_open") });
      console.error("View error:", err.message);
    }
  };

  const handleDownload = async (upFile) => {
    const url = upFile?.url || upFile?.fileUrl || upFile?.path || upFile?.link;
    if (!url) {
      showAlert({ type: "error", title: t("error"), message: t("url_not_available") });
      return;
    }

    try {
      showAlert({ type: "info", title: t("downloading"), message: t("download_started"), duration: 1500 });

      let extension = url.split("?")[0].split(".").pop();
      if (!extension || extension.length > 5) extension = "pdf"; 
      
      let rawName = upFile.fileName || upFile.name || `document_${new Date().getTime()}`;
      if (!rawName.includes('.')) rawName += `.${extension}`;
      
      const fileName = rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const configOptions = Platform.OS === 'android' ? {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading file.',
        }
      } : {
        fileCache: true,
        path: filePath,
      };

      const res = await ReactNativeBlobUtil.config(configOptions).fetch('GET', url);
      
      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.previewDocument(res.path());
      } else {
         console.log("Downloaded successfully to:", res.path());
      }
    } catch (err) {
      console.error("Download Error:", err);
      showAlert({ type: "error", title: t("error"), message: t("download_failed") });
    }
  };

  const handleDelete = async (docTypeKey, idx) => {
    showAlert({
      type: "confirm",
      title: t("delete_file"),
      message: t("delete_confirm_msg", { index: idx + 1 }),
      buttons: [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAccessToken();
              const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  [`${docTypeKey}_delete`]: idx,
                }),
              });

              const json = await response.json();
              if (!response.ok) {
                throw new Error(json?.message || t("failed_to_delete"));
              }

              showAlert({ type: "success", title: t("success"), message: t("file_deleted_success") });
              fetchUploadedDocuments();
            } catch (err) {
              showAlert({ type: "error", title: t("error"), message: err.message || t("failed_to_delete") });
              console.error("Delete error:", err);
            }
          },
        },
      ],
    });
  };

  const renderDocumentCard = (docType) => {
    const doc = documents[docType.key];
    const _rawUpload = uploadedDocs[docType.key];
    const uploadedArray = Array.isArray(_rawUpload) ? _rawUpload : (_rawUpload ? [_rawUpload] : []);
    const isUploading = uploading === docType.key;
    const canAddNew = docType.maxCount ? uploadedArray.length < docType.maxCount : uploadedArray.length === 0;

    return (
      <View key={docType.key} style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: docType.color + "18" }]}>
          <Icon name={docType.icon} size={28} color={docType.color} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{t(docType.labelKey)}</Text>
          <Text style={styles.cardDesc}>
             {docType.maxCount > 1 ? t("allowed_up_to", { count: docType.maxCount }) : t("allowed_one_file")}
          </Text>
          
          {uploadedArray.map((upFile, idx) => {
            const fileName = upFile.fileName || upFile.name || `Document ${idx + 1}`;
            return (
              <View key={idx} style={{ marginBottom: 12 }}>
                <View style={[styles.uploadedDoc, { marginBottom: 6 }]}>
                  <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.uploadedText} numberOfLines={1}>{fileName}</Text>
                </View>
                {!doc && (
                  <View style={[styles.cardActions, { flexWrap: 'wrap' }]}>
                    <TouchableOpacity
                      style={[styles.btn, styles.viewBtn]}
                      onPress={() => handleAction(upFile)}
                    >
                      <Icon name="eye-outline" size={14} color={FPO_COLORS.primary} />
                      <Text style={[styles.btnText, { color: FPO_COLORS.primary }]}>{t("view")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btn, styles.downloadBtn]}
                      onPress={() => handleDownload(upFile)}
                    >
                      <Icon name="download-outline" size={14} color="#fff" />
                      <Text style={[styles.btnText, { color: "#fff" }]}>{t("download")}</Text>
                    </TouchableOpacity>

                    {docType.maxCount > 1 ? (
                      <TouchableOpacity
                        style={[styles.btn, styles.deleteBtn]}
                        onPress={() => handleDelete(docType.key, idx)}
                        disabled={isUploading}
                      >
                        <Icon name="trash-outline" size={14} color="#EF4444" />
                        <Text style={[styles.btnText, { color: "#EF4444" }]}>{t("delete")}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.btn, styles.selectBtn]}
                        onPress={() => pickDocument(docType.key, idx)}
                        disabled={isUploading}
                      >
                        <Icon name="swap-horizontal-outline" size={14} color="#FF9800" />
                        <Text style={[styles.btnText, { color: "#FF9800" }]}>{t("replace")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {doc ? (
            <View style={{ marginTop: 8 }}>
              <View style={styles.selectedDoc}>
                <Icon name="document" size={16} color="#666" />
                <Text style={styles.docName} numberOfLines={1}>
                  {doc.replaceIndex !== -1 ? t("replacing_file", { index: doc.replaceIndex + 1 }) : ""}{doc.name}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.selectBtn, { backgroundColor: "#FFEBEE" }]}
                  onPress={() => setDocuments(p => ({...p, [docType.key]: null}))}
                  disabled={isUploading}
                >
                  <Text style={[styles.btnText, { color: "#D32F2F" }]}>{t("cancel")}</Text>
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
                      <Text style={[styles.btnText, { color: "#fff" }]}>{t("upload")}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            canAddNew && (
              <View style={[styles.cardActions, { marginTop: uploadedArray.length > 0 ? 8 : 0 }]}>
                <TouchableOpacity
                  style={[styles.btn, styles.selectBtn]}
                  onPress={() => pickDocument(docType.key, -1)}
                  disabled={isUploading}
                >
                  <Icon name="add-circle-outline" size={16} color={FPO_COLORS.primary} />
                  <Text style={[styles.btnText, { color: FPO_COLORS.primary }]}>
                    {uploadedArray.length > 0 ? t("upload_new") : t("select")}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {uploadedArray.length === 0 && !doc && (
             <Text style={styles.cardDesc}>{t("no_document_uploaded")}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t("upload_documents")}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
          <Text style={styles.loadingText}>{t("loading_documents")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t("upload_documents")}</Text>
          <Text style={styles.headerSub}>{t("upload_licenses_desc")}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Icon name="information-circle" size={22} color={FPO_COLORS.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{t("document_management")}</Text>
            <Text style={styles.infoDesc}>{t("document_management_desc")}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {DOCUMENT_TYPES.map((docType) => renderDocumentCard(docType))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FpoUploadDocuments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A", letterSpacing: 0.3 },
  headerSub: { fontSize: 14, color: "#6B7280", marginTop: 3, fontWeight: "500" },

  /* SCROLL */
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* INFO BANNER */
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
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
    backgroundColor: "#EBF3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  /* CARDS */
  cardsContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  /* UPLOADED FILE ROW */
  uploadedDoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  uploadedText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
    flex: 1,
  },

  /* SELECTED (PENDING UPLOAD) ROW */
  selectedDoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  docName: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },

  /* ACTION BUTTONS */
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  viewBtn: { backgroundColor: "#EFF6FF" },
  downloadBtn: { backgroundColor: FPO_COLORS.primary },
  deleteBtn: { backgroundColor: "#FEE2E2" },
  selectBtn: { backgroundColor: "#EFF6FF" },
  uploadBtn: { backgroundColor: FPO_COLORS.primary },
  btnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});

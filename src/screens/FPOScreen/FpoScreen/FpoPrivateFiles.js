import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native";
import { getAccessToken, getUserData } from "../../../Redux/Storage";
import { API_BASE_URL } from "../../../config";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const TABS = [
  { key: "seedLicense", labelKey: "seed_license", label: "Seed License", icon: "leaf-outline" },
  { key: "fertilizerLicense", labelKey: "fertilizer_license", label: "Fertilizer License", icon: "flask-outline" },
  { key: "procurementLicense", labelKey: "procurement_license", label: "Procurement License", icon: "document-text-outline" },
  { key: "GSTCertificate", labelKey: "gst_certificate", label: "GST Certificate", icon: "receipt-outline" },
  { key: "CINCertificate", labelKey: "cin_certificate", label: "CIN Certificate", icon: "business-outline" },
  { key: "PANCard", labelKey: "pan_card", label: "PAN Card", icon: "card-outline" },
  { key: "InsecticidesLicense", labelKey: "insecticides_license", label: "Insecticides License", icon: "bug-outline" },
  { key: "CEODocuments", labelKey: "ceo_documents", label: "CEO Documents", icon: "person-outline" },
  { key: "BODDocuments", labelKey: "bod_documents", label: "BOD Documents", icon: "people-outline" },
  { key: "FinancialDocuments", labelKey: "financial_documents", label: "Financial Documents", icon: "pie-chart-outline" },
];

const getFileIcon = (url = "") => {
  const lower = url.toLowerCase();
  if (lower.match(/\.pdf(\?|$)/)) return { name: "document-outline", color: "#E53935" };
  if (lower.match(/\.(png|jpg|jpeg|gif|webp)(\?|$)/)) return { name: "image-outline", color: "#1565C0" };
  return { name: "attach-outline", color: "#6D4C41" };
};

const cleanFileName = (url = "") => {
  try {
    const withoutQuery = url.split("?")[0];
    const segment = withoutQuery.split("/").pop();
    const decoded = decodeURIComponent(segment);
    const noExt = decoded.replace(/\.[a-zA-Z0-9]{2,5}$/, "");
    const spaced = noExt.replace(/[_\-.]+/g, " ").trim();
    const titled = spaced
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const result = titled || "Unnamed File";
    return result.length > 30 ? result.substring(0, 30) + "..." : result;
  } catch {
    return "Unnamed File";
  }
};

const FpoPrivateFiles = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  
  const initialTab = route.params?.initialTab || "seedLicense";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchFiles = useCallback(async (type) => {
    try {
      setLoading(true);
      setFiles([]);
      
      const token = await getAccessToken();
      const userData = await getUserData();
      
      console.log('👤 Full userData:', JSON.stringify(userData, null, 2));
      
      const userId = userData?.id || userData?._id;
      
      if (!userId) {
        console.error('❌ No userId found in userData');
        console.error('Available keys:', Object.keys(userData || {}));
        setFiles([]);
        setLoading(false);
        return;
      }
      
      console.log('🔑 Token preview:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('👤 UserId:', userId);
      console.log('📡 Fetching from:', `${API_BASE_URL}/api/admin/files/private?type=${type}&userId=${userId}`);
      
      let response = await fetch(
        `${API_BASE_URL}/api/admin/files/private?type=${type}&userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // Fallback to user endpoint if admin fails
      if (!response.ok) {
        console.log(`⚠️ Admin endpoint failed with status ${response.status}, trying /api/user/files/private`);
        response = await fetch(
          `${API_BASE_URL}/api/user/files/private?type=${type}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      }

      console.log('📊 Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      console.log('📊 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('❌ Non-JSON response:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response. Check if endpoint exists.');
      }

      const json = await response.json();
      console.log("📂 FPO Private files response:", JSON.stringify(json, null, 2));

      if (!response.ok) {
        const msg = (json?.message || "").toLowerCase();
        console.log(`⚠️ API returned error: ${msg}. Attempting fallback to Profile data.`);
        
        // Fallback to profile data as a last resort
        const profileData = await apiService.getProfileDetails();
        const docData = profileData?.[type];
        if (docData) {
            const fallbackData = Array.isArray(docData) ? docData : [docData];
            setFiles(fallbackData);
            return;
        }
        setFiles([]);
        return;
      }

      const data =
        Array.isArray(json) ? json :
        Array.isArray(json?.data) ? json.data :
        Array.isArray(json?.files) ? json.files :
        Array.isArray(json?.results) ? json.results :
        [];

      setFiles(data);
    } catch (err) {
      console.error("❌ FpoPrivateFiles fetch error:", err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(activeTab);
  }, [activeTab, fetchFiles]);

  const handleView = async (file) => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    if (!url) {
      Alert.alert(t("error"), t("url_not_available"));
      return;
    }
    
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(
        t("cannot_open_file"),
        t("device_cant_open")
      );
      console.error("View error:", err.message);
    }
  };

  const handleDownload = async (file) => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    const fileId = file?._id || file?.id || url;

    if (!url) {
      Alert.alert(t("error"), t("download_url_not_available"));
      return;
    }

    setDownloading(fileId);
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(t("download_error"), err.message);
    } finally {
      setDownloading(null);
    }
  };

  const renderFile = ({ item }) => {
    const url = item?.url || item?.fileUrl || item?.path || item?.link || "";
    const name = item?.fileName || item?.name || item?.originalName || cleanFileName(url);
    
    console.log('📅 FPO Date fields:', { 
      createdAt: item?.createdAt, 
      uploadedAt: item?.uploadedAt, 
      updatedAt: item?.updatedAt 
    });
    
    const dateValue = item?.createdAt || item?.uploadedAt || item?.updatedAt;
    const date = dateValue
      ? new Date(dateValue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : t("date_not_available");
    
    const fileId = item?._id || item?.id || url;
    const isDownloading = downloading === fileId;
    const fileIcon = getFileIcon(url);

    return (
      <View style={styles.card}>
        <View style={[styles.fileIconWrapper, { backgroundColor: fileIcon.color + "18" }]}>
          <Icon name={fileIcon.name} size={26} color={fileIcon.color} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.fileName} numberOfLines={2}>{name}</Text>
          <Text style={styles.fileDate}>{t("uploaded_colon")}{date}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => handleView(item)}
            accessibilityLabel="View file"
          >
            <Icon name="eye-outline" size={16} color="#1565C0" />
            <Text style={[styles.actionText, { color: "#1565C0" }]}>{t("view")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.downloadBtn]}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
            accessibilityLabel="Download file"
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="download-outline" size={16} color="#fff" />
                <Text style={[styles.actionText, { color: "#fff" }]}>{t("download")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="folder-open-outline" size={56} color="#C8E6C9" />
        <Text style={styles.emptyTitle}>{t("no_files_found")}</Text>
        <Text style={styles.emptyDesc}>
          {t("no_label_uploaded_yet", { label: t(TABS.find((t) => t.key === activeTab)?.labelKey) })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t("fpo_documents")}</Text>
          <Text style={styles.headerSub}>{t("licenses_certificates")}</Text>
        </View>
      </View>

      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  color={active ? FPO_COLORS.primary : "#888"}
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
          <Text style={styles.loadingText}>{t("loading_files")}</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item, index) => item?._id || item?.id || String(index)}
          renderItem={renderFile}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            files.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default FpoPrivateFiles;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  header: {
    backgroundColor: FPO_COLORS.primary,
    paddingTop: Platform.OS === "android" ? 48 : 54,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "#E3F2FD", marginTop: 2 },
  tabBarContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    overflow: "hidden",
    height: 60,
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 16,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    minWidth: 90,
  },
  tabActive: {
    borderBottomColor: FPO_COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: {
    color: FPO_COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  fileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardInfo: {
    marginBottom: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 11,
    color: "#888",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  viewBtn: {
    backgroundColor: "#E3F2FD",
  },
  downloadBtn: {
    backgroundColor: FPO_COLORS.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },
});

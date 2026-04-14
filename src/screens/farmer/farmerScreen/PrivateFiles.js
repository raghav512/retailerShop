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
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAccessToken } from "../../../Redux/Storage";
import { API_BASE_URL } from "../../../config";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

/* ─── Tab definitions ─────────────────────────────────────── */
const TABS = [
  { key: "labReport",       labelKey: "lab_reports",       icon: "flask-outline"      },
  { key: "soilHealthCard",  labelKey: "soil_health_cards", icon: "leaf-outline"        },
  { key: "govtSchemeDocs",  labelKey: "govt_scheme_docs",  icon: "document-text-outline" },
];

/* ─── Helper – file extension icon ────────────────────────── */
const getFileIcon = (url = "") => {
  const lower = url.toLowerCase();
  if (lower.match(/\.pdf(\?|$)/))  return { name: "document-outline",   color: "#E53935" };
  if (lower.match(/\.(png|jpg|jpeg|gif|webp)(\?|$)/)) return { name: "image-outline", color: "#1565C0" };
  return { name: "attach-outline", color: "#6D4C41" };
};

/* ─── Helper – readable title from URL ──────────────────────
   e.g. "https://cdn.example.com/uploads/lab_report_jan_2025.pdf?v=123"
   → "Lab Report Jan 2025"                                      */
const cleanFileName = (url = "", defaultName = "Unnamed File") => {
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
    const result = titled || defaultName;
    return result.length > 30 ? result.substring(0, 30) + "..." : result;
  } catch {
    return defaultName;
  }
};

/* ─── Component ────────────────────────────────────────────── */
const PrivateFiles = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [activeTab, setActiveTab]   = useState("labReport");
  const [files, setFiles]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [downloading, setDownloading] = useState(null); // file id currently downloading

  /* ── Fetch files from API ── */
  const fetchFiles = useCallback(async (type) => {
    try {
      setLoading(true);
      setFiles([]);
      const token = await getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/api/user/files/private?type=${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const json = await response.json();
      console.log("📂 Private files response:", JSON.stringify(json, null, 2));

      // Treat 404 / "no documents" as an empty list — not a hard error
      if (!response.ok) {
        const msg = (json?.message || "").toLowerCase();
        const isNotFound =
          response.status === 404 ||
          msg.includes("no document") ||
          msg.includes("not found") ||
          msg.includes("no file");
        if (isNotFound) {
          setFiles([]);
          return;
        }
        throw new Error(json?.message || `HTTP ${response.status}`);
      }

      // API may return array directly or { data: [...] } or { files: [...] }
      const data =
        Array.isArray(json)          ? json :
        Array.isArray(json?.data)    ? json.data :
        Array.isArray(json?.files)   ? json.files :
        Array.isArray(json?.results) ? json.results :
        [];

      setFiles(data);
    } catch (err) {
      console.error("❌ PrivateFiles fetch error:", err.message);
      // Only show alert for real errors, not empty-result responses
      if (!err.message?.toLowerCase().includes("no document")) {
        Alert.alert(t('private_files.error') || "Error", err.message || t('private_files.failed_load') || "Failed to load files.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(activeTab);
  }, [activeTab, fetchFiles]);

  /* ── View file (open in browser / default viewer) ── */
  const handleView = async (file) => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    if (!url) {
      Alert.alert(t('private_files.error') || "Error", t('private_files.url_not_available'));
      return;
    }
    try {
      // Skip canOpenURL — it returns false for https:// on Android without
      // a QUERY_ALL_PACKAGES permission; just open directly.
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(
        t('private_files.cannot_open_file'),
        t('private_files.device_cant_open_try_download')
      );
      console.error("View error:", err.message);
    }
  };

  /* ── Download file ── */
  const handleDownload = async (file) => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    const fileId = file?._id || file?.id || url;

    if (!url) {
      Alert.alert(t('private_files.error') || "Error", t('private_files.download_url_not_available'));
      return;
    }

    setDownloading(fileId);
    try {
      // For React Native, open the URL with auth header redirect approach.
      // The simplest production-ready method is to open the URL (which triggers
      // the device's download manager or browser).
      const token = await getAccessToken();
      // Build an authenticated URL by opening it; if the server needs a token
      // you can append it as a query param (depends on backend).
      // We open it directly; the Authorization header cannot be set via Linking.
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(t('private_files.download_error'), err.message);
    } finally {
      setDownloading(null);
    }
  };

  /* ── Render a single file card ── */
  const renderFile = ({ item }) => {
    const url  = item?.url || item?.fileUrl || item?.path || item?.link || "";
    const name = item?.fileName || item?.name || item?.originalName || cleanFileName(url, t('private_files.unnamed_file'));
    
    console.log('📅 Date fields:', { 
      createdAt: item?.createdAt, 
      uploadedAt: item?.uploadedAt, 
      updatedAt: item?.updatedAt 
    });
    
    const dateValue = item?.createdAt || item?.uploadedAt || item?.updatedAt;
    const date = dateValue
      ? new Date(dateValue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : t('private_files.date_not_available');
    
    const fileId = item?._id || item?.id || url;
    const isDownloading = downloading === fileId;
    const fileIcon = getFileIcon(url);

    return (
      <View style={styles.card}>
        {/* File icon */}
        <View style={[styles.fileIconWrapper, { backgroundColor: fileIcon.color + "18" }]}>
          <Icon name={fileIcon.name} size={26} color={fileIcon.color} />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.fileName} numberOfLines={2}>{name}</Text>
          <Text style={styles.fileDate}>Uploaded: {date}</Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => handleView(item)}
            accessibilityLabel={t('private_files.view')}
          >
            <Icon name="eye-outline" size={16} color="#1565C0" />
            <Text style={[styles.actionText, { color: "#1565C0" }]}>{t('private_files.view')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.downloadBtn]}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
            accessibilityLabel={t('private_files.download')}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="download-outline" size={16} color="#fff" />
                <Text style={[styles.actionText, { color: "#fff" }]}>{t('private_files.download')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ── Empty state ── */
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="folder-open-outline" size={56} color="#C8E6C9" />
        <Text style={styles.emptyTitle}>{t('private_files.no_files_found')}</Text>
        <Text style={styles.emptyDesc}>
          {t('private_files.no_files_uploaded', { label: t(`private_files.${TABS.find((t_item) => t_item.key === activeTab)?.labelKey}`) })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* ── Header ── */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('private_files.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
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
                color={active ? FARMER_COLORS.primaryLight : "#6B7280"}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`private_files.${tab.labelKey}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
          <Text style={styles.loadingText}>{t('private_files.loading_files')}</Text>
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

export default PrivateFiles;

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  /* Header */
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

  /* Tab bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: "#FEF9E7",
  },
  tabText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: {
    color: FARMER_COLORS.primaryLight,
    fontWeight: "700",
  },

  /* List */
  listContent: {
    padding: 16,
    paddingTop: 12,
  },

  /* Card */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fileIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardInfo: {
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  fileDate: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  /* Card actions */
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: "#F3F4F6",
  },
  downloadBtn: {
    backgroundColor: FARMER_COLORS.primaryLight,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },

  /* Loading */
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

  /* Empty */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});


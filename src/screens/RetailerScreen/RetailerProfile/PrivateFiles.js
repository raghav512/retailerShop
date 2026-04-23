import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import { useTranslation } from 'react-i18next';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

/* ─── Tab definitions ─────────────────────────────────────── */
const TABS = [
  {
    key: 'businessLicense',
    apiTypes: ['shopLicense', 'businessLicense'],
    labelKey: 'business_licenses',
    icon: 'briefcase-outline',
  },
  {
    key: 'gstCertificate',
    apiTypes: ['GSTCertificate', 'gstCertificate'],
    labelKey: 'gst_certificates',
    icon: 'document-text-outline',
  },
  {
    key: 'tradeLicense',
    apiTypes: ['tradeLicense'],
    labelKey: 'trade_licenses',
    icon: 'ribbon-outline',
  },
];

/* ─── Helper – file extension icon ────────────────────────── */
const getFileIcon = (url = '') => {
  if (!url) return { name: 'attach-outline', color: '#6D4C41' };
  const lower = url.toLowerCase();
  if (lower.match(/\.pdf(\?|$)/))
    return { name: 'document-outline', color: '#E53935' };
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp)(\?|$)/))
    return { name: 'image-outline', color: '#1565C0' };
  if (lower.match(/\.(doc|docx)(\?|$)/))
    return { name: 'document-text-outline', color: '#1976D2' };
  return { name: 'attach-outline', color: '#6D4C41' };
};

/* ─── Helper – readable title from URL ──────────────────────
   e.g. "https://cdn.example.com/uploads/business_license_2025.pdf?v=123"
   → "Business License 2025"                                      */
const cleanFileName = (url = '', defaultName = 'Unnamed File') => {
  try {
    const withoutQuery = url.split('?')[0];
    const segment = withoutQuery.split('/').pop();
    const decoded = decodeURIComponent(segment);
    const noExt = decoded.replace(/\.[a-zA-Z0-9]{2,5}$/, '');
    const spaced = noExt.replace(/[_\-.]+/g, ' ').trim();
    const titled = spaced
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    const result = titled || defaultName;
    return result.length > 30 ? result.substring(0, 30) + '...' : result;
  } catch {
    return defaultName;
  }
};

/* ─── Component ────────────────────────────────────────────── */
const PrivateFiles = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('businessLicense');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ FIX: Start with false
  const [initialLoading, setInitialLoading] = useState(true); // ✅ FIX: Separate initial load
  const [downloading, setDownloading] = useState(null); // file id currently downloading

  const parseFilesResponse = json =>
    Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.files)
      ? json.files
      : Array.isArray(json?.results)
      ? json.results
      : [];

  /* ── Fetch files from API ── */
  const fetchFiles = useCallback(
    async type => {
      try {
        // ✅ FIX: Only show loading for tab switches, not initial load
        if (!initialLoading) {
          setLoading(true);
        }
        setFiles([]);

        const tabConfig = TABS.find(tab => tab.key === type);
        const typeCandidates = tabConfig?.apiTypes?.length
          ? tabConfig.apiTypes
          : [type];

        const token = await getAccessToken();

        let lastError = null;

        for (const apiType of typeCandidates) {
          const response = await fetch(
            `${API_BASE_URL}/api/user/files/private?type=${apiType}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            },
          );

          const json = await response.json();
          console.log(
            `📂 Private files response (${apiType}):`,
            JSON.stringify(json, null, 2),
          );

          if (!response.ok) {
            const msg = (json?.message || '').toLowerCase();
            const isNotFound =
              response.status === 404 ||
              msg.includes('no document') ||
              msg.includes('not found') ||
              msg.includes('no file');

            if (isNotFound) {
              setFiles([]);
              return;
            }

            const isInvalidType = msg.includes('invalid file type');
            if (isInvalidType) {
              continue;
            }

            lastError = new Error(json?.message || `HTTP ${response.status}`);
            break;
          }

          setFiles(parseFilesResponse(json));
          return;
        }

        if (lastError) {
          throw lastError;
        }

        // If all aliases are rejected by backend as invalid type, show empty state.
        setFiles([]);
      } catch (err) {
        console.error('❌ PrivateFiles fetch error:', err.message);
        // Only show alert for real errors, not empty-result responses
        if (!err.message?.toLowerCase().includes('no document')) {
          Alert.alert(
            t('private_files.error') || 'Error',
            err.message ||
              t('private_files.failed_load') ||
              'Failed to load files.',
          );
        }
      } finally {
        setLoading(false);
        setInitialLoading(false); // ✅ FIX: Mark initial load complete
      }
    },
    [t, initialLoading], // ✅ FIX: Add initialLoading to deps
  );

  useEffect(() => {
    fetchFiles(activeTab);
  }, [activeTab, fetchFiles]);

  /* ── View file (open in browser / default viewer) ── */
  const handleView = async file => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    if (!url) {
      Alert.alert(
        t('private_files.error') || 'Error',
        t('private_files.url_not_available'),
      );
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(
        t('private_files.cannot_open_file'),
        t('private_files.device_cant_open_try_download'),
      );
      console.error('View error:', err.message);
    }
  };

  /* ── Download file ── */
  const handleDownload = async file => {
    const url = file?.url || file?.fileUrl || file?.path || file?.link;
    const fileId = file?._id || file?.id || url;

    if (!url) {
      Alert.alert(
        t('private_files.error') || 'Error',
        t('private_files.download_url_not_available'),
      );
      return;
    }

    setDownloading(fileId);
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(t('private_files.download_error'), err.message);
    } finally {
      setDownloading(null);
    }
  };

  /* ── Render a single file card ── */
  const renderFile = ({ item }) => {
    const url = item?.url || item?.fileUrl || item?.path || item?.link || '';
    const name =
      item?.fileName ||
      item?.name ||
      item?.originalName ||
      cleanFileName(url, t('private_files.unnamed_file'));

    console.log('📅 Date fields:', {
      createdAt: item?.createdAt,
      uploadedAt: item?.uploadedAt,
      updatedAt: item?.updatedAt,
    });

    const dateValue = item?.createdAt || item?.uploadedAt || item?.updatedAt;
    const date = dateValue
      ? new Date(dateValue).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : t('private_files.date_not_available');

    const fileId = item?._id || item?.id || url;
    const isDownloading = downloading === fileId;
    const fileIcon = getFileIcon(url);

    return (
      <View style={styles.card}>
        {/* File icon */}
        <View
          style={[
            styles.fileIconWrapper,
            { backgroundColor: fileIcon.color + '18' },
          ]}
        >
          <Icon name={fileIcon.name} size={26} color={fileIcon.color} />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.fileDate}>Uploaded: {date}</Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => handleView(item)}
            accessibilityLabel={t('private_files.view')}
          >
            <Icon
              name="eye-outline"
              size={16}
              color={RETAILER_COLORS.primary}
            />
            <Text
              style={[styles.actionText, { color: RETAILER_COLORS.primary }]}
            >
              {t('private_files.view')}
            </Text>
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
                <Text style={[styles.actionText, { color: '#fff' }]}>
                  {t('private_files.download')}
                </Text>
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
        <Icon
          name="folder-open-outline"
          size={56}
          color={RETAILER_COLORS.secondary}
        />
        <Text style={styles.emptyTitle}>
          {t('private_files.no_files_found')}
        </Text>
        <Text style={styles.emptyDesc}>
          {t('private_files.no_files_uploaded', {
            label: t(
              `private_files.${
                TABS.find(t_item => t_item.key === activeTab)?.labelKey
              }`,
            ),
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

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
        {TABS.map(tab => {
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
                color={active ? RETAILER_COLORS.primaryLight : '#6B7280'}
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
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={RETAILER_COLORS.primaryLight}
          />
          <Text style={styles.loadingText}>
            {t('private_files.loading_files')}
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={RETAILER_COLORS.primaryLight}
          />
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
    backgroundColor: RETAILER_COLORS.tint,
  },

  /* Header */
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

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: RETAILER_COLORS.secondary,
  },
  tabText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: RETAILER_COLORS.primaryLight,
    fontWeight: '700',
  },

  /* List */
  listContent: {
    padding: 16,
    paddingTop: 12,
  },

  /* Card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fileIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardInfo: {
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  fileDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  /* Card actions */
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: RETAILER_COLORS.secondary,
  },
  downloadBtn: {
    backgroundColor: RETAILER_COLORS.primaryLight,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});

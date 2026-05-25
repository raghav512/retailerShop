import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { COLORS, FPO_COLORS } from '../../../colorsList/ColorList';

const safeString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeStatus = value => {
  const normalized = safeString(value).toLowerCase();
  if (normalized === 'approved' || normalized === 'rejected') {
    return normalized;
  }
  return 'pending';
};

const formatDateTime = (dateValue, fallback) => {
  if (!dateValue) {
    return fallback;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const parsePhotoUri = photo => {
  if (!photo) {
    return '';
  }

  if (typeof photo === 'string') {
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('data:image')
    ) {
      return photo;
    }

    return '';
  }

  if (typeof photo === 'object') {
    return photo?.url || photo?.uri || photo?.path || '';
  }

  return '';
};

const normalizeInquiry = (item, t) => {
  const numericQuantity = Number(item?.requiredQuantity);
  const quantityUnit = safeString(item?.quantityUnit, 'unit');
  const quantityLabel =
    Number.isFinite(numericQuantity) && numericQuantity >= 0
      ? `${numericQuantity} ${quantityUnit}`
      : t('inquiry_screen.fallback_not_specified');

  // Handle farmer field (can be populated object or ID string)
  let farmerId = null;
  let farmerName = null;
  let farmerPhone = null;
  let farmerProfileImage = null;

  if (item?.farmer) {
    if (typeof item.farmer === 'string') {
      farmerId = item.farmer;
      farmerName = null;
    } else if (typeof item.farmer === 'object') {
      farmerId = item.farmer._id ?? null;
      farmerPhone = item.farmer.phone ?? null;
      farmerProfileImage = item.farmer.profileImage?.url ?? null;
      const firstName = safeString(item.farmer.firstName ?? '');
      const lastName = safeString(item.farmer.lastName ?? '');
      farmerName =
        `${firstName} ${lastName}`.trim() ||
        `Farmer - ${item.farmer.phone ?? farmerId}`;
    }
  }

  // Fallback to user field if farmer not present
  if (!farmerId && item?.user) {
    if (typeof item.user === 'string') {
      farmerId = item.user;
      farmerName = null;
    } else if (typeof item.user === 'object') {
      farmerId = item.user._id ?? null;
      farmerPhone = item.user.phone ?? null;
      farmerProfileImage = item.user.profileImage?.url ?? null;
      const firstName = safeString(item.user.firstName ?? '');
      const lastName = safeString(item.user.lastName ?? '');
      farmerName =
        `${firstName} ${lastName}`.trim() ||
        `${item.user.role ?? 'User'} - ${item.user.phone ?? farmerId}`;
    }
  }

  const inquiryType = safeString(
    item?.inquiryType,
    t('inquiry_screen.fallback_na'),
  );
  const isToolsInquiry = inquiryType === 'Tools';

  return {
    productName:
      item?.productName === 'undefined'
        ? t('inquiry_screen.fallback_not_specified')
        : safeString(
            item?.productName,
            t('inquiry_screen.fallback_not_specified'),
          ),
    inquiryType,
    cropName: safeString(item?.cropName, t('inquiry_screen.fallback_na')),
    farmerId: farmerId ?? t('inquiry_screen.fallback_unknown'),
    farmerName: farmerName ?? t('inquiry_screen.fallback_not_specified'),
    farmerPhone: farmerPhone ?? null,
    farmerProfileImage,
    quantityLabel,
    status: normalizeStatus(item?.status),
    isToolsInquiry,
    createdAtLabel: formatDateTime(
      item?.createdAt,
      t('inquiry_screen.fallback_date'),
    ),
    updatedAtLabel: formatDateTime(
      item?.updatedAt,
      t('inquiry_screen.fallback_date'),
    ),
    photoUri: parsePhotoUri(item?.photo || item?.inquiryPhoto),
  };
};

const InquiryDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const inquiryId = route?.params?.inquiryId;
  const initialInquiry = route?.params?.initialInquiry;

  const [inquiry, setInquiry] = useState(
    initialInquiry ? normalizeInquiry(initialInquiry, t) : null,
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInquiryDetails = useCallback(async () => {
    if (!inquiryId) {
      setErrorMessage(t('inquiry_screen.error_missing_id'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await apiService.getInquiryById(inquiryId);
      const data = response?.data;

      if (!data || typeof data !== 'object') {
        setInquiry(null);
        setErrorMessage(t('inquiry_screen.error_invalid_payload'));
        return;
      }

      setInquiry(normalizeInquiry(data, t));
    } catch (error) {
      console.error('❌ Inquiry detail fetch failed:', error);
      setInquiry(null);
      setErrorMessage(
        error?.response?.data?.message || t('inquiry_screen.error_load_detail'),
      );
    } finally {
      setLoading(false);
    }
  }, [inquiryId, t]);

  useEffect(() => {
    loadInquiryDetails();
  }, [loadInquiryDetails]);

  useFocusEffect(
    useCallback(() => {
      loadInquiryDetails();
    }, [loadInquiryDetails]),
  );

  const getStatusStyle = status => {
    if (status === 'approved') {
      return {
        container: styles.statusApproved,
        text: styles.statusApprovedText,
      };
    }
    if (status === 'rejected') {
      return {
        container: styles.statusRejected,
        text: styles.statusRejectedText,
      };
    }
    return {
      container: styles.statusPending,
      text: styles.statusPendingText,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={FPO_COLORS.primary}
          translucent={false}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
          <Text style={styles.loaderText}>
            {t('inquiry_screen.loading_detail')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!inquiry || errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={FPO_COLORS.primary}
          translucent={false}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={COLORS.error} />
          <Text style={styles.errorTitle}>
            {t('inquiry_screen.error_title')}
          </Text>
          <Text style={styles.errorMessage}>
            {errorMessage || t('inquiry_screen.error_not_found')}
          </Text>
          <View style={styles.errorActionsRow}>
            <TouchableOpacity
              style={styles.errorActionButtonSecondary}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.errorActionSecondaryText}>
                {t('inquiry_screen.back')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.errorActionButtonPrimary}
              onPress={loadInquiryDetails}
            >
              <Text style={styles.errorActionPrimaryText}>
                {t('inquiry_screen.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(inquiry.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('inquiry_screen.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{inquiry.productName}</Text>

          <View style={styles.summaryMetaRow}>
            <View style={[styles.statusPill, statusStyle.container]}>
              <Text style={[styles.statusText, statusStyle.text]}>
                {t(`inquiry_screen.status.${inquiry.status}`)}
              </Text>
            </View>
            <Text style={styles.summaryDate}>{inquiry.createdAtLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="pricetag-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              {t('inquiry_screen.type_label')}: {inquiry.inquiryType}
            </Text>
          </View>

          {!inquiry.isToolsInquiry && (
            <>
              <View style={styles.infoRow}>
                <Icon name="leaf-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.infoText}>
                  {t('inquiry_screen.crop_label')}: {inquiry.cropName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="cube-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.infoText}>
                  {t('inquiry_screen.quantity_label')}: {inquiry.quantityLabel}
                </Text>
              </View>
            </>
          )}

          {inquiry.farmerName && (
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>Farmer: {inquiry.farmerName}</Text>
            </View>
          )}

          {inquiry.farmerPhone && (
            <View style={styles.infoRow}>
              <Icon name="call-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>Phone: {inquiry.farmerPhone}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              {t('inquiry_screen.updated_on')}: {inquiry.updatedAtLabel}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>
            {t('inquiry_screen.description_title')}
          </Text>
          <Text style={styles.sectionBody}>
            {t('inquiry_screen.description_template', {
              inquiryType: inquiry.inquiryType,
              productName: inquiry.productName,
              cropName: inquiry.cropName,
              quantityLabel: inquiry.quantityLabel,
            })}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>
            {t('inquiry_screen.attachment_title')}
          </Text>
          {inquiry.photoUri ? (
            <Image
              source={{ uri: inquiry.photoUri }}
              style={styles.attachmentImage}
            />
          ) : (
            <View style={styles.attachmentPlaceholder}>
              <Icon name="image-outline" size={44} color="#C7CDD6" />
              <Text style={styles.attachmentPlaceholderText}>
                {t('inquiry_screen.attachment_empty')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InquiryDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.tint,
  },

  /* HEADER */
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: FPO_COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
  },
  errorMessage: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  errorActionsRow: {
    marginTop: 18,
    flexDirection: 'row',
  },
  errorActionButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    backgroundColor: FPO_COLORS.surface,
  },
  errorActionSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: FPO_COLORS.textPrimary,
  },
  errorActionButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: FPO_COLORS.primary,
  },
  errorActionPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: FPO_COLORS.textOnPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: FPO_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    padding: 16,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  summaryDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statusPill: {
    minWidth: 76,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusPending: {
    backgroundColor: '#FFF6E0',
    borderColor: FPO_COLORS.primary,
  },
  statusPendingText: {
    color: FPO_COLORS.accent,
  },
  statusApproved: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  statusApprovedText: {
    color: COLORS.success,
  },
  statusRejected: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.error,
  },
  statusRejectedText: {
    color: COLORS.error,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: FPO_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailCard: {
    backgroundColor: FPO_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
    color: FPO_COLORS.textSecondary,
    fontWeight: '500',
  },
  attachmentImage: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    backgroundColor: '#ECECEC',
  },
  attachmentPlaceholder: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    backgroundColor: '#F1F3F6',
    borderWidth: 1,
    borderColor: '#E4E9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentPlaceholderText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { COLORS, STAFF_COLORS } from '../../../colorsList/ColorList';

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
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }

    if (photo.startsWith('data:image')) {
      return photo;
    }

    return '';
  }

  if (typeof photo === 'object') {
    const url = safeString(photo?.url);
    const uri = safeString(photo?.uri);
    return url || uri;
  }

  return '';
};

const normalizeInquiry = (item, t) => {
  const id = safeString(item?._id, t('inquiry_screen.fallback_unknown'));
  const inquiryType = safeString(
    item?.inquiryType,
    t('inquiry_screen.fallback_na'),
  );
  const productName = safeString(
    item?.productName,
    t('inquiry_screen.fallback_not_specified'),
  );
  const cropName = safeString(item?.cropName, t('inquiry_screen.fallback_na'));

  const farmerId =
    typeof item?.farmer === 'string'
      ? safeString(item.farmer, t('inquiry_screen.fallback_unknown'))
      : safeString(item?.farmer?._id, t('inquiry_screen.fallback_unknown'));

  const numericQuantity = Number(item?.requiredQuantity);
  const quantityUnit = safeString(item?.quantityUnit, 'unit');
  const quantityLabel =
    Number.isFinite(numericQuantity) && numericQuantity >= 0
      ? `${numericQuantity} ${quantityUnit}`
      : t('inquiry_screen.fallback_not_specified');

  const status = normalizeStatus(item?.status);

  return {
    id,
    inquiryType,
    productName,
    cropName,
    farmerId,
    quantityLabel,
    status,
    createdAtLabel: formatDateTime(
      item?.createdAt,
      t('inquiry_screen.fallback_date'),
    ),
    updatedAtLabel: formatDateTime(
      item?.updatedAt,
      t('inquiry_screen.fallback_date'),
    ),
    photoUri: parsePhotoUri(item?.photo),
  };
};

const InquiryDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const inquiryId = safeString(route?.params?.inquiryId);
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
    }, [loadInquiryDetails])
  );

  const statusStyle = useMemo(() => {
    const status = inquiry?.status || 'pending';
    return getStatusStyle(status);
  }, [inquiry?.status]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
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
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
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
              activeOpacity={0.85}
            >
              <Text style={styles.errorActionSecondaryText}>
                {t('inquiry_screen.back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.errorActionButtonPrimary}
              onPress={loadInquiryDetails}
              activeOpacity={0.85}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={24} color={STAFF_COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('inquiry_screen.title')}</Text>
      </View>

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

          <View style={styles.infoRow}>
            <Icon name="person-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              {t('inquiry_screen.farmer_id_label')}: {inquiry.farmerId}
            </Text>
          </View>

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
    backgroundColor: STAFF_COLORS.tint,
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
    color: STAFF_COLORS.textSecondary,
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
    color: STAFF_COLORS.textPrimary,
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
    backgroundColor: STAFF_COLORS.surface,
  },
  errorActionSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  errorActionButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: STAFF_COLORS.primary,
  },
  errorActionPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: STAFF_COLORS.surface,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: STAFF_COLORS.surface,
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
    color: STAFF_COLORS.textPrimary,
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
  },
  statusPending: {
    backgroundColor: '#FFF6E0',
    borderColor: STAFF_COLORS.primary,
  },
  statusPendingText: {
    color: STAFF_COLORS.accent,
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
    color: STAFF_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailCard: {
    backgroundColor: STAFF_COLORS.surface,
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
    color: STAFF_COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
    color: STAFF_COLORS.textSecondary,
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

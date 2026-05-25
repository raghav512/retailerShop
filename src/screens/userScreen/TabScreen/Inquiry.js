import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import apiService from '../../../Redux/apiService';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import { COLORS } from '../../../colorsList/ColorList';

const STATUS_VARIANTS = {
  pending: {
    container: 'statusPending',
    text: 'statusPendingText',
  },
  approved: {
    container: 'statusApproved',
    text: 'statusApprovedText',
  },
  rejected: {
    container: 'statusRejected',
    text: 'statusRejectedText',
  },
};

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

const formatInquiryDate = (dateValue, fallback) => {
  if (!dateValue) {
    return fallback;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
    // Handle multiple possible field names
    return photo?.url || photo?.uri || photo?.path || '';
  }

  return '';
};

const normalizeInquiryItem = (item, t, index = 0) => {
  const id = safeString(item?._id, `fallback-${index}`);
  const inquiryType = safeString(
    item?.inquiryType,
    t('inquiry_screen.fallback_na'),
  );
  // Handle undefined strings from backend
  const productName = item?.productName === 'undefined' ? t('inquiry_screen.fallback_not_specified') : safeString(
    item?.productName,
    t('inquiry_screen.fallback_not_specified'),
  );
  const cropName = safeString(item?.cropName ?? '', t('inquiry_screen.fallback_na'));
  
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
      farmerName = `${firstName} ${lastName}`.trim() || `Farmer - ${item.farmer.phone ?? farmerId}`;
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
      farmerName = `${firstName} ${lastName}`.trim() || `${item.user.role ?? 'User'} - ${item.user.phone ?? farmerId}`;
    }
  }

  const numericQuantity = Number(item?.requiredQuantity);
  const hasValidQuantity =
    Number.isFinite(numericQuantity) && numericQuantity >= 0;
  const quantityUnit = safeString(item?.quantityUnit, 'unit');
  const quantityLabel = hasValidQuantity
    ? `${numericQuantity} ${quantityUnit}`
    : t('inquiry_screen.fallback_not_specified');

  const status = normalizeStatus(item?.status);
  const isToolsInquiry = inquiryType === 'Tools';

  return {
    id,
    inquiryType,
    productName,
    cropName,
    farmerId: farmerId ?? t('inquiry_screen.fallback_unknown'),
    farmerName: farmerName ?? t('inquiry_screen.fallback_not_specified'),
    farmerPhone: farmerPhone ?? null,
    farmerProfileImage: farmerProfileImage ?? null,
    quantityLabel,
    status,
    isToolsInquiry,
    createdAtLabel: formatInquiryDate(
      item?.createdAt,
      t('inquiry_screen.fallback_date'),
    ),
    photoUri: parsePhotoUri(item?.photo || item?.inquiryPhoto),
    raw: item,
  };
};

const isSearchMatch = (item, keyword) => {
  if (!keyword) {
    return true;
  }

  const searchable = [
    item.inquiryType,
    item.productName,
    item.cropName,
    item.farmerId,
    item.farmerName,
    item.status,
    item.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes(keyword.toLowerCase());
};

const Inquiry = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [inquiries, setInquiries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchInquiries = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage('');

        const response = await apiService.getAllInquiries();
        const data = Array.isArray(response?.data) ? response.data : [];
        const mapped = data.map((item, index) =>
          normalizeInquiryItem(item, t, index),
        );

        setInquiries(mapped);
      } catch (error) {
        console.error('❌ Inquiry list fetch failed:', error);
        setErrorMessage(
          error?.response?.data?.message || t('inquiry_screen.error_load_list'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [fetchInquiries]),
  );

  const filteredInquiries = useMemo(() => {
    const keyword = safeString(searchText);
    return inquiries.filter(item => isSearchMatch(item, keyword));
  }, [inquiries, searchText]);

  const handleOpenDetails = useCallback(
    item => {
      if (!item?.id) {
        return;
      }

      navigation.navigate('InquiryDetails', {
        inquiryId: item.id,
        initialInquiry: item.raw,
      });
    },
    [navigation],
  );

  const renderInquiryItem = ({ item }) => {
    const variant = STATUS_VARIANTS[item.status] || STATUS_VARIANTS.pending;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => handleOpenDetails(item)}
      >
        <View style={styles.avatarWrap}>
          {item.farmerProfileImage ? (
            <Image source={{ uri: item.farmerProfileImage }} style={styles.thumbnail} />
          ) : (
            <Icon
              name="person-circle-outline"
              size={62}
              color={STAFF_COLORS.textSecondary}
            />
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.productName}
            </Text>

            <View style={[styles.statusPill, styles[variant.container]]}>
              <Text style={[styles.statusPillText, styles[variant.text]]}>
                {t(`inquiry_screen.status.${item.status}`)}
              </Text>
            </View>
          </View>

          <Text style={styles.cardSubTitle} numberOfLines={1}>
            {t('inquiry_screen.type_label')}: {item.inquiryType}
          </Text>

          {!item.isToolsInquiry && (
            <>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {t('inquiry_screen.crop_label')}: {item.cropName}
              </Text>

              <Text style={styles.cardMeta} numberOfLines={1}>
                {t('inquiry_screen.quantity_label')}: {item.quantityLabel}
              </Text>
            </>
          )}

          {item.farmerName && (
            <Text style={styles.cardMeta} numberOfLines={1}>
              Farmer: {item.farmerName}
            </Text>
          )}

          {item.farmerPhone && (
            <Text style={styles.cardMeta} numberOfLines={1}>
              Phone: {item.farmerPhone}
            </Text>
          )}

          <Text style={styles.cardDate}>
            {t('inquiry_screen.created_on')}: {item.createdAtLabel}
          </Text>
        </View>

        {item.photoUri && (
          <View style={styles.inquiryImageContainer}>
            <Image source={{ uri: item.photoUri }} style={styles.inquiryImage} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="chatbubbles-outline"
          size={44}
          color={STAFF_COLORS.textSecondary}
        />
        <Text style={styles.emptyTitle}>{t('inquiry_screen.empty_title')}</Text>
        <Text style={styles.emptySubtitle}>
          {searchText
            ? t('inquiry_screen.empty_search_subtitle')
            : t('inquiry_screen.empty_subtitle')}
        </Text>
      </View>
    );
  };

  if (loading && inquiries.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STAFF_COLORS.primary}
          translucent={false}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
          <Text style={styles.loaderText}>{t('inquiry_screen.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage && inquiries.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STAFF_COLORS.primary}
          translucent={false}
        />
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>
            {t('inquiry_screen.error_title')}
          </Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.retryButton}
            onPress={() => fetchInquiries()}
          >
            <Text style={styles.retryText}>{t('inquiry_screen.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('inquiry_screen.title')}</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('StaffInquiry')}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color={STAFF_COLORS.accent} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('inquiry_screen.search_placeholder')}
            placeholderTextColor={STAFF_COLORS.textSecondary}
            returnKeyType="search"
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearSearchButton}
              activeOpacity={0.8}
            >
              <Icon name="close-circle" size={20} color={STAFF_COLORS.accent} />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredInquiries}
          renderItem={renderInquiryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchInquiries(true)}
              colors={[STAFF_COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Inquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.tint,
  },
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loaderText: {
    marginTop: 10,
    color: STAFF_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    marginTop: 12,
    color: STAFF_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: STAFF_COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  searchContainer: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 15,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
  },
  clearSearchButton: {
    width: 24,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 26,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  avatarWrap: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    marginRight: 8,
  },
  statusPill: {
    minWidth: 72,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusPillText: {
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
  cardSubTitle: {
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
    marginBottom: 3,
  },
  cardDate: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  inquiryImageContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  inquiryImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#ECECEC',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 90,
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 14,
    color: STAFF_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 8,
    color: STAFF_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
});

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { FPO_COLORS, COLORS } from '../../../colorsList/ColorList';

const safeString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
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

const formatInquiryDate = dateValue => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const InquiryList = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllInquiries();
      const data = response?.data || [];
      setInquiries(data);
    } catch (error) {
      console.error('❌ Error fetching inquiries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const getStatusStyle = status => {
    const normalized = status?.toLowerCase() || 'pending';
    if (normalized === 'approved') {
      return { bg: COLORS.successLight, text: COLORS.success };
    }
    if (normalized === 'rejected') {
      return { bg: COLORS.errorLight, text: COLORS.error };
    }
    return { bg: '#FFF6E0', text: FPO_COLORS.accent };
  };

  const getFarmerInfo = item => {
    let farmerId = null;
    let farmerName = null;
    let farmerPhone = null;
    let farmerProfileImage = null;

    if (item?.farmer) {
      if (typeof item.farmer === 'string') {
        farmerId = item.farmer;
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

    if (!farmerId && item?.user) {
      if (typeof item.user === 'string') {
        farmerId = item.user;
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

    return { farmerId, farmerName, farmerPhone, farmerProfileImage };
  };

  const renderInquiry = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const photoUri = parsePhotoUri(item?.photo || item?.inquiryPhoto);
    const { farmerId, farmerName, farmerPhone, farmerProfileImage } =
      getFarmerInfo(item);
    const isToolsInquiry = item.inquiryType === 'Tools';

    // Handle undefined strings from backend
    const productName =
      item.productName === 'undefined'
        ? t('inquiry_screen.fallback_not_specified')
        : item.productName ?? t('inquiry_screen.fallback_not_specified');

    return (
      <TouchableOpacity
        style={styles.inquiryCard}
        onPress={() =>
          navigation.navigate('InquiryDetails', {
            inquiryId: item._id,
            initialInquiry: item,
          })
        }
      >
        <View style={styles.cardMainRow}>
          <View style={styles.cardTextContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {productName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyle.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {item.status ?? 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="pricetag-outline"
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.infoText}>{item.inquiryType ?? 'N/A'}</Text>
            </View>

            {!isToolsInquiry && (
              <>
                <View style={styles.infoRow}>
                  <Icon
                    name="leaf-outline"
                    size={16}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.infoText}>{item.cropName ?? 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon
                    name="cube-outline"
                    size={16}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.infoText}>
                    {item.requiredQuantity ?? 0} {item.quantityUnit ?? 'unit'}
                  </Text>
                </View>
              </>
            )}

            {farmerName && (
              <View style={styles.infoRow}>
                <Icon
                  name="person-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
                <Text style={styles.infoText} numberOfLines={1}>
                  {farmerName}
                </Text>
              </View>
            )}

            {farmerPhone && (
              <View style={styles.infoRow}>
                <Icon name="call-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {farmerPhone}
                </Text>
              </View>
            )}
          </View>

          {farmerProfileImage ? (
            <Image
              source={{ uri: farmerProfileImage }}
              style={styles.thumbnailImage}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Icon
                name="person-outline"
                size={26}
                color={FPO_COLORS.textTertiary}
              />
            </View>
          )}
        </View>

        {photoUri && (
          <View style={styles.inquiryImageContainer}>
            <Image source={{ uri: photoUri }} style={styles.inquiryImage} />
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {formatInquiryDate(item.createdAt) ??
              t('inquiry_screen.fallback_date')}
          </Text>
          <Icon name="chevron-forward" size={20} color={FPO_COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={FPO_COLORS.primary}
          translucent={false}
        />
        <LinearGradient
          colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('fpo_home.inquiry')}</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>
        </LinearGradient>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />
      <LinearGradient
        colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('fpo_home.inquiry')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={inquiries}
        renderItem={renderInquiry}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FPO_COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon
              name="document-text-outline"
              size={64}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>No inquiries found</Text>
          </View>
        }
      />
    </View>
  );
};

export default InquiryList;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
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
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inquiryCard: {
    backgroundColor: FPO_COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: FPO_COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTextContent: {
    flex: 1,
    paddingRight: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
    letterSpacing: 0.1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: FPO_COLORS.textSecondary,
    fontWeight: '600',
  },
  thumbnailImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
  },
  thumbnailPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: FPO_COLORS.tintCard,
    borderWidth: 1,
    borderColor: FPO_COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FPO_COLORS.borderLight,
  },
  dateText: {
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
    fontWeight: '600',
  },
});

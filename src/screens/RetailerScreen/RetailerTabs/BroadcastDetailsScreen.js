import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');

const BroadcastDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { broadcastId, title, description, image, timestamp } =
    route.params || {};

  const [broadcast, setBroadcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (title && description) {
      setBroadcast({ title, description, image, sentAt: timestamp });
      setLoading(false);
    } else if (broadcastId) {
      fetchBroadcastDetails();
    } else {
      setLoading(false);
    }
  }, [broadcastId]);

  const fetchBroadcastDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBroadcastById(broadcastId);

      if (response?.success) {
        setBroadcast(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching broadcast details:', error);
      if (error?.response?.status === 403) {
        setError(error.response.data.message || t('broadcasts.access_denied'));
      } else {
        setError(t('broadcasts.load_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={RETAILER_COLORS.primary} />
      </View>
    );
  }

  if (error || !broadcast) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || t('broadcasts.not_found')}
        </Text>
        <TouchableOpacity
          style={styles.backButtonInline}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('broadcasts.go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getImageUrl = img => {
    if (!img) return null;
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      try {
        const parsed = JSON.parse(img);
        return parsed?.url || img;
      } catch (e) {
        return img;
      }
    }
    if (typeof img === 'object') return img.url || null;
    return null;
  };

  const imageUrl = getImageUrl(broadcast.image);

  const formatFullDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(t('i18n_locale') || 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={RETAILER_COLORS.primary}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('broadcasts.detail_title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.contentCard}>
          <View style={styles.titleSection}>
            <View style={styles.iconBadge}>
              <Icon name="megaphone" size={20} color={RETAILER_COLORS.primary} />
            </View>
            <Text style={styles.title}>{broadcast.title}</Text>
          </View>

          <View style={styles.metaRow}>
            <Icon
              name="time-outline"
              size={16}
              color={RETAILER_COLORS.textSecondary}
            />
            <Text style={styles.timestamp}>
              {formatFullDate(broadcast.sentAt || broadcast.createdAt)}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>{broadcast.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButtonInline: {
    backgroundColor: RETAILER_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: RETAILER_COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: width,
    height: 240,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: RETAILER_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
    letterSpacing: 0.2,
  },
});

export default BroadcastDetailsScreen;

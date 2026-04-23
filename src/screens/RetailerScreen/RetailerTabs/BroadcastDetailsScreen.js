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
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.headerSpacer} />
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={RETAILER_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {t('broadcasts.detail_title')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{broadcast.title}</Text>
          <Text style={styles.timestamp}>
            {formatFullDate(broadcast.sentAt || broadcast.createdAt)}
          </Text>

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
    backgroundColor: RETAILER_COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RETAILER_COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RETAILER_COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: RETAILER_COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  backButtonInline: {
    backgroundColor: RETAILER_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonText: {
    color: RETAILER_COLORS.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  headerSpacer: {
    height: 6,
    backgroundColor: RETAILER_COLORS.surface,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: RETAILER_COLORS.surface,
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
    backgroundColor: RETAILER_COLORS.tintCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  image: {
    width: width,
    height: 250,
    backgroundColor: RETAILER_COLORS.tintMid,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: {
    padding: 24,
    backgroundColor: RETAILER_COLORS.surface,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 10,
    lineHeight: 30,
  },
  timestamp: {
    fontSize: 14,
    color: RETAILER_COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: RETAILER_COLORS.tintMid,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: RETAILER_COLORS.textSecondary,
  },
});

export default BroadcastDetailsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // Distributor Steel Blue

const BroadcastsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await apiService.getAllBroadcasts(pageNum, 20);

      if (response?.success) {
        const newBroadcasts = response.data || [];
        const { pages, page: currentPage } = response.pagination || {};

        if (isRefresh || pageNum === 1) setBroadcasts(newBroadcasts);
        else setBroadcasts(prev => [...prev, ...newBroadcasts]);

        setHasMore(currentPage < pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('❌ Error fetching broadcasts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBroadcasts(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchBroadcasts(page + 1);
  };

  const renderBroadcastItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('BroadcastDetails', { broadcastId: item._id })
      }
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Icon name="megaphone" size={18} color={THEME} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.cardDate}>
            {formatDate(item.sentAt || item.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        {item.targetRole !== 'retailer' && (
          <View style={styles.badge}>
            <Icon
              name="people"
              size={12}
              color={THEME}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.badgeText}>
              {item.targetRole === 'all'
                ? 'For Everyone'
                : `For ${capitalize(item.targetRole)}s`}
            </Text>
          </View>
        )}
        <Icon name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Icon name="megaphone-outline" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyText}>
        {t('no_broadcasts') || 'No broadcasts yet'}
      </Text>
      <Text style={styles.emptySubText}>
        {t('no_broadcasts_desc') ||
          "You'll see important updates and announcements here"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={THEME} />
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          FPO_COLORS.primary,
          FPO_COLORS.primaryDark,
          FPO_COLORS.primaryLight,
        ]}
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
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('broadcasts') || 'Broadcasts'}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <FlatList
          data={broadcasts}
          renderItem={renderBroadcastItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME]}
              tintColor={THEME}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={broadcasts.length === 0 ? renderEmpty : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

/* ================= HELPERS ================= */
const formatDate = dateString => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  else if (diffHours < 24)
    return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  else if (diffDays < 7)
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  else
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

const capitalize = str =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
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
  header: {
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
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContent: { padding: 16, paddingBottom: 40 },

  /* CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  cardDate: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  badge: {
    backgroundColor: '#EBF3F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { fontSize: 12, color: THEME, fontWeight: '700' },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  footerLoader: { paddingVertical: 20, alignItems: 'center' },
});

export default BroadcastsScreen;

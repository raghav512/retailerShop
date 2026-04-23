import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import apiService from '../../../Redux/apiService';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';
import { STAFF_COLORS, COLORS } from '../../../colorsList/ColorList';

/* ---------------- DUMMY DATA (API READY) ---------------- */

/* ---------------- DUMMY DATA (API READY) ---------------- */

const STATS = [
  { id: '1', key: 'today_procurements', value: '24', icon: 'document-text' },
  { id: '2', key: 'pending_quality', value: '8', icon: 'time' },
  { id: '3', key: 'pending_payments', value: '12', icon: 'cash' },
];

const QUICK_ACTIONS = [
  {
    id: '1',
    key: 'home.inquiry',
    route: 'Inquiry',
    icon: 'chatbubble-outline',
  },
  {
    id: '2',
    key: 'home.attendance',
    route: 'Attendance',
    icon: 'calendar-outline',
  },
  {
    id: '3',
    key: 'home.orders',
    route: 'Orders',
    icon: 'document-text-outline',
  },
  {
    id: '4',
    key: 'home.task_assigned',
    route: 'TaskAssigned',
    icon: 'clipboard-outline',
  },
];

const Home = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // 🌍
  const [stats, setStats] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ✅ Load unread count when screen focuses */
  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        const count = await AsyncStorage.getItem('unreadCount');
        setUnreadCount(count ? parseInt(count, 10) : 0);
      };
      loadCount();
    }, []),
  );

  useEffect(() => {
    // 1. Listen for background-to-foreground app state changes
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          const stored = await AsyncStorage.getItem('unreadCount');
          setUnreadCount(stored ? parseInt(stored, 10) : 0);
        }
      },
    );

    // 2. Notifee foreground event
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type }) => {
      if (type === EventType.DELIVERED) {
        const stored = await AsyncStorage.getItem('unreadCount');
        setUnreadCount(stored ? parseInt(stored, 10) : 0);
      }
    });

    // 3. FCM foreground message event
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.data?.type === 'ADMIN_BROADCAST') {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      subscription.remove();
      unsubscribeNotifee();
      unsubscribeFCM();
    };
  }, []);

  useEffect(() => {
    // Later replace with backend API
    setStats(STATS);
  }, []);

  const mapPurchaseForUI = item => {
    const cropNames =
      item.crops && item.crops.length > 0
        ? item.crops.map(c => c.cropName).join(', ')
        : 'N/A';

    const totalQty =
      item.crops && item.crops.length > 0
        ? item.crops.reduce((acc, c) => acc + (c.quantity || 0), 0)
        : 0;

    let farmerName = 'Farmer';
    if (item.farmer && typeof item.farmer === 'object') {
      farmerName = `${item.farmer.firstName || ''} ${
        item.farmer.lastName || ''
      }`.trim();
    } else if (item.farmerName) {
      farmerName = item.farmerName;
    }

    return {
      id: item._id,
      farmer: farmerName || 'Unknown',
      code: item._id ? item._id.slice(-6).toUpperCase() : '',
      crop: cropNames,
      quantity: `${totalQty} quintal`,
      amount: `₹${item.totalAmount || 0}`,
      date: item.procurementDate
        ? new Date(item.procurementDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'N/A',
      status: item.status || 'completed',
    };
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await apiService.GetStaffPurches();
        console.log('HOME PURCHASE DATA 👉', response);

        const mapped = response.map(mapPurchaseForUI);

        // same card UI, just backend data
        setProcurements(mapped.slice(0, 3));

        // same stats UI
        setStats([
          {
            id: '1',
            key: 'today_procurements',
            value: response.length.toString(),
            icon: 'document-text',
          },
          {
            id: '2',
            key: 'pending_quality',
            value: '0',
            icon: 'time',
          },
          {
            id: '3',
            key: 'pending_payments',
            value: '0',
            icon: 'cash',
          },
        ]);
      } catch (error) {
        console.log('HOME API ERROR 👉', error);
      }
    };

    fetchHomeData();
  }, []);

  /* ---------------- RENDERERS ---------------- */

  const renderProcurement = ({ item }) => (
    <View style={styles.procCard}>
      <View style={styles.procHeader}>
        <Text style={styles.procName}>
          {item.farmer} <Text style={styles.procCode}>— {item.code}</Text>
        </Text>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>
            {' '}
            {t(`status.${item.status.toLowerCase()}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.procCrop}>
        {item.crop} • {item.quantity}
      </Text>
      <View style={styles.procFooter}>
        <View>
          <Text style={styles.procLabel}>{t('Common.amount')}</Text>
          <Text style={styles.procAmount}>{item.amount}</Text>
        </View>
        <View style={styles.procDateWrap}>
          <Text style={styles.procLabel}>{t('Common.date')}</Text>
          <Text style={styles.procDate}>{item.date}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* MODERN GLASS TOP-BAR JUST LIKE FARMER HOME */}
      <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
        <View style={styles.greetingBox}>
          <Text style={styles.helloText}>{t('home.title')}</Text>
          <Text style={styles.subText}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.headerRight}>
          <LanguageSwitcher
            iconColor={STAFF_COLORS.accent}
            style={styles.iconBtn}
          />

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={async () => {
              await AsyncStorage.setItem('unreadCount', '0');
              setUnreadCount(0);
              navigation.navigate('Broadcasts');
            }}
          >
            <Icon name="notifications" size={24} color={STAFF_COLORS.accent} />

            {unreadCount > 0 && (
              <View style={styles.badgeIndicator}>
                <Text style={styles.badgeNum}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.statsRow}>
            {stats.map(item => (
              <View key={item.id} style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={STAFF_COLORS.primary}
                  />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{t(`stats.${item.key}`)}</Text>
              </View>
            ))}
          </View>

          {/* EXPLORE SECTION - REPLACES BUTTON ROWS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('quick_actions', 'Quick Actions')}
            </Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((item, index) => {
              const isFocused = index === 0;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.quickActionCard,
                    isFocused && styles.quickActionCardFocused,
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.82}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      isFocused && styles.quickActionIconFocused,
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={26}
                      color={
                        isFocused ? STAFF_COLORS.accent : STAFF_COLORS.primary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.quickActionText,
                      isFocused && styles.quickActionTextFocused,
                    ]}
                    numberOfLines={2}
                  >
                    {t(item.key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RECENT */}
          <View style={[styles.sectionHeader, styles.recentSectionHeader]}>
            <Text style={styles.sectionTitle}>
              {t('home.recent_procurements')}
            </Text>
          </View>

          <View style={styles.nestedWrapper}>
            <FlatList
              data={procurements}
              keyExtractor={item => item.id}
              renderItem={renderProcurement}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.tint,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    paddingTop: 12,
  },

  /* TOP BAR - Premium Branded Header */
  headerSpacer: {
    height: 0,
    backgroundColor: STAFF_COLORS.primaryLight,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: STAFF_COLORS.primaryLight,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 10,
    marginBottom: 8,
  },
  greetingBox: {
    flex: 1,
  },
  helloText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: STAFF_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 14,
    color: STAFF_COLORS.accent,
    marginTop: 4,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: STAFF_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  badgeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: STAFF_COLORS.surface,
  },
  badgeNum: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  /* STATS - Compact Premium Cards */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: STAFF_COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: STAFF_COLORS.primary + '18',
  },
  statValue: {
    color: STAFF_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: STAFF_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: '600',
  },

  /* QUICK ACTIONS - Equal Size Cards */
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 14,
  },
  recentSectionHeader: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  quickActionCard: {
    width: '48%',
    minHeight: 128,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    backgroundColor: STAFF_COLORS.tintCard,
    marginBottom: 12,
  },
  quickActionCardFocused: {
    backgroundColor: STAFF_COLORS.primary,
    borderColor: STAFF_COLORS.accent + '30',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STAFF_COLORS.surface,
    borderWidth: 1,
    borderColor: STAFF_COLORS.primary + '20',
  },
  quickActionIconFocused: {
    backgroundColor: STAFF_COLORS.textOnPrimary + '55',
    borderColor: STAFF_COLORS.textOnPrimary + '88',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: STAFF_COLORS.textPrimary,
    lineHeight: 21,
  },
  quickActionTextFocused: {
    color: STAFF_COLORS.accent,
  },

  nestedWrapper: {
    paddingHorizontal: 16,
  },

  /* RECENT PROCUREMENTS CARD - Compact */
  procCard: {
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: STAFF_COLORS.primary + '12',
  },
  procHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  procName: {
    fontWeight: '700',
    fontSize: 14,
    color: STAFF_COLORS.textPrimary,
  },
  procCode: {
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  completedText: {
    fontSize: 9,
    color: COLORS.success,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  procCrop: {
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 10,
  },
  procFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: STAFF_COLORS.primary + '10',
  },
  procDateWrap: {
    alignItems: 'flex-end',
  },
  procLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  procAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: STAFF_COLORS.primary,
    marginTop: 3,
  },
  procDate: {
    fontSize: 13,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginTop: 3,
  },
});

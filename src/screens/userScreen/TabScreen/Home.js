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
  Animated,
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
      subscription?.remove?.();
      unsubscribeNotifee?.();
      unsubscribeFCM?.();
    };
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
        if (response && Array.isArray(response)) {
          const mapped = response.map(mapPurchaseForUI);
          setProcurements(mapped.slice(0, 3));
        }
      } catch (error) {
        setProcurements([]);
      }
    };

    fetchHomeData();
  }, []);

  /* ---------------- RENDERERS ---------------- */

  const renderProcurement = ({ item }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.procCard}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            console.log('Procurement tapped:', item.id);
          }}
        >
          <View style={styles.procTopRow}>
            <View style={styles.procFarmerSection}>
              <View style={styles.farmerAvatar}>
                <Icon name="person" size={18} color="#fff" />
              </View>
              <View style={styles.farmerInfo}>
                <Text style={styles.procFarmerName} numberOfLines={1}>
                  {item.farmer}
                </Text>
                <Text style={styles.procCrop} numberOfLines={1}>{item.crop} • {item.quantity}</Text>
              </View>
            </View>
            <View style={styles.procRight}>
              <Text style={styles.procAmount}>{item.amount}</Text>
              <Text style={styles.procDate}>{item.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
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
            iconColor="#FFFFFF"
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
            <Icon name="notifications" size={24} color="#FFFFFF" />

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
          {/* EXPLORE SECTION - REPLACES BUTTON ROWS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('quick_actions', 'Quick Actions')}
            </Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((item, index) => {
              const isFocused = index === 0;
              const scaleAnim = new Animated.Value(1);

              const handlePressIn = () => {
                Animated.spring(scaleAnim, {
                  toValue: 0.95,
                  useNativeDriver: true,
                }).start();
              };

              const handlePressOut = () => {
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  friction: 3,
                  useNativeDriver: true,
                }).start();
              };

              return (
                <Animated.View
                  key={item.id}
                  style={{ transform: [{ scale: scaleAnim }], width: '47.5%' }}
                >
                  <TouchableOpacity
                    style={[
                      styles.quickActionCard,
                      isFocused && styles.quickActionCardFocused,
                    ]}
                    onPress={() => navigation.navigate(item.route)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                  >
                    <View
                      style={[
                        styles.quickActionIcon,
                        isFocused && styles.quickActionIconFocused,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={28}
                        color={
                          isFocused ? '#FFFFFF' : STAFF_COLORS.primary
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
                </Animated.View>
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
    backgroundColor: '#F9FAFB',
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
    backgroundColor: STAFF_COLORS.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
    marginBottom: 8,
  },
  greetingBox: {
    flex: 1,
  },
  helloText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* QUICK ACTIONS - Equal Size Cards */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  recentSectionHeader: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: STAFF_COLORS.primary,
    letterSpacing: 0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 18,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    justifyContent: 'flex-start',
    gap: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  quickActionCardFocused: {
    backgroundColor: STAFF_COLORS.primary,
    borderColor: STAFF_COLORS.primary,
    elevation: 6,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STAFF_COLORS.primaryLight + '15',
    borderWidth: 0,
  },
  quickActionIconFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#111827',
    lineHeight: 18,
  },
  quickActionTextFocused: {
    color: '#FFFFFF',
  },

  nestedWrapper: {
    paddingHorizontal: 18,
  },

  /* RECENT PROCUREMENTS CARD - Minimal Compact */
  procCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  procTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  procFarmerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  farmerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: STAFF_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  farmerInfo: {
    flex: 1,
  },
  procFarmerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  procCrop: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  procRight: {
    alignItems: 'flex-end',
  },
  procAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: STAFF_COLORS.primary,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  procDate: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});

import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  AppState,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import LatestNotifications from '../../../components/LatestNotifications';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useEffect } from 'react';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';
import FloatingAIAssistant from '../../../animations/FloatingAIAssistant';
import AdvertisementSlider from '../../../components/AdvertisementSlider';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

/* 🔹 Waving Hand Component */
const WavingHand = () => {
  const waveAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: -1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    ).start();
  }, []);

  const spin = waveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '25deg'],
  });

  return (
    <Animated.Text style={{ fontSize: 24, transform: [{ rotate: spin }] }}>
      👋
    </Animated.Text>
  );
};

/* 🔹 MOCK DATA (Replace with API later) */
const QUICK_ACTIONS = [
  { id: '1', key: 'my_farm', icon: 'home' },
  { id: '2', key: 'my_crop', icon: 'leaf' },
  { id: '3', key: 'crop_doctor', icon: 'medkit' },
  { id: '4', key: 'my_orders.title', icon: 'receipt' },
];

const FarmerHome = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // 🌍
  const [unreadCount, setUnreadCount] = useState(0);

  /* ✅ Load unread count when screen focuses */
  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        const count = await AsyncStorage.getItem('unreadCount');
        setUnreadCount(count ? parseInt(count) : 0);
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
          setUnreadCount(stored ? parseInt(stored) : 0);
        }
      },
    );

    // 2. Notifee foreground event
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type }) => {
      if (type === EventType.DELIVERED) {
        const stored = await AsyncStorage.getItem('unreadCount');
        setUnreadCount(stored ? parseInt(stored) : 0);
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

  const handleActionPress = key => {
    if (key === 'documents') navigation.navigate('ScreenSeventh');
    if (key === 'create_listing.title') navigation.navigate('CreateListing');
    if (key === 'my_farm') navigation.navigate('MyFarms');
    if (key === 'my_crop') navigation.navigate('MyCrops');
    if (key === 'my_orders.title') navigation.navigate('MyOrders');
    if (key === 'farmer_tabs.marketplace')
      navigation.navigate('FarmerMarketTab');
    if (key === 'crop_doctor') navigation.navigate('CropDoctor');
    if (key === 'chatbot_label') navigation.navigate('ChatBot');
    if (key === 'community') navigation.navigate('Community');
    if (key === 'mandi_prices') navigation.navigate('MandiPricesScreen');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NEW MODERN HEADER */}
        <View style={styles.headerSpacer} />
        <View style={styles.topBar}>
          <View style={styles.greetingBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.helloText}>{t('hello_farmer')} </Text>
              <WavingHand />
            </View>
            <Text style={styles.subText}>{t('welcome_back')}</Text>
          </View>
          <View style={styles.headerRight}>
            <LanguageSwitcher
              iconColor={FARMER_COLORS.textOnPrimary}
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
              <Icon
                name="notifications-outline"
                size={24}
                color={FARMER_COLORS.textOnPrimary}
              />
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

        <View style={styles.adWrapper}>
          <AdvertisementSlider />
        </View>

        {/* EXPLORE SECTION - QUICK ACTIONS GRID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionCard}
              onPress={() => handleActionPress(item.key)}
            >
              <View style={styles.actionIconContainer}>
                <Icon
                  name={item.icon}
                  size={28}
                  color={FARMER_COLORS.surface}
                />
              </View>
              <Text style={styles.actionCardText}>{t(item.key)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('latest_notifications', 'Latest Notifications')}
          </Text>
        </View>

        <View style={styles.notificationsWrapper}>
          <LatestNotifications />
        </View>
      </ScrollView>

      <FloatingAIAssistant onPress={() => navigation.navigate('ChatBot')} />
    </View>
  );
};

export default FarmerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 88,
  },
  headerSpacer: {
    height: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  greetingBox: {
    flex: 1,
  },
  helloText: {
    fontSize: 28,
    fontWeight: '700',
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.3,
    lineHeight: 34,
  },
  subText: {
    fontSize: 14,
    color: FARMER_COLORS.textSubOnPrimary,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
    opacity: 0.95,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: FARMER_COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeNum: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  adWrapper: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  actionCard: {
    width: '47%',
    aspectRatio: 1.3,
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  notificationsWrapper: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: FARMER_COLORS.surface,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.1)',
  },
});

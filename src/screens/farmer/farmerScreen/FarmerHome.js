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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import LatestNotifications from '../../../components/LatestNotifications';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useEffect, useRef } from 'react';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';
import FloatingAIAssistant from '../../../animations/FloatingAIAssistant';
import AdvertisementSlider from '../../../components/AdvertisementSlider';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

/* 🔹 Animated Action Card Component */
const AnimatedActionCard = ({ item, onPress, t }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View style={[styles.actionCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.actionCardInner}
        onPress={() => onPress(item.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['#4A7C35', '#2B4D21', '#4b5e2a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionIconContainer}
        >
          <Icon name={item.icon} size={22} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.actionCardText}>
          {t(item.key).replace(' ', '\n')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
  { id: '5', key: 'farmer_diary.title', icon: 'book' },
  { id: '6', key: 'farmer_inquiry.title', icon: 'help-circle' },
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
    if (key === 'farmer_diary.title') navigation.navigate('FarmerDiary');
    if (key === 'farmer_inquiry.title') navigation.navigate('FarmerInquiry');
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

        <LinearGradient
          colors={['#f0f7e6', '#e8f5d8', '#f4f9ed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionsContainer}
        >
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(item => (
              <AnimatedActionCard
                key={item.id}
                item={item}
                onPress={handleActionPress}
                t={t}
              />
            ))}
          </View>
        </LinearGradient>

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
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
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    elevation: 8,
    shadowColor: '#8EAB53',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.2)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#4A7C35',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 2,
    borderColor: 'rgba(142, 171, 83, 0.35)',
    backdropFilter: 'blur(10px)',
  },
  actionCardInner: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2B4D21',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 16,
    textAlign: 'center',
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

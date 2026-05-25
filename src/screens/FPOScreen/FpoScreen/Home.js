import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';
import { FPO_COLORS, COLORS } from '../../../colorsList/ColorList';

/* ---------------- ANIMATED ACTION CARD ---------------- */
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
    <Animated.View
      style={[styles.actionCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={styles.actionCardInner}
        onPress={() => onPress(item.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['#6366F1', '#4338CA', '#312E81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionIconContainer}
        >
          <Icon name={item.icon} size={22} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.actionCardText}>
          {t(`fpo_home.${item.key}`) || item.key}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ---------------- DATA (API READY) ---------------- */

const ACTIONS = [
  { id: '2', key: 'order_details', icon: 'receipt' },
  { id: '3', key: 'farmer_listing', icon: 'list' },
  { id: '4', key: 'all_tasks', icon: 'checkbox-outline' },
  { id: '5', key: 'Community', icon: 'people-outline' },
  { id: '6', key: 'inquiry', icon: 'help-circle-outline' },
  { id: '7', key: 'attendance_calendar', icon: 'calendar' },
];

/* ---------------- SCREEN ---------------- */

const Home = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [activeFarms, setActiveFarms] = useState(0);
  const [actions] = useState(ACTIONS);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [showAllExpiring, setShowAllExpiring] = useState(false);

  console.log('🔍 Total actions:', actions.length);
  console.log('🔍 Actions:', actions);

  const handleActionPress = useCallback(
    key => {
      switch (key) {
        case 'order_details':
          navigation.navigate('OrderDetails');
          break;
        case 'farmer_listing':
          navigation.navigate('FarmerListing');
          break;
        case 'all_tasks':
          navigation.navigate('AllTasksAssigned');
          break;
        case 'Community':
          navigation.navigate('FpoCommunity');
          break;
        case 'inquiry':
          navigation.navigate('InquiryList');
          break;
        case 'attendance_calendar':
          navigation.navigate('AttendanceCalendar');
          break;
      }
    },
    [navigation],
  );

  const fetchExpiringProducts = async () => {
    try {
      const response = await apiService.getExpiringProducts();
      console.log('Expiring products response:', response);

      // Flatten all categories into one array
      const allProducts = [
        ...(response?.data?.expired || []),
        ...(response?.data?.expiringIn30Days || []),
        ...(response?.data?.expiringIn60Days || []),
      ];

      setExpiringProducts(allProducts);
    } catch (error) {
      console.log('Error fetching expiring products:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch farmers count
      const farmersRes = await apiService.getAllFarmers();
      const farmersCount = farmersRes?.length || 0;
      setTotalFarmers(farmersCount);

      // Try to fetch farms count
      try {
        const farmsRes = await apiService.getAllFarms();
        const farmsCount = farmsRes?.data?.length || farmsRes?.length || 0;
        setActiveFarms(farmsCount);
      } catch (farmError) {
        // Keep farms count as 0 if API fails
        setActiveFarms(0);
      }
    } catch (error) {
      console.log('❌ Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchExpiringProducts();
    fetchDashboardStats();
  }, []);

  /* ---------------- RENDER ITEMS ---------------- */

  const renderExpiringProduct = useCallback(
    ({ item }) => {
      const daysLeft = item.daysLeft || 0;
      const isExpired = daysLeft <= 0;
      const isUrgent = daysLeft > 0 && daysLeft <= 7;

      return (
        <View style={styles.expiringCard}>
          <View style={styles.expiringLeft}>
            <Text style={styles.expiringName}>{item.productName}</Text>
            <Text style={styles.expiringVariant}>
              {item.parameter} {item.unit} - ₹{item.mrp}
            </Text>
          </View>
          <View
            style={[
              styles.expiringBadge,
              isExpired && styles.expiringExpired,
              isUrgent && styles.expiringUrgent,
            ]}
          >
            <Icon name="time-outline" size={16} color={COLORS.white} />
            <Text style={styles.expiringDays}>
              {isExpired ? t('fpo_home.expired') : `${daysLeft}d`}
            </Text>
          </View>
        </View>
      );
    },
    [t],
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
        <View style={styles.greetingBox}>
          <Text style={styles.helloText}>{t('fpo_home.fpo_dashboard')}</Text>
          <Text style={styles.subText}>{t('fpo_home.manage_farmers')}</Text>
        </View>

        <View style={styles.headerRight}>
          <LanguageSwitcher
            iconColor={FPO_COLORS.textOnPrimary}
            style={styles.iconBtn}
          />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('SendBroadcast')}
          >
            <Icon name="megaphone" size={24} color={FPO_COLORS.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* STATS - Compact Cards */}

          {/* <View style={styles.statsRow}>
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF', '#F5F7FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('FarmerTab', { screen: 'Visits' })
                }
                style={styles.statCardInner}
              >
                <LinearGradient
                  colors={['#6366F1', '#4338CA', '#312E81']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statIconWrapper}
                >
                  <Icon name="people" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{totalFarmers}</Text>
                <Text style={styles.statLabel}>
                  {t('fpo_home.total_farmers')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF', '#F5F7FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AllActiveFarms')}
                style={styles.statCardInner}
              >
                <LinearGradient
                  colors={['#6366F1', '#4338CA', '#312E81']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statIconWrapper}
                >
                  <Icon name="analytics" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{activeFarms}</Text>
                <Text style={styles.statLabel}>
                  {t('fpo_home.active_fields')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          </View> */}

          {/* QUICK ACTIONS - Compact Grid */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('fpo_home.quick_actions')}
            </Text>
          </View>

          <LinearGradient
            colors={['#EEF2FF', '#E0E7FF', '#F5F7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickActionsContainer}
          >
            <View style={styles.quickActionsGrid}>
              {actions.map(item => (
                <AnimatedActionCard
                  key={item.id}
                  item={item}
                  onPress={handleActionPress}
                  t={t}
                />
              ))}
            </View>
          </LinearGradient>

          {/* ASSIGN TASK BUTTON */}
          <TouchableOpacity
            style={styles.assignTaskButton}
            onPress={() => navigation.navigate('AssignTask')}
          >
            <Icon
              name="clipboard-outline"
              size={20}
              color={FPO_COLORS.textOnPrimary}
            />
            <Text style={styles.assignTaskText}>
              {t('fpo_home.assign_task')}
            </Text>
          </TouchableOpacity>

          {/* EXPIRING PRODUCTS */}
          <View style={styles.sectionHeaderExt}>
            <Text style={styles.sectionTitle}>
              {t('fpo_home.expiring_products')}
            </Text>
            {expiringProducts.length > 1 && (
              <TouchableOpacity
                onPress={() => setShowAllExpiring(!showAllExpiring)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>
                  {showAllExpiring
                    ? t('fpo_home.show_less')
                    : t('fpo_home.view_all')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nestedWrapper}>
            {expiringProducts.length > 0 ? (
              <View>
                {/* Render via flex instead of FlatList since it's inside ScrollView */}
                {(showAllExpiring
                  ? expiringProducts
                  : expiringProducts.slice(0, 2)
                ).map((item, index) => (
                  <View key={item._id || String(index)}>
                    {renderExpiringProduct({ item })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon
                  name="checkmark-circle"
                  size={32}
                  color={COLORS.success}
                />
                <Text style={styles.emptyText}>
                  {t('fpo_home.no_expiring_products')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  container: {
    paddingTop: 0,
  },

  headerSpacer: {
    height: 0,
    backgroundColor: FPO_COLORS.primary,
  },

  /* TOP BAR - Premium Branded Header */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: FPO_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: FPO_COLORS.primaryDark,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
    marginBottom: 4,
  },
  greetingBox: {
    flex: 1,
  },
  helloText: {
    fontSize: 26,
    fontWeight: '800',
    color: FPO_COLORS.textOnPrimary,
    letterSpacing: 0.2,
    lineHeight: 32,
  },
  subText: {
    fontSize: 13,
    color: FPO_COLORS.textSubOnPrimary,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.1,
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: FPO_COLORS.textOnPrimary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FPO_COLORS.textOnPrimary + '25',
  },

  /* STATS - Compact Premium Cards */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginBottom: 12,
    marginTop: 8,
    gap: 12,
  },
  statCard: {
    width: '41%',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#4338CA',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  statCardInner: {
    padding: 10,
    alignItems: 'center',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#312E81',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    color: FPO_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  statLabel: {
    color: FPO_COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  /* QUICK ACTIONS - Compact Grid */
  sectionHeader: {
    paddingHorizontal: 40,
    marginTop: 30,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 12,
    elevation: 6,
    shadowColor: '#4338CA',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(67, 56, 202, 0.15)',
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
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#4338CA',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  actionCardInner: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#312E81',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 16,
    textAlign: 'center',
    minHeight: 32,
    includeFontPadding: true,
  },

  /* ASSIGN TASK BUTTON */
  assignTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FPO_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    elevation: 4,
    shadowColor: FPO_COLORS.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  assignTaskText: {
    fontSize: 14,
    fontWeight: '700',
    color: FPO_COLORS.textOnPrimary,
    letterSpacing: 0.2,
  },

  /* EXPIRING PRODUCTS - Compact Alert Cards */
  sectionHeaderExt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 12,
  },
  viewAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: FPO_COLORS.tintCard,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  viewAllText: {
    fontSize: 12,
    color: FPO_COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  nestedWrapper: {
    paddingHorizontal: 20,
  },
  expiringCard: {
    backgroundColor: FPO_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: FPO_COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1.5,
    borderColor: FPO_COLORS.borderLight,
  },
  expiringLeft: {
    flex: 1,
    paddingRight: 12,
  },
  expiringName: {
    fontSize: 15,
    fontWeight: '700',
    color: FPO_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  expiringVariant: {
    fontSize: 13,
    color: FPO_COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  expiringBadge: {
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: COLORS.warning,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  expiringUrgent: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
  },
  expiringExpired: {
    backgroundColor: COLORS.textMuted,
    shadowColor: COLORS.textMuted,
  },
  expiringDays: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* EMPTY STATE - Compact Design */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: FPO_COLORS.tintCard,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: FPO_COLORS.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: FPO_COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
});

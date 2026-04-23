import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';
import { FPO_COLORS, COLORS } from '../../../colorsList/ColorList';

/* ---------------- DATA (API READY) ---------------- */

const ACTIONS = [
  { id: '1', key: 'add_farmer', icon: 'person-add', bg: FPO_COLORS.primary },
  { id: '2', key: 'order_details', icon: 'receipt', bg: '#16A34A' },
  {
    id: '3',
    key: 'farmer_listing',
    icon: 'list',
    bg: '#9333EA',
    route: 'FarmerListing',
  },
  { id: '4', key: 'all_tasks', icon: 'checkbox-outline', bg: '#0EA5E9' },
  { id: '5', key: 'Community', icon: 'people-outline', bg: '#F97316' },
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

  const handleActionPress = useCallback(
    key => {
      switch (key) {
        case 'add_farmer':
          navigation.navigate('Screen1', { themeColor: FPO_COLORS.primary });
          break;
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

  const renderStat = useCallback(
    ({ item }) => (
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{t(`fpo_home.${item.key}`)}</Text>
      </View>
    ),
    [t],
  );

  /* Primary & Secondary Actions Split */
  const primaryActions = actions.slice(0, 2);
  const secondaryActions = actions.slice(2);

  const renderExpiringProduct = useCallback(
    ({ item }) => {
      const daysLeft = item.daysLeft || 0;
      const isExpired = daysLeft <= 0;
      const isUrgent = daysLeft > 0 && daysLeft <= 7;

      return (
        <TouchableOpacity
          style={styles.expiringCard}
          onPress={() =>
            navigation.navigate('ProductDetails', {
              product: {
                _id: item.productId,
                productName: item.productName,
                brand: item.brand,
              },
            })
          }
        >
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
        </TouchableOpacity>
      );
    },
    [navigation, t],
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
          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Icon name="people" size={26} color={FPO_COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{totalFarmers}</Text>
              <Text style={styles.statLabel}>
                {t('fpo_home.total_farmers')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Icon name="analytics" size={26} color={FPO_COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{activeFarms}</Text>
              <Text style={styles.statLabel}>
                {t('fpo_home.active_fields')}
              </Text>
            </View>
          </View>

          {/* EXPLORE SECTION - MATCHES FARMER HOME */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('fpo_home.quick_actions')}
            </Text>
          </View>

          <View style={styles.primaryActionsContainer}>
            {primaryActions.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.primaryCard,
                  index === 0 ? styles.focusedCard : styles.lightCard,
                ]}
                onPress={() => handleActionPress(item.key)}
              >
                <View
                  style={[
                    styles.primaryIconWrapper,
                    index === 0 ? styles.focusedIcon : styles.lightIcon,
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={30}
                    color={
                      index === 0
                        ? FPO_COLORS.textOnPrimary
                        : FPO_COLORS.primary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.primaryCardText,
                    index === 0
                      ? { color: FPO_COLORS.textOnPrimary }
                      : { color: FPO_COLORS.textPrimary },
                  ]}
                >
                  {t(`fpo_home.${item.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECONDARY ACTIONS GRID */}
          <View style={styles.secondaryActionsWrapper}>
            {secondaryActions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.secondaryItem}
                onPress={() => handleActionPress(item.key)}
              >
                <View style={styles.circularIcon}>
                  <Icon name={item.icon} size={26} color={FPO_COLORS.primary} />
                </View>
                <Text style={styles.secondaryItemText} numberOfLines={2}>
                  {t(`fpo_home.${item.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ASSIGN TASK BUTTON */}
          <TouchableOpacity
            style={styles.assignTaskButton}
            onPress={() => navigation.navigate('AssignTask')}
          >
            <Icon
              name="clipboard-outline"
              size={22}
              color={FPO_COLORS.textOnPrimary}
            />
            <Text style={styles.assignTaskText}>{t('fpo_home.assign_task')}</Text>
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
    paddingTop: 8,
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
    paddingTop: 16,
    paddingBottom: 28,
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: FPO_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: FPO_COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: FPO_COLORS.borderLight,
  },
  statIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: FPO_COLORS.tintCard,
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  statValue: {
    color: FPO_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  statLabel: {
    color: FPO_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  /* PRIMARY ACTIONS - Compact Hero Cards */
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FPO_COLORS.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  primaryActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: FPO_COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    height: 130,
    justifyContent: 'space-between',
    borderWidth: 0,
  },
  focusedCard: {
    backgroundColor: FPO_COLORS.primary,
  },
  lightCard: {
    backgroundColor: FPO_COLORS.surface,
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  primaryIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIcon: {
    backgroundColor: FPO_COLORS.textOnPrimary + '20',
  },
  lightIcon: {
    backgroundColor: FPO_COLORS.tintCard,
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  primaryCardText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
    lineHeight: 18,
  },

  /* SECONDARY ACTIONS - Compact Grid */
  secondaryActionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 20,
    justifyContent: 'flex-start',
  },
  secondaryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  circularIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: FPO_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: FPO_COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1.5,
    borderColor: FPO_COLORS.border,
  },
  secondaryItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: FPO_COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 4,
    letterSpacing: 0.1,
    lineHeight: 14,
  },

  /* ASSIGN TASK BUTTON */
  assignTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FPO_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: FPO_COLORS.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  assignTaskText: {
    fontSize: 16,
    fontWeight: '700',
    color: FPO_COLORS.textOnPrimary,
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  /* EXPIRING PRODUCTS - Compact Alert Cards */
  sectionHeaderExt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
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

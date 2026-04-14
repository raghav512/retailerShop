import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import apiService from "../../../Redux/apiService";
import LanguageSwitcher from "../../../common/reusableComponent/LanguageSwitcher";
import { FPO_COLORS } from '../../../colorsList/ColorList';

/* ---------------- DATA (API READY) ---------------- */

const ACTIONS = [
  { id: "1", key: "add_farmer", icon: "person-add", bg: FPO_COLORS.primary },
  { id: "2", key: "order_details", icon: "receipt", bg: "#16A34A" },
  { id: "3", key: "farmer_listing", icon: "list", bg: "#9333EA" },
  { id: "4", key: "Community", icon: "people-outline", bg: "#F97316" },
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

  const handleActionPress = useCallback((key) => {
    switch (key) {
      case "add_farmer":
        navigation.navigate("Screen1", { themeColor: FPO_COLORS.primary });
        break;
      case "order_details":
        navigation.navigate("OrderDetails");
        break;
      case "farmer_listing":
        navigation.navigate("FarmerListing");
        break;
      case "Community":
        navigation.navigate("FpoCommunity");
        break;
    }
  }, [navigation]);

  const fetchExpiringProducts = async () => {
    try {
      const response = await apiService.getExpiringProducts();
      console.log("Expiring products response:", response);

      // Flatten all categories into one array
      const allProducts = [
        ...(response?.data?.expired || []),
        ...(response?.data?.expiringIn30Days || []),
        ...(response?.data?.expiringIn60Days || []),
      ];

      setExpiringProducts(allProducts);
    } catch (error) {
      console.log("Error fetching expiring products:", error);
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
      console.log("❌ Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchExpiringProducts();
    fetchDashboardStats();
  }, []);





  /* ---------------- RENDER ITEMS ---------------- */

  const renderStat = useCallback(({ item }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{t(`fpo_home.${item.key}`)}</Text>
    </View>
  ), [t]);

  /* Primary & Secondary Actions Split */
  const primaryActions = actions.slice(0, 2);
  const secondaryActions = actions.slice(2);

  const renderExpiringProduct = useCallback(({ item }) => {
    const daysLeft = item.daysLeft || 0;
    const isExpired = daysLeft <= 0;
    const isUrgent = daysLeft > 0 && daysLeft <= 7;

    return (
      <TouchableOpacity
        style={styles.expiringCard}
        onPress={() => navigation.navigate("ProductDetails", { product: { _id: item.productId, productName: item.productName, brand: item.brand } })}
      >
        <View style={styles.expiringLeft}>
          <Text style={styles.expiringName}>{item.productName}</Text>
          <Text style={styles.expiringVariant}>
            {item.parameter} {item.unit} - ₹{item.mrp}
          </Text>
        </View>
        <View style={[
          styles.expiringBadge,
          isExpired && styles.expiringExpired,
          isUrgent && styles.expiringUrgent
        ]}>
          <Icon name="time" size={14} color="#fff" />
          <Text style={styles.expiringDays}>
            {isExpired ? t('fpo_home.expired') : `${daysLeft}d`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, t]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
        <View style={styles.greetingBox}>
          <Text style={styles.helloText}>{t("fpo_home.fpo_dashboard")}</Text>
          <Text style={styles.subText}>{t("fpo_home.manage_farmers")}</Text>
        </View>

        <View style={styles.headerRight}>
          <LanguageSwitcher iconColor="#4A4A4A" style={styles.iconBtn} />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("SendBroadcast")}
          >
            <Icon name="notifications" size={24} color="#4A4A4A" />
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
              <View style={[styles.statIconWrapper, { backgroundColor: "#F0F7FA" }]}>
                <Icon name="people" size={24} color={FPO_COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{totalFarmers}</Text>
              <Text style={styles.statLabel}>{t('fpo_home.total_farmers')}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: "#F0F7FA" }]}>
                <Icon name="leaf" size={24} color={FPO_COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{activeFarms}</Text>
              <Text style={styles.statLabel}>{t('fpo_home.active_fields')}</Text>
            </View>
          </View>

          {/* EXPLORE SECTION - MATCHES FARMER HOME */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("fpo_home.quick_actions")}</Text>
          </View>

          <View style={styles.primaryActionsContainer}>
            {primaryActions.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.primaryCard, index === 0 ? styles.focusedCard : styles.lightCard]}
                onPress={() => handleActionPress(item.key)}
              >
                <View style={[styles.primaryIconWrapper, index === 0 ? styles.focusedIcon : styles.lightIcon]}>
                  <Icon name={item.icon} size={28} color={index === 0 ? "#fff" : FPO_COLORS.primary} />
                </View>
                <Text style={[styles.primaryCardText, index === 0 ? { color: "#fff" } : { color: "#333" }]}>
                  {t(`fpo_home.${item.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECONDARY ACTIONS GRID */}
          <View style={styles.secondaryActionsWrapper}>
            {secondaryActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.secondaryItem}
                onPress={() => handleActionPress(item.key)}
              >
                <View style={[styles.circularIcon, { borderColor: FPO_COLORS.primary + "30" }]}>
                  <Icon name={item.icon} size={24} color={FPO_COLORS.primary} />
                </View>
                <Text style={styles.secondaryItemText} numberOfLines={2}>
                  {t(`fpo_home.${item.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* EXPIRING PRODUCTS */}
          <View style={styles.sectionHeaderExt}>
            <Text style={styles.sectionTitle}>{t("fpo_home.expiring_products")}</Text>
            {expiringProducts.length > 1 && (
              <TouchableOpacity onPress={() => setShowAllExpiring(!showAllExpiring)} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>
                  {showAllExpiring ? t("fpo_home.show_less") : t("fpo_home.view_all")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.nestedWrapper}>
            {expiringProducts.length > 0 ? (
              <View>
                {/* Render via flex instead of FlatList since it's inside ScrollView */}
                {(showAllExpiring ? expiringProducts : expiringProducts.slice(0, 2)).map((item, index) => (
                  <View key={item._id || String(index)}>
                    {renderExpiringProduct({ item })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="checkmark-circle" size={32} color="#16A34A" />
                <Text style={styles.emptyText}>{t('fpo_home.no_expiring_products')}</Text>
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
    backgroundColor: "#F4F6F8",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    paddingTop: 16,
  },

  headerSpacer: { height: 6, backgroundColor: "#ffffff" },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
    marginBottom: 4,
  },
  greetingBox: {
    flex: 1,
  },
  helloText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 5,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
    fontWeight: "500",
  },

  /* PRIMARY ACTIONS CONTAINER */
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  primaryActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 15,
  },
  primaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    height: 120,
    justifyContent: "space-between",
  },
  focusedCard: {
    backgroundColor: FPO_COLORS.primary, // FPO Brand Accent
  },
  lightCard: {
    backgroundColor: "#FFFFFF",
  },
  primaryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  focusedIcon: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  lightIcon: {
    backgroundColor: "#EBF3F6", // FPO Brand Tint
  },
  primaryCardText: {
    fontSize: 15,
    fontWeight: "700",
  },

  /* SECONDARY ACTIONS GRID */
  secondaryActionsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginTop: 15,
    justifyContent: "flex-start",
  },
  secondaryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
  },
  circularIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
  },
  secondaryItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 4,
  },

  /* EXPIRING PRODUCTS */
  sectionHeaderExt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  viewAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E5F0F4",
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: FPO_COLORS.primary,
    fontWeight: "700",
  },
  nestedWrapper: {
    paddingHorizontal: 16,
  },
  expiringCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  expiringLeft: {
    flex: 1,
    paddingRight: 10,
  },
  expiringName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  expiringVariant: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  expiringBadge: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  expiringUrgent: {
    backgroundColor: "#EF4444",
  },
  expiringExpired: {
    backgroundColor: "#6B7280",
  },
  expiringDays: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 10,
    fontWeight: "500",
  },
});

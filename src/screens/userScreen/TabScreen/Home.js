import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import apiService from "../../../Redux/apiService";
import LanguageSwitcher from "../../../common/reusableComponent/LanguageSwitcher";
import { STAFF_COLORS } from '../../../colorsList/ColorList';


/* ---------------- DUMMY DATA (API READY) ---------------- */

/* ---------------- DUMMY DATA (API READY) ---------------- */

const STATS = [
  { id: "1", key: "today_procurements", value: "24", icon: "document-text" },
  { id: "2", key: "pending_quality", value: "8", icon: "time" },
  { id: "3", key: "pending_payments", value: "12", icon: "cash" },
];

const QUICK_ACTIONS = [
  { id: "1", key: "home.view_listing", route: "Listing", icon: "list" },
  { id: "2", key: "home.create_listing", route: "StaffCreateListing", icon: "add" },
  { id: "3", key: "home.farmers", route: "Farmers", icon: "people" },
  { id: "4", key: "home.community", route: "StaffCommunity", icon: "megaphone" },
];

const Home = () => {
  const navigation = useNavigation()
    const { t } = useTranslation(); // 🌍
  const [stats, setStats] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ✅ Load unread count when screen focuses */
  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        const count = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(count ? parseInt(count, 10) : 0);
      };
      loadCount();
    }, [])
  );

  useEffect(() => {
    // 1. Listen for background-to-foreground app state changes
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        const stored = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(stored ? parseInt(stored, 10) : 0);
      }
    });

    // 2. Notifee foreground event
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type }) => {
      if (type === EventType.DELIVERED) {
        const stored = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(stored ? parseInt(stored, 10) : 0);
      }
    });

    // 3. FCM foreground message event
    const unsubscribeFCM = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage?.data?.type === 'ADMIN_BROADCAST') {
        setUnreadCount((prev) => prev + 1);
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


const mapPurchaseForUI = (item) => {
  const cropNames = item.crops && item.crops.length > 0
    ? item.crops.map(c => c.cropName).join(', ')
    : 'N/A';

  const totalQty = item.crops && item.crops.length > 0
    ? item.crops.reduce((acc, c) => acc + (c.quantity || 0), 0)
    : 0;

  let farmerName = "Farmer";
  if (item.farmer && typeof item.farmer === 'object') {
    farmerName = `${item.farmer.firstName || ""} ${item.farmer.lastName || ""}`.trim();
  } else if (item.farmerName) {
    farmerName = item.farmerName;
  }

  return {
    id: item._id,
    farmer: farmerName || "Unknown",
    code: item._id ? item._id.slice(-6).toUpperCase() : '',
    crop: cropNames,
    quantity: `${totalQty} quintal`,
    amount: `₹${item.totalAmount || 0}`,
    date: item.procurementDate ? new Date(item.procurementDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) : 'N/A',
    status: item.status || "completed", 
  };
};


useEffect(() => {
  const fetchHomeData = async () => {
    try {
      const response = await apiService.GetStaffPurches();
      console.log("HOME PURCHASE DATA 👉", response);

      const mapped = response.map(mapPurchaseForUI);

      // same card UI, just backend data
      setProcurements(mapped.slice(0, 3));

      // same stats UI
      setStats([
        {
          id: "1",
          key: "today_procurements",
          value: response.length.toString(),
          icon: "document-text",
        },
        {
          id: "2",
          key: "pending_quality",
          value: "0",
          icon: "time",
        },
        {
          id: "3",
          key: "pending_payments",
          value: "0",
          icon: "cash",
        },
      ]);
    } catch (error) {
      console.log("HOME API ERROR 👉", error);
    }
  };

  fetchHomeData();
}, []);


  /* ---------------- RENDERERS ---------------- */

  const primaryActions = QUICK_ACTIONS.slice(0, 2);
  const secondaryActions = QUICK_ACTIONS.slice(2);

  const renderProcurement = ({ item }) => (
    <View style={styles.procCard}>
      <View style={styles.procHeader}>
        <Text style={styles.procName}>
          {item.farmer} <Text style={styles.procCode}>— {item.code}</Text>
        </Text>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}> {t(`status.${item.status.toLowerCase()}`)}</Text>
        </View>
      </View>
      <Text style={styles.procCrop}>
        {item.crop} • {item.quantity}
      </Text>
      <View style={styles.procFooter}>
        <View>
          <Text style={styles.procLabel}>{t("Common.amount")}</Text>
          <Text style={styles.procAmount}>{item.amount}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.procLabel}>{t("Common.date")}</Text>
          <Text style={styles.procDate}>{item.date}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* MODERN GLASS TOP-BAR JUST LIKE FARMER HOME */}
      <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
        <View style={styles.greetingBox}>
          <Text style={styles.helloText}>{t("home.title")}</Text>
          <Text style={styles.subText}>{t("home.subtitle")}</Text>
        </View>

        <View style={styles.headerRight}>
          <LanguageSwitcher iconColor="#4A4A4A" style={styles.iconBtn} />
          
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={async () => {
              await AsyncStorage.setItem("unreadCount", "0");
              setUnreadCount(0); 
              navigation.navigate("Broadcasts");
            }}
          >
            <Icon name="notifications" size={24} color="#4A4A4A" />

            {unreadCount > 0 && (
              <View style={styles.badgeIndicator}>
                <Text style={styles.badgeNum}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.statsRow}>
            {stats.map((item) => (
              <View key={item.id} style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <Icon name={item.icon} size={22} color={STAFF_COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>
                  {t(`stats.${item.key}`)}
                </Text>
              </View>
            ))}
          </View>

          {/* EXPLORE SECTION - REPLACES BUTTON ROWS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("quick_actions", "Quick Actions")}</Text>
          </View>

          <View style={styles.primaryActionsContainer}>
            {primaryActions.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.primaryCard, index === 0 ? styles.focusedCard : styles.lightCard]}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.primaryIconWrapper, index === 0 ? styles.focusedIcon : styles.lightIcon]}>
                  <Icon name={item.icon} size={28} color={index === 0 ? "#fff" : STAFF_COLORS.primary} />
                </View>
                <Text style={[styles.primaryCardText, index === 0 ? {color: "#fff"} : {color: "#1F2937"}]}>
                  {t(item.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.secondaryActionsWrapper}>
            {secondaryActions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.secondaryItem} 
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.circularIcon, {borderColor: STAFF_COLORS.primary + "30"}]}>
                  <Icon name={item.icon} size={24} color={STAFF_COLORS.primary} />
                </View>
                <Text style={styles.secondaryItemText} numberOfLines={2}>
                  {t(item.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RECENT */}
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>{t("home.recent_procurements")}</Text>
          </View>

          <View style={styles.nestedWrapper}>
            <FlatList
              data={procurements}
              keyExtractor={(item) => item.id}
              renderItem={renderProcurement}
              scrollEnabled={false}
            />
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

  /* TOP BAR - SLEEK LIGHT DESIGN */
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
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
  badgeIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  badgeNum: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 5,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FAF7E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 4,
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
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    height: 130,
    justifyContent: "space-between",
  },
  focusedCard: {
    backgroundColor: STAFF_COLORS.primary, // Staff Brand Accent
  },
  lightCard: {
    backgroundColor: "#FFFFFF",
  },
  primaryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  focusedIcon: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  lightIcon: {
    backgroundColor: "#FAF7E8", // Staff Brand Tint
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

  nestedWrapper: {
    paddingHorizontal: 16,
  },
  
  /* RECENT PROCUREMENTS CARD */
  procCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  procHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  procName: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111827",
  },
  procCode: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  completedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  procCrop: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
    marginBottom: 14,
  },
  procFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  procLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  procAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: STAFF_COLORS.primary,
    marginTop: 2,
  },
  procDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 2,
  },
});

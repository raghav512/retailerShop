import { useNavigation } from "@react-navigation/native";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import LatestNotifications from "../../../components/LatestNotifications";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback, useEffect } from "react";
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import LanguageSwitcher from "../../../common/reusableComponent/LanguageSwitcher";
import FloatingAIAssistant from "../../../animations/FloatingAIAssistant";
import AdvertisementSlider from "../../../components/AdvertisementSlider";
import { FARMER_COLORS } from '../../../colorsList/ColorList';



/* 🔹 Waving Hand Component */
const WavingHand = () => {
  const waveAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();
  }, []);

  const spin = waveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '25deg']
  });

  return (
    <Animated.Text style={{ fontSize: 24, transform: [{ rotate: spin }] }}>
      👋
    </Animated.Text>
  );
};

/* 🔹 MOCK DATA (Replace with API later) */
const QUICK_ACTIONS = [
  { id: "1", key: "create_listing.title", icon: "pricetags" },
  { id: "2", key: "farmer_tabs.marketplace", icon: "cart" },
  { id: "3", key: "my_orders.title", icon: "receipt" },
  { id: "4", key: "documents", icon: "folder-open" },
  { id: "5", key: "my_farm", icon: "location" },
  { id: "6", key: "my_crop", icon: "leaf" },
  { id: "7", key: "crop_doctor", icon: "medkit" },
  { id: "8", key: "mandi_prices", icon: "bar-chart" },
  { id: "9", key: "community", icon: "people" },
];


const FarmerHome = () => {
  const navigation = useNavigation()
  const { t } = useTranslation(); // 🌍
  const [unreadCount, setUnreadCount] = useState(0);

  /* ✅ Load unread count when screen focuses */
  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        const count = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(count ? parseInt(count) : 0);
      };
      loadCount();
    }, [])
  );

  useEffect(() => {
    // 1. Listen for background-to-foreground app state changes
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        const stored = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(stored ? parseInt(stored) : 0);
      }
    });

    // 2. Notifee foreground event
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type }) => {
      if (type === EventType.DELIVERED) {
        const stored = await AsyncStorage.getItem("unreadCount");
        setUnreadCount(stored ? parseInt(stored) : 0);
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



  const handleActionPress = (key) => {
    if (key === "documents") navigation.navigate("ScreenSeventh");
    if (key === "create_listing.title") navigation.navigate("CreateListing");
    if (key === "my_farm") navigation.navigate("MyFarms");
    if (key === "my_crop") navigation.navigate("MyCrops");
    if (key === "my_orders.title") navigation.navigate("MyOrders");
    if (key === "farmer_tabs.marketplace") navigation.navigate("FarmerMarketTab");
    if (key === "crop_doctor") navigation.navigate("CropDoctor");
    if (key === "chatbot_label") navigation.navigate("ChatBot");
    if (key === "community") navigation.navigate("Community");
    if (key === "mandi_prices") navigation.navigate("MandiPricesScreen");
  };

  const primaryActions = QUICK_ACTIONS.slice(0, 2);
  const secondaryActions = QUICK_ACTIONS.slice(2);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* NEW MODERN HEADER */}
        <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
          <View style={styles.greetingBox}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.helloText}>{t("hello_farmer")} </Text>
              <WavingHand />
            </View>
            <Text style={styles.subText}>{t("welcome_back")}</Text>
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
              <Icon name="notifications-outline" size={24} color="#4A4A4A" />
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

        <View style={styles.adWrapper}>
          <AdvertisementSlider />
        </View>

        {/* EXPLORE SECTION - REPLACES QUICK ACTIONS GRID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("quick_actions")}</Text>
        </View>

        <View style={styles.primaryActionsContainer}>
          {primaryActions.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.primaryCard, index === 0 ? styles.focusedCard : styles.lightCard]}
              onPress={() => handleActionPress(item.key)}
            >
              <View style={[styles.primaryIconWrapper, index === 0 ? styles.focusedIcon : styles.lightIcon]}>
                <Icon name={item.icon} size={36} color={index === 0 ? "#222" : FARMER_COLORS.primaryLight} />
              </View>
              <Text style={[styles.primaryCardText, index === 0 ? {color: "#222"} : {color: "#333"}]}>
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
              onPress={() => handleActionPress(item.key)}
            >
              <View style={styles.circularIcon}>
                <Icon name={item.icon} size={36} color="#555" />
              </View>
              <Text style={styles.secondaryItemText} numberOfLines={2}>
                {t(item.key)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("latest_notifications", "Latest Notifications")}</Text>
        </View>
        
        <View style={styles.notificationsWrapper}>
          <LatestNotifications />
        </View>

      </ScrollView>
      
      <FloatingAIAssistant onPress={() => navigation.navigate("ChatBot")} />
    </View>
  );
};

export default FarmerHome;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6, backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8", // Modern light background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
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
    top: -2,
    right: -2,
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
  adWrapper: {
    marginTop: 15,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
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
    paddingHorizontal: 20,
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
    backgroundColor: FARMER_COLORS.primaryLight, // Farmer App Brand Accent
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
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  lightIcon: {
    backgroundColor: "#FEF9E7",
  },
  primaryCardText: {
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryActionsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginTop: 18,
  },
  secondaryItem: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 24,
  },
  circularIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    borderColor: "#F3F4F6",
  },
  secondaryItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  notificationsWrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    paddingBottom: 10,
  }
});

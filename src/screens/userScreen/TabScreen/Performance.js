import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

import apiService from "../../../Redux/apiService";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const FILTERS = ["all", "completed", "pending", "quality"];
const THEME = STAFF_COLORS.primary;

const Performance = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [purchases, setPurchases] = useState([]);

  const mapPurchaseFromBackend = (item) => {
    const cropNames =
      item.crops && item.crops.length > 0
        ? item.crops.map((c) => c.cropName).join(", ")
        : "N/A";

    const totalQty =
      item.crops && item.crops.length > 0
        ? item.crops.reduce((acc, c) => acc + (c.quantity || 0), 0)
        : 0;

    let farmerName = "Farmer";
    if (item.farmer && typeof item.farmer === "object") {
      farmerName = `${item.farmer.firstName || ""} ${item.farmer.lastName || ""}`.trim();
    } else if (item.farmerName) {
      farmerName = item.farmerName;
    }

    return {
      id: item._id,
      farmer: farmerName || "Unknown",
      code: item._id ? item._id.slice(-6).toUpperCase() : "",
      crop: cropNames,
      quantity: `${totalQty} quintal`,
      fullCrops: item.crops || [],
      amount: `₹${item.totalAmount || 0}`,
      date: item.procurementDate
        ? new Date(item.procurementDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      status: "completed",
    };
  };

  const PurchesData = async () => {
    try {
      const response = await apiService.GetStaffPurches();
      const mapped = response.map(mapPurchaseFromBackend);
      setPurchases(mapped);
    } catch (error) {
      console.log("API ERROR 👉", error);
    }
  };

  useFocusEffect(useCallback(() => { PurchesData(); }, []));

  const filteredData = purchases;

  const renderItem = ({ item }) => {
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

    const badgeStyle =
      item.status === "completed"
        ? styles.badgeCompleted
        : item.status === "pending"
        ? styles.badgePending
        : styles.badgeQuality;

    const badgeTextStyle =
      item.status === "completed"
        ? styles.badgeTextCompleted
        : item.status === "pending"
        ? styles.badgeTextPending
        : styles.badgeTextQuality;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PurchaseDetails", { purchaseId: item.id })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* CARD HEADER */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.farmerName} numberOfLines={1}>{item.farmer}</Text>
              <Text style={styles.farmerCode}>#{item.code}</Text>
            </View>
            <View style={[styles.statusBadge, badgeStyle]}>
              <Text style={[styles.statusText, badgeTextStyle]}>
                {t(`status.${item.status}`)}
              </Text>
            </View>
          </View>

          {/* CROPS */}
          <View style={styles.cropsContainer}>
            {item.fullCrops && item.fullCrops.length > 0 ? (
              item.fullCrops.map((c, idx) => (
                <View key={idx} style={styles.cropRow}>
                  <View style={styles.cropLeft}>
                    <View style={styles.cropDot} />
                    <Text style={styles.cropName} numberOfLines={1}>
                      {c.cropName}
                      {c.variety ? ` · ${c.variety}` : ""}
                    </Text>
                  </View>
                  <View style={styles.cropRight}>
                    <Text style={styles.cropQty}>{c.quantity} qtl</Text>
                    <Text style={styles.cropRate}>₹{c.rate}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.cropLine}>{item.crop} • {item.quantity}</Text>
            )}
          </View>

          {/* FOOTER */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>{t("common.amount")}</Text>
              <Text style={styles.footerAmount}>{item.amount}</Text>
            </View>
            <View style={styles.dividerV} />
            <View style={[styles.footerItem, { alignItems: "flex-end" }]}>
              <Text style={styles.footerLabel}>{t("common.date")}</Text>
              <Text style={styles.footerDate}>{item.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={STAFF_COLORS.primary} translucent={false} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("purchase.title")}</Text>
            <Text style={styles.headerSubtitle}>{purchases.length} entries</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ADD PURCHASE BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AddPurchaseEntry")}
        >
          <View style={styles.addBtnIcon}>
            <Icon name="add" size={22} color={THEME} />
          </View>
          <Text style={styles.addText}>{t("purchase.add")}</Text>
          <Icon name="chevron-forward" size={18} color={THEME} />
        </TouchableOpacity>

        {/* LIST */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>No entries found</Text>
              <Text style={styles.emptySubText}>Add a purchase to get started</Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Performance;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    marginTop: 3,
    letterSpacing: 0.2,
  },


  scrollContainer: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },

  /* ADD BUTTON */
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    gap: 14,
  },
  addBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: THEME,
    letterSpacing: 0.2,
  },


  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  cardHeaderLeft: { flex: 1 },
  farmerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.2,
  },
  farmerCode: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  /* STATUS BADGE */
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeCompleted: { backgroundColor: "#D1FAE5" },
  badgeTextCompleted: { color: "#059669" },
  badgePending: { backgroundColor: "#DBEAFE" },
  badgeTextPending: { color: "#2563EB" },
  badgeQuality: { backgroundColor: "#e2f0c9" },
  badgeTextQuality: { color: "#D97706" },

  /* CROPS */
  cropsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
    borderWidth: 0.5,
    borderColor: "#F3F4F6",
  },
  cropRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  cropDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME,
  },
  cropName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  cropRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cropQty: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  cropRate: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  cropLine: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },

  /* FOOTER */
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerItem: { flex: 1 },
  dividerV: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 14,
  },
  footerLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME,
    letterSpacing: 0.2,
  },
  footerDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.2,
  },

  /* EMPTY */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    letterSpacing: 0.2,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "400",
  },
});

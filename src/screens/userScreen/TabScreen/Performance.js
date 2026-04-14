import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
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

  const filteredData =
    selectedFilter === "all"
      ? purchases
      : purchases.filter((item) => item.status === selectedFilter);

  const renderItem = ({ item }) => {
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
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("PurchaseDetails", { purchaseId: item.id })}
        activeOpacity={0.8}
      >
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.farmerName}>{item.farmer}</Text>
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
                  <Text style={styles.cropName}>
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
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("purchase.title")}</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} entries</Text>

        {/* FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {t(`filters.${filter}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

        {/* SUMMARY PILLS */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Icon name="document-text-outline" size={18} color={THEME} />
            <Text style={styles.summaryNum}>{purchases.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryPill}>
            <Icon name="checkmark-circle-outline" size={18} color="#10B981" />
            <Text style={styles.summaryNum}>
              {purchases.filter((p) => p.status === "completed").length}
            </Text>
            <Text style={styles.summaryLabel}>Done</Text>
          </View>
          <View style={styles.summaryPill}>
            <Icon name="time-outline" size={18} color="#F59E0B" />
            <Text style={styles.summaryNum}>
              {purchases.filter((p) => p.status === "pending").length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>

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
    </View>
  );
};

export default Performance;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 16,
  },

  /* FILTER TABS */
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 2,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  activeFilter: {
    backgroundColor: THEME,
    borderColor: THEME,
  },
  filterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  /* SCROLL */
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* ADD BUTTON */
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.5,
    borderColor: "#FAF7E8",
    gap: 12,
  },
  addBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FAF7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: THEME,
  },

  /* SUMMARY PILLS */
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    gap: 4,
  },
  summaryNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },

  /* PURCHASE CARD */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardHeaderLeft: { flex: 1 },
  farmerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  farmerCode: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },

  /* STATUS BADGE */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 8,
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
    gap: 8,
  },
  cropDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME,
  },
  cropName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  cropRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cropQty: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10B981",
  },
  cropRate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  cropLine: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },

  /* FOOTER */
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerItem: { flex: 1 },
  dividerV: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 2,
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME,
  },
  footerDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  /* EMPTY */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});

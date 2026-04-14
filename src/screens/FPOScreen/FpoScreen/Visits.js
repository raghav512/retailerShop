import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary;

const Visits = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchFarmers = async () => {
    try {
      const response = await apiService.getAllFarmers();
      const mappedFarmers = await Promise.all(
        response.map(async (item) => {
          let farmCount = 0;
          try {
            const farmsResponse = await apiService.getFarmsByUserId(item._id);
            farmCount = farmsResponse?.data?.length || 0;
          } catch (_) {}
          return {
            id: item._id,
            name: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
            phone: item.phone,
            fields: farmCount,
            status: "verified",
          };
        })
      );
      setFarmers(mappedFarmers);
    } catch (error) {
      console.log("Farmer API error 👉", error);
    }
  };

  useFocusEffect(useCallback(() => { fetchFarmers(); }, []));

  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" ? true : f.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [farmers, search, filter]);

  const renderFarmer = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("FarmerDetails", { id: item.id })}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>
          {item.name?.[0]?.toUpperCase() || "F"}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.statusBadge, item.status === "verified" ? styles.verified : styles.pending]}>
            <Icon name={item.status === "verified" ? "checkmark-circle" : "time"} size={11}
              color={item.status === "verified" ? "#059669" : "#DC2626"} />
            <Text style={[styles.statusText, item.status === "verified" ? styles.verifiedText : styles.pendingText]}>
              {" "}{t(`status.${item.status}`)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call-outline" size={13} color="#9CA3AF" />
          <Text style={styles.info}> {item.phone}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.fieldsPill}>
            <Icon name="leaf-outline" size={12} color={THEME} />
            <Text style={styles.fieldsText}>{item.fields} {t("fields")}</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("farmer_management")}</Text>
          <Text style={styles.headerSub}>{filteredFarmers.length} {t("farmer_management_sub")}</Text>
        </View>
        <TouchableOpacity
          style={styles.addFarmerBtn}
          onPress={() => navigation.navigate("Screen1", { themeColor: THEME })}
          activeOpacity={0.8}
        >
          <Icon name="person-add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH + FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={t("search_farmers")}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Icon name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {["all", "verified", "pending"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[styles.filterChip, filter === type && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                {t(`filter.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FlatList
          data={filteredFarmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>No farmers found</Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

export default Visits;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, zIndex: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1F2937" },
  headerSub: { fontSize: 13, color: "#6B7280", fontWeight: "500", marginTop: 2 },
  addFarmerBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: THEME, justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: THEME, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },

  /* SEARCH & FILTERS */
  searchSection: {
    backgroundColor: "#ffffff", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    gap: 12,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F3F4F6", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    borderWidth: 1.5, borderColor: "#E5E7EB",
  },
  searchInput: { flex: 1, color: "#1F2937", fontSize: 15 },
  filterRow: { flexDirection: "row", gap: 10 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#F3F4F6",
    borderWidth: 1.5, borderColor: "#E5E7EB",
  },
  filterChipActive: { backgroundColor: THEME, borderColor: THEME },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#ffffff", fontWeight: "700" },

  /* LIST */
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* FARMER CARD */
  card: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 14,
    flexDirection: "row", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  cardAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#EBF3F6",
    justifyContent: "center", alignItems: "center",
    marginRight: 14,
  },
  cardAvatarText: { fontSize: 20, fontWeight: "800", color: THEME },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  verified: { backgroundColor: "#D1FAE5" },
  pending: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 11, fontWeight: "600" },
  verifiedText: { color: "#059669" },
  pendingText: { color: "#DC2626" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  info: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldsPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EBF3F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  fieldsText: { fontSize: 12, color: THEME, fontWeight: "600" },

  /* EMPTY */
  emptyContainer: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
});

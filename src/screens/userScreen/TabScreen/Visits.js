import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiService from "../../../Redux/apiService";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

/* ---------------- DUMMY DATA (API READY) ---------------- */


/* ---------------- SCREEN ---------------- */

const Visits = () => {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const navigation = useNavigation();

 

const fetchFarmers = async () => {
  try {
    const response = await apiService.getAllFarmers();
    console.log("BACKEND FARMERS 👉", response);

    const mappedFarmers = response.map((item) => ({
      id: item._id,
      name: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
      phone: item.phone,
      fields: item.fields || 0,
      verified: true,
    }));

    setFarmers(mappedFarmers);
  } catch (error) {
    console.log("Farmer API error 👉", error);
  }
};

useFocusEffect(
  useCallback(() => {
    fetchFarmers();
  }, [])
);



  /* ---------------- FILTER (API READY) ---------------- */

  const filteredFarmers = farmers.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- RENDER ITEM ---------------- */

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>

        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle-outline" size={12} color="#16A34A" />
            <Text style={styles.verifiedText}> {t("farmers.verified")}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Icon name="call-outline" size={14} color="#374151" />
        <Text style={styles.subText}> {item.phone}</Text>
      </View>
      <Text style={styles.fields}> {item.fields} {t("farmers.fields")}</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t("farmers.title")}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('Screen1', { themeColor: STAFF_COLORS.primary })}
            activeOpacity={0.8}
          >
            <Icon name="person-add-outline" size={18} color="#ffffff" />
            <Text style={styles.addBtnText}>{t("farmers.add_farmer")}</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t("farmers.search")}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* LIST */}
      <View style={styles.container}>
        <FlatList
          data={filteredFarmers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

export default Visits;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "800",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: STAFF_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    color: "#1F2937",
    marginLeft: 12,
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9E7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    color: STAFF_COLORS.primary,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    marginLeft: 4,
    fontWeight: "500",
  },
  fields: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    fontWeight: "500",
  },
});

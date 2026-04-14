import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';
import { STAFF_COLORS } from '../../../colorsList/ColorList';

/* ---------------- MAPPER ---------------- */


/* ---------------- SCREEN ---------------- */

const Listing = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const navigation = useNavigation()

  useEffect(() => {
    fetchListing();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchListing();
    }, [])
  );

  const fetchListing = async () => {
    try {
      const response = await apiService.getCropListings();
      const listings = response.data || response;
      setList(listings);
    } catch (error) {
      console.log("LISTING API ERROR 👉", error);
    }
  };

  const renderItem = ({ item }) => {
    const farmer = `${item.userId?.firstName || ""} ${item.userId?.lastName || ""}`.trim() || "Unknown";
    const code = item._id?.slice(-5).toUpperCase();
    const crop = item.cropName;
    const quantity = `${item.quantity} kg`;
    const amount = `₹${item.price}`;
    const date = new Date(item.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const status = item.status || "pending";

    const getBadgeStyle = (status) => {
      switch(status) {
        case 'approved':
          return { backgroundColor: '#DCFCE7', color: '#16A34A' };
        case 'rejected':
          return { backgroundColor: '#FEE2E2', color: '#EF4444' };
        default:
          return { backgroundColor: '#e2f0c9', color: '#F59E0B' };
      }
    };

    const badgeStyle = getBadgeStyle(status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ListingDetails', { listing: item })}
      >
        {/* TOP */}
        <View style={styles.rowBetween}>
          <Text style={styles.name}>
            {farmer}
            <Text style={styles.code}> — {code}</Text>
          </Text>

          <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
              {status}
            </Text>
          </View>
        </View>

        {/* MIDDLE */}
        <Text style={styles.crop}>
          {crop} • {quantity}
        </Text>

        {/* BOTTOM */}
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>{t("Common.amount")}</Text>
            <Text style={styles.amount}>{amount}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>{t("Common.date")}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6A00" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing</Text>
        <View style={styles.backBtn} />
      </View>

      {/* LIST */}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Listing;
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },

  /* HEADER */
  header: {
    backgroundColor: "#FF6A00",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  /* LIST */
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  code: {
    fontSize: 11,
    color: "#6B7280",
  },

  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "600",
  },

  crop: {
    fontSize: 12,
    color: "#374151",
    marginVertical: 8,
  },

  label: {
    fontSize: 11,
    color: "#6B7280",
  },

  amount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
    marginTop: 2,
  },

  date: {
    fontSize: 12,
    marginTop: 2,
    color: "#111827",
  },
});

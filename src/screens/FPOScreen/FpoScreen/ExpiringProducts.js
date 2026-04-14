import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const ExpiringProducts = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { products } = route.params;

  const renderItem = ({ item }) => {
    const daysLeft = item.daysLeft || 0;
    const isExpired = daysLeft <= 0;
    const isUrgent = daysLeft > 0 && daysLeft <= 7;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetails", { 
          product: { _id: item.productId, productName: item.productName, brand: item.brand } 
        })}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.brand}>Brand: {item.brand}</Text>
          <Text style={styles.variant}>
            {item.parameter} {item.unit} - ₹{item.mrp}
          </Text>
        </View>
        <View style={[
          styles.badge, 
          isExpired && styles.badgeExpired,
          isUrgent && styles.badgeUrgent
        ]}>
          <Icon name="time-outline" size={16} color="#fff" />
          <Text style={styles.badgeText}>
            {isExpired ? "Expired" : `${daysLeft}d`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={FPO_COLORS.primary} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expiring Products</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default ExpiringProducts;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  header: {
    backgroundColor: FPO_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  brand: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  variant: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  badgeUrgent: {
    backgroundColor: "#EF4444",
  },
  badgeExpired: {
    backgroundColor: "#6B7280",
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

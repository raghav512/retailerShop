import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary;

const Performance = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);

  const ProductData = async () => {
    try {
      const response = await apiService.GetFPOProduct();
      setProducts(response || []);
    } catch (error) {
      console.log("API ERROR 👉", error);
    }
  };

  const handleToggleStatus = useCallback(async (productId) => {
    try {
      await apiService.toggleProductStatus(productId);
      ProductData();
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: "Failed to update product status" });
    }
  }, []);

  const handleEdit = useCallback((product) => {
    navigation.navigate("UpdateProduct", { product });
  }, [navigation]);

  useFocusEffect(useCallback(() => { ProductData(); }, []));

  const renderItem = useCallback(({ item }) => {
    const imageUri =
      typeof item?.productImage === "object" && item?.productImage?.url
        ? item.productImage.url
        : typeof item?.productImage === "string"
        ? item.productImage
        : item?.productImages?.[0]?.url || null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <Icon name="cube-outline" size={22} color={THEME} />
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{item?.productName}</Text>
          <Text style={styles.brand}>{item?.brand}</Text>
          <Text style={styles.mrp}>
            {item?.products?.length > 0
              ? `₹${item.products[0].mrp}–₹${item.products[item.products.length - 1].mrp}`
              : `₹${item?.mrp || "—"}`}
          </Text>
          {item?.products?.length > 0 && (
            <Text style={styles.variants}>{item.products.length} Variants</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={(e) => { e.stopPropagation(); handleEdit(item); }}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={15} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, item.isActive ? styles.activeBtn : styles.inactiveBtn]}
            onPress={(e) => { e.stopPropagation(); handleToggleStatus(item._id, item.isActive); }}
            activeOpacity={0.7}
          >
            <Text style={styles.statusText}>{item.isActive ? "Active" : "Inactive"}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [t, handleEdit, handleToggleStatus, navigation]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("inventory.title")}</Text>
        <Text style={styles.headerSub}>{products.length} products</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <View style={styles.addBtnIcon}>
            <Icon name="add" size={22} color={THEME} />
          </View>
          <Text style={styles.addText}>{t("inventory.add_product")}</Text>
          <Icon name="chevron-forward" size={18} color={THEME} />
        </TouchableOpacity>

        {/* PRODUCT LIST */}
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="cube-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>No products yet</Text>
              <Text style={styles.emptySubText}>Add your first product</Text>
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
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, zIndex: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#1F2937" },
  headerSub: { fontSize: 14, color: "#6B7280", fontWeight: "500", marginTop: 2 },

  /* SCROLL */
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* ADD BUTTON */
  addBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#ffffff", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.5, borderColor: "#EBF3F6", gap: 12,
  },
  addBtnIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#EBF3F6",
    alignItems: "center", justifyContent: "center",
  },
  addText: { flex: 1, fontSize: 16, fontWeight: "700", color: THEME },

  /* PRODUCT CARD */
  card: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 14,
    flexDirection: "row", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.07,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#EBF3F6",
    justifyContent: "center", alignItems: "center",
    marginRight: 12, overflow: "hidden",
  },
  productImage: { width: 52, height: 52, resizeMode: "cover" },
  details: { flex: 1 },
  name: { fontWeight: "700", fontSize: 15, color: "#1F2937", marginBottom: 2 },
  brand: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  mrp: { fontSize: 13, color: THEME, fontWeight: "700", marginTop: 3 },
  variants: { fontSize: 11, color: "#9CA3AF", marginTop: 2, fontWeight: "500" },

  /* ACTIONS */
  actions: { flexDirection: "column", gap: 6 },
  editBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 10, alignItems: "center",
  },
  statusBtn: {
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 10, alignItems: "center",
  },
  activeBtn: { backgroundColor: THEME },
  inactiveBtn: { backgroundColor: "#9CA3AF" },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  /* EMPTY */
  emptyContainer: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#374151", marginTop: 8 },
  emptySubText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },
});

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
  Image,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const THEME = STAFF_COLORS.primary;

const StaffInventory = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);

  const ProductData = async () => {
    try {
      const response = await apiService.GetFPOProduct();
      console.log("STAFF INVENTORY PRODUCTS 👉", response);
      setProducts(response || []);
    } catch (error) {
      console.log("API ERROR 👉", error);
    }
  };

  const handleToggleStatus = useCallback(async (productId, currentStatus) => {
    try {
      await apiService.toggleProductStatus(productId);
      ProductData();
    } catch (error) {
      console.log("Toggle status error:", error);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to update product status' });
    }
  }, []);

  const handleEdit = useCallback((product) => {
    navigation.navigate("StaffUpdateProduct", { product });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      ProductData();
    }, [])
  );

  const renderItem = useCallback(({ item }) => {
    const imageUri = typeof item?.productImage === 'object' && item?.productImage?.url
      ? item.productImage.url
      : typeof item?.productImage === 'string'
      ? item.productImage
      : item?.productImages?.[0]?.url || null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("StaffProductDetails", { product: item })}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
              onError={() => console.log('Image load error')}
            />
          ) : (
            <Text style={styles.icon}>📦</Text>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{item?.productName}</Text>
          <Text style={styles.brand}>
            {t("inventory.brand")}: {item?.brand}
          </Text>
          <Text style={styles.mrp}>
            {item?.products?.length > 0
              ? `₹${item.products[0].mrp} - ₹${item.products[item.products.length - 1].mrp}`
              : `${t("inventory.mrp")} ${item?.mrp}`
            }
          </Text>
          {item?.products?.length > 0 && (
            <Text style={styles.variants}>
              {item.products.length} Variants Available
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, item.isActive ? styles.activeBtn : styles.inactiveBtn]}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleStatus(item._id, item.isActive);
            }}
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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD PRODUCT */}
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("StaffAddProduct")}
          >
            <Text style={styles.addText}>＋ {t("inventory.add_product")}</Text>
          </TouchableOpacity>

          {/* INVENTORY LIST */}
          <FlatList
            data={products}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No products yet</Text>
                <Text style={styles.emptySubText}>Add your first product using the button above</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default StaffInventory;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  scrollContent: {
    paddingBottom: 40,
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
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "800",
  },
  container: {
    backgroundColor: "#F4F6F8",
    padding: 16,
  },
  addBtn: {
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  icon: {
    fontSize: 20,
  },
  productImage: {
    width: 48,
    height: 48,
    resizeMode: "cover",
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 2,
  },
  brand: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  mrp: {
    fontSize: 13,
    color: STAFF_COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  variants: {
    fontSize: 12,
    color: THEME,
    marginTop: 4,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeBtn: {
    backgroundColor: STAFF_COLORS.primary,
  },
  inactiveBtn: {
    backgroundColor: "#9CA3AF",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

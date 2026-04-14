import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import apiService from "../../../Redux/apiService";
import Icon from "react-native-vector-icons/MaterialIcons";
import Images from "../../../assets/Images/Images";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FARMER_COLORS } from '../../../colorsList/ColorList';



const MarketPlace = () => {
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([{ key: "All", labelKey: "all", icon: "apps" }]);
  const navigation = useNavigation();
  const { t } = useTranslation();

  // All 8 categories from FPO Add Product
  const ALL_CATEGORIES = [
    { key: 'fertilizers', labelKey: 'fertilizers', icon: 'grass' },
    { key: 'seeds', labelKey: 'seeds', icon: 'eco' },
    { key: 'insecticides', labelKey: 'insecticides', icon: 'pest-control' },
    { key: 'organic', labelKey: 'organic', icon: 'nature' },
    { key: 'pgr', labelKey: 'pgr', icon: 'local-florist' },
    { key: 'animal_feed', labelKey: 'animal_feed', icon: 'pets' },
    { key: 'fungicides', labelKey: 'fungicides', icon: 'bug-report' },
    { key: 'herbicides', labelKey: 'herbicides', icon: 'yard' },
  ];

  const fetchCartCount = useCallback(async () => {
    try {
      const response = await apiService.getCart();
      const items = response?.data?.items || [];
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.log('Cart count error:', error.message);
    }
  }, []);

  const fetchMarketplaceItems = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch marketplace items and all products in parallel
      const [itemsResponse, allProducts] = await Promise.all([
        apiService.GetMarketplaceItems(),
        apiService.GetFPOProduct()
      ]);
      
      const items = itemsResponse?.data || [];
      
      // Enrich items with productCategory by matching with products
      const enrichedItems = items.map(item => {
        // Try to find matching product by image
        const itemImage = item.productImages?.[0];
        let matchedProduct = null;
        
        if (itemImage && allProducts) {
          matchedProduct = allProducts.find(p => {
            const productImages = p.productImages || [];
            return productImages.some(img => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              return imgUrl === itemImage;
            });
          });
        }
        
        // If not found by image, try by brand + name
        if (!matchedProduct && item.brand && item.itemName && allProducts) {
          const itemBrand = item.brand.toLowerCase();
          const itemNameParts = item.itemName.toLowerCase().split(' ');
          
          matchedProduct = allProducts.find(p => {
            const productBrand = (p.brand || '').toLowerCase();
            const productName = (p.productName || '').toLowerCase();
            const brandMatch = productBrand === itemBrand;
            const nameMatch = itemNameParts.some(part => 
              part.length > 2 && productName.includes(part)
            );
            return brandMatch && nameMatch;
          });
        }
        
        // Add productCategory to item
        return {
          ...item,
          productCategory: matchedProduct?.productCategory || item.productCategory || ''
        };
      });
      
      setProducts(enrichedItems);
      
      // Use all 8 predefined categories
      const allCategoriesList = [
        { key: "All", labelKey: "all", icon: "apps" },
        ...ALL_CATEGORIES
      ];
      
      setCategories(allCategoriesList);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMarketplaceItems(); }, [fetchMarketplaceItems]);
  useFocusEffect(useCallback(() => { fetchCartCount(); }, [fetchCartCount]));

  // ── Group flat items by productId (or productName if no productId)
  const groupedProducts = useMemo(() => {
    const groups = {};
    products.forEach(item => {
      const key = item.productId || item.productName || item.brand || item.itemId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.values(groups);
  }, [products]);

  // ── Filter groups by search and category
  const filteredGroups = useMemo(() => {
    let filtered = groupedProducts;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(group => {
        return group.some(item => {
          const itemCategory = (item.productCategory || '').toUpperCase().trim();
          const selectedCat = selectedCategory.toUpperCase().trim();
          return itemCategory === selectedCat || 
                 itemCategory.includes(selectedCat) ||
                 selectedCat.includes(itemCategory);
        });
      });
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(group =>
        group.some(item => {
          const name = (item.itemName || '').toLowerCase();
          const brand = (item.brand || '').toLowerCase();
          const category = (item.productCategory || '').toLowerCase();
          return name.includes(searchLower) || brand.includes(searchLower) || category.includes(searchLower);
        })
      );
    }
    
    return filtered;
  }, [search, groupedProducts, selectedCategory]);

  // ── Each "item" passed by FlatList is a group (array of variants)
  const renderItem = useCallback(({ item: group }) => {
    const first = group[0]; // representative item for the card
    const imageUrl = typeof first.productImages?.[0] === 'string'
      ? first.productImages[0]
      : first.productImages?.[0]?.url;

    // Price range label
    const prices = group.map(i => i.price).sort((a, b) => a - b);
    const priceLabel = prices.length > 1
      ? `₹${prices[0]} – ₹${prices[prices.length - 1]}`
      : `₹${prices[0]}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('MarketplaceProductDetails', {
            items: group,
            productId: first.productId,
            productName: first.productName,
          });
        }}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              onError={() => console.log('Image load error')}
            />
          ) : (
            <View style={styles.placeholderIconWrapper}>
              <Icon name="inventory-2" size={36} color="#BDBDBD" />
            </View>
          )}

          {/* Group / Variants Badge */}
          {group.length > 1 && (
            <View style={styles.variantCountBadge}>
              <Text style={styles.variantCountText}>{group.length} {t('marketplace.variants')}</Text>
            </View>
          )}

          {/* Category Badge overlaying image */}
          {first.productCategory && (
            <View style={styles.categoryPillOverlay}>
              <Text style={styles.categoryPillText}>
                {t(`product_categories.${first.productCategory.toLowerCase()}`)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {first.itemName || 'N/A'}
          </Text>
          <Text style={styles.brandText}>{first.brand || 'No Brand'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{priceLabel}</Text>
          </View>
          <Text style={styles.unitText}>{first.unit}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, t]);

  return (
    <View style={styles.container}>
      {/* MODERN GLASS TOP-BAR INSTEAD OF SOLID BLOCK */}
      <View style={styles.headerSpacer} />
      <View style={styles.topBar}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back-ios" size={20} color="#1A1A1A" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t("marketplace.title")}</Text>
            <Text style={styles.headerSub}>{t("marketplace.subtitle")}</Text>
          </View>

          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="shopping-cart" size={22} color="#1A1A1A" />
            {cartCount > 0 && (
              <View style={styles.badgeIndicator}>
                <Text style={styles.badgeNum}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FLOATING SEARCH BOX */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder={t("marketplace.search")}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* CATEGORY CHIPS */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category.key;
            return (
              <TouchableOpacity
                key={category.key}
                onPress={() => setSelectedCategory(category.key)}
                style={[
                  styles.categoryChip,
                  isActive ? styles.chipActive : styles.chipInactive,
                ]}
                activeOpacity={0.7}
              >
                <Icon 
                  name={category.icon} 
                  size={18} 
                  color={isActive ? "#fff" : "#6B7280"} 
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {category.key === 'All' ? t('marketplace.all') : t(`product_categories.${category.labelKey}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* PRODUCT LIST */}
      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.stateContainer}>
          <Icon name="search-off" size={60} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>
            {selectedCategory !== "All" 
              ? t('marketplace.no_products_cat', { category: t(`product_categories.${categories.find(c => c.key === selectedCategory)?.labelKey}`) }) 
              : t('marketplace.no_products')}
          </Text>
          {selectedCategory !== "All" && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => setSelectedCategory("All")}
            >
              <Text style={styles.clearFilterBtnText}>{t('marketplace.clear_filter')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(group, index) => group[0]?.itemId || index.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productListContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default MarketPlace;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6, backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8", // Matched with FarmerHome changes
  },
  
  /* TOP BAR - SLEEK LIGHT DESIGN */
  topBar: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10, // Ensure shadow appears over lists
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
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

  /* SEARCH BOX */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },

  /* CATEGORY CHIPS */
  categorySection: {
    marginTop: 15,
    marginBottom: 5,
  },
  categoryScrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  chipInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: FARMER_COLORS.primaryLight, // Farmer App Brand
    borderWidth: 1,
    borderColor: FARMER_COLORS.primaryLight,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextInactive: {
    color: "#4B5563",
  },
  chipTextActive: {
    color: "#ffffff",
  },

  /* LIST STYLES */
  productListContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  productRow: {
    justifyContent: "space-between",
  },

  /* MODERN PRODUCT CARD */
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderIconWrapper: {
    opacity: 0.5,
  },
  variantCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    backdropFilter: "blur(4px)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  variantCountText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  categoryPillOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#059669", // Emerald Green for tags
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryPillText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  brandText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: FARMER_COLORS.primaryLight, // Farmer Brand Color
  },
  unitText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  /* EMPTY & LOADING STATES */
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  clearFilterButton: {
    marginTop: 24,
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearFilterBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});


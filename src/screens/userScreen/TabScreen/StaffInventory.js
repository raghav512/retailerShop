import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const THEME = STAFF_COLORS.primary;

const StaffInventory = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);

  const ProductData = async () => {
    try {
      const response = await apiService.GetFPOProduct();
      console.log('STAFF INVENTORY PRODUCTS 👉', response);
      setProducts(response || []);
    } catch (error) {
      console.log('API ERROR 👉', error);
    }
  };

  const handleToggleStatus = useCallback(async (productId, currentStatus) => {
    try {
      await apiService.toggleProductStatus(productId);
      ProductData();
    } catch (error) {
      console.log('Toggle status error:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update product status',
      });
    }
  }, []);

  const handleEdit = useCallback(
    product => {
      navigation.navigate('StaffUpdateProduct', { product });
    },
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      ProductData();
    }, []),
  );

  const renderItem = useCallback(
    ({ item }) => {
      const imageUri =
        typeof item?.productImage === 'object' && item?.productImage?.url
          ? item.productImage.url
          : typeof item?.productImage === 'string'
          ? item.productImage
          : item?.productImages?.[0]?.url || null;

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('StaffProductDetails', { product: item })
          }
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
              {t('inventory.brand')}: {item?.brand}
            </Text>
            <Text style={styles.mrp}>
              {item?.products?.length > 0
                ? `₹${item.products[0].mrp} - ₹${
                    item.products[item.products.length - 1].mrp
                  }`
                : `${t('inventory.mrp')} ${item?.mrp}`}
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
              onPress={e => {
                e.stopPropagation();
                handleEdit(item);
              }}
              activeOpacity={0.7}
            >
              <Icon
                name="create-outline"
                size={16}
                color={STAFF_COLORS.textOnPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusBtn,
                item.isActive ? styles.activeBtn : styles.inactiveBtn,
              ]}
              onPress={e => {
                e.stopPropagation();
                handleToggleStatus(item._id, item.isActive);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.statusText}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [t, handleEdit, handleToggleStatus, navigation],
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('inventory.title')}</Text>
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
            onPress={() => navigation.navigate('StaffAddProduct')}
          >
            <Text style={styles.addText}>＋ {t('inventory.add_product')}</Text>
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
                <Text style={styles.emptySubText}>
                  Add your first product using the button above
                </Text>
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
    backgroundColor: STAFF_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: STAFF_COLORS.background,
  },
  headerSpacer: {
    height: 0,
    backgroundColor: STAFF_COLORS.primary,
  },
  header: {
    backgroundColor: STAFF_COLORS.primary,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: STAFF_COLORS.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },
  headerTitle: {
    color: STAFF_COLORS.textOnPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  container: {
    backgroundColor: STAFF_COLORS.background,
    padding: 20,
  },
  addBtn: {
    backgroundColor: STAFF_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: STAFF_COLORS.primaryDark,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: STAFF_COLORS.primaryLight,
  },
  addText: {
    color: STAFF_COLORS.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  icon: {
    fontSize: 24,
  },
  productImage: {
    width: 56,
    height: 56,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  brand: {
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  mrp: {
    fontSize: 14,
    color: STAFF_COLORS.accent,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  variants: {
    fontSize: 11,
    color: STAFF_COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: STAFF_COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  activeBtn: {
    backgroundColor: STAFF_COLORS.primary,
  },
  inactiveBtn: {
    backgroundColor: STAFF_COLORS.textSecondary,
  },
  statusText: {
    color: STAFF_COLORS.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  emptySubText: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const Cart = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart();
      console.log('🔍 Cart response structure:', JSON.stringify(response, null, 2));
      const items = response?.data?.items || [];
      console.log('📦 Extracted items:', items);
      setCartItems(items);
      setCartData(response?.data);
    } catch (error) {
      console.log('Error:', error.message);
      showAlert({ type: 'error', title: t('error'), message: t('cart.load_error') });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  // Base frontend mathematical calculation for when the backend doesn't explicitly return totals
  const calculatedSubTotal = cartItems.reduce((sum, item) => sum + ((item.expectedPrice || 0) * (item.quantity || 1)), 0);

  // Use exact backend provided totals, falling back to basic calculation when no coupon/backend total is returned
  const subTotal = cartData?.subTotal || calculatedSubTotal;
  const discountAmount = cartData?.discountAmount || cartData?.discount || 0;
  const appliedCoupon = cartData?.appliedCoupon || cartData?.couponCode || null;
  const totalAmount = cartData?.totalAmount || cartData?.finalAmount || cartData?.totalPrice || Math.max(0, subTotal - discountAmount);

  const handleRemove = async (itemId) => {
    console.log('🗑️ Removing item:', itemId);
    const previousItems = [...cartItems];
    setCartItems(prev => prev.filter(i => i._id !== itemId));

    try {
      const response = await apiService.deleteCartItem(itemId);
      console.log('✅ Item deleted successfully');

      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchCart();
    } catch (error) {
      console.log('❌ Delete failed:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        showAlert({ type: 'warning', title: t('error'), message: t('cart.already_removed') });
      } else {
        showAlert({ type: 'error', title: t('error'), message: t('cart.remove_error') });
        setCartItems(previousItems);
      }

      await fetchCart();
    }
  };

  const handleClearCart = () => {
    showAlert({
      type: 'confirm',
      title: t('cart.clear_cart_title'),
      message: t('cart.clear_cart_msg'),
      buttons: [
        { text: t('cart.cancel'), style: 'cancel' },
        {
          text: t('cart.clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.clearCart();
              setCartItems([]);
            } catch (error) {
              console.log('Error clearing cart:', error);
              showAlert({ type: 'error', title: t('error'), message: t('cart.clear_error') });
              fetchCart();
            }
          }
        }
      ]
    });
  };

  const handleQuantityChange = async (itemId, delta) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) {
      console.log('❌ Item not found in local state');
      return;
    }

    const newQty = item.quantity + delta;

    if (newQty > 8) {
      showAlert({ type: 'warning', title: t('cart.limit_reached'), message: t('cart.max_qty_msg') });
      return;
    }

    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    console.log('🔄 Updating item:', { itemId, currentQty: item.quantity, newQty });
    const previousItems = [...cartItems];
    setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity: newQty } : i));

    try {
      const response = await apiService.updateCart({ itemId, quantity: newQty });
      console.log('✅ Update successful');
      // Keep the optimistic local update — don't overwrite with response
      // as it may not carry full image data
    } catch (error) {
      console.log('❌ Update failed:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        showAlert({ type: 'warning', title: t('error'), message: t('cart.update_error') });
      } else {
        showAlert({ type: 'error', title: t('error'), message: t('cart.update_fail') });
      }

      setCartItems(previousItems);
      await fetchCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      setLoading(true);
      const res = await apiService.applyCoupon({ couponCode });
      console.log('✅ Coupon applied:', res);
      showAlert({ type: 'success', title: t('success') || 'Success', message: t('cart.coupon_success') });
      await fetchCart();
    } catch (error) {
      console.log('❌ Coupon error:', error.response?.data || error.message);
      showAlert({ type: 'error', title: t('error') || 'Error', message: t('cart.coupon_fail') });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    // productImages can be string[] (new API) or {url}[] (old API)
    const rawImage = item.item?.productImages?.[0] ?? item.item?.sourceRef?.productImages?.[0];
    const imageUrl = typeof rawImage === 'string' ? rawImage : rawImage?.url;

    return (
      <View style={styles.card}>
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              onError={() => console.log('Image load error for:', item.item?.itemName)}
            />
          ) : (
            <Icon name="leaf" size={28} color={FARMER_COLORS.primaryLight} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.item?.itemName || t("cart.unknown_item")}
          </Text>
          <Text style={styles.brand} numberOfLines={1}>
            {item.item?.brand || t("cart.no_brand")}
          </Text>
          <Text style={styles.price}>₹{item.expectedPrice?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item._id, -1)}
            >
              <Icon name="remove" size={18} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item._id, 1)}
              disabled={item.quantity >= 8}
            >
              <Icon name="add" size={18} color={item.quantity >= 8 ? "#D1D5DB" : "#6B7280"} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item._id)} style={styles.deleteBtn}>
            <Icon name="trash" size={18} color="#EF4444"/>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={FARMER_COLORS.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("cart.title")}</Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
            <Icon name="trash" size={22} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconBox}>
            <Icon name="cart" size={64} color={FARMER_COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyText}>{t("cart.empty")}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <View style={styles.couponContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="SAVE10"
                value={couponCode}
                onChangeText={setCouponCode}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                editable={!appliedCoupon}
              />
              <TouchableOpacity
                style={[styles.applyBtn, appliedCoupon && styles.applyBtnDisabled]}
                onPress={handleApplyCoupon}
                disabled={!!appliedCoupon}
              >
                <Text style={styles.applyBtnText}>
                  {appliedCoupon ? t("cart.applied") : t("cart.apply")}
                </Text>
              </TouchableOpacity>
            </View>

            {appliedCoupon && (
                <Text style={styles.appliedCouponText}>
                  {t('cart.coupon_applied_success', { coupon: appliedCoupon })}
                </Text>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("cart.subtotal")}</Text>
              <Text style={styles.totalPrice}>₹{subTotal.toFixed(2)}</Text>
            </View>
            
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t("cart.discount")}</Text>
                <Text style={styles.discountPrice}>-₹{discountAmount.toFixed(2)}</Text>
              </View>
            )}

            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>{t("cart.total")}</Text>
              <Text style={styles.finalTotalPrice}>₹{totalAmount.toFixed(2)}</Text>
            </View>

            <Text style={styles.paymentMethodTitle}>{t("cart.payment_method")}</Text>
            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity 
                style={[styles.paymentMethodBtn, paymentMethod === 'CASH' && styles.paymentMethodBtnActive]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <View style={[styles.radioOuter, paymentMethod === 'CASH' && styles.radioOuterActive]}>
                  {paymentMethod === 'CASH' && <View style={styles.radioInner} />}
                </View>
                <Icon name="cash" size={20} color={paymentMethod === 'CASH' ? "#059669" : "#6B7280"} style={{marginLeft: 8}} />
                <Text style={[styles.paymentMethodText, paymentMethod === 'CASH' && styles.paymentMethodTextActive]}>{t('cart.cash')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.paymentMethodBtn, paymentMethod === 'CREDIT' && styles.paymentMethodBtnActive]}
                onPress={() => setPaymentMethod('CREDIT')}
              >
                 <View style={[styles.radioOuter, paymentMethod === 'CREDIT' && styles.radioOuterActive]}>
                  {paymentMethod === 'CREDIT' && <View style={styles.radioInner} />}
                </View>
                <Icon name="card" size={20} color={paymentMethod === 'CREDIT' ? "#059669" : "#6B7280"} style={{marginLeft: 8}} />
                <Text style={[styles.paymentMethodText, paymentMethod === 'CREDIT' && styles.paymentMethodTextActive]}>{t('cart.credit')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={async () => {
                try {
                  setLoading(true);
                  
                  // Profile Validation
                  const profile = await apiService.getProfileDetails();
                  const userData = profile?.data || profile; // Backend might return {data: ...} or just the object
                  
                  if (!userData?.firstName || !userData?.lastName) {
                    setLoading(false);
                    showAlert({ 
                      type: 'warning', 
                      title: t('cart.profile_incomplete'), 
                      message: t('cart.update_personal_details')
                    });
                    navigation.navigate("PersonalDetails");
                    return;
                  }

                  await apiService.placeOrder(paymentMethod);
                  setCartItems([]);
                  showAlert({ type: 'success', title: t('success'), message: t('cart.order_success') });
                } catch (error) {
                  console.log('Checkout error:', error);
                  showAlert({ type: 'error', title: t('error'), message: t('cart.order_error') });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutText}>{t("cart.checkout")}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6, backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  brand: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: FARMER_COLORS.primaryLight,
    marginTop: 4,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  qty: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 16,
    textAlign: "center",
  },
  deleteBtn: {
    padding: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
  },
  footer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
  },
  couponContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAF8",
    fontWeight: "600",
  },
  applyBtn: {
    backgroundColor: FARMER_COLORS.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginLeft: 12,
    justifyContent: "center",
  },
  applyBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  applyBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  appliedCouponText: {
    color: FARMER_COLORS.primaryLight,
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  finalTotalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  totalPrice: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "700",
  },
  discountPrice: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "700",
  },
  finalTotalPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: FARMER_COLORS.primaryLight,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  paymentMethodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  paymentMethodBtnActive: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#059669",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#059669",
  },
  paymentMethodText: {
    fontSize: 15,
    color: "#4B5563",
    marginLeft: 8,
    fontWeight: "600",
  },
  paymentMethodTextActive: {
    color: "#059669",
  },
  checkoutBtn: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});

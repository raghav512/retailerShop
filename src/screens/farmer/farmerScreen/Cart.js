import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import Icon from 'react-native-vector-icons/Ionicons';
import { FARMER_COLORS, STAFF_COLORS } from '../../../colorsList/ColorList';
import ImagePickerModal from '../../../common/reusableComponent/ImagePickerModal';
import imagePickerService from '../../../services/imagePickerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cart = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemImages, setItemImages] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    isStaffOrder,
    selectedFarmerId,
    selectedFarmerData,
    selectedFarmerName,
  } = route.params || {};

  const COLORS = isStaffOrder ? STAFF_COLORS : FARMER_COLORS;
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  console.log('CART CONTEXT:', {
    isStaffOrder,
    selectedFarmerId,
    selectedFarmerName,
    farmerPhone: selectedFarmerData?.phone,
  });

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart(
        isStaffOrder ? selectedFarmerId : undefined,
      );
      console.log(
        '🔍 Cart response structure:',
        JSON.stringify(response, null, 2),
      );
      const items = response?.data?.items || [];
      console.log('📦 Extracted items:', items);
      setCartItems(items);
      setCartData(response?.data);
    } catch (error) {
      console.log('Error:', error.message);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('cart.load_error'),
      });
    } finally {
      setLoading(false);
    }
  }, [t, isStaffOrder, selectedFarmerId]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const calculatedSubTotal = cartItems.reduce(
    (sum, item) => sum + (item.expectedPrice || 0) * (item.quantity || 1),
    0,
  );

  const subTotal = cartData?.subTotal || calculatedSubTotal;
  const totalAmount =
    cartData?.totalAmount ||
    cartData?.finalAmount ||
    cartData?.totalPrice ||
    subTotal;

  const handleRemove = async itemId => {
    console.log('🗑️ Removing item:', itemId);
    const previousItems = [...cartItems];
    setCartItems(prev => prev.filter(i => i._id !== itemId));

    try {
      const response = await apiService.deleteCartItem(
        itemId,
        isStaffOrder ? selectedFarmerId : undefined,
      );
      console.log('✅ Item deleted successfully');

      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchCart();
    } catch (error) {
      console.log('❌ Delete failed:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        showAlert({
          type: 'warning',
          title: t('error'),
          message: t('cart.already_removed'),
        });
      } else {
        showAlert({
          type: 'error',
          title: t('error'),
          message: t('cart.remove_error'),
        });
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
              await apiService.clearCart(
                isStaffOrder ? selectedFarmerId : undefined,
              );
              setCartItems([]);
              setItemImages({}); // Clear images as well
            } catch (error) {
              console.log('Error clearing cart:', error);
              showAlert({
                type: 'error',
                title: t('error'),
                message: t('cart.clear_error'),
              });
              fetchCart();
            }
          },
        },
      ],
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
      showAlert({
        type: 'warning',
        title: t('cart.limit_reached'),
        message: t('cart.max_qty_msg'),
      });
      return;
    }

    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    console.log('🔄 Updating item:', {
      itemId,
      currentQty: item.quantity,
      newQty,
    });
    const previousItems = [...cartItems];
    setCartItems(prev =>
      prev.map(i => (i._id === itemId ? { ...i, quantity: newQty } : i)),
    );

    try {
      const response = await apiService.updateCart({
        itemId,
        quantity: newQty,
        ...(isStaffOrder && selectedFarmerId
          ? { farmerId: selectedFarmerId }
          : {}),
      });
      console.log('✅ Update successful');
    } catch (error) {
      console.log('❌ Update failed:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        showAlert({
          type: 'warning',
          title: t('error'),
          message: t('cart.update_error'),
        });
      } else {
        showAlert({
          type: 'error',
          title: t('error'),
          message: t('cart.update_fail'),
        });
      }

      setCartItems(previousItems);
      await fetchCart();
    }
  };

  const handleAddImage = itemId => {
    setSelectedItemId(itemId);
    setShowImagePicker(true);
  };

  const handleImageSelected = async source => {
    try {
      let imageAsset = null;

      if (source === 'camera') {
        imageAsset = await imagePickerService.openCamera();
      } else {
        imageAsset = await imagePickerService.openGallery();
      }

      if (imageAsset && selectedItemId) {
        const base64Image = imagePickerService.toBase64(imageAsset);
        setItemImages(prev => ({
          ...prev,
          [selectedItemId]: {
            uri: imageAsset.uri,
            base64: base64Image,
            type: imageAsset.type,
            name: imageAsset.fileName || `item_${Date.now()}.jpg`,
          },
        }));
      }
    } catch (error) {
      console.error('Image selection error:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: 'Failed to select image',
      });
    }
  };

  const removeItemImage = itemId => {
    setItemImages(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const renderItem = ({ item }) => {
    const rawImage =
      item.item?.productImages?.[0] ?? item.item?.sourceRef?.productImages?.[0];
    const imageUrl = typeof rawImage === 'string' ? rawImage : rawImage?.url;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.imageBox}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.productImage}
                onError={() =>
                  console.log('Image load error for:', item.item?.itemName)
                }
              />
            ) : (
              <Icon name="leaf" size={28} color={COLORS.primaryLight} />
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {item.item?.itemName || t('cart.unknown_item')}
            </Text>
            <Text style={styles.brand} numberOfLines={1}>
              {item.item?.brand || t('cart.no_brand')}
            </Text>
            <Text style={styles.price}>
              ₹{item.expectedPrice?.toFixed(2) || '0.00'}
            </Text>
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
                <Icon
                  name="add"
                  size={18}
                  color={item.quantity >= 8 ? '#D1D5DB' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleAddImage(item._id)}
                style={[
                  styles.actionBtn,
                  itemImages[item._id] && styles.actionBtnActive,
                ]}
              >
                <Icon
                  name="camera"
                  size={16}
                  color={itemImages[item._id] ? '#10B981' : '#6B7280'}
                />
              </TouchableOpacity>

              {itemImages[item._id] && (
                <TouchableOpacity
                  onPress={() => removeItemImage(item._id)}
                  style={styles.actionBtn}
                >
                  <Icon name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleRemove(item._id)}
                style={styles.actionBtn}
              >
                <Icon name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {itemImages[item._id] && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: itemImages[item._id].uri }}
              style={styles.previewImage}
            />
            <Text style={styles.imageLabel}>Image added</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          {isStaffOrder && selectedFarmerName && (
            <Text style={styles.headerSubtitle}>For: {selectedFarmerName}</Text>
          )}
        </View>
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
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconBox}>
            <Icon name="cart" size={64} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyText}>{t('cart.empty')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>{t('cart.total')}</Text>
              <Text style={styles.finalTotalPrice}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.paymentMethodTitle}>
              {t('cart.payment_method')}
            </Text>
            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodBtn,
                  paymentMethod === 'CASH' && styles.paymentMethodBtnActive,
                ]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    paymentMethod === 'CASH' && styles.radioOuterActive,
                  ]}
                >
                  {paymentMethod === 'CASH' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Icon
                  name="cash"
                  size={20}
                  color={paymentMethod === 'CASH' ? '#059669' : '#6B7280'}
                  style={{ marginLeft: 8 }}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'CASH' && styles.paymentMethodTextActive,
                  ]}
                >
                  {t('cart.cash')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentMethodBtn,
                  paymentMethod === 'CREDIT' && styles.paymentMethodBtnActive,
                ]}
                onPress={() => setPaymentMethod('CREDIT')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    paymentMethod === 'CREDIT' && styles.radioOuterActive,
                  ]}
                >
                  {paymentMethod === 'CREDIT' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Icon
                  name="card"
                  size={20}
                  color={paymentMethod === 'CREDIT' ? '#059669' : '#6B7280'}
                  style={{ marginLeft: 8 }}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'CREDIT' &&
                      styles.paymentMethodTextActive,
                  ]}
                >
                  {t('cart.credit')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, isCheckingOut && styles.checkoutBtnDisabled]}
              onPress={async () => {
                if (isCheckingOut) return;
                try {
                  setIsCheckingOut(true);
                  setLoading(true);

                  console.log('ORDER SUBMIT:', {
                    isStaffOrder,
                    selectedFarmerId,
                    paymentMethod,
                    cartItemsCount: cartItems?.length || 0,
                  });

                  const payload = {
                    paymentMethod,
                    itemImages:
                      Object.keys(itemImages).length > 0
                        ? itemImages
                        : undefined,
                  };

                  if (isStaffOrder && selectedFarmerId) {
                    payload.farmerId = selectedFarmerId;
                    console.log('STAFF ORDER - farmerId:', selectedFarmerId);
                  }

                  console.log('ORDER PAYLOAD:', {
                    paymentMethod: payload.paymentMethod,
                    farmerId: payload.farmerId,
                    isStaffOrder: payload.isStaffOrder,
                    hasImages: !!payload.itemImages,
                  });

                  const profile = await apiService.getProfileDetails();
                  const userData = profile?.data || profile;

                  if (
                    !isStaffOrder &&
                    (!userData?.firstName || !userData?.lastName)
                  ) {
                    setLoading(false);
                    showAlert({
                      type: 'warning',
                      title: t('cart.profile_incomplete'),
                      message: t('cart.update_personal_details'),
                    });
                    navigation.navigate('PersonalDetails');
                    return;
                  }

                  // Pre-store farmer data with timestamp key before placing order
                  let tempStorageKey = null;
                  if (
                    isStaffOrder &&
                    selectedFarmerId &&
                    selectedFarmerName &&
                    selectedFarmerData
                  ) {
                    try {
                      tempStorageKey = `temp_staff_order_${Date.now()}_${selectedFarmerId}`;
                      const orderFarmerData = {
                        farmerId: selectedFarmerId,
                        farmerName: selectedFarmerName,
                        farmerData: selectedFarmerData,
                        timestamp: Date.now(),
                        isTemp: true,
                      };

                      await AsyncStorage.setItem(
                        tempStorageKey,
                        JSON.stringify(orderFarmerData),
                      );
                      console.log(
                        '✅ Pre-stored farmer data with temp key:',
                        tempStorageKey,
                      );
                    } catch (storageError) {
                      console.log(
                        '⚠️ Failed to pre-store farmer data:',
                        storageError,
                      );
                    }
                  } else if (isStaffOrder) {
                    console.log('⚠️ Missing farmer data for staff order:', {
                      selectedFarmerId,
                      selectedFarmerName,
                      hasFarmerData: !!selectedFarmerData,
                    });
                  }

                  const orderResponse = await apiService.placeOrder(payload);
                  console.log('========== ORDER RESPONSE TRACE ==========');
                  console.log(
                    'Order Response:',
                    JSON.stringify(orderResponse, null, 2),
                  );
                  console.log('===========================================');

                  // Store farmer data using orderId from response and clean up temp storage
                  if (
                    isStaffOrder &&
                    selectedFarmerId &&
                    orderResponse?.data?.orderId
                  ) {
                    try {
                      const orderFarmerData = {
                        orderId: orderResponse.data.orderId,
                        farmerId: selectedFarmerId,
                        farmerName: selectedFarmerName,
                        farmerData: selectedFarmerData,
                        timestamp: Date.now(),
                      };

                      // Store with orderId as key for easy retrieval
                      await AsyncStorage.setItem(
                        `staff_order_${orderResponse.data.orderId}`,
                        JSON.stringify(orderFarmerData),
                      );

                      console.log(
                        '✅ Farmer data stored with orderId:',
                        orderFarmerData,
                      );

                      // Clean up temporary storage
                      if (tempStorageKey) {
                        await AsyncStorage.removeItem(tempStorageKey);
                        console.log(
                          '✅ Cleaned up temp storage:',
                          tempStorageKey,
                        );
                      }
                    } catch (storageError) {
                      console.log(
                        '⚠️ Failed to store farmer data:',
                        storageError,
                      );
                    }
                  }

                  setCartItems([]);
                  setItemImages({});
                  showAlert({
                    type: 'success',
                    title: t('success'),
                    message: isStaffOrder
                      ? `Order placed successfully for ${selectedFarmerName}`
                      : t('cart.order_success'),
                    buttons: [
                      {
                        text: 'OK',
                        onPress: () => {
                          if (isStaffOrder) {
                            navigation.navigate('Home');
                          }
                        },
                      },
                    ],
                  });
                } catch (error) {
                  console.log('Checkout error:', error);

                  // Clean up temp storage on error
                  if (tempStorageKey) {
                    try {
                      await AsyncStorage.removeItem(tempStorageKey);
                      console.log('🧹 Cleaned up temp storage after error');
                    } catch (cleanupError) {
                      console.log(
                        '⚠️ Failed to cleanup temp storage:',
                        cleanupError,
                      );
                    }
                  }

                  showAlert({
                    type: 'error',
                    title: t('error'),
                    message: t('cart.order_error'),
                  });
                } finally {
                  setLoading(false);
                  setIsCheckingOut(false);
                }
              }}
              disabled={loading || isCheckingOut}
              activeOpacity={0.8}
            >
              {isCheckingOut ? (
                <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
              ) : (
                <Text style={styles.checkoutText}>{t('cart.checkout')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCamera={() => handleImageSelected('camera')}
        onGallery={() => handleImageSelected('gallery')}
      />
    </View>
  );
};

export default Cart;

const getStyles = COLORS =>
  StyleSheet.create({
    headerSpacer: {
      height: 0,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      backgroundColor: COLORS.primary,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 28,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      elevation: 6,
      shadowColor: COLORS.accent,
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.textOnPrimary,
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.textOnPrimary,
      opacity: 0.9,
      marginTop: 2,
    },
    list: {
      padding: 20,
      paddingTop: 24,
      paddingBottom: 20,
    },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
      shadowColor: COLORS.accent,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 3 },
      borderWidth: 1,
      borderColor: COLORS.primary + '1F',
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageBox: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: COLORS.tintCard,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textPrimary,
      letterSpacing: 0.2,
      lineHeight: 22,
    },
    brand: {
      fontSize: 13,
      color: COLORS.textSecondary,
      marginTop: 4,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    price: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.primaryLight,
      marginTop: 6,
      letterSpacing: 0.2,
    },
    actions: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
    },
    qtyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.tintCard,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 12,
      borderWidth: 1,
      borderColor: COLORS.tintMid,
    },
    productImage: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
    },
    qty: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      minWidth: 18,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionBtn: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
    },
    actionBtnActive: {
      backgroundColor: '#D1FAE5',
    },
    imagePreview: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    previewImage: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: 8,
    },
    imageLabel: {
      fontSize: 12,
      color: '#10B981',
      fontWeight: '600',
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIconBox: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.tintCard,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: COLORS.tintMid,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.textSecondary,
      letterSpacing: 0.2,
    },
    footer: {
      backgroundColor: COLORS.surface,
      padding: 24,
      paddingBottom: 28,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      elevation: 12,
      shadowColor: COLORS.accent,
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -8 },
      borderTopWidth: 1,
      borderTopColor: COLORS.tintMid,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    finalTotalRow: {
      marginTop: 12,
      paddingTop: 20,
      borderTopWidth: 1.5,
      borderTopColor: COLORS.tintMid,
      marginBottom: 24,
    },
    finalTotalLabel: {
      fontSize: 19,
      fontWeight: '700',
      color: COLORS.textPrimary,
      letterSpacing: 0.3,
    },

    finalTotalPrice: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS.primaryLight,
      letterSpacing: 0.3,
    },
    paymentMethodTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    paymentMethodContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 28,
      gap: 12,
    },
    paymentMethodBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: COLORS.tintMid,
      backgroundColor: COLORS.tintCard,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 14,
    },
    paymentMethodBtnActive: {
      borderColor: COLORS.primaryLight,
      backgroundColor: COLORS.secondary,
      borderWidth: 2,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: COLORS.tintMid,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterActive: {
      borderColor: COLORS.primaryLight,
      borderWidth: 2.5,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: COLORS.primaryLight,
    },
    paymentMethodText: {
      fontSize: 15,
      color: COLORS.textSecondary,
      marginLeft: 10,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    paymentMethodTextActive: {
      color: COLORS.primaryLight,
      fontWeight: '700',
    },
    checkoutBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      elevation: 4,
      shadowColor: COLORS.accent,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    checkoutBtnDisabled: {
      opacity: 0.6,
    },
    checkoutText: {
      fontSize: 17,
      fontWeight: '700',
      color: COLORS.textOnPrimary,
      letterSpacing: 0.5,
    },
  });

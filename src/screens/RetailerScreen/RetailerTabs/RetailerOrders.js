import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNBlobUtil from 'react-native-blob-util';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';

const RetailerOrders = ({ navigation }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const handleDownloadReceipt = async order => {
    try {
      setDownloadingOrderId(order._id);
      console.log(
        '📦 Fetching all receipts to find receipt for order:',
        order._id,
      );

      const receiptsRes = await apiService.getAllReceipts();
      const receiptsList = receiptsRes.data || receiptsRes || [];

      // Each receipt has an `order` field containing the order ID
      const receipt = receiptsList.find(
        r => r.order === order._id || r.order?._id === order._id,
      );

      const receiptId = receipt?._id;
      console.log('🧾 Receipt found:', receiptId);

      if (!receiptId) {
        showAlert({
          type: 'warning',
          title: t('retailer_orders.no_receipt'),
          message: t('retailer_orders.no_receipt_msg'),
        });
        return;
      }

      const { url, token } = await apiService.downloadReceipt(receiptId);
      const fileName = `Receipt_${order.orderId || receiptId}.pdf`;
      
      // Use fetch with blob response to download the PDF
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server returned error instead of PDF:', errorText);
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }
      
      // Check if response is JSON (error) or PDF (blob)
      const contentType = response.headers.get('content-type');
      console.log('✅ Response content-type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.error('❌ Server returned JSON instead of PDF:', jsonData);
        throw new Error('Server returned JSON instead of PDF. Please check the backend API.');
      }
      
      // Convert response to blob
      const blob = await response.blob();
      console.log('✅ Receipt blob created, size:', blob.size);
      
      // Save to file using RNBlobUtil
      const downloadDir = RNBlobUtil.fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;
      
      // Read blob as base64 and write to file
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        await RNBlobUtil.fs.writeFile(filePath, base64Data, 'base64');
        console.log('✅ Receipt saved to:', filePath);

        showAlert({
          type: 'success',
          title: t('retailer_orders.downloaded'),
          message: t('retailer_orders.download_success', { fileName }),
          buttons: [
            { text: 'OK' },
            {
              text: t('retailer_orders.open_pdf'),
              onPress: () => {
                if (Platform.OS === 'android') {
                  RNBlobUtil.android.actionViewIntent(
                    filePath,
                    'application/pdf',
                  );
                } else {
                  RNBlobUtil.ios.previewDocument(filePath);
                }
              },
            },
          ],
        });
      };
      reader.onerror = () => {
        throw new Error('Failed to read blob');
      };
    } catch (error) {
      console.error('❌ Download error:', error.message);
      showAlert({
        type: 'error',
        title: t('retailer_orders.download_failed'),
        message: error.message || t('retailer_orders.download_failed'),
      });
    } finally {
      setDownloadingOrderId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.MyOrders();
      setOrders(data || []);
      console.log('Orders:', data);
    } catch (error) {
      console.log('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter(order => {
      const idToSearch = order.orderId ? String(order.orderId) : order._id;
      return idToSearch.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, orders]);

  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="chevron-back"
              size={24}
              color={RETAILER_COLORS.primaryLight}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('retailer_orders.title')}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.searchBox}>
          <Icon name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={t('retailer_orders.search_placeholder')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {loading && (
          <ActivityIndicator
            size="large"
            color={RETAILER_COLORS.primaryLight}
            style={{ marginTop: 20 }}
          />
        )}

        {!loading && filteredOrders.length === 0 && (
          <Text style={styles.noData}>{t('retailer_orders.no_orders')}</Text>
        )}

        {!loading &&
          filteredOrders.map(order => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  {t('retailer_orders.order_id')}: {order.orderId || order._id.slice(-6)}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    order.status === 'APPROVED' || order.status === 'SOLD'
                      ? styles.approvedBg
                      : styles.pendingBg,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      order.status === 'APPROVED' || order.status === 'SOLD'
                        ? { color: '#047857' }
                        : { color: '#B45309' },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.date}>
                {new Date(order.placedAt).toLocaleDateString()}
              </Text>

              {order.paymentMethod && (
                <View style={styles.paymentMethodContainer}>
                  <Icon
                    name={
                      order.paymentMethod.toUpperCase() === 'CREDIT'
                        ? 'card'
                        : 'cash'
                    }
                    size={14}
                    color="#C85A17"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.paymentMethodText}>
                    {order.paymentMethod.toUpperCase()}
                  </Text>
                </View>
              )}

              {order.items.map(itemObj => (
                <View key={itemObj._id} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {itemObj?.item?.itemName}{' '}
                    <Text style={{ color: '#6B7280' }}>
                      ({itemObj?.item?.brand})
                    </Text>
                  </Text>
                  <Text style={styles.itemQty}>Qty: {itemObj?.quantity}</Text>
                </View>
              ))}

              <View style={styles.bottomRow}>
                <Text style={styles.totalAmount}>
                  {t('retailer_orders.total')}:{' '}
                  <Text style={{ color: RETAILER_COLORS.primaryLight }}>
                    ₹
                    {order.totalAmount ??
                      order.totalPrice ??
                      order.finalAmount ??
                      0}
                  </Text>
                </Text>

                {(order.status?.toUpperCase() === 'APPROVED' ||
                  order.status?.toUpperCase() === 'SOLD') && (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadReceipt(order)}
                    disabled={downloadingOrderId === order._id}
                  >
                    {downloadingOrderId === order._id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon
                          name="download"
                          size={16}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.downloadBtnText}>{t('retailer_orders.receipt')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default RetailerOrders;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.tint,
  },

  header: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RETAILER_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },

  searchBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 15,
  },

  orderCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  orderId: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 15,
  },

  date: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },

  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RETAILER_COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },

  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: RETAILER_COLORS.primary,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  approvedBg: {
    backgroundColor: '#D1FAE5',
  },

  pendingBg: {
    backgroundColor: RETAILER_COLORS.secondary,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  itemRow: {
    marginBottom: 8,
  },

  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  itemQty: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  totalAmount: {
    fontWeight: '700',
    fontSize: 15,
    color: '#374151',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RETAILER_COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  downloadBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  noData: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});

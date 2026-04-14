import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from "react-i18next";
import RNBlobUtil from 'react-native-blob-util';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const OrderUpdateDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditDaysInput, setCreditDaysInput] = useState('30');
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [localOrder, setLocalOrder] = useState(order);
  const [editedPrices, setEditedPrices] = useState(() => {
    return order?.items?.reduce((acc, item) => {
      acc[item._id] = item.expectedPrice != null ? String(item.expectedPrice) : '';
      return acc;
    }, {}) || {};
  });

  const getDisplayedTotal = () => {
    if (localOrder?.status?.toUpperCase() !== 'PENDING') {
      return localOrder?.totalAmount ?? localOrder?.totalPrice ?? localOrder?.finalAmount ?? 0;
    }
    let total = 0;
    localOrder?.items?.forEach(item => {
      const price = editedPrices[item._id] !== undefined && editedPrices[item._id] !== ''
        ? Number(editedPrices[item._id])
        : item.expectedPrice;
      total += (price * item.quantity);
    });
    return total;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#F59E0B';
      case 'APPROVED':
        return '#10B981';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleStatusUpdate = async (payload) => {
    const newStatus = typeof payload === 'string' ? payload : payload.status;

    if (localOrder.status === newStatus && typeof payload === 'string') {
      showAlert({ type: 'info', title: 'Info', message: t('fpo_orders.order_already', { status: t(`fpo_orders.${newStatus.toLowerCase()}`) || newStatus }) });
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.updateOrderStatus(localOrder._id, payload);
      console.log("✅ Status update response:", response);

      const generatedReceiptId = response?.receipt?._id || response?.data?.receipt?._id;

      if (generatedReceiptId) {
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Order processed successfully. A receipt has been generated.',
          buttons: [
            { text: 'Done', onPress: () => navigation.goBack() },
            {
              text: 'Download Receipt',
              onPress: async () => {
                await downloadDirectly(generatedReceiptId);
                navigation.goBack();
              }
            }
          ]
        });
      } else {
        showAlert({ type: 'success', title: 'Success', message: t('fpo_orders.order_success', { status: t(`fpo_orders.${newStatus.toLowerCase()}`) || newStatus }), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
      }

    } catch (error) {
      console.error("\u274c Status update error:", error.response?.data || error.message);
      showAlert({ type: 'error', title: 'Error', message: error.response?.data?.message || t('fpo_orders.failed_update') });
    } finally {
      setLoading(false);
    }
  };
  const downloadDirectly = async (receiptId) => {
    try {
      setDownloadLoading(true);
      const { url, token } = await apiService.downloadReceipt(receiptId);
      const fileName = `Receipt_${order.orderId || receiptId}.pdf`;
      const downloadDir = RNBlobUtil.fs.dirs.DocumentDir;
      const filePath = `${downloadDir}/${fileName}`;

      const res = await RNBlobUtil.config({ fileCache: true, appendExt: 'pdf', path: filePath })
        .fetch('GET', url, { Authorization: `Bearer ${token}` });

      const status = res.info().status;
      if (status !== 200 && status !== 201) {
        // The file downloaded is an HTML or JSON error, not a PDF
        const textError = await res.text();
        console.error('❌ Server returned an error instead of PDF:', textError);
        throw new Error(`Server Error (${status}). The receipt could not be generated.`);
      }

      console.log('✅ Receipt downloaded to:', res.path());

      showAlert({
        type: 'success',
        title: 'Downloaded!',
        message: `Receipt is ready to view.`,
        buttons: [
          { text: 'Cancel' },
          {
            text: 'Open PDF',
            onPress: () => {
              if (Platform.OS === 'android') {
                RNBlobUtil.android.actionViewIntent(res.path(), 'application/pdf');
              } else {
                RNBlobUtil.ios.previewDocument(res.path());
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error('❌ Direct Download error:', error.message);
      showAlert({ type: 'error', title: 'Download Failed', message: error.message });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleUpdatePrices = async () => {
    try {
      setPricesLoading(true);
      const itemsPayload = localOrder.items.map(item => {
        const editedPriceStr = editedPrices[item._id];
        const finalPrice = editedPriceStr !== undefined && editedPriceStr !== ''
          ? Number(editedPriceStr)
          : item.expectedPrice;
        
        return {
          itemId: item.item?._id || item.item,
          finalPrice
        };
      });

      const response = await apiService.updateOrderPrices(localOrder._id, { items: itemsPayload });
      
      console.log('✅ Prices updated successfully:', response);
      showAlert({ 
        type: 'success', 
        title: 'Prices Updated', 
        message: 'Order prices have been updated successfully.',
        buttons: [{ text: 'OK' }]
      });

      if (response && (response.order || response.data)) {
        const updatedOrderFromServer = response.order || response.data;
        
        // Preserve the populated 'item' objects from local state 
        // because the update response might return unpopulated items (ObjectIds only)
        const mergedItems = localOrder.items.map(existingItem => {
          const updatedItem = updatedOrderFromServer.items?.find(
            uItem => uItem._id === existingItem._id
          );
          
          if (updatedItem) {
            return {
              ...updatedItem,
              item: existingItem.item // keep the populated product info
            };
          }
          return existingItem;
        });

        setLocalOrder({
          ...updatedOrderFromServer,
          items: mergedItems
        });
      }
    } catch (error) {
      console.error('❌ Update prices error:', error.message);
      showAlert({ 
        type: 'error', 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to update prices.' 
      });
    } finally {
      setPricesLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setDownloadLoading(true);
      console.log('📦 Fetching all receipts to find receipt for order:', localOrder._id);

      const receiptsRes = await apiService.getAllReceipts();
      const receiptsList = receiptsRes.data || receiptsRes || [];

      // Each receipt has an `order` field containing the order ID
      const receipt = receiptsList.find(r =>
        (r.order === localOrder._id) ||
        (r.order?._id === localOrder._id)
      );

      const receiptId = receipt?._id;
      console.log('🧾 Receipt found:', receiptId);

      if (!receiptId) {
        showAlert({ type: 'warning', title: 'No Receipt', message: 'Could not find a receipt for this order. Make sure the order was sold.' });
        return;
      }

      const { url, token } = await apiService.downloadReceipt(receiptId);
      const fileName = `Receipt_${localOrder.orderId || receiptId}.pdf`;

      // Save directly to public Downloads folder using RNBlobUtil's own HTTP (no DownloadManager, so auth headers work)
      const downloadDir = RNBlobUtil.fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const res = await RNBlobUtil.config({
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: false,
          notification: true,
          title: fileName,
          description: 'Receipt downloaded',
          mime: 'application/pdf',
          mediaScannable: true,
          path: filePath,
        },
      }).fetch('GET', url, { Authorization: `Bearer ${token}` });

      const status = res.info().status;
      if (status !== 200 && status !== 201) {
        const textError = await res.text();
        console.error('❌ Server returned error instead of PDF:', textError);
        throw new Error(`Server Error (${status}): ${textError}`);
      }

      console.log('✅ Receipt downloaded to:', res.path());

      showAlert({
        type: 'success',
        title: 'Downloaded!',
        message: `Receipt saved to Downloads as ${fileName}`,
        buttons: [
          { text: 'OK' },
          {
            text: 'Open PDF',
            onPress: () => {
              if (Platform.OS === 'android') {
                RNBlobUtil.android.actionViewIntent(res.path(), 'application/pdf');
              } else {
                RNBlobUtil.ios.previewDocument(res.path());
              }
            },
          },
        ],
      });

    } catch (error) {
      console.error('❌ Download error:', error.message);
      showAlert({ type: 'error', title: 'Download Failed', message: error.message || 'Failed to download receipt.' });
    } finally {
      setDownloadLoading(false);
    }
  };


  if (!localOrder) return null;

  const farmerName = `${localOrder.farmer?.firstName || ''} ${localOrder.farmer?.lastName || ''}`.trim();
  const statusColor = getStatusColor(localOrder.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('fpo_orders.order_details_title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ORDER CARD */}
        <View style={styles.card}>
          <View style={styles.farmerRow}>
            <Icon name="person-circle-outline" size={40} color={FPO_COLORS.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.farmerName}>{farmerName}</Text>
              <Text style={styles.subText}>
                {t('fpo_orders.order_id')}: #{localOrder.orderId || localOrder._id.slice(-8).toUpperCase()}
              </Text>
              <Text style={styles.subText}>
                {t('fpo_orders.phone')}: {localOrder.farmer?.phone}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('fpo_orders.order_date')}</Text>
            <Text style={styles.value}>{formatDate(localOrder.placedAt)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>{t('fpo_orders.ordered_items')}</Text>

          {localOrder.items.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.item?.itemName || t('fpo_orders.unknown_item')}
                  {item.item?.brand ? ` (${item.item.brand})` : ''}
                </Text>
                <Text style={styles.itemDetails}>
                  {item.quantity} {item.item?.unit || t('fpo_orders.unit')}(s) 
                  {localOrder.status?.toUpperCase() !== 'PENDING' && ` × ₹${item.expectedPrice}`}
                </Text>
              </View>

              {localOrder.status?.toUpperCase() === 'PENDING' && (
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={editedPrices[item._id]}
                    onChangeText={(val) => {
                      setEditedPrices(prev => ({
                        ...prev,
                        [item._id]: val
                      }));
                    }}
                    keyboardType="numeric"
                    placeholder="Rate"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('fpo_orders.total_amount')}</Text>
            <Text style={styles.totalAmount}>₹{getDisplayedTotal()}</Text>
          </View>

          {/* CURRENT STATUS */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20`, marginTop: 12 },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`fpo_orders.${localOrder.status?.toLowerCase()}`) || localOrder.status}
            </Text>
          </View>
        </View>

        {/* DOWNLOAD RECEIPT */}
        {localOrder.status?.toUpperCase() === 'SOLD' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownloadReceipt}
              disabled={downloadLoading}
            >
              {downloadLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Icon name="download-outline" size={22} color="#fff" />
              }
              <Text style={styles.downloadBtnText}>
                {downloadLoading ? 'Downloading...' : 'Download Receipt (PDF)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UPDATE STATUS — only show if still PENDING */}
        {localOrder.status?.toUpperCase() === 'PENDING' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Update Prices</Text>
            
            <TouchableOpacity
              style={styles.updatePricesBtn}
              onPress={handleUpdatePrices}
              disabled={pricesLoading}
            >
              {pricesLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="save-outline" size={20} color="#fff" />
              )}
              <Text style={styles.updatePricesText}>Save Adjusted Prices</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>{t('fpo_orders.update_status')}</Text>

            {/* APPROVE ONLY */}
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleStatusUpdate({ status: 'APPROVED', sell: false })}
              disabled={loading}
            >
              <Icon name="checkmark-circle" size={22} color="#10B981" />
              <Text style={styles.approveText}>Approve only</Text>
              {loading && <ActivityIndicator size="small" color="#10B981" />}
            </TouchableOpacity>

            {/* APPROVE + SELL (CASH) */}
            {(!localOrder.paymentMethod || localOrder.paymentMethod.toUpperCase() === 'CASH') && (
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: '#E0F2FE' }]}
                onPress={() => handleStatusUpdate({ status: 'APPROVED', sell: true, paymentMethod: 'CASH' })}
                disabled={loading}
              >
                <Icon name="cash-outline" size={22} color="#0284C7" />
                <Text style={[styles.approveText, { color: '#0284C7' }]}>Approve + Sell (Cash)</Text>
                {loading && <ActivityIndicator size="small" color="#0284C7" />}
              </TouchableOpacity>
            )}

            {/* APPROVE + SELL (CREDIT) */}
            {localOrder.paymentMethod?.toUpperCase() === 'CREDIT' && (
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: '#FEF3C7', marginBottom: 20 }]}
                onPress={() => setShowCreditModal(true)}
                disabled={loading}
              >
                <Icon name="card-outline" size={22} color="#D97706" />
                <Text style={[styles.approveText, { color: '#D97706' }]}>Approve & Sell (Credit)</Text>
                {loading && <ActivityIndicator size="small" color="#D97706" />}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleStatusUpdate('REJECTED')}
              disabled={loading}
            >
              <Icon name="close-circle" size={22} color="#EF4444" />
              <Text style={styles.rejectText}>{t('fpo_orders.reject_order')}</Text>
              {loading && <ActivityIndicator size="small" color="#EF4444" />}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* CREDIT DAYS MODAL */}
      <Modal
        visible={showCreditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Credit Days</Text>
            <Text style={styles.modalSubtitle}>Enter the number of days the farmer has to pay</Text>

            <TextInput
              style={styles.creditInput}
              value={creditDaysInput}
              onChangeText={setCreditDaysInput}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="e.g. 30"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCreditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  const days = parseInt(creditDaysInput, 10);
                  if (!days || days <= 0) {
                    showAlert({ type: 'warning', title: 'Invalid', message: 'Please enter a valid number of credit days.' });
                    return;
                  }
                  setShowCreditModal(false);
                  handleStatusUpdate({ status: 'APPROVED', sell: true, creditDays: days, paymentMethod: 'CREDIT' });
                }}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};
export default OrderUpdateDetails;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '800',
  },

  container: {
    padding: 18,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  farmerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  itemRow: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  itemDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  totalBox: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    marginBottom: 14,
  },

  approveText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    flex: 1,
  },

  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
  },

  rejectText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    flex: 1,
  },

  updatePricesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },

  updatePricesText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 12,
  },

  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 2,
  },

  priceInput: {
    width: 60,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 6,
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FPO_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },

  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },

  creditInput: {
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFBEB',
  },

  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#D97706',
    alignItems: 'center',
  },

  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});


import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from 'react-native-linear-gradient';
import RNBlobUtil from "react-native-blob-util";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Images from "../../../assets/Images/Images";
import apiService from "../../../Redux/apiService";
import { FARMER_COLORS } from '../../../colorsList/ColorList';
const MyOrders = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const handleDownloadReceipt = async (order) => {
    try {
      setDownloadingOrderId(order._id);
      
      // ========== STEP 7: ORDER DATA TRACE ==========
      console.log("========== ORDER DATA FOR RECEIPT ==========");
      console.log("Order Object:", JSON.stringify(order, null, 2));
      console.log("Order Payment Method:", order.paymentMethod);
      console.log("Order Status:", order.status);
      console.log("=============================================");
      
      console.log('📦 Fetching all receipts to find receipt for order:', order._id);

      const receiptsRes = await apiService.getAllReceipts();
      const receiptsList = receiptsRes.data || receiptsRes || [];

      // Each receipt has an `order` field containing the order ID
      const receipt = receiptsList.find(r =>
        (r.order === order._id) ||
        (r.order?._id === order._id)
      );

      const receiptId = receipt?._id;
      console.log('🧾 Receipt found:', receiptId);
      
      // ========== STEP 8: RECEIPT DATA TRACE ==========
      if (receipt) {
        console.log("========== RECEIPT DATA TRACE ==========");
        console.log("Receipt Object:", JSON.stringify(receipt, null, 2));
        console.log("Receipt Payment Method:", receipt.paymentMethod);
        console.log("=========================================");
      }

      if (!receiptId) {
        showAlert({ type: 'warning', title: 'No Receipt', message: 'Could not find a receipt for this order. Make sure the order was sold.' });
        return;
      }

      const { url, token } = await apiService.downloadReceipt(receiptId);
      const fileName = `Receipt_${order.orderId || receiptId}.pdf`;

      console.log('📥 Starting download:', { url, fileName, hasToken: !!token });

      const downloadDir = RNBlobUtil.fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      console.log('📁 Download path:', filePath);

      const res = await RNBlobUtil.config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      });

      console.log('📊 Response info:', res.info());
      const status = res.info().status;
      
      if (status !== 200 && status !== 201) {
        const textError = await res.text();
        console.error('❌ Server returned error instead of PDF:', textError);
        throw new Error(`Server Error (${status}): ${textError}`);
      }

      const downloadedPath = res.path();
      console.log('✅ File downloaded to:', downloadedPath);

      if (Platform.OS === 'android') {
        await RNBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: 'application/pdf',
          },
          'Download',
          downloadedPath
        );
        console.log('✅ File copied to Downloads folder');
      }

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
                RNBlobUtil.android.actionViewIntent(downloadedPath, 'application/pdf');
              } else {
                RNBlobUtil.ios.previewDocument(downloadedPath);
              }
            },
          },
        ],
      });

    } catch (error) {
      console.error('❌ Download error:', error.message);
      showAlert({ type: 'error', title: 'Download Failed', message: error.message || 'Failed to download receipt.' });
    } finally {
      setDownloadingOrderId(null);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const data = await apiService.MyOrders(); // ✅ directly array
      
      // ========== STEP 5: ORDERS FETCH TRACE ==========
      console.log("========== ORDERS FETCH TRACE ==========");
      console.log("Orders Count:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("First Order Sample:", JSON.stringify(data[0], null, 2));
        console.log("First Order Payment Method:", data[0]?.paymentMethod);
      }
      console.log("=========================================");
      
      setOrders(data || []);

      console.log("Orders:", data);

    } catch (error) {
      console.log("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search by Order ID
  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter((order) => {
      const idToSearch = order.orderId ? String(order.orderId) : order._id;
      return idToSearch.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, orders]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("my_orders.title")}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
        
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t("my_orders.search_id")}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* LOADING */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={FARMER_COLORS.primaryLight}
            style={{ marginTop: 20 }}
          />
        )}

        {/* NO DATA */}
        {!loading && filteredOrders.length === 0 && (
          <Text style={styles.noData}>{t("my_orders.no_orders")}</Text>
        )}

        {/* ORDER LIST */}
        {!loading &&
          filteredOrders.map((order) => (
            <View key={order._id} style={styles.orderCard}>

              {/* Order Header */}
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  {t("my_orders.order_id")} {order.orderId || order._id.slice(-6)}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    order.status === "APPROVED" || order.status === "SOLD"
                      ? styles.approvedBg
                      : styles.pendingBg,
                  ]}
                >
                  <Text style={[styles.statusText, order.status === "APPROVED" || order.status === "SOLD" ? {color: "#047857"} : {color: "#B45309"}]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Order Date */}
              <Text style={styles.date}>
                {new Date(order.placedAt).toLocaleDateString()}
              </Text>

              {/* Payment Method */}
              {order.paymentMethod && (
                <View style={styles.paymentMethodContainer}>
                  <Icon 
                    name={order.paymentMethod.toUpperCase() === 'CREDIT' ? 'card' : 'cash'} 
                    size={14} 
                    color="#0284C7" 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={styles.paymentMethodText}>
                    {order.paymentMethod.toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Items */}
              {order.items.map((itemObj) => (
                <View key={itemObj._id} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {itemObj?.item?.itemName} <Text style={{color:"#6B7280"}}>({itemObj?.item?.brand})</Text>
                  </Text>
                  <Text style={styles.itemQty}>
                    {t("my_orders.qty")} {itemObj?.quantity}
                  </Text>
                </View>
              ))}

              {/* Bottom Row: Total & Download */}
              <View style={styles.bottomRow}>
                <Text style={styles.totalAmount}>
                  {t("my_orders.total")} <Text style={{color:FARMER_COLORS.primaryLight}}>₹{order.totalAmount ?? order.totalPrice ?? order.finalAmount ?? 0}</Text>
                </Text>
                
                {(order.status?.toUpperCase() === 'APPROVED' || order.status?.toUpperCase() === 'SOLD') && (
                  <TouchableOpacity 
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadReceipt(order)}
                    disabled={downloadingOrderId === order._id}
                  >
                    {downloadingOrderId === order._id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="download" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.downloadBtnText}>{t("my_orders.receipt_btn")}</Text>
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
export default MyOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  /* GRADIENT HEADER */
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  searchBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#1F2937',
    fontSize: 15,
  },

  orderCard: {
    backgroundColor: FARMER_COLORS.surface,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  orderId: {
    fontWeight: "700",
    color: FARMER_COLORS.textPrimary,
    fontSize: 16,
    letterSpacing: 0.2,
  },

  date: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },

  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.tintCard,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.2)',
  },
  
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: FARMER_COLORS.accent,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  approvedBg: {
    backgroundColor: "#D1FAE5",
  },

  pendingBg: {
    backgroundColor: FARMER_COLORS.secondary,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  itemRow: {
    marginBottom: 8,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },

  itemQty: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    marginTop: 2,
  },

  totalAmount: {
    fontWeight: "700",
    fontSize: 16,
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(142, 171, 83, 0.12)',
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  downloadBtnText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  noData: {
    textAlign: "center",
    marginTop: 48,
    color: FARMER_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});
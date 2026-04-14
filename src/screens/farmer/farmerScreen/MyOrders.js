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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
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

      if (!receiptId) {
        showAlert({ type: 'warning', title: 'No Receipt', message: 'Could not find a receipt for this order. Make sure the order was sold.' });
        return;
      }

      const { url, token } = await apiService.downloadReceipt(receiptId);
      const fileName = `Receipt_${order.orderId || receiptId}.pdf`;

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
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={FARMER_COLORS.primaryLight} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("my_orders.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.searchBox}>
          <Image style={styles.searchIcon} source={Images.Search} />
          <TextInput
            placeholder={t("my_orders.search_id")}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>

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
                        <Text style={styles.downloadBtnText}>Receipt</Text>
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
    zIndex: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },

  searchBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },

  searchIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: "#9CA3AF"
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 15,
  },

  orderCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  orderId: {
    fontWeight: "700",
    color: "#1F2937",
    fontSize: 15,
  },

  date: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    fontWeight: "500",
  },

  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  approvedBg: {
    backgroundColor: "#D1FAE5",
  },

  pendingBg: {
    backgroundColor: "#e2f0c9",
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
    color: "#374151"
  },

  itemQty: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  totalAmount: {
    fontWeight: "700",
    fontSize: 15,
    color: "#374151"
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.primaryLight,
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
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500"
  },
});
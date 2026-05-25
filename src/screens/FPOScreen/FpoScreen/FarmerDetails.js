import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // Distributor Steel Blue

const FarmerDetails = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState('');
  const { t } = useTranslation();

  const fetchFarmerDetails = async () => {
    if (!id) return;
    try {
      const response = await apiService.getAllFarmers();
      const farmers = Array.isArray(response) ? response : response?.data || [];
      const farmer = farmers.find(f => f._id === id);
      
      if (farmer) {
        const name = `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() || 'Unknown Farmer';
        setFarmerName(name);
      }
    } catch (error) {
      console.error('Fetch farmer details error:', error);
    }
  };

  const fetchOrders = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiService.getFarmerOrders(id);
      console.log('📦 Orders API Response:', JSON.stringify(response, null, 2));
      const ordersData = response?.data || response || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerDetails();
    fetchOrders();
  }, [id]);

  const renderOrderCard = ({ item }) => {
    const orderDate = new Date(item.placedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const statusColors = {
      SOLD: { bg: '#D1FAE5', color: '#059669', icon: 'checkmark-circle' },
      PENDING: { bg: '#FEF3C7', color: '#D97706', icon: 'time' },
      APPROVED: { bg: '#DBEAFE', color: '#2563EB', icon: 'checkmark-done-circle' },
      REJECTED: { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle' },
    };

    const statusStyle = statusColors[item.status] || statusColors.PENDING;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to order details if needed
        }}
      >
        {/* Order Header with ID and Amount */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdSection}>
            <View style={styles.orderIconBox}>
              <Icon name="receipt" size={20} color="#fff" />
            </View>
            <View style={styles.orderIdInfo}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>{item.orderId}</Text>
            </View>
          </View>
          
          <View style={styles.amountSection}>
            <Text style={styles.amountValue}>₹{item.finalAmount || 0}</Text>
            <View style={[styles.paymentBadge, { backgroundColor: item.paymentMethod === 'CASH' ? '#ECFDF5' : '#EFF6FF' }]}>
              <Icon 
                name={item.paymentMethod === 'CASH' ? 'cash' : 'card'} 
                size={12} 
                color={item.paymentMethod === 'CASH' ? '#059669' : '#2563EB'} 
              />
              <Text style={[styles.paymentText, { color: item.paymentMethod === 'CASH' ? '#059669' : '#2563EB' }]}>
                {item.paymentMethod || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusContainer, { backgroundColor: statusStyle.bg }]}>
          <Icon name={statusStyle.icon} size={16} color={statusStyle.color} />
          <Text style={[styles.statusLabel, { color: statusStyle.color }]}>
            {item.status}
          </Text>
        </View>

        {/* Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsHeader}>Order Items</Text>
          {item.items?.map((orderItem, index) => {
            const itemName = orderItem.item?.itemName || 'Unknown Item';
            const brand = orderItem.item?.brand || '';
            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemIconWrapper}>
                  <Icon name="cube" size={16} color={THEME} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{itemName}</Text>
                  {brand && <Text style={styles.itemBrand}>{brand}</Text>}
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
                    <Text style={styles.itemPrice}>₹{orderItem.expectedPrice || 0}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer with Date */}
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.dateText}>{orderDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          FPO_COLORS.primary,
          FPO_COLORS.primaryDark,
          FPO_COLORS.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {farmerName || t('farmer_orders') || 'Farmer Orders'}
            </Text>
            <Text style={styles.headerSub}>{orders.length} Orders Total</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {t('no_orders_found') || 'No orders found for this farmer.'}
          </Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item, index) => item.orderId || String(index)}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default FarmerDetails;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  /* HEADER */
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },

  listContainer: { padding: 20, paddingBottom: 40 },

  /* CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 0,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  
  /* Card Header */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderIdInfo: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderIdValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME,
    marginBottom: 4,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  /* Status */
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Items Section */
  itemsSection: {
    padding: 16,
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME,
  },

  /* Footer */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});

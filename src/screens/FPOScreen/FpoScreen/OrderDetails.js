import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const OrderDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, []),
  );

  const fetchOrders = async () => {
    try {
      const response = await apiService.getAllOrders();
      const orderData = response.data || [];
      setOrders(orderData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    selectedStatus === 'ALL'
      ? orders
      : orders.filter(order => order.status?.toUpperCase() === selectedStatus);

  const getStatusColor = status => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#F59E0B';
      case 'APPROVED':
        return '#10B981';
      case 'SOLD':
        return '#3B82F6'; // Adding blue for sold
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderOrder = ({ item }) => {
    const farmerName = `${item.farmer?.firstName || ''} ${
      item.farmer?.lastName || ''
    }`.trim();
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() => {
          console.log('Order clicked:', item);
          navigation.navigate('OrderUpdateDetails', { order: item });
        }}
      >
        {/* FARMER INFO */}
        <View style={styles.farmerRow}>
          <Icon name="person-circle" size={20} color={FPO_COLORS.primary} />
          <Text style={styles.farmerName}>{farmerName}</Text>
          <Text style={styles.phone}>({item.farmer?.phone})</Text>
        </View>

        {/* ORDER ID & DATE */}
        <View style={styles.infoRow}>
          <Text style={styles.orderId}>
            #{item.orderId || item._id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.date}>{formatDate(item.placedAt)}</Text>
        </View>

        {/* PAYMENT METHOD */}
        {item.paymentMethod && (
          <View style={styles.paymentMethodContainer}>
            <Icon
              name={
                item.paymentMethod.toUpperCase() === 'CREDIT'
                  ? 'card-outline'
                  : 'cash-outline'
              }
              size={16}
              color="#4B5563"
            />
            <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
          </View>
        )}

        {/* ITEMS */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsLabel}>{t('fpo_orders.ordered_items')}</Text>
          {item.items.map((orderItem, index) => (
            <View key={`${orderItem._id}-${index}`} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {orderItem.item?.itemName || t('fpo_orders.unknown_item')}
                {orderItem.item?.brand ? ` (${orderItem.item.brand})` : ''}
              </Text>
              <Text style={styles.itemDetails}>
                {orderItem.quantity}{' '}
                {orderItem.item?.unit || t('fpo_orders.unit')}(s) × ₹
                {orderItem.expectedPrice}
              </Text>
            </View>
          ))}
        </View>

        {/* TOTAL & STATUS */}
        <View style={styles.footer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`fpo_orders.${item.status?.toLowerCase()}`) || item.status}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            {t('fpo_orders.total')}: {item.totalAmount ?? item.totalPrice ?? item.finalAmount ?? 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* BEAUTIFUL HEADER */}
      <LinearGradient
        colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Icon name="receipt-outline" size={28} color="#fff" style={styles.headerIcon} />
            <View>
              <Text style={styles.headerTitle}>{t('fpo_orders.orders_title')}</Text>
              <Text style={styles.headerSubtitle}>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
              </Text>
            </View>
          </View>
          
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      {/* FILTER BUTTONS */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollProps}
        >
          {['ALL', 'PENDING', 'APPROVED', 'SOLD', 'REJECTED'].map(status => {
            const isActive = selectedStatus === status;

            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  isActive && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {t(`fpo_orders.${status.toLowerCase()}`) || status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ORDER LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FPO_COLORS.primary} />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('fpo_orders.no_orders_found')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  headerIcon: {
    marginRight: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
  },
  phone: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: FPO_COLORS.primary,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  itemRow: {
    marginBottom: 6,
    paddingLeft: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  filterScrollProps: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FPO_COLORS.primary,
  },

  activeFilterButton: {
    backgroundColor: FPO_COLORS.primary,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: FPO_COLORS.primary,
  },

  activeFilterText: {
    color: '#fff',
  },
});

export default OrderDetails;

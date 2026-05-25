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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STAFF_GOLD = '#F59E0B';
const STAFF_GOLD_BG = '#FFF4CC';
const STAFF_GOLD_DARK = '#B45309';
const FARMER_GREEN = '#10B981';
const FARMER_GREEN_BG = '#ECFDF5';
const FARMER_GREEN_DARK = '#047857';

const Orders = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [storedFarmerData, setStoredFarmerData] = useState({});

  // Function to retrieve stored farmer data by orderId with fallback to recent temp storage
  const getStoredFarmerDataByOrderId = async (orderId, orderTimestamp) => {
    try {
      // First try to get data by orderId
      const storedData = await AsyncStorage.getItem(`staff_order_${orderId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('📦 Retrieved stored farmer data by orderId:', parsedData);
        return parsedData;
      }
      
      // Fallback: Look for recent temp storage (within last 5 minutes)
      console.log('⚠️ No orderId-based data found, checking temp storage...');
      const allKeys = await AsyncStorage.getAllKeys();
      const tempKeys = allKeys.filter(key => key.startsWith('temp_staff_order_'));
      
      // Clean up old temp storage (older than 10 minutes)
      const now = Date.now();
      const keysToDelete = [];
      
      for (const tempKey of tempKeys) {
        try {
          const tempData = await AsyncStorage.getItem(tempKey);
          if (tempData) {
            const parsedTempData = JSON.parse(tempData);
            const timeDiff = Math.abs(new Date(orderTimestamp) - new Date(parsedTempData.timestamp));
            const ageInMinutes = (now - parsedTempData.timestamp) / (60 * 1000);
            
            // If temp data is within 5 minutes of order time, use it
            if (timeDiff < 5 * 60 * 1000) {
              console.log('✅ Using recent temp farmer data:', parsedTempData);
              return parsedTempData;
            }
            
            // Mark old temp keys for deletion (older than 10 minutes)
            if (ageInMinutes > 10) {
              keysToDelete.push(tempKey);
            }
          }
        } catch (tempError) {
          console.log('Error parsing temp data:', tempError);
          keysToDelete.push(tempKey); // Delete corrupted data
        }
      }
      
      // Clean up old temp storage
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log('🧹 Cleaned up old temp storage:', keysToDelete.length, 'keys');
      }
    } catch (error) {
      console.log('⚠️ Error retrieving farmer data by orderId:', error);
    }
    return null;
  };

  // Function to load all stored farmer data for current orders
  const loadStoredFarmerData = async (ordersList) => {
    const farmerDataMap = {};
    
    for (const order of ordersList) {
      // Check if this is a staff order by looking at farmer role
      if (order?.farmer?.role?.toLowerCase() === 'staff') {
        const orderId = order?.orderId;
        const orderTimestamp = order?.placedAt || order?.createdAt;
        
        if (orderId && !farmerDataMap[orderId]) {
          const storedData = await getStoredFarmerDataByOrderId(orderId, orderTimestamp);
          if (storedData) {
            farmerDataMap[orderId] = storedData;
          }
        }
      }
    }
    
    setStoredFarmerData(farmerDataMap);
    console.log('📦 Loaded stored farmer data map by orderId:', farmerDataMap);
  };

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
      
      // Load stored farmer data for staff orders
      await loadStoredFarmerData(orderData);
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
        return '#3B82F6';
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
    // Check if the farmer field contains a staff member (indicating staff placed order)
    const isStaffOrder = item?.farmer?.role?.toLowerCase() === 'staff';
    
    let farmerName = 'N/A';
    let farmerPhone = 'N/A';
    
    if (isStaffOrder) {
      // For staff orders, try to get farmer data from stored data using orderId
      const orderId = item?.orderId;
      
      if (orderId && storedFarmerData[orderId]) {
        const storedData = storedFarmerData[orderId];
        
        // Validate stored data
        if (storedData && (storedData.farmerName || storedData.farmerData)) {
          farmerName = storedData.farmerName || `${storedData.farmerData?.firstName || ''} ${storedData.farmerData?.lastName || ''}`.trim();
          farmerPhone = storedData.farmerData?.phone || 'N/A';
          
          // Final validation
          if (!farmerName || farmerName === '') {
            farmerName = 'Farmer Info Not Available';
          }
          
          console.log('✅ Using stored farmer data for orderId:', orderId, { farmerName, farmerPhone });
        } else {
          farmerName = 'Farmer Info Not Available';
          farmerPhone = 'N/A';
          console.log('⚠️ Invalid stored data structure for orderId:', orderId);
        }
      } else {
        // Fallback: Show that farmer info is not available
        farmerName = 'Farmer Info Not Available';
        farmerPhone = 'N/A';
        console.log('⚠️ No stored farmer data found for orderId:', orderId);
      }
    } else {
      // For farmer direct orders, use the farmer field
      const farmerSource = item?.farmer;
      const farmerNameFromParts = `${farmerSource?.firstName || ''} ${farmerSource?.lastName || ''}`.trim();
      farmerName = farmerSource?.name || farmerNameFromParts || 'N/A';
      farmerPhone = farmerSource?.phone || 'N/A';
    }
    const statusColor = getStatusColor(item.status);
    const orderTypeIcon = isStaffOrder ? 'business' : 'person';
    const orderTypeIconColor = isStaffOrder
      ? STAFF_GOLD_DARK
      : FARMER_GREEN_DARK;
    const orderTypeText = isStaffOrder
      ? '🏢 STAFF PLACED ORDER'
      : '👤 FARMER SELF ORDER';
    const farmerSectionLabel = isStaffOrder
      ? '👤 Order Placed For:'
      : '👤 Farmer:';
    const orderIdLabel =
      item?.orderId || (item?._id ? item._id.slice(-8).toUpperCase() : 'NA');

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          isStaffOrder ? styles.staffOrderCard : styles.farmerOrderCard,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('OrderDetails', { order: item });
        }}
      >
        {/* Order Type Header */}
        <View
          style={[
            styles.orderTypeHeader,
            isStaffOrder ? styles.staffOrderHeader : styles.farmerOrderHeader,
          ]}
        >
          <View style={styles.orderTypeLeft}>
            <Icon name={orderTypeIcon} size={16} color={orderTypeIconColor} />
            <Text
              style={[
                styles.orderTypeText,
                isStaffOrder
                  ? styles.staffOrderTypeText
                  : styles.farmerOrderTypeText,
              ]}
            >
              {orderTypeText}
            </Text>
          </View>
          <Text style={styles.orderId}>#{orderIdLabel}</Text>
        </View>

        {/* Farmer Information */}
        <View style={styles.farmerSection}>
          <View style={styles.farmerHeader}>
            <Icon name="person-circle" size={20} color={'#374151'} />
            <Text style={styles.farmerSectionTitle}>{farmerSectionLabel}</Text>
          </View>

          <View style={styles.farmerDetails}>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <View style={styles.contactRow}>
              <Icon name="call" size={14} color="#6B7280" />
              <Text style={styles.phone}>{farmerPhone}</Text>
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoRow}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={14} color="#6B7280" />
            <Text style={styles.date}>{formatDate(item.placedAt)}</Text>
          </View>

          {item.paymentMethod && (
            <View style={styles.paymentMethodContainer}>
              <Icon
                name={
                  item.paymentMethod.toUpperCase() === 'CREDIT'
                    ? 'card-outline'
                    : 'cash-outline'
                }
                size={14}
                color="#4B5563"
              />
              <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsLabel}>{t('my_orders.ordered_items')}</Text>
          {item.items.map((orderItem, index) => (
            <View key={`${orderItem._id}-${index}`} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {orderItem.item?.itemName || t('my_orders.unknown_item')}
                {orderItem.item?.brand ? ` (${orderItem.item.brand})` : ''}
              </Text>
              <Text style={styles.itemDetails}>
                {orderItem.quantity}{' '}
                {orderItem.item?.unit || t('my_orders.unit')}(s) × ₹
                {orderItem.expectedPrice}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`my_orders.${item.status?.toLowerCase()}`) || item.status}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            {t('my_orders.total')}: {item.totalAmount ?? item.totalPrice ?? item.finalAmount ?? 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('my_orders.orders_title')}</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddFarmerOrder')}
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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
                  {t(`my_orders.${status.toLowerCase()}`) || status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={item =>
            item._id?.toString() || item.orderId?.toString()
          }
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('my_orders.no_orders_found')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    marginBottom: 14,
    elevation: 2,
    overflow: 'hidden',
  },
  staffOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: STAFF_GOLD,
  },
  farmerOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: FARMER_GREEN,
  },
  orderTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 0,
  },
  staffOrderHeader: {
    backgroundColor: STAFF_GOLD_BG,
    borderBottomWidth: 1,
    borderBottomColor: STAFF_GOLD,
  },
  farmerOrderHeader: {
    backgroundColor: FARMER_GREEN_BG,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_GREEN,
  },
  orderTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTypeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  staffOrderTypeText: {
    color: STAFF_GOLD_DARK,
  },
  farmerOrderTypeText: {
    color: FARMER_GREEN_DARK,
  },
  farmerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  farmerSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  farmerDetails: {
    paddingLeft: 26,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  farmerId: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
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
    borderColor: STAFF_COLORS.primary,
  },
  activeFilterButton: {
    backgroundColor: STAFF_COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: STAFF_COLORS.primary,
  },
  activeFilterText: {
    color: '#fff',
  },
});

export default Orders;

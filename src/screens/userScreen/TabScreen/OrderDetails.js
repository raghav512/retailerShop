import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';

const OrderDetails = ({ route, navigation }) => {
  const { order: routeOrder } = route?.params ?? {};
  const [order, setOrder] = useState(routeOrder);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (routeOrder?._id) {
        fetchOrderDetails(routeOrder._id);
      }
    }, [routeOrder?._id]),
  );

  const fetchOrderDetails = async orderId => {
    try {
      setLoading(true);
      const response = await apiService.getOrderById(orderId);
      setOrder(response?.data || routeOrder);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!routeOrder?._id) return;
    try {
      setRefreshing(true);
      const response = await apiService.getOrderById(routeOrder._id);
      setOrder(response?.data || routeOrder);
    } catch (error) {
      console.error('Failed to refresh order details:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${date.toLocaleDateString(
      'en-IN',
      options,
    )} • ${date.toLocaleTimeString('en-IN', timeOptions)}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backIconButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={STAFF_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[STAFF_COLORS.primary]}
              tintColor={STAFF_COLORS.primary}
            />
          }
        >
          {/* Customer Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{order?.user?.name ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon
                name="call-outline"
                size={20}
                color="#9CA3AF"
                style={styles.iconLabel}
              />
              <Text style={styles.phoneValue}>
                {order?.user?.phone ?? 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon
                name="location-outline"
                size={20}
                color="#9CA3AF"
                style={styles.iconLabel}
              />
              <View style={styles.addressContainer}>
                <Text style={styles.addressValue}>
                  {order?.user?.address ?? 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon
                name="cube-outline"
                size={20}
                color={STAFF_COLORS.textPrimary}
                style={styles.titleIcon}
              />
              <Text style={styles.cardTitle}>Order Items</Text>
            </View>

            {(order?.items ?? []).map((itemObj, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {itemObj?.item?.itemName ?? 'Unknown Item'}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    {itemObj?.quantity ?? 0} units × ₹
                    {itemObj?.item?.price?.toLocaleString('en-IN') ?? '0'}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ₹
                  {(
                    (itemObj?.quantity ?? 0) * (itemObj?.item?.price ?? 0)
                  ).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ₹
                {(
                  order?.totalAmount ??
                  order?.totalPrice ??
                  order?.finalAmount ??
                  0
                ).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Order Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Information</Text>

            <View style={styles.infoRow}>
              <Icon
                name="calendar-outline"
                size={20}
                color="#9CA3AF"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Order Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(order?.placedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="receipt-outline"
                size={20}
                color="#9CA3AF"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Order ID</Text>
                <Text style={styles.infoValue}>
                  {order?.orderId || order?._id?.slice(-8)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="card-outline"
                size={20}
                color="#9CA3AF"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>
                  {order?.paymentMethod?.toUpperCase() ?? 'CASH'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="checkmark-circle-outline"
                size={20}
                color="#9CA3AF"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    order?.status === 'APPROVED' || order?.status === 'SOLD'
                      ? styles.approvedBg
                      : styles.pendingBg,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      order?.status === 'APPROVED' || order?.status === 'SOLD'
                        ? { color: '#047857' }
                        : { color: STAFF_COLORS.accent },
                    ]}
                  >
                    {order?.status ?? 'PENDING'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: STAFF_COLORS.surface,
  },
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIcon: {
    marginRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: STAFF_COLORS.textSecondary,
    width: 80,
    marginTop: 2,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
  },
  iconLabel: {
    width: 32,
    marginTop: 2,
  },
  phoneValue: {
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
  },
  addressContainer: {
    flex: 1,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: STAFF_COLORS.tintMid,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: STAFF_COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    width: 32,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  approvedBg: {
    backgroundColor: '#D1FAE5',
  },
  pendingBg: {
    backgroundColor: STAFF_COLORS.tintCard,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: STAFF_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: STAFF_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

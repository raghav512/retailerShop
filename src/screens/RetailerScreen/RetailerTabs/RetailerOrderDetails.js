import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { RETAILER_COLORS, COLORS } from '../../../colorsList/ColorList';

const RetailerOrderDetails = ({ route, navigation }) => {
  const { order } = route?.params ?? {};

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${date.toLocaleDateString('en-IN', options)} • ${date.toLocaleTimeString('en-IN', timeOptions)}`;
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backIconButton,
            pressed && { opacity: 0.6, transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color={RETAILER_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Farmer Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farmer Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{order?.farmerName ?? 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="call-outline" size={20} color={RETAILER_COLORS.textSecondary} style={styles.iconLabel} />
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.phoneValue}>{order?.phone ?? 'N/A'}</Text>
            </Pressable>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-outline" size={20} color={RETAILER_COLORS.textSecondary} style={styles.iconLabel} />
            <View style={styles.addressContainer}>
              <Text style={styles.addressValue}>{order?.address ?? 'N/A'}</Text>
              <Text style={styles.cityValue}>{order?.city ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* Order Items Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Icon name="cube-outline" size={20} color={RETAILER_COLORS.primary} style={styles.titleIcon} />
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>

          {(order?.items ?? []).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item?.name ?? 'Unknown Item'}
                </Text>
                <Text style={styles.itemQuantity}>
                  {item?.quantity ?? 0} {item?.unit ?? 'units'} × ₹{item?.price?.toLocaleString('en-IN') ?? '0'}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ₹{((item?.quantity ?? 0) * (item?.price ?? 0)).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₹{order?.totalAmount?.toLocaleString('en-IN') ?? '0'}
            </Text>
          </View>
        </View>

        {/* Order Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Information</Text>

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color={RETAILER_COLORS.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>{formatDate(order?.orderDate)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="car-outline" size={20} color={RETAILER_COLORS.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Expected Delivery</Text>
              <Text style={styles.infoValue}>{formatDeliveryDate(order?.expectedDelivery)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RetailerOrderDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: RETAILER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: RETAILER_COLORS.tintMid,
    elevation: 2,
    shadowColor: RETAILER_COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  backIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: RETAILER_COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: RETAILER_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    shadowColor: RETAILER_COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    marginRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
    width: 80,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  iconLabel: {
    width: 32,
    marginTop: 2,
  },
  phoneValue: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.primary,
    letterSpacing: 0.2,
  },
  addressContainer: {
    flex: 1,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  cityValue: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  itemQuantity: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: RETAILER_COLORS.tintMid,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: RETAILER_COLORS.tintCard,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: RETAILER_COLORS.primary,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: RETAILER_COLORS.tintCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
  },
  infoIcon: {
    width: 32,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: RETAILER_COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: RETAILER_COLORS.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  backButton: {
    backgroundColor: RETAILER_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: RETAILER_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButtonText: {
    color: RETAILER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

/*
 * ─── API INTEGRATION GUIDE ──────────────────────────────
 * To fetch order details from API:
 *
 * 1. Add state and effect:
 *    const [order, setOrder] = useState(null);
 *    const [isLoading, setIsLoading] = useState(true);
 *    const orderId = route?.params?.orderId;
 *    
 *    useEffect(() => {
 *      fetchOrderDetails(orderId)
 *        .then(setOrder)
 *        .catch(handleError)
 *        .finally(() => setIsLoading(false));
 *    }, [orderId]);
 *
 * 2. Expected endpoint: GET /api/v1/retailer/orders/:orderId
 *    Response shape matches order object structure
 *
 * 3. Add loading skeleton while fetching
 * 4. All null checks already handle API nulls
 * ──────────────────────────────────────────────────────────
 */

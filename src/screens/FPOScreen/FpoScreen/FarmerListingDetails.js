import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // Distributor Steel Blue

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      { headers: { 'User-Agent': 'BeejseBazar' } }
    );
    const data = await response.json();
    const address = data.address;
    const city = address.city || address.town || address.village || address.county || '';
    const state = address.state || '';
    return city && state ? `${city}, ${state}` : city || state || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

const FarmerListingDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { listing } = route.params || {};
  const [loading, setLoading] = useState({ approve: false, reject: false });
  const locationText = listing?.userId?.village || 'N/A';

  const handleStatusUpdate = async status => {
    const loadingKey = status === 'approved' ? 'approve' : 'reject';
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      await apiService.updateCropListing(listing._id, { status });
      
      showAlert({
        type: 'success',
        title: t('success') || 'Success',
        message: t(`farmer_listing_details.listing_${status}`) || `Listing ${status} successfully`,
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error('Status update error:', error);
      showAlert({
        type: 'error',
        title: t('error') || 'Error',
        message:
          t('farmer_listing_details.failed_update_status') ||
          'Failed to update status',
      });
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const farmer =
    `${listing?.userId?.firstName || ''} ${
      listing?.userId?.lastName || ''
    }`.trim() ||
    t('farmer_listing_details.unknown') ||
    'Unknown Farmer';
  const code = listing?._id?.slice(-5).toUpperCase() || '-----';
  const crop = listing?.cropName || 'Unknown Crop';
  const variety = listing?.variety;
  const quantity = `${listing?.quantity || 0} ${
    t('farmer_listing_details.quintal') || 'Quintals'
  }`;
  const price = `₹${listing?.price || 0}`;
  const harvestDate = listing?.harvestDate
    ? new Date(listing.harvestDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown Date';

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
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
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('farmer_listing_details.title') || 'Listing Details'}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FARMER INFO CARD */}
        <View style={styles.card}>
          <View style={styles.farmerHeader}>
            <View style={styles.avatarBox}>
              <Icon name="person" size={24} color={THEME} />
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{farmer}</Text>
              <Text style={styles.farmerId}>ID: {code}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.smallIconBox}>
                <Icon name="leaf-outline" size={16} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Crop</Text>
                <Text style={styles.infoValue}>
                  {crop} {variety ? `(${variety})` : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.smallIconBox}>
                <Icon name="location-outline" size={16} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{locationText}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.smallIconBox}>
                <Icon name="scale-outline" size={16} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Quantity</Text>
                <Text style={styles.infoValue}>{quantity}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.smallIconBox}>
                <Icon name="calendar-outline" size={16} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.infoLabel}>
                  {t('farmer_listing_details.purchase_date') || 'Harvest Date'}
                </Text>
                <Text style={styles.infoValue}>{harvestDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalLabel}>
              {t('farmer_listing_details.total_amount') || 'Total Amount'}
            </Text>
            <Text style={styles.totalAmount}>{price}</Text>
          </View>
        </View>

        {/* UPDATE STATUS CARD */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="checkmark-circle" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('farmer_listing_details.update_status') || 'Update Status'}
            </Text>
          </View>

          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[styles.statusOption, { borderColor: '#10B981' }]}
              onPress={() => handleStatusUpdate('approved')}
              disabled={loading.approve || loading.reject}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="checkmark" size={20} color="#10B981" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: '#10B981' }]}>
                  {t('farmer_listing_details.approve') || 'Approve Listing'}
                </Text>
                <Text style={styles.statusDesc}>
                  {t('status.approved') || 'Mark as verified and accepted'}
                </Text>
              </View>
              {loading.approve && <ActivityIndicator size="small" color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, { borderColor: '#EF4444' }]}
              onPress={() => handleStatusUpdate('rejected')}
              disabled={loading.approve || loading.reject}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="close" size={20} color="#EF4444" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: '#EF4444' }]}>
                  {t('farmer_listing_details.reject') || 'Reject Listing'}
                </Text>
                <Text style={styles.statusDesc}>
                  {t('status.rejected') || 'Decline this listing application'}
                </Text>
              </View>
              {loading.reject && <ActivityIndicator size="small" color="#EF4444" />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmerListingDetails;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    alignItems: 'center',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  /* CARDS */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  /* FARMER INFO */
  farmerHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmerInfo: { marginLeft: 16 },
  farmerName: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  farmerId: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 4 },

  /* INFO ROWS */
  infoRow: { marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  smallIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, color: '#1F2937', fontWeight: '700' },

  /* AMOUNT BANNER */
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#059669' },

  /* ACTIONS */
  statusOptions: { marginTop: 4 },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: '700' },
  statusDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
});

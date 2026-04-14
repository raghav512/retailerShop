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
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // FPO Steel Blue

const FarmerListingDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { listing } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      await apiService.updateCropListing(listing._id, { status });
      showAlert({ 
        type: 'success', 
        title: t('success') || 'Success', 
        message: t('farmer_listing_details.listing_status_success', { status }) || `Listing marked as ${status}`, 
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] 
      });
    } catch (error) {
      console.error('Status update error:', error);
      showAlert({ 
        type: 'error', 
        title: t('error') || 'Error', 
        message: t('farmer_listing_details.failed_update_status') || 'Failed to update status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const farmer = `${listing?.userId?.firstName || ""} ${listing?.userId?.lastName || ""}`.trim() || t('farmer_listing_details.unknown') || "Unknown Farmer";
  const code = listing?._id?.slice(-5).toUpperCase() || "-----";
  const crop = listing?.cropName || "Unknown Crop";
  const variety = listing?.variety;
  const quantity = `${listing?.quantity || 0} ${t('farmer_listing_details.quintal') || 'Quintals'}`;
  const price = `₹${listing?.price || 0}`;
  const harvestDate = listing?.harvestDate 
    ? new Date(listing.harvestDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Unknown Date";
  
  const images = listing?.cropImages || [];

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farmer_listing_details.title') || "Listing Details"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
                <Text style={styles.infoValue}>{crop} {variety ? `(${variety})` : ''}</Text>
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
                <Text style={styles.infoLabel}>{t('farmer_listing_details.purchase_date') || "Harvest Date"}</Text>
                <Text style={styles.infoValue}>{harvestDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalLabel}>{t('farmer_listing_details.total_amount') || "Total Amount"}</Text>
            <Text style={styles.totalAmount}>{price}</Text>
          </View>
        </View>

        {/* IMAGES CARD */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="images" size={16} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t('farmer_listing_details.images') || 'Images'} ({images.length})</Text>
          </View>
          
          <View style={styles.imageGrid}>
            {images.length > 0 ? (
              images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.url || img }}
                  style={styles.cropImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image-outline" size={40} color="#D1D5DB" />
                <Text style={styles.noImageText}>{t('farmer_listing_details.no_images') || 'No images provided'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* UPDATE STATUS CARD */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="checkmark-circle" size={16} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t('farmer_listing_details.update_status') || 'Update Status'}</Text>
          </View>

          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[styles.statusOption, { borderColor: '#10B981' }]}
              onPress={() => handleStatusUpdate('approved')}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="checkmark" size={20} color="#10B981" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: '#10B981' }]}>{t('farmer_listing_details.approve') || 'Approve Listing'}</Text>
                <Text style={styles.statusDesc}>{t('status.approved') || 'Mark as verified and accepted'}</Text>
              </View>
              {loading && <ActivityIndicator size="small" color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, { borderColor: '#EF4444' }]}
              onPress={() => handleStatusUpdate('rejected')}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="close" size={20} color="#EF4444" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: '#EF4444' }]}>{t('farmer_listing_details.reject') || 'Reject Listing'}</Text>
                <Text style={styles.statusDesc}>{t('status.rejected') || 'Decline this listing application'}</Text>
              </View>
              {loading && <ActivityIndicator size="small" color="#EF4444" />}
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
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  /* CARDS */
  card: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EBF3F6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  /* FARMER INFO */
  farmerHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#EBF3F6', justifyContent: 'center', alignItems: 'center' },
  farmerInfo: { marginLeft: 16 },
  farmerName: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  farmerId: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 4 },

  /* INFO ROWS */
  infoRow: { marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  smallIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1F2937', fontWeight: '700' },

  /* AMOUNT BANNER */
  totalAmountContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#D1FAE5', padding: 16, borderRadius: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#A7F3D0'
  },
  totalLabel: { fontSize: 14, color: '#065F46', fontWeight: '600', textTransform: 'uppercase' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#059669' },

  /* IMAGES */
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cropImage: { width: '31%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#F3F4F6' },
  noImageContainer: { width: '100%', padding: 30, backgroundColor: '#FAFAFA', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  noImageText: { fontSize: 14, color: '#9CA3AF', marginTop: 12, fontWeight: '500' },

  /* ACTIONS */
  statusOptions: { marginTop: 4 },
  statusOption: {
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff',
    borderRadius: 16, marginBottom: 12, borderWidth: 1.5,
  },
  statusIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: '700' },
  statusDesc: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },
});

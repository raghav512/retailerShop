import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from "react-i18next";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const ListingDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { listing } = route.params || {};
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      await apiService.updateCropListing(listing._id, { status });
      const translatedStatus = t(`staff_listing_details.${status === 'approved' ? 'approved' : 'rejected'}`);
      showAlert({ type: 'success', title: t('success'), message: t('staff_listing_details.success_msg', { status: translatedStatus.toLowerCase() }), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('Status update error:', error);
      showAlert({ type: 'error', title: t('error'), message: t('staff_listing_details.err_failed') });
    } finally {
      setLoading(false);
    }
  };

  const farmer = `${listing?.userId?.firstName || ""} ${listing?.userId?.lastName || ""}`.trim() || t('staff_listing_details.unknown_farmer');
  const code = listing?._id?.slice(-5).toUpperCase();
  const crop = listing?.cropName;
  const variety = listing?.variety;
  const quantity = `${listing?.quantity} kg`;
  const price = `₹${listing?.price}`;
  const harvestDate = new Date(listing?.harvestDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const images = listing?.cropImages || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6A00" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('staff_listing_details.title')}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* FARMER INFO CARD */}
        <View style={styles.card}>
          <View style={styles.farmerHeader}>
            <Icon name="person-circle-outline" size={40} color="#FF6A00" />
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{farmer}</Text>
              <Text style={styles.farmerId}>{t('staff_listing_details.id')}: {code}</Text>
            </View>
          </View>

          <View style={styles.cropRow}>
            <Icon name="leaf-outline" size={16} color="#666" />
            <Text style={styles.cropText}>{crop} {variety ? `(${variety})` : ''} • {quantity}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="calendar-outline" size={14} color="#666" />
              <Text style={styles.infoLabel}>{t('staff_listing_details.purchase_date')}</Text>
            </View>
            <Text style={styles.infoValue}>{harvestDate}</Text>
          </View>

          <View style={styles.infoRowGreen}>
            <Text style={styles.totalLabel}>{t('staff_listing_details.total_amount')}</Text>
            <Text style={styles.totalAmount}>{price}</Text>
          </View>
        </View>

        {/* IMAGES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('staff_listing_details.images')} ({images.length})</Text>
          <View style={styles.imageGrid}>
            {images.length > 0 ? (
              images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.url }}
                  style={styles.cropImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image-outline" size={50} color="#ccc" />
                <Text style={styles.noImageText}>{t('staff_listing_details.no_images')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* UPDATE STATUS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('staff_listing_details.update_status')}</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity 
              style={styles.statusOption}
              onPress={() => handleStatusUpdate('approved')}
              disabled={loading}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="checkmark" size={20} color="#10B981" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>{t('staff_listing_details.approve')}</Text>
                <Text style={styles.statusDesc}>{t('staff_listing_details.approved')}</Text>
              </View>
              {loading && <ActivityIndicator size="small" color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statusOption}
              onPress={() => handleStatusUpdate('rejected')}
              disabled={loading}
            >
              <View style={[styles.statusIcon, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="close" size={20} color="#EF4444" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>{t('staff_listing_details.reject')}</Text>
                <Text style={styles.statusDesc}>{t('staff_listing_details.rejected')}.</Text>
              </View>
              {loading && <ActivityIndicator size="small" color="#EF4444" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  header: {
    backgroundColor: '#FF6A00',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerInfo: {
    marginLeft: 12,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  farmerId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoRowGreen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: '#374151',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  imageGrid: {
    display: 'flex',
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'start',
    gap: 8,
    alignItems:'center'
  },
  imagePlaceholder: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropImage: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusOptions: {
    marginTop: 0,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ListingDetails;

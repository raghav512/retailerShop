import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
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

const FarmerListing = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationCache, setLocationCache] = useState({});
  const navigation = useNavigation();

  const getLocationText = async (location) => {
    if (!location) return 'N/A';
    
    let latitude, longitude;
    
    // Handle GeoJSON format: { type: "Point", coordinates: [lng, lat] }
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      [longitude, latitude] = location.coordinates;
    }
    // Handle array format: [lng, lat]
    else if (Array.isArray(location) && location.length >= 2) {
      [longitude, latitude] = location;
    }
    else {
      return 'N/A';
    }
    
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    if (locationCache[cacheKey]) {
      return locationCache[cacheKey];
    }
    
    const address = await reverseGeocode(latitude, longitude);
    setLocationCache(prev => ({ ...prev, [cacheKey]: address }));
    return address;
  };

  useEffect(() => {
    fetchListing();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchListing();
    }, []),
  );

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCropListings();
      const listings = response.data || response || [];
      
      // Sort by date - latest first (descending order)
      const sortedListings = listings.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.harvestDate || 0);
        const dateB = new Date(b.createdAt || b.harvestDate || 0);
        return dateB - dateA; // Latest first
      });
      
      // Preload locations
      for (const item of sortedListings) {
        if (item.location && Array.isArray(item.location)) {
          await getLocationText(item.location);
        }
      }
      
      setList(sortedListings);
    } catch (error) {
      console.log('LISTING API ERROR 👉', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = status => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#D1FAE5', color: '#10B981' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#EF4444' };
      default:
        return { bg: '#e2f0c9', color: '#F59E0B' };
    }
  };

  const renderItem = ({ item }) => {
    const farmer =
      `${item.userId?.firstName || ''} ${item.userId?.lastName || ''}`.trim() ||
      t('farmer_listing_details.unknown') ||
      'Unknown Farmer';
    const code = item._id?.slice(-5).toUpperCase();
    const crop = item.cropName || 'N/A';
    const quantity = `${item.quantity || 0} ${
      t('farmer_listing_details.quintal') || 'Quintals'
    }`;
    const amount = `₹${item.price || 0}`;
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const statusStyle = getStatusStyle(item.status);
    const imageUrl = item.cropImages?.[0]?.url || null;
    
    const locationText = item.userId?.village || 'N/A';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('FarmerListingDetails', { listing: item })
        }
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.cropImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Icon name="leaf" size={18} color={THEME} />
            </View>
            <View>
              <Text style={styles.cropName}>{crop}</Text>
              <Text style={styles.code}>ID: {code}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>
              {item.status || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>{t('common.amount') || 'Amount'}</Text>
            <Text style={styles.amount}>{amount}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{quantity}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Icon name="location" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{locationText}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.farmerRow}>
            <Icon name="person" size={14} color="#6B7280" />
            <Text style={styles.farmerName}>{farmer}</Text>
          </View>
          <Text style={styles.date}>{date}</Text>
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
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('farmer_listing') || 'Farmer Listings'}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      {/* LIST */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="document-text-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No listings found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default FarmerListing;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
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
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 12,
  },

  /* LIST */
  listContent: { padding: 16, paddingBottom: 40 },

  /* CARD */
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
    overflow: 'hidden',
  },

  cropImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  code: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoCol: { flex: 1 },
  label: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amount: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  value: { fontSize: 15, fontWeight: '700', color: '#1F2937' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 6,
  },
  farmerRow: { flexDirection: 'row', alignItems: 'center' },
  farmerName: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 6,
  },
  date: { fontSize: 12, fontWeight: '500', color: '#9CA3AF' },
});

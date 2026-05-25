import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary;

const AllActiveFarms = ({ navigation }) => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const fetchAllActiveFarms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllActiveFarms();
      console.log('📡 API Response:', response);

      // Response is directly the farms array from the API
      const farmsData = Array.isArray(response) ? response : [];

      console.log('✅ Parsed farms data:', farmsData.length, farmsData);
      setFarms(farmsData);
    } catch (error) {
      console.error('❌ Error fetching all active farms:', error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllActiveFarms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllActiveFarms();
    setRefreshing(false);
  };

  const renderFarmCard = ({ item }) => {
    const coordinates =
      item?.geojson?.geometry?.coordinates?.[0]?.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      })) || [];

    const region =
      coordinates.length > 0
        ? {
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : null;

    const farmerName =
      item.userId?.firstName || item.userId?.lastName
        ? `${item.userId.firstName || ''} ${item.userId.lastName || ''}`.trim()
        : item.userId?.phone ||
          item.farmerName ||
          item.farmer?.name ||
          'Unknown Farmer';
    const farmName = item.farmName || 'Unnamed Farm';
    const farmArea = item.farmArea || 0;
    const unit = item.unit || 'acre';
    const status = item.status || 'Active';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('FarmerDetails', { id: item.userId?._id });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Icon name="leaf" size={16} color={THEME} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmName} numberOfLines={1}>
                {farmName}
              </Text>
              <Text style={styles.farmerName} numberOfLines={1}>
                {farmerName}
              </Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.areaBox}>
            <Text style={styles.farmAreaValue}>{farmArea}</Text>
            <Text style={styles.farmAreaUnit}>{unit}</Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {region ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              mapType="satellite"
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {coordinates.length >= 3 && (
                <Polygon
                  coordinates={coordinates}
                  strokeColor={THEME}
                  fillColor={`${THEME}40`}
                  strokeWidth={2}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.noMapContainer}>
              <Icon name="map-outline" size={32} color="#D1D5DB" />
              <Text style={styles.noMapText}>
                {t('no_location_data') || 'No map data available'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Icon name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.markersText}>
            {coordinates.length} {t('farm_details.points') || 'Points'}
          </Text>
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
              {t('all_active_farms') || 'All Active Farms'}
            </Text>
            <Text style={styles.headerSub}>
              {farms.length} {t('farms_total') || 'Farms'}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="leaf-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {t('no_active_farms_found') || 'No active farms found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME}
            />
          }
        />
      )}
    </View>
  );
};

export default AllActiveFarms;

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
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },

  listContainer: { padding: 16, paddingBottom: 40 },

  /* CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#10B981' },

  areaBox: { alignItems: 'flex-end' },
  farmAreaValue: { fontSize: 18, fontWeight: '800', color: THEME },
  farmAreaUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },

  /* MAP */
  mapContainer: {
    height: 180,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  map: { ...StyleSheet.absoluteFillObject },
  noMapContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMapText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },

  /* FOOTER */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  markersText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },
});

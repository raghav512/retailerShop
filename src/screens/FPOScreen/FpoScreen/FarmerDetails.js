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
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // Distributor Steel Blue

const FarmerDetails = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchFarms = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiService.getFarmsByUserId(id);
      setFarms(response?.data || []);
    } catch (error) {
      console.error('Fetch farms error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [id]);

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

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Icon name="leaf" size={16} color={THEME} />
            </View>
            <View>
              <Text style={styles.farmName}>
                {item.farmName || 'Farm Name'}
              </Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status || 'Active'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.areaBox}>
            <Text style={styles.farmAreaValue}>{item.farmArea || 0}</Text>
            <Text style={styles.farmAreaUnit}>
              {item.unit || t('unit_acre') || 'Acre'}
            </Text>
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
                  fillColor={`${THEME}40`} // 25% opacity
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
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {t('farm_details_title') || 'Farmer Details'}
          </Text>
          <Text style={styles.headerSub}>{farms.length} Farms Total</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="leaf-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {t('no_farms_found') || 'No farms found for this farmer.'}
          </Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default FarmerDetails;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
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
  farmName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
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

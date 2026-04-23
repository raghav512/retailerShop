import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const THEME = FARMER_COLORS.primaryLight; // Farmer Gold

const FarmDetails = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { farmId } = route.params || {};
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmDetails = async () => {
      if (!farmId) {
        setLoading(false);
        return;
      }
      try {
        const response = await apiService.getFarmByFarmId(farmId);
        setFarm(response?.data);
      } catch (error) {
        console.error('Fetch farm details error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmDetails();
  }, [farmId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ActivityIndicator size="large" color={FARMER_COLORS.primary} />
      </View>
    );
  }

  const coordinates =
    farm?.geojson?.geometry?.coordinates?.[0]?.map(coord => ({
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
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={20} color={FARMER_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('farm_details.title', 'Farm Details')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* MAP CARD */}
        <View style={styles.mapCard}>
          {region ? (
            <View style={styles.mapContainer}>
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
                    strokeColor={FARMER_COLORS.primary}
                    fillColor={`${FARMER_COLORS.primary}40`} // 40 is hex for 25% opacity
                    strokeWidth={2}
                  />
                )}
              </MapView>
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <Icon name="map-outline" size={48} color={FARMER_COLORS.textSecondary} />
              <Text style={styles.noMapText}>
                {t('farm_details.no_map_data', 'No map data available')}
              </Text>
            </View>
          )}

          <View style={styles.mapOverlay}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {farm?.status || t('farm_details.active', 'Active')}
              </Text>
            </View>
          </View>
        </View>

        {/* DETAILS CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="leaf" size={16} color={FARMER_COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              {farm?.farmName ||
                t('farm_details.farm_information', 'Farm Information')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.iconBox}>
                <Icon name="crop" size={16} color={FARMER_COLORS.textSecondary} />
              </View>
              <Text style={styles.label}>{t('farm_details.area', 'Area')}</Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valuePrimary}>{farm?.farmArea || 0}</Text>
              <Text style={styles.valueSecondary}>
                {farm?.unit || t('farm_details.unit_acre', 'Acre')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.iconBox}>
                <Icon name="map-marker-outline" size={16} color={FARMER_COLORS.textSecondary} />
              </View>
              <Text style={styles.label}>
                {t('farm_details.markers', 'Markers')}
              </Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valuePrimary}>{coordinates.length}</Text>
              <Text style={styles.valueSecondary}>
                {t('farm_details.points', 'Points')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmDetails;

// ==================== Premium Styles ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.background,
  },
  headerSpacer: {
    height: 6,
    backgroundColor: FARMER_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: FARMER_COLORS.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: FARMER_COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FARMER_COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  mapCard: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: FARMER_COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  noMapContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.tint,
  },
  noMapText: {
    marginTop: 12,
    fontSize: 14,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FARMER_COLORS.primary,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  sectionCard: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: FARMER_COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FARMER_COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.1,
  },
  valueBox: {
    alignItems: 'flex-end',
  },
  valuePrimary: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  valueSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: FARMER_COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

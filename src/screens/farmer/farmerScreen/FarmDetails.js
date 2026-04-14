import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StatusBar } from "react-native";
import MapView, { Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
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
        console.error("Fetch farm details error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmDetails();
  }, [farmId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <ActivityIndicator size="large" color={THEME} />
      </View>
    );
  }

  const coordinates = farm?.geojson?.geometry?.coordinates?.[0]?.map(coord => ({
    latitude: coord[1],
    longitude: coord[0],
  })) || [];

  const region = coordinates.length > 0 ? {
    latitude: coordinates[0].latitude,
    longitude: coordinates[0].longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : null;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("farm_details.title") || "Farm Details"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
                    strokeColor={THEME}
                    fillColor={`${THEME}40`} // 40 is hex for 25% opacity
                    strokeWidth={2}
                  />
                )}
              </MapView>
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <Icon name="map-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noMapText}>No map data available</Text>
            </View>
          )}
          
          <View style={styles.mapOverlay}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{farm?.status || "Active"}</Text>
            </View>
          </View>
        </View>

        {/* DETAILS CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="leaf" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>{farm?.farmName || "Farm Information"}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.iconBox}>
                <Icon name="scan-outline" size={16} color="#6B7280" />
              </View>
              <Text style={styles.label}>{t("farm_details.area") || "Area"}</Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valuePrimary}>{farm?.farmArea || 0}</Text>
              <Text style={styles.valueSecondary}>{farm?.unit || t("farm_details.unit_acre") || "Acre"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.iconBox}>
                <Icon name="location-outline" size={16} color="#6B7280" />
              </View>
              <Text style={styles.label}>{t("farm_details.markers") || "Markers"}</Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valuePrimary}>{coordinates.length}</Text>
              <Text style={styles.valueSecondary}>{t("farm_details.points") || "Points"}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default FarmDetails;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },
  loaderContainer: { flex: 1, backgroundColor: "#F4F6F8", justifyContent: "center", alignItems: "center" },

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

  /* MAP CARD */
  mapCard: {
    backgroundColor: "#ffffff", borderRadius: 24, overflow: "hidden",
    marginBottom: 20, elevation: 6, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    position: 'relative'
  },
  mapContainer: { height: 260, width: "100%" },
  map: { ...StyleSheet.absoluteFillObject },
  
  noMapContainer: { height: 260, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAFA" },
  noMapText: { marginTop: 12, fontSize: 14, color: "#9CA3AF", fontWeight: "500" },

  mapOverlay: { position: 'absolute', top: 16, right: 16 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#1F2937' },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: "#FFFBEB",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937" },

  /* DETAILS */
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  detailLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 12 },
  label: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  
  valueBox: { alignItems: "flex-end" },
  valuePrimary: { fontSize: 16, fontWeight: "800", color: "#1F2937" },
  valueSecondary: { fontSize: 12, color: THEME, fontWeight: "700", marginTop: 2 },
});

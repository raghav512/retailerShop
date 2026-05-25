import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { GOOGLE_MAPS_API_KEY } from '../../../config';
import apiService from '../../../Redux/apiService';
import { getUserData, getAccessToken } from '../../../Redux/Storage';
import { decode as base64Decode } from 'base-64';
import { useTranslation } from 'react-i18next';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const AddFarm = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmArea, setFarmArea] = useState(0);
  const [unit, setUnit] = useState('acre');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const initLocation = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        getCurrentLocation();
      }
    };
    initLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setRegion(prev => ({ ...prev, latitude, longitude }));
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          1000,
        );
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  };

  const handleMapPress = e => {
    setMarkers([...markers, e.nativeEvent.coordinate]);
  };

  const removeLastMarker = () => {
    if (markers.length > 0) {
      setMarkers(markers.slice(0, -1));
    }
  };

  const calculateArea = coordinates => {
    if (coordinates.length < 3) return 0;
    const earthRadius = 6371000;
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const lat1 = (coordinates[i].latitude * Math.PI) / 180;
      const lat2 = (coordinates[j].latitude * Math.PI) / 180;
      const lng1 = (coordinates[i].longitude * Math.PI) / 180;
      const lng2 = (coordinates[j].longitude * Math.PI) / 180;
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs((area * earthRadius * earthRadius) / 2);
    return area / 4046.86;
  };

  const handleNext = () => {
    if (markers.length < 3) {
      showAlert({
        type: 'warning',
        title: t('add_farm.insufficient_markers_title'),
        message: t('add_farm.insufficient_markers_msg'),
      });
      return;
    }
    const calculatedArea = calculateArea(markers);
    setFarmArea(calculatedArea);
    setShowModal(true);
  };

  const handleUnitChange = newUnit => {
    if (newUnit !== unit) {
      const converted =
        unit === 'acre' ? farmArea * 0.404686 : farmArea / 0.404686;
      setFarmArea(converted);
      setUnit(newUnit);
    }
  };

  const handleSaveFarm = async () => {
    if (!farmName.trim()) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('add_farm.fill_name'),
      });
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        showAlert({
          type: 'warning',
          title: t('error'),
          message: t('add_farm.login_required'),
        });
        setLoading(false);
        return;
      }

      // Decode JWT to get userId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = base64Decode(base64);
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.id;

      console.log('🆔 Extracted userId from token:', userId);
      if (!userId) {
        showAlert({
          type: 'error',
          title: t('error'),
          message: t('add_farm.user_id_not_found'),
        });
        setLoading(false);
        return;
      }
      const payload = {
        userId: userId,
        farmName: farmName,
        farmArea: parseFloat(farmArea.toFixed(2)),
        unit: unit,
        geojson: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [markers.map(m => [m.longitude, m.latitude])],
          },
        },
      };

      console.log('📍 Sending farm data:', payload);
      const response = await apiService.addFarm(payload);
      console.log('✅ Farm added response:', response);
      showAlert({
        type: 'success',
        title: t('success'),
        message: t('add_farm.success'),
      });
      navigation.goBack();
    } catch (error) {
      console.error('❌ Farm add error:', error.response?.data);
      showAlert({
        type: 'error',
        title: t('error'),
        message: error.response?.data?.message || t('add_farm.failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchText.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchText,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FARMER_COLORS.primary}
        translucent={false}
      />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('add_farm.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('add_farm.search_placeholder')}
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchLocation}
        />
        <TouchableOpacity
          onPress={searchLocation}
          style={styles.searchButton}
          activeOpacity={0.7}
        >
          <Icon name="search" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={styles.locationButton}
          activeOpacity={0.7}
        >
          <Icon name="locate" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        mapType="satellite"
        showsUserLocation
        showsMyLocationButton={false}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title={t('add_farm.your_location')}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            pinColor={index === 0 ? 'red' : 'blue'}
          />
        ))}
        {markers.length >= 3 && (
          <Polygon
            coordinates={markers}
            strokeColor="#FF0000"
            fillColor="rgba(255,0,0,0.3)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {markers.length > 0 && (
        <TouchableOpacity
          onPress={removeLastMarker}
          style={styles.undoButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-undo" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>{t('add_farm.next')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.markerInfo}>
        <Text style={styles.markerInfoText}>
          {t('add_farm.markers_placed', { count: markers.length })}
        </Text>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('add_farm.title')}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('add_farm.enter_farm_name')}
              placeholderTextColor="#9CA3AF"
              value={farmName}
              onChangeText={setFarmName}
            />
            <TextInput
              style={styles.input}
              placeholder={t('add_farm.farm_area')}
              placeholderTextColor="#9CA3AF"
              value={farmArea.toFixed(2)}
              onChangeText={text => setFarmArea(parseFloat(text) || 0)}
              keyboardType="decimal-pad"
            />
            <View style={styles.unitContainer}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'acre' && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange('acre')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === 'acre' && styles.unitTextActive,
                  ]}
                >
                  {t('add_farm.acre')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'hectare' && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange('hectare')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === 'hectare' && styles.unitTextActive,
                  ]}
                >
                  {t('add_farm.hectare')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.nextModalButton}
                onPress={handleSaveFarm}
                disabled={loading}
              >
                <Text style={styles.nextModalButtonText}>
                  {loading ? t('add_farm.saving') : t('add_farm.next')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {t('add_farm.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddFarm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.primary,
  },
  /* GRADIENT HEADER */
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: FARMER_COLORS.primaryLight,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  map: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  undoButton: {
    position: 'absolute',
    right: 16,
    top: 190,
    width: 50,
    height: 50,
    backgroundColor: '#EF4444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  nextButton: {
    height: 56,
    backgroundColor: '#1F2937',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  markerInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  markerInfoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  input: {
    height: 56,
    backgroundColor: '#F9FAF8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    color: '#1F2937',
  },
  unitContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  unitButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAF8',
  },
  unitButtonActive: {
    backgroundColor: '#e2f0c9',
    borderColor: FARMER_COLORS.primaryLight,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  unitTextActive: {
    color: '#b49509',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  nextModalButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#1F2937',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import { getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import apiService from '../../../Redux/apiService';
import Icon from 'react-native-vector-icons/Ionicons';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const EditListing = () => {
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const primaryColor = FARMER_COLORS.primaryLight;  // Farmer - Golden Mustard
  
  const listing = route.params?.listing;

  useEffect(() => {
    if (listing) {
      setCropName(listing.cropName || "");
      setVariety(listing.variety || "");
      setQuantity(listing.quantity?.toString() || "");
      setPrice(listing.price?.toString() || "");
      
      if (listing.location) {
        if (Array.isArray(listing.location)) {
          setLocation(`${listing.location[1]}, ${listing.location[0]}`);
          setCurrentLocation({ latitude: listing.location[1], longitude: listing.location[0] });
        } else if (typeof listing.location === 'string') {
          setLocation(listing.location);
        }
      }
    }
  }, [listing]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showAlert({ type: 'warning', title: 'Permission denied', message: 'Location permission is required' });
          setLocationLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          showAlert({ type: 'error', title: 'Error', message: 'Failed to get location' });
          setLocationLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } catch (error) {
      console.error('Permission error:', error);
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    if (selectedImages.length >= 5) {
      showAlert({ type: 'warning', title: 'Limit Reached', message: 'You can only select up to 5 images' });
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
        includeBase64: true,
      });

      if (!result.didCancel && !result.errorCode && result.assets && result.assets[0]) {
        setSelectedImages(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to open image picker' });
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!cropName || !variety || !quantity || !price) {
      showAlert({ type: 'warning', title: 'Error', message: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    
    try {
      const coords = currentLocation ? 
        [currentLocation.longitude, currentLocation.latitude] : 
        [73.9259, 18.5089];

      const updatePayload = {
        cropName: cropName.trim(),
        variety: variety.trim(),
        quantity: parseInt(quantity),
        price: parseFloat(price),
        location: coords
      };
      
      if (selectedImages.length > 0) {
        updatePayload.cropImages = selectedImages.map(img => 
          `data:${img.type};base64,${img.base64}`
        );
      }
      
      await apiService.updateCropListing(listing._id, updatePayload);
      
      showAlert({ type: 'success', title: 'Success', message: 'Listing updated successfully!', buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error("Update error:", error.message);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to update listing. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={FARMER_COLORS.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("create_listing.crop_info")}</Text>
        <TextInput 
          placeholder={t("create_listing.crop_name")} 
          value={cropName} 
          onChangeText={setCropName} 
          style={styles.input} 
          placeholderTextColor="#9CA3AF" 
        />
        <TextInput 
          placeholder={t("create_listing.variety")} 
          value={variety} 
          onChangeText={setVariety} 
          style={styles.input} 
          placeholderTextColor="#9CA3AF" 
        />
        <View style={styles.row}>
          <TextInput 
            placeholder={t("create_listing.quantity")} 
            value={quantity} 
            onChangeText={setQuantity} 
            keyboardType="numeric" 
            style={[styles.input, styles.halfInput]} 
            placeholderTextColor="#9CA3AF" 
          />
          <TextInput 
            placeholder={t("create_listing.price")} 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="numeric" 
            style={[styles.input, styles.halfInput]} 
            placeholderTextColor="#9CA3AF" 
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("create_listing.location")}</Text>
        <TextInput 
          placeholder={t("create_listing.enter_location")} 
          value={location} 
          onChangeText={setLocation} 
          style={styles.input} 
          placeholderTextColor="#9CA3AF" 
        />
        <TouchableOpacity style={[styles.locationBtn, locationLoading && styles.locationBtnDisabled]} onPress={getCurrentLocation} disabled={locationLoading}>
          {locationLoading ? <ActivityIndicator size="small" color={FARMER_COLORS.primaryLight} /> : <Icon name="location" size={20} color={FARMER_COLORS.primaryLight} />}
          <Text style={[styles.locationText, { color: FARMER_COLORS.primaryLight }]}>{locationLoading ? ' Getting location...' : ' Use current location'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload New Images ({selectedImages.length}/5)</Text>
        <Text style={styles.hint}>Add new images (optional)</Text>
        <View style={styles.imageContainer}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                <Icon name="close" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 5 && (
            <TouchableOpacity onPress={pickImage} style={[styles.addImageBtn, { borderColor: FARMER_COLORS.primaryLight }]}>
              <Icon name="camera" size={32} color={FARMER_COLORS.primaryLight} />
              <Text style={styles.uploadText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>Update Listing</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditListing;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6, backgroundColor: '#ffffff',
  },
  container: { 
    flex: 1, 
    backgroundColor: "#F4F6F8" 
  },
  header: { 
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    flexDirection: "row", 
    alignItems: "center",
    zIndex: 10,
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#FEF9E7", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 16 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#1F2937",
    letterSpacing: 0.5 
  },
  card: { 
    backgroundColor: "#ffffff", 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 16, 
    padding: 18, 
    shadowColor: "#000", 
    shadowOpacity: 0.04, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 2 },
    elevation: 2 
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#374151", 
    marginBottom: 6 
  },
  hint: { 
    fontSize: 13, 
    color: "#6B7280", 
    marginBottom: 14, 
    fontStyle: "italic",
    fontWeight: "500"
  },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: "#E5E7EB", 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    color: "#1F2937", 
    marginBottom: 14, 
    backgroundColor: "#F9FAF8",
    fontWeight: "600"
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  halfInput: { 
    width: "48%" 
  },
  locationBtn: { 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: "#FEF9E7", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 6, 
    gap: 8 
  },
  locationText: { 
    fontSize: 14, 
    fontWeight: "700" 
  },
  imageContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12 
  },
  imageWrapper: { 
    position: "relative" 
  },
  addImageBtn: { 
    width: 90, 
    height: 90, 
    borderRadius: 14, 
    backgroundColor: "#FEF9E7", 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 2, 
    borderStyle: "dashed" 
  },
  uploadText: { 
    fontSize: 13, 
    color: "#6B7280", 
    textAlign: "center", 
    marginTop: 6,
    fontWeight: "600"
  },
  selectedImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 14 
  },
  removeImageBtn: { 
    position: 'absolute', 
    top: -8, 
    right: -8, 
    backgroundColor: '#EF4444', 
    borderRadius: 12, 
    width: 24, 
    height: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  submitBtn: { 
    marginHorizontal: 16, 
    marginTop: 24, 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: "center",
    backgroundColor: "#1F2937",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  submitText: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "700",
    letterSpacing: 0.5 
  },
  submitBtnDisabled: { 
    backgroundColor: "#9CA3AF" 
  },
  locationBtnDisabled: { 
    backgroundColor: "#F3F4F6" 
  },
});


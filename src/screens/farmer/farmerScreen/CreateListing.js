
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/Ionicons';

import Geolocation from '@react-native-community/geolocation';
import { getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import ImagePickerModal from '../../../common/reusableComponent/ImagePickerModal';
import imagePickerService from '../../../services/imagePickerService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const CreateListing = () => {
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // CHANGED: Store multiple images
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const navigation = useNavigation();
  const { t } = useTranslation();
  const primaryColor = FARMER_COLORS.primary;  // Farmer - Golden Mustard

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
          const defaultLat = 0;
          const defaultLng = 0;
          setCurrentLocation({ latitude: defaultLat, longitude: defaultLng });
          setLocation(`${defaultLat}, ${defaultLng} (Default)`);
          setLocationLoading(false);
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    } catch (error) {
      console.error('Permission error:', error);
      setLocationLoading(false);
    }
  };

  // Image picker - Gallery
  const pickImageFromGallery = async () => {
    if (selectedImages.length >= 5) {
      showAlert({ type: 'warning', title: 'Limit Reached', message: 'You can only select up to 5 images' });
      return;
    }

    const image = await imagePickerService.openGallery();
    if (image) {
      setSelectedImages(prev => [...prev, image]);
    }
  };

  // Image picker - Camera
  const pickImageFromCamera = async () => {
    if (selectedImages.length >= 5) {
      showAlert({ type: 'warning', title: 'Limit Reached', message: 'You can only select up to 5 images' });
      return;
    }

    const image = await imagePickerService.openCamera();
    if (image) {
      setSelectedImages(prev => [...prev, image]);
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
    
    if (selectedImages.length === 0) {
      showAlert({ type: 'warning', title: 'Error', message: 'Please select at least one image' });
      return;
    }

    setLoading(true);
    
    try {
      const coords = currentLocation ? 
        [currentLocation.longitude, currentLocation.latitude] : 
        [73.9259, 18.5089];

      const token = await getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/api/crop-listing/add`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropName: cropName.trim(),
          variety: variety.trim(),
          quantity: parseInt(quantity),
          price: parseFloat(price),
          harvestDate: new Date().toISOString().split('T')[0],
          location: coords,
          cropImages: imagePickerService.toBase64Array(selectedImages)
        })
      });
      
      const result = await response.json();
      console.log("Upload successful:", result);
      
      showAlert({ type: 'success', title: 'Success', message: 'Crop listing created successfully!', buttons: [{ text: 'OK', onPress: () => { setCropName(''); setVariety(''); setQuantity(''); setPrice(''); setLocation(''); setCurrentLocation(null); setSelectedImages([]); navigation.goBack(); } }] });
    } catch (error) {
      console.error("Upload error:", error.message);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to sell crop. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={FARMER_COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("create_listing.title")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("create_listing.crop_info")}</Text>
        <TextInput 
          placeholder={t("create_listing.crop_name")} 
          value={cropName} 
          onChangeText={setCropName} 
          style={styles.input} 
          placeholderTextColor="rgba(142, 171, 83, 0.5)" 
        />
        <TextInput 
          placeholder={t("create_listing.variety")} 
          value={variety} 
          onChangeText={setVariety} 
          style={styles.input} 
          placeholderTextColor="rgba(142, 171, 83, 0.5)" 
        />
        <View style={styles.row}>
          <TextInput 
            placeholder={t("create_listing.quantity")} 
            value={quantity} 
            onChangeText={setQuantity} 
            keyboardType="numeric" 
            style={[styles.input, styles.halfInput]} 
            placeholderTextColor="rgba(142, 171, 83, 0.5)" 
          />
          <TextInput 
            placeholder={t("create_listing.price")} 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="numeric" 
            style={[styles.input, styles.halfInput]} 
            placeholderTextColor="rgba(142, 171, 83, 0.5)" 
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
          placeholderTextColor="rgba(142, 171, 83, 0.5)" 
        />
        <TouchableOpacity style={[styles.locationBtn, locationLoading && styles.locationBtnDisabled]} onPress={getCurrentLocation} disabled={locationLoading}>
          {locationLoading ? <ActivityIndicator size="small" color={FARMER_COLORS.primary} /> : <Icon name="location" size={20} color={FARMER_COLORS.primary} />}
          <Text style={[styles.locationText, { color: FARMER_COLORS.primary }]}>{locationLoading ? ' Getting location...' : ' Use current location'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("create_listing.upload_images")} ({selectedImages.length}/5)</Text>
        <View style={styles.imageContainer}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => removeImage(index)}
              >
                <Icon name="close" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 5 && (
            <TouchableOpacity onPress={() => setShowImagePicker(true)} style={styles.addImageBtn}>
              <Icon name="camera" size={32} color={FARMER_COLORS.primary} />
              <Text style={styles.uploadText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCamera={pickImageFromCamera}
        onGallery={pickImageFromGallery}
      />

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>{t("create_listing.submit")}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateListing;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: FARMER_COLORS.background
  },
  header: { 
    backgroundColor: FARMER_COLORS.primary,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: "row", 
    alignItems: "center",
    zIndex: 10,
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255, 255, 255, 0.18)', 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 16 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.5 
  },
  card: { 
    backgroundColor: FARMER_COLORS.surface, 
    marginHorizontal: 20, 
    marginTop: 20, 
    borderRadius: 20, 
    padding: 20, 
    shadowColor: FARMER_COLORS.accent, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)'
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: FARMER_COLORS.textPrimary, 
    marginBottom: 16,
    letterSpacing: 0.3
  },
  input: { 
    height: 52, 
    borderWidth: 1, 
    borderColor: 'rgba(142, 171, 83, 0.2)', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    color: FARMER_COLORS.textPrimary, 
    marginBottom: 16, 
    backgroundColor: 'rgba(142, 171, 83, 0.05)',
    fontWeight: "500"
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  halfInput: { 
    width: "48%" 
  },
  locationBtn: { 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: 'rgba(142, 171, 83, 0.15)', 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 8, 
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.3)'
  },
  locationText: { 
    fontSize: 14, 
    fontWeight: "700",
    letterSpacing: 0.3
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
    borderRadius: 16, 
    backgroundColor: 'rgba(142, 171, 83, 0.1)', 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 2, 
    borderStyle: "dashed",
    borderColor: 'rgba(142, 171, 83, 0.4)'
  },
  uploadText: { 
    fontSize: 12, 
    color: FARMER_COLORS.textSecondary, 
    textAlign: "center", 
    marginTop: 6,
    fontWeight: "600"
  },
  selectedImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.2)'
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  submitBtn: { 
    marginHorizontal: 20, 
    marginTop: 28, 
    borderRadius: 24, 
    paddingVertical: 18, 
    alignItems: "center",
    backgroundColor: FARMER_COLORS.primary,
    elevation: 3,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  submitText: { 
    color: FARMER_COLORS.textOnPrimary, 
    fontSize: 16, 
    fontWeight: "700",
    letterSpacing: 0.5 
  },
  submitBtnDisabled: { 
    backgroundColor: 'rgba(142, 171, 83, 0.4)',
    opacity: 0.7
  },
  locationBtnDisabled: { 
    backgroundColor: 'rgba(142, 171, 83, 0.08)',
    opacity: 0.6
  },
});


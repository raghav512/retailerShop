import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from "../../../Redux/apiService";
import Geolocation from "@react-native-community/geolocation";
import { getAccessToken } from "../../../Redux/Storage";
import { API_BASE_URL } from "../../../config";
import { useTranslation } from "react-i18next";
import ImagePickerModal from "../../../common/reusableComponent/ImagePickerModal";
import imagePickerService from "../../../services/imagePickerService";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const StaffCreateListing = () => {
  /* ================= HOOKS (DO NOT MOVE) ================= */
  const { t } = useTranslation();
  const navigation = useNavigation();

  /* ================= FARMER ================= */
  const [farmers, setFarmers] = useState([]);
  const [showFarmerPicker, setShowFarmerPicker] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [selectedFarmerName, setSelectedFarmerName] = useState("");

  /* ================= FORM ================= */
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); // ⚠️ NEVER null
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const primaryColor = STAFF_COLORS.primary;

  /* ================= FETCH FARMERS ================= */
  const fetchFarmers = async () => {
    try {
      const res = await apiService.getAllFarmers();
      setFarmers(Array.isArray(res) ? res : []);
    } catch {
      showAlert({ type: 'error', title: t('error'), message: t('staff_create_listing.err_load_farmers') });
    }
  };

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmerId(farmer._id);
    setSelectedFarmerName(`${farmer.firstName} ${farmer.lastName}`);
    setShowFarmerPicker(false);
  };

  /* ================= LOCATION ================= */
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ latitude, longitude });
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationLoading(false);
        },
        () => setLocationLoading(false)
      );
    } catch {
      setLocationLoading(false);
    }
  };

  /* ================= IMAGE PICKER ================= */
  const pickImageFromGallery = async () => {
    if (selectedImages.length >= 5) {
      showAlert({ type: 'info', title: t('info'), message: t('staff_create_listing.err_max_images') });
      return;
    }

    const image = await imagePickerService.openGallery();
    if (image) {
      setSelectedImages((prev) => [...prev, image]);
    }
  };

  const pickImageFromCamera = async () => {
    if (selectedImages.length >= 5) {
      showAlert({ type: 'info', title: t('info'), message: t('staff_create_listing.err_max_images') });
      return;
    }

    const image = await imagePickerService.openCamera();
    if (image) {
      setSelectedImages((prev) => [...prev, image]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedFarmerId) {
      showAlert({ type: 'warning', title: t('error'), message: t('staff_create_listing.err_select_farmer') });
      return;
    }

    if (!cropName || !variety || !quantity || !price) {
      showAlert({ type: 'warning', title: t('error'), message: t('staff_create_listing.err_fill_all') });
      return;
    }

    if (selectedImages.length === 0) {
      showAlert({ type: 'warning', title: t('error'), message: t('staff_create_listing.err_min_image') });
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken();
      const coords = currentLocation
        ? [currentLocation.longitude, currentLocation.latitude]
        : [73.9259, 18.5089];

      const payload = {
        userId: selectedFarmerId,
        cropName: cropName.trim(),
        variety: variety.trim(),
        quantity: Number(quantity),
        price: Number(price),
        harvestDate: new Date().toISOString().split("T")[0],
        location: coords,
        cropImages: imagePickerService.toBase64Array(selectedImages),
      };

      await fetch(`${API_BASE_URL}/api/crop-listing/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      showAlert({ type: 'success', title: t('success'), message: t('staff_create_listing.success'), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch {
      showAlert({ type: 'error', title: t('error'), message: t('staff_create_listing.err_create_failed') });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('staff_create_listing.title')}</Text>
      </View>

      {/* FARMER */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('staff_create_listing.select_farmer')}</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => {
            fetchFarmers();
            setShowFarmerPicker(!showFarmerPicker);
          }}
        >
          <Text
            style={
              selectedFarmerId ? styles.inputText : styles.placeholderText
            }
          >
            {selectedFarmerName || t('staff_create_listing.tap_to_select')}
          </Text>
          <Text>▼</Text>
        </TouchableOpacity>

        {showFarmerPicker && (
          <View style={styles.dropdown}>
            {farmers.map((f) => (
              <TouchableOpacity
                key={f._id}
                style={styles.farmerItem}
                onPress={() => handleFarmerSelect(f)}
              >
                <Text style={styles.farmerName}>
                  {f.firstName} {f.lastName}
                </Text>
                <Text style={styles.phone}>{f.phone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* CROP INFO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('staff_create_listing.crop_info')}</Text>

        <TextInput
          placeholder={t('staff_create_listing.crop_name')}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={cropName}
          onChangeText={setCropName}
        />

        <TextInput
          placeholder={t('staff_create_listing.variety')}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={variety}
          onChangeText={setVariety}
        />

        <View style={styles.row}>
          <TextInput
            placeholder={t('staff_create_listing.quantity')}
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.half]}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <TextInput
            placeholder={t('staff_create_listing.price')}
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.half]}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>
      </View>

      {/* LOCATION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('staff_create_listing.location')}</Text>
        <TextInput
          placeholder={t('staff_create_listing.enter_location')}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
          {locationLoading ? (
            <ActivityIndicator color={primaryColor} />
          ) : (
            <>
              <Icon name="location-outline" size={18} color={primaryColor} />
              <Text style={{ color: primaryColor, marginLeft: 8 }}>{t('staff_create_listing.use_current_location')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* IMAGES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t('staff_create_listing.upload_images')} ({selectedImages.length}/5)
        </Text>

        <View style={styles.imageRow}>
          {selectedImages.map((img, i) => (
            <View key={i} style={styles.imageWrap}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.remove}
                onPress={() => removeImage(i)}
              >
                <Text style={{ color: "#fff" }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {selectedImages.length < 5 && (
            <TouchableOpacity style={styles.addImage} onPress={() => setShowImagePicker(true)}>
              <Icon name="camera-outline" size={28} color={STAFF_COLORS.primary} />
              <Text style={styles.addImageText}>{t('staff_create_listing.add_photo')}</Text>
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

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{t('staff_create_listing.submit')}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default StaffCreateListing;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: { backgroundColor: "#F9FAFB" },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: { fontSize: 28, color: "#fff", marginRight: 10 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: { fontWeight: "600", marginBottom: 10 },

  selector: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  placeholderText: { color: "#9CA3AF" },
  inputText: { color: "#111827" },

  dropdown: { marginTop: 10 },
  farmerItem: { paddingVertical: 10 },
  farmerName: { fontWeight: "600", color: "#111827" },
  phone: { color: "#6B7280" },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    color: "#111827",          // ✅ FIXED TEXT COLOR
    backgroundColor: "#fff",   // ✅ FIXED ANDROID ISSUE
  },

  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },

  locationBtn: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },

  imageRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  imageWrap: { position: "relative", margin: 5 },
  image: { width: 80, height: 80, borderRadius: 8 },
  remove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  addImage: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: STAFF_COLORS.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addImageText: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },

  submitBtn: {
    backgroundColor: STAFF_COLORS.primary,
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600" },
});

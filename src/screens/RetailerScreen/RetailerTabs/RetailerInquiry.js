import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  FlatList,
  Keyboard,
  ImageBackground,
  Linking,
  Platform,
  PermissionsAndroid,
  BackHandler,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

const INQUIRY_TYPES = ['Seeds', 'Fertilizer', 'Pesticide', 'Other'];
const UNITS = ['kg', 'litre', 'bag', 'ton'];
const CROPS = [
  'Cotton',
  'Wheat',
  'Rice',
  'Maize',
  'Sugarcane',
  'Soybean',
  'Groundnut',
  'Sunflower',
  'Mustard',
  'Chickpea',
  'Barley',
  'Millets',
  'Pulses',
  'Vegetables',
  'Fruits',
];

const RetailerInquiry = ({ navigation }) => {
  const { t } = useTranslation();
  const userData = useSelector(state => state.auth.userData?.user);

  const [formData, setFormData] = useState({
    inquiryType: '',
    productName: '',
    cropName: '',
    quantity: '',
    unit: 'kg',
    additionalNotes: '',
    photoUri: null,
    photoName: null,
    photoType: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const productInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (Keyboard.isVisible()) {
          Keyboard.dismiss();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inquiryType)
      newErrors.inquiryType = t('retailer_inquiry.select_inquiry_type');
    if (!formData.cropName) newErrors.cropName = t('retailer_inquiry.crop_required');
    if (!formData.quantity) newErrors.quantity = t('retailer_inquiry.quantity_required');
    else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0)
      newErrors.quantity = t('retailer_inquiry.quantity_invalid');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        inquiryType: formData.inquiryType,
        cropName: formData.cropName,
        requiredQuantity: Number(formData.quantity),
        quantityUnit: formData.unit,
      };

      if (formData.productName) {
        payload.productName = formData.productName;
      }

      if (formData.additionalNotes) {
        payload.additionalNotes = formData.additionalNotes;
      }

      if (__DEV__) {
        console.log(
          '[RetailerInquiry] JSON payload:',
          JSON.stringify(payload, null, 2),
        );
        if (formData.photoUri) {
          console.log(
            '[RetailerInquiry] Photo selected but not uploaded (backend multipart issue)',
          );
        }
      }

      const response = await apiService.submitRetailerInquiry(payload);

      if (__DEV__) {
        console.log(
          '[RetailerInquiry] Response:',
          JSON.stringify(response, null, 2),
        );
      }

      Alert.alert(t('retailer_inquiry.success'), t('retailer_inquiry.success_msg'), [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              inquiryType: '',
              productName: '',
              cropName: '',
              quantity: '',
              unit: 'kg',
              additionalNotes: '',
              photoUri: null,
              photoName: null,
              photoType: null,
            });
            setErrors({});
          },
        },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('[RetailerInquiry] Submit failed:', error);
        console.error('[RetailerInquiry] Response:', error.response?.data);
        console.error('[RetailerInquiry] Status:', error.response?.status);
      }
      Alert.alert(
        t('retailer_inquiry.error'),
        error?.response?.data?.message || t('retailer_inquiry.error_msg'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleCropSelect = crop => {
    updateField('cropName', crop);
    setIsCropModalVisible(false);
  };

  const openCropModal = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => setIsCropModalVisible(true));
  };

  const handleUnitSelect = unit => {
    updateField('unit', unit);
    setIsUnitModalVisible(false);
  };

  const openUnitModal = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => setIsUnitModalVisible(true));
  };

  const handleImagePicker = () => {
    Keyboard.dismiss();
    Alert.alert(
      t('retailer_inquiry.upload_photo_title'),
      t('retailer_inquiry.choose_option'),
      [
        {
          text: t('retailer_inquiry.camera'),
          onPress: () => openCamera(),
        },
        {
          text: t('retailer_inquiry.gallery'),
          onPress: () => openGallery(),
        },
        {
          text: t('retailer_inquiry.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        if (__DEV__) console.log('[RetailerInquiry] Camera permission denied');
        Alert.alert(
          t('retailer_inquiry.permission_denied'),
          t('retailer_inquiry.camera_permission_msg'),
          [
            { text: t('retailer_inquiry.cancel'), style: 'cancel' },
            { text: t('retailer_inquiry.open_settings'), onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse,
    );
  };

  const handleImageResponse = response => {
    if (response.didCancel) {
      if (__DEV__) console.log('[RetailerInquiry] Image picker cancelled');
      return;
    }

    if (response.errorCode) {
      if (__DEV__)
        console.error(
          '[RetailerInquiry] Image picker error:',
          response.errorMessage,
        );

      if (response.errorCode === 'permission') {
        Alert.alert(
          t('retailer_inquiry.permission_denied'),
          t('retailer_inquiry.photos_permission_msg'),
          [
            { text: t('retailer_inquiry.cancel'), style: 'cancel' },
            { text: t('retailer_inquiry.open_settings'), onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
      }
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      if (__DEV__) console.error('[RetailerInquiry] No image URI');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photoUri: asset.uri,
      photoName: asset.fileName ?? `photo_${Date.now()}.jpg`,
      photoType: asset.type ?? 'image/jpeg',
    }));

    if (__DEV__)
      console.log('[RetailerInquiry] Image selected:', asset.fileName);
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photoUri: null,
      photoName: null,
      photoType: null,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon
            name="arrow-left"
            size={24}
            color={RETAILER_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t('retailer_inquiry.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            {t('retailer_inquiry.inquiry_type_label')}{' '}
            <Text style={styles.required}>{t('retailer_inquiry.required')}</Text>
          </Text>
          <View style={styles.chipContainer}>
            {INQUIRY_TYPES.map(type => (
              <Pressable
                key={type}
                style={({ pressed }) => [
                  styles.chip,
                  formData.inquiryType === type && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => updateField('inquiryType', type)}
                accessibilityLabel={type}
                accessibilityRole="radio"
                accessibilityState={{ selected: formData.inquiryType === type }}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.inquiryType === type && styles.chipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.inquiryType && (
            <Text style={styles.errorText}>{errors.inquiryType}</Text>
          )}

          <Text style={styles.label}>{t('retailer_inquiry.product_name_label')}</Text>
          <TextInput
            ref={productInputRef}
            style={styles.input}
            placeholder={t('retailer_inquiry.product_name_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={formData.productName}
            onChangeText={val => updateField('productName', val)}
            accessibilityLabel="Product or input name"
            returnKeyType="next"
            onSubmitEditing={() => quantityInputRef.current?.focus()}
            blurOnSubmit={false}
          />

          <Text style={styles.label}>
            {t('retailer_inquiry.crop_label')}{' '}
            <Text style={styles.required}>{t('retailer_inquiry.required')}</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={openCropModal}
            activeOpacity={0.7}
            accessibilityLabel="Select crop for inquiry"
            accessibilityHint="Opens crop selection list"
          >
            <Text
              style={[
                styles.dropdownText,
                !formData.cropName && styles.dropdownPlaceholder,
              ]}
            >
              {formData.cropName || t('retailer_inquiry.select_crop')}
            </Text>
            <Icon
              name="chevron-down"
              size={20}
              color={RETAILER_COLORS.textSecondary}
            />
          </TouchableOpacity>
          {errors.cropName && (
            <Text style={styles.errorText}>{errors.cropName}</Text>
          )}

          <Text style={styles.label}>
            {t('retailer_inquiry.quantity_label')} <Text style={styles.required}>{t('retailer_inquiry.required')}</Text>
          </Text>
          <View style={styles.quantityRow}>
            <TextInput
              ref={quantityInputRef}
              style={[styles.input, styles.quantityInput]}
              placeholder={t('retailer_inquiry.quantity_placeholder')}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={val => updateField('quantity', val)}
              accessibilityLabel="Enter quantity"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              onBlur={() => {
                if (
                  formData.quantity &&
                  (isNaN(formData.quantity) || Number(formData.quantity) <= 0)
                ) {
                  setErrors(prev => ({
                    ...prev,
                    quantity: t('retailer_inquiry.quantity_invalid'),
                  }));
                }
              }}
            />
            <TouchableOpacity
              style={styles.unitDropdown}
              onPress={openUnitModal}
              activeOpacity={0.7}
              accessibilityLabel="Select unit"
              accessibilityHint="Opens unit selection list"
            >
              <Text style={styles.unitDropdownText}>{formData.unit}</Text>
              <Icon
                name="chevron-down"
                size={18}
                color={RETAILER_COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.quantity && (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          )}

          <Text style={styles.label}>{t('retailer_inquiry.notes_label')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('retailer_inquiry.notes_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.additionalNotes}
            onChangeText={val => updateField('additionalNotes', val)}
            blurOnSubmit={false}
            returnKeyType="done"
          />

          {/* <Text style={styles.label}>Upload Photo (Optional)</Text>
          {!formData.photoUri ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handleImagePicker}
              activeOpacity={0.7}
              accessibilityLabel="Upload photo for inquiry"
              accessibilityHint="Opens camera or gallery"
            >
              <Icon name="image-outline" size={48} color="#9CA3AF" />
              <Text style={styles.uploadText}>Tap to upload photo</Text>
            </TouchableOpacity>
          ) : (
            <ImageBackground
              source={{ uri: formData.photoUri }}
              style={styles.imagePreview}
              imageStyle={styles.imagePreviewImage}
              accessibilityLabel="Selected photo"
            >
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removePhoto}
                activeOpacity={0.8}
                accessibilityLabel="Remove photo"
                accessibilityRole="button"
              >
                <Icon name="close-circle" size={28} color="#EF4444" />
              </TouchableOpacity>
            </ImageBackground>
          )} */}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{t('retailer_inquiry.submit')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isCropModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCropModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsCropModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close crop selection"
          />
          <View
            style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('retailer_inquiry.select_crop')}</Text>
              <TouchableOpacity
                onPress={() => setIsCropModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close"
              >
                <Icon
                  name="close"
                  size={24}
                  color={RETAILER_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CROPS}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cropItem,
                    formData.cropName === item && styles.cropItemSelected,
                  ]}
                  onPress={() => handleCropSelect(item)}
                  activeOpacity={0.7}
                  accessibilityLabel={item}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.cropItemText,
                      formData.cropName === item && styles.cropItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.cropName === item && (
                    <Icon
                      name="check"
                      size={20}
                      color={RETAILER_COLORS.textOnPrimary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isUnitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsUnitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsUnitModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close unit selection"
          />
          <View
            style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('retailer_inquiry.select_unit')}</Text>
              <TouchableOpacity
                onPress={() => setIsUnitModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close"
              >
                <Icon
                  name="close"
                  size={24}
                  color={RETAILER_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={UNITS}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cropItem,
                    formData.unit === item && styles.cropItemSelected,
                  ]}
                  onPress={() => handleUnitSelect(item)}
                  activeOpacity={0.7}
                  accessibilityLabel={item}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.cropItemText,
                      formData.unit === item && styles.cropItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.unit === item && (
                    <Icon
                      name="check"
                      size={20}
                      color={RETAILER_COLORS.textOnPrimary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RetailerInquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: RETAILER_COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: RETAILER_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: RETAILER_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  required: {
    color: '#EF4444',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    backgroundColor: RETAILER_COLORS.tintCard,
    minWidth: '47%',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: RETAILER_COLORS.primary,
    borderColor: RETAILER_COLORS.primary,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: RETAILER_COLORS.textOnPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: RETAILER_COLORS.textPrimary,
    backgroundColor: RETAILER_COLORS.tintCard,
    letterSpacing: 0.2,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  unitDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: RETAILER_COLORS.tintCard,
    minHeight: 56,
  },
  unitDropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    letterSpacing: 0.1,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: RETAILER_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: RETAILER_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: RETAILER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: RETAILER_COLORS.tintCard,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 15,
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: RETAILER_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: RETAILER_COLORS.tintMid,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  cropItemSelected: {
    backgroundColor: RETAILER_COLORS.primary,
  },
  cropItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: RETAILER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  cropItemTextSelected: {
    color: RETAILER_COLORS.textOnPrimary,
    fontWeight: '600',
  },
  uploadArea: {
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  imagePreview: {
    height: 160,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  imagePreviewImage: {
    borderRadius: 16,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

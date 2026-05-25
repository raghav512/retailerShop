import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  InteractionManager,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../../Redux/apiService';
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const INQUIRY_TYPES = [
  { value: 'Seeds', labelKey: 'farmer_inquiry.seeds' },
  { value: 'Fertilizer', labelKey: 'farmer_inquiry.fertilizers' },
  { value: 'Pesticide', labelKey: 'farmer_inquiry.pesticides' },
  { value: 'Tools', labelKey: 'farmer_inquiry.tools' },
  { value: 'Other', labelKey: 'farmer_inquiry.other' },
];

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

const INITIAL_FORM_STATE = {
  farmerId: null,
  inquiryType: '',
  productName: '',
  cropName: '',
  quantity: '',
  unit: 'kg',
  additionalNotes: '',
  inquiryPhoto: null,
  inquiryPhotoUri: null,
  inquiryPhotoName: null,
  inquiryPhotoType: null,
};

const StaffInquiry = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [isFarmerModalVisible, setIsFarmerModalVisible] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [farmerSearchText, setFarmerSearchText] = useState('');

  const productInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const cropOpenTaskRef = useRef(null);
  const unitOpenTaskRef = useRef(null);
  const farmerOpenTaskRef = useRef(null);

  useEffect(() => {
    fetchFarmers();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (typeof Keyboard.isVisible === 'function' && Keyboard.isVisible()) {
          Keyboard.dismiss();
          return true;
        }
        return false;
      },
    );

    return () => {
      backHandler.remove();
      cropOpenTaskRef.current?.cancel?.();
      unitOpenTaskRef.current?.cancel?.();
      farmerOpenTaskRef.current?.cancel?.();
    };
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const fetchFarmers = async () => {
    console.log('📡 Fetching Farmers List');
    setFarmersLoading(true);
    try {
      const response = await apiService.getAllFarmers();
      console.log('✅ Farmers API Response:', response);
      const farmersList = Array.isArray(response) ? response : [];
      console.log('👨🌾 Parsed Farmers:', farmersList);
      setFarmers(farmersList);
    } catch (error) {
      console.log('❌ Farmer Fetch Error:', error);
      Alert.alert(
        t('farmer_inquiry.error'),
        'Failed to load farmers. Please try again.',
      );
    } finally {
      setFarmersLoading(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.farmerId) {
      nextErrors.farmerId = 'Please select a farmer';
    }
    if (!formData.inquiryType) {
      nextErrors.inquiryType = t('farmer_inquiry.select_inquiry_type');
    }
    // Skip crop validation for Tools inquiry type
    if (!formData.cropName && formData.inquiryType !== 'Tools') {
      nextErrors.cropName = t('farmer_inquiry.crop_required');
    }
    // Skip quantity validation for Tools inquiry type
    if (!formData.quantity && formData.inquiryType !== 'Tools') {
      nextErrors.quantity = t('farmer_inquiry.quantity_required');
    } else if (
      formData.quantity &&
      (isNaN(formData.quantity) || Number(formData.quantity) <= 0)
    ) {
      nextErrors.quantity = t('farmer_inquiry.quantity_invalid');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        farmerId: formData.farmerId,
        inquiryType: formData.inquiryType,
      };

      // Only include crop and quantity fields if inquiry type is not Tools
      if (formData.inquiryType !== 'Tools') {
        payload.cropName = formData.cropName;
        payload.requiredQuantity = Number(formData.quantity);
        payload.quantityUnit = formData.unit;
      } else {
        // For Tools inquiry, provide default/empty values to satisfy backend validation
        payload.cropName = 'N/A';
        payload.requiredQuantity = 0;
        payload.quantityUnit = 'piece';
      }

      console.log('📤 Inquiry Submit Payload:', payload);

      if (formData.productName) {
        payload.productName = formData.productName;
      }

      if (formData.additionalNotes) {
        payload.message = formData.additionalNotes;
      }

      if (formData.inquiryPhoto) {
        payload.inquiryPhoto = {
          uri: formData.inquiryPhoto,
          type: formData.inquiryPhotoType || 'image/jpeg',
          name: formData.inquiryPhotoName || 'inquiry_image.jpg',
        };
      }

      if (__DEV__) {
        console.log(
          '[StaffInquiry] JSON payload:',
          JSON.stringify(payload, null, 2),
        );
      }

      const response = await apiService.submitStaffInquiry(payload);

      if (__DEV__) {
        console.log(
          '[StaffInquiry] Response:',
          JSON.stringify(response, null, 2),
        );
      }

      Alert.alert(
        t('farmer_inquiry.success'),
        t('farmer_inquiry.success_msg'),
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData(INITIAL_FORM_STATE);
              setErrors({});
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      if (__DEV__) {
        console.error('[StaffInquiry] Submit failed:', error);
        console.error('[StaffInquiry] Response:', error.response?.data);
        console.error('[StaffInquiry] Status:', error.response?.status);
      }

      Alert.alert(
        t('farmer_inquiry.error'),
        error?.response?.data?.message || t('farmer_inquiry.error_msg'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCropSelect = crop => {
    updateField('cropName', crop);
    setIsCropModalVisible(false);
  };

  const openCropModal = () => {
    Keyboard.dismiss();
    cropOpenTaskRef.current?.cancel?.();
    cropOpenTaskRef.current = InteractionManager.runAfterInteractions(() => {
      setIsCropModalVisible(true);
    });
  };

  const handleUnitSelect = unit => {
    updateField('unit', unit);
    setIsUnitModalVisible(false);
  };

  const openUnitModal = () => {
    Keyboard.dismiss();
    unitOpenTaskRef.current?.cancel?.();
    unitOpenTaskRef.current = InteractionManager.runAfterInteractions(() => {
      setIsUnitModalVisible(true);
    });
  };

  const handleFarmerSelect = farmer => {
    console.log('🎯 Selected Farmer:', farmer);
    updateField('farmerId', farmer._id);
    setIsFarmerModalVisible(false);
    setFarmerSearchText('');
  };

  const openFarmerModal = () => {
    Keyboard.dismiss();
    farmerOpenTaskRef.current?.cancel?.();
    farmerOpenTaskRef.current = InteractionManager.runAfterInteractions(() => {
      setIsFarmerModalVisible(true);
    });
  };

  const getSelectedFarmerLabel = () => {
    if (!formData.farmerId) return null;
    const farmer = farmers.find(f => f._id === formData.farmerId);
    if (!farmer) return null;
    const fullName = `${farmer.firstName || ''} ${
      farmer.lastName || ''
    }`.trim();
    return fullName || `Farmer - ${farmer.phone}`;
  };

  const filteredFarmers = farmers.filter(farmer => {
    if (!farmerSearchText) return true;
    const searchLower = farmerSearchText.toLowerCase();
    const fullName = `${farmer.firstName || ''} ${
      farmer.lastName || ''
    }`.toLowerCase();
    const phone = (farmer.phone || '').toLowerCase();
    return fullName.includes(searchLower) || phone.includes(searchLower);
  });

  const handleImagePicker = () => {
    Keyboard.dismiss();
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 1280,
        includeBase64: false, // Don't include base64 for FormData
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert(
            t('farmer_inquiry.error'),
            response.errorMessage || t('farmer_inquiry.error_msg'),
          );
          return;
        }

        const asset = response.assets?.[0];

        if (!asset?.uri) {
          Alert.alert(
            t('farmer_inquiry.error'),
            t('farmer_inquiry.image_pick_error'),
          );
          return;
        }

        // Store the file URI for FormData upload
        setFormData(prev => ({
          ...prev,
          inquiryPhoto: asset.uri, // Use URI instead of base64
          inquiryPhotoUri: asset.uri,
          inquiryPhotoName: asset.fileName || `inquiry_${Date.now()}.jpg`,
          inquiryPhotoType: asset.type || 'image/jpeg',
        }));
      },
    );
  };

  const clearSelectedImage = () => {
    setFormData(prev => ({
      ...prev,
      inquiryPhoto: null,
      inquiryPhotoUri: null,
      inquiryPhotoName: null,
      inquiryPhotoType: null,
    }));
  };

  const modalContentInsetStyle = { paddingBottom: insets.bottom + 20 };
  const headerInsetStyle = {
    paddingTop: Math.max(insets.top, 6),
    paddingBottom: 10,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, headerInsetStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={STAFF_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('farmer_inquiry.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            Choose Your Farmer{' '}
            <Text style={styles.required}>{t('farmer_inquiry.required')}</Text>
          </Text>
          {farmersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={STAFF_COLORS.primary} />
              <Text style={styles.loadingText}>Loading farmers...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={openFarmerModal}
              activeOpacity={0.7}
              accessibilityLabel="Select farmer"
              accessibilityHint="Opens farmer selection list"
            >
              <Text
                style={[
                  styles.dropdownText,
                  !formData.farmerId && styles.dropdownPlaceholder,
                ]}
              >
                {getSelectedFarmerLabel() || 'Select a farmer'}
              </Text>
              <Icon
                name="chevron-down"
                size={20}
                color={STAFF_COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
          {errors.farmerId ? (
            <Text style={styles.errorText}>{errors.farmerId}</Text>
          ) : null}

          <Text style={styles.label}>
            {t('farmer_inquiry.inquiry_type_label')}{' '}
            <Text style={styles.required}>{t('farmer_inquiry.required')}</Text>
          </Text>

          <View style={styles.chipContainer}>
            {INQUIRY_TYPES.map(type => (
              <Pressable
                key={type.value}
                style={({ pressed }) => [
                  styles.chip,
                  formData.inquiryType === type.value && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => updateField('inquiryType', type.value)}
                accessibilityLabel={t(type.labelKey)}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: formData.inquiryType === type.value,
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.inquiryType === type.value &&
                      styles.chipTextSelected,
                  ]}
                >
                  {t(type.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.inquiryType ? (
            <Text style={styles.errorText}>{errors.inquiryType}</Text>
          ) : null}

          <Text style={styles.label}>
            {t('farmer_inquiry.product_name_label')}
          </Text>
          <TextInput
            ref={productInputRef}
            style={styles.input}
            placeholder={t('farmer_inquiry.product_name_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={formData.productName}
            onChangeText={value => updateField('productName', value)}
            accessibilityLabel="Product or input name"
            returnKeyType="next"
            onSubmitEditing={() => quantityInputRef.current?.focus()}
            blurOnSubmit={false}
          />

          {formData.inquiryType !== 'Tools' && (
            <>
              <Text style={styles.label}>
                {t('farmer_inquiry.crop_label')}{' '}
                <Text style={styles.required}>
                  {t('farmer_inquiry.required')}
                </Text>
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
                  {formData.cropName || t('farmer_inquiry.select_crop')}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={STAFF_COLORS.textSecondary}
                />
              </TouchableOpacity>
              {errors.cropName ? (
                <Text style={styles.errorText}>{errors.cropName}</Text>
              ) : null}
            </>
          )}

          {formData.inquiryType !== 'Tools' && (
            <>
              <Text style={styles.label}>
                {t('farmer_inquiry.quantity_label')}{' '}
                <Text style={styles.required}>
                  {t('farmer_inquiry.required')}
                </Text>
              </Text>
              <View style={styles.quantityRow}>
                <TextInput
                  ref={quantityInputRef}
                  style={[styles.input, styles.quantityInput]}
                  placeholder={t('farmer_inquiry.quantity_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={formData.quantity}
                  onChangeText={value => updateField('quantity', value)}
                  accessibilityLabel="Enter quantity"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  onBlur={() => {
                    if (
                      formData.quantity &&
                      (isNaN(formData.quantity) ||
                        Number(formData.quantity) <= 0)
                    ) {
                      setErrors(prev => ({
                        ...prev,
                        quantity: t('farmer_inquiry.quantity_invalid'),
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
                    color={STAFF_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.quantity ? (
                <Text style={styles.errorText}>{errors.quantity}</Text>
              ) : null}
            </>
          )}

          <Text style={styles.label}>{t('farmer_inquiry.notes_label')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('farmer_inquiry.notes_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.additionalNotes}
            onChangeText={value => updateField('additionalNotes', value)}
            blurOnSubmit={false}
            returnKeyType="done"
          />

          <Text style={styles.label}>{t('farmer_inquiry.photo_label')}</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handleImagePicker}
            activeOpacity={0.8}
          >
            {formData.inquiryPhotoUri ? (
              <View style={styles.uploadPreviewWrap}>
                <Image
                  source={{ uri: formData.inquiryPhotoUri }}
                  style={styles.uploadPreview}
                />
                <View style={styles.uploadMeta}>
                  <Text style={styles.uploadFileName} numberOfLines={1}>
                    {formData.inquiryPhotoName ||
                      t('farmer_inquiry.photo_upload')}
                  </Text>
                  <Text style={styles.uploadHint}>
                    {t('farmer_inquiry.photo_change')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={clearSelectedImage}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="close"
                    size={18}
                    color={STAFF_COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholderWrap}>
                <View style={styles.uploadIconWrap}>
                  <Icon
                    name="image-outline"
                    size={24}
                    color={STAFF_COLORS.textSecondary}
                  />
                </View>
                <View style={styles.uploadMeta}>
                  <Text style={styles.uploadPlaceholder}>
                    {t('farmer_inquiry.photo_upload')}
                  </Text>
                  <Text style={styles.uploadHint}>
                    {t('farmer_inquiry.photo_optional')}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
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
            <ActivityIndicator color={STAFF_COLORS.textPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('farmer_inquiry.submit')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isCropModalVisible}
        transparent
        statusBarTranslucent
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
          <View style={[styles.modalContent, modalContentInsetStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('farmer_inquiry.select_crop')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsCropModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close"
              >
                <Icon name="close" size={24} color={STAFF_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CROPS}
              style={styles.modalList}
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
                  {formData.cropName === item ? (
                    <Icon
                      name="check"
                      size={20}
                      color={STAFF_COLORS.textOnPrimary}
                    />
                  ) : null}
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
        statusBarTranslucent
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
          <View style={[styles.modalContent, modalContentInsetStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('farmer_inquiry.select_unit')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsUnitModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close"
              >
                <Icon name="close" size={24} color={STAFF_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={UNITS}
              style={styles.modalList}
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
                  {formData.unit === item ? (
                    <Icon
                      name="check"
                      size={20}
                      color={STAFF_COLORS.textOnPrimary}
                    />
                  ) : null}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFarmerModalVisible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setIsFarmerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsFarmerModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close farmer selection"
          />
          <View style={[styles.modalContent, modalContentInsetStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Farmer</Text>
              <TouchableOpacity
                onPress={() => setIsFarmerModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close"
              >
                <Icon name="close" size={24} color={STAFF_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Icon
                name="magnify"
                size={20}
                color={STAFF_COLORS.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or phone"
                placeholderTextColor="#9CA3AF"
                value={farmerSearchText}
                onChangeText={setFarmerSearchText}
              />
            </View>
            {filteredFarmers.length === 0 ? (
              <View style={styles.emptyFarmerContainer}>
                <Text style={styles.emptyFarmerText}>No farmers found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredFarmers}
                style={styles.modalList}
                keyExtractor={(item, index) => item._id || index.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const farmerLabel =
                    `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
                    `Farmer - ${item.phone}`;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.cropItem,
                        formData.farmerId === item._id &&
                          styles.cropItemSelected,
                      ]}
                      onPress={() => handleFarmerSelect(item)}
                      activeOpacity={0.7}
                      accessibilityLabel={farmerLabel}
                      accessibilityRole="button"
                    >
                      <View style={styles.farmerItemContent}>
                        <Text
                          style={[
                            styles.cropItemText,
                            formData.farmerId === item._id &&
                              styles.cropItemTextSelected,
                          ]}
                        >
                          {farmerLabel}
                        </Text>
                        {item.phone && (
                          <Text style={styles.farmerPhone}>{item.phone}</Text>
                        )}
                      </View>
                      {formData.farmerId === item._id ? (
                        <Icon
                          name="check"
                          size={20}
                          color={STAFF_COLORS.textOnPrimary}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StaffInquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: STAFF_COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: STAFF_COLORS.surface,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
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
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
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
    borderColor: STAFF_COLORS.tintMid,
    backgroundColor: STAFF_COLORS.tintCard,
    minWidth: '47%',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: STAFF_COLORS.primary,
    borderColor: STAFF_COLORS.primary,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: STAFF_COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
    backgroundColor: STAFF_COLORS.tintCard,
    letterSpacing: 0.2,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  uploadBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.tintCard,
    padding: 14,
  },
  uploadPlaceholderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadPreviewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: STAFF_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadPreview: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 12,
  },
  uploadMeta: {
    flex: 1,
  },
  uploadPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  uploadFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  uploadHint: {
    marginTop: 4,
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
  },
  removePhotoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STAFF_COLORS.surface,
    marginLeft: 10,
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
    borderColor: STAFF_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: STAFF_COLORS.tintCard,
    minHeight: 56,
  },
  unitDropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
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
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: STAFF_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: STAFF_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: STAFF_COLORS.tintCard,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
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
    backgroundColor: STAFF_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalList: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: STAFF_COLORS.tintMid,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: STAFF_COLORS.primary,
  },
  cropItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: STAFF_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  cropItemTextSelected: {
    color: STAFF_COLORS.textPrimary,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.tintCard,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: STAFF_COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: STAFF_COLORS.tintMid,
    backgroundColor: STAFF_COLORS.tintCard,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
  },
  emptyFarmerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFarmerText: {
    fontSize: 15,
    color: STAFF_COLORS.textSecondary,
  },
  farmerItemContent: {
    flex: 1,
  },
  farmerPhone: {
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
    marginTop: 2,
  },
});

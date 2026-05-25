import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  BackHandler,
  InteractionManager,
  Image,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../../Redux/apiService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const INQUIRY_TYPES = [
  { value: 'Seeds', labelKey: 'farmer_inquiry.seeds' },
  { value: 'Fertilizer', labelKey: 'farmer_inquiry.fertilizers' },
  { value: 'Pesticide', labelKey: 'farmer_inquiry.pesticides' },
  { value: 'Tools', labelKey: 'farmer_inquiry.tools' },
  { value: 'Other', labelKey: 'farmer_inquiry.other' },
];

const UNITS = ['kg', 'litre', 'bag', 'ton'];

// Complete crop master data with categories
export const cropCategories = ['Field Crops', 'Fruits', 'Vegetables'];

const cropsByCategory = {
  'Field Crops': [
    'Wheat',
    'Rice',
    'Maize',
    'Bajra',
    'Jowar',
    'Barley',
    'Ragi',
    'Foxtail Millet',
    'Little Millet',
    'Kodo Millet',
    'Cotton',
    'Sugarcane',
    'Soybean',
    'Groundnut',
    'Mustard',
    'Sunflower',
    'Sesame',
    'Castor',
    'Linseed',
    'Safflower',
    'Gram',
    'Tur',
    'Moong',
    'Urad',
    'Masoor',
    'Peas',
    'Tea',
    'Coffee',
    'Jute',
    'Tobacco',
  ],
  Fruits: [
    'Mango',
    'Banana',
    'Apple',
    'Orange',
    'Papaya',
    'Grapes',
    'Pomegranate',
    'Guava',
    'Pineapple',
    'Watermelon',
    'Muskmelon',
    'Litchi',
    'Coconut',
    'Sapota',
    'Pear',
    'Peach',
    'Plum',
    'Cherry',
    'Kiwi',
    'Dragon Fruit',
    'Strawberry',
    'Custard Apple',
    'Jackfruit',
    'Amla',
    'Fig',
    'Avocado',
    'Mulberry',
    'Lemon',
    'Sweet Lime',
  ],
  Vegetables: [
    'Potato',
    'Tomato',
    'Onion',
    'Brinjal',
    'Cabbage',
    'Cauliflower',
    'Carrot',
    'Radish',
    'Spinach',
    'Lady Finger',
    'Bottle Gourd',
    'Bitter Gourd',
    'Pumpkin',
    'Capsicum',
    'Green Chilli',
    'Beans',
    'Cucumber',
    'Garlic',
    'Ginger',
    'Beetroot',
    'Turnip',
    'Broccoli',
    'Mushroom',
    'Sweet Corn',
    'Zucchini',
    'Celery',
    'Lettuce',
    'Drumstick',
    'Ash Gourd',
  ],
};

export const cropMasterData = [
  ...cropsByCategory['Field Crops'],
  ...cropsByCategory['Fruits'],
  ...cropsByCategory['Vegetables'],
  'Other',
];

const FarmerInquiry = ({ navigation }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    inquiryType: '',
    productName: '',
    selectCrop: '',
    quantity: '',
    unit: 'kg',
    additionalNotes: '',
    inquiryPhoto: null,
    inquiryPhotoUri: null,
    inquiryPhotoName: null,
    inquiryPhotoType: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const insets = useSafeAreaInsets();

  const productInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const cropOpenTaskRef = useRef(null);
  const unitOpenTaskRef = useRef(null);

  useEffect(() => {
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
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inquiryType) {
      newErrors.inquiryType = t('farmer_inquiry.select_inquiry_type');
    }
    // Skip crop validation for Tools inquiry type
    if (!formData.selectCrop && formData.inquiryType !== 'Tools') {
      newErrors.selectCrop = t('farmer_inquiry.crop_required');
    }
    // Skip quantity validation for Tools inquiry type
    if (!formData.quantity && formData.inquiryType !== 'Tools') {
      newErrors.quantity = t('farmer_inquiry.quantity_required');
    } else if (
      formData.quantity &&
      (isNaN(formData.quantity) || Number(formData.quantity) <= 0)
    ) {
      newErrors.quantity = t('farmer_inquiry.quantity_invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Build payload with fallback values for all fields
      const payload = {
        inquiryType: formData.inquiryType || '',
        productName: formData.productName || '',
        cropName: formData.selectCrop || '',
        requiredQuantity: formData.quantity ? String(formData.quantity) : '0',
        quantityUnit: formData.unit || 'kg',
        message: formData.additionalNotes || '',
      };

      // For Tools inquiry type, provide relevant default values
      if (formData.inquiryType === 'Tools') {
        payload.cropName = 'Not Applicable';
        payload.requiredQuantity = 1;
        payload.quantityUnit = 'piece';
      }

      if (__DEV__) {
        console.log(
          '[FarmerInquiry] JSON payload:',
          JSON.stringify(payload, null, 2),
        );
      }

      const requestPayload = formData.inquiryPhotoUri
        ? {
            ...payload,
            inquiryPhoto: {
              uri: formData.inquiryPhotoUri,
              name: formData.inquiryPhotoName || `inquiry_${Date.now()}.jpg`,
              type: formData.inquiryPhotoType || 'image/jpeg',
            },
          }
        : payload;

      const response = await apiService.submitRetailerInquiry(requestPayload);

      if (__DEV__) {
        console.log(
          '[FarmerInquiry] Response:',
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
              setFormData({
                inquiryType: '',
                productName: '',
                selectCrop: '',
                quantity: '',
                unit: 'kg',
                additionalNotes: '',
                inquiryPhoto: null,
                inquiryPhotoUri: null,
                inquiryPhotoName: null,
                inquiryPhotoType: null,
              });
              setErrors({});
            },
          },
        ],
      );
    } catch (error) {
      if (__DEV__) {
        console.error('[FarmerInquiry] Submit failed:', error);
        console.error('[FarmerInquiry] Response:', error.response?.data);
        console.error('[FarmerInquiry] Status:', error.response?.status);
      }

      Alert.alert(
        t('farmer_inquiry.error'),
        error?.response?.data?.message || t('farmer_inquiry.error_msg'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCropSelect = crop => {
    if (crop === 'Other') {
      setShowCustomInput(true);
      setCustomCropName('');
    } else {
      updateField('selectCrop', crop);
      setShowCustomInput(false);
      setCustomCropName('');
      setIsCropModalVisible(false);
    }
  };

  const handleCustomCropSubmit = () => {
    const trimmedName = customCropName.trim();
    if (!trimmedName) {
      Alert.alert(
        t('farmer_inquiry.error'),
        t('farmer_inquiry.please_enter_crop_name'),
      );
      return;
    }
    updateField('selectCrop', trimmedName);
    setShowCustomInput(false);
    setCustomCropName('');
    setIsCropModalVisible(false);
  };

  const filteredCrops = useMemo(() => {
    let crops = cropMasterData;

    if (selectedCategory && cropsByCategory[selectedCategory]) {
      crops = cropsByCategory[selectedCategory];
    }

    if (searchText.trim()) {
      crops = crops.filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Always include "Other" option at the end
    if (!crops.includes('Other')) {
      crops = [...crops, 'Other'];
    }

    return crops;
  }, [selectedCategory, searchText]);

  const handleCategorySelect = category => {
    setSelectedCategory(category);
    setSearchText('');
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

  const handleImagePicker = () => {
    Keyboard.dismiss();
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 1280,
        includeBase64: true,
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

        if (!asset?.base64) {
          Alert.alert(
            t('farmer_inquiry.error'),
            t('farmer_inquiry.image_pick_error'),
          );
          return;
        }

        const mimeType = asset.type || 'image/jpeg';
        const photoData = `data:${mimeType};base64,${asset.base64}`;

        setFormData(prev => ({
          ...prev,
          inquiryPhoto: photoData,
          inquiryPhotoUri: asset.uri || null,
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
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
      
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IonIcon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{t('farmer_inquiry.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
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
          {errors.inquiryType && (
            <Text style={styles.errorText}>{errors.inquiryType}</Text>
          )}

          <Text style={styles.label}>
            {t('farmer_inquiry.product_name_label')}
          </Text>
          <TextInput
            ref={productInputRef}
            style={styles.input}
            placeholder={t('farmer_inquiry.product_name_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={formData.productName}
            onChangeText={val => updateField('productName', val)}
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
                onPress={() => {
                  Keyboard.dismiss();
                  cropOpenTaskRef.current?.cancel?.();
                  cropOpenTaskRef.current =
                    InteractionManager.runAfterInteractions(() => {
                      setIsCropModalVisible(true);
                      setSearchText('');
                      setSelectedCategory('');
                      setShowCustomInput(false);
                      setCustomCropName('');
                    });
                }}
                activeOpacity={0.7}
                accessibilityLabel="Select crop for inquiry"
                accessibilityHint="Opens crop selection list"
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.selectCrop && styles.dropdownPlaceholder,
                  ]}
                >
                  {formData.selectCrop || t('farmer_inquiry.select_crop')}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={FARMER_COLORS.textSecondary}
                />
              </TouchableOpacity>
              {errors.selectCrop && (
                <Text style={styles.errorText}>{errors.selectCrop}</Text>
              )}
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
                  onChangeText={val => updateField('quantity', val)}
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
                    color={FARMER_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.quantity && (
                <Text style={styles.errorText}>{errors.quantity}</Text>
              )}
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
            onChangeText={val => updateField('additionalNotes', val)}
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
                    color={FARMER_COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholderWrap}>
                <View style={styles.uploadIconWrap}>
                  <Icon
                    name="image-outline"
                    size={24}
                    color={FARMER_COLORS.textSecondary}
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
            <ActivityIndicator color="#FFFFFF" />
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
                <Icon
                  name="close"
                  size={24}
                  color={FARMER_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <View style={styles.categoryContainer}>
              {cropCategories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category &&
                      styles.categoryChipSelected,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category &&
                        styles.categoryChipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="#9CA3AF"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t('farmer_inquiry.search_crop')}
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Crop List */}
            <FlatList
              data={filteredCrops}
              style={styles.modalList}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cropItem,
                    formData.selectCrop === item && styles.cropItemSelected,
                  ]}
                  onPress={() => handleCropSelect(item)}
                  activeOpacity={0.7}
                  accessibilityLabel={item}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.cropItemText,
                      formData.selectCrop === item &&
                        styles.cropItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.selectCrop === item && (
                    <Icon
                      name="check"
                      size={20}
                      color={FARMER_COLORS.textOnPrimary}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultText}>
                    {t('farmer_inquiry.no_crop_found')}
                  </Text>
                  <TouchableOpacity
                    style={styles.otherOptionButton}
                    onPress={() => handleCropSelect('Other')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.otherOptionText}>
                      {t('farmer_inquiry.other')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />

            {/* Custom Crop Input (shown when Other is selected) */}
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>
                  {t('farmer_inquiry.enter_crop_name')}
                </Text>
                <TextInput
                  style={styles.customInput}
                  placeholder={t('farmer_inquiry.crop_name_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={customCropName}
                  onChangeText={setCustomCropName}
                  returnKeyType="done"
                  onSubmitEditing={handleCustomCropSubmit}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.customSubmitButton}
                  onPress={handleCustomCropSubmit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.customSubmitButtonText}>
                    {t('farmer_inquiry.submit_crop')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
                <Icon
                  name="close"
                  size={24}
                  color={FARMER_COLORS.textPrimary}
                />
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
                  {formData.unit === item && (
                    <Icon
                      name="check"
                      size={20}
                      color={FARMER_COLORS.textOnPrimary}
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

export default FarmerInquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
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
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
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
    borderColor: FARMER_COLORS.tintMid,
    backgroundColor: FARMER_COLORS.tintCard,
    minWidth: '47%',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: FARMER_COLORS.primary,
    borderColor: FARMER_COLORS.primary,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: FARMER_COLORS.textOnPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    backgroundColor: FARMER_COLORS.tintCard,
    letterSpacing: 0.2,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  uploadBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.tintCard,
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
    backgroundColor: FARMER_COLORS.surface,
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
    color: FARMER_COLORS.textPrimary,
  },
  uploadFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
  },
  uploadHint: {
    marginTop: 4,
    fontSize: 12,
    color: FARMER_COLORS.textSecondary,
  },
  removePhotoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.surface,
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
    borderColor: FARMER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: FARMER_COLORS.tintCard,
    minHeight: 56,
  },
  unitDropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
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
    backgroundColor: FARMER_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: FARMER_COLORS.tintCard,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
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
    backgroundColor: FARMER_COLORS.surface,
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
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
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
    backgroundColor: FARMER_COLORS.primary,
  },
  cropItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  cropItemTextSelected: {
    color: FARMER_COLORS.textOnPrimary,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    backgroundColor: FARMER_COLORS.tintCard,
  },
  categoryChipSelected: {
    backgroundColor: FARMER_COLORS.primary,
    borderColor: FARMER_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  categoryChipTextSelected: {
    color: FARMER_COLORS.textOnPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  noResultContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  otherOptionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.primary,
  },
  otherOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: FARMER_COLORS.textOnPrimary,
  },
  customInputContainer: {
    borderTopWidth: 1,
    borderTopColor: FARMER_COLORS.tintMid,
    padding: 20,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
    marginBottom: 12,
  },
  customInput: {
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    backgroundColor: FARMER_COLORS.tintCard,
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  customSubmitButton: {
    backgroundColor: FARMER_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  customSubmitButtonText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

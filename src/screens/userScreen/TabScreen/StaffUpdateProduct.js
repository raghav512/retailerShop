import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import ImagePickerModal from '../../../common/reusableComponent/ImagePickerModal';
import imagePickerService from '../../../services/imagePickerService';
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const THEME = STAFF_COLORS.primary;

// Restrict units to allowed set
const UNITS = [
  { id: '1', label: 'ml', value: 'ml' },
  { id: '2', label: 'litre', value: 'litre' },
  { id: '3', label: 'kg', value: 'kg' },
  { id: '4', label: 'mg', value: 'mg' },
];

const CATEGORIES = [
  { id: '1', label: 'Fertilizers', value: 'fertilizers' },
  { id: '2', label: 'Seeds', value: 'seeds' },
  { id: '3', label: 'Insecticides', value: 'insecticides' },
  { id: '4', label: 'Organic', value: 'organic' },
  { id: '5', label: 'Plant Growth Regulator (PGR)', value: 'pgr' },
  { id: '6', label: 'Animal Feed', value: 'animal_feed' },
];

const StaffUpdateProduct = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;

  const [showUnit, setShowUnit] = useState(null);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [openExpiry, setOpenExpiry] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [form, setForm] = useState({
    productName: product?.productName || '',
    brand: product?.brand || '',
    description: product?.description || '',
    productImages: product?.productImages || [],
    productVideos: product?.productVideos || [],
    productCategory: product?.productCategory || '',
    targetCrops: Array.isArray(product?.targetCrops)
      ? product.targetCrops.join(', ')
      : product?.targetCrops || '',
    productTechnicalDetails: product?.productTechnicalDetails || '',
    howToUse: product?.howToUse || '',
    productBenefits: product?.productBenefits || '',
  });

  const [variants, setVariants] = useState(
    product?.products?.length > 0
      ? product.products.map(p => ({
          parameter: p.parameter || '',
          unit: p.unit || '',
          mrp: p.mrp?.toString() || '',
          quantity: p.quantity?.toString() || '',
          purchaseDate: p.purchaseDate?.split('T')[0] || '',
          expiryDate: p.expiryDate?.split('T')[0] || '',
          _id: p._id,
        }))
      : [
          {
            parameter: '',
            unit: '',
            mrp: '',
            quantity: '',
            purchaseDate: '',
            expiryDate: '',
          },
        ],
  );

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
    }, []),
  );

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  /* ── Image Handlers ── */
  const pickImageFromGallery = async () => {
    if (selectedImages.length + form.productImages.length >= 5) {
      showAlert({
        type: 'warning',
        title: t('update_product.limit_reached'),
        message: t('update_product.max_images'),
      });
      return;
    }

    const image = await imagePickerService.openGallery();
    if (image) setSelectedImages(prev => [...prev, image]);
  };
  const pickImageFromCamera = async () => {
    if (selectedImages.length + form.productImages.length >= 5) {
      showAlert({
        type: 'warning',
        title: t('update_product.limit_reached'),
        message: t('update_product.max_images'),
      });
      return;
    }

    const image = await imagePickerService.openCamera();
    if (image) setSelectedImages(prev => [...prev, image]);
  };
  const removeNewImage = index =>
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  const removeExistingImage = index =>
    setForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));

  /* ── Video Handlers ── */
  const pickVideo = async () => {
    if (selectedVideos.length + form.productVideos.length >= 3) {
      showAlert({
        type: 'warning',
        title: t('update_product.limit_reached'),
        message: t('update_product.max_videos'),
      });
      return;
    }

    const result = await imagePickerService.openVideoGallery();
    if (result) {
      const newVideos = [...selectedVideos, result];
      setSelectedVideos(newVideos);
      handleChange('productVideos', [
        ...form.productVideos,
        ...newVideos.map(v => v.uri),
      ]);
    }
  };
  const removeNewVideo = index => {
    const newVideos = selectedVideos.filter((_, i) => i !== index);
    setSelectedVideos(newVideos);
    const existingCount = (product?.productVideos || []).length;
    handleChange('productVideos', [
      ...form.productVideos.slice(0, existingCount),
      ...newVideos.map(v => v.uri),
    ]);
  };
  const removeExistingVideo = index =>
    setForm(prev => ({
      ...prev,
      productVideos: prev.productVideos.filter((_, i) => i !== index),
    }));

  /* ── Variant Handlers ── */
  const addVariant = () =>
    setVariants([
      ...variants,
      {
        parameter: '',
        unit: '',
        mrp: '',
        quantity: '',
        purchaseDate: '',
        expiryDate: '',
      },
    ]);
  const removeVariant = index => {
    if (variants.length > 1)
      setVariants(variants.filter((_, i) => i !== index));
  };
  const updateVariant = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  /* ── Save ── */
  const handleUpdate = async () => {
    if (
      !form.productName ||
      !form.brand ||
      !form.description ||
      !form.productCategory
    ) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('fill_required_fields'),
      });
      return;
    }
    const cropsArray = form.targetCrops
      ? form.targetCrops
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
      : [];
    const existingImageUrls = form.productImages.map(img => img.url || img);
    const newBase64Images = selectedImages.map(
      img => `data:${img.type || 'image/jpeg'};base64,${img.base64}`,
    );
    const updatePayload = {
      productName: form.productName.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      productCategory: form.productCategory,
      targetCrops: cropsArray,
      productTechnicalDetails: form.productTechnicalDetails.trim(),
      howToUse: form.howToUse.trim(),
      productBenefits: form.productBenefits.trim(),
      productVideos: form.productVideos,
      productImages: [...existingImageUrls, ...newBase64Images],
      products: variants.map(v => {
        const def = {
          parameter: v.parameter,
          unit: v.unit,
          mrp: parseFloat(v.mrp) || 0,
          quantity: parseInt(v.quantity) || 0,
          purchaseDate: v.purchaseDate,
          expiryDate: v.expiryDate,
        };
        if (v._id) def._id = v._id;
        return def;
      }),
    };
    setLoading(true);
    try {
      await apiService.updateProduct(product._id, updatePayload);
      showAlert({
        type: 'success',
        title: t('update_product.success'),
        message: t('update_product.update_success'),
        buttons: [
          { text: t('send_broadcast.ok'), onPress: () => navigation.goBack() },
        ],
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: t('edit_profile.error'),
        message: t('update_product.update_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const existingVideos = form.productVideos.filter(
    v => typeof v === 'string' && !selectedVideos.find(sv => sv.uri === v),
  );

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
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('update_product.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── MEDIA SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="image" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('add_product.product_image')} (
              {form.productImages.length + selectedImages.length}/5)
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {form.productImages.map((img, index) => (
              <View key={`existing-${index}`} style={styles.imageWrapper}>
                <Image
                  source={{ uri: img.url || img }}
                  style={styles.productImage}
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeExistingImage(index)}
                >
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
                <Text style={styles.existingBadge}>
                  {t('update_product.saved_badge')}
                </Text>
              </View>
            ))}
            {selectedImages.map((img, index) => (
              <View key={`new-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeNewImage(index)}
                >
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length + form.productImages.length < 5 && (
              <TouchableOpacity
                onPress={() => setShowImagePicker(true)}
                style={styles.addImageBtn}
                activeOpacity={0.7}
              >
                <Icon name="camera-outline" size={28} color={THEME} />
                <Text style={styles.imagePlaceholderText}>
                  {t('update_product.add_variant')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.sectionDivider} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="videocam" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('add_product.product_videos')} (
              {existingVideos.length + selectedVideos.length}/3)
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {existingVideos.map((uri, index) => {
              const videoUri =
                typeof uri === 'string' ? uri : uri?.url || uri?.uri || uri;
              return (
                <View key={`ev-${index}`} style={styles.videoThumb}>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.videoPreview}
                    paused={true}
                    muted={true}
                    resizeMode="cover"
                    repeat={false}
                  />
                  <View style={styles.videoLabel}>
                    <Text style={styles.videoName} numberOfLines={1}>
                      Video {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeExistingVideo(index)}
                  >
                    <Icon name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                  <Text style={styles.existingBadge}>
                    {t('update_product.saved_badge')}
                  </Text>
                </View>
              );
            })}
            {selectedVideos.map((vid, index) => {
              const videoUri = vid?.uri || vid?.url || vid?.path || vid;
              return (
                <View key={`nv-${index}`} style={styles.videoThumb}>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.videoPreview}
                    paused={true}
                    muted={true}
                    resizeMode="cover"
                    repeat={false}
                  />
                  <View style={styles.videoLabel}>
                    <Text style={styles.videoName} numberOfLines={1}>
                      {vid.fileName ||
                        `Video ${existingVideos.length + index + 1}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeNewVideo(index)}
                  >
                    <Icon name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
            {existingVideos.length + selectedVideos.length < 3 && (
              <TouchableOpacity
                style={styles.addImageBtn}
                onPress={pickVideo}
                activeOpacity={0.8}
              >
                <Icon name="videocam-outline" size={28} color={THEME} />
                <Text style={styles.imagePlaceholderText}>
                  {t('update_product.add_video')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <ImagePickerModal
          visible={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onCamera={pickImageFromCamera}
          onGallery={pickImageFromGallery}
        />

        {/* ── PRODUCT INFO SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="cube" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('update_product.product_info')}
            </Text>
          </View>

          <Text style={styles.label}>{t('add_product.product_name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('add_product.product_name_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={form.productName}
            onChangeText={v => handleChange('productName', v)}
          />

          <Text style={styles.label}>{t('add_product.brand')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('add_product.brand_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={form.brand}
            onChangeText={v => handleChange('brand', v)}
          />

          <Text style={styles.label}>{t('add_product.description')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('add_product.description_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={v => handleChange('description', v)}
          />
        </View>

        {/* ── CATEGORY & CROPS SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="pricetag" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('update_product.category_crops')}
            </Text>
          </View>

          <Text style={styles.label}>{t('add_product.product_category')}</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text
              style={[
                styles.selectText,
                form.productCategory && { color: '#1F2937' },
              ]}
            >
              {form.productCategory
                ? t(`product_categories.${form.productCategory}`)
                : t('add_product.select_category')}
            </Text>
            <Icon
              name={
                showCategoryDropdown
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              }
              size={18}
              color={THEME}
            />
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.option}
                  onPress={() => {
                    handleChange('productCategory', cat.value);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.optionText}>
                    {t(`product_categories.${cat.value}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{t('add_product.target_crops')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('add_product.target_crops_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={form.targetCrops}
            onChangeText={v => handleChange('targetCrops', v)}
          />
        </View>

        {/* ── DETAILS SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="document-text" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('update_product.technical_details_title')}
            </Text>
          </View>

          <Text style={styles.label}>{t('add_product.technical_details')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('add_product.technical_details_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={form.productTechnicalDetails}
            onChangeText={v => handleChange('productTechnicalDetails', v)}
          />

          <Text style={styles.label}>{t('add_product.how_to_use')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('add_product.how_to_use_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={form.howToUse}
            onChangeText={v => handleChange('howToUse', v)}
          />

          <Text style={styles.label}>{t('add_product.product_benefits')}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('add_product.product_benefits_placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={form.productBenefits}
            onChangeText={v => handleChange('productBenefits', v)}
          />
        </View>

        {/* ── VARIANTS SECTION ── */}
        <View style={styles.sectionCard}>
          <View
            style={[styles.sectionHeader, { justifyContent: 'space-between' }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.sectionIcon}>
                <Icon name="layers" size={16} color={THEME} />
              </View>
              <Text style={styles.sectionTitle}>
                {t('add_product.product_variants')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={addVariant}
              style={styles.addVariantBtn}
              activeOpacity={0.8}
            >
              <Icon name="add" size={18} color={THEME} />
              <Text style={styles.addVariantText}>Add</Text>
            </TouchableOpacity>
          </View>

          {variants.map((variant, index) => (
            <View key={index} style={styles.variantCard}>
              <View style={styles.variantCardHeader}>
                <Text style={styles.variantLabel}>
                  {t('update_product.variant_number', { number: index + 1 })}
                </Text>

                {variants.length > 1 && (
                  <TouchableOpacity onPress={() => removeVariant(index)}>
                    <Icon name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('add_product.unit')}</Text>
                  <TouchableOpacity
                    style={styles.select}
                    onPress={() =>
                      setShowUnit(showUnit === index ? null : index)
                    }
                  >
                    <Text style={styles.selectText}>
                      {variant.unit
                        ? t(`product_units.${variant.unit}`)
                        : t('add_product.select')}
                    </Text>

                    <Icon name="chevron-down-outline" size={18} color={THEME} />
                  </TouchableOpacity>
                  {showUnit === index && (
                    <View style={styles.dropdown}>
                      {UNITS.map(item => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.option}
                          onPress={() => {
                            updateVariant(index, 'unit', item.value);
                            setShowUnit(null);
                          }}
                        >
                          <Text style={styles.optionText}>
                            {t(`product_units.${item.value}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Parameter</Text>
                  <TextInput
                    style={[styles.input, styles.variantInput]}
                    placeholder="Enter Parameter"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={variant.parameter}
                    onChangeText={v => updateVariant(index, 'parameter', v)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('add_product.mrp')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('add_product.mrp_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={variant.mrp}
                    onChangeText={v => updateVariant(index, 'mrp', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('add_product.quantity')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('add_product.quantity_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={variant.quantity}
                    onChangeText={v => updateVariant(index, 'quantity', v)}
                  />
                </View>
              </View>

              <Text style={styles.label}>{t('add_product.purchase_date')}</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setOpenPurchase(index)}
              >
                <Icon name="calendar-outline" size={18} color={THEME} />
                <Text
                  style={[
                    styles.dateText,
                    variant.purchaseDate && styles.dateTextFilled,
                  ]}
                >
                  {variant.purchaseDate || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>{t('add_product.expiry_date')}</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setOpenExpiry(index)}
              >
                <Icon name="calendar-outline" size={18} color={THEME} />
                <Text
                  style={[
                    styles.dateText,
                    variant.expiryDate && styles.dateTextFilled,
                  ]}
                >
                  {variant.expiryDate || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>

              <DatePicker
                modal
                open={openPurchase === index}
                date={
                  variant.purchaseDate
                    ? new Date(variant.purchaseDate)
                    : new Date()
                }
                mode="date"
                onConfirm={date => {
                  setOpenPurchase(false);
                  updateVariant(
                    index,
                    'purchaseDate',
                    date.toISOString().split('T')[0],
                  );
                }}
                onCancel={() => setOpenPurchase(false)}
              />
              <DatePicker
                modal
                open={openExpiry === index}
                date={
                  variant.expiryDate ? new Date(variant.expiryDate) : new Date()
                }
                mode="date"
                onConfirm={date => {
                  setOpenExpiry(false);
                  updateVariant(
                    index,
                    'expiryDate',
                    date.toISOString().split('T')[0],
                  );
                }}
                onCancel={() => setOpenExpiry(false)}
              />
            </View>
          ))}
        </View>

        {/* UPDATE BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Icon
            name="checkmark-circle"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveText}>
            {loading
              ? t('update_product.updating')
              : t('update_product.update_btn')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default StaffUpdateProduct;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#1F2937', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40 },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FAF7E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  sectionDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  /* INPUTS */
  label: { fontSize: 13, color: '#4B5563', marginBottom: 6, fontWeight: '600' },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
    textAlignVertical: 'top',
  },
  variantInput: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 44,
  },
  dateInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: { fontSize: 15, color: '#9CA3AF' },
  dateTextFilled: { color: '#1F2937' },
  select: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  selectText: { fontSize: 15, color: '#9CA3AF', flex: 1 },
  row: { flexDirection: 'row', gap: 12 },

  /* DROPDOWN */
  dropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginTop: -8,
    marginBottom: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#F3F4F6',
  },
  optionText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },

  /* MEDIA */
  imageScroll: { marginBottom: 10 },
  imageWrapper: {
    width: 100,
    height: 100,
    marginRight: 10,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  existingBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(187,169,60,0.85)',
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  productImage: { width: 100, height: 100, resizeMode: 'cover' },
  imagePlaceholderText: {
    fontSize: 11,
    color: THEME,
    marginTop: 4,
    fontWeight: '600',
  },
  videoThumb: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAF7E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
    paddingHorizontal: 8,
  },
  videoName: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },

  /* VARIANTS */
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
    backgroundColor: '#FAF7E8',
    videoPreview: {
      ...StyleSheet.absoluteFillObject,
    },
    videoLabel: {
      position: 'absolute',
      left: 4,
      right: 4,
      bottom: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    videoName: { fontSize: 10, color: '#ffffff', textAlign: 'center' },
    paddingVertical: 8,
    borderRadius: 20,
  },
  addVariantText: { fontSize: 13, color: THEME, fontWeight: '700' },
  variantCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  variantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  variantLabel: { fontSize: 14, fontWeight: '700', color: THEME },

  /* SAVE */
  saveBtn: {
    backgroundColor: '#1F2937',
    height: 56,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  saveText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

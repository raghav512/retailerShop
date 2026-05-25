import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import { FARMER_COLORS, STAFF_COLORS } from '../../../colorsList/ColorList';

/*──────────────────────────────────────────────────────────
  MarketplaceProductDetails
  route.params: { items[], product }
──────────────────────────────────────────────────────────*/

const { width: SW } = Dimensions.get('window');
const IMG_H = 260;
const TAB_KEYS = ['overview', 'details', 'videos'];

const MarketplaceProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const TABS = [
    t('marketplace.tab_overview'),
    t('marketplace.tab_details'),
    t('marketplace.tab_videos'),
  ];

  const {
    items,
    product,
    productId,
    productName,
    isStaffOrder,
    selectedFarmerId,
    selectedFarmerData,
    selectedFarmerName,
  } = route.params || {};

  const COLORS = isStaffOrder ? STAFF_COLORS : FARMER_COLORS;
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  console.log('PRODUCT DETAILS CONTEXT:', {
    isStaffOrder,
    selectedFarmerId,
    selectedFarmerName,
    farmerPhone: selectedFarmerData?.phone,
  });

  /* ── State ──────────────────────────────────────────── */
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [videoModal, setVideoModal] = useState({ visible: false, url: '' });
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const flatListRef = useRef(null);

  // Fetch full product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const firstItem = items?.[0] || product;

        console.log('First item:', JSON.stringify(firstItem, null, 2));

        // Fetch all products
        console.log('📦 Fetching all Distributor products...');
        const allProducts = await apiService.GetFPOProduct();
        console.log('📦 Total products fetched:', allProducts?.length);

        if (!allProducts || allProducts.length === 0) {
          console.log('⚠️ No products returned from API');
          setFullProduct(firstItem);
          setLoading(false);
          return;
        }

        console.log(
          '📦 Sample product structure:',
          JSON.stringify(allProducts[0], null, 2),
        );

        // Try to match by image URL (most reliable)
        let productDetails = null;
        const itemImage = firstItem?.productImages?.[0];

        if (itemImage) {
          console.log('🔍 Searching by image URL:', itemImage);
          productDetails = allProducts.find(p => {
            const productImages = p.productImages || [];
            return productImages.some(img => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              return imgUrl === itemImage;
            });
          });

          if (productDetails) {
            console.log('✅ Found product by image match!');
          }
        }

        // If not found by image, try by brand + partial name match
        if (!productDetails && firstItem?.brand && firstItem?.itemName) {
          console.log('🔍 Searching by brand and name...');
          const itemBrand = firstItem.brand.toLowerCase();
          const itemNameParts = firstItem.itemName.toLowerCase().split(' ');

          productDetails = allProducts.find(p => {
            const productBrand = (p.brand || '').toLowerCase();
            const productName = (p.productName || '').toLowerCase();

            // Check if brand matches and product name contains any part of item name
            const brandMatch = productBrand === itemBrand;
            const nameMatch = itemNameParts.some(
              part => part.length > 2 && productName.includes(part),
            );

            return brandMatch && nameMatch;
          });

          if (productDetails) {
            console.log('✅ Found product by brand+name match!');
          }
        }

        if (productDetails) {
          console.log(
            '✅ Full product details:',
            JSON.stringify(productDetails, null, 2),
          );
          setFullProduct(productDetails);
        } else {
          console.log('⚠️ Product not found, using item data');
          setFullProduct(firstItem);
        }
      } catch (error) {
        console.error('❌ Error fetching product details:', error);
        setFullProduct(items?.[0] || product);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [items, product, productId, productName]);

  /* ── Normalise to flat items array ───────────────────── */
  const allItems = useMemo(() => {
    console.log(
      '🔄 Building allItems with fullProduct:',
      fullProduct ? 'FOUND' : 'NOT FOUND',
    );

    if (items && items.length > 0) {
      const normalized = items.map(item => {
        const result = {
          itemId: item._id || item.itemId,
          itemName: item.productName || item.itemName,
          brand: fullProduct?.brand || item.brand,
          unit: item.unit || '',
          price: item.mrp || item.price || 0,
          availableQuantity: item.quantity || item.availableQuantity || 0,
          productImages: fullProduct?.productImages || item.productImages || [],
          productVideos: fullProduct?.productVideos || [],
          description: fullProduct?.description || '',
          productCategory:
            fullProduct?.productCategory || item.productCategory || '',
          targetCrops: fullProduct?.targetCrops || [],
          productTechnicalDetails: fullProduct?.productTechnicalDetails || '',
          howToUse: fullProduct?.howToUse || '',
          productBenefits: fullProduct?.productBenefits || '',
        };
        console.log('Normalized item:', result);
        return result;
      });
      return normalized;
    } else if (fullProduct || product) {
      const prod = fullProduct || product;
      const result = [
        {
          itemId: prod._id || prod.itemId,
          itemName: prod.productName || prod.itemName,
          brand: prod.brand,
          unit: prod.unit || '',
          price: prod.mrp || prod.price || 0,
          availableQuantity: prod.quantity || prod.availableQuantity || 0,
          productImages: prod.productImages || [],
          productVideos: prod.productVideos || [],
          description: prod.description || '',
          productCategory: prod.productCategory || '',
          targetCrops: prod.targetCrops || [],
          productTechnicalDetails: prod.productTechnicalDetails || '',
          howToUse: prod.howToUse || '',
          productBenefits: prod.productBenefits || '',
        },
      ];
      console.log('Normalized product:', result);
      return result;
    }
    return [];
  }, [items, product, fullProduct]);

  const selected = allItems[selectedIndex] || {};

  console.log('📌 Selected item:', selected);
  console.log('📌 Description:', selected.description);
  console.log('📌 Videos:', selected.productVideos);
  console.log('📌 Target Crops:', selected.targetCrops);

  // Process images
  const images = (selected.productImages || [])
    .map(img => (typeof img === 'string' ? img : img?.url || img))
    .filter(Boolean);

  // Process videos
  const videos = (selected.productVideos || [])
    .map(vid => (typeof vid === 'string' ? vid : vid?.url || vid))
    .filter(Boolean);

  console.log('📌 Processed images:', images);
  console.log('📌 Processed videos:', videos);

  const viewerImages = images.map(img => ({ url: img }));

  /* ── Helpers ────────────────────────────────────────── */
  const targetCropsArray = Array.isArray(selected.targetCrops)
    ? selected.targetCrops
    : typeof selected.targetCrops === 'string'
    ? selected.targetCrops
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const categoryLabel = selected.productCategory
    ? selected.productCategory.charAt(0).toUpperCase() +
      selected.productCategory.slice(1).replace(/_/g, ' ')
    : null;

  const totalPrice = ((selected.price || 0) * quantity).toFixed(0);

  /* ── Image gallery ──────────────────────────────────── */
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentImageIndex(viewableItems[0].index);
  }).current;
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleThumbnailPress = idx => {
    setCurrentImageIndex(idx);
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  /* ── Cart ───────────────────────────────────────────── */
  const fetchCartCount = useCallback(async () => {
    try {
      const res = await apiService.getCart(
        isStaffOrder ? selectedFarmerId : undefined,
      );
      const cartItems = res?.data?.items || [];
      setCartCount(cartItems.reduce((s, i) => s + i.quantity, 0));
    } catch (_) {}
  }, [isStaffOrder, selectedFarmerId]);

  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [fetchCartCount]),
  );

  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart) return;
    try {
      setIsAddingToCart(true);
      console.log('========== ADD TO CART ==========');
      console.log('isStaffOrder:', isStaffOrder);
      console.log('selectedFarmerId:', selectedFarmerId);
      console.log('itemId:', selected.itemId);
      console.log('quantity:', quantity);
      console.log('expectedPrice:', selected.price);
      console.log('=================================');

      const payload = {
        itemId: selected.itemId,
        quantity,
        expectedPrice: selected.price,
      };

      if (isStaffOrder && selectedFarmerId) {
        payload.farmerId = selectedFarmerId;
      }

      console.log('ADD TO CART PAYLOAD:', payload);

      await apiService.addToCart(payload);
      await fetchCartCount();
      showAlert({
        type: 'success',
        title: t('success'),
        message: t('marketplace.item_added_to_cart'),
      });
    } catch (_) {
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('marketplace.failed_add_to_cart'),
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [selected, quantity, fetchCartCount, t, isStaffOrder, selectedFarmerId, isAddingToCart]);

  /* ── Variant selection ──────────────────────────────── */
  const handleSelectItem = useCallback(idx => {
    setSelectedIndex(idx);
    setCurrentImageIndex(0);
    setQuantity(1);
    setTimeout(
      () => flatListRef.current?.scrollToOffset({ offset: 0, animated: false }),
      100,
    );
  }, []);

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="chevron-back"
              size={24}
              color={FARMER_COLORS.primaryLight}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('marketplace.product_details')}
          </Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.loadingText}>
            {t('marketplace.loading_product')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={COLORS.primaryLight} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('marketplace.product_details')}
        </Text>

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: '#FEF2F2' }]}
          onPress={() =>
            navigation.navigate('Cart', {
              isStaffOrder,
              selectedFarmerId,
              selectedFarmerData,
              selectedFarmerName,
            })
          }
        >
          <Icon name="cart" size={20} color="#EF4444" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 9 ? '9+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── IMAGE GALLERY ──────────────────────────────── */}
        <View style={styles.galleryCard}>
          {images.length > 0 ? (
            <>
              {/* Main swipeable images */}
              <View style={{ height: IMG_H, overflow: 'hidden' }}>
                <FlatList
                  ref={flatListRef}
                  data={images}
                  keyExtractor={(_, i) => i.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  renderItem={({ item: uri }) => (
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => setIsImageViewerVisible(true)}
                      style={{ width: SW - 32, height: IMG_H }}
                    >
                      <Image
                        source={{ uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                />
                {/* Tap-to-zoom hint */}
                <View style={styles.zoomTag}>
                  <Icon name="expand-outline" size={12} color="#fff" />
                  <Text style={styles.zoomTagText}>
                    {t('marketplace.tap_to_zoom')}
                  </Text>
                </View>
              </View>

              {/* Pill dots */}
              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleThumbnailPress(i)}
                    >
                      <View
                        style={[
                          styles.dot,
                          currentImageIndex === i && styles.dotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbStrip}
                >
                  {images.map((uri, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleThumbnailPress(i)}
                      style={[
                        styles.thumb,
                        currentImageIndex === i && styles.thumbActive,
                      ]}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.thumbImg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <View
                style={[
                  styles.iconWrapper,
                  { width: 56, height: 56, borderRadius: 28 },
                ]}
              >
                <Icon
                  name="image-outline"
                  size={28}
                  color={COLORS.primaryLight}
                />
              </View>
              <Text style={styles.noImageText}>
                {t('marketplace.no_images')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bodyPad}>
          {/* ── PRODUCT INFO CARD ───────────────────────── */}
          <View style={styles.card}>
            {/* Category badge */}
            {categoryLabel && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
              </View>
            )}

            <Text style={styles.productName}>{selected.itemName || 'N/A'}</Text>

            <View style={styles.metaRow}>
              <View style={styles.iconWrapper}>
                <Icon name="business" size={16} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.metaText}>{selected.brand || 'N/A'}</Text>
            </View>

            {targetCropsArray.length > 0 && (
              <View style={styles.targetCropsRow}>
                <View style={styles.iconWrapper}>
                  <Icon name="leaf" size={16} color="#15803D" />
                </View>
                <Text style={styles.targetCropsText}>
                  {t('marketplace.targets', {
                    crops: targetCropsArray.join(', '),
                  })}
                </Text>
              </View>
            )}

            {/* Price strip */}
            <View style={styles.priceStrip}>
              <View>
                <Text style={styles.priceLabel}>
                  {t('marketplace.price_per_unit', {
                    unit: selected.unit || 'unit',
                  })}
                </Text>
                <Text style={styles.price}>₹{selected.price || 0}</Text>
              </View>
              <View style={styles.stockPill}>
                <Icon name="cube" size={14} color="#047857" />
                <Text style={styles.stockPillText}>
                  {t('marketplace.in_stock', {
                    count: selected.availableQuantity || 0,
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* ── VIDEOS SECTION ──────────────────────────── */}
          {videos.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconWrapper}>
                  <Icon name="videocam" size={16} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.cardTitle}>
                  {t('marketplace.product_videos', { count: videos.length })}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12 }}
              >
                {videos.map((vid, i) => {
                  const url =
                    typeof vid === 'string' ? vid : vid?.url || vid?.uri || '';
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.videoThumb}
                      onPress={() => setVideoModal({ visible: true, url })}
                      activeOpacity={0.8}
                    >
                      <Video
                        source={{ uri: url }}
                        style={styles.videoThumbPreview}
                        paused={true}
                        muted={true}
                        resizeMode="cover"
                        repeat={false}
                      />
                      <View style={styles.videoThumbOverlay}>
                        <Icon name="play-circle" size={36} color="#ffffff" />
                      </View>
                      <View style={styles.videoThumbLabel}>
                        <Text style={styles.videoThumbText} numberOfLines={1}>
                          {t('marketplace.video_number', { number: i + 1 })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── VARIANT SELECTOR ────────────────────────── */}
          {allItems.length > 1 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconWrapper}>
                  <Icon name="options" size={16} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.cardTitle}>
                  {t('marketplace.select_variant')}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {allItems.map((itm, i) => (
                  <TouchableOpacity
                    key={itm.itemId || i}
                    onPress={() => handleSelectItem(i)}
                    style={[
                      styles.variantChip,
                      selectedIndex === i && styles.variantChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantChipUnit,
                        selectedIndex === i && { color: '#fff' },
                      ]}
                    >
                      {itm.unit}
                    </Text>
                    <Text
                      style={[
                        styles.variantChipPrice,
                        selectedIndex === i && {
                          color: '#ffffff',
                          opacity: 0.9,
                        },
                      ]}
                    >
                      ₹{itm.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── 3-TAB SYSTEM ────────────────────────────── */}
          <View style={styles.tabCard}>
            {/* Tab bar */}
            <View style={styles.tabBar}>
              {TABS.map((tab, i) => {
                const label =
                  i === 2 && videos.length > 0
                    ? t('marketplace.product_videos', { count: videos.length })
                    : tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tabItem,
                      activeTab === i && styles.tabItemActive,
                    ]}
                    onPress={() => setActiveTab(i)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === i && styles.tabTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Tab: Overview ─────────────────────────── */}
            {activeTab === 0 && (
              <View style={styles.tabBody}>
                {selected.description ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {t('marketplace.description')}
                    </Text>
                    <Text style={styles.bodyText}>{selected.description}</Text>
                  </View>
                ) : null}

                <Text style={styles.sectionTitle}>
                  {t('marketplace.product_info')}
                </Text>
                <InfoRow
                  icon="pricetag-outline"
                  label={t('marketplace.price_label')}
                  value={`₹${selected.price || 0}`}
                  COLORS={COLORS}
                />
                <InfoRow
                  icon="cube-outline"
                  label={t('marketplace.stock_label')}
                  value={`${selected.availableQuantity || 0} ${
                    selected.unit || 'units'
                  }`}
                  COLORS={COLORS}
                />
                <InfoRow
                  icon="resize-outline"
                  label={t('marketplace.unit_label')}
                  value={selected.unit || '—'}
                  COLORS={COLORS}
                />
                <InfoRow
                  icon="business-outline"
                  label={t('marketplace.brand_label')}
                  value={selected.brand || '—'}
                  COLORS={COLORS}
                />
                {categoryLabel && (
                  <InfoRow
                    icon="grid-outline"
                    label={t('marketplace.category_label')}
                    value={categoryLabel}
                    COLORS={COLORS}
                  />
                )}
                {targetCropsArray.length > 0 && (
                  <InfoRow
                    icon="leaf-outline"
                    label={t('marketplace.target_crops')}
                    value={targetCropsArray.join(', ')}
                    COLORS={COLORS}
                  />
                )}
              </View>
            )}

            {/* ── Tab: Details ──────────────────────────── */}
            {activeTab === 1 && (
              <View style={styles.tabBody}>
                {selected.productTechnicalDetails ? (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          name="beaker"
                          size={14}
                          color={COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.sectionTitle}>
                        {t('marketplace.technical_details')}
                      </Text>
                    </View>
                    <Text style={styles.bodyText}>
                      {selected.productTechnicalDetails}
                    </Text>
                  </View>
                ) : null}

                {selected.howToUse ? (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          name="book"
                          size={14}
                          color={COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.sectionTitle}>
                        {t('marketplace.how_to_use')}
                      </Text>
                    </View>
                    <Text style={styles.bodyText}>{selected.howToUse}</Text>
                  </View>
                ) : null}

                {selected.productBenefits ? (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          name="checkmark-circle"
                          size={14}
                          color={COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.sectionTitle}>
                        {t('marketplace.benefits')}
                      </Text>
                    </View>
                    <Text style={styles.bodyText}>
                      {selected.productBenefits}
                    </Text>
                  </View>
                ) : null}

                {!selected.productTechnicalDetails &&
                  !selected.howToUse &&
                  !selected.productBenefits && (
                    <View style={styles.emptyTab}>
                      <View
                        style={[
                          styles.iconWrapper,
                          { width: 56, height: 56, borderRadius: 28 },
                        ]}
                      >
                        <Icon
                          name="document-text"
                          size={28}
                          color={COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.emptyText}>
                        {t('marketplace.no_details')}
                      </Text>
                    </View>
                  )}
              </View>
            )}

            {/* ── Tab: Videos ───────────────────────────── */}
            {activeTab === 2 && (
              <View style={styles.tabBody}>
                {videos.length === 0 ? (
                  <View style={styles.emptyTab}>
                    <View
                      style={[
                        styles.iconWrapper,
                        { width: 56, height: 56, borderRadius: 28 },
                      ]}
                    >
                      <Icon
                        name="videocam-off"
                        size={28}
                        color={COLORS.primaryLight}
                      />
                    </View>
                    <Text style={styles.emptyText}>
                      {t('marketplace.no_videos')}
                    </Text>
                  </View>
                ) : (
                  videos.map((vid, i) => {
                    const url =
                      typeof vid === 'string'
                        ? vid
                        : vid?.url || vid?.uri || '';
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.videoCard}
                        onPress={() => setVideoModal({ visible: true, url })}
                        activeOpacity={0.8}
                      >
                        <View style={styles.videoCardPreview}>
                          <Video
                            source={{ uri: url }}
                            style={styles.videoCardPreviewMedia}
                            paused={true}
                            muted={true}
                            resizeMode="cover"
                            repeat={false}
                          />
                          <View style={styles.videoCardPlay}>
                            <Icon name="play" size={18} color="#fff" />
                          </View>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.videoTitle}>
                            {t('marketplace.product_video_number', {
                              number: i + 1,
                            })}
                          </Text>
                          <Text style={styles.videoSub}>
                            {t('marketplace.tap_to_play')}
                          </Text>
                        </View>
                        <Icon
                          name="chevron-forward"
                          size={18}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </View>

          {/* ── QUANTITY SELECTOR ───────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconWrapper}>
                <Icon name="layers" size={16} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.cardTitle}>{t('marketplace.quantity')}</Text>
            </View>

            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={20} color={COLORS.primaryLight} />
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  setQuantity(
                    Math.min(selected.availableQuantity || 999, quantity + 1),
                  )
                }
              >
                <Icon name="add" size={20} color={COLORS.primaryLight} />
              </TouchableOpacity>

              <View style={styles.qtyTotal}>
                <Text style={styles.qtyTotalLabel}>
                  {t('marketplace.total')}
                </Text>
                <Text style={styles.qtyTotalValue}>₹{totalPrice}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* /bodyPad */}
      </ScrollView>

      {/* ── STICKY FOOTER ──────────────────────────────── */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{t('marketplace.total_price')}</Text>
          <Text style={styles.footerPrice}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, isAddingToCart && styles.addToCartBtnDisabled]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="cart" size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>
                {t('marketplace.add_to_cart')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── IMAGE VIEWER MODAL ─────────────────────────── */}
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={viewerImages}
          index={currentImageIndex}
          enableSwipeDown
          onSwipeDown={() => setIsImageViewerVisible(false)}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsImageViewerVisible(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          onChange={i => {
            setCurrentImageIndex(i);
            flatListRef.current?.scrollToIndex({ index: i, animated: true });
          }}
        />
      </Modal>

      {/* ── IN-APP VIDEO PLAYER MODAL ──────────────────── */}
      <Modal
        visible={videoModal.visible}
        animationType="slide"
        onRequestClose={() => setVideoModal({ visible: false, url: '' })}
        statusBarTranslucent
      >
        <View style={styles.videoModalBg}>
          <StatusBar hidden />
          <TouchableOpacity
            style={styles.videoModalClose}
            onPress={() => setVideoModal({ visible: false, url: '' })}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {videoModal.url ? (
            <Video
              source={{ uri: videoModal.url }}
              style={styles.videoPlayer}
              controls
              resizeMode="contain"
              onError={() => {
                showAlert({
                  type: 'error',
                  title: t('error'),
                  message: t('marketplace.video_error'),
                });
                setVideoModal({ visible: false, url: '' });
              }}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

/* ── InfoRow helper ─────────────────────────────────────── */
const InfoRow = ({ icon, label, value, COLORS }) => {
  const infoStyles = useMemo(() => getStyles(COLORS), [COLORS]);
  return (
    <View style={infoStyles.infoRow}>
      <Icon name={icon} size={15} color={COLORS.primaryLight} />
      <Text style={infoStyles.infoLabel}>{label}</Text>
      <Text style={infoStyles.infoValue}>{value}</Text>
    </View>
  );
};

export default MarketplaceProductDetails;

const getStyles = COLORS =>
  StyleSheet.create({
    headerSpacer: {
      height: 6,
      backgroundColor: '#ffffff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F4F6F8',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '600',
    },
    safeArea: {
      flex: 1,
      backgroundColor: '#F4F6F8',
    },

    /* HEADER */
    header: {
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      zIndex: 10,
    },
    headerTitle: {
      color: '#1F2937',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FEF9E7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: '#EF4444',
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 3,
    },
    badgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: '700',
    },

    /* GALLERY CARD */
    galleryCard: {
      backgroundColor: '#fff',
      margin: 16,
      marginBottom: 0,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    noImage: {
      height: IMG_H,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    noImageText: {
      fontSize: 13,
      color: '#9CA3AF',
    },
    zoomTag: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    zoomTagText: {
      color: '#fff',
      fontSize: 11,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 5,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#C8E6C9',
    },
    dotActive: {
      width: 18,
      backgroundColor: COLORS.primaryLight,
    },
    thumbStrip: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 8,
    },
    thumb: {
      width: 52,
      height: 52,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      overflow: 'hidden',
      marginRight: 8,
    },
    thumbActive: {
      borderColor: COLORS.primaryLight,
    },
    thumbImg: {
      width: '100%',
      height: '100%',
    },

    /* BODY PADDING */
    bodyPad: {
      padding: 16,
      paddingBottom: 0,
      gap: 12,
    },

    /* CARD (reusable) */
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#374151',
    },

    /* ICON WRAPPER */
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#FEF9E7',
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* PRODUCT INFO */
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#DCFCE7',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginBottom: 10,
    },
    categoryBadgeText: {
      color: '#16A34A',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    productName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 10,
      lineHeight: 26,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    metaText: {
      fontSize: 13,
      color: '#6B7280',
    },
    targetCropsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      backgroundColor: '#F0FDF4',
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },
    targetCropsText: {
      fontSize: 14,
      color: '#15803D',
      fontWeight: '600',
      flex: 1,
    },
    priceStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      backgroundColor: '#F4F6F8',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    priceLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 2,
      fontWeight: '500',
    },
    price: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.primaryLight,
    },
    stockPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#D1FAE5',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    stockPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#047857',
    },

    /* VARIANT CHIPS */
    variantChip: {
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      backgroundColor: '#F9FAF8',
      alignItems: 'center',
      minWidth: 80,
    },
    variantChipActive: {
      backgroundColor: COLORS.primaryLight,
      borderColor: COLORS.primaryLight,
    },
    variantChipUnit: {
      fontSize: 13,
      fontWeight: '600',
      color: '#374151',
    },
    variantChipPrice: {
      fontSize: 12,
      color: COLORS.primaryLight,
      marginTop: 2,
      fontWeight: '700',
    },

    /* TABS */
    tabCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    tabItemActive: {
      borderBottomColor: COLORS.primaryLight,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6B7280',
    },
    tabTextActive: {
      color: COLORS.primaryLight,
      fontWeight: '800',
    },
    tabBody: {
      padding: 16,
      gap: 12,
    },

    /* SECTIONS INSIDE TAB */
    section: {
      gap: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F4F1',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    bodyText: {
      fontSize: 13,
      color: '#374151',
      lineHeight: 20,
    },

    /* INFOROW */
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 7,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F4F1',
    },
    infoLabel: {
      flex: 1,
      fontSize: 13,
      color: '#6B7280',
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: '#111827',
    },

    /* EMPTY TAB */
    emptyTab: {
      alignItems: 'center',
      paddingVertical: 30,
      gap: 10,
    },
    emptyText: {
      fontSize: 13,
      color: '#9CA3AF',
    },

    /* VIDEO CARDS */
    videoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: '#F9FAF8',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    videoCardPreview: {
      width: 64,
      height: 64,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#E5E7EB',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoCardPreviewMedia: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    videoCardPlay: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#111827',
    },
    videoSub: {
      fontSize: 11,
      color: '#9CA3AF',
      marginTop: 2,
    },
    videoThumb: {
      width: 140,
      height: 100,
      backgroundColor: '#E5E7EB',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: 14,
      marginRight: 12,
      overflow: 'hidden',
    },
    videoThumbPreview: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    videoThumbOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    videoThumbLabel: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    videoThumbText: {
      fontSize: 12,
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
    },

    /* QUANTITY */
    qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 12,
    },
    qtyBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#FEF9E7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyValue: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1F2937',
      minWidth: 44,
      textAlign: 'center',
    },
    qtyTotal: {
      flex: 1,
      alignItems: 'flex-end',
    },
    qtyTotalLabel: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
    },
    qtyTotalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.primaryLight,
    },

    /* FOOTER */
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      elevation: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: -5 },
    },
    footerLabel: {
      fontSize: 13,
      color: '#6B7280',
      fontWeight: '500',
    },
    footerPrice: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.primaryLight,
    },
    addToCartBtn: {
      backgroundColor: '#1b3e05',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      gap: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 5,
    },
    addToCartBtnDisabled: {
      opacity: 0.6,
    },
    addToCartText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    /* IMAGE VIEWER MODAL */
    modalCloseBtn: {
      position: 'absolute',
      top: 44,
      right: 16,
      zIndex: 10,
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
    },

    /* VIDEO PLAYER MODAL */
    videoModalBg: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoModalClose: {
      position: 'absolute',
      top: 44,
      right: 16,
      zIndex: 20,
      padding: 8,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 20,
    },
    videoPlayer: {
      width: SW,
      height: SW * (9 / 16),
    },
  });

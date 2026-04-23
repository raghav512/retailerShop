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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

/*──────────────────────────────────────────────────────────
  RetailerProductDetail
  route.params: { items[], product }
──────────────────────────────────────────────────────────*/

const { width: SW } = Dimensions.get('window');
const IMG_H = 260;

const RetailerProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const TABS = [
    t('marketplace.tab_overview'),
    t('marketplace.tab_details'),
    t('marketplace.tab_videos'),
  ];

  const { items, product, productId, productName } = route.params || {};

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

  const flatListRef = useRef(null);

  // Fetch full product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const firstItem = items?.[0] || product;

        // Fetch all distributor products and enrich selected marketplace item.
        const allProducts = await apiService.GetFPOProduct();

        if (!allProducts || allProducts.length === 0) {
          setFullProduct(firstItem);
          setLoading(false);
          return;
        }

        // Try to match by image URL (most reliable)
        let productDetails = null;
        const itemImage = firstItem?.productImages?.[0];

        if (itemImage) {
          productDetails = allProducts.find(p => {
            const productImages = p.productImages || [];
            return productImages.some(img => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              return imgUrl === itemImage;
            });
          });
        }

        // If not found by image, try by brand + partial name match
        if (!productDetails && firstItem?.brand && firstItem?.itemName) {
          const itemBrand = firstItem.brand.toLowerCase();
          const itemNameParts = firstItem.itemName.toLowerCase().split(' ');

          productDetails = allProducts.find(p => {
            const productBrand = (p.brand || '').toLowerCase();
            const productName = (p.productName || '').toLowerCase();

            const brandMatch = productBrand === itemBrand;
            const nameMatch = itemNameParts.some(
              part => part.length > 2 && productName.includes(part),
            );

            return brandMatch && nameMatch;
          });
        }

        if (productDetails) {
          setFullProduct(productDetails);
        } else {
          setFullProduct(firstItem);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setFullProduct(items?.[0] || product);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [items, product, productId, productName]);

  /* ── Normalise to flat items array ───────────────────── */
  const allItems = useMemo(() => {
    if (items && items.length > 0) {
      return items.map(item => ({
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
      }));
    }

    if (fullProduct || product) {
      const prod = fullProduct || product;
      return [
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
    }

    return [];
  }, [items, product, fullProduct]);

  const selected = allItems[selectedIndex] || {};

  const images = (selected.productImages || [])
    .map(img => (typeof img === 'string' ? img : img?.url || img))
    .filter(Boolean);

  const videos = (selected.productVideos || [])
    .map(vid => (typeof vid === 'string' ? vid : vid?.url || vid))
    .filter(Boolean);

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
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
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
      const res = await apiService.getCart();
      const cartItems = res?.data?.items || [];
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    } catch (_) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [fetchCartCount]),
  );

  const handleAddToCart = useCallback(async () => {
    try {
      await apiService.addToCart({
        itemId: selected.itemId,
        quantity,
        expectedPrice: selected.price,
      });
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
    }
  }, [selected, quantity, fetchCartCount, t]);

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
              color={RETAILER_COLORS.primaryLight}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('marketplace.product_details')}
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={RETAILER_COLORS.primaryLight}
          />
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="chevron-back"
            size={24}
            color={RETAILER_COLORS.primaryLight}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('marketplace.product_details')}
        </Text>

        <TouchableOpacity
          style={[styles.backBtn, styles.cartBtn]}
          onPress={() => navigation.navigate('RetailerCart')}
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
        contentContainerStyle={styles.scrollBody}
      >
        <View style={styles.galleryCard}>
          {images.length > 0 ? (
            <>
              <View style={styles.mainImageWrap}>
                <FlatList
                  ref={flatListRef}
                  data={images}
                  keyExtractor={(_, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  renderItem={({ item: uri }) => (
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => setIsImageViewerVisible(true)}
                      style={styles.mainImageTouch}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.mainImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                />
                <View style={styles.zoomTag}>
                  <Icon name="expand-outline" size={12} color="#fff" />
                  <Text style={styles.zoomTagText}>
                    {t('marketplace.tap_to_zoom')}
                  </Text>
                </View>
              </View>

              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleThumbnailPress(index)}
                    >
                      <View
                        style={[
                          styles.dot,
                          currentImageIndex === index && styles.dotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbStrip}
                >
                  {images.map((uri, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleThumbnailPress(index)}
                      style={[
                        styles.thumb,
                        currentImageIndex === index && styles.thumbActive,
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
              <View style={[styles.iconWrapper, styles.emptyIconWrap]}>
                <Icon
                  name="image-outline"
                  size={28}
                  color={RETAILER_COLORS.primaryLight}
                />
              </View>
              <Text style={styles.noImageText}>
                {t('marketplace.no_images')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bodyPad}>
          <View style={styles.card}>
            {categoryLabel && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
              </View>
            )}

            <Text style={styles.productName}>{selected.itemName || 'N/A'}</Text>

            <View style={styles.metaRow}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="business"
                  size={16}
                  color={RETAILER_COLORS.primaryLight}
                />
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

          {videos.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconWrapper}>
                  <Icon
                    name="videocam"
                    size={16}
                    color={RETAILER_COLORS.primaryLight}
                  />
                </View>
                <Text style={styles.cardTitle}>
                  {t('marketplace.product_videos', { count: videos.length })}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.videoThumbScroll}
              >
                {videos.map((vid, index) => {
                  const url =
                    typeof vid === 'string' ? vid : vid?.url || vid?.uri || '';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.videoThumb}
                      onPress={() => setVideoModal({ visible: true, url })}
                      activeOpacity={0.8}
                    >
                      <View style={styles.videoThumbPlay}>
                        <Icon
                          name="play-circle"
                          size={36}
                          color={RETAILER_COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.videoThumbText} numberOfLines={1}>
                        {t('marketplace.video_number', { number: index + 1 })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {allItems.length > 1 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconWrapper}>
                  <Icon
                    name="options"
                    size={16}
                    color={RETAILER_COLORS.primaryLight}
                  />
                </View>
                <Text style={styles.cardTitle}>
                  {t('marketplace.select_variant')}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.variantScroll}
              >
                {allItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.itemId || index}
                    onPress={() => handleSelectItem(index)}
                    style={[
                      styles.variantChip,
                      selectedIndex === index && styles.variantChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantChipUnit,
                        selectedIndex === index && styles.variantChipTextActive,
                      ]}
                    >
                      {item.unit}
                    </Text>
                    <Text
                      style={[
                        styles.variantChipPrice,
                        selectedIndex === index &&
                          styles.variantChipSubTextActive,
                      ]}
                    >
                      ₹{item.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.tabCard}>
            <View style={styles.tabBar}>
              {TABS.map((tab, index) => {
                const label =
                  index === 2 && videos.length > 0
                    ? t('marketplace.product_videos', { count: videos.length })
                    : tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tabItem,
                      activeTab === index && styles.tabItemActive,
                    ]}
                    onPress={() => setActiveTab(index)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === index && styles.tabTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                />
                <InfoRow
                  icon="cube-outline"
                  label={t('marketplace.stock_label')}
                  value={`${selected.availableQuantity || 0} ${
                    selected.unit || 'units'
                  }`}
                />
                <InfoRow
                  icon="resize-outline"
                  label={t('marketplace.unit_label')}
                  value={selected.unit || '-'}
                />
                <InfoRow
                  icon="business-outline"
                  label={t('marketplace.brand_label')}
                  value={selected.brand || '-'}
                />
                {categoryLabel && (
                  <InfoRow
                    icon="grid-outline"
                    label={t('marketplace.category_label')}
                    value={categoryLabel}
                  />
                )}
                {targetCropsArray.length > 0 && (
                  <InfoRow
                    icon="leaf-outline"
                    label={t('marketplace.target_crops')}
                    value={targetCropsArray.join(', ')}
                  />
                )}
              </View>
            )}

            {activeTab === 1 && (
              <View style={styles.tabBody}>
                {selected.productTechnicalDetails ? (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          name="beaker"
                          size={14}
                          color={RETAILER_COLORS.primaryLight}
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
                          color={RETAILER_COLORS.primaryLight}
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
                          color={RETAILER_COLORS.primaryLight}
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
                      <View style={[styles.iconWrapper, styles.emptyIconWrap]}>
                        <Icon
                          name="document-text"
                          size={28}
                          color={RETAILER_COLORS.primaryLight}
                        />
                      </View>
                      <Text style={styles.emptyText}>
                        {t('marketplace.no_details')}
                      </Text>
                    </View>
                  )}
              </View>
            )}

            {activeTab === 2 && (
              <View style={styles.tabBody}>
                {videos.length === 0 ? (
                  <View style={styles.emptyTab}>
                    <View style={[styles.iconWrapper, styles.emptyIconWrap]}>
                      <Icon
                        name="videocam-off"
                        size={28}
                        color={RETAILER_COLORS.primaryLight}
                      />
                    </View>
                    <Text style={styles.emptyText}>
                      {t('marketplace.no_videos')}
                    </Text>
                  </View>
                ) : (
                  videos.map((vid, index) => {
                    const url =
                      typeof vid === 'string'
                        ? vid
                        : vid?.url || vid?.uri || '';
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.videoCard}
                        onPress={() => setVideoModal({ visible: true, url })}
                        activeOpacity={0.8}
                      >
                        <View style={styles.videoPlayCircle}>
                          <Icon name="play" size={22} color="#fff" />
                        </View>
                        <View style={styles.videoMeta}>
                          <Text style={styles.videoTitle}>
                            {t('marketplace.product_video_number', {
                              number: index + 1,
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

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="layers"
                  size={16}
                  color={RETAILER_COLORS.primaryLight}
                />
              </View>
              <Text style={styles.cardTitle}>{t('marketplace.quantity')}</Text>
            </View>

            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon
                  name="remove"
                  size={20}
                  color={RETAILER_COLORS.primaryLight}
                />
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
                <Icon
                  name="add"
                  size={20}
                  color={RETAILER_COLORS.primaryLight}
                />
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
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{t('marketplace.total_price')}</Text>
          <Text style={styles.footerPrice}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Icon name="cart" size={20} color="#ffffff" />
          <Text style={styles.addToCartText}>
            {t('marketplace.add_to_cart')}
          </Text>
        </TouchableOpacity>
      </View>

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
          onChange={index => {
            if (typeof index === 'number') {
              setCurrentImageIndex(index);
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }
          }}
        />
      </Modal>

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

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={15} color={RETAILER_COLORS.primaryLight} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default RetailerProductDetail;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
    backgroundColor: RETAILER_COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RETAILER_COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: RETAILER_COLORS.textSecondary,
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.background,
  },

  header: {
    backgroundColor: RETAILER_COLORS.tintCard,
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
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  headerTitle: {
    color: RETAILER_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RETAILER_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    backgroundColor: '#FEF2F2',
  },
  headerRightPlaceholder: {
    width: 44,
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

  scrollBody: {
    paddingBottom: 100,
  },

  galleryCard: {
    backgroundColor: RETAILER_COLORS.surface,
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  mainImageWrap: {
    height: IMG_H,
    overflow: 'hidden',
  },
  mainImageTouch: {
    width: SW - 32,
    height: IMG_H,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    height: IMG_H,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  noImageText: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
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
    backgroundColor: RETAILER_COLORS.tintMid,
  },
  dotActive: {
    width: 18,
    backgroundColor: RETAILER_COLORS.primaryLight,
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
    borderColor: RETAILER_COLORS.primaryLight,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },

  bodyPad: {
    padding: 16,
    paddingBottom: 0,
    gap: 12,
  },

  card: {
    backgroundColor: RETAILER_COLORS.surface,
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
    color: RETAILER_COLORS.textPrimary,
  },

  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: RETAILER_COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: RETAILER_COLORS.tintMid,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: RETAILER_COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
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
    color: RETAILER_COLORS.textSecondary,
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
    backgroundColor: RETAILER_COLORS.tintCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
  },
  priceLabel: {
    fontSize: 12,
    color: RETAILER_COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: RETAILER_COLORS.primaryLight,
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

  videoThumbScroll: {
    marginTop: 12,
  },
  variantScroll: {
    marginTop: 10,
  },

  variantChip: {
    borderWidth: 1.5,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: RETAILER_COLORS.tint,
    alignItems: 'center',
    minWidth: 80,
  },
  variantChipActive: {
    backgroundColor: RETAILER_COLORS.secondary,
    borderColor: RETAILER_COLORS.primaryLight,
  },
  variantChipUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
  },
  variantChipPrice: {
    fontSize: 12,
    color: RETAILER_COLORS.primaryLight,
    marginTop: 2,
    fontWeight: '700',
  },
  variantChipTextActive: {
    color: RETAILER_COLORS.primary,
  },
  variantChipSubTextActive: {
    color: RETAILER_COLORS.primary,
    opacity: 1,
  },

  tabCard: {
    backgroundColor: RETAILER_COLORS.surface,
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
    borderBottomColor: RETAILER_COLORS.tintMid,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: RETAILER_COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: RETAILER_COLORS.textSecondary,
  },
  tabTextActive: {
    color: RETAILER_COLORS.primary,
    fontWeight: '800',
  },
  tabBody: {
    padding: 16,
    gap: 12,
  },

  section: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: RETAILER_COLORS.tint,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13,
    color: RETAILER_COLORS.textPrimary,
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: RETAILER_COLORS.tint,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
  },

  emptyTab: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
  },

  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: RETAILER_COLORS.tint,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.tintMid,
  },
  videoPlayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RETAILER_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoMeta: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: RETAILER_COLORS.textPrimary,
  },
  videoSub: {
    fontSize: 11,
    color: RETAILER_COLORS.textSecondary,
    marginTop: 2,
  },
  videoThumb: {
    width: 140,
    height: 100,
    backgroundColor: RETAILER_COLORS.tint,
    borderWidth: 1.5,
    borderColor: RETAILER_COLORS.tintMid,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  videoThumbPlay: {
    marginBottom: 6,
  },
  videoThumbText: {
    fontSize: 12,
    color: RETAILER_COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

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
    backgroundColor: RETAILER_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: RETAILER_COLORS.textPrimary,
    minWidth: 44,
    textAlign: 'center',
  },
  qtyTotal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  qtyTotalLabel: {
    fontSize: 12,
    color: RETAILER_COLORS.textSecondary,
    fontWeight: '500',
  },
  qtyTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: RETAILER_COLORS.primaryLight,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: RETAILER_COLORS.tintCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
  },
  footerLabel: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
    fontWeight: '500',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: RETAILER_COLORS.primaryLight,
  },
  addToCartBtn: {
    backgroundColor: RETAILER_COLORS.primaryLight,
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
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  modalCloseBtn: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },

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

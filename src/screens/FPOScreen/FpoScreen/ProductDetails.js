import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  FlatList,
  Modal,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ImageViewer from 'react-native-image-zoom-viewer';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');

const ProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const images = product?.productImages || [];
  const variants = product?.products || [];

  const viewerImages = images.map(img => ({ url: img?.url || img }));

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentImageIndex(viewableItems[0].index);
  }).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleThumbnailPress = (index) => {
    setCurrentImageIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={FPO_COLORS.primary} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 16 }]}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("product_details_title")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGES */}
        {images.length > 0 && (
          <View style={styles.imageSection}>
            {/* SWIPEABLE MAIN IMAGE */}
            <View style={styles.mainImageContainer}>
              <FlatList
                ref={flatListRef}
                data={images}
                keyExtractor={(_, i) => i.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsZoomVisible(true)}
                    style={{ width: width, height: 300 }}
                  >
                    <Image
                      source={{ uri: item?.url || item }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              />
              {/* DOT INDICATORS */}
              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
                {images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleThumbnailPress(index)}
                    style={[styles.thumbnail, currentImageIndex === index && styles.thumbnailActive]}
                  >
                    <Image source={{ uri: img?.url || img }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* ZOOM MODAL */}
            <Modal
              visible={isZoomVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setIsZoomVisible(false)}
            >
              <ImageViewer
                imageUrls={viewerImages}
                index={currentImageIndex}
                enableSwipeDown
                onSwipeDown={() => setIsZoomVisible(false)}
                onChange={(idx) => setCurrentImageIndex(idx ?? 0)}
                renderHeader={() => (
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setIsZoomVisible(false)}
                  >
                    <Icon name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                )}
              />
            </Modal>
          </View>
        )}

        <View style={styles.content}>
          {/* CATEGORY */}
          {product?.productCategory ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof product.productCategory === 'string' 
                  ? product.productCategory.replace(/_/g, ' ') 
                  : product.productCategory}
              </Text>
            </View>
          ) : null}

          {/* PRODUCT INFO */}
          <Text style={styles.productName}>{product?.productName}</Text>
          <Text style={styles.brand}>{t("brand_label")}{product?.brand}</Text>
          
          {product?.targetCrops && product.targetCrops.length > 0 && (
            <Text style={styles.targetCrops}>{t("targets_label")}{product.targetCrops.join(', ')}</Text>
          )}

          <Text style={styles.sectionTitle}>{t("product_description")}</Text>
          <Text style={styles.description}>{product?.description}</Text>

          {/* ADDITIONAL DETAILS */}
          {product?.productTechnicalDetails ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>{t("technical_details")}</Text>
              <Text style={styles.description}>{product.productTechnicalDetails}</Text>
            </View>
          ) : null}

          {product?.howToUse ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>{t("how_to_use")}</Text>
              <Text style={styles.description}>{product.howToUse}</Text>
            </View>
          ) : null}

          {product?.productBenefits ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>{t("benefits")}</Text>
              <Text style={styles.description}>{product.productBenefits}</Text>
            </View>
          ) : null}

          {/* VIDEOS */}
          {product?.productVideos && product.productVideos.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>{t("product_videos_title")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
                {product.productVideos.map((vid, vIdx) => (
                  <TouchableOpacity 
                    key={vIdx} 
                    style={styles.videoThumbnail} 
                    onPress={() => Linking.openURL(vid.url).catch(err => console.log("Video Open Error", err))}
                  >
                    <Icon name="play-circle" size={40} color={FPO_COLORS.primary} />
                    <Text style={styles.videoText} numberOfLines={1}>{t("watch_video")} {vIdx + 1}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* VARIANTS */}
          <Text style={styles.sectionTitle}>{t("available_variants")}</Text>
          {variants.map((variant, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.variantCard, selectedVariant === index && styles.variantCardActive]}
              onPress={() => setSelectedVariant(index)}
            >
              <View style={styles.variantLeft}>
                <Text style={styles.variantParam}>{variant.parameter} {variant.unit}</Text>
                <Text style={styles.variantPrice}>₹{variant.mrp}</Text>
              </View>
              <View style={styles.variantRight}>
                <Text style={styles.variantQty}>{t("stock_label")}{variant.quantity}</Text>
                <Text style={styles.variantDate}>{t("exp_label")}{variant.expiryDate?.split('T')[0]}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* SELECTED VARIANT DETAILS */}
          {variants[selectedVariant] && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>{t("selected_variant_details")}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("parameter_label")}</Text>
                <Text style={styles.detailValue}>{variants[selectedVariant].parameter} {variants[selectedVariant].unit}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("mrp_label")}</Text>
                <Text style={styles.detailValue}>₹{variants[selectedVariant].mrp}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("quantity_label")}</Text>
                <Text style={styles.detailValue}>{variants[selectedVariant].quantity}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("purchase_date_label")}</Text>
                <Text style={styles.detailValue}>{variants[selectedVariant].purchaseDate?.split('T')[0]}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("expiry_date_label")}</Text>
                <Text style={styles.detailValue}>{variants[selectedVariant].expiryDate?.split('T')[0]}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  header: {
    backgroundColor: FPO_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 18,
    justifyContent: "space-between",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  imageSection: {
    backgroundColor: "#fff",
  },
  mainImageContainer: {
    height: 300,
    overflow: 'hidden',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 44,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  thumbnailScroll: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: FPO_COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    resizeMode: "cover",
  },
  content: {
    padding: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: FPO_COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  targetCrops: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
    marginBottom: 12,
  },
  detailSection: {
    marginBottom: 8,
  },
  videoScroll: {
    marginTop: 4,
  },
  videoThumbnail: {
    width: 120,
    height: 80,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    padding: 8,
  },
  videoText: {
    marginTop: 6,
    fontSize: 12,
    color: FPO_COLORS.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  variantCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  variantCardActive: {
    borderColor: FPO_COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  variantLeft: {
    flex: 1,
  },
  variantParam: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 4,
  },
  variantRight: {
    alignItems: "flex-end",
  },
  variantQty: {
    fontSize: 12,
    color: "#6B7280",
  },
  variantDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
});

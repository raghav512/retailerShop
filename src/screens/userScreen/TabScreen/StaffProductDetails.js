import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { STAFF_COLORS } from '../../../colorsList/ColorList';
 
const THEME = STAFF_COLORS.primary;
 
const StaffProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { product } = route.params;
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
 
  const images = product?.productImages || [];
  const variants = product?.products || [];
  const activeVariant = variants[selectedVariant];
 
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
 
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("staff_product_details.title")}</Text>
        <View style={{ width: 40 }} />
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
 
        {/* IMAGE VIEWER */}
        {images.length > 0 ? (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: images[currentImageIndex]?.url }}
              style={styles.mainImage}
            />
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll} contentContainerStyle={{ gap: 10 }}>
                {images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setCurrentImageIndex(index)}
                    style={[styles.thumbnail, currentImageIndex === index && styles.thumbnailActive]}
                  >
                    <Image source={{ uri: img.url }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {/* Dot indicators */}
            {images.length > 1 && (
              <View style={styles.dotsRow}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === currentImageIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="cube-outline" size={56} color="#D1D5DB" />
            <Text style={styles.imagePlaceholderText}>{t("staff_product_details.no_images")}</Text>
          </View>
        )}
 
        {/* PRODUCT INFO CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="cube" size={16} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("staff_product_details.product_info")}</Text>
          </View>
 
          <Text style={styles.productName}>{product?.productName}</Text>
 
          <View style={styles.tagRow}>
            <View style={styles.brandBadge}>
              <Icon name="business-outline" size={13} color={THEME} />
              <Text style={styles.brandBadgeText}>{product?.brand}</Text>
            </View>
            {product?.productCategory && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.productCategory}</Text>
              </View>
            )}
          </View>
 
          {product?.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}
 
          {product?.targetCrops?.length > 0 && (
            <View style={styles.cropsRow}>
              <Icon name="leaf-outline" size={14} color={THEME} />
              <Text style={styles.cropsText}>{Array.isArray(product.targetCrops) ? product.targetCrops.join(", ") : product.targetCrops}</Text>
            </View>
          )}
        </View>
 
        {/* VARIANTS */}
        {variants.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Icon name="layers" size={16} color={THEME} /></View>
              <Text style={styles.sectionTitle}>{t("staff_product_details.available_variants")}</Text>
            </View>
 
            {variants.map((variant, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.variantCard, selectedVariant === index && styles.variantCardActive]}
                onPress={() => setSelectedVariant(index)}
                activeOpacity={0.8}
              >
                <View style={styles.variantLeft}>
                  <Text style={styles.variantParam}>{variant.parameter} {variant.unit}</Text>
                  <Text style={styles.variantPrice}>₹{variant.mrp}</Text>
                </View>
                <View style={styles.variantRight}>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>{t("staff_product_details.stock")}: {variant.quantity}</Text>
                  </View>
                  <Text style={styles.variantDate}>{t("staff_product_details.expiry")}: {variant.expiryDate?.split('T')[0] || '—'}</Text>
                </View>
                {selectedVariant === index && (
                  <View style={styles.checkBadge}>
                    <Icon name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
 
        {/* SELECTED VARIANT DETAILS */}
        {activeVariant && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Icon name="information-circle" size={16} color={THEME} /></View>
              <Text style={styles.sectionTitle}>{t("staff_product_details.variant_details", { index: selectedVariant + 1 })}</Text>
            </View>
 
            {[
              { label: t("staff_product_details.sku_parameter"), value: `${activeVariant.parameter} ${activeVariant.unit}`, icon: "barcode-outline" },
              { label: t("staff_product_details.mrp"), value: `₹${activeVariant.mrp}`, icon: "cash-outline" },
              { label: t("staff_product_details.stock_quantity"), value: `${activeVariant.quantity}`, icon: "cube-outline" },
              { label: t("staff_product_details.purchase_date"), value: activeVariant.purchaseDate?.split('T')[0] || '—', icon: "calendar-outline" },
              { label: t("staff_product_details.expiry_date"), value: activeVariant.expiryDate?.split('T')[0] || '—', icon: "time-outline" },
            ].map((row, i) => (
              <View key={i} style={[styles.detailRow, i === 4 && { borderBottomWidth: 0 }]}>
                <View style={styles.detailLabelRow}>
                  <Icon name={row.icon} size={15} color="#9CA3AF" />
                  <Text style={styles.detailLabel}>{row.label}</Text>
                </View>
                <Text style={[styles.detailValue, row.label === t("staff_product_details.mrp") && { color: THEME }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}
 
        {/* PRODUCT DETAILS */}
        {(product?.productTechnicalDetails || product?.howToUse || product?.productBenefits) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Icon name="document-text" size={16} color={THEME} /></View>
              <Text style={styles.sectionTitle}>{t("staff_product_details.technical_details")}</Text>
            </View>
 
            {product?.productTechnicalDetails ? (
              <>
                <Text style={styles.detailSectionLabel}>{t("staff_product_details.technical_info")}</Text>
                <Text style={styles.detailSectionText}>{product.productTechnicalDetails}</Text>
              </>
            ) : null}
            {product?.howToUse ? (
              <>
                <Text style={[styles.detailSectionLabel, { marginTop: 12 }]}>{t("staff_product_details.how_to_use")}</Text>
                <Text style={styles.detailSectionText}>{product.howToUse}</Text>
              </>
            ) : null}
            {product?.productBenefits ? (
              <>
                <Text style={[styles.detailSectionLabel, { marginTop: 12 }]}>{t("staff_product_details.benefits")}</Text>
                <Text style={styles.detailSectionText}>{product.productBenefits}</Text>
              </>
            ) : null}
          </View>
        )}
 
      </ScrollView>
    </View>
  );
};

export default StaffProductDetails;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: "#ffffff", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, zIndex: 10, justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  scroll: { padding: 16, paddingBottom: 40 },

  /* IMAGE CARD */
  imageCard: {
    backgroundColor: "#ffffff", borderRadius: 24, overflow: "hidden", marginBottom: 20,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  mainImage: { width: "100%", height: 280, resizeMode: "cover" },
  thumbnailScroll: { paddingHorizontal: 16, paddingVertical: 12 },
  thumbnail: { width: 64, height: 64, borderRadius: 14, borderWidth: 2, borderColor: "#E5E7EB", overflow: "hidden" },
  thumbnailActive: { borderColor: THEME },
  thumbnailImage: { width: "100%", height: "100%", resizeMode: "cover" },
  dotsRow: { flexDirection: "row", justifyContent: "center", paddingBottom: 14, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: THEME, width: 18 },

  /* PLACEHOLDER */
  imagePlaceholder: {
    backgroundColor: "#ffffff", borderRadius: 24, height: 180, marginBottom: 20,
    justifyContent: "center", alignItems: "center", gap: 8,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  imagePlaceholderText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#FAF7E8", alignItems: "center", justifyContent: "center", marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  /* PRODUCT INFO */
  productName: { fontSize: 22, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  tagRow: { flexDirection: "row", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  brandBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FAF7E8", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  brandBadgeText: { fontSize: 13, color: THEME, fontWeight: "700" },
  categoryBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  categoryBadgeText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  description: { fontSize: 14, color: "#4B5563", lineHeight: 22, marginBottom: 12 },
  cropsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  cropsText: { fontSize: 13, color: "#6B7280", fontWeight: "500", flex: 1 },

  /* VARIANT CARDS */
  variantCard: {
    backgroundColor: "#FAFAFA", borderRadius: 20, padding: 16, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1.5, borderColor: "#E5E7EB", position: "relative",
  },
  variantCardActive: { borderColor: THEME, backgroundColor: "#FEF9E7" },
  variantLeft: { flex: 1 },
  variantParam: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  variantPrice: { fontSize: 20, fontWeight: "800", color: THEME, marginTop: 4 },
  variantRight: { alignItems: "flex-end", gap: 6 },
  stockBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  stockText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  variantDate: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  checkBadge: { position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: 11, backgroundColor: THEME, justifyContent: "center", alignItems: "center" },

  /* DETAIL ROWS */
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  detailLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#1F2937" },

  /* TECHNICAL SECTIONS */
  detailSectionLabel: { fontSize: 13, fontWeight: "700", color: "#4B5563", marginBottom: 6 },
  detailSectionText: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
});

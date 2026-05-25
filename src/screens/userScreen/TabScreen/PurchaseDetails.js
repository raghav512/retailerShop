import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import i18n from "../../../i18n";
import apiService from "../../../Redux/apiService";
import ReactNativeBlobUtil from "react-native-blob-util";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const PurchaseDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, ready, i18n: i18nInstance } = useTranslation();
  const { purchaseId } = route.params || {};
 
  // Debug: Check i18n status
  useEffect(() => {
    console.log('🌐 i18n ready:', ready);
    console.log('🌐 Current language:', i18nInstance.language);
    console.log('🌐 Test translation:', t('purchase.details'));
    console.log('🌐 Resources loaded:', i18nInstance.hasResourceBundle('en', 'translation'));
    console.log('🌐 Purchase key exists:', i18nInstance.exists('purchase.details'));
  }, [ready, i18nInstance.language]);
 
  // Safe translation function with fallback
  const safeT = (key, fallback, options = {}) => {
    if (!ready || !i18nInstance.exists(key)) {
      // If fallback contains interpolation, replace it
      if (fallback && typeof fallback === 'string' && options) {
        return Object.keys(options).reduce((str, optKey) => {
          return str.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
        }, fallback);
      }
      return fallback || key;
    }
    return t(key, options);
  };

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
 
  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseDetails();
    } else {
      setLoading(false);
      showAlert({
        type: "error",
        title: safeT("common.error", "Error"),
        message: safeT("purchase.error_missing_id", "Purchase ID is missing"),
      });
      navigation.goBack();
    }
  }, [purchaseId]);
 
  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPurchaseById(purchaseId);
      console.log("Backend Purchase Response:", JSON.stringify(res));
      
      let fetchedPurchase = null;
      if (res?.data?.purchase) {
        fetchedPurchase = res.data.purchase;
      } else if (res?.data) {
        fetchedPurchase = Array.isArray(res.data) ? res.data[0] : res.data;
      } else if (res) {
        fetchedPurchase = Array.isArray(res) ? res[0] : res;
      }
 
      if (fetchedPurchase) {
        setPurchase(fetchedPurchase);
      } else {
        showAlert({ type: "error", title: safeT("common.error", "Error"), message: safeT("purchase.error_empty_data", "No purchase data found") });
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      showAlert({
        type: "error",
        title: safeT("common.error", "Error"),
        message: safeT("purchase.error_failed_load", "Failed to load purchase details"),
      });
    } finally {
      setLoading(false);
    }
  };
 
  const downloadReceipt = async () => {
    try {
      setDownloading(true);
      const { url, token } = await apiService.downloadPurchaseReceipt(purchaseId);
 
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const downloadDir = Platform.OS === "android" ? dirs.DownloadDir : dirs.DocumentDir;
      const fileName = `receipt_${purchaseId}.pdf`;
      const filePath = `${downloadDir}/${fileName}`;
 
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: safeT("purchase.downloading_receipt", "Downloading receipt..."),
          mime: "application/pdf",
          title: fileName,
        },
        path: filePath,
      }).fetch("GET", url, {
        Authorization: `Bearer ${token}`,
      });
 
      if (Platform.OS === "ios") {
        ReactNativeBlobUtil.ios.previewDocument(res.path());
      } else {
        showAlert({
          type: "success",
          title: safeT("common.success", "Success"),
          message: safeT("purchase.receipt_saved", "Receipt saved to Downloads"),
        });
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      showAlert({
        type: "error",
        title: safeT("common.error", "Error"),
        message: safeT("purchase.error_failed_download", "Failed to download receipt"),
      });
    } finally {
      setDownloading(false);
    }
  };
 
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
      </View>
    );
  }
 
  if (!purchase) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{safeT("purchase.no_data", "No purchase data available")}</Text>
      </View>
    );
  }
 
  const farmerName = purchase.farmer && purchase.farmer.firstName
    ? `${purchase.farmer.firstName} ${purchase.farmer.lastName || ""}`
    : purchase.farmerName || safeT("purchase.unknown_farmer", "Unknown Farmer");
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{safeT("purchase.details", "Purchase Details")}</Text>
        <View style={{ width: 24 }} />
      </View>
 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{safeT("purchase.farmer_details", "Farmer Details")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.name_colon", "Name:")}</Text>
            <Text style={styles.value}>{farmerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.date_colon", "Date:")}</Text>
            <Text style={styles.value}>
              {new Date(purchase.procurementDate || purchase.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.receipt_code", "Receipt Code:")}</Text>
            <Text style={styles.value}>{purchase._id ? purchase._id.slice(-6).toUpperCase() : safeT("common.not_available", "Not Available")}</Text>
          </View>
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{safeT("purchase.crops_purchased", "Crops Purchased")}</Text>
          {purchase.crops && purchase.crops.length > 0 ? (
            purchase.crops.map((crop, index) => (
              <View key={index} style={styles.cropRow}>
                <View>
                  <Text style={styles.cropName}>{crop.cropName} {crop.variety ? `(${crop.variety})` : ""}</Text>
                </View>
                <View style={styles.cropDetails}>
                  <Text style={styles.cropQty}>{crop.quantity} {safeT("purchase.unit_quintal", "Quintal")}</Text>
                  <Text style={styles.cropRate}>₹{crop.rate}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.value}>{safeT("purchase.no_crops_found", "No crops found")}</Text>
          )}
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{safeT("purchase.additional_details", "Additional Details")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.center_colon", "Center:")}</Text>
            <Text style={styles.value}>{purchase.procurementCenter || safeT("common.not_available", "Not Available")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.godown_colon", "Godown:")}</Text>
            <Text style={styles.value}>{purchase.godown || safeT("common.not_available", "Not Available")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.vehicle_colon", "Vehicle:")}</Text>
            <Text style={styles.value}>{purchase.vehicle || safeT("common.not_available", "Not Available")}</Text>
          </View>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Text style={styles.label}>{safeT("purchase.remarks_colon", "Remarks:")}</Text>
            <Text style={[styles.value, { flex: 1, textAlign: 'right', marginLeft: 16 }]}>{purchase.remarks || safeT("common.not_available", "Not Available")}</Text>
          </View>
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{safeT("purchase.summary", "Summary")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.previous_dues", "Previous Dues:")}</Text>
            <Text style={styles.value}>₹{purchase.previousDues || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safeT("purchase.total_amount_colon", "Total Amount:")}</Text>
            <Text style={styles.amount}>₹{purchase.totalAmount || 0}</Text>
          </View>
        </View>
 
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={downloadReceipt}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="download-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>{safeT("purchase.download_receipt", "Download Receipt")}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PurchaseDetails;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "700",
  },
  cropRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  cropName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  cropDetails: {
    alignItems: "flex-end",
  },
  cropQty: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "600",
  },
  cropRate: {
    fontSize: 12,
    color: "#6B7280",
  },
  downloadBtn: {
    flexDirection: "row",
    backgroundColor: STAFF_COLORS.primary,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

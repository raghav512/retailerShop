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
import apiService from "../../../Redux/apiService";
import ReactNativeBlobUtil from "react-native-blob-util";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const PurchaseDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { purchaseId } = route.params || {};
 
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
        title: t("common.error"),
        message: t("purchase.error_missing_id"),
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
        showAlert({ type: "error", title: t("common.error"), message: t("purchase.error_empty_data") });
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      showAlert({
        type: "error",
        title: t("common.error"),
        message: t("purchase.error_failed_load"),
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
          description: t("purchase.downloading_receipt"),
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
          title: t("common.success"),
          message: t("purchase.receipt_downloaded", { path: filePath }),
        });
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      showAlert({
        type: "error",
        title: t("common.error"),
        message: t("purchase.error_failed_download"),
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
        <Text>{t("purchase.no_data")}</Text>
      </View>
    );
  }
 
  const farmerName = purchase.farmer && purchase.farmer.firstName
    ? `${purchase.farmer.firstName} ${purchase.farmer.lastName || ""}`
    : purchase.farmerName || t("purchase.unknown_farmer");
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("purchase.details")}</Text>
        <View style={{ width: 24 }} />
      </View>
 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("purchase.farmer_details")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.name_colon")}</Text>
            <Text style={styles.value}>{farmerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.date_colon")}</Text>
            <Text style={styles.value}>
              {new Date(purchase.procurementDate || purchase.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.receipt_code")}</Text>
            <Text style={styles.value}>{purchase._id ? purchase._id.slice(-6).toUpperCase() : t("common.not_available")}</Text>
          </View>
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("purchase.crops_purchased")}</Text>
          {purchase.crops && purchase.crops.length > 0 ? (
            purchase.crops.map((crop, index) => (
              <View key={index} style={styles.cropRow}>
                <View>
                  <Text style={styles.cropName}>{crop.cropName} {crop.variety ? `(${crop.variety})` : ""}</Text>
                </View>
                <View style={styles.cropDetails}>
                  <Text style={styles.cropQty}>{crop.quantity} {t("purchase.unit_quintal")}</Text>
                  <Text style={styles.cropRate}>₹{crop.rate}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.value}>{t("purchase.no_crops_found")}</Text>
          )}
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("purchase.additional_details")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.center_colon")}</Text>
            <Text style={styles.value}>{purchase.procurementCenter || t("common.not_available")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.godown_colon")}</Text>
            <Text style={styles.value}>{purchase.godown || t("common.not_available")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.vehicle_colon")}</Text>
            <Text style={styles.value}>{purchase.vehicle || t("common.not_available")}</Text>
          </View>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Text style={styles.label}>{t("purchase.remarks_colon")}</Text>
            <Text style={[styles.value, { flex: 1, textAlign: 'right', marginLeft: 16 }]}>{purchase.remarks || t("common.not_available")}</Text>
          </View>
        </View>
 
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("purchase.summary")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.previous_dues")}</Text>
            <Text style={styles.value}>₹{purchase.previousDues || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("purchase.total_amount_colon")}</Text>
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
              <Text style={styles.btnText}>{t("purchase.download_receipt")}</Text>
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

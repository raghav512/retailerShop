import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import DatePicker from "react-native-date-picker";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import apiService from "../../../Redux/apiService";
import Icon from "react-native-vector-icons/Ionicons";

import { STAFF_COLORS } from '../../../colorsList/ColorList';

const EMPTY_CROP = { cropName: "", variety: "", rate: "", quantity: "" };
const THEME = STAFF_COLORS.primary;

const AddPurchaseEntry = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [farmer, setFarmer] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [crops, setCrops] = useState([{ ...EMPTY_CROP }]);
  const [procurementDate, setProcurementDate] = useState("");
  const [procurementCenter, setProcurementCenter] = useState("");
  const [godown, setGodown] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [previousDues, setPreviousDues] = useState("");
  const [remarks, setRemarks] = useState("");
  const [openProcurement, setOpenProcurement] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [showFarmerModal, setShowFarmerModal] = useState(false);

  // ── Crop helpers ─────────────────────────────────────────────────────────
  const handleCropChange = (index, key, value) => {
    setCrops((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const addCrop = () => setCrops((prev) => [...prev, { ...EMPTY_CROP }]);
  const removeCrop = (index) => {
    if (crops.length === 1) return;
    setCrops((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!farmer || !procurementDate || !procurementCenter) {
      showAlert({ type: "warning", title: t("error"), message: t("fill_required_fields") });
      return;
    }
    const hasInvalidCrop = crops.some((c) => !c.cropName || !c.rate || !c.quantity);
    if (hasInvalidCrop) {
      showAlert({ type: "warning", title: t("error"), message: "Please fill crop name, rate and quantity for all crops." });
      return;
    }
    const payload = {
      farmer,
      crops: crops.map((c) => ({
        cropName: c.cropName,
        variety: c.variety,
        rate: Number(c.rate),
        quantity: Number(c.quantity),
      })),
      procurementDate,
      procurementCenter,
      godown,
      vehicle,
      previousDues: Number(previousDues) || 0,
      remarks,
    };
    try {
      const res = await apiService.Stafproduct(payload);
      showAlert({ type: "success", title: "Success", message: res?.message || "Purchase recorded successfully." });
      navigation.navigate("Performance");
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: "Something went wrong. Please try again." });
    }
  };

  // ── Farmers ───────────────────────────────────────────────────────────────
  const fetchFarmers = async () => {
    try {
      const res = await apiService.getAllFarmers();
      setFarmers(res || []);
    } catch (error) {
      console.log("Farmer fetch error", error);
    }
  };
  useEffect(() => { fetchFarmers(); }, []);

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={STAFF_COLORS.primary} translucent={false} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("purchase.add_title")}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── FARMER SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="person" size={18} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>{t("purchase.farmer")}</Text>
          </View>

          <Text style={styles.label}>{t("purchase.farmer")} *</Text>
          <TouchableOpacity
            style={[styles.input, styles.inputRow]}
            activeOpacity={0.8}
            onPress={() => setShowFarmerModal(true)}
          >
            <Text style={{ color: farmer ? "#1F2937" : "#9CA3AF", fontSize: 15 }}>
              {farmerName || t("purchase.choose_farmer")}
            </Text>
            <Icon name="chevron-down" size={20} color={THEME} />
          </TouchableOpacity>
        </View>

        {/* ── CROPS SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="leaf" size={18} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>{t("purchase.crop")}</Text>
          </View>

          {crops.map((cropItem, index) => (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropCardHeader}>
                <Text style={styles.cropCardLabel}>🌾 Crop {index + 1}</Text>
                {crops.length > 1 && (
                  <TouchableOpacity onPress={() => removeCrop(index)} activeOpacity={0.7}>
                    <Icon name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>Crop Name *</Text>
              <TextInput
                placeholder="e.g. Soybean"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={cropItem.cropName}
                onChangeText={(v) => handleCropChange(index, "cropName", v)}
              />

              <Text style={styles.label}>Variety</Text>
              <TextInput
                placeholder="e.g. JS 335"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={cropItem.variety}
                onChangeText={(v) => handleCropChange(index, "variety", v)}
              />

              <View style={styles.twoCol}>
                <View style={styles.colHalf}>
                  <Text style={styles.label}>Rate (₹) *</Text>
                  <TextInput
                    placeholder="per/quintal"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="numeric"
                    value={cropItem.rate}
                    onChangeText={(v) => handleCropChange(index, "rate", v)}
                  />
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    placeholder="In Quintal"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="numeric"
                    value={cropItem.quantity}
                    onChangeText={(v) => handleCropChange(index, "quantity", v)}
                  />
                </View>
              </View>

              {cropItem.rate && cropItem.quantity ? (
                <View style={styles.amountPreviewBox}>
                  <Icon name="cash-outline" size={16} color="#10B981" />
                  <Text style={styles.amountPreview}>
                    ₹{(Number(cropItem.rate) * Number(cropItem.quantity)).toLocaleString("en-IN")}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}

          <TouchableOpacity style={styles.addCropBtn} onPress={addCrop} activeOpacity={0.8}>
            <View style={styles.addCropIcon}>
              <Icon name="add" size={18} color={THEME} />
            </View>
            <Text style={styles.addCropText}>Add Another Crop</Text>
          </TouchableOpacity>
        </View>

        {/* ── PROCUREMENT DETAILS SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="document-text" size={18} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>Procurement Details</Text>
          </View>

          <Text style={styles.label}>{t("purchase.date")} *</Text>
          <TouchableOpacity
            style={[styles.input, styles.inputRow]}
            activeOpacity={0.8}
            onPress={() => setOpenProcurement(true)}
          >
            <Text style={{ color: procurementDate ? "#1F2937" : "#9CA3AF", fontSize: 15 }}>
              {procurementDate || "YYYY-MM-DD"}
            </Text>
            <Icon name="calendar-outline" size={20} color={THEME} />
          </TouchableOpacity>
          <DatePicker
            modal
            open={openProcurement}
            date={procurementDate ? new Date(procurementDate) : new Date()}
            mode="date"
            onConfirm={(date) => {
              setOpenProcurement(false);
              setProcurementDate(date.toISOString().split("T")[0]);
            }}
            onCancel={() => setOpenProcurement(false)}
          />

          <Text style={styles.label}>{t("purchase.center")} *</Text>
          <TextInput
            placeholder="Enter procurement center"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={procurementCenter}
            onChangeText={setProcurementCenter}
          />

          <Text style={styles.label}>{t("purchase.godown")}</Text>
          <TextInput
            placeholder="Enter godown"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={godown}
            onChangeText={setGodown}
          />

          <Text style={styles.label}>{t("purchase.vehicle")}</Text>
          <TextInput
            placeholder="Enter vehicle details"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={vehicle}
            onChangeText={setVehicle}
          />
        </View>

        {/* ── FINANCIALS SECTION ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="wallet" size={18} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>Financials & Remarks</Text>
          </View>

          <Text style={styles.label}>Previous Dues (₹)</Text>
          <TextInput
            placeholder="Enter previous dues"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
            value={previousDues}
            onChangeText={setPreviousDues}
          />

          <Text style={styles.label}>{t("purchase.remarks")}</Text>
          <TextInput
            placeholder="Enter remarks"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.remarks]}
            multiline
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.85}>
          <Icon name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitText}>{t("common.save")}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FARMER MODAL */}
      <Modal visible={showFarmerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Farmer</Text>
            <FlatList
              data={farmers}
              keyExtractor={(item) => item._id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.farmerItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    setFarmer(item._id);
                    setFarmerName(`${item.firstName} ${item.lastName}`);
                    setShowFarmerModal(false);
                  }}
                >
                  <View style={styles.farmerAvatarBox}>
                    <Icon name="person-outline" size={18} color={THEME} />
                  </View>
                  <View>
                    <Text style={styles.farmerName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.farmerPhone}>{item.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFarmerModal(false)} activeOpacity={0.8}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddPurchaseEntry;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },

  /* BODY */
  body: { padding: 16, paddingBottom: 40 },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "#FAF7E8",
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },

  /* LABEL & INPUT */
  label: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    color: "#1F2937",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remarks: { height: 88, textAlignVertical: "top" },

  /* TWO COLUMN */
  twoCol: { flexDirection: "row", gap: 12 },
  colHalf: { flex: 1 },

  /* CROP CARD */
  cropCard: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  cropCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cropCardLabel: { fontSize: 14, fontWeight: "700", color: THEME },

  /* AMOUNT PREVIEW */
  amountPreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -4,
    marginBottom: 8,
    gap: 6,
  },
  amountPreview: { color: "#10B981", fontWeight: "700", fontSize: 14 },

  /* ADD CROP BTN */
  addCropBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  addCropIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#FAF7E8",
    alignItems: "center", justifyContent: "center",
  },
  addCropText: { color: THEME, fontWeight: "700", fontSize: 15 },

  /* SUBMIT */
  submitBtn: {
    backgroundColor: STAFF_COLORS.primary,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },

  /* FARMER MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  farmerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  farmerAvatarBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#FAF7E8",
    alignItems: "center", justifyContent: "center",
  },
  farmerName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  farmerPhone: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  separator: { height: 1, backgroundColor: "#F3F4F6" },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  closeText: { color: "#1F2937", fontWeight: "700", fontSize: 15 },
});
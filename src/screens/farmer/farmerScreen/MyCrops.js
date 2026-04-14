import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const THEME = FARMER_COLORS.primaryLight;

const EmptyState = ({ navigation, t }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIcon}>
      <Icon name="leaf-outline" size={60} color="#E0E0E0" />
    </View>
    <Text style={styles.emptyTitle}>{t('my_crops.empty_title')}</Text>
    <Text style={styles.emptyText}>{t('my_crops.empty_text')}</Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={() => navigation.navigate("AddCrop")}
      activeOpacity={0.7}
    >
      <Icon name="add" size={20} color="#fff" />
      <Text style={styles.emptyButtonText}>{t('my_crops.add_first')}</Text>
    </TouchableOpacity>
  </View>
);

const MyCrops = ({ navigation }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCrops();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserCropsByUserId();
      const cropsData = response?.data || [];
      const cropsWithFarmNames = cropsData.map((crop) => ({
        ...crop,
        farmName: crop.farmId?.farmName || crop.farmName || t('my_crops.unknown_farm')
      }));
      setCrops(cropsWithFarmNames);
    } catch (error) {
      console.error("Fetch crops error:", error);
      showAlert({ type: 'error', title: t('error'), message: t('my_crops.load_failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cropId) => {
    showAlert({
      type: 'confirm',
      title: t('my_crops.delete_title'),
      message: t('my_crops.delete_confirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('my_crops.delete_btn'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCropById(cropId);
              showAlert({ type: 'success', title: t('success'), message: t('my_crops.deleted_success') });
              fetchCrops();
            } catch (error) {
              showAlert({ type: 'error', title: t('error'), message: t('my_crops.delete_failed') });
            }
          },
        },
      ]
    });
  };

  /** Open crop stage progress detail */
  const openCalendarDetail = (item) => {
    navigation.navigate("CropCalendarDetail", {
      cropName: item.cropName,
      sowingDate: item.sowingDate || null,
    });
  };

  const renderCropCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openCalendarDetail(item)}
      activeOpacity={0.8}
    >
      {/* Left icon */}
      <View style={styles.cardIcon}>
        <Icon name="leaf" size={24} color={THEME} />
      </View>

      {/* Centre content */}
      <View style={styles.cardContent}>
        <Text style={styles.cropName}>{item.cropName}</Text>
        <View style={styles.farmInfo}>
          <Icon name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.farmName}>{item.farmName || t('my_crops.unknown_farm')}</Text>
        </View>
        <Text style={styles.cropArea}>
          {item.area || "0"} {item.unit || "acre"}
        </Text>
      </View>

      {/* Right actions */}
      <View style={styles.cardActions}>
        {/* ✏️ Edit */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#e2f0c9' }]}
          onPress={(e) => { e.stopPropagation(); navigation.navigate("EditCrop", { crop: item }); }}
          activeOpacity={0.7}
        >
          <Icon name="create-outline" size={18} color={THEME} />
        </TouchableOpacity>

        {/* 🗑 Delete */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
          onPress={(e) => { e.stopPropagation(); handleDelete(item._id); }}
          activeOpacity={0.7}
        >
          <Icon name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('my_crops.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME} />
          <Text style={styles.loadingText}>{t('my_crops.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={crops}
          renderItem={renderCropCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={crops.length === 0 ? styles.emptyList : styles.listContainer}
          ListEmptyComponent={<EmptyState navigation={navigation} t={t} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddCrop")}
        activeOpacity={0.9}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  headerRight: { width: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: THEME, fontWeight: '500' },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyIcon: { marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#666", marginBottom: 8 },
  emptyText: { fontSize: 16, color: "#999", textAlign: "center", marginBottom: 30, lineHeight: 22 },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: THEME,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12, alignItems: "center",
    elevation: 3,
    shadowColor: THEME, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  emptyButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginLeft: 8 },
  listContainer: { padding: 16, paddingTop: 24 },

  /* Card */
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16, 
    padding: 16,
    marginBottom: 16, 
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, 
    shadowRadius: 5,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#e2f0c9",
    justifyContent: "center", alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cropName: { fontSize: 17, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  farmInfo: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  farmName: { fontSize: 14, color: "#6B7280", marginLeft: 4, fontWeight: '500' },
  cropArea: { fontSize: 14, color: THEME, fontWeight: "700" },

  /* Actions */
  cardActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  actionButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center",
  },

  /* FAB */
  fab: {
    position: "absolute", right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: THEME,
    justifyContent: "center", alignItems: "center",
    elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
});

export default MyCrops;
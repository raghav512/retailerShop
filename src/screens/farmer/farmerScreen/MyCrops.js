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
      variety: item.variety || null,
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
        <View style={styles.cropNameRow}>
          <Text style={styles.cropName}>{item.cropName}</Text>
          {item.variety && (
            <Text style={styles.varietyText}>- {item.variety}</Text>
          )}
        </View>
        <View style={styles.farmInfo}>
          <Icon name="location-outline" size={14} color={FARMER_COLORS.textSecondary} />
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
          style={[styles.actionButton, { backgroundColor: 'rgba(142, 171, 83, 0.15)' }]}
          onPress={(e) => { e.stopPropagation(); navigation.navigate("EditCrop", { crop: item }); }}
          activeOpacity={0.7}
        >
          <Icon name="create-outline" size={18} color={FARMER_COLORS.primary} />
        </TouchableOpacity>

        {/* 🗑 Delete */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
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
          <Icon name="arrow-back" size={24} color={FARMER_COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('my_crops.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primary} />
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
  container: { flex: 1, backgroundColor: FARMER_COLORS.background },
  headerSpacer: {
    height: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: FARMER_COLORS.textOnPrimary, letterSpacing: 0.5 },
  headerRight: { width: 44 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: FARMER_COLORS.textSecondary, fontWeight: '600' },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyIcon: { marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: FARMER_COLORS.textPrimary, marginBottom: 8, letterSpacing: 0.3 },
  emptyText: { fontSize: 15, color: FARMER_COLORS.textSecondary, textAlign: "center", marginBottom: 30, lineHeight: 22 },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: FARMER_COLORS.primary,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 24, alignItems: "center",
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyButtonText: { color: FARMER_COLORS.textOnPrimary, fontSize: 15, fontWeight: "700", marginLeft: 8, letterSpacing: 0.3 },
  listContainer: { padding: 20, paddingTop: 24 },

  /* Card */
  card: {
    flexDirection: "row",
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20, 
    padding: 16,
    marginBottom: 16, 
    alignItems: "center",
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  cardIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: FARMER_COLORS.primary,
    justifyContent: "center", alignItems: "center",
    marginRight: 16,
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: { flex: 1 },
  cropNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6, gap: 6 },
  cropName: { fontSize: 16, fontWeight: "700", color: FARMER_COLORS.textPrimary, letterSpacing: 0.2 },
  varietyText: { fontSize: 14, color: FARMER_COLORS.primary, fontWeight: "600", fontStyle: 'italic' },
  farmInfo: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  farmName: { fontSize: 13, color: FARMER_COLORS.textSecondary, marginLeft: 4, fontWeight: '500' },
  cropArea: { fontSize: 14, color: FARMER_COLORS.primary, fontWeight: "700", letterSpacing: 0.3 },

  /* Actions */
  cardActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  actionButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: FARMER_COLORS.surface,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.2)',
  },

  /* FAB */
  fab: {
    position: "absolute", right: 20, bottom: 20,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: FARMER_COLORS.primary,
    justifyContent: "center", alignItems: "center",
    elevation: 4,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default MyCrops;
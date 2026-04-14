import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { getUserData, getAccessToken } from "../../../Redux/Storage";
import { decode as base64Decode } from 'base-64';
import { useTranslation } from "react-i18next";
import { StatusBar } from "react-native";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const MyFarms = ({ navigation }) => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const { t } = useTranslation();

  /* ================= FETCH FARMS ================= */
  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) {
        showAlert({ type: 'error', title: t('error'), message: t('my_farms.login_required') });
        setLoading(false);
        return;
      }

      // Decode JWT to get userId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = base64Decode(base64);
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.id;

      console.log("🆔 Extracted userId from token:", userId);
      const response = await apiService.getFarmsByUserId(userId);
      setFarms(response?.data || []);
    } catch (error) {
      console.error("Fetch farms error:", error);
      showAlert({ type: 'error', title: t('error'), message: t('my_farms.load_failed') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchFarms);
    return unsubscribe;
  }, [navigation]);

  /* ================= DELETE FARM ================= */
  const handleDelete = async (farmId) => {
    showAlert({
      type: 'confirm',
      title: t('my_farms.delete_title'),
      message: t('my_farms.delete_confirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('my_farms.delete_btn'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteFarmById(farmId);
              showAlert({ type: 'success', title: t('success'), message: t('my_farms.deleted_success') });
              fetchFarms();
            } catch {
              showAlert({ type: 'error', title: t('error'), message: t('my_farms.delete_failed') });
            }
          },
        },
      ]
    });
  };

  const openActions = (farm) => {
    setSelectedFarm(farm);
    setShowActions(true);
  };

  /* ================= FARM CARD ================= */
  const renderFarmCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.farmName}>{item.farmName}</Text>
          <Text style={styles.farmArea}>
            {item.farmArea} {item.unit}
          </Text>
        </View>

        <TouchableOpacity onPress={() => openActions(item)} style={{ padding: 4 }}>
          <Icon name="ellipsis-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('my_farms.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} style={styles.loader} />
      ) : farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('my_farms.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* ACTIONS MODAL */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsModal}>
            <View style={styles.actionsHeader}>
              <Text style={styles.actionsTitle}>{t('my_farms.actions')}</Text>
              <TouchableOpacity onPress={() => setShowActions(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowActions(false);
                navigation.navigate("FarmDetails", {
                  farmId: selectedFarm._id,
                });
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Icon name="eye-outline" size={20} color="#4B5563" />
              </View>
              <Text style={styles.actionText}>{t('my_farms.view_details')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowActions(false);
                navigation.navigate("EditFarm", { farm: selectedFarm });
              }}
            >
               <View style={[styles.iconContainer, { backgroundColor: '#e2f0c9' }]}>
                 <Icon name="create-outline" size={20} color={FARMER_COLORS.primaryLight} />
               </View>
              <Text style={styles.actionText}>{t('my_farms.edit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowActions(false);
                handleDelete(selectedFarm._id);
              }}
            >
               <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                 <Icon name="trash-outline" size={20} color="#EF4444" />
               </View>
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                {t('my_farms.delete_btn')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddFarm")}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default MyFarms;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
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
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loader: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },

  listContainer: {
    padding: 16,
    paddingTop: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  farmName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  farmArea: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionsModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  actionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FARMER_COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const MyListing = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  const fetchListings = async () => {
    try {
      const response = await apiService.getUserCropListings();
      setListings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      showAlert({ type: 'error', title: t('error'), message: t('listing.load_failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    showAlert({
      type: 'confirm',
      title: t('listing.delete_title'),
      message: t('listing.delete_confirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('listing.delete_btn'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCropListing(id);
              setListings((prev) => prev.filter((item) => item._id !== id));
              showAlert({ type: 'success', title: t('success'), message: t('listing.deleted_success') });
            } catch (error) {
              console.error("Failed to delete listing:", error);
              showAlert({ type: 'error', title: t('error'), message: t('listing.delete_failed') });
            }
          }
        }
      ]
    });
  };

  const handleCreateListing = () => {
    navigation.navigate("CreateListing");
  };

  const renderItem = ({ item }) => {
    const rawStatus = (item.status || 'pending').toLowerCase();
    const isApproved = rawStatus === 'approved';
    const isSold = rawStatus === 'sold';
    const isPending = !isApproved && !isSold;

    return (
      <View style={styles.card}>
        {/* TOP ROW */}
        <View style={styles.row}>
          {item.cropImages && item.cropImages.length > 0 ? (
            <Image
              source={{ uri: item.cropImages[0].url }}
              style={styles.cropImage}
              resizeMode="cover"
              defaultSource={require("../../../assets/Images/home.png")}
            />
          ) : (
            <View style={styles.imageBox}>
              <Icon name="leaf" size={28} color={FARMER_COLORS.primaryLight} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.cropName || item.name}
            </Text>
            <Text style={styles.subText} numberOfLines={1}>
              {item.variety || t('listing.variety')}
            </Text>
            <Text style={styles.subText}>
              <Text style={{fontWeight:'700', color:'#1F2937'}}>{item.quantity}</Text> quintal • <Text style={{fontWeight:'700', color:FARMER_COLORS.primaryLight}}>₹{item.price}</Text>/quintal
            </Text>
          </View>

          <View style={[
            styles.status, 
            isApproved ? styles.statusApproved : isSold ? styles.statusSold : styles.statusPending
          ]}>
            <Text style={[
              styles.statusText,
              isApproved ? {color: '#047857'} : isSold ? {color: '#1D4ED8'} : {color: '#B45309'}
            ]}>
              {t(`listing.status.${rawStatus}`)}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditListing", { listing: item })}
          >
            <Icon name="pencil" size={14} color={FARMER_COLORS.primaryLight} style={styles.btnIcon} />
            <Text style={styles.editText}>{t('common.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Icon name="trash" size={14} color="#DC2626" style={styles.btnIcon} />
            <Text style={styles.deleteText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={FARMER_COLORS.primaryLight} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{t("listing.my_listings")}</Text>
            <Text style={styles.headerSub}>
              {t("listing.total", { count: listings.length })}
            </Text>
          </View>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateListing}>
          <Icon name="add" size={24} color="#ffffff" style={styles.addIcon} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
          <Text style={styles.loadingText}>{t('listing.loading')}</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
             <Icon name="leaf" size={64} color={FARMER_COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyText}>{t('listing.empty')}</Text>
          <Text style={styles.emptySub}>{t('listing.empty_sub')}</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6, backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FARMER_COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: FARMER_COLORS.primaryLight,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  addIcon: {
    marginLeft: 2, // optical alignment
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FEF9E7",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cropImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  subText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusApproved: {
    backgroundColor: "#D1FAE5",
  },
  statusPending: {
    backgroundColor: "#e2f0c9",
  },
  statusSold: {
    backgroundColor: "#DBEAFE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9E7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnIcon: {
    marginRight: 6,
  },
  editText: {
    fontSize: 13,
    color: FARMER_COLORS.primaryLight,
    fontWeight: "700",
  },
  deleteText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default MyListing;


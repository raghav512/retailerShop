import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useDispatch } from "react-redux";
import { logOut } from "../../../Redux/AuthSlice";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiService from "../../../Redux/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // FPO Steel Blue

const FEATURES = [
  { id: "3", key: "documents", icon: "document-text-outline" },
];

/* const SETTINGS = [
  { id: "1", key: "notifications", badge: "1" },
  { id: "2", key: "language", value: "English" },
  { id: "3", key: "privacy" },
  { id: "4", key: "help" },
]; */

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [features] = useState(FEATURES);
  // const [settings] = useState(SETTINGS);

  const accountDetails = profile
    ? [
      { id: "1", label: "phone", value: profile?.phone, icon: "call-outline" },
      { id: "2", label: "email", value: profile?.emailId, icon: "mail-outline" },
      { id: "3", label: "shop", value: profile?.shopName, icon: "storefront-outline" },
    ]
    : [];

  const ProfileData = async () => {
    try {
      const response = await apiService.getProfileDetails();
      if (response) setProfile(response);
    } catch (error) {
      console.log("Profile API Error 👉", error);
    }
  };

  useFocusEffect(useCallback(() => { ProfileData(); }, []));

  const handleFeaturePress = (key) => {
    if (key === "documents") navigation.navigate("FpoUploadDocuments");
  };

  const handleLogout = async () => {
    showAlert({
      type: "confirm",
      title: t("fpo_profile.settings.logout"),
      message: t("fpo_profile.settings.logout_msg"),
      buttons: [
        { text: t("fpo_profile.settings.cancel"), style: "cancel" },
        {
          text: t("fpo_profile.settings.logout"),
          style: "destructive",
          onPress: async () => {
            try { await dispatch(logOut()).unwrap(); } catch (e) { console.error("Logout failed:", e); }
          },
        },
      ],
    });
  };

  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("fpo_profile.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PROFILE HERO CARD */}
        <View style={styles.heroCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {profile?.profileImage ? (
              <Image
                source={{ uri: typeof profile.profileImage === "object" ? profile.profileImage.url : profile.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{profile?.firstName} {profile?.lastName}</Text>
          <Text style={styles.heroPhone}>+91 {profile?.phone}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile?.role ? t(`role.${profile.role.toLowerCase()}`) : t("role.fpo")}
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("UpdateProfile", { profileData: profile })}
          >
            <Icon name="create-outline" size={16} color={THEME} />
            <Text style={styles.editText}>{t("fpo_profile.edit")}</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT DETAILS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="person" size={15} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("fpo_profile.account_details")}</Text>
          </View>
          {accountDetails.map((item, i) => (
            <View key={item.id} style={[styles.detailRow, i === accountDetails.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.detailLeft}>
                <Icon name={item.icon} size={16} color="#9CA3AF" />
                <Text style={styles.detailLabel}>{t(`fpo_profile.account.${item.label}`)}</Text>
              </View>
              <Text style={styles.detailValue}>{item.value || "—"}</Text>
            </View>
          ))}
        </View>

        {/* FEATURES */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="apps" size={15} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("fpo_profile.features_title")}</Text>
          </View>
          {features.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.featureRow, i === features.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.8}
              onPress={() => handleFeaturePress(item.key)}
            >
              <View style={styles.featureLeft}>
                <View style={styles.featureIconBox}>
                  <Icon name={item.icon} size={18} color={THEME} />
                </View>
                <View>
                  <Text style={styles.featureTitle}>{t(`fpo_profile.features.${item.key}.title`)}</Text>
                  <Text style={styles.featureSub}>{t(`fpo_profile.features.${item.key}.sub`)}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* SETTINGS */}
        {/* <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Icon name="settings" size={15} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("fpo_profile.settings.title")}</Text>
          </View>
          {settings.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.settingRow, i === settings.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.settingText}>{t(`fpo_profile.settings.${item.key}`)}</Text>
              <View style={styles.settingRight}>
                {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                {item.badge && (
                  <View style={styles.badgePill}><Text style={styles.badgeText}>{item.badge}</Text></View>
                )}
                <Icon name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>{t("fpo_profile.settings.logout")}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* HERO CARD */
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  avatarWrapper: { marginBottom: 12 },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: THEME,
  },
  avatarFallback: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "#EBF3F6",
    borderWidth: 3, borderColor: THEME,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { fontSize: 32, fontWeight: "800", color: THEME },
  heroName: { fontSize: 20, fontWeight: "800", color: "#1F2937", marginBottom: 4 },
  heroPhone: { fontSize: 14, color: "#6B7280", fontWeight: "500", marginBottom: 10 },
  roleBadge: {
    backgroundColor: "#EBF3F6", paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 14, marginBottom: 16,
  },
  roleText: { fontSize: 13, color: THEME, fontWeight: "700" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EBF3F6", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: THEME,
  },
  editText: { fontSize: 14, color: THEME, fontWeight: "700" },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#EBF3F6",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  /* DETAIL ROWS */
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#1F2937" },

  /* FEATURES */
  featureRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  featureLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIconBox: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "#EBF3F6",
    alignItems: "center", justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  featureSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  /* SETTINGS */
  settingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  settingText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 13, color: "#6B7280" },
  badgePill: {
    backgroundColor: "#EF4444", paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, minWidth: 20, alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  /* LOGOUT */
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#ffffff", borderRadius: 24,
    paddingVertical: 16, marginBottom: 8,
    elevation: 4, shadowColor: "#EF4444", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.5, borderColor: "#FEE2E2",
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#EF4444" },
});

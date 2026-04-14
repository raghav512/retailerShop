import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { logOut } from "../../../Redux/AuthSlice";
import { useTranslation } from "react-i18next";
import apiService from "../../../Redux/apiService";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../Redux/Storage";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

// const SETTINGS = [
//   { id: "1", key: "notifications", icon: "notifications-outline" },
//   { id: "2", key: "language", icon: "globe-outline" },
//   { id: "3", key: "privacy", icon: "lock-closed-outline" },
//   { id: "4", key: "help", icon: "help-circle-outline" },
// ];

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageNew, setProfileImageNew] = useState(null);

  /* ---------- PROFILE DATA ---------- */

  const accountDetails = profile
    ? [
        {
          id: "1",
          key: "phone",
          value: profile.phone || "-",
          icon: "call-outline",
        },
        {
          id: "2",
          key: "email",
          value: profile.emailId || "-",
          icon: "mail-outline",
        },
      ]
    : [];

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfileDetails();
      setProfile(res || null);
      
      let imageUri = null;
      if (res?.profileImage) {
        if (typeof res.profileImage === "object" && res.profileImage.url) {
          imageUri = res.profileImage.url;
        } else if (
          typeof res.profileImage === "string" &&
          res.profileImage !== "null" &&
          res.profileImage !== "undefined"
        ) {
          imageUri = res.profileImage;
        }
      }
      setProfileImage(imageUri);
    } catch (e) {
      console.log("Profile error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  /* ---------- IMAGE PICKER ---------- */

  const pickImage = async () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.7, maxWidth: 400, maxHeight: 400, includeBase64: true },
      async (response) => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets[0];
        setProfileImageNew(asset);
        setUploading(true);

        try {
          const token = await getAccessToken();

          const apiResponse = await fetch(
            `${API_BASE_URL}/api/user/update-profile`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profileImage: `data:${asset.type};base64,${asset.base64}`,
              }),
            },
          );

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${apiResponse.status}`,
            );
          }

          const data = await apiResponse.json();
          console.log("Upload successful:", data);

          setProfileImage(asset.uri);
          setProfileImageNew(null);
          await fetchProfile();
          showAlert({ type: 'success', title: 'Success', message: 'Profile image updated successfully' });
        } catch (error) {
          console.error("Upload error:", error.message);
          showAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to update profile' });
        } finally {
          setUploading(false);
        }
      },
    );
  };

  /* ---------- LOGOUT ---------- */

  const logoutUser = () => {
    showAlert({
      type: 'confirm',
      title: t("logout"),
      message: t("profile.logout_confirm"),
      buttons: [
        { text: t("common.cancel"), style: 'cancel' },
        { text: t("logout"), style: 'destructive', onPress: () => dispatch(logOut()) },
      ],
    });
  };

  /* ---------- RENDERERS ---------- */

  const renderAccount = ({ item, index }) => (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Icon name={item.icon} size={22} color={STAFF_COLORS.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.label}>
          {t(`profile.account.${item.key}`)}
        </Text>
        <Text style={styles.value}>{item.value}</Text>
      </View>
    </View>
  );

  const renderSetting = ({ item }) => (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.8}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={item.icon} size={18} color="#6B7280" />
        </View>
        <Text style={styles.settingText}>
          {t(`profile.settings.${item.key}`)}
        </Text>
      </View>
      <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  /* ---------- UI ---------- */

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.8}
        >
          <Icon name="create-outline" size={20} color="#1F2937" />
        </TouchableOpacity>

        <View
          style={styles.avatar}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator color={STAFF_COLORS.primary} />
          ) : profileImageNew?.uri || profileImage ? (
            <Image
              source={{ uri: profileImageNew?.uri || profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <Icon name="person-outline" size={32} color={STAFF_COLORS.primary} />
          )}
        </View>
        <Text style={styles.name}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.role}>{profile?.role}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>
          {t("profile.account_details")}
        </Text>

        <View style={styles.card}>
          <FlatList
            data={accountDetails}
            keyExtractor={(item) => item.id}
            renderItem={renderAccount}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
            scrollEnabled={false}
          />
        </View>

        {/* SETTINGS */}
        {/* <Text style={styles.sectionTitle}>
          {t("profile.settings_title")}
        </Text> */}

        {/* <View style={styles.card}>
          <FlatList
            data={SETTINGS}
            keyExtractor={(item) => item.id}
            renderItem={renderSetting}
            scrollEnabled={false}
          />
        </View> */}

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logoutUser}
        >
          <Text style={styles.logoutText}>
            {t("logout")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;


/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  /* HEADER */
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingVertical: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  editBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  name: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "800",
  },
  role: {
    color: STAFF_COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  /* CONTENT */
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* ROW */
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  separator: {
    height: 16,
  },

  /* SETTINGS */
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  /* LOGOUT */
  logoutBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
  },
});


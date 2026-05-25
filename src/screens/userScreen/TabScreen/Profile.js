import React, { useCallback, useState } from 'react';
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
  Animated,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../Redux/AuthSlice';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from '../../../config';
import { getAccessToken } from '../../../Redux/Storage';

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
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageNew, setProfileImageNew] = useState(null);

  /* ---------- PROFILE DATA ---------- */
  // This will re-render when language changes because it depends on t() and i18n.language
  const accountDetails = React.useMemo(() => {
    if (!profile) return [];
    return [
      {
        id: '1',
        key: 'phone',
        label: t('profile.account.phone'),
        value: profile.phone || '-',
        icon: 'call-outline',
      },
      {
        id: '2',
        key: 'email',
        label: t('profile.account.email'),
        value: profile.emailId || '-',
        icon: 'mail-outline',
      },
      {
        id: '3',
        key: 'attendance',
        label: t('profile.account.attendance'),
        value: t('profile.account.view_attendance'),
        icon: 'calendar-outline',
        action: () => navigation.navigate('StaffAttendance'),
      },
    ];
  }, [profile, t, i18n.language]);

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfileDetails();
      setProfile(res || null);

      let imageUri = null;
      if (res?.profileImage) {
        if (typeof res.profileImage === 'object' && res.profileImage.url) {
          imageUri = res.profileImage.url;
        } else if (
          typeof res.profileImage === 'string' &&
          res.profileImage !== 'null' &&
          res.profileImage !== 'undefined'
        ) {
          imageUri = res.profileImage;
        }
      }
      setProfileImage(imageUri);
    } catch (e) {
      console.log('Profile error:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  /* ---------- IMAGE PICKER ---------- */

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
        includeBase64: true,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets[0];
        setProfileImageNew(asset);
        setUploading(true);

        try {
          const token = await getAccessToken();

          const apiResponse = await fetch(
            `${API_BASE_URL}/api/user/update-profile`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
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
          console.log('Upload successful:', data);

          setProfileImage(asset.uri);
          setProfileImageNew(null);
          await fetchProfile();
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Profile image updated successfully',
          });
        } catch (error) {
          console.error('Upload error:', error.message);
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to update profile',
          });
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
      title: t('logout'),
      message: t('profile.logout_confirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => dispatch(logOut()),
        },
      ],
    });
  };

  /* ---------- RENDERERS ---------- */

  const renderAccount = ({ item, index }) => {
    const AccountRow = () => {
      const scaleAnim = React.useRef(new Animated.Value(1)).current;

      const handlePressIn = () => {
        Animated.spring(scaleAnim, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start();
      };

      const handlePressOut = () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      };

      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.row}
            onPress={item.action}
            onPressIn={item.action ? handlePressIn : undefined}
            onPressOut={item.action ? handlePressOut : undefined}
            disabled={!item.action}
            activeOpacity={1}
          >
            <View style={styles.iconBox}>
              <Icon name={item.icon} size={22} color={STAFF_COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={[styles.value, item.action && styles.actionValue]}>{item.value}</Text>
            </View>
            {item.action && (
              <Icon name="chevron-forward-outline" size={20} color={STAFF_COLORS.primary} />
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    };

    return <AccountRow />;
  };

  const renderSetting = ({ item }) => (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE INFO */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.avatar} onPress={pickImage} activeOpacity={0.8}>
          {uploading ? (
            <ActivityIndicator color={STAFF_COLORS.primary} />
          ) : profileImageNew?.uri || profileImage ? (
            <Image
              source={{ uri: profileImageNew?.uri || profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <Icon
              name="person-outline"
              size={36}
              color={STAFF_COLORS.primary}
            />
          )}
          <View style={styles.cameraIcon}>
            <Icon name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.role}>{profile?.role}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>{t('profile.account_details')}</Text>

        <View style={styles.card}>
          <FlatList
            data={accountDetails}
            keyExtractor={item => item.id}
            renderItem={renderAccount}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* PROFILE SECTION */
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'visible',
    borderWidth: 4,
    borderColor: STAFF_COLORS.primary,
    elevation: 6,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: STAFF_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  name: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  role: {
    color: STAFF_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },

  /* CONTENT */
  content: {
    padding: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  /* ROW */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  actionValue: {
    color: STAFF_COLORS.primary,
  },
  separator: {
    height: 18,
  },

  /* SETTINGS */
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },

  /* LOGOUT */
  logoutBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

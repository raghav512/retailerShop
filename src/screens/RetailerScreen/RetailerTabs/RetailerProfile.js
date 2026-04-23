import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../Redux/AuthSlice';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { API_BASE_URL } from '../../../config';
import { launchImageLibrary } from 'react-native-image-picker';
import { getAccessToken } from '../../../Redux/Storage';
import { RETAILER_COLORS } from '../../../colorsList/ColorList';

const RetailerProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageNew, setProfileImageNew] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ NEW: Separate refresh state

  // ✅ FIX: Memoize MENU_ITEMS to prevent recreation on every render
  const MENU_ITEMS = useMemo(
    () => [
      {
        id: 1,
        title: t('personal_details'),
        icon: 'person',
        screen: 'RetailerPersonalDetails',
      },
      {
        id: 2,
        title: t('address_details'),
        icon: 'location',
        screen: 'RetailerAddressDetails',
      },
      {
        id: 3,
        title: t('bank_details'),
        icon: 'card',
        screen: 'RetailerBankDetails',
      },
      {
        id: 4,
        title: t('documents'),
        icon: 'document',
        screen: 'RetailerDocuments',
      },
      {
        id: 5,
        title: t('private_files.title'),
        icon: 'folder-open',
        screen: 'RetailerPrivateFiles',
      },
    ],
    [t],
  );

  // ✅ FIX: Memoize fetchUserDetails with useCallback
  const fetchUserDetails = useCallback(async (showLoader = true) => {
    try {
      // ✅ Only show loading spinner on first load or explicit refresh
      if (showLoader && !userDetails) {
        setLoading(true);
      } else if (showLoader) {
        setIsRefreshing(true);
      }

      const response = await apiService.getProfileDetails();

      const userData = response?.data || response;

      setUserDetails(userData);

      let imageUri = null;
      if (userData?.profileImage) {
        if (
          typeof userData.profileImage === 'object' &&
          userData.profileImage.url
        ) {
          imageUri = userData.profileImage.url;
        } else if (
          typeof userData.profileImage === 'string' &&
          userData.profileImage !== 'null' &&
          userData.profileImage !== 'undefined'
        ) {
          imageUri = userData.profileImage;
        }
      }

      setProfileImage(imageUri);
    } catch (error) {
      console.log('Fetch profile error:', error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userDetails]); // ✅ Add userDetails to dependency

  // ✅ FIX: Only fetch on first mount, not on every focus
  useEffect(() => {
    fetchUserDetails(true); // Initial load with spinner
  }, []);

  // ✅ FIX: Silently refresh data when screen focuses (no loading spinner)
  useFocusEffect(
    useCallback(() => {
      if (userDetails) {
        // Only refresh if we already have data (silent update)
        fetchUserDetails(false);
      }
    }, [fetchUserDetails, userDetails]),
  );

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
        includeBase64: true,
      },
      async (response) => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets[0];
        setProfileImageNew(asset);
        console.log({ asset });

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
          await fetchUserDetails(false); // ✅ Silent refresh after image upload
          showAlert({ type: 'success', title: 'Success', message: 'Profile image updated successfully' });
        } catch (error) {
          console.error('Upload error:', error.message);
          showAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to update profile' });
        } finally {
          setUploading(false);
        }
      },
    );
  };

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
          onPress: async () => {
            try {
              await dispatch(logOut()).unwrap();
            } catch (error) {
              console.log('Logout error:', error);
            }
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <TouchableOpacity style={styles.avatar} onPress={pickImage}>
              {uploading ? (
                <ActivityIndicator color={RETAILER_COLORS.primaryLight} />
              ) : profileImageNew?.uri || profileImage ? (
                <Image
                  source={{ uri: profileImageNew?.uri || profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Icon name="person" size={36} color={RETAILER_COLORS.primaryLight} />
              )}
              <View style={styles.cameraIcon}>
                <Icon name="camera" size={14} color={RETAILER_COLORS.primaryLight} />
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.name}>
                {loading
                  ? t('common.loading')
                  : `${userDetails?.firstName || ''} ${
                      userDetails?.lastName || ''
                    }`}
              </Text>
              <Text style={styles.phone}>
                {loading ? t('common.loading') : `+91 ${userDetails?.phone || 'N/A'}`}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{t('role_retailer')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listWrapper}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                // ✅ FIX: Pass user data to prevent empty state flash
                navigation.navigate(item.screen, {
                  cachedUserData: userDetails,
                });
              }}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon name={item.icon} size={20} color={RETAILER_COLORS.primaryLight} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Icon name="log-out" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default RetailerProfile;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
    backgroundColor: '#ffffff',
  },
  container: { flex: 1, backgroundColor: RETAILER_COLORS.tint },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RETAILER_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfo: { marginLeft: 16, flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  phone: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  roleBadge: {
    marginTop: 8,
    backgroundColor: RETAILER_COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 12, color: RETAILER_COLORS.primaryLight, fontWeight: '700' },
  listWrapper: { paddingHorizontal: 16, marginTop: 24 },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: RETAILER_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15, marginLeft: 8 },
});

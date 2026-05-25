import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../Redux/AuthSlice';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { API_BASE_URL } from '../../../config';
import { launchImageLibrary } from 'react-native-image-picker';
import { getAccessToken } from '../../../Redux/Storage';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const FarmerProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageNew, setProfileImageNew] = useState('');

  const MENU_ITEMS = [
    {
      id: 1,
      title: t('personal_details'),
      icon: 'person',
      screen: 'ScreenOne',
    },
    {
      id: 2,
      title: t('address_details'),
      icon: 'location',
      screen: 'ScreenSecond',
    },
    {
      id: 3,
      title: t('farmer_category'),
      icon: 'leaf',
      screen: 'ScreenThird',
    },
    {
      id: 4,
      title: t('crops_grown'),
      icon: 'flower',
      screen: 'ScreenFourth',
    },
    {
      id: 5,
      title: t('bank_details'),
      icon: 'card',
      screen: 'ScreenFifth',
    },
    {
      id: 6,
      title: t('documents'),
      icon: 'document',
      screen: 'ScreenSeventh',
    },
    {
      id: 7,
      title: t('private_files.title'),
      icon: 'folder-open',
      screen: 'PrivateFiles',
    },
  ];

  const fetchUserDetails = useCallback(async () => {
    try {
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
      setLoading(false);
    } catch (error) {
      console.log('Fetch profile error:', error.message);
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [fetchUserDetails]),
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
      async response => {
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
          await fetchUserDetails();
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.avatar} onPress={pickImage}>
            {uploading ? (
              <ActivityIndicator color={FARMER_COLORS.primaryLight} />
            ) : profileImageNew?.uri || profileImage ? (
              <Image
                source={{ uri: profileImageNew?.uri || profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon
                name="person"
                size={36}
                color={FARMER_COLORS.primaryLight}
              />
            )}
            <View style={styles.cameraIcon}>
              <Icon
                name="camera"
                size={14}
                color={FARMER_COLORS.primaryLight}
              />
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
              {loading
                ? t('common.loading')
                : `+91 ${userDetails?.phone || 'N/A'}`}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{t('role_farmer')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.listWrapper}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon
                    name={item.icon}
                    size={20}
                    color={FARMER_COLORS.primaryLight}
                  />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Icon name="log-out" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmerProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: FARMER_COLORS.primary,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.3,
    lineHeight: 30,
  },
  phone: {
    fontSize: 14,
    color: FARMER_COLORS.textSubOnPrimary,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.95,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    fontSize: 11,
    color: FARMER_COLORS.textOnPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listWrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  menuItem: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.1)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: FARMER_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.15)',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B91C1C',
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});

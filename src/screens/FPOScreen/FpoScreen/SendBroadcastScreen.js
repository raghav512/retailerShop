import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useTranslation } from 'react-i18next';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // Distributor Steel Blue

const requestStoragePermission = async t => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) return true;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: t('send_broadcast.storage_permission_title'),
          message: t('send_broadcast.storage_permission_body'),
          buttonNeutral: t('send_broadcast.ask_me_later'),
          buttonNegative: t('send_broadcast.cancel'),
          buttonPositive: t('send_broadcast.ok'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const SendBroadcastScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('All');
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const ROLES = [
    {
      label: 'All',
      value: 'All',
      icon: 'globe-outline',
    },
    {
      label: t('send_broadcast.roles.farmer'),
      value: 'Farmer',
      icon: 'leaf-outline',
    },
    {
      label: t('send_broadcast.roles.staff'),
      value: 'Staff',
      icon: 'people-outline',
    },
  ];

  console.log('\n🎯 ROLES CONFIGURATION:');
  console.log(
    'Available roles:',
    ROLES.map(r => r.value),
  );
  console.log(
    'Note: Backend must match these exact role values (case-sensitive)',
  );
  console.log('Expected: Farmer, Staff, Retailer (capital first letter)\n');

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission(t);
    if (!hasPermission) {
      showAlert({
        type: 'warning',
        title: t('send_broadcast.permission_required'),
        message: t('send_broadcast.storage_permission_msg'),
      });
      return;
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, includeBase64: true },
      response => {
        if (response.didCancel) console.log('User cancelled image picker');
        else if (response.error)
          showAlert({
            type: 'error',
            title: t('send_broadcast.error'),
            message: t('send_broadcast.select_image_error'),
          });
        else if (response.assets?.length > 0) {
          setImage(response.assets[0].uri);
          const type = response.assets[0].type || 'image/jpeg';
          setImageBase64(`data:${type};base64,${response.assets[0].base64}`);
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      showAlert({
        type: 'warning',
        title: t('send_broadcast.validation_error'),
        message: t('send_broadcast.title_desc_required'),
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        targetRole,
      };

      if (imageBase64) {
        payload.broadcastImage = imageBase64;
      }

      console.log('========================================\n');

      const response = await apiService.sendBroadcast(payload);

      console.log(
        'Recipient Count:',
        response?.data?.broadcast?.recipientCount,
      );
      console.log('Target Role:', response?.data?.broadcast?.targetRole);
      console.log('\n⚠️ ISSUE ANALYSIS:');
      console.log('If "All" is selected:');
      console.log('  - Expected: Farmer + Staff should receive');
      console.log(
        '  - Current totalTokens:',
        response?.data?.stats?.totalTokens,
      );

      console.log('========================================\n\n');

      if (response?.status === 'success' || response?.success) {
        showAlert({
          type: 'success',
          title: t('send_broadcast.success'),
          message: t('send_broadcast.sent_success'),
        });
        navigation.goBack();
      } else {
        showAlert({
          type: 'error',
          title: t('send_broadcast.error'),
          message: response?.message || t('send_broadcast.failed_to_send'),
        });
      }
    } catch (error) {
      console.error('Send broadcast error:', error);
      showAlert({
        type: 'error',
        title: t('send_broadcast.error'),
        message: t('send_broadcast.something_went_wrong'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          FPO_COLORS.primary,
          FPO_COLORS.primaryDark,
          FPO_COLORS.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('send_broadcast.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FORM SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="chatbubble-ellipses" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('send_broadcast.message_details')}
            </Text>
          </View>

          <Text style={styles.label}>
            {t('send_broadcast.broadcast_title')} *
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('send_broadcast.enter_title')}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>{t('send_broadcast.description')} *</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('send_broadcast.enter_description')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="options" size={16} color={THEME} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('send_broadcast.settings_media')}
            </Text>
          </View>

          <Text style={styles.label}>
            {t('send_broadcast.target_audience')}
          </Text>
          <View style={styles.roleContainer}>
            {ROLES.map(role => {
              const isActive = targetRole === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  style={[styles.rolePill, isActive && styles.rolePillActive]}
                  onPress={() => {
                    console.log('\n🎯 TARGET AUDIENCE SELECTED');
                    console.log('Selected Role:', role.value);
                    console.log('Role Label:', role.label);
                    console.log('Previous Role:', targetRole);
                    setTargetRole(role.value);
                    console.log('New Role Set To:', role.value);
                    console.log('================================\n');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={role.icon}
                    size={16}
                    color={isActive ? '#fff' : '#6B7280'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.roleText, isActive && styles.roleTextActive]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>
            {t('send_broadcast.image_optional')}
          </Text>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => {
                  setImage(null);
                  setImageBase64(null);
                }}
              >
                <Icon name="close-circle" size={28} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View style={styles.pickImageIconBox}>
                <Icon name="image-outline" size={28} color={THEME} />
              </View>
              <Text style={styles.pickImageText}>
                {t('send_broadcast.select_image')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon
                name="paper-plane"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitBtnText}>
                {t('send_broadcast.send_btn')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SendBroadcastScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  /* SECTION CARDS */
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },

  /* INPUTS */
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },

  /* ROLES */
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  rolePillActive: { backgroundColor: THEME, borderColor: THEME },
  roleText: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
  roleTextActive: { color: '#ffffff' },

  /* IMAGE */
  pickImageBtn: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickImageIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickImageText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 2,
  },

  /* SUBMIT */
  submitBtn: {
    backgroundColor: '#1F2937',
    height: 56,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

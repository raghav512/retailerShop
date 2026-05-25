import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import apiService from '../../../Redux/apiService';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { State, City } from 'country-state-city';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenSecond = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showStates, setShowStates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const indianStates = State.getStatesOfCountry('IN');
  const [districts, setDistricts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfileDetails();
      const userData = response.data || response;

      if (userData) {
        setSelectedState(userData.state || '');
        setSelectedDistrict(userData.district || '');

        if (userData.state) {
          const stateObj = indianStates.find(s => s.name === userData.state);
          if (stateObj) {
            setSelectedStateCode(stateObj.isoCode);
            const cities = City.getCitiesOfState('IN', stateObj.isoCode);
            setDistricts(cities);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  const filteredStates = indianStates.filter(state =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const filteredDistricts = districts.filter(city =>
    city.name.toLowerCase().includes(districtSearch.toLowerCase()),
  );

  const handleUpdate = async () => {
    if (!selectedState || !selectedDistrict) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('profile_screens.select_state_district'),
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🏠 ScreenSecond - Current form values:', {
        selectedState,
        selectedDistrict,
      });

      const profileData = {
        state: selectedState,
        district: selectedDistrict,
      };

      console.log('🏠 ScreenSecond - Sending profile data:', profileData);
      const response = await apiService.UpdateProfileData(profileData);
      console.log('🏠 ScreenSecond - Profile updated:', response);

      showAlert({
        type: 'success',
        title: t('success'),
        message: t('profile_screens.address_updated'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error('🏠 ScreenSecond - Update profile error:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: t('profile_screens.address_update_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={FARMER_COLORS.textOnPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('profile_screens.address_details')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD */}
        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator
              size="large"
              color={FARMER_COLORS.primaryLight}
              style={{ marginTop: 40 }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <Icon
                name="location"
                size={20}
                color={FARMER_COLORS.primaryLight}
              />
            </View>

            <Text style={styles.cardTitle}>
              {t('profile_screens.edit_address_details')}
            </Text>

            {/* STATE */}
            <Text style={styles.label}>{t('state')} *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStates(!showStates)}
            >
              <Text style={styles.dropdownText}>
                {selectedState || t('select_state')}
              </Text>
              <Icon name="chevron-down-outline" size={20} color="#777" />
            </TouchableOpacity>

            {/* STATE LIST */}
            {showStates && (
              <View style={styles.dropdownList}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('profile_screens.search_state')}
                  value={stateSearch}
                  onChangeText={setStateSearch}
                  placeholderTextColor="#999"
                />
                <FlatList
                  data={filteredStates}
                  keyExtractor={item => item.isoCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedState(item.name);
                        setSelectedStateCode(item.isoCode);
                        setShowStates(false);
                        setStateSearch('');
                        setSelectedDistrict('');
                        const cities = City.getCitiesOfState(
                          'IN',
                          item.isoCode,
                        );
                        setDistricts(cities);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                />
              </View>
            )}

            {/* DISTRICT */}
            <Text style={styles.label}>{t('district')} *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDistricts(!showDistricts)}
            >
              <Text style={styles.dropdownText}>
                {selectedDistrict || t('select_district')}
              </Text>
              <Icon name="chevron-down-outline" size={20} color="#777" />
            </TouchableOpacity>

            {/* DISTRICT LIST */}
            {showDistricts && (
              <View style={styles.dropdownList}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('profile_screens.search_district')}
                  value={districtSearch}
                  onChangeText={setDistrictSearch}
                  placeholderTextColor="#999"
                />
                <FlatList
                  data={filteredDistricts}
                  keyExtractor={item => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedDistrict(item.name);
                        setShowDistricts(false);
                        setDistrictSearch('');
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                />
              </View>
            )}
          </View>
        )}

        {/* UPDATE BUTTON */}
        {!loading && (
          <TouchableOpacity
            style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.updateText}>
              {loading
                ? t('profile_screens.updating')
                : t('profile_screens.update')}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ScreenSecond;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: FARMER_COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    elevation: 1,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: FARMER_COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    color: FARMER_COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: FARMER_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: FARMER_COLORS.inputBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '500',
  },

  dropdownList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: FARMER_COLORS.border,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: FARMER_COLORS.surface,
    elevation: 3,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.border + '40',
  },
  dropdownItemText: {
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '500',
  },
  searchInput: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.border,
    paddingHorizontal: 16,
    fontSize: 15,
    color: FARMER_COLORS.textPrimary,
    backgroundColor: FARMER_COLORS.inputBackground,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    fontWeight: '500',
  },

  updateBtn: {
    backgroundColor: FARMER_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateText: {
    color: FARMER_COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

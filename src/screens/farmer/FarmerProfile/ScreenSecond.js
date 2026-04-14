import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import apiService from "../../../Redux/apiService";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  StatusBar
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { State, City } from 'country-state-city';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const ScreenSecond = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showStates, setShowStates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const indianStates = State.getStatesOfCountry('IN');
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('🏠 ScreenSecond - Fetching user data...');
      const response = await apiService.getProfileDetails();
      console.log('🏠 ScreenSecond - Raw response:', JSON.stringify(response, null, 2));

      const userData = response.data || response;
      console.log('🏠 ScreenSecond - Processed userData:', JSON.stringify(userData, null, 2));

      if (userData) {
        setSelectedState(userData.state || "");
        setSelectedDistrict(userData.district || "");

        // Find state code if state exists
        if (userData.state) {
          const stateObj = indianStates.find(s => s.name === userData.state);
          if (stateObj) {
            setSelectedStateCode(stateObj.isoCode);
            const cities = City.getCitiesOfState('IN', stateObj.isoCode);
            setDistricts(cities);
          }
        }

        console.log('🏠 ScreenSecond - Form populated with:', {
          state: userData.state,
          district: userData.district
        });
      }
    } catch (error) {
      console.error('🏠 ScreenSecond - Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = indianStates.filter(state =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredDistricts = districts.filter(city =>
    city.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleUpdate = async () => {
    if (!selectedState || !selectedDistrict) {
      showAlert({ type: 'warning', title: t("error"), message: t("profile_screens.select_state_district") });
      return;
    }

    setLoading(true);
    try {
      console.log('🏠 ScreenSecond - Current form values:', {
        selectedState,
        selectedDistrict
      });

      const profileData = {
        state: selectedState,
        district: selectedDistrict
      };

      console.log('🏠 ScreenSecond - Sending profile data:', profileData);
      const response = await apiService.UpdateProfileData(profileData);
      console.log('🏠 ScreenSecond - Profile updated:', response);

      showAlert({ type: 'success', title: t("success"), message: t("profile_screens.address_updated"), buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      console.error('🏠 ScreenSecond - Update profile error:', error);
      showAlert({ type: 'error', title: t("error"), message: t("profile_screens.address_update_failed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile_screens.address_details")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icon name="location" size={20} color={FARMER_COLORS.primaryLight} />
        </View>

        <Text style={styles.cardTitle}>{t("profile_screens.edit_address_details")}</Text>

        {/* STATE */}
        <Text style={styles.label}>{t("state")} *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowStates(!showStates)}
        >
          <Text style={styles.dropdownText}>
            {selectedState || t("select_state")}
          </Text>
          <Icon name="chevron-down-outline" size={20} color="#777" />
        </TouchableOpacity>

        {/* STATE LIST */}
        {showStates && (
          <View style={styles.dropdownList}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("profile_screens.search_state")}
              value={stateSearch}
              onChangeText={setStateSearch}
              placeholderTextColor="#999"
            />
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.isoCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedState(item.name);
                    setSelectedStateCode(item.isoCode);
                    setShowStates(false);
                    setStateSearch("");
                    setSelectedDistrict("");
                    const cities = City.getCitiesOfState('IN', item.isoCode);
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
        <Text style={styles.label}>{t("district")} *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDistricts(!showDistricts)}
        >
          <Text style={styles.dropdownText}>
            {selectedDistrict || t("select_district")}
          </Text>
          <Icon name="chevron-down-outline" size={20} color="#777" />
        </TouchableOpacity>

        {/* DISTRICT LIST */}
        {showDistricts && (
          <View style={styles.dropdownList}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("profile_screens.search_district")}
              value={districtSearch}
              onChangeText={setDistrictSearch}
              placeholderTextColor="#999"
            />
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedDistrict(item.name);
                    setShowDistricts(false);
                    setDistrictSearch("");
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

      {/* UPDATE BUTTON */}
      <TouchableOpacity
        style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
        onPress={handleUpdate}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.updateText}>{loading ? t("profile_screens.updating") : t("profile_screens.update")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ScreenSecond;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  scrollContainer: {
    flex: 1,
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  /* CARD */
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
  },

  /* FORM */
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#4B5563",
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAF8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 15,
    color: "#1F2937",
  },

  dropdownList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6F8",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#1F2937",
  },
  searchInput: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAF8",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  /* UPDATE BUTTON */
  updateBtn: {
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  updateBtnDisabled: {
    opacity: 0.7,
  },
  updateText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

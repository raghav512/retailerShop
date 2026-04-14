import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
 View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { State, City } from 'country-state-city';
import Icon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";


const Screen2 = () => {
  const navigation = useNavigation();
 const { t } = useTranslation();
  const route = useRoute();
  const { screen1Data, themeColor = "#D97706" } = route.params || {};

  const [selectedState, setSelectedState] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [showStates, setShowStates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const indianStates = State.getStatesOfCountry('IN');
  const [districts, setDistricts] = useState([]);

  const filteredStates = indianStates.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );
  
  const filteredDistricts = districts.filter(city => 
    city.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedState || !selectedDistrict || !village) {
      showAlert({ type: 'warning', title: t("error"), message: t("fill_required_fields") });
      return;
    }

    const finalPayload = {
      ...screen1Data,
      state: selectedState,
      district: selectedDistrict,
      village: village,
      role: "Farmer",
    };

    setIsLoading(true);
    try {
      const response = await apiService.FarmerRegister(finalPayload);
      if (response) {
        showAlert({ type: 'success', title: 'Success', message: 'Registration completed successfully!', buttons: [{ text: 'OK', onPress: () => navigation.navigate('Login') }] });
      }
    } catch (error) {
      if (error.response?.status === 409 || error.message?.includes("already exists")) {
        showAlert({
          type: 'warning',
          title: 'User Already Exists',
          message: 'This phone number is already registered. Please login or use a different phone number.',
          buttons: [
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
            { text: 'Cancel', style: 'cancel' }
          ]
        });
      } else {
        showAlert({ type: 'error', title: t("error"), message: error.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
  {/* TOP ROW */}
  <View style={styles.headerTop}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backIcon}>‹</Text>
    </TouchableOpacity>

    <Text style={styles.stepText}>{t("step_2_of_2")}</Text>
  </View>

  {/* PROGRESS BAR */}
  <View style={styles.progressBarBg}>
    <View style={[styles.progressBarFill, { backgroundColor: themeColor }]} />
  </View>
</View>


      {/* CARD */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* ICON */}
        <View style={[styles.iconWrapper, { backgroundColor: `${themeColor}20` }]}>
          <Icon name="location-outline" size={20} color={themeColor} />
        </View>

        <Text style={styles.cardTitle}>{t("address_details")}</Text>

         {/* STATE */}
        <Text style={styles.label}>{t("state")} *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowStates(!showStates)}
        >
          <Text style={styles.dropdownText}>
            {selectedState || t("select_state")}
          </Text>
          <Text style={styles.dropdownIcon}>⌄</Text>
        </TouchableOpacity>

        {/* STATE LIST */}
        {showStates && (
          <View style={styles.dropdownList}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search state..."
              value={stateSearch}
              onChangeText={setStateSearch}
              placeholderTextColor="#9CA3AF"
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
          <Text style={styles.dropdownIcon}>⌄</Text>
        </TouchableOpacity>

        {/* DISTRICT LIST */}
        {showDistricts && (
          <View style={styles.dropdownList}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search district..."
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
            />
          </View>
        )}

        {/* VILLAGE */}
        <Text style={styles.label}>{t("village")} *</Text>
        <TextInput
          placeholder={t("enter_village")}
          placeholderTextColor="#999"
          style={styles.input}
          value={village}
          onChangeText={setVillage}
        />
      </View>

      {/* SUBMIT BUTTON */}
      <TouchableOpacity 
        style={[styles.continueBtn, { backgroundColor: themeColor }, isLoading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueText}>{t("submit")}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default Screen2;
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
  },

  scrollContent: {
    flex: 1,
  },

 header: {
  padding: 16,
  backgroundColor: "#F4F6F5",
},

headerTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},

backBtn: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#EDEDED",
  justifyContent: "center",
  alignItems: "center",
},

backIcon: {
  fontSize: 22,
  color: "#333",
  lineHeight: 22,
},

stepText: {
  fontSize: 12,
  color: "#666",
  fontWeight: "500",
},

progressBarBg: {
  height: 4,
  width: "100%",
  backgroundColor: "#E0E0E0",
  borderRadius: 2,
},

progressBarFill: {
  height: 4,
  width: "100%",
  borderRadius: 2,
},


  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 3,
  },

  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },

  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    fontSize: 14,
    color: "#555",
  },

  dropdownIcon: {
    fontSize: 16,
    color: "#777",
  },

  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: "#fff",
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },

  searchInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#333",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    fontSize: 14,
    color: "#333",
  },

  continueBtn: {
    backgroundColor: "#D97706",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});




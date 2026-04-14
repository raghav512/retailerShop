import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { showAlert } from "../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { State, City } from 'country-state-city';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from "../../Redux/apiService";
import { FPO_COLORS } from '../../colorsList/ColorList';

const FpoRegistration = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [showGender, setShowGender] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    shopName: "",
    state: "",
    district: "",
    village: "",
    gst: "",
  });

  const indianStates = State.getStatesOfCountry('IN');
  const districts = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];

  const filteredStates = indianStates.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );
  
  const filteredDistricts = districts.filter(city => 
    city.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.gender ||
      !form.shopName ||
      !form.state ||
      !form.district ||
      !form.village ||
      !form.gst
    ) {
      showAlert({ type: 'warning', title: t("error"), message: t("fill_required_fields") });
      return;
    }

    const payload = {
      role: "FPO",
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      password: form.password,
      state: form.state.trim(),
      district: form.district.trim(),
      village: form.village.trim(),
      gstNumber: form.gst.trim(),
      shopName: form.shopName.trim(),
      emailId: form.email.trim(),
    };

    try {
      const response = await apiService.FPORegister(payload);
      showAlert({ type: 'success', title: 'Success', message: response?.message || 'Registration successful!', buttons: [{ text: 'OK', onPress: () => navigation.navigate('FPOLogin') }] });
    } catch (error) {
      showAlert({ type: 'error', title: t("error"), message: error?.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={FPO_COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t("fpo_registration")}</Text>
          <Text style={styles.subtitle}>{t("fpo_registration_sub")}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t("first_name")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_first_name")}
              style={styles.input}
              value={form.firstName}
              onChangeText={v => handleChange("firstName", v)}
            />
          </View>

          <Text style={styles.label}>{t("last_name")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_last_name")}
              style={styles.input}
              value={form.lastName}
              onChangeText={v => handleChange("lastName", v)}
            />
          </View>

          <Text style={styles.label}>{t("email")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_email")}
              keyboardType="email-address"
              style={styles.input}
              value={form.email}
              onChangeText={v => handleChange("email", v)}
            />
          </View>

          <Text style={styles.label}>{t("phone_number")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_phone")}
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={form.phone}
              onChangeText={v => handleChange("phone", v)}
            />
          </View>

          <Text style={styles.label}>{t("password")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_password")}
              secureTextEntry={!showPassword}
              style={styles.input}
              value={form.password}
              onChangeText={v => handleChange("password", v)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t("gender")}</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowGender(!showGender)}
          >
            <Text style={styles.selectText}>
              {form.gender || "Select gender"}
            </Text>
            <Icon name="chevron-down-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          {showGender && (
            <View style={styles.dropdown}>
              {["male", "female"].map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    handleChange("gender", item);
                    setShowGender(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{t("state")}</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowState(!showState)}
          >
            <Text style={styles.selectText}>
              {form.state || t("select_state")}
            </Text>
            <Icon name="chevron-down-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          {showState && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search state..."
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {filteredStates.map((item) => (
                  <TouchableOpacity
                    key={item.isoCode}
                    style={styles.option}
                    onPress={() => {
                      handleChange("state", item.name);
                      setSelectedStateCode(item.isoCode);
                      handleChange("district", "");
                      setShowState(false);
                      setStateSearch("");
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>{t("district")}</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowDistrict(!showDistrict)}
          >
            <Text style={styles.selectText}>
              {form.district || t("select_district")}
            </Text>
            <Icon name="chevron-down-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          {showDistrict && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search district..."
                value={districtSearch}
                onChangeText={setDistrictSearch}
              />
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {filteredDistricts.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.option}
                    onPress={() => {
                      handleChange("district", item.name);
                      setShowDistrict(false);
                      setDistrictSearch("");
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>{t("village")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_village")}
              style={styles.input}
              value={form.village}
              onChangeText={v => handleChange("village", v)}
            />
          </View>

          <Text style={styles.label}>{t("gst_number")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder={t("enter_gst")}
              style={styles.input}
              value={form.gst}
              onChangeText={v => handleChange("gst", v)}
            />
          </View>

          <Text style={styles.label}>FPO / Shop Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Enter FPO name"
              style={styles.input}
              value={form.shopName}
              onChangeText={v => handleChange("shopName", v)}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>{t("register")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FpoRegistration;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 30 },
  header: { backgroundColor: "#dae6f5ff", padding: 20 },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 6 },
  form: { padding: 16 },
  label: { fontSize: 12, marginBottom: 6, color: "#374151" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 13, color: "#111827" },
  selectBox: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  selectText: { fontSize: 13, color: "#6B7280" },
  submitBtn: {
    backgroundColor: FPO_COLORS.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    maxHeight: 200,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 10,
    fontSize: 13,
  },
  dropdownScroll: { maxHeight: 150 },
  option: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
  },
});

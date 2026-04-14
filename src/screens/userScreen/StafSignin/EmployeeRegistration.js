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
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { State, City } from 'country-state-city';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from "react-native-date-picker";
import apiService from "../../../Redux/apiService";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const EmployeeRegistration = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [showGender, setShowGender] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openJoining, setOpenJoining] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
    email: "",
    state: "",
    district: "",
    village: "",
    gender: "",
    joiningDate: "",
  });

  const GENDERS = ["male", "female"];

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
      !form.mobile ||
      !form.email ||
      !form.password ||
      !form.gender ||
      !form.state ||
      !form.district ||
      !form.village ||
      !form.joiningDate
    ) {
      showAlert({ type: 'warning', title: t("error"), message: t("fill_required_fields") });
      return;
    }

    const payload = {
      role: "Staff",
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.mobile.trim(),
      gender: form.gender,
      password: form.password,
      state: form.state,
      district: form.district,
      village: form.village,
      emailId: form.email.trim(),
      joiningDate: form.joiningDate,
    };

    try {
      const response = await apiService.StafRegister(payload);
      showAlert({ type: 'success', title: 'Success', message: response?.message || 'Registration successful!', buttons: [{ text: 'OK', onPress: () => navigation.navigate('StafLogin') }] });
    } catch (error) {
      showAlert({ type: 'error', title: t("error"), message: error?.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8CC" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={STAFF_COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t("employee_registration")}</Text>
          <Text style={styles.subtitle}>{t("employee_registration_sub")}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t("first_name")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={form.firstName}
              onChangeText={(v) => handleChange("enter_first_name", v)}
            />
          </View>

          <Text style={styles.label}>{t("last_name")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={form.lastName}
              onChangeText={(v) => handleChange("lastName", v)}
            />
          </View>

          <Text style={styles.label}>{t("mobile_number")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={form.mobile}
              onChangeText={(v) => handleChange("mobile", v)}
            />
          </View>

          <Text style={styles.label}>{t("password")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              secureTextEntry={!showPassword}
              style={styles.input}
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
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
              {form.gender || t("select_gender")}
            </Text>
            <Icon name="chevron-down-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          {showGender && (
            <View style={styles.dropdown}>
              {GENDERS.map(item => (
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

          <Text style={styles.label}>{t("email")}</Text>
          <View style={styles.inputBox}>
            <TextInput
              keyboardType="email-address"
              style={styles.input}
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
            />
          </View>

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
              style={styles.input}
              value={form.village}
              onChangeText={(v) => handleChange("village", v)}
            />
          </View>

          <Text style={styles.label}>{t("joining_date")}</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setOpenJoining(true)}
          >
            <Text style={styles.input}>
              {form.joiningDate || t("joining_date_ph")}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={openJoining}
            date={form.joiningDate ? new Date(form.joiningDate) : new Date()}
            mode="date"
            onConfirm={(date) => {
              setOpenJoining(false);
              handleChange("joiningDate", date.toISOString().split("T")[0]);
            }}
            onCancel={() => setOpenJoining(false)}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>{t("register")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeRegistration;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 30 },
  header: {
    backgroundColor: "#FFF8CC",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 6, textAlign: "center" },
  form: { paddingHorizontal: 16, marginTop: 20 },
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  selectText: { fontSize: 13, color: "#6B7280" },
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
  submitBtn: {
    backgroundColor: STAFF_COLORS.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

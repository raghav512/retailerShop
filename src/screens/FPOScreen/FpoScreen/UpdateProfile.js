import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../Redux/Storage";
import { FPO_COLORS } from '../../../colorsList/ColorList';
import { 
  validateFirstName, 
  validateLastName, 
  validateEmail, 
  validateMobileNumber 
} from '../../../utils/validation';
import { State, City } from 'country-state-city';

const THEME = FPO_COLORS.primary;
const GENDERS = ["male", "female"];

const INDIAN_STATES = State.getStatesOfCountry('IN');

const SECTIONS = [
  {
    title: "Personal Info",
    icon: "person",
    fields: [
      { key: "firstName",  label: "first_name",  icon: "person-outline",   keyboard: "default"       },
      { key: "lastName",   label: "last_name",   icon: "person-outline",   keyboard: "default"       },
      { key: "emailId",    label: "email",       icon: "mail-outline",     keyboard: "email-address" },
      { key: "phone",      label: "phone_number",icon: "call-outline",     keyboard: "number-pad",   maxLen: 10 },
    ],
  },
  {
    title: "Business Info",
    icon: "storefront",
    fields: [
      { key: "shopName",  label: "shop_name",  icon: "storefront-outline", keyboard: "default" },
      { key: "gstNumber", label: "gst_number", icon: "receipt-outline",    keyboard: "default" },
    ],
  },
  {
    title: "Location",
    icon: "location",
    fields: [
      { key: "village",  label: "village",  icon: "home-outline",    keyboard: "default" },
    ],
  },
];

const UpdateProfile = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { profileData } = route.params;

  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    emailId:   "",
    phone:     "",
    gender:    "",
    shopName:  "",
    gstNumber: "",
    village:   "",
    district:  "",
    state:     "",
  });

  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage]     = useState(null);
  const [profileImageNew, setProfileImageNew] = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [showGender, setShowGender]         = useState(false);
  const [showState, setShowState]           = useState(false);
  const [showDistrict, setShowDistrict]     = useState(false);
  const [loading, setLoading]               = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [districts, setDistricts]           = useState([]);
  const [stateSearch, setStateSearch]       = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [isFetching, setIsFetching]         = useState(false);

  useEffect(() => {
    if (profileData) {
      setIsFetching(true);
      setForm({
        firstName: profileData.firstName || "",
        lastName:  profileData.lastName  || "",
        emailId:   profileData.emailId   || "",
        phone:     profileData.phone     || "",
        gender:    profileData.gender    || "",
        shopName:  profileData.shopName  || "",
        gstNumber: profileData.gstNumber || "",
        village:   profileData.village   || "",
        district:  profileData.district  || "",
        state:     profileData.state     || "",
      });
      
      if (profileData.state) {
        const stateObj = INDIAN_STATES.find(s => s.name === profileData.state);
        if (stateObj) {
          setSelectedStateCode(stateObj.isoCode);
          const stateCities = City.getCitiesOfState('IN', stateObj.isoCode);
          setDistricts(stateCities);
        }
      }
      
      if (profileData.profileImage) {
        const img = profileData.profileImage;
        if (typeof img === "object" && img.url) setProfileImage(img.url);
        else if (typeof img === "string" && img !== "null" && img !== "undefined") setProfileImage(img);
      }
      
      setTimeout(() => setIsFetching(false), 300);
    }
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleStateSelect = (state) => {
    setForm(prev => ({ ...prev, state: state.name, district: "" }));
    setSelectedStateCode(state.isoCode);
    const stateCities = City.getCitiesOfState('IN', state.isoCode);
    setDistricts(stateCities);
    setShowState(false);
    setStateSearch("");
  };

  const filteredStates = stateSearch.trim() 
    ? INDIAN_STATES.filter(state => 
        state.name.toLowerCase().includes(stateSearch.toLowerCase())
      )
    : INDIAN_STATES;

  const filteredDistricts = districtSearch.trim()
    ? districts.filter(district => 
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
      )
    : districts;

  const validateField = (key, value) => {
    let validation;
    switch(key) {
      case 'firstName':
        validation = validateFirstName(value);
        break;
      case 'lastName':
        validation = validateLastName(value);
        break;
      case 'emailId':
        validation = validateEmail(value, { required: false });
        break;
      case 'phone':
        validation = validateMobileNumber(value);
        break;
      default:
        return;
    }
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [key]: validation.message }));
    }
  };

  const hasFormChanges = () => {
    if (!profileData) return true;
    return Object.keys(form).some(key => form[key] !== (profileData[key] || ""));
  };

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
          const apiResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ profileImage: `data:${asset.type};base64,${asset.base64}` }),
          });
          if (!apiResponse.ok) { const e = await apiResponse.json(); throw new Error(e.message || "Upload failed"); }
          setProfileImage(asset.uri);
          setProfileImageNew(null);
          showAlert({ type: "success", title: "Success", message: "Profile image updated successfully" });
        } catch (error) {
          showAlert({ type: "error", title: "Error", message: error.message || "Failed to update profile" });
        } finally { setUploading(false); }
      }
    );
  };

  const handleUpdate = async () => {
    const firstNameValidation = validateFirstName(form.firstName);
    const lastNameValidation = validateLastName(form.lastName);
    const emailValidation = validateEmail(form.emailId, { required: false });
    const phoneValidation = validateMobileNumber(form.phone);

    const newErrors = {
      firstName: firstNameValidation.isValid ? "" : firstNameValidation.message,
      lastName: lastNameValidation.isValid ? "" : lastNameValidation.message,
      emailId: emailValidation.isValid ? "" : emailValidation.message,
      phone: phoneValidation.isValid ? "" : phoneValidation.message,
    };

    if (!form.shopName) newErrors.shopName = "Shop name is required";
    if (!form.gstNumber) newErrors.gstNumber = "GST number is required";

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) {
      showAlert({ type: "warning", title: t("error"), message: t("fill_required_fields") });
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      const apiResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!apiResponse.ok) { const e = await apiResponse.json(); throw new Error(e.message || "Update failed"); }
      showAlert({ type: "success", title: t("success"), message: t("profile_updated") });
      navigation.goBack();
    } catch (error) {
      showAlert({ type: "error", title: t("error"), message: "Failed to update profile" });
    } finally { setLoading(false); }
  };

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("update_profile")}</Text>
          <Text style={styles.headerSub}>{t("update_profile_sub")}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {isFetching ? (
          <View style={{ paddingVertical: 100, alignItems: "center" }}>
            <ActivityIndicator size="large" color={THEME} />
            <Text style={{ marginTop: 12, color: "#9CA3AF", fontSize: 14 }}>Loading profile...</Text>
          </View>
        ) : (
          <>

        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.85}>
            {uploading ? (
              <View style={styles.avatarFallback}>
                <ActivityIndicator color={THEME} size="large" />
              </View>
            ) : profileImageNew?.uri || profileImage ? (
              <Image source={{ uri: profileImageNew?.uri || profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
        </View>

        {/* GENDER SELECTOR */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Ionicons name="male-female" size={15} color={THEME} /></View>
            <Text style={styles.sectionTitle}>{t("gender")}</Text>
          </View>
          <TouchableOpacity style={styles.select} onPress={() => setShowGender(!showGender)}>
            <View style={styles.selectLeft}>
              <Ionicons name="person-outline" size={17} color="#9CA3AF" style={{ marginRight: 10 }} />
              <Text style={[styles.selectText, form.gender && { color: "#1F2937" }]}>
                {form.gender ? t(form.gender) : t("select_gender")}
              </Text>
            </View>
            <Ionicons name={showGender ? "chevron-up-outline" : "chevron-down-outline"} size={18} color={THEME} />
          </TouchableOpacity>
          {showGender && (
            <View style={styles.dropdown}>
              {GENDERS.map((item, i) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.option, i === GENDERS.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => { handleChange("gender", item); setShowGender(false); }}
                >
                  <Text style={styles.optionText}>{t(item)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* FORM SECTIONS */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Ionicons name={section.icon} size={15} color={THEME} /></View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.fields.map((field) => (
              <View key={field.key}>
                <Text style={styles.label}>{t(field.label)}</Text>
                <View style={[styles.inputWrapper, errors[field.key] && styles.inputError]}>
                  <Ionicons name={field.icon} size={17} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={(v) => handleChange(field.key, v)}
                    onBlur={() => validateField(field.key, form[field.key])}
                    keyboardType={field.keyboard}
                    maxLength={field.maxLen}
                    placeholder={t(field.label)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize={field.key === 'emailId' ? 'none' : 'words'}
                    editable={!isFetching}
                  />
                </View>
                {errors[field.key] ? <Text style={styles.errorText}>{errors[field.key]}</Text> : null}
              </View>
            ))}
          </View>
        ))}

        {/* STATE & DISTRICT SELECTOR */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}><Ionicons name="earth" size={15} color={THEME} /></View>
            <Text style={styles.sectionTitle}>State & District</Text>
          </View>
          
          <Text style={styles.label}>{t("state")}</Text>
          <TouchableOpacity style={styles.select} onPress={() => setShowState(true)}>
            <View style={styles.selectLeft}>
              <Ionicons name="earth-outline" size={17} color="#9CA3AF" style={{ marginRight: 10 }} />
              <Text style={[styles.selectText, form.state && { color: "#1F2937" }]}>
                {form.state || t("select_state")}
              </Text>
            </View>
            <Ionicons name="chevron-down-outline" size={18} color={THEME} />
          </TouchableOpacity>

          <Text style={styles.label}>{t("district")}</Text>
          <TouchableOpacity 
            style={styles.select} 
            onPress={() => {
              if (form.state) {
                setShowDistrict(true);
              } else {
                showAlert({ type: "warning", title: "Warning", message: "Please select state first" });
              }
            }}
          >
            <View style={styles.selectLeft}>
              <Ionicons name="map-outline" size={17} color="#9CA3AF" style={{ marginRight: 10 }} />
              <Text style={[styles.selectText, form.district && { color: "#1F2937" }]}>
                {form.district || t("select_district")}
              </Text>
            </View>
            <Ionicons name="chevron-down-outline" size={18} color={THEME} />
          </TouchableOpacity>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || !hasFormChanges()) && { opacity: 0.5 }]}
          onPress={handleUpdate}
          activeOpacity={0.85}
          disabled={loading || !hasFormChanges()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>{t("update_profile")}</Text>
            </>
          )}
        </TouchableOpacity>
        </>
        )}

      </ScrollView>

      {/* STATE MODAL */}
      <Modal visible={showState} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => {
                setShowState(false);
                setStateSearch("");
              }}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            
            {/* SEARCH INPUT */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search state..."
                placeholderTextColor="#9CA3AF"
                value={stateSearch}
                onChangeText={setStateSearch}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {stateSearch ? (
                <TouchableOpacity onPress={() => setStateSearch("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.isoCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleStateSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  {form.state === item.name && <Ionicons name="checkmark" size={20} color={THEME} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Ionicons name="search-outline" size={40} color="#E5E7EB" />
                  <Text style={{ color: "#9CA3AF", marginTop: 8 }}>No states found</Text>
                </View>
              }
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </View>
        </View>
      </Modal>

      {/* DISTRICT MODAL */}
      <Modal visible={showDistrict} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => {
                setShowDistrict(false);
                setDistrictSearch("");
              }}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            
            {/* SEARCH INPUT */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search district..."
                placeholderTextColor="#9CA3AF"
                value={districtSearch}
                onChangeText={setDistrictSearch}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {districtSearch ? (
                <TouchableOpacity onPress={() => setDistrictSearch("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {districts.length > 0 ? (
              <FlatList
                data={filteredDistricts}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      handleChange("district", item.name);
                      setShowDistrict(false);
                      setDistrictSearch("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                    {form.district === item.name && <Ionicons name="checkmark" size={20} color={THEME} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Ionicons name="search-outline" size={40} color="#E5E7EB" />
                    <Text style={{ color: "#9CA3AF", marginTop: 8 }}>No districts found</Text>
                  </View>
                }
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={10}
              />
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Ionicons name="location-outline" size={40} color="#E5E7EB" />
                <Text style={{ color: "#9CA3AF", marginTop: 8 }}>No districts available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  /* HEADER */
  headerSpacer: { height: 6, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: "#ffffff", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, zIndex: 10, justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  headerSub: { fontSize: 12, color: "#6B7280", fontWeight: "500", marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },

  /* AVATAR */
  avatarSection: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: THEME },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#EBF3F6", borderWidth: 3, borderColor: THEME,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { fontSize: 34, fontWeight: "800", color: THEME },
  cameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: THEME, justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: "#F4F6F8", elevation: 4,
  },
  avatarLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#EBF3F6", alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  /* INPUTS */
  label: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    backgroundColor: "#FAFAFA", marginBottom: 14, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 15, color: "#1F2937" },

  /* GENDER SELECT */
  select: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    paddingHorizontal: 14, height: 52, backgroundColor: "#FAFAFA",
  },
  selectLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  selectText: { fontSize: 15, color: "#9CA3AF" },
  dropdown: {
    backgroundColor: "#ffffff", borderWidth: 1.5, borderColor: "#E5E7EB",
    borderRadius: 16, marginTop: 8, marginBottom: 4,
    elevation: 6, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  option: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderColor: "#F3F4F6" },
  optionText: { fontSize: 14, color: "#1F2937", fontWeight: "500" },

  /* SUBMIT */
  submitBtn: {
    backgroundColor: "#1F2937", height: 56, borderRadius: 24,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  inputError: { borderColor: "#EF4444" },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: -10, marginBottom: 10, marginLeft: 4 },

  /* MODAL */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  searchContainer: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 14, height: 48,
    backgroundColor: "#F3F4F6", borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1F2937", padding: 0 },
  modalOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 0.5, borderColor: "#F3F4F6" },
  modalOptionText: { fontSize: 15, color: "#1F2937" },
});

import { useNavigation,useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { login } from "../../../Redux/AuthSlice";
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from "../../../Redux/apiService";
import { SafeAreaView } from "react-native-safe-area-context";
import { STAFF_COLORS } from '../../../colorsList/ColorList';


const StaffLogin = () => {
  const navigation = useNavigation()
  const { t } = useTranslation(); // 🌍
  const route = useRoute();
  const dispatch = useDispatch()
  // const [loginType, setLoginType] = useState("PASSWORD"); // PASSWORD | OTP
  // const [idType, setIdType] = useState("EMPLOYEE"); // EMPLOYEE | MOBILE

  // const [employeeId, setEmployeeId] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added missing state
  
 
  
const roleId = route.params?.roleId || "staff";

  // 🔹 Mobile number validation (India – 10 digits)
  const isValidMobile = /^\d{10}$/.test(mobile);

  const roleName =
  roleId === "farmer"
    ? t("role_farmer")
    : roleId === "staff"
    ? t("role_staff")
    : roleId === "fpo"
    ? t("role_fpo")
    : t("role_user");


  /* ---------------- HANDLERS ---------------- */

//   const handleLogin = async () => {
//     // if (idType === "EMPLOYEE" && !employeeId.trim()) {
//     // Alert.alert(t("error"), t("enter_employee_id"));
//     // }

//     if (mobile.length !== 10) {
//      Alert.alert(t("error"), t("enter_valid_mobile"));
//      return;
//     }

//     if (!password.trim()) {
//     Alert.alert(t("error"), t("enter_password"));
//       return;
//     }

// try {
//    const response = await dispatch(
//               login({
//                 phone: mobile,
//                 role: roleId, // ✅ IMPORTANT
//                 password: password,
//               })
//             ).unwrap(); // 🔥 unwrap throws error automatically
      
//             console.log("Login success:", response);
//              // 🔔 Send FCM token to backend
//   if (global.fcmToken) {
//     await apiService.sendFcmTokenToBackend(global.fcmToken);
//   }
// } catch (error) {
//   console.log("Login failed:", error);
//   Alert.alert(
//     t("error"),
//     error?.message || error || t("something_went_wrong")
//   );
// }

//     // 🔹 FUTURE API
//     /*
//     dispatch(login({
//       employeeId,
//       mobile,
//       password,
//       loginType,
//       idType,
//     }))
//     */
//   };


    const handleSendOtp = async () => {
    // 1️⃣ Validate mobile number
    if (!isValidMobile) {
      showAlert({ type: 'warning', title: t("invalid_mobile_title"), message: t("invalid_mobile_message") });
      return;
    }

    setIsLoading(true);

    try {
      // 2️⃣ Call SendOtp API with the correct field name 'mobile'
      const payload = {
        mobile: mobile, // ✅ CORRECT: backend expects {mobile}
        role: roleId,   // Include role if needed by your API
      };
      
      console.log("Sending OTP with payload:", payload);
      
      const response = await apiService.SendOtp(payload);
      
      console.log("OTP response:", response);
      
      // 3️⃣ Check if OTP was sent successfully
      // Adjust this condition based on your actual API response structure
      if (response && (response.success === true || response.status === "success")) {
        // Navigate to OTPData page with necessary params
        navigation.navigate("OTPData", {
          mobile: mobile, // Pass the mobile number
          roleId: roleId,
        });
      } else {
        // Handle API response that doesn't indicate success
        showAlert({ type: 'error', title: t("error"), message: response?.message || response?.error || t("otp_send_failed") });
      }
    } catch (error) {
      console.log("Send OTP failed:", error);
      
      // Better error handling
      let errorMessage = t("something_went_wrong");
      
      if (error.response) {
        // Server responded with error
        console.log("Error response data:", error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = t("network_error");
      } else {
        // Something else happened
        errorMessage = error.message || t("something_went_wrong");
      }

      showAlert({ type: 'error', title: t("error"), message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4E5" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon name="briefcase-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>{t("employee_login",{ role: roleName })}</Text>
          <Text style={styles.subtitle}>
           {t("employee_login_sub")}
          </Text>
        </View>

        {/* LOGIN TYPE */}
        {/* <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              loginType === "PASSWORD" && styles.activeToggle,
            ]}
            onPress={() => setLoginType("PASSWORD")}
          >
            <Text
              style={[
                styles.toggleText,
                loginType === "PASSWORD" && styles.activeToggleText,
              ]}
            >
            {t("password")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              loginType === "OTP" && styles.activeToggle,
            ]}
            onPress={() => setLoginType("OTP")}
          >
            <Text
              style={[
                styles.toggleText,
                loginType === "OTP" && styles.activeToggleText,
              ]}
            >
            {t("otp")}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* ID TYPE */}
        {/* <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              idType === "EMPLOYEE" && styles.activeToggle,
            ]}
            onPress={() => setIdType("EMPLOYEE")}
          >
            <Text
              style={[
                styles.toggleText,
                idType === "EMPLOYEE" && styles.activeToggleText,
              ]}
            >
             {t("employee_id")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              idType === "MOBILE" && styles.activeToggle,
            ]}
            onPress={() => setIdType("MOBILE")}
          >
            <Text
              style={[
                styles.toggleText,
                idType === "MOBILE" && styles.activeToggleText,
              ]}
            >
             {t("mobile")}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>{t("mobile_number")}</Text>
          <View style={styles.inputBox}>
            <Icon name="call-outline" size={18} color="#6B7280" style={{marginRight: 8}} />
            <TextInput
              placeholder={t("mobile_placeholder")}
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              maxLength={10}
            />
          </View>

          {/* <Text style={styles.label}>{t("password")}</Text>
          <View style={styles.inputBox}>
            <Icon name="lock-closed-outline" size={18} color="#6B7280" style={{marginRight: 8}} />
            <TextInput
              placeholder={t("enter_password")}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View> */}

           {/* SEND OTP BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.loginBtn,
                    (!isValidMobile || isLoading) && styles.disabledBtn,
                  ]}
                  disabled={!isValidMobile || isLoading}
                  onPress={handleSendOtp}
                >
                  {isLoading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={[styles.loginText, { marginLeft: 10 }]}>
                        {t("sending_otp")}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.loginText}>
                      {t("login_with_otp")}
                    </Text>
                  )}
                </TouchableOpacity>
        

          {/* BUTTON */}
          {/* <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.85}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>
               {t("login")}
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity>
            {/* <Text style={styles.forgot}>{t("forgot_password")}</Text> */}
          </TouchableOpacity>

          {/*
          <Text style={styles.register}>
            {t("no_account")}
            {" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('EmployeeRegistration')}
            >
              {t("register_employee")}
            </Text>
          </Text>
          */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffLogin;
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF4E5",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* ---------- HEADER ---------- */
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: STAFF_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    fontSize: 30,
    color: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },

  /* ---------- TOGGLE ---------- */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    elevation: 1,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeToggle: {
    backgroundColor: "#FFF4E5",
  },

  toggleText: {
    fontSize: 13,
    color: "#0b0b0b",
  },

  activeToggleText: {
    color: STAFF_COLORS.primary,
    fontWeight: "600",
  },

  /* ---------- FORM ---------- */
  form: {
    paddingHorizontal: 16,
    marginTop: 8,
  },

  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  input: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },

  /* ---------- LOGIN BUTTON ---------- */
  loginBtn: {
    backgroundColor: STAFF_COLORS.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  /* ---------- EXTRA LINKS ---------- */
  forgot: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    color: STAFF_COLORS.primary,
  },

  register: {
    textAlign: "center",
    marginTop: 22,
    fontSize: 14,
    color: "#6B7280",
  },

  registerLink: {
    color: STAFF_COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});

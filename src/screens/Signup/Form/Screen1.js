
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import {
  validateFirstName,
  validateLastName,
  validateMobileNumber,
} from "../../../utils/validation";


const Screen1 = ({ route }) => {

    const navigation = useNavigation()
     const { t } = useTranslation(); // 🌍
    const themeColor = route?.params?.themeColor || "#D97706";
 const [firstName, setfirstName] = useState("");
 const [lastName, setlastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");
  
  const [errors, setErrors] = useState({});
  
const handleContinue = () => {
    const newErrors = {};

    // Validate First Name
    const firstNameValidation = validateFirstName(firstName);
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message;
    }

    // Validate Last Name
    const lastNameValidation = validateLastName(lastName);
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.message;
    }

    // Validate Mobile Number
    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.isValid) {
      newErrors.mobile = mobileValidation.message;
    }

    // Validate Password
    if (!password || password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      showAlert({ type: 'warning', title: t("error"), message: firstError });
      return;
    }

    setErrors({});
    navigation.navigate("Screen2", {
      screen1Data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: mobile.trim(),
        password,
        gender: gender.toLowerCase(),
      },
      themeColor,
    });
  };



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>{t("step_1_of_2")}</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { backgroundColor: themeColor }]} />
        </View>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: `${themeColor}20` }]}>
          <Icon name="person-outline" size={20} color={themeColor} />
        </View>

        <Text style={styles.cardTitle}>{t("personal_details")}</Text>

        {/* FIRST NAME */}
        <Text style={styles.label}>{t("first_name")} *</Text>
        <TextInput
          placeholder={t("enter_first_name")}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, errors.firstName && styles.inputError]}
          value={firstName}
          onChangeText={(text) => {
            setfirstName(text);
            if (errors.firstName) {
              setErrors({ ...errors, firstName: null });
            }
          }}
          onBlur={() => {
            const validation = validateFirstName(firstName);
            if (!validation.isValid) {
              setErrors({ ...errors, firstName: validation.message });
            }
          }}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        {/* LAST NAME */}
        <Text style={styles.label}>{t("last_name")} *</Text>
        <TextInput
          placeholder={t("enter_last_name")}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, errors.lastName && styles.inputError]}
          value={lastName}
          onChangeText={(text) => {
            setlastName(text);
            if (errors.lastName) {
              setErrors({ ...errors, lastName: null });
            }
          }}
          onBlur={() => {
            const validation = validateLastName(lastName);
            if (!validation.isValid) {
              setErrors({ ...errors, lastName: validation.message });
            }
          }}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        {/* MOBILE */}
        <Text style={styles.label}>{t("mobile_number")} *</Text>
        <TextInput
          placeholder={t("mobile_placeholder_short")}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, errors.mobile && styles.inputError]}
          value={mobile}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setMobile(numericText);
            if (errors.mobile) {
              setErrors({ ...errors, mobile: null });
            }
          }}
          onBlur={() => {
            const validation = validateMobileNumber(mobile);
            if (!validation.isValid) {
              setErrors({ ...errors, mobile: validation.message });
            }
          }}
        />
        {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

        {/* PASSWORD */}
<Text style={styles.label}>{t("password")} *</Text>
<TextInput
  placeholder={t("enter_password")}
  placeholderTextColor="#9CA3AF"
  secureTextEntry
  style={[styles.input, errors.password && styles.inputError]}
  value={password}
  onChangeText={(text) => {
    setPassword(text);
    if (errors.password) {
      setErrors({ ...errors, password: null });
    }
  }}
  onBlur={() => {
    if (!password || password.trim() === "") {
      setErrors({ ...errors, password: "Password is required" });
    } else if (password.length < 6) {
      setErrors({ ...errors, password: "Password must be at least 6 characters" });
    }
  }}
/>
{errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* GENDER */}
        <Text style={styles.label}>{t("gender")} *</Text>
        <View style={styles.genderRow}>
          {["Male", "Female", "Other"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.genderBtn,
                gender === item && { ...styles.genderBtnActive, backgroundColor: `${themeColor}20`, borderColor: themeColor },
              ]}
              onPress={() => setGender(item)}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === item && { ...styles.genderTextActive, color: themeColor },
                ]}
              >
                {t(item.toLowerCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CONTINUE */}
      <TouchableOpacity style={[styles.continueBtn, { backgroundColor: themeColor }]} onPress={()=> handleContinue()}>
        <Text style={styles.continueText}> {t("continue")} ›</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default Screen1;
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
  },

  /* HEADER */
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
  width: "50%",
  borderRadius: 2,
},

  /* CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
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

  /* FORM */
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
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
    color:"black"
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  /* GENDER */
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  genderBtn: {
    width: "32%",
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  genderBtnActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#D97706",
  },
  genderText: {
    fontSize: 13,
    color: "#555",
  },
  genderTextActive: {
    color: "#D97706",
    fontWeight: "600",
  },

  /* CONTINUE */
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
});






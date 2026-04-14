import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/Ionicons";
import DatePicker from 'react-native-date-picker';
import apiService from "../../../Redux/apiService";
import { getUserData, getAccessToken } from "../../../Redux/Storage";
import { decode as base64Decode } from 'base-64';
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../colorsList/useThemeColors";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const AddCrop = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [cropName, setCropName] = useState("");
  const [area, setArea] = useState("");
  const [unit, setUnit] = useState("acre");
  const [sowingDate, setSowingDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFarmPicker, setShowFarmPicker] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Decode JWT to get userId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = base64Decode(base64);
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.id;

      const response = await apiService.getFarmsByUserId(userId);
      setFarms(response?.data || []);
    } catch (error) {
      console.error("Fetch farms error:", error);
    }
  };

  const handleSave = async () => {
    if (!cropName.trim() || !selectedFarm || !area) {
      showAlert({ type: 'warning', title: t('error'), message: t('add_crop.fill_fields') });
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        showAlert({ type: 'warning', title: t('error'), message: t('add_crop.login_required') });
        setLoading(false);
        return;
      }

      // Decode JWT to get userId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = base64Decode(base64);
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.id;

      const payload = {
        userId: userId,
        farmId: selectedFarm._id,
        cropName: cropName.trim(),
        area: area,
        unit: unit,
        sowingDate: sowingDate.toISOString().split('T')[0],
      };

      await apiService.addCrop(payload);
      showAlert({ type: 'success', title: t('success'), message: t('add_crop.success') });
      navigation.goBack();
    } catch (error) {
      console.error("Add crop error:", error);
      showAlert({ type: 'error', title: t('error'), message: error.response?.data?.message || t('add_crop.failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('add_crop.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('add_crop.select_farm')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowFarmPicker(!showFarmPicker)}
          activeOpacity={0.7}
        >
          <Text style={selectedFarm ? styles.pickerText : styles.pickerPlaceholder}>
            {selectedFarm ? selectedFarm.farmName : t('add_crop.choose_farm')}
          </Text>
          <Icon name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showFarmPicker && (
          <View style={styles.pickerOptions}>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm._id}
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedFarm(farm);
                  setShowFarmPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{farm.farmName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>{t('add_crop.crop_name')}</Text>
        <TextInput
          style={styles.input}
          value={cropName}
          onChangeText={setCropName}
          placeholder={t('add_crop.crop_name_placeholder')}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t('add_crop.area')}</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={setArea}
          placeholder={t('add_crop.area_placeholder')}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('add_crop.unit')}</Text>
        <TextInput
          style={styles.input}
          value={unit}
          onChangeText={setUnit}
          placeholder={t('add_crop.unit_placeholder')}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t('add_crop.sowing_date')}</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setOpenDatePicker(true)}
        >
          <Text style={styles.dateText}>{sowingDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={openDatePicker}
          date={sowingDate}
          mode="date"
          onConfirm={(date) => {
            setOpenDatePicker(false);
            setSowingDate(date);
          }}
          onCancel={() => setOpenDatePicker(false)}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('add_crop.save_btn')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStyles = (themeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
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
  backButton: {
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
  content: {
    padding: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F9FAF8",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: "center",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1F2937",
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAF8",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerText: {
    fontSize: 15,
    color: "#1F2937",
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  pickerOptions: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6F8",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 15,
    color: "#1F2937",
  },
  saveButton: {
    backgroundColor: themeColors.primaryLight || FARMER_COLORS.primaryLight,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddCrop;

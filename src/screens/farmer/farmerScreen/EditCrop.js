import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/MaterialIcons";
import DatePicker from 'react-native-date-picker';
import apiService from "../../../Redux/apiService";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const EditCrop = ({ route, navigation }) => {
  const { crop } = route.params;
  const [cropName, setCropName] = useState(crop.cropName);
  const [area, setArea] = useState(crop.area?.toString() || "");
  const [unit, setUnit] = useState(crop.unit || "acre");
  const [sowingDate, setSowingDate] = useState(crop.sowingDate ? new Date(crop.sowingDate) : new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!cropName.trim() || !area) {
      showAlert({ type: 'warning', title: t('error'), message: t('edit_crop.fill_fields') });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cropName: cropName.trim(),
        area: area,
        unit: unit,
        sowingDate: sowingDate.toISOString().split('T')[0],
      };

      await apiService.updateCropById(crop._id, payload);
      showAlert({ type: 'success', title: t('success'), message: t('edit_crop.success') });
      navigation.goBack();
    } catch (error) {
      console.error("Update crop error:", error);
      showAlert({ type: 'error', title: t('error'), message: error.response?.data?.message || t('edit_crop.failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_crop.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('edit_crop.crop_name')}</Text>
        <TextInput
          style={styles.input}
          value={cropName}
          onChangeText={setCropName}
          placeholder={t('edit_crop.crop_name_placeholder')}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t('edit_crop.area')}</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={setArea}
          placeholder={t('edit_crop.area_placeholder')}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('edit_crop.unit')}</Text>
        <TextInput
          style={styles.input}
          value={unit}
          onChangeText={setUnit}
          placeholder={t('edit_crop.unit_placeholder')}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t('edit_crop.sowing_date')}</Text>
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
            <Text style={styles.saveButtonText}>{t('edit_crop.save_btn')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
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
  dateText: {
    fontSize: 15,
    color: "#1F2937",
  },
  saveButton: {
    backgroundColor: FARMER_COLORS.primaryLight,
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

export default EditCrop;

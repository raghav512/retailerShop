import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, StatusBar } from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import Icon from "react-native-vector-icons/MaterialIcons";
import apiService from "../../../Redux/apiService";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const EditFarm = ({ route, navigation }) => {
  const { farm } = route.params;
  const [farmName, setFarmName] = useState(farm.farmName);
  const [farmArea, setFarmArea] = useState(farm.farmArea.toString());
  const [unit, setUnit] = useState(farm.unit);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!farmName.trim()) {
      showAlert({ type: 'warning', title: t('error'), message: t('edit_farm.fill_name') });
      return;
    }
    if (!farmArea || parseFloat(farmArea) <= 0) {
      showAlert({ type: 'warning', title: t('error'), message: t('edit_farm.fill_area') });
      return;
    }

    setLoading(true);
    try {
      await apiService.updateFarmById(farm._id, {
        farmName: farmName.trim(),
        farmArea: parseFloat(farmArea),
        unit,
      });
      showAlert({ type: 'success', title: t('success'), message: t('edit_farm.success') });
      navigation.goBack();
    } catch (error) {
      console.error("Update farm error:", error);
      showAlert({ type: 'error', title: t('error'), message: t('edit_farm.failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_farm.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{t('edit_farm.farm_name')}</Text>
        <TextInput
          style={styles.input}
          value={farmName}
          onChangeText={setFarmName}
          placeholder={t('edit_farm.farm_name_placeholder')}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t('edit_farm.farm_area')}</Text>
        <TextInput
          style={styles.input}
          value={farmArea}
          onChangeText={setFarmArea}
          placeholder={t('edit_farm.farm_area_placeholder')}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('edit_farm.unit')}</Text>
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={[styles.unitButton, unit === "acre" && styles.unitButtonActive]}
            onPress={() => setUnit("acre")}
          >
            <Text style={[styles.unitText, unit === "acre" && styles.unitTextActive]}>{t('edit_farm.acre')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === "hectare" && styles.unitButtonActive]}
            onPress={() => setUnit("hectare")}
          >
            <Text style={[styles.unitText, unit === "hectare" && styles.unitTextActive]}>{t('edit_farm.hectare')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('edit_farm.save_btn')}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
  },
  unitContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  unitButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAF8",
  },
  unitButtonActive: {
    backgroundColor: "#e2f0c9",
    borderColor: FARMER_COLORS.primaryLight,
  },
  unitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  unitTextActive: {
    color: FARMER_COLORS.primaryLight,
    fontWeight: "700",
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

export default EditFarm;

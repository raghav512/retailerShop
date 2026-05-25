import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import { getUserData } from '../../../Redux/Storage';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const AddIncomeToDiary = ({ navigation, route }) => {
  const { incomeData } = route.params || {};
  const isEditMode = !!incomeData;

  const [category, setCategory] = useState(incomeData?.category || 'Crop Sale');
  const [productType, setProductType] = useState(incomeData?.productType || '');
  const [date, setDate] = useState(
    incomeData?.date ? new Date(incomeData.date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalProduce, setTotalProduce] = useState(
    incomeData?.totalProduce?.toString() || '',
  );
  const [unit, setUnit] = useState(incomeData?.unit || 'KG');
  const [saleValue, setSaleValue] = useState(
    (incomeData?.amount ?? incomeData?.saleValue)?.toString() || '',
  );
  const [reference, setReference] = useState(incomeData?.reference || '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const incomeCategories = [
    'Crop Sale',
    'Dairy',
    'Government Subsidy',
    'Other',
  ];
  const units = ['KG', 'Quintal', 'Ton', 'Litre', 'Dozen', 'Piece'];

  // Reset hidden fields when category changes to/from Government Subsidy
  React.useEffect(() => {
    const isGovernmentSubsidy = category === 'Government Subsidy';
    if (isGovernmentSubsidy) {
      // Clear hidden fields for Government Subsidy
      setProductType('');
      setTotalProduce('');
      setUnit('KG');
    }
  }, [category]);

  const formatDate = date => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForAPI = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddIncome = async () => {
    const isGovernmentSubsidy = category === 'Government Subsidy';

    // Validation for Government Subsidy
    if (isGovernmentSubsidy) {
      if (!saleValue || saleValue.trim() === '') {
        Alert.alert('Error', 'Please enter amount');
        return;
      }
      const amount = parseFloat(saleValue);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
    } else {
      // Validation for other income categories
      if (!productType || productType.trim() === '') {
        Alert.alert('Error', 'Please enter product type');
        return;
      }
      if (!totalProduce || totalProduce.trim() === '') {
        Alert.alert('Error', 'Please enter total produce');
        return;
      }
      const produce = parseFloat(totalProduce);
      if (isNaN(produce) || produce <= 0) {
        Alert.alert('Error', 'Please enter valid produce quantity');
        return;
      }
      if (!saleValue || saleValue.trim() === '') {
        Alert.alert('Error', 'Please enter sale value');
        return;
      }
      const saleVal = parseFloat(saleValue);
      if (isNaN(saleVal) || saleVal <= 0) {
        Alert.alert('Error', 'Please enter a valid sale value');
        return;
      }
    }

    try {
      setLoading(true);
      const userData = await getUserData();

      const userId = userData?._id || userData?.id;

      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      const parsedAmount = parseFloat(saleValue);
      
      // Build payload based on category
      const payload = {
        userId,
        category,
        date: formatDateForAPI(date),
        amount: parsedAmount,
      };

      // Add additional fields only for non-Government Subsidy categories
      if (category !== 'Government Subsidy') {
        if (productType && productType.trim()) {
          payload.productType = productType.trim();
        }
        if (totalProduce && parseFloat(totalProduce) > 0) {
          payload.totalProduce = parseFloat(totalProduce);
        }
        if (unit) {
          payload.unit = unit;
        }
      }

      // Add reference if provided
      if (reference && reference.trim()) {
        payload.reference = reference.trim();
      }

      let response;
      if (isEditMode) {
        response = await apiService.updateIncomeById(incomeData._id, payload);
        Alert.alert('Success', 'Income entry updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        response = await apiService.addIncome(payload);
        Alert.alert('Success', 'Income entry added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'add'} income entry`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
      <LinearGradient colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Income' : 'Add Income'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.mainTitle}>
          {isEditMode ? 'Edit Income Entry' : 'Add New Income'}
        </Text>

        <Text style={styles.label}>
          Choose income category <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.dropdownText}>{category}</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        {category !== 'Government Subsidy' && (
          <>
            <Text style={styles.label}>
              Product Type <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rice, Tea, Wheat"
              placeholderTextColor="#999"
              value={productType}
              onChangeText={setProductType}
            />
          </>
        )}

        <Text style={styles.label}>
          Date <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {category !== 'Government Subsidy' && (
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Total Produce <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50"
                placeholderTextColor="#999"
                value={totalProduce}
                onChangeText={setTotalProduce}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Unit <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowUnitModal(true)}
              >
                <Text style={styles.dropdownText}>{unit}</Text>
                <Icon name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>
          {category === 'Government Subsidy' ? 'Amount' : 'Sale Value'}{' '}
          <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder={
            category === 'Government Subsidy' ? 'e.g. 5000' : 'e.g. 3000'
          }
          placeholderTextColor="#999"
          value={saleValue}
          onChangeText={setSaleValue}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Reference (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. Sold at local mandi"
          placeholderTextColor="#999"
          value={reference}
          onChangeText={setReference}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Icon name="close" size={18} color="#fff" style={styles.btnIcon} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, loading && styles.disabledButton]}
            onPress={handleAddIncome}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name={isEditMode ? "checkmark" : "add"} size={18} color="#fff" style={styles.btnIcon} />
                <Text style={styles.addButtonText}>
                  {isEditMode ? 'Update' : 'Add'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.modalContent}>
            {incomeCategories.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showUnitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowUnitModal(false)}
          />
          <View style={styles.modalContent}>
            {units.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  setUnit(item);
                  setShowUnitModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddIncomeToDiary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: '#ff0000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#00897b',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  modalItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    transition: 'background-color 0.2s',
  },
  modalItemText: {
    fontSize: 17,
    color: '#2c3e50',
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import DatePicker from 'react-native-date-picker';

// Static dropdown options
const LEAVE_TITLES = [
  'Sick Leave',
  'Casual Leave',
  'Emergency Leave',
  'Planned Leave',
];

const LEAVE_TYPES = [
  'Medical Leave',
  'Personal Leave',
  'Family Emergency',
  'Vacation',
  'Other',
];

const ApplyLeave = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
  });

  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = date => {
    if (!date) return 'dd/mm/yyyy';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title) {
      Alert.alert('Error', 'Please select a title');
      return;
    }
    if (!formData.leaveType) {
      Alert.alert('Error', 'Please select leave type');
      return;
    }
    if (!formData.startDate) {
      Alert.alert('Error', 'Please select start date');
      return;
    }
    if (!formData.endDate) {
      Alert.alert('Error', 'Please select end date');
      return;
    }
    if (!formData.reason.trim()) {
      Alert.alert('Error', 'Please enter reason for leave');
      return;
    }

    // Date validation
    if (formData.endDate < formData.startDate) {
      Alert.alert('Error', 'End date cannot be before start date');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date: formData.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        reason: `${formData.title} - ${formData.leaveType}: ${formData.reason}`,
      };

      console.log('🔍 [ApplyLeave] Payload being sent:', JSON.stringify(payload, null, 2));
      console.log('🔍 [ApplyLeave] Start Date:', formData.startDate);
      console.log('🔍 [ApplyLeave] End Date:', formData.endDate);

      const response = await apiService.applyLeave(payload);

      if (__DEV__) {
        console.log('[ApplyLeave] Success:', response);
      }

      Alert.alert('Success', 'Leave application submitted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.warn('[ApplyLeave] Error:', error?.message);
      }
      Alert.alert('Error', error?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.6}
        >
          <Icon name="arrow-back" size={22} color={STAFF_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for leave</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Title</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTitleDropdown(!showTitleDropdown)}
          >
            <Text style={[styles.dropdownText, !formData.title && styles.placeholder]}>
              {formData.title || 'Sick Leave'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          {showTitleDropdown && (
            <View style={styles.dropdownList}>
              {LEAVE_TITLES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, title: item }));
                    setShowTitleDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Leave Type Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Leave Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowLeaveTypeDropdown(!showLeaveTypeDropdown)}
          >
            <Text style={[styles.dropdownText, !formData.leaveType && styles.placeholder]}>
              {formData.leaveType || 'Medical Leave'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          {showLeaveTypeDropdown && (
            <View style={styles.dropdownList}>
              {LEAVE_TYPES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, leaveType: item }));
                    setShowLeaveTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Start Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={[styles.dateText, !formData.startDate && styles.placeholder]}>
              {formatDate(formData.startDate)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={[styles.dateText, !formData.endDate && styles.placeholder]}>
              {formatDate(formData.endDate)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Reason */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Reason For leave</Text>
          <TextInput
            style={styles.textArea}
            placeholder="I need to go to hospital"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={formData.reason}
            onChangeText={text => setFormData(prev => ({ ...prev, reason: text }))}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={formData.startDate || new Date()}
        mode="date"
        onConfirm={date => {
          setFormData(prev => ({ ...prev, startDate: date }));
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={formData.endDate || new Date()}
        mode="date"
        minimumDate={formData.startDate || new Date()}
        onConfirm={date => {
          setFormData(prev => ({ ...prev, endDate: date }));
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />
    </SafeAreaView>
  );
};

export default ApplyLeave;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: STAFF_COLORS.primary,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: STAFF_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 16,
    color: STAFF_COLORS.textPrimary,
  },
  placeholder: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: STAFF_COLORS.primary,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: STAFF_COLORS.textPrimary,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: STAFF_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  dateText: {
    fontSize: 16,
    color: STAFF_COLORS.textPrimary,
  },
  calendarIcon: {
    fontSize: 20,
  },
  textArea: {
    borderWidth: 2,
    borderColor: STAFF_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: STAFF_COLORS.textPrimary,
    minHeight: 150,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

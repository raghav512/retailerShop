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
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Apply for Leave</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="document-text" size={18} color={STAFF_COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Leave Details</Text>
          </View>

          <Text style={styles.label}>Title *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTitleDropdown(!showTitleDropdown)}
          >
            <Text style={[styles.dropdownText, !formData.title && styles.placeholderText]}>
              {formData.title || 'Select leave title'}
            </Text>
            <Icon name="chevron-down" size={20} color={STAFF_COLORS.primary} />
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

          {/* Leave Type */}
          <Text style={styles.label}>Leave Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowLeaveTypeDropdown(!showLeaveTypeDropdown)}
          >
            <Text style={[styles.dropdownText, !formData.leaveType && styles.placeholderText]}>
              {formData.leaveType || 'Select leave type'}
            </Text>
            <Icon name="chevron-down" size={20} color={STAFF_COLORS.primary} />
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

        {/* Dates Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="calendar" size={18} color={STAFF_COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Duration</Text>
          </View>

          {/* Start Date */}
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={[styles.dateText, !formData.startDate && styles.placeholderText]}>
              {formatDate(formData.startDate)}
            </Text>
            <Icon name="calendar-outline" size={20} color={STAFF_COLORS.primary} />
          </TouchableOpacity>

          {/* End Date */}
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={[styles.dateText, !formData.endDate && styles.placeholderText]}>
              {formatDate(formData.endDate)}
            </Text>
            <Icon name="calendar-outline" size={20} color={STAFF_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Reason Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="chatbox-ellipses" size={18} color={STAFF_COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Reason</Text>
          </View>

          <Text style={styles.label}>Reason For Leave *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter your reason for leave..."
            placeholderTextColor="#9CA3AF"
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
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>Submit Leave Application</Text>
            </>
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
    backgroundColor: '#F4F6F8',
  },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
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

  /* BODY */
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* CARD SECTIONS */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FAF6F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownList: {
    marginTop: -6,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  dateText: {
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

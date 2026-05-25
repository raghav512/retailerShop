import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  FlatList,
  Image,
  Keyboard,
  AppState,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { FPO_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';

const AssignTask = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (__DEV__) console.log('[AssignTask] mounted');
    let isMounted = true;

    const loadTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (__DEV__) console.log('[AssignTask] Fetching staff members');
        const response = await apiService.getAllStaff();

        if (!isMounted) return;

        if (__DEV__) console.log('[AssignTask] API response:', response);

        const staffList = response?.data ?? [];

        const transformedData = staffList
          .filter(staff => staff?._id)
          .map(staff => ({
            id: staff._id,
            name:
              `${staff?.firstName ?? ''} ${staff?.lastName ?? ''}`.trim() ||
              'Unknown',
            role: staff?.role ?? 'Staff',
            profileImage: staff?.profileImage?.url,
          }));

        if (transformedData.length === 0 && staffList.length > 0) {
          if (__DEV__)
            console.warn('[AssignTask] All staff members have invalid IDs');
        }

        if (isMounted) {
          setTeamMembers(transformedData);
          if (__DEV__)
            console.log(
              '[AssignTask] Staff members loaded:',
              transformedData.length,
            );
        }
      } catch (error) {
        if (!isMounted) return;

        if (__DEV__) {
          console.error('[AssignTask] API failed:', error?.message);
          console.error('[AssignTask] Backend data:', error.response?.data);
        }
        setError(
          error?.response?.data?.message ?? 'Failed to load staff members',
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTeamMembers();

    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          if (__DEV__)
            console.log('[AssignTask] App resumed, refreshing staff');
          loadTeamMembers();
        }
      },
    );

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (__DEV__) console.log('[AssignTask] Fetching staff members');
      const response = await apiService.getAllStaff();

      if (__DEV__) console.log('[AssignTask] API response:', response);

      const staffList = response?.data ?? [];

      const transformedData = staffList
        .filter(staff => staff?._id)
        .map(staff => ({
          id: staff._id,
          name:
            `${staff?.firstName ?? ''} ${staff?.lastName ?? ''}`.trim() ||
            'Unknown',
          role: staff?.role ?? 'Staff',
          profileImage: staff?.profileImage?.url,
        }));

      if (transformedData.length === 0 && staffList.length > 0) {
        if (__DEV__)
          console.warn('[AssignTask] All staff members have invalid IDs');
      }

      setTeamMembers(transformedData);
      if (__DEV__)
        console.log(
          '[AssignTask] Staff members loaded:',
          transformedData.length,
        );
    } catch (error) {
      if (__DEV__) {
        console.error('[AssignTask] API failed:', error?.message);
        console.error('[AssignTask] Backend data:', error.response?.data);
      }
      setError(
        error?.response?.data?.message ?? 'Failed to load staff members',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMemberSelect = useCallback(memberId => {
    setSelectedMemberId(memberId);
    if (__DEV__) console.log('[AssignTask] Member selected:', memberId);
  }, []);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && currentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(currentDate);
      selectedDay.setHours(0, 0, 0, 0);

      if (selectedDay < today) {
        alert('Due date cannot be in the past');
        return;
      }

      setDueDate(currentDate);
      if (__DEV__) console.log('[AssignTask] Due date selected:', currentDate);
    }
  };

  const handlePrioritySelect = useCallback(selectedPriority => {
    setPriority(selectedPriority);
    if (__DEV__)
      console.log('[AssignTask] Priority selected:', selectedPriority);
  }, []);

  const handleCategoryToggle = useCallback(category => {
    setSelectedCategories(prev => {
      // Only allow single selection
      const updated = prev.includes(category) ? [] : [category];

      if (__DEV__) {
        console.log('[AssignTask] Category selected:', category);
        console.log('[AssignTask] Updated categories:', updated);
      }

      return updated;
    });
  }, []);

  const handleAssignTask = async () => {
    Keyboard.dismiss();

    if (submitting) return;

    try {
      // Network check
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        alert(t('assign_task.no_internet'));
        return;
      }

      // Task title validation
      const trimmedTitle = taskTitle.trim();
      if (!trimmedTitle) {
        alert(t('assign_task.validation.title_required'));
        return;
      }
      if (trimmedTitle.length < 3) {
        alert(t('assign_task.validation.title_min_length'));
        return;
      }
      if (trimmedTitle.length > 100) {
        alert(t('assign_task.validation.title_max_length'));
        return;
      }
      if (!/[a-zA-Z0-9]/.test(trimmedTitle)) {
        alert(t('assign_task.validation.title_invalid'));
        return;
      }

      // Description validation
      const trimmedDescription = taskDescription.trim();
      if (trimmedDescription && trimmedDescription.length > 500) {
        alert(t('assign_task.validation.description_max_length'));
        return;
      }

      // Member validation
      if (!selectedMemberId) {
        alert(t('assign_task.validation.member_required'));
        return;
      }

      const memberExists = teamMembers.find(m => m.id === selectedMemberId);
      if (!memberExists) {
        alert(t('assign_task.validation.member_invalid'));
        setSelectedMemberId(null);
        return;
      }

      // Due date validation
      if (!dueDate) {
        alert(t('assign_task.validation.due_date_required'));
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(dueDate);
      selectedDay.setHours(0, 0, 0, 0);

      if (selectedDay < today) {
        alert(t('assign_task.validation.due_date_past'));
        return;
      }

      // Priority validation
      if (!priority) {
        alert(t('assign_task.validation.priority_required'));
        return;
      }

      // Category validation
      if (selectedCategories.length === 0) {
        alert(t('assign_task.validation.category_required'));
        return;
      }

      // Location validation
      const trimmedLocation = location.trim();
      if (trimmedLocation && trimmedLocation.length > 200) {
        alert(t('assign_task.validation.location_max_length'));
        return;
      }

      setSubmitting(true);

      const payload = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        assignedTo: selectedMemberId,
        date: new Date().toISOString().split('T')[0],
        deadline: dueDate.toISOString().split('T')[0],
        priority: priority,
        category: selectedCategories[0],
        location: trimmedLocation || undefined,
      };

      if (__DEV__) {
        console.log('[AssignTask] ========== PAYLOAD DEBUG ==========');
        console.log('[AssignTask] Selected category:', selectedCategories[0]);
        console.log(
          '[AssignTask] Full payload:',
          JSON.stringify(payload, null, 2),
        );
        console.log('[AssignTask] =====================================');
      }

      const response = await apiService.createTask(payload);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to create task');
      }

      if (__DEV__) console.log('[AssignTask] Task created:', response);

      alert(t('assign_task.task_created'));
      navigation.goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('[AssignTask] Create task failed:', error?.message);
        console.error('[AssignTask] Backend data:', error.response?.data);
      }

      const backendMessage =
        error.response?.data?.message || error.response?.data?.error || null;

      alert(backendMessage ?? t('assign_task.task_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);
  const priorities = ['Low', 'Medium', 'High'];
  const categories = [
    'Field Visit',
    'Customer Service',
    'Inventory',
    'Delivery',
    'Collection',
    'Documentation',
    'Other',
  ];

  // Loading state — dummy UI
  const renderLoadingItem = () => (
    <View style={styles.memberCard}>
      <View style={[styles.userIcon, { backgroundColor: '#E0E0E0' }]} />
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: 120,
            height: 14,
            backgroundColor: '#E0E0E0',
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <View
          style={{
            width: 80,
            height: 12,
            backgroundColor: '#E0E0E0',
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );

  // Member card
  const renderMemberItem = useCallback(
    ({ item }) => {
      const isSelected = selectedMemberId === item?.id;

      return (
        <TouchableOpacity
          style={[styles.memberCard, isSelected && styles.memberCardSelected]}
          onPress={() => handleMemberSelect(item?.id)}
          accessibilityLabel={`Select ${item?.name}, ${item?.role}`}
          accessibilityHint="Double tap to assign task to this member"
          accessibilityState={{ selected: isSelected }}
        >
          {item?.profileImage ? (
            <Image
              source={{ uri: item.profileImage }}
              style={styles.profileImage}
              onError={e => {
                if (__DEV__)
                  console.warn(
                    '[AssignTask] Image load failed:',
                    e.nativeEvent.error,
                  );
              }}
            />
          ) : (
            <Icon name="person-circle-outline" size={40} color="#999999" />
          )}
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item?.name ?? 'Unknown'}</Text>
            <Text style={styles.memberRole}>{item?.role ?? 'No role'}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedMemberId, handleMemberSelect],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[
          FPO_COLORS.primary,
          FPO_COLORS.primaryDark,
          FPO_COLORS.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to previous screen"
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('assign_task.title')}</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TASK 2 — Task Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t('assign_task.task_title')}{' '}
            <Text style={styles.required}>{t('assign_task.required')}</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('assign_task.task_title_placeholder')}
            placeholderTextColor="#999999"
            value={taskTitle}
            onChangeText={setTaskTitle}
            returnKeyType="next"
            autoCapitalize="sentences"
            accessibilityLabel="Task title input, required field"
            accessibilityHint="Enter the task title"
          />
        </View>

        {/* TASK 3 — Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('assign_task.description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('assign_task.description_placeholder')}
            placeholderTextColor="#999999"
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline
            textAlignVertical="top"
            autoCapitalize="sentences"
            accessibilityLabel="Task description input, optional"
            accessibilityHint="Enter detailed task description"
          />
        </View>

        {/* TASK 4 — Team Members List */}
        <View style={styles.assignToContainer}>
          <Text style={styles.label}>
            <Icon name="person-outline" size={14} color="#333333" />{' '}
            {t('assign_task.assign_to')}{' '}
            <Text style={styles.required}>{t('assign_task.required')}</Text>
          </Text>

          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <View key={i}>{renderLoadingItem()}</View>
              ))}
            </>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t('assign_task.failed_to_load')}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchTeamMembers}
              >
                <Text style={styles.retryText}>{t('assign_task.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : teamMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('assign_task.no_members')}
              </Text>
            </View>
          ) : !selectedMemberId ? (
            <FlatList
              data={teamMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item, index) =>
                item?.id?.toString() ?? index.toString()
              }
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : null}
        </View>

        {/* TASK 5 — Selected Member Card */}
        {selectedMember && (
          <View style={styles.selectedMemberCard}>
            {selectedMember?.profileImage ? (
              <Image
                source={{ uri: selectedMember.profileImage }}
                style={styles.profileImage}
                onError={e => {
                  if (__DEV__)
                    console.warn(
                      '[AssignTask] Selected member image load failed:',
                      e.nativeEvent.error,
                    );
                }}
              />
            ) : (
              <Icon name="person-circle-outline" size={40} color="#4CAF50" />
            )}
            <View style={styles.selectedMemberInfo}>
              <Text style={styles.selectedMemberName}>
                {selectedMember.name}
              </Text>
              <Text style={styles.selectedMemberRole}>
                {selectedMember.role}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedMemberId(null)}
              style={styles.changeButton}
              accessibilityLabel="Change assignee"
            >
              <Icon name="close-circle" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        )}

        {/* TASK 5 — Due Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            <Icon name="calendar-outline" size={14} color="#333333" />{' '}
            {t('assign_task.due_date')}{' '}
            <Text style={styles.required}>{t('assign_task.required')}</Text>
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Select due date"
          >
            <Text style={dueDate ? styles.dateText : styles.datePlaceholder}>
              {dueDate
                ? dueDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })
                : t('assign_task.due_date_placeholder')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TASK 5 — Priority Level */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            <Icon name="flag-outline" size={14} color="#333333" />{' '}
            {t('assign_task.priority_level')}{' '}
            <Text style={styles.required}>{t('assign_task.required')}</Text>
          </Text>
          <View style={styles.priorityContainer}>
            {priorities.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonSelected,
                ]}
                onPress={() => handlePrioritySelect(p)}
                accessibilityLabel={`Select ${p} priority`}
                accessibilityState={{ selected: priority === p }}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TASK 5 — Category */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            <Icon name="pricetag-outline" size={14} color="#333333" />{' '}
            {t('assign_task.category')}{' '}
            <Text style={styles.required}>{t('assign_task.required')}</Text>
          </Text>
          <View style={styles.categoryContainer}>
            {categories.map(cat => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => handleCategoryToggle(cat)}
                  accessibilityLabel={`Select ${cat} category`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TASK 6 — Location (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            <Icon name="location-outline" size={14} color="#333333" />{' '}
            {t('assign_task.location')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('assign_task.location_placeholder')}
            placeholderTextColor="#999999"
            value={location}
            onChangeText={setLocation}
            returnKeyType="done"
            autoCapitalize="words"
            accessibilityLabel="Location input, optional"
            accessibilityHint="Enter task location"
          />
        </View>

        {/* TASK 7 — Create Task Button (Inside ScrollView) */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.createButton,
              submitting && styles.createButtonDisabled,
            ]}
            onPress={handleAssignTask}
            disabled={submitting}
            accessibilityLabel="Create task"
            accessibilityHint="Double tap to create and assign task"
          >
            <Text style={styles.createButtonText}>
              {submitting
                ? t('assign_task.creating')
                : t('assign_task.create_task')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom safe area padding */}
        <SafeAreaView edges={['bottom']}>
          <View style={{ height: 20 }} />
        </SafeAreaView>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default AssignTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FPO_COLORS.background,
  },
  headerGradient: {
    paddingBottom: 4,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  placeholder: {
    width: 42,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  assignToContainer: {
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  memberCardSelected: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8F4',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8F4',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selectedMemberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  selectedMemberRole: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4CAF50',
  },
  changeButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333333',
  },
  datePlaceholder: {
    fontSize: 14,
    color: '#999999',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: '#FF9800',
    borderWidth: 2,
    backgroundColor: '#FFF3E0',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  priorityTextSelected: {
    color: '#FF9800',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  categoryChipSelected: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8F4',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextSelected: {
    color: '#4CAF50',
  },
  buttonWrapper: {
    marginTop: 32,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4A3F8F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A3F8F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButtonDisabled: {
    backgroundColor: '#9E95C8',
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

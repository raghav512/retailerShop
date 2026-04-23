// TASK DETAIL SCREEN — Display assigned task details with all information cards

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { STAFF_COLORS, COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';

const TaskDetailScreen = ({ navigation, route }) => {
  const { taskId } = route?.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [startingTask, setStartingTask] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);

  const getActionErrorMessage = (err, fallbackMessage) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallbackMessage
    );
  };

  const getErrorMessage = error => {
    if (!error.response) {
      return 'Internet nahi hai. Check karo aur retry karo.';
    }
    switch (error.response?.status) {
      case 401:
        return 'Session expire ho gaya. Dobara login karo.';
      case 403:
        return 'Ye task dekhne ki permission nahi hai.';
      case 404:
        return 'Task nahi mila. Baad mein try karo.';
      case 429:
        const retryAfter = error.response?.headers['retry-after'];
        return `Too many requests. ${
          retryAfter
            ? `Retry after ${retryAfter} seconds.`
            : 'Thodi der baad try karo.'
        }`;
      case 500:
        return 'Server mein problem hai. Thodi der mein try karo.';
      default:
        return 'Kuch galat hua. Retry karo.';
    }
  };

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const fetchTaskDetails = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      if (__DEV__) console.log('[TaskDetailScreen] Fetching task:', taskId);

      const response = await apiService.getTaskById(taskId);

      if (__DEV__)
        console.log(
          '[TaskDetailScreen] Response:',
          JSON.stringify(response, null, 2),
        );

      const task = response?.data || response;
      if (isMountedRef.current) {
        setTaskData(task);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (__DEV__) console.log('[TaskDetailScreen] Request aborted');
        return;
      }

      if (__DEV__) {
        console.error('[TaskDetailScreen] Fetch error:', err);
        console.error('[TaskDetailScreen] Error response:', err.response?.data);
      }

      if (isMountedRef.current) {
        const backendMessage =
          err.response?.data?.message || err.response?.data?.error;
        setError(backendMessage ?? getErrorMessage(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [taskId]);

  const handleStartTask = useCallback(async () => {
    try {
      setStartingTask(true);
      const response = await apiService.startTask(taskId);
      if (response?.success) {
        await fetchTaskDetails();
        showAlert({
          type: 'success',
          title: 'Success',
          message: response?.message || 'Task started successfully',
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: response?.message || 'Task start nahi ho paya. Dobara try karo.',
        });
      }
    } catch (err) {
      console.error('[TaskDetailScreen] Failed to start task:', err.message);
      showAlert({
        type: 'error',
        title: 'Error',
        message: getActionErrorMessage(err, 'Task start nahi ho paya. Dobara try karo.'),
      });
    } finally {
      setStartingTask(false);
    }
  }, [taskId, fetchTaskDetails]);

  const handleCompleteTask = useCallback(async () => {
    try {
      setCompletingTask(true);
      const response = await apiService.completeTask(taskId);
      if (response?.success) {
        await fetchTaskDetails();
        showAlert({
          type: 'success',
          title: 'Success',
          message: response?.message || 'Task completed successfully',
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: response?.message || 'Task complete nahi ho paya. Dobara try karo.',
        });
      }
    } catch (err) {
      console.error('[TaskDetailScreen] Failed to complete task:', err.message);
      showAlert({
        type: 'error',
        title: 'Error',
        message: getActionErrorMessage(
          err,
          'Task complete nahi ho paya. Dobara try karo.',
        ),
      });
    } finally {
      setCompletingTask(false);
    }
  }, [taskId, fetchTaskDetails]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    isMountedRef.current = true;

    if (__DEV__) console.log('[TaskDetailScreen] mounted with taskId:', taskId);
    if (taskId) {
      fetchTaskDetails();
    } else {
      setError('Task ID missing');
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [taskId, fetchTaskDetails]);

  const getStatusBadgeStyle = status => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'pending') {
      return { bg: '#FFF7ED', text: '#FB923C' };
    } else if (statusLower === 'in progress' || statusLower === 'in_progress') {
      return { bg: '#DBEAFE', text: '#3B82F6' };
    } else if (statusLower === 'completed') {
      return { bg: '#D1FAE5', text: '#10B981' };
    }
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getPriorityBadgeStyle = priority => {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower === 'high') {
      return { bg: '#FEF2F2', text: '#EF4444' };
    } else if (priorityLower === 'medium') {
      return { bg: '#FEF3C7', text: '#F59E0B' };
    } else if (priorityLower === 'low') {
      return { bg: '#DBEAFE', text: '#3B82F6' };
    }
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const toReadableLabel = value => {
    if (!value || typeof value !== 'string') return '';
    return value
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getTaskCategoryText = task => {
    const normalizeCategoryList = value => {
      if (Array.isArray(value)) return value;
      if (typeof value !== 'string') return [];

      const trimmed = value.trim();
      if (!trimmed) return [];

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } catch (parseError) {
          if (__DEV__)
            console.log(
              '[TaskDetailScreen] categories parse failed:',
              parseError,
            );
        }
      }

      if (trimmed.includes(',')) {
        return trimmed.split(',').map(item => item.trim());
      }

      return [trimmed];
    };

    const categoryList = normalizeCategoryList(task?.categories)
      .map(category => toReadableLabel(String(category)))
      .filter(Boolean);

    if (categoryList.length > 0) {
      return categoryList.join(', ');
    }

    return toReadableLabel(task?.category || task?.taskCategory || '') || 'N/A';
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <View style={styles.header}>
          <View style={styles.backButtonDummy} />
          <View style={styles.headerTitleDummy} />
        </View>

        <View style={[styles.card, styles.taskCard, { marginTop: 20 }]}>
          <View style={styles.taskCardContent}>
            <View style={styles.iconCircleDummy} />
            <View style={{ flex: 1 }}>
              <View style={styles.dummyTextLong} />
              <View
                style={[styles.dummyTextLong, { width: '90%', marginTop: 8 }]}
              />
              <View
                style={[styles.dummyTextLong, { width: '70%', marginTop: 4 }]}
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.statusRow}>
            <View style={styles.dummyText} />
            <View style={styles.badgeDummy} />
          </View>
          <View style={styles.statusRow}>
            <View style={styles.dummyText} />
            <View style={styles.badgeDummy} />
          </View>
          <View style={styles.statusRow}>
            <View style={styles.dummyText} />
            <View style={styles.badgeDummy} />
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.locationContent}>
            <View style={styles.iconCircleDummy} />
            <View style={{ flex: 1 }}>
              <View style={styles.dummyText} />
              <View style={[styles.dummyTextLong, { marginTop: 4 }]} />
            </View>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16, marginBottom: 100 }]}>
          <View style={styles.notesContent}>
            <View style={styles.iconCircleDummy} />
            <View style={{ flex: 1 }}>
              <View style={styles.dummyText} />
              <View style={[styles.dummyTextLong, { marginTop: 8 }]} />
              <View
                style={[styles.dummyTextLong, { width: '80%', marginTop: 4 }]}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Assigned</Text>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTaskDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!taskData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Assigned</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Task details not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusBadgeStyle(taskData.status);
  const priorityStyle = getPriorityBadgeStyle(taskData.priority);
  const categoryText = getTaskCategoryText(taskData);
  const dueDateValue = taskData?.dueDate || taskData?.deadline;
  const formattedDueDate = formatDate(dueDateValue);
  const formattedAssignedDate = formatDate(taskData?.assignedDate);
  const normalizedStatus = taskData?.status?.toLowerCase() || '';
  const isPendingTask = normalizedStatus === 'pending';
  const isInProgressTask =
    normalizedStatus === 'in progress' || normalizedStatus === 'in_progress';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* TASK 1 — Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Assigned</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* TASK 2 — Task Card */}
        <View style={[styles.card, styles.taskCard]}>
          <View style={styles.taskCardContent}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="calendar-outline" size={28} color="#FB923C" />
            </View>
            <View style={styles.taskTextContainer}>
              <Text style={styles.taskTitle}>
                {taskData.title || 'Untitled Task'}
              </Text>
              <Text style={styles.taskDescription}>
                {taskData.description || 'No description available'}
              </Text>
            </View>
          </View>
        </View>

        {/* TASK 3 — Status & Priority Card */}
        <View style={[styles.card, styles.statusCard]}>
          <Text style={styles.cardTitle}>Status & Priority</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {taskData.status || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Priority Level</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: priorityStyle.bg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                },
              ]}
            >
              <Ionicons name="flag" size={14} color={priorityStyle.text} />
              <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
                {taskData.priority || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Category</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: '#F3F4F6',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                },
              ]}
            >
              <Ionicons name="pricetag-outline" size={14} color="#4B5563" />
              <Text style={[styles.badgeText, { color: '#4B5563' }]}>
                {categoryText}
              </Text>
            </View>
          </View>
        </View>

        {/* TASK 4 — Location Card */}
        {taskData.location && (
          <View style={[styles.card, styles.locationCard]}>
            <View style={styles.locationContent}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="location" size={28} color="#10B981" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Location</Text>
                <Text style={styles.locationAddress}>{taskData.location}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Additional Details Card — After Location */}
        {(taskData.assignedBy || taskData.assignedDate || dueDateValue) && (
          <View style={[styles.card, styles.detailsCard]}>
            <Text style={styles.cardTitle}>Additional Details</Text>

            {taskData.assignedBy && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Assigned By</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      if (typeof taskData.assignedBy === 'object') {
                        const firstName = taskData.assignedBy?.firstName?.trim();
                        const lastName = taskData.assignedBy?.lastName?.trim();
                        const fullName = `${firstName || ''} ${lastName || ''}`.trim();
                        
                        if (fullName) {
                          return fullName;
                        }
                        
                        return taskData.assignedBy?.phone || taskData.assignedBy?.role || 'N/A';
                      }
                      return taskData.assignedBy;
                    })()}
                  </Text>
                </View>
              </View>
            )}

            {taskData.assignedDate && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Assigned Date</Text>
                  <Text style={styles.detailValue}>
                    {formattedAssignedDate}
                  </Text>
                </View>
              </View>
            )}

            {dueDateValue && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>{formattedDueDate}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TASK 5 — Additional Notes Card */}
        {taskData.notes && (
          <View style={[styles.card, styles.notesCard]}>
            <View style={styles.notesContent}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color="#FB923C"
                />
              </View>
              <View style={styles.notesTextContainer}>
                <Text style={styles.notesLabel}>Additional Notes</Text>
                <Text style={styles.notesText}>{taskData.notes}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      {(isPendingTask || isInProgressTask) && (
        <View style={styles.bottomButtonsContainer}>
          {isPendingTask && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartTask}
              disabled={startingTask || completingTask}
              activeOpacity={0.8}
              accessibilityLabel="Start task"
            >
              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {startingTask ? 'Starting...' : 'Start Task'}
              </Text>
            </TouchableOpacity>
          )}

          {isInProgressTask && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleCompleteTask}
              disabled={completingTask || startingTask}
              activeOpacity={0.8}
              accessibilityLabel="Mark task as complete"
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {completingTask ? 'Completing...' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.tint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: STAFF_COLORS.tint,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  taskCard: {
    marginTop: 20,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 22,
  },
  statusCard: {
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationCard: {
    marginTop: 16,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  detailsCard: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  notesCard: {
    marginTop: 16,
    marginBottom: 100,
  },
  notesContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesTextContainer: {
    flex: 1,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    lineHeight: 22,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: STAFF_COLORS.tint,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#FF9800',
  },
  completeButton: {
    backgroundColor: '#16A34A',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: STAFF_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButtonDummy: {
    width: 44,
    height: 44,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitleDummy: {
    width: 150,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  iconCircleDummy: {
    width: 56,
    height: 56,
    backgroundColor: '#E5E7EB',
    borderRadius: 28,
    marginRight: 12,
  },
  dummyText: {
    width: 100,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  dummyTextLong: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  badgeDummy: {
    width: 80,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});

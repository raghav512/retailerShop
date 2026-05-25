import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';

const TaskAssigned = ({ navigation }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Fetch tasks
  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (isMountedRef.current) {
        if (!isRefresh) setLoading(true);
        setError(null);
      }

      const response = await apiService.getMyTasks();
      let taskList = response?.data || [];

      const tasksWithUserDetails = await Promise.all(
        taskList.map(async task => {
          if (task.assignedTo && typeof task.assignedTo === 'string') {
            return {
              ...task,
              assignedTo: {
                _id: task.assignedTo,
                firstName: 'Staff',
                lastName: 'Member',
              },
            };
          }
          return task;
        }),
      );

      if (isMountedRef.current) {
        // Sort tasks by createdAt in descending order (latest first)
        const sortedTasks = tasksWithUserDetails.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA; // Descending order
        });

        setTasks(sortedTasks);

        if (__DEV__)
          console.log('[TaskAssigned] Tasks loaded:', sortedTasks.length);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (__DEV__) console.log('[TaskAssigned] Request aborted');
        return;
      }

      if (__DEV__) {
        console.error('[TaskAssigned] Failed to load tasks:', err.message);
        console.error('[TaskAssigned] Error details:', err.response?.data);
      }

      if (isMountedRef.current) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    }
  }, []);

  // Error message helper
  const getErrorMessage = err => {
    if (!err.response) {
      return t('task_assigned.no_internet');
    }
    switch (err.response?.status) {
      case 401:
        return t('task_assigned.session_expired');
      case 429:
        const retryAfter = err.response?.headers['retry-after'];
        return retryAfter
          ? t('task_assigned.too_many_requests_retry', { retryAfter })
          : t('task_assigned.too_many_requests');
      case 500:
        return t('task_assigned.server_error');
      default:
        return t('task_assigned.something_went_wrong');
    }
  };

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchTasks();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTasks]);

  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks(true);
  };

  // Status badge color
  const getStatusStyle = status => {
    const normalized = status?.toLowerCase() || 'pending';
    switch (normalized) {
      case 'completed':
        return { bg: '#E8F5E9', text: '#4CAF50' };
      case 'in progress':
        return { bg: '#E3F2FD', text: '#2196F3' };
      default:
        return { bg: '#FFF4E6', text: '#FF9800' };
    }
  };

  // Priority text color
  const getPriorityColor = priority => {
    const normalized = priority?.toLowerCase() || 'medium';
    switch (normalized) {
      case 'high':
        return '#F44336';
      case 'low':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  };

  // Status icon
  const getStatusIcon = status => {
    const normalized = status?.toLowerCase() || 'pending';
    if (normalized === 'completed') {
      return { name: 'checkmark-circle', color: '#4CAF50' };
    }
    return {
      name: 'time-outline',
      color: normalized === 'in progress' ? '#2196F3' : '#FF9800',
    };
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return t('task_assigned.no_deadline');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB').replace(/\//g, '/');
    } catch {
      return t('task_assigned.invalid_date');
    }
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

  const handleTaskPress = useCallback(
    taskId => {
      if (!taskId) {
        console.error('[TaskAssigned] No task ID found!');
        return;
      }
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const getTaskCategoryText = task => {
    if (__DEV__) {
      console.log('[TaskAssigned] Category Debug:');
      console.log('  - task.categories:', task?.categories);
      console.log('  - task.category:', task?.category);
      console.log('  - task.taskCategory:', task?.taskCategory);
    }

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
            console.log('[TaskAssigned] categories parse failed:', parseError);
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

    const finalCategory = toReadableLabel(
      task?.category || task?.taskCategory || '',
    );
    if (__DEV__) {
      console.log('  - Final category text:', finalCategory);
    }
    return finalCategory;
  };

  // Render task card
  const renderTask = ({ item }) => {
    const statusStyle = getStatusStyle(item?.status);
    const statusIcon = getStatusIcon(item?.status);
    const priorityColor = getPriorityColor(item?.priority);
    const categoryText = getTaskCategoryText(item);

    // Debug logging
    if (__DEV__) {
      console.log('========== TASK ITEM DEBUG ==========');
      console.log('Task _id:', item?._id);
      console.log('Task id:', item?.id);
      console.log('assignedTo:', item?.assignedTo);
      console.log('Full item:', JSON.stringify(item, null, 2));
      console.log('====================================');
    }

    // Get display name from assignedTo object
    let displayName = t('task_assigned.unassigned');

    if (item?.assignedTo && typeof item.assignedTo === 'object') {
      const firstName = item.assignedTo.firstName || '';
      const lastName = item.assignedTo.lastName || '';
      displayName = `${firstName} ${lastName}`.trim() || t('task_assigned.unassigned');
    }

    // Get task title
    const taskTitle = item?.title || item?.name || t('task_assigned.untitled_task');

    // Get task ID for navigation - try both _id and id
    const taskId = item?._id || item?.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          if (__DEV__) {
            console.log('[TaskAssigned] Navigation triggered');
            console.log('[TaskAssigned] Task ID:', taskId);
            console.log(
              '[TaskAssigned] Full item:',
              JSON.stringify(item, null, 2),
            );
          }
          handleTaskPress(taskId);
        }}
        accessibilityLabel={`Task: ${taskTitle}, Status: ${item?.status}, Priority: ${item?.priority}`}
      >
        {/* Header with Priority Indicator */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: priorityColor },
            ]}
          />
          <View style={styles.headerContent}>
            <Text style={styles.taskName} numberOfLines={1}>
              {taskTitle}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Ionicons
                name={statusIcon.name}
                size={12}
                color={statusStyle.text}
              />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item?.status || 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {item?.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          {/* Priority */}
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="flag" size={16} color={priorityColor} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('task_assigned.priority')}</Text>
              <Text style={[styles.infoValue, { color: priorityColor }]}>
                {item?.priority || 'Medium'}
              </Text>
            </View>
          </View>

          {/* Category */}
          {categoryText ? (
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="pricetag" size={16} color="#9C27B0" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('task_assigned.category')}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {categoryText}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {/* Assignee */}
          <View style={styles.footerItem}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {displayName[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.footerText} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          {/* Deadline */}
          <View style={styles.deadlineContainer}>
            <Ionicons name="time-outline" size={14} color="#666666" />
            <View>
              <Text style={styles.deadlineLabel}>{t('task_assigned.due_date')}</Text>
              <Text style={styles.deadlineText}>
                {formatDate(item?.deadline || item?.dueDate)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STAFF_COLORS.primary}
          translucent={false}
        />

        <LinearGradient
          colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('task_assigned.title')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Skeleton Loader */}
        <View style={styles.container}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDescription} />
              <View style={styles.skeletonBadgeRow}>
                <View style={styles.skeletonBadge} />
                <View style={styles.skeletonBadge} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STAFF_COLORS.primary}
          translucent={false}
        />

        <LinearGradient
          colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('task_assigned.title')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Error State */}
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.emptyTitle}>{t('task_assigned.failed_to_load')}</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTasks()}
            accessibilityLabel="Retry loading tasks"
          >
            <Text style={styles.retryButtonText}>{t('task_assigned.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STAFF_COLORS.primary}
          translucent={false}
        />

        <LinearGradient
          colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('task_assigned.title')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#9E9E9E" />
          <Text style={styles.emptyTitle}>{t('task_assigned.no_tasks')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('task_assigned.no_tasks_subtitle')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      <LinearGradient
        colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('task_assigned.my_tasks')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('task_assigned.task_count', { count: tasks.length })}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item, index) => {
          // Use a unique identifier, but never display ID in UI
          return (
            item?._id?.toString() || item?.id?.toString() || index.toString()
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9800']}
            tintColor="#FF9800"
          />
        }
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

export default TaskAssigned;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -42,
  },
  backBtn: {
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
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
    paddingLeft: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingLeft: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  deadlineLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
  skeletonTitle: {
    width: '70%',
    height: 18,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '90%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonBadge: {
    width: 80,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
});

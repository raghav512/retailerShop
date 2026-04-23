import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { FPO_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import NetInfo from '@react-native-community/netinfo';

const THEME = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  shadow: 'rgba(15, 23, 42, 0.08)',
};

const AllTasksAssigned = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (__DEV__) console.log('[AllTasksAssigned] mounted');
    checkNetworkAndFetch();
  }, []);

  const checkNetworkAndFetch = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      setIsOffline(true);
      setLoading(false);
      return;
    }
    setIsOffline(false);
    fetchTasks();
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      if (__DEV__) console.log('[AllTasksAssigned] API call: /tasks/assigned');
      
      const response = await apiService.getAssignedTasks();
      
      if (__DEV__) console.log('[AllTasksAssigned] API success:', JSON.stringify(response, null, 2));
      
      const tasksList = response?.data ?? [];
      setTasks(tasksList);
    } catch (err) {
      if (__DEV__) {
        console.error('[AllTasksAssigned] API failed:', err?.message);
        console.error('[AllTasksAssigned] Backend validation:', err.response?.data);
      }
      
      const backendMessage = err.response?.data?.message ?? err.response?.data?.error ?? null;
      setError(backendMessage ?? getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err) => {
    if (!err.response) {
      return 'No internet connection. Please check and retry.';
    }
    switch (err.response?.status) {
      case 401: return 'Session expired. Please login again.';
      case 403: return 'You do not have permission to access this.';
      case 404: return 'Data not found. Please try again later.';
      case 500: return 'Server error. Please try again in a moment.';
      default: return 'Something went wrong. Please retry.';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return THEME.error;
      case 'medium': return THEME.warning;
      case 'low': return THEME.success;
      default: return THEME.textTertiary;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return THEME.success;
      case 'in progress': return THEME.info;
      case 'pending': return THEME.warning;
      default: return THEME.textTertiary;
    }
  };

  const renderDummyCard = () => (
    <View style={styles.card}>
      <View style={[styles.dummyBox, { width: '70%', height: 22, marginBottom: 10 }]} />
      <View style={[styles.dummyBox, { width: '50%', height: 16, marginBottom: 16 }]} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View style={[styles.dummyBox, { width: 70, height: 28, borderRadius: 14 }]} />
        <View style={[styles.dummyBox, { width: 80, height: 28, borderRadius: 14 }]} />
        <View style={[styles.dummyBox, { width: 65, height: 28, borderRadius: 14 }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={[styles.dummyBox, { width: '45%', height: 16 }]} />
        <View style={[styles.dummyBox, { width: '35%', height: 16 }]} />
      </View>
    </View>
  );

  const renderTaskCard = ({ item }) => {
    const assignedToName = item?.assignedTo
      ? `${item.assignedTo.firstName ?? ''} ${item.assignedTo.lastName ?? ''}`.trim()
      : 'N/A';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        accessibilityLabel={`Task: ${item?.title ?? 'Untitled'}`}
        android_ripple={{ color: 'rgba(37, 99, 235, 0.08)' }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {item?.title ?? 'Untitled Task'}
          </Text>
        </View>
        
        <View style={styles.assignedToContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {assignedToName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.assignedTo} numberOfLines={1}>
            {assignedToName}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(item?.priority) + '15', borderColor: getPriorityColor(item?.priority) + '30' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(item?.priority) }]}>
              {item?.priority ?? 'N/A'}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: getStatusColor(item?.status) + '15', borderColor: getStatusColor(item?.status) + '30' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item?.status) }]}>
              {item?.status ?? 'N/A'}
            </Text>
          </View>

          {item?.category && (
            <View style={[styles.badge, { backgroundColor: THEME.purple + '15', borderColor: THEME.purple + '30' }]}>
              <Text style={[styles.badgeText, { color: THEME.purple }]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={styles.infoValue}>{formatDate(item?.deadline)}</Text>
          </View>
          {item?.location && (
            <View style={[styles.infoItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                📍 {item.location}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assigned Tasks</Text>
          <Text style={styles.headerSubtitle}>Manage and track all assigned tasks</Text>
        </View>
        <FlatList
          data={[1, 2, 3]}
          renderItem={renderDummyCard}
          keyExtractor={(item, index) => `dummy-${index}`}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  if (isOffline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assigned Tasks</Text>
          <Text style={styles.headerSubtitle}>Manage and track all assigned tasks</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📡</Text>
          </View>
          <Text style={styles.emptyText}>No Internet Connection</Text>
          <Text style={styles.emptySubtext}>Please check your network and try again</Text>
          <Pressable
            style={styles.retryButton}
            onPress={checkNetworkAndFetch}
            accessibilityLabel="Retry button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assigned Tasks</Text>
          <Text style={styles.headerSubtitle}>Manage and track all assigned tasks</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>⚠️</Text>
          </View>
          <Text style={styles.emptyText}>Failed to Load Data</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={fetchTasks}
            accessibilityLabel="Retry button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assigned Tasks</Text>
          <Text style={styles.headerSubtitle}>Manage and track all assigned tasks</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyText}>No Tasks Found</Text>
          <Text style={styles.emptySubtext}>No tasks have been assigned yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Tasks</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>Manage and track all assigned tasks</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{tasks.length}</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderTaskCard}
        keyExtractor={(item, index) => item?._id?.toString() ?? index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default AllTasksAssigned;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: THEME.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textPrimary,
    letterSpacing: -0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: THEME.textSecondary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  assignedToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.primary + '30',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  assignedTo: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME.textSecondary,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderLight,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dummyBox: {
    backgroundColor: THEME.borderLight,
    borderRadius: 6,
  },
});

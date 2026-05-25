import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';
import { getUserData } from '../../../Redux/Storage';
const { Calendar } = require('react-native-calendars');

const STATUS_COLORS = {
  present: '#10B981',
  absent: '#EF4444',
  half: '#F59E0B',
  leave: '#3B82F6',
  pending: '#F59E0B',
  holiday: '#9CA3AF',
};

const ATTENDANCE_STATES = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  CHECKOUT_PENDING: 'CHECKOUT_PENDING',
  NO_DATA: 'NO_DATA',
  FUTURE_DATE: 'FUTURE_DATE',
  LEAVE: 'LEAVE',
  WEEKEND: 'WEEKEND',
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const padNumber = value => String(value).padStart(2, '0');

const formatDateKey = dateObj => {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime()))
    return null;
  return `${dateObj.getFullYear()}-${padNumber(
    dateObj.getMonth() + 1,
  )}-${padNumber(dateObj.getDate())}`;
};

const getDateKey = rawDate => {
  if (!rawDate) return null;

  try {
    if (rawDate instanceof Date) {
      if (isNaN(rawDate.getTime())) return null;
      return formatDateKey(rawDate);
    }

    if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim();
      if (!trimmed) return null;

      // Handle ISO date format (YYYY-MM-DD)
      const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoMatch?.[1]) return isoMatch[1];

      // Handle epoch timestamps (string numbers)
      if (/^\d+$/.test(trimmed)) {
        const timestamp = parseInt(trimmed, 10);
        // Convert seconds to milliseconds if needed
        const normalizedTimestamp =
          trimmed.length <= 10 ? timestamp * 1000 : timestamp;
        const date = new Date(normalizedTimestamp);
        if (isNaN(date.getTime())) return null;
        return formatDateKey(date);
      }

      // Try parsing as regular date string
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime())) return null;
      return formatDateKey(parsedDate);
    }

    if (typeof rawDate === 'number') {
      if (!isFinite(rawDate)) return null;
      // Convert seconds to milliseconds if needed
      const normalizedTimestamp = rawDate < 1e12 ? rawDate * 1000 : rawDate;
      const date = new Date(normalizedTimestamp);
      if (isNaN(date.getTime())) return null;
      return formatDateKey(date);
    }

    return null;
  } catch (error) {
    console.warn('Date parsing error:', error, 'for input:', rawDate);
    return null;
  }
};

const isWeekendDate = dateKey => {
  if (!dateKey) return false;
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
};

const StaffAttendance = ({ navigation }) => {
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    half: 0,
    leave: 0,
    workingDays: 0,
  });
  const [currentMonth, setCurrentMonth] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [staffId, setStaffId] = useState(null);

  const requestIdRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  const fetchAttendanceData = useCallback(
    async (silent = false) => {
      const requestId = ++requestIdRef.current;
      console.log('📍 MyAttendance Screen Mounted');
      console.log('📅 Selected Month:', currentMonth);
      console.log('📡 Attendance Fetch Started');

      try {
        const userData = await getUserData();
        const userId = userData?._id || userData?.id;

        console.log('👤 Full User Data:', userData);
        console.log('👤 Extracted Staff ID:', userId);

        if (!userId) {
          const errorMsg = 'No user ID found in userData';
          console.error('❌', errorMsg);
          console.error(
            '❌ UserData structure:',
            JSON.stringify(userData, null, 2),
          );
          setError({
            type: 'auth',
            message: 'User authentication failed. Please login again.',
          });
          return;
        }

        setStaffId(userId);
        setError(null); // Clear any previous errors

        if (!silent) {
          setLoading(true);
        } else {
          setBackgroundRefreshing(true);
        }

        const response = await apiService.getMyAttendance();

        if (requestId !== requestIdRef.current) {
          console.log('🚫 Ignoring stale response');
          return;
        }

        console.log('✅ Attendance Fetch Success');

        // Validate API response structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid API response format');
        }

        const records = Array.isArray(response?.data) ? response.data : [];

        // Validate and filter records
        const validRecords = records.filter(record => {
          if (!record || typeof record !== 'object') return false;
          // At least one of date, checkIn should be present
          return record.date || record.checkIn;
        });

        console.log('📊 Parsed Attendance:', validRecords);
        console.log('📊 Total Valid Records:', validRecords.length);
        if (records.length !== validRecords.length) {
          console.log(
            '📊 Filtered Out:',
            records.length - validRecords.length,
            'invalid records',
          );
        }

        setAttendanceData(validRecords);
        generateMarkedDatesFromData(validRecords);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          console.log('🚫 Ignoring stale error');
          return;
        }

        console.error('❌ Failed to fetch attendance:', error);
        console.error(
          '❌ Error details:',
          error.response?.data || error.message,
        );

        // Set user-friendly error messages
        let errorMessage = 'Failed to load attendance data.';
        if (
          error.message?.includes('Network') ||
          error.code === 'NETWORK_ERROR'
        ) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message?.includes('Invalid API response')) {
          errorMessage = 'Invalid data received. Please try again.';
        }

        setError({
          type: 'network',
          message: errorMessage,
          details: error.message,
        });

        // Don't clear existing data on error, keep showing cached data
        if (!attendanceData.length) {
          setAttendanceData([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setBackgroundRefreshing(false);
        }
      }
    },
    [currentMonth],
  );

  const generateMarkedDatesFromData = useCallback(
    records => {
      console.log('🗓️ Generating marked dates');
      const marked = {};
      const stats = {
        present: 0,
        absent: 0,
        half: 0,
        leave: 0,
        workingDays: 0,
      };

      const attendanceByDate = {};
      records.forEach(item => {
        const dateKey = getDateKey(item?.date || item?.checkIn);
        if (dateKey) {
          attendanceByDate[dateKey] = item;
          console.log('📅 Processing attendance item:', { dateKey, item });
        }
      });

      const monthDates = generateMonthDates(
        currentMonth.month,
        currentMonth.year,
      );

      monthDates.forEach(dateKey => {
        const record = attendanceByDate[dateKey];
        const isFuture = dateKey > todayKey;
        const isWeekend = isWeekendDate(dateKey);

        if (isFuture) {
          marked[dateKey] = { disabled: true };
          return;
        }

        if (!record) {
          if (isWeekend) {
            marked[dateKey] = { disabled: true };
          } else {
            marked[dateKey] = {
              marked: true,
              dotColor: STATUS_COLORS.absent,
              customStyles: {
                container: {
                  backgroundColor: `${STATUS_COLORS.absent}15`,
                  borderRadius: 20,
                },
                text: { color: STATUS_COLORS.absent, fontWeight: '600' },
              },
            };
            stats.absent++;
            stats.workingDays++;
            console.log('❌ Absent Mark Added:', dateKey);
          }
          return;
        }

        const hasCheckIn = !!record.checkIn;
        const hasCheckOut = !!record.checkOut;
        const status = record.status?.toLowerCase()?.trim();

        // Priority: Status field first, then checkIn/checkOut logic
        if (
          status === 'leave' ||
          status === 'on_leave' ||
          status === 'on leave'
        ) {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.leave,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.leave}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.leave, fontWeight: '600' },
            },
          };
          stats.leave++;
          stats.workingDays++;
          console.log('🏖️ Leave Mark Added:', dateKey);
        } else if (status === 'present') {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.present,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.present}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.present, fontWeight: '600' },
            },
          };
          stats.present++;
          stats.workingDays++;
          console.log('✅ Present Mark Added (Status):', dateKey);
        } else if (
          status === 'half_day' ||
          status === 'half day' ||
          status === 'halfday'
        ) {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.half,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.half}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.half, fontWeight: '600' },
            },
          };
          stats.half++;
          stats.workingDays++;
          console.log('⚠️ Half Day Mark Added (Status):', dateKey);
        } else if (status === 'absent') {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.absent,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.absent}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.absent, fontWeight: '600' },
            },
          };
          stats.absent++;
          stats.workingDays++;
          console.log('❌ Absent Mark Added (Status):', dateKey);
        } else if (hasCheckIn && hasCheckOut) {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.present,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.present}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.present, fontWeight: '600' },
            },
          };
          stats.present++;
          stats.workingDays++;
          console.log('✅ Present Mark Added (CheckIn/Out):', dateKey);
        } else if (hasCheckIn && !hasCheckOut) {
          marked[dateKey] = {
            marked: true,
            dotColor: STATUS_COLORS.half,
            customStyles: {
              container: {
                backgroundColor: `${STATUS_COLORS.half}15`,
                borderRadius: 20,
              },
              text: { color: STATUS_COLORS.half, fontWeight: '600' },
            },
          };
          stats.half++;
          stats.workingDays++;
          console.log('⚠️ Half Day Mark Added (CheckIn Only):', dateKey);
        } else {
          console.log('⚪ Neutral Date:', dateKey);
        }
      });

      console.log('🗓️ Generated Marked Dates:', marked);
      console.log('📈 Attendance Stats:', stats);

      setMarkedDates(marked);
      setAttendanceStats(stats);
    },
    [currentMonth, todayKey],
  );

  const generateMonthDates = (month, year) => {
    const totalDays = new Date(year, month, 0).getDate();
    const dates = [];
    for (let day = 1; day <= totalDays; day++) {
      dates.push(`${year}-${padNumber(month)}-${padNumber(day)}`);
    }
    return dates;
  };

  useEffect(() => {
    if (staffId) {
      console.log('📅 Month or data changed, regenerating calendar');
      generateMarkedDatesFromData(attendanceData);
    }
  }, [currentMonth, attendanceData, generateMarkedDatesFromData, staffId]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('📍 Screen Focus Refresh');
      fetchAttendanceData(false);
    }, [fetchAttendanceData]),
  );

  const onRefresh = useCallback(() => {
    console.log('🔁 Pull To Refresh Triggered');
    setRefreshing(true);
    fetchAttendanceData(false);
  }, [fetchAttendanceData]);

  const handleMonthChange = useCallback(month => {
    console.log('📅 Month Changed:', month);

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Update month immediately for UI responsiveness
    setCurrentMonth({ month: month.month, year: month.year });
    const newMonthKey = `${month.year}-${padNumber(month.month)}-01`;
    setSelectedDate(newMonthKey);

    // Debounce the data fetch to prevent rapid API calls
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('📡 Debounced month change fetch triggered');
      // The useEffect will handle the actual data fetch
    }, 300); // 300ms debounce
  }, []);

  const handleDayPress = useCallback(day => {
    console.log('📅 Day Pressed:', day.dateString);
    setSelectedDate(day.dateString);
  }, []);

  const formatTime = dateString => {
    if (!dateString) return '--:--';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--:--';
      
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.warn('Time formatting error:', error, 'for input:', dateString);
      return '--:--';
    }
  };

  const formatDisplayDate = dateKey => {
    if (!dateKey) return '--';
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const selectedDayRecord = useMemo(() => {
    return attendanceData.find(record => {
      const recordDate = getDateKey(record?.date || record?.checkIn);
      return recordDate === selectedDate;
    });
  }, [attendanceData, selectedDate]);

  const selectedDayStatus = useMemo(() => {
    if (!selectedDate) return ATTENDANCE_STATES.NO_DATA;
    const isFuture = selectedDate > todayKey;
    if (isFuture) return ATTENDANCE_STATES.FUTURE_DATE;

    if (!selectedDayRecord) {
      return isWeekendDate(selectedDate)
        ? ATTENDANCE_STATES.WEEKEND
        : ATTENDANCE_STATES.ABSENT;
    }

    const hasCheckIn = !!selectedDayRecord.checkIn;
    const hasCheckOut = !!selectedDayRecord.checkOut;
    const status = selectedDayRecord.status?.toLowerCase()?.trim();

    // Priority: Status field first, then checkIn/checkOut logic
    if (status === 'leave' || status === 'on_leave' || status === 'on leave')
      return ATTENDANCE_STATES.LEAVE;
    if (status === 'present') return ATTENDANCE_STATES.PRESENT;
    if (status === 'half_day' || status === 'half day' || status === 'halfday')
      return ATTENDANCE_STATES.HALF_DAY;
    if (status === 'absent') return ATTENDANCE_STATES.ABSENT;

    // Fallback to checkIn/checkOut logic if no explicit status
    if (hasCheckIn && hasCheckOut) return ATTENDANCE_STATES.PRESENT;
    if (hasCheckIn && !hasCheckOut) {
      return selectedDate === todayKey
        ? ATTENDANCE_STATES.CHECKOUT_PENDING
        : ATTENDANCE_STATES.HALF_DAY;
    }
    return ATTENDANCE_STATES.ABSENT;
  }, [selectedDate, selectedDayRecord, todayKey]);

  const getStatusLabel = state => {
    switch (state) {
      case ATTENDANCE_STATES.PRESENT:
        return 'Present';
      case ATTENDANCE_STATES.ABSENT:
        return 'Absent';
      case ATTENDANCE_STATES.HALF_DAY:
        return 'Half Day';
      case ATTENDANCE_STATES.CHECKOUT_PENDING:
        return 'Checkout Pending';
      case ATTENDANCE_STATES.LEAVE:
        return 'Leave';
      case ATTENDANCE_STATES.WEEKEND:
        return 'Weekend';
      case ATTENDANCE_STATES.FUTURE_DATE:
        return 'Future Date';
      default:
        return 'No Data';
    }
  };

  const getStatusColor = state => {
    switch (state) {
      case ATTENDANCE_STATES.PRESENT:
        return STATUS_COLORS.present;
      case ATTENDANCE_STATES.ABSENT:
        return STATUS_COLORS.absent;
      case ATTENDANCE_STATES.HALF_DAY:
        return STATUS_COLORS.half;
      case ATTENDANCE_STATES.CHECKOUT_PENDING:
        return STATUS_COLORS.pending;
      case ATTENDANCE_STATES.LEAVE:
        return STATUS_COLORS.leave;
      default:
        return STATUS_COLORS.holiday;
    }
  };

  if (loading && !backgroundRefreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={STAFF_COLORS.primary} translucent={false} />
        
        {/* GRADIENT HEADER */}
        <LinearGradient
          colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('staff_attendance.title')}</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={STAFF_COLORS.primary} translucent={false} />

      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('staff_attendance.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[STAFF_COLORS.primary]}
            tintColor={STAFF_COLORS.primary}
          />
        }
      >
        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Icon name="warning-outline" size={20} color="#EF4444" />
              <Text style={styles.errorTitle}>Error</Text>
            </View>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.details && (
              <Text style={styles.errorDetails}>Details: {error.details}</Text>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                fetchAttendanceData(false);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Attendance Card */}
        {todayKey &&
          currentMonth.month === today.getMonth() + 1 &&
          currentMonth.year === today.getFullYear() && (
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <Text style={styles.todayCardTitle}>Today's Attendance</Text>
                {(() => {
                  const todayRecord = attendanceData.find(record => {
                    const recordDate = getDateKey(
                      record?.date || record?.checkIn,
                    );
                    return recordDate === todayKey;
                  });
                  const todayStatus = todayRecord
                    ? (() => {
                        const hasCheckIn = !!todayRecord.checkIn;
                        const hasCheckOut = !!todayRecord.checkOut;
                        const status = todayRecord.status
                          ?.toLowerCase()
                          ?.trim();
                        if (
                          status === 'leave' ||
                          status === 'on_leave' ||
                          status === 'on leave'
                        )
                          return ATTENDANCE_STATES.LEAVE;
                        if (status === 'present')
                          return ATTENDANCE_STATES.PRESENT;
                        if (
                          status === 'half_day' ||
                          status === 'half day' ||
                          status === 'halfday'
                        )
                          return ATTENDANCE_STATES.HALF_DAY;
                        if (status === 'absent')
                          return ATTENDANCE_STATES.ABSENT;
                        if (hasCheckIn && hasCheckOut)
                          return ATTENDANCE_STATES.PRESENT;
                        if (hasCheckIn && !hasCheckOut)
                          return ATTENDANCE_STATES.CHECKOUT_PENDING;
                        return ATTENDANCE_STATES.ABSENT;
                      })()
                    : ATTENDANCE_STATES.ABSENT;

                  return (
                    <View
                      style={[
                        styles.todayStatusChip,
                        { backgroundColor: `${getStatusColor(todayStatus)}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.todayStatusText,
                          { color: getStatusColor(todayStatus) },
                        ]}
                      >
                        {getStatusLabel(todayStatus)}
                      </Text>
                    </View>
                  );
                })()}
              </View>

              <Text style={styles.todayMessage}>
                {(() => {
                  const todayRecord = attendanceData.find(record => {
                    const recordDate = getDateKey(
                      record?.date || record?.checkIn,
                    );
                    return recordDate === todayKey;
                  });
                  const todayStatus = todayRecord
                    ? (() => {
                        const hasCheckIn = !!todayRecord.checkIn;
                        const hasCheckOut = !!todayRecord.checkOut;
                        const status = todayRecord.status
                          ?.toLowerCase()
                          ?.trim();
                        if (
                          status === 'leave' ||
                          status === 'on_leave' ||
                          status === 'on leave'
                        )
                          return ATTENDANCE_STATES.LEAVE;
                        if (status === 'present')
                          return ATTENDANCE_STATES.PRESENT;
                        if (
                          status === 'half_day' ||
                          status === 'half day' ||
                          status === 'halfday'
                        )
                          return ATTENDANCE_STATES.HALF_DAY;
                        if (status === 'absent')
                          return ATTENDANCE_STATES.ABSENT;
                        if (hasCheckIn && hasCheckOut)
                          return ATTENDANCE_STATES.PRESENT;
                        if (hasCheckIn && !hasCheckOut)
                          return ATTENDANCE_STATES.CHECKOUT_PENDING;
                        return ATTENDANCE_STATES.ABSENT;
                      })()
                    : ATTENDANCE_STATES.ABSENT;

                  return todayStatus === ATTENDANCE_STATES.CHECKOUT_PENDING
                    ? "Don't forget to checkout before day end"
                    : todayStatus === ATTENDANCE_STATES.ABSENT
                    ? 'You have not checked in today'
                    : todayStatus === ATTENDANCE_STATES.PRESENT
                    ? 'Attendance completed for today'
                    : todayStatus === ATTENDANCE_STATES.HALF_DAY
                    ? 'Half day recorded'
                    : todayStatus === ATTENDANCE_STATES.LEAVE
                    ? 'You are on leave today'
                    : 'No attendance data';
                })()}
              </Text>

              {(() => {
                const todayRecord = attendanceData.find(record => {
                  const recordDate = getDateKey(
                    record?.date || record?.checkIn,
                  );
                  return recordDate === todayKey;
                });
                
                if (!todayRecord) return null;
                
                const status = todayRecord.status?.toLowerCase()?.trim();
                const isOnLeave = status === 'leave' || status === 'on_leave' || status === 'on leave';
                
                if (isOnLeave) {
                  return (
                    <View style={styles.todayLeaveRow}>
                      <Icon name="calendar-outline" size={16} color={STATUS_COLORS.leave} />
                      <Text style={styles.todayLeaveText}>
                        {todayRecord.leaveReason || 'On leave today'}
                      </Text>
                    </View>
                  );
                }
                
                return (
                  <View style={styles.todayTimeRow}>
                    <Text style={styles.todayTimeLabel}>
                      Check-in: {formatTime(todayRecord.checkIn)}
                    </Text>
                    <Text style={styles.todayTimeLabel}>
                      Check-out: {formatTime(todayRecord.checkOut)}
                    </Text>
                  </View>
                );
              })()}
            </View>
          )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: `${STATUS_COLORS.present}15` },
            ]}
          >
            <Text style={[styles.statValue, { color: STATUS_COLORS.present }]}>
              {attendanceStats.present}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: `${STATUS_COLORS.absent}15` },
            ]}
          >
            <Text style={[styles.statValue, { color: STATUS_COLORS.absent }]}>
              {attendanceStats.absent}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: `${STATUS_COLORS.half}15` },
            ]}
          >
            <Text style={[styles.statValue, { color: STATUS_COLORS.half }]}>
              {attendanceStats.half}
            </Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: `${STATUS_COLORS.leave}15` },
            ]}
          >
            <Text style={[styles.statValue, { color: STATUS_COLORS.leave }]}>
              {attendanceStats.leave}
            </Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={`${currentMonth.year}-${padNumber(currentMonth.month)}-01`}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={{
              ...Object.keys(markedDates).reduce((acc, dateKey) => {
                if (dateKey === selectedDate) {
                  // For selected date, enhance the existing styling
                  acc[dateKey] = {
                    ...markedDates[dateKey],
                    selected: true,
                    selectedColor:
                      markedDates[dateKey]?.dotColor || STAFF_COLORS.primary,
                    customStyles: {
                      ...markedDates[dateKey]?.customStyles,
                      container: {
                        ...markedDates[dateKey]?.customStyles?.container,
                        borderWidth: 2,
                        borderColor:
                          markedDates[dateKey]?.dotColor ||
                          STAFF_COLORS.primary,
                      },
                    },
                  };
                } else {
                  acc[dateKey] = markedDates[dateKey];
                }
                return acc;
              }, {}),
            }}
            theme={{
              backgroundColor: STAFF_COLORS.surface,
              calendarBackground: STAFF_COLORS.surface,
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: STAFF_COLORS.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#FF6B6B', // Coral/Red color for today's date
              dayTextColor: '#1F2937',
              textDisabledColor: '#D1D5DB',
              dotColor: STAFF_COLORS.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: STAFF_COLORS.primary,
              monthTextColor: '#1F2937',
              textMonthFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />
        </View>

        {/* Selected Day Details */}
        {selectedDate && (
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsDate}>
                {formatDisplayDate(selectedDate)}
              </Text>
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: `${getStatusColor(selectedDayStatus)}15` },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    { color: getStatusColor(selectedDayStatus) },
                  ]}
                >
                  {getStatusLabel(selectedDayStatus)}
                </Text>
              </View>
            </View>

            {selectedDayRecord && (
              <View style={styles.timeDetailsContainer}>
                {(() => {
                  const status = selectedDayRecord.status?.toLowerCase()?.trim();
                  const isOnLeave = status === 'leave' || status === 'on_leave' || status === 'on leave';
                  
                  if (isOnLeave) {
                    return (
                      <View style={styles.leaveMessageContainer}>
                        <Icon name="calendar-outline" size={20} color={STATUS_COLORS.leave} />
                        <Text style={styles.leaveMessage}>
                          {selectedDayRecord.leaveReason || 'On leave - No check-in/check-out required'}
                        </Text>
                      </View>
                    );
                  }
                  
                  return (
                    <View style={styles.timeDetailRow}>
                      <View style={styles.timeDetailItem}>
                        <Icon
                          name="log-in-outline"
                          size={20}
                          color={STATUS_COLORS.present}
                        />
                        <View style={styles.timeDetailText}>
                          <Text style={styles.timeDetailLabel}>Check In</Text>
                          <Text style={styles.timeDetailValue}>
                            {formatTime(selectedDayRecord.checkIn)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.timeDetailItem}>
                        <Icon
                          name="log-out-outline"
                          size={20}
                          color={STATUS_COLORS.absent}
                        />
                        <View style={styles.timeDetailText}>
                          <Text style={styles.timeDetailLabel}>Check Out</Text>
                          <Text style={styles.timeDetailValue}>
                            {formatTime(selectedDayRecord.checkOut)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })()} 
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffAttendance;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.tint,
  },
  
  /* GRADIENT HEADER */
  gradientHeader: {
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.surface,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeDetailsContainer: {
    marginTop: 8,
  },
  timeDetailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeDetailText: {
    flex: 1,
  },
  timeDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  timeDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  todayCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  todayStatusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  todayMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  todayTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  todayTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  errorMessage: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: `${STATUS_COLORS.leave}10`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: STATUS_COLORS.leave,
  },
  leaveMessage: {
    fontSize: 14,
    color: STATUS_COLORS.leave,
    fontWeight: '500',
    flex: 1,
  },
  todayLeaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  todayLeaveText: {
    fontSize: 12,
    color: STATUS_COLORS.leave,
    fontWeight: '500',
    flex: 1,
  },
});

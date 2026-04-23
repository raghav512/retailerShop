import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ITEM_WIDTH = 56; // 48 width + 8 margin — must match getItemLayout

const getDaysInMonth = (month, year) => {
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, i) => {
    const date = i + 1;
    const dayIndex = new Date(year, month - 1, date).getDay();
    return { date, day: DAY_NAMES[dayIndex] };
  });
};

const Attendance = ({ navigation }) => {
  const { t } = useTranslation();
  const flatListRef = useRef(null);

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [attendanceData, setAttendanceData] = useState({
    checkIn: null,
    checkOut: null,
    status: null,
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState({
    checkIn: false,
    checkOut: false,
    history: false,
  });

  const daysArray = getDaysInMonth(todayMonth, todayYear);

  // Fetch attendance history and set today's status
  const fetchAttendanceHistory = async () => {
    try {
      setLoading(prev => ({ ...prev, history: true }));
      const response = await apiService.getMyAttendance();

      if (__DEV__) {
        console.log('[Attendance] History fetched:', response);
      }

      const records = response?.data || [];
      const sortedRecords = records.sort((a, b) => {
        const timeA = new Date(a.checkIn || a.checkOut || a.timestamp);
        const timeB = new Date(b.checkIn || b.checkOut || b.timestamp);
        return timeB - timeA;
      });

      // Check if today's attendance exists
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayRecord = sortedRecords.find(record => {
        const recordDate = new Date(
          record.checkIn || record.checkOut || record.timestamp,
        );
        return recordDate >= todayStart && recordDate <= todayEnd;
      });

      if (todayRecord) {
        if (__DEV__) {
          console.log('[Attendance] Today record found:', todayRecord);
        }
        setAttendanceData({
          checkIn: todayRecord.checkIn || null,
          checkOut: todayRecord.checkOut || null,
          status: todayRecord.status || null,
        });
      }

      const last7Days = sortedRecords.slice(0, 7);
      return last7Days;
    } catch (error) {
      if (__DEV__) {
        console.warn('[Attendance] History fetch error:', error?.message);
      }
      return [];
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      const history = await fetchAttendanceHistory();
      if (isMounted && history) {
        setActivityHistory(history);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceHistory().then(history => {
        if (history) {
          setActivityHistory(history);
        }
      });
    }, [])
  );

  // Request permission on screen load
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Request location permission (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for attendance.',
            buttonPositive: 'OK',
          },
        );

        if (__DEV__) {
          console.log('[Attendance] Permission result:', granted);
        }

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Required',
            'Please enable location permission from Settings',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'android') {
                    // Open app settings
                    const { Linking } = require('react-native');
                    Linking.openSettings();
                  }
                },
              },
            ],
          );
          return false;
        }
        return false;
      } catch (err) {
        if (__DEV__) {
          console.warn('[Attendance] Permission error:', err);
        }
        return false;
      }
    }
    return true; // iOS handles via Info.plist
  };

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location', // TODO: Reverse geocode if needed
          });
        },
        error => {
          if (__DEV__) {
            console.warn('[Attendance] Location error:', error.message);
          }
          reject(new Error('Unable to get location. Please enable GPS.'));
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 20000,
          maximumAge: 1000,
          forceRequestLocation: true, // Force location request
        },
      );
    });
  };

  // Handle Check In
  const handleCheckIn = async () => {
    // Prevent double tap
    if (loading.checkIn) return;

    try {
      setLoading(prev => ({ ...prev, checkIn: true }));

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location access is required for attendance.',
        );
        return;
      }

      const location = await getCurrentLocation();

      const response = await apiService.checkIn({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });

      // Validate API response
      if (!response?.data?.checkIn) {
        throw new Error('Invalid server response. Please try again.');
      }

      if (__DEV__) {
        console.log('[Attendance] Check-in success:', response);
      }

      setAttendanceData(prev => ({
        ...prev,
        checkIn: response.data.checkIn,
        status: response.data.status,
      }));

      // Refresh activity history
      const updatedHistory = await fetchAttendanceHistory();
      if (updatedHistory) {
        setActivityHistory(updatedHistory);
      }

      Alert.alert('Success', 'Check-in recorded successfully');
    } catch (error) {
      if (__DEV__) {
        console.warn('[Attendance] Check-in error:', error?.message);
      }
      Alert.alert(
        'Error',
        error?.message || 'Failed to check in. Please ensure GPS is enabled.',
      );
    } finally {
      setLoading(prev => ({ ...prev, checkIn: false }));
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    // Prevent double tap
    if (loading.checkOut) return;

    // Validate state
    if (!attendanceData?.checkIn) {
      Alert.alert('Error', 'Please check in first');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, checkOut: true }));

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location access is required for attendance.',
        );
        return;
      }

      const location = await getCurrentLocation();

      const response = await apiService.checkOut({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });

      // Validate API response
      if (!response?.data?.checkOut) {
        throw new Error('Invalid server response. Please try again.');
      }

      if (__DEV__) {
        console.log('[Attendance] Check-out success:', response);
      }

      setAttendanceData(prev => ({
        ...prev,
        checkOut: response.data.checkOut,
      }));

      // Refresh activity history
      const updatedHistory = await fetchAttendanceHistory();
      if (updatedHistory) {
        setActivityHistory(updatedHistory);
      }

      Alert.alert('Success', 'Check-out recorded successfully');
    } catch (error) {
      if (__DEV__) {
        console.warn('[Attendance] Check-out error:', error?.message);
      }
      Alert.alert(
        'Error',
        error?.message || 'Failed to check out. Please ensure GPS is enabled.',
      );
    } finally {
      setLoading(prev => ({ ...prev, checkOut: false }));
    }
  };

  const renderDayItem = ({ item }) => {
    const isSelected = item.date === selectedDate;
    const isToday = item.date === todayDate;

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        style={[styles.dayItem, isSelected && styles.dayItemSelected]}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
          {String(item.date).padStart(2, '0')}
        </Text>
        <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
          {item.day}
        </Text>
        {isToday && !isSelected && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  // TASK 2 — Check In/Out Action Cards
  const renderAttendanceCards = () => {
    const checkInTime = attendanceData?.checkIn
      ? (() => {
          try {
            return new Date(attendanceData.checkIn).toLocaleTimeString(
              'en-IN',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              },
            );
          } catch {
            return '--:--';
          }
        })()
      : null;

    const checkOutTime = attendanceData?.checkOut
      ? (() => {
          try {
            return new Date(attendanceData.checkOut).toLocaleTimeString(
              'en-IN',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              },
            );
          } catch {
            return '--:--';
          }
        })()
      : null;

    const isCheckInDisabled = !!attendanceData.checkIn || loading.checkIn;
    const isCheckOutDisabled =
      !attendanceData.checkIn || !!attendanceData.checkOut || loading.checkOut;

    return (
      <View style={styles.attendanceCard}>
        <Text style={styles.cardTitle}>Today Attendance</Text>
        <View style={styles.attendanceRow}>
          {/* Check In Card */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              isCheckInDisabled && styles.actionCardDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={isCheckInDisabled}
            activeOpacity={0.7}
          >
            <View style={styles.statusBadge}>
              <Text style={styles.badgeIcon}>📥</Text>
              <Text style={styles.badgeText}>Check In</Text>
            </View>
            {loading.checkIn ? (
              <ActivityIndicator
                size="small"
                color={STAFF_COLORS.primary}
                style={styles.loader}
              />
            ) : (
              <>
                <Text style={styles.timeText}>
                  {checkInTime || 'Tap to Check In'}
                </Text>
                {checkInTime && <Text style={styles.statusText}>On Time</Text>}
              </>
            )}
          </TouchableOpacity>

          {/* Check Out Card */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              isCheckOutDisabled && styles.actionCardDisabled,
            ]}
            onPress={handleCheckOut}
            disabled={isCheckOutDisabled}
            activeOpacity={0.7}
          >
            <View style={[styles.statusBadge, styles.statusBadgeOut]}>
              <Text style={styles.badgeIcon}>📤</Text>
              <Text style={styles.badgeText}>Check Out</Text>
            </View>
            {loading.checkOut ? (
              <ActivityIndicator
                size="small"
                color={STAFF_COLORS.primary}
                style={styles.loader}
              />
            ) : (
              <>
                <Text style={styles.timeText}>
                  {checkOutTime || 'Tap to Check Out'}
                </Text>
                {checkOutTime && <Text style={styles.statusText}>Log Out</Text>}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('home.attendance')}</Text>

        {/* ── Fixed Height Calendar Wrapper ── */}
        <View style={styles.calendarWrapper}>
          <FlatList
            ref={flatListRef}
            data={daysArray}
            keyExtractor={item => String(item.date)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarContent}
            renderItem={renderDayItem}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={todayDate - 1}
            onScrollToIndexFailed={info => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
          />
        </View>

        {/* TASK 2 — Check In/Out Action Cards */}
        {renderAttendanceCards()}

        {/* TASK 3 — Apply For Leave Button */}
        <TouchableOpacity
          style={styles.applyLeaveButton}
          onPress={() => {
            if (__DEV__) {
              console.log('[Attendance] Navigating to ApplyLeave');
            }
            navigation.navigate('ApplyLeave');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.applyLeaveText}>Apply For Leave</Text>
        </TouchableOpacity>

        {/* TASK 4 — Your Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Your Activity</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading.history ? (
            <ActivityIndicator
              size="small"
              color={STAFF_COLORS.primary}
              style={styles.activityLoader}
            />
          ) : activityHistory.length === 0 ? (
            <Text style={styles.noActivityText}>No activity records found</Text>
          ) : (
            activityHistory.flatMap((record, recordIndex) => {
              const entries = [];

              // Check In entry
              if (record.checkIn) {
                const checkInDate = new Date(record.checkIn);
                entries.push({
                  key: `${recordIndex}-in`,
                  type: 'Check In',
                  icon: '📥',
                  date: checkInDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
                  time: checkInDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }),
                  timestamp: checkInDate.getTime(),
                });
              }

              // Check Out entry
              if (record.checkOut) {
                const checkOutDate = new Date(record.checkOut);
                entries.push({
                  key: `${recordIndex}-out`,
                  type: 'Check Out',
                  icon: '📤',
                  date: checkOutDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
                  time: checkOutDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }),
                  timestamp: checkOutDate.getTime(),
                });
              }

              return entries;
            })
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(entry => (
              <View key={entry.key} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>{entry.icon}</Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityType}>{entry.type}</Text>
                  <Text style={styles.activityDate}>{entry.date}</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityTime}>{entry.time}</Text>
                  <Text style={styles.activityStatus}>On time</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.tint,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 16,
  },

  // ✅ Fixed height — calendar neeche wali content ko push nahi karega
  calendarWrapper: {
    height: 90,
  },
  calendarContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayItem: {
    width: 48,
    height: 72,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayItemSelected: {
    backgroundColor: STAFF_COLORS.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  dayName: {
    fontSize: 11,
    marginTop: 4,
    color: STAFF_COLORS.textSecondary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: STAFF_COLORS.primary,
    marginTop: 4,
  },

  // TASK 2 — Today Attendance Card
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
    justifyContent: 'center',
  },
  actionCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  attendanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeOut: {
    backgroundColor: '#FFF3E0',
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 12,
    color: STAFF_COLORS.textSecondary,
  },
  loader: {
    marginVertical: 16,
  },

  // TASK 3 — Apply For Leave Button
  applyLeaveButton: {
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  applyLeaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // TASK 4 — Your Activity Section
  activitySection: {
    marginTop: 24,
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: STAFF_COLORS.primary,
  },
  activityLoader: {
    marginVertical: 20,
  },
  noActivityText: {
    fontSize: 14,
    color: STAFF_COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 15,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

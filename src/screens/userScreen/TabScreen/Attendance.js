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
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
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
    }, []),
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
    const scaleAnim = new Animated.Value(1);
    const isSelected = item.date === selectedDate;
    const isToday = item.date === todayDate;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => setSelectedDate(item.date)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.dayItem, isSelected && styles.dayItemSelected]}
          activeOpacity={1}
        >
          <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
            {String(item.date).padStart(2, '0')}
          </Text>
          <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
            {item.day}
          </Text>
          {isToday && !isSelected && <View style={styles.todayDot} />}
        </TouchableOpacity>
      </Animated.View>
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
              <Icon name="log-in" size={16} color="#10B981" />
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
              <Icon name="log-out" size={16} color="#F59E0B" />
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
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('home.attendance')}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity
            style={styles.activityHeader}
            onPress={() => setIsActivityExpanded(!isActivityExpanded)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.activityTitle}>Your Activity</Text>
              <Text style={styles.activitySubtitle}>See 7 days attendance</Text>
            </View>
            <Icon
              name={isActivityExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={STAFF_COLORS.textPrimary}
            />
          </TouchableOpacity>

          {isActivityExpanded && (
            <>
              {loading.history ? (
                <ActivityIndicator
                  size="small"
                  color={STAFF_COLORS.primary}
                  style={styles.activityLoader}
                />
              ) : activityHistory.length === 0 ? (
                <Text style={styles.noActivityText}>
                  No activity records found
                </Text>
              ) : (
                activityHistory
                  .flatMap((record, recordIndex) => {
                    const entries = [];

                    // Check In entry
                    if (record.checkIn) {
                      const checkInDate = new Date(record.checkIn);
                      entries.push({
                        key: `${recordIndex}-in`,
                        type: 'Check In',
                        iconName: 'log-in',
                        iconColor: '#10B981',
                        iconBg: '#ECFDF5',
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
                        iconName: 'log-out',
                        iconColor: '#EF4444',
                        iconBg: '#FEF2F2',
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
                      <View style={[styles.activityIcon, {backgroundColor: entry.iconBg}]}>
                        <Icon name={entry.iconName} size={20} color={entry.iconColor} />
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
            </>
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
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  // ✅ Fixed height — calendar neeche wali content ko push nahi karega
  calendarWrapper: {
    height: 94,
  },
  calendarContent: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayItem: {
    width: 52,
    height: 76,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  dayItemSelected: {
    backgroundColor: STAFF_COLORS.primary,
    borderColor: STAFF_COLORS.primary,
    elevation: 4,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },
  dayName: {
    fontSize: 12,
    marginTop: 5,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: STAFF_COLORS.primary,
    marginTop: 5,
  },

  // TASK 2 — Today Attendance Card
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 130,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  attendanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    gap: 6,
  },
  statusBadgeOut: {
    backgroundColor: '#FEF3C7',
    shadowColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  loader: {
    marginVertical: 16,
  },

  // TASK 3 — Apply For Leave Button
  applyLeaveButton: {
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    elevation: 5,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  applyLeaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // TASK 4 — Your Activity Section
  activitySection: {
    marginTop: 24,
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },
  activitySubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 3,
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
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  activityDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  activityStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

import { FPO_COLORS } from '../../../colorsList/ColorList';
import { CONFIG, STATUS_COLORS } from '../../../constants/attendanceConstants';
import { useStaffList } from '../../../hooks/useStaffList';
import { useAttendanceData } from '../../../hooks/useAttendanceData';
import {
  getAttendanceQueryKey, getMonthStartKey, formatMonthTitle, formatDateKey,
  generateMonthDates, generateMarkedDates, getInitials, addMonth,
  getAttendanceStateLabel, getAttendanceStateChipColors, formatDisplayDate, formatTimeValue,
} from '../../../utils/attendanceUtils';

const AttendanceCalendar = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Memoized date calculations
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);
  const currentMonthStartKey = useMemo(
    () => getMonthStartKey(today.getMonth() + 1, today.getFullYear()),
    [today],
  );

  // UI State
  const [currentMonth, setCurrentMonth] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom hooks
  const {
    staffOptions, selectedStaff, isStaffLoading, staffError,
    fetchStaffList, handleSelectStaff,
  } = useStaffList();

  const {
    attendanceViewState, isAttendanceLoading, isRefreshing, isBackgroundRefreshing,
    attendanceError, fetchStaffAttendance,
  } = useAttendanceData(currentMonthStartKey, todayKey);

  // Derived values
  const currentAttendanceQueryKey = getAttendanceQueryKey(
    selectedStaff?.value, currentMonth.month, currentMonth.year,
  );
  const attendanceByDate = attendanceViewState.attendanceByDate;
  const attendanceMetaByDate = attendanceViewState.attendanceMetaByDate;
  const firstAttendanceDate = attendanceViewState.firstAttendanceDate;

  const isCurrentVisibleMonth = currentMonth.month === today.getMonth() + 1 &&
    currentMonth.year === today.getFullYear();
  const isAttendanceQueryLoaded = attendanceViewState.queryKey === currentAttendanceQueryKey &&
    attendanceViewState.source !== 'attendance-error';
  const syncStatus = isAttendanceLoading || isRefreshing || isBackgroundRefreshing ? 'SYNCING' : 'IDLE';

  // Memoized computations
  const monthDates = useMemo(
    () => generateMonthDates(currentMonth.month, currentMonth.year),
    [currentMonth.month, currentMonth.year],
  );

  const { markedDates, statusCounts, workingDays } = useMemo(
    () => generateMarkedDates({
      monthDates, attendanceByDate, firstAttendanceDate, todayKey,
      isQueryLoaded: isAttendanceQueryLoaded,
      isSyncing: syncStatus === 'SYNCING',
    }),
    [monthDates, attendanceByDate, firstAttendanceDate, todayKey, isAttendanceQueryLoaded, syncStatus],
  );

  // Display date logic
  const displayDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    if (isCurrentVisibleMonth) return todayKey;
    return getMonthStartKey(currentMonth.month, currentMonth.year);
  }, [selectedDate, isCurrentVisibleMonth, todayKey, currentMonth]);

  const selectedDayStatus = useMemo(() => {
    if (!displayDate) return 'NO_DATA';
    return markedDates[displayDate]?.attendanceState || 'NO_DATA';
  }, [displayDate, markedDates]);

  const selectedDayRecord = displayDate ? attendanceByDate[displayDate] || {
    checkIn: null, checkOut: null, status: null,
  } : null;

  const selectedDayMeta = displayDate ? attendanceMetaByDate[displayDate] || {} : {};

  // Today's attendance
  const todayAttendanceRecord = attendanceByDate[todayKey] || null;
  const todayAttendanceState = isCurrentVisibleMonth
    ? markedDates[todayKey]?.attendanceState || 'NO_DATA'
    : 'NO_DATA';
  const todayAttendanceBadgeLabel = getAttendanceStateLabel(todayAttendanceState);
  const shouldShowTodayCard = isCurrentVisibleMonth && !!selectedStaff?.value;

  // Handlers
  const handleDayPress = useCallback((day) => {
    const { dateString } = day;
    if (dateString && !markedDates[dateString]?.disabled) {
      setSelectedDate(dateString);
    }
  }, [markedDates]);

  const handleMonthChange = useCallback((monthInfo) => {
    if (monthInfo?.month && monthInfo?.year) {
      setCurrentMonth({ month: monthInfo.month, year: monthInfo.year });
    }
  }, []);

  const handleMonthStep = useCallback((step) => {
    setCurrentMonth(prev => addMonth(prev.month, prev.year, step));
  }, []);

  const handlePullToRefresh = useCallback(() => {
    if (selectedStaff?.value) {
      fetchStaffAttendance(
        selectedStaff.value, currentMonth.month, currentMonth.year,
        { reason: 'pull-to-refresh', forceRefresh: true, userInitiated: true },
      );
    } else {
      fetchStaffList();
    }
  }, [selectedStaff, currentMonth, fetchStaffAttendance, fetchStaffList]);

  const handleRetry = useCallback(() => {
    if (staffError || !selectedStaff?.value) {
      fetchStaffList();
      return;
    }
    fetchStaffAttendance(
      selectedStaff.value, currentMonth.month, currentMonth.year,
      { reason: 'retry', forceRefresh: true, userInitiated: true },
    );
  }, [staffError, selectedStaff, currentMonth, fetchStaffList, fetchStaffAttendance]);

  // Fetch staff on focus
  useFocusEffect(
    useCallback(() => {
      fetchStaffList();
      if (selectedStaff?.value) {
        fetchStaffAttendance(
          selectedStaff.value, currentMonth.month, currentMonth.year,
          { reason: 'focus', forceRefresh: true, silent: true },
        );
      }
    }, []),
  );

  // Fetch attendance when staff/month changes
  useEffect(() => {
    if (selectedStaff?.value) {
      fetchStaffAttendance(
        selectedStaff.value, currentMonth.month, currentMonth.year,
        { reason: 'month-or-staff-change', forceRefresh: false, silent: false },
      );
    }
  }, [selectedStaff?.value, currentMonth.month, currentMonth.year]);

  // Sync selected date when month changes
  useEffect(() => {
    const currentPrefix = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-`;
    if (selectedDate && selectedDate.startsWith(currentPrefix)) {
      return;
    }
    setSelectedDate(isCurrentVisibleMonth ? todayKey : null);
  }, [currentMonth.month, currentMonth.year, selectedDate, isCurrentVisibleMonth, todayKey]);

  // Background refresh interval
  useEffect(() => {
    if (!selectedStaff?.value || !isCurrentVisibleMonth) return;

    const intervalId = setInterval(() => {
      fetchStaffAttendance(
        selectedStaff.value, currentMonth.month, currentMonth.year,
        { reason: 'background-interval', forceRefresh: true, silent: true },
      );
    }, CONFIG.BACKGROUND_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [selectedStaff?.value, isCurrentVisibleMonth, currentMonth, fetchStaffAttendance]);

  // Render calendar day
  const renderCalendarDay = useCallback(({ date }) => {
    const dateString = date?.dateString;
    if (!dateString) return <View style={styles.emptyDayCell} />;

    const marking = markedDates[dateString] || { statusKey: 'absent', disabled: false };
    const isSelected = selectedDate === dateString && !marking.disabled;
    const weekDayIndex = new Date(`${dateString}T00:00:00`).getDay();
    const isWeekend = weekDayIndex === 0 || weekDayIndex === 6;
    const statusLineColor = marking.disabled ? STATUS_COLORS.holiday : STATUS_COLORS[marking.statusKey] || STATUS_COLORS.absent;
    const dayTextColor = isSelected ? '#FFFFFF' : marking.disabled ? '#AEB5BE' : isWeekend ? STATUS_COLORS.absent : '#2E3338';

    return (
      <TouchableOpacity
        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
        activeOpacity={0.85}
        onPress={() => handleDayPress({ dateString })}
        disabled={marking.disabled}
        accessibilityLabel={`${date.day}, ${getAttendanceStateLabel(marking.attendanceState)}`}
        accessibilityRole="button"
      >
        {isSelected ? (
          <View style={styles.dayNumberSelectedCircle}>
            <Text style={[styles.dayNumberText, { color: dayTextColor }]}>{date.day}</Text>
          </View>
        ) : (
          <Text style={[styles.dayNumberText, { color: dayTextColor }]}>{date.day}</Text>
        )}
        <View style={[styles.dayStatusLine, { backgroundColor: statusLineColor }]} />
      </TouchableOpacity>
    );
  }, [markedDates, selectedDate, handleDayPress]);

  const selectedDayChipColors = getAttendanceStateChipColors(selectedDayStatus);
  const todayBadgeColors = getAttendanceStateChipColors(todayAttendanceState);
  const statusBadgeLabel = getAttendanceStateLabel(selectedDayStatus);
  const errorMessage = staffError || attendanceError;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar translucent={false} backgroundColor={FPO_COLORS.primary} barStyle="light-content" />
      
      <LinearGradient
        colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.screenTitle}>{t('fpo_home.attendance_calendar')}</Text>
          </View>

          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handlePullToRefresh} tintColor={FPO_COLORS.primary} />
        }
      >
        <Text style={styles.sectionTitle}>CHOOSE STAFF</Text>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.staffSelector}
            onPress={() => setIsDropdownOpen(prev => !prev)}
            disabled={isStaffLoading || staffOptions.length === 0}
            accessibilityLabel={selectedStaff?.label || 'Select staff'}
            accessibilityRole="button"
          >
            <LinearGradient colors={['#4A7FE5', '#2EA56E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.staffAvatar}>
              <Text style={styles.staffAvatarText}>{getInitials(selectedStaff?.label)}</Text>
            </LinearGradient>
            <Text style={styles.staffNameText}>
              {isStaffLoading ? 'Loading staff...' : selectedStaff?.label || 'No staff found'}
            </Text>
            <Icon name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#6A7078" />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {staffOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.dropdownItem, selectedStaff?.value === option.value && styles.dropdownItemActive]}
                  activeOpacity={0.9}
                  onPress={() => { handleSelectStaff(option); setIsDropdownOpen(false); }}
                  accessibilityLabel={`Select ${option.label}`}
                  accessibilityRole="button"
                >
                  <View style={styles.dropdownDot} />
                  <Text style={[styles.dropdownItemText, selectedStaff?.value === option.value && styles.dropdownItemTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {!!errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} activeOpacity={0.85} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.monthRow}>
          <TouchableOpacity style={styles.monthNavButton} activeOpacity={0.9} onPress={() => handleMonthStep(-1)} accessibilityLabel="Previous month">
            <Text style={styles.monthNavText}>{'<'}</Text>
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={styles.monthTitle}>{formatMonthTitle(currentMonth)}</Text>
            <Text style={styles.monthSubtitle}>{workingDays} working days</Text>
            {isBackgroundRefreshing && <Text style={styles.backgroundRefreshText}>Syncing latest...</Text>}
          </View>

          <TouchableOpacity style={styles.monthNavButton} activeOpacity={0.9} onPress={() => handleMonthStep(1)} accessibilityLabel="Next month">
            <Text style={styles.monthNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.present }]}>{statusCounts.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.absent }]}>{statusCounts.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.half }]}>{statusCounts.half}</Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.leave }]}>{statusCounts.leave}</Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
        </View>

        {shouldShowTodayCard && (
          <View style={styles.todayStatusCard}>
            <View style={styles.todayStatusHeader}>
              <Text style={styles.todayStatusTitle}>Today&apos;s Attendance</Text>
              <View style={[styles.todayStatusBadge, { backgroundColor: todayBadgeColors.backgroundColor }]}>
                <Text style={[styles.todayStatusBadgeText, { color: todayBadgeColors.textColor }]}>{todayAttendanceBadgeLabel}</Text>
              </View>
            </View>
            <Text style={styles.todayStatusMessage}>
              {todayAttendanceState === 'CHECKIN_PENDING' ? 'You have not checked in today' :
               todayAttendanceState === 'CHECKOUT_PENDING' ? 'Checkout pending' :
               todayAttendanceState === 'PRESENT' ? 'Attendance completed' :
               todayAttendanceState === 'ABSENT' ? 'Absent marked' :
               todayAttendanceBadgeLabel}
            </Text>
            <View style={styles.todayStatusMetaRow}>
              <Text style={styles.todayStatusMetaText}>Check-in: {formatTimeValue(todayAttendanceRecord?.checkIn)}</Text>
              <Text style={styles.todayStatusMetaText}>Check-out: {formatTimeValue(todayAttendanceRecord?.checkOut)}</Text>
            </View>
          </View>
        )}

        <View style={styles.calendarBlock}>
          <Calendar
            key={currentAttendanceQueryKey}
            current={getMonthStartKey(currentMonth.month, currentMonth.year)}
            hideExtraDays
            hideArrows
            renderHeader={() => <View />}
            firstDay={0}
            enableSwipeMonths
            disableAllTouchEventsForDisabledDays
            onMonthChange={handleMonthChange}
            dayComponent={renderCalendarDay}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#707780',
              textSectionTitleDisabledColor: '#A7AFB8',
              textDayHeaderFontSize: 10,
              textDayHeaderFontWeight: '700',
              monthTextColor: '#22262D',
              textMonthFontWeight: '700',
              dayTextColor: '#2E3338',
              'stylesheet.calendar.header': {
                header: { marginTop: 4, marginBottom: 4 },
                week: { marginTop: 0, flexDirection: 'row', justifyContent: 'space-around' },
                dayHeader: { width: 32, textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#707780' },
              },
            }}
          />
        </View>

        <View style={styles.legendWrap}>
          {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'disabled').map(([key, color]) => (
            <View key={key} style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeading}>{formatDisplayDate(displayDate).toUpperCase()}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Status</Text>
            <View style={[styles.statusChip, { backgroundColor: selectedDayChipColors.backgroundColor }]}>
              <Text style={[styles.statusChipText, { color: selectedDayChipColors.textColor }]}>{statusBadgeLabel}</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          {selectedDayRecord?.status === 'Leave' ? (
            <>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Leave reason</Text>
                <Text style={styles.detailsValue}>{selectedDayMeta?.leaveReason || 'On leave'}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Check-in</Text>
                <Text style={styles.detailsValue}>{formatTimeValue(selectedDayRecord?.checkIn)}</Text>
              </View>
              <View style={styles.rowDivider} />
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Check-out</Text>
                <Text style={styles.detailsValue}>{formatTimeValue(selectedDayRecord?.checkOut)}</Text>
              </View>
              {!!selectedDayMeta?.leaveReason && (
                <>
                  <View style={styles.rowDivider} />
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Leave reason</Text>
                    <Text style={styles.detailsValue}>{selectedDayMeta.leaveReason}</Text>
                  </View>
                </>
              )}
            </>
          )}
        </View>

        {!isAttendanceLoading && staffOptions.length === 0 && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No attendance data available.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },
  headerGradient: { paddingBottom: 12, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  topBar: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.5, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 12 },
  sectionTitle: { marginTop: 16, marginBottom: 10, fontSize: 13, letterSpacing: 0.8, color: '#4A5058', fontWeight: '800' },
  dropdownWrapper: { zIndex: 30, elevation: 30, marginTop: 4 },
  staffSelector: { minHeight: 48, borderRadius: 10, backgroundColor: '#F4F4F5', borderWidth: 1, borderColor: '#D9DCE1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  staffAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  staffAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  staffNameText: { flex: 1, fontSize: 14, color: '#262B32', fontWeight: '700', marginRight: 8 },
  dropdownList: { position: 'absolute', top: 52, left: 0, right: 0, marginTop: 4, borderRadius: 12, borderWidth: 1, borderColor: '#D9DCE1', overflow: 'hidden', backgroundColor: '#FFFFFF', zIndex: 999, elevation: 999 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#EEF0F3' },
  dropdownItemActive: { backgroundColor: '#EEF4FF' },
  dropdownDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B2B8C2', marginRight: 10 },
  dropdownItemText: { fontSize: 15, color: '#323741', fontWeight: '500' },
  dropdownItemTextActive: { color: '#2F4E8B', fontWeight: '700' },
  errorBanner: { marginTop: 10, borderWidth: 1, borderColor: '#FFD8D5', backgroundColor: '#FFF4F3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  errorBannerText: { flex: 1, color: '#AE3A31', fontSize: 13, fontWeight: '600', marginRight: 8 },
  retryButton: { borderRadius: 9, backgroundColor: FPO_COLORS.primary, paddingHorizontal: 12, paddingVertical: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  monthRow: { marginTop: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#DDE1E6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthNavButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#DADDE2', backgroundColor: '#F6F6F6', alignItems: 'center', justifyContent: 'center' },
  monthNavText: { fontSize: 16, lineHeight: 18, fontWeight: '500', color: '#838A93' },
  monthCenter: { alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 14, color: '#2A2F35', fontWeight: '600' },
  monthSubtitle: { marginTop: 1, fontSize: 10, color: '#6D737C', fontWeight: '500' },
  backgroundRefreshText: { marginTop: 2, fontSize: 10, color: '#4A7FE5', fontWeight: '700' },
  statsRow: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 1, marginHorizontal: 2, backgroundColor: '#ECEDEF', borderRadius: 10, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { marginTop: 1, fontSize: 10, color: '#5E656E', fontWeight: '500' },
  todayStatusCard: { marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: '#D6DAE1', backgroundColor: '#F7F8FA', paddingHorizontal: 12, paddingVertical: 10 },
  todayStatusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayStatusTitle: { fontSize: 13, fontWeight: '800', color: '#2B3036' },
  todayStatusBadge: { borderRadius: 999, paddingHorizontal: 10, minHeight: 24, alignItems: 'center', justifyContent: 'center' },
  todayStatusBadgeText: { fontSize: 10, fontWeight: '800' },
  todayStatusMessage: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#434952' },
  todayStatusMetaRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  todayStatusMetaText: { fontSize: 11, color: '#636A73', fontWeight: '600' },
  calendarBlock: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#DDE1E6', paddingTop: 4, paddingBottom: 0 },
  dayCell: { width: 32, height: 40, alignItems: 'center', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 3, borderRadius: 8 },
  dayCellSelected: { backgroundColor: '#DFEAFF' },
  emptyDayCell: { width: 32, height: 40 },
  dayNumberText: { fontSize: 12, fontWeight: '500' },
  dayNumberSelectedCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4785E9' },
  dayStatusLine: { width: 28, height: 3, borderRadius: 3 },
  legendWrap: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap' },
  legendPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: '#ECEDEF', paddingHorizontal: 8, height: 26, marginRight: 4, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 10, color: '#5D646D', fontWeight: '700' },
  detailsCard: { marginTop: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1D5DC', backgroundColor: '#EFF0F2', paddingHorizontal: 12, paddingVertical: 10 },
  detailsHeading: { fontSize: 11, color: '#5B626B', fontWeight: '800', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 30 },
  detailsLabel: { fontSize: 11, color: '#5E656E', fontWeight: '500', marginRight: 8 },
  detailsValue: { fontSize: 11, color: '#2D3138', fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: '#D3D7DD' },
  statusChip: { borderRadius: 999, paddingHorizontal: 10, minHeight: 26, alignItems: 'center', justifyContent: 'center' },
  statusChipText: { fontSize: 10, fontWeight: '800' },
  emptyStateCard: { marginTop: 12, borderRadius: 14, backgroundColor: '#ECEDEF', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  emptyStateText: { color: '#676E77', fontWeight: '600', fontSize: 13 },
});

export default AttendanceCalendar;
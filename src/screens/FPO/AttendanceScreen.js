import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { FPO_COLORS } from '../../colorsList/ColorList';
const { Calendar } = require('react-native-calendars');
const { api } = require('../../Redux/apiService');

const STATUS_COLORS = {
  present: '#1E9A5A',
  absent: '#D84A3C',
  half: '#E4A900',
  leave: '#4A7FE5',
  holiday: '#D3D7DD',
  disabled: '#BFC5CD',
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
const getMonthStartKey = (month, year) => `${year}-${padNumber(month)}-01`;
const formatMonthTitle = ({ month, year }) =>
  `${MONTH_NAMES[month - 1] || ''} ${year || ''}`.trim();

const formatDateKey = dateObj => {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
    return null;
  }
  return `${dateObj.getFullYear()}-${padNumber(dateObj.getMonth() + 1)}-${padNumber(
    dateObj.getDate(),
  )}`;
};

const sanitizeTextValue = value => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const lowered = trimmed.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined' || lowered === 'nan') {
      return null;
    }
    return trimmed;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    return String(value);
  }

  return String(value);
};

const normalizeAttendanceTimestamp = value => {
  const normalized = sanitizeTextValue(value);
  if (!normalized || normalized === '0') {
    return null;
  }
  return normalized;
};

const hasAttendanceValue = value => !!normalizeAttendanceTimestamp(value);

const normalizeStatusValue = status => {
  const normalized = sanitizeTextValue(status);
  if (!normalized) {
    return null;
  }

  const lowered = normalized.toLowerCase();
  if (lowered === 'leave') {
    return 'Leave';
  }
  if (lowered === 'present') {
    return 'Present';
  }
  return normalized;
};

const getResponseDataArray = payload => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.records)) {
    return payload.records;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

const normalizeLocationAddress = locationValue => {
  if (!locationValue) {
    return null;
  }
  if (typeof locationValue === 'object') {
    return (
      sanitizeTextValue(locationValue.address) ||
      sanitizeTextValue(locationValue.formattedAddress) ||
      null
    );
  }
  return sanitizeTextValue(locationValue);
};

const hasOwnField = (obj, key) =>
  !!obj && Object.prototype.hasOwnProperty.call(obj, key);

const getDateKey = rawDate => {
  if (rawDate === null || rawDate === undefined) {
    return null;
  }

  if (rawDate instanceof Date) {
    return formatDateKey(rawDate);
  }

  if (typeof rawDate === 'number') {
    return formatDateKey(new Date(rawDate));
  }

  if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (!trimmed) {
      return null;
    }

    const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch?.[1]) {
      return isoDateMatch[1];
    }

    if (/^\d+$/.test(trimmed)) {
      const epoch = Number(trimmed);
      if (!Number.isFinite(epoch)) {
        return null;
      }
      const normalizedEpoch = trimmed.length <= 10 ? epoch * 1000 : epoch;
      return formatDateKey(new Date(normalizedEpoch));
    }

    return formatDateKey(new Date(trimmed));
  }

  return null;
};

const deriveStatus = (record, dateKey, todayKey) => {
  const status = normalizeStatusValue(record?.status);
  const checkIn = record?.checkIn;
  const checkOut = record?.checkOut;
  const hasCheckIn = hasAttendanceValue(checkIn);
  const hasCheckOut = hasAttendanceValue(checkOut);

  if (status === 'Leave') return 'leave';
  if (hasCheckIn && hasCheckOut) return 'present';
  if (hasCheckIn && !hasCheckOut) {
    if (dateKey === todayKey) {
      return 'present';
    }
    return 'half';
  }
  if (status === 'Present' && dateKey === todayKey) return 'present';
  return 'absent';
};

const generateMonthDates = (month, year) => {
  if (!month || !year) {
    return [];
  }
  const totalDays = new Date(year, month, 0).getDate();
  const normalizedMonth = padNumber(month);

  return Array.from({ length: totalDays }, (_, index) => {
    const day = padNumber(index + 1);
    return `${year}-${normalizedMonth}-${day}`;
  });
};

const getInitials = label => {
  const name = sanitizeTextValue(label);
  if (!name) {
    return 'ST';
  }
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const addMonth = (month, year, step) => {
  const nextDate = new Date(year, month - 1 + step, 1);
  return {
    month: nextDate.getMonth() + 1,
    year: nextDate.getFullYear(),
  };
};

const extractStaffList = records => {
  const source = Array.isArray(records) ? records : [];
  const staffMap = new Map();
  const firstAttendanceByStaff = {};

  source.forEach(item => {
    const staff = item?.staff && typeof item.staff === 'object' ? item.staff : {};
    const staffId =
      sanitizeTextValue(staff?._id) ||
      sanitizeTextValue(staff?.id) ||
      sanitizeTextValue(item?.staffId) ||
      null;
    if (!staffId) {
      return;
    }

    if (!staffMap.has(staffId)) {
      const firstName =
        sanitizeTextValue(staff?.firstName) ||
        sanitizeTextValue(staff?.first_name) ||
        '';
      const lastName =
        sanitizeTextValue(staff?.lastName) ||
        sanitizeTextValue(staff?.last_name) ||
        '';
      const fullName =
        `${firstName} ${lastName}`.trim() ||
        sanitizeTextValue(staff?.name) ||
        '';
      staffMap.set(staffId, {
        label: fullName || 'Unknown Staff',
        value: staffId,
      });
    }

    const dateKey = getDateKey(item?.date);
    if (!dateKey) {
      return;
    }

    const existingDate = firstAttendanceByStaff[staffId];
    if (!existingDate || dateKey < existingDate) {
      firstAttendanceByStaff[staffId] = dateKey;
    }
  });

  const rawOptions = Array.from(staffMap.values()).sort((a, b) =>
    String(a.label).localeCompare(String(b.label)),
  );
  const labelCounts = {};
  rawOptions.forEach(option => {
    labelCounts[option.label] = (labelCounts[option.label] || 0) + 1;
  });

  const staffOptions = rawOptions.map(option => {
    if ((labelCounts[option.label] || 0) <= 1) {
      return option;
    }
    return {
      ...option,
      label: `${option.label} (${String(option.value).slice(-4)})`,
    };
  });

  return {
    staffOptions,
    firstAttendanceByStaff,
  };
};

const normalizeAttendance = records => {
  const source = Array.isArray(records) ? records : [];
  const attendanceByDate = {};
  const attendanceMetaByDate = {};

  source.forEach(item => {
    const record = item && typeof item === 'object' ? item : {};
    const dateKey = getDateKey(item?.date);
    if (!dateKey) {
      return;
    }

    attendanceByDate[dateKey] = {
      checkIn: hasOwnField(record, 'checkIn')
        ? normalizeAttendanceTimestamp(record.checkIn)
        : null,
      checkOut: hasOwnField(record, 'checkOut')
        ? normalizeAttendanceTimestamp(record.checkOut)
        : null,
      status: hasOwnField(record, 'status')
        ? normalizeStatusValue(record.status)
        : null,
    };

    attendanceMetaByDate[dateKey] = {
      leaveReason: hasOwnField(record, 'leaveReason')
        ? sanitizeTextValue(record.leaveReason)
        : null,
      checkInLocation: normalizeLocationAddress(item?.location?.checkInLocation),
      checkOutLocation: normalizeLocationAddress(item?.location?.checkOutLocation),
    };
  });

  return { attendanceByDate, attendanceMetaByDate };
};

const generateMarkedDates = ({
  monthDates,
  attendanceByDate,
  todayKey,
}) => {
  const markedDates = {};
  const statusCounts = {
    present: 0,
    absent: 0,
    half: 0,
    leave: 0,
    holiday: 0,
  };
  let workingDays = 0;

  monthDates.forEach(dateKey => {
    const isFutureDate = dateKey > todayKey;
    const disabled = isFutureDate;

    if (disabled) {
      markedDates[dateKey] = {
        statusKey: 'holiday',
        disabled: true,
      };
      statusCounts.holiday += 1;
      return;
    }

    workingDays += 1;
    const hasRecord = !!attendanceByDate?.[dateKey];
    const statusKey = deriveStatus(attendanceByDate?.[dateKey], dateKey, todayKey);
    markedDates[dateKey] = {
      statusKey,
      disabled: false,
      hasRecord,
    };
    statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
  });

  return { markedDates, statusCounts, workingDays };
};

const formatDisplayDate = dateKey => {
  if (!dateKey) {
    return '--';
  }
  const parsedDate = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateKey;
  }
  return parsedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTimeValue = value => {
  const normalized = sanitizeTextValue(value);
  if (!normalized) {
    return '--';
  }

  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) {
    return normalized;
  }

  return parsedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const renderCalendarDay = ({
  date,
  markedDates,
  selectedDate,
  onPressDate,
}) => {
  const dateString = date?.dateString;
  if (!dateString) {
    return <View style={styles.emptyDayCell} />;
  }

  const marking = markedDates[dateString] || {
    statusKey: 'disabled',
    disabled: true,
    hideLine: true,
    hasRecord: false,
  };
  const isSelected = selectedDate === dateString && !marking.disabled;
  const weekDayIndex = new Date(`${dateString}T00:00:00`).getDay();
  const isWeekend = weekDayIndex === 0 || weekDayIndex === 6;

  const isDisabledDay = marking.disabled || marking.statusKey === 'disabled';
  const statusLineColor = marking.disabled
    ? STATUS_COLORS.holiday
    : STATUS_COLORS[marking.statusKey] || STATUS_COLORS.absent;
  const shouldShowStatusLine =
    !marking.hideLine &&
    !marking.disabled;

  const dayTextColor = isSelected
    ? '#FFFFFF'
    : isDisabledDay
      ? '#AEB5BE'
      : isWeekend
        ? STATUS_COLORS.absent
        : '#2E3338';

  return (
    <TouchableOpacity
      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
      activeOpacity={0.85}
      onPress={() => onPressDate({ dateString })}
      disabled={marking.disabled}
    >
      {isSelected ? (
        <View style={styles.dayNumberSelectedCircle}>
          <Text style={[styles.dayNumberText, { color: dayTextColor }]}>
            {date.day}
          </Text>
        </View>
      ) : (
        <Text style={[styles.dayNumberText, { color: dayTextColor }]}>
          {date.day}
        </Text>
      )}
      {shouldShowStatusLine && (
        <View style={[styles.dayStatusLine, { backgroundColor: statusLineColor }]} />
      )}
    </TouchableOpacity>
  );
};

const AttendanceCalendar = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const today = React.useMemo(() => new Date(), []);
  const todayKey = React.useMemo(() => formatDateKey(today), [today]);
  const currentMonthStartKey = React.useMemo(
    () => getMonthStartKey(today.getMonth() + 1, today.getFullYear()),
    [today],
  );

  const [staffOptions, setStaffOptions] = React.useState([]);
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const [currentMonth, setCurrentMonth] = React.useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = React.useState(todayKey);
  const [attendanceByDate, setAttendanceByDate] = React.useState({});
  const [attendanceMetaByDate, setAttendanceMetaByDate] = React.useState({});

  const [isStaffLoading, setIsStaffLoading] = React.useState(false);
  const [isAttendanceLoading, setIsAttendanceLoading] = React.useState(false);
  const [errorState, setErrorState] = React.useState({
    type: '',
    message: '',
  });

  const isMountedRef = React.useRef(true);
  const staffRequestIdRef = React.useRef(0);
  const attendanceRequestIdRef = React.useRef(0);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStaffList = React.useCallback(async () => {
    const requestId = staffRequestIdRef.current + 1;
    staffRequestIdRef.current = requestId;

    setIsStaffLoading(true);
    setErrorState({ type: '', message: '' });

    try {
      const response = await api.get('/api/attendance/all');
      const records = getResponseDataArray(response?.data);

      if (
        !isMountedRef.current ||
        requestId !== staffRequestIdRef.current
      ) {
        return;
      }

      const { staffOptions: options } = extractStaffList(records);

      setStaffOptions(options);
      setIsDropdownOpen(false);

      setSelectedStaff(prevSelected => {
        if (options.length === 0) {
          return null;
        }
        if (!prevSelected?.value) {
          return options[0];
        }
        return (
          options.find(option => option.value === prevSelected.value) || options[0]
        );
      });
    } catch (error) {
      if (
        !isMountedRef.current ||
        requestId !== staffRequestIdRef.current
      ) {
        return;
      }
      setErrorState({
        type: 'staff',
        message: error?.message || 'Unable to load staff list.',
      });
    } finally {
      if (isMountedRef.current) {
        setIsStaffLoading(false);
      }
    }
  }, []);

  const fetchStaffAttendance = React.useCallback(
    async (staffId, month, year) => {
      if (!staffId) {
        setAttendanceByDate({});
        setAttendanceMetaByDate({});
        return;
      }

      const requestedMonthStartKey = getMonthStartKey(month, year);
      if (requestedMonthStartKey > currentMonthStartKey) {
        setAttendanceByDate({});
        setAttendanceMetaByDate({});
        return;
      }

      const requestId = attendanceRequestIdRef.current + 1;
      attendanceRequestIdRef.current = requestId;

      setIsAttendanceLoading(true);
      setErrorState(prev => (prev.type === 'staff' ? prev : { type: '', message: '' }));

      try {
        const response = await api.get(`/api/attendance/staff/${staffId}`, {
          params: { month, year },
        });

        if (
          !isMountedRef.current ||
          requestId !== attendanceRequestIdRef.current
        ) {
          return;
        }

        const records = getResponseDataArray(response?.data);
        const normalized = normalizeAttendance(records);
        setAttendanceByDate(normalized.attendanceByDate);
        setAttendanceMetaByDate(normalized.attendanceMetaByDate);
      } catch (error) {
        if (
          !isMountedRef.current ||
          requestId !== attendanceRequestIdRef.current
        ) {
          return;
        }

        setAttendanceByDate({});
        setAttendanceMetaByDate({});
        setErrorState({
          type: 'attendance',
          message: error?.message || 'Unable to load attendance.',
        });
      } finally {
        if (
          isMountedRef.current &&
          requestId === attendanceRequestIdRef.current
        ) {
          setIsAttendanceLoading(false);
        }
      }
    },
    [currentMonthStartKey],
  );

  React.useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  React.useEffect(() => {
    fetchStaffAttendance(
      selectedStaff?.value,
      currentMonth.month,
      currentMonth.year,
    );
  }, [
    selectedStaff,
    currentMonth.month,
    currentMonth.year,
    fetchStaffAttendance,
  ]);

  React.useEffect(() => {
    const currentPrefix = `${currentMonth.year}-${padNumber(currentMonth.month)}-`;
    const isCurrentVisibleMonth =
      currentMonth.month === today.getMonth() + 1 &&
      currentMonth.year === today.getFullYear();

    setSelectedDate(prevDate => {
      if (prevDate && prevDate.startsWith(currentPrefix)) {
        return prevDate;
      }
      return isCurrentVisibleMonth ? todayKey : null;
    });
  }, [currentMonth.month, currentMonth.year, today, todayKey]);

  const monthDates = React.useMemo(
    () => generateMonthDates(currentMonth.month, currentMonth.year),
    [currentMonth.month, currentMonth.year],
  );

  const staffDisplayLabel =
    selectedStaff?.label ||
    staffOptions[0]?.label ||
    (isStaffLoading ? 'Loading staff...' : 'No staff found');

  const { markedDates, statusCounts, workingDays } = React.useMemo(
    () =>
      generateMarkedDates({
        monthDates,
        attendanceByDate,
        todayKey,
      }),
    [monthDates, attendanceByDate, todayKey],
  );

  const selectedDayStatus = React.useMemo(() => {
    if (!selectedDate) {
      return null;
    }
    const dayMarking = markedDates[selectedDate];
    if (!dayMarking || dayMarking.disabled) {
      return 'holiday';
    }
    return deriveStatus(attendanceByDate[selectedDate], selectedDate, todayKey);
  }, [selectedDate, markedDates, attendanceByDate, todayKey]);

  const selectedDayRecord = selectedDate
    ? attendanceByDate[selectedDate] || { checkIn: null, checkOut: null, status: null }
    : null;
  const selectedDayMeta = selectedDate ? attendanceMetaByDate[selectedDate] || {} : {};

  const handleSelectStaff = React.useCallback(option => {
    setSelectedStaff(option);
    setIsDropdownOpen(false);
    setSelectedDate(null);
  }, []);

  const handleDayPress = React.useCallback(
    day => {
      const dateString = day?.dateString;
      if (!dateString) {
        return;
      }
      if (markedDates[dateString]?.disabled) {
        return;
      }
      setSelectedDate(dateString);
    },
    [markedDates],
  );

  const handleMonthChange = React.useCallback(monthInfo => {
    if (!monthInfo?.month || !monthInfo?.year) {
      return;
    }
    setCurrentMonth(prevMonth => {
      if (
        prevMonth.month === monthInfo.month &&
        prevMonth.year === monthInfo.year
      ) {
        return prevMonth;
      }
      return { month: monthInfo.month, year: monthInfo.year };
    });
  }, []);

  const handleMonthStep = React.useCallback(step => {
    setCurrentMonth(prevMonth => addMonth(prevMonth.month, prevMonth.year, step));
  }, []);

  const handleRetry = React.useCallback(() => {
    if (errorState.type === 'staff' || !selectedStaff?.value) {
      fetchStaffList();
      return;
    }
    fetchStaffAttendance(
      selectedStaff.value,
      currentMonth.month,
      currentMonth.year,
    );
  }, [
    errorState.type,
    selectedStaff,
    fetchStaffList,
    fetchStaffAttendance,
    currentMonth.month,
    currentMonth.year,
  ]);

  const statusBadgeLabel = selectedDayStatus === 'half'
    ? 'Half Day'
    : selectedDayStatus === 'holiday'
      ? 'Holiday'
      : selectedDayStatus
        ? `${selectedDayStatus[0].toUpperCase()}${selectedDayStatus.slice(1)}`
        : '--';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Icon name="chevron-back" size={20} color="#272B31" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>{t('fpo_home.attendance_calendar')}</Text>

          <TouchableOpacity style={styles.topIconButton} activeOpacity={0.85}>
            <Icon name="ellipsis-horizontal" size={20} color="#656B73" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>CHOOSE STAFF</Text>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.staffSelector}
            onPress={() => setIsDropdownOpen(prev => !prev)}
            disabled={isStaffLoading || staffOptions.length === 0}
          >
            <LinearGradient
              colors={['#4A7FE5', '#2EA56E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.staffAvatar}
            >
              <Text style={styles.staffAvatarText}>
                {getInitials(selectedStaff?.label)}
              </Text>
            </LinearGradient>

            <Text style={styles.staffNameText}>
              {staffDisplayLabel}
            </Text>

            <Icon
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6A7078"
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {staffOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    selectedStaff?.value === option.value && styles.dropdownItemActive,
                  ]}
                  activeOpacity={0.9}
                  onPress={() => handleSelectStaff(option)}
                >
                  <View style={styles.dropdownDot} />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedStaff?.value === option.value &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {!!errorState.message && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorState.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.85}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.monthRow}>
          <TouchableOpacity
            style={styles.monthNavButton}
            activeOpacity={0.9}
            onPress={() => handleMonthStep(-1)}
          >
            <Text style={styles.monthNavText}>{'<'}</Text>
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={styles.monthTitle}>{formatMonthTitle(currentMonth)}</Text>
            <Text style={styles.monthSubtitle}>{workingDays} working days</Text>
          </View>

          <TouchableOpacity
            style={styles.monthNavButton}
            activeOpacity={0.9}
            onPress={() => handleMonthStep(1)}
          >
            <Text style={styles.monthNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.present }]}>
              {statusCounts.present}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.absent }]}>
              {statusCounts.absent}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.half }]}>
              {statusCounts.half}
            </Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.leave }]}>
              {statusCounts.leave}
            </Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
        </View>

        <View style={styles.calendarBlock}>
          <Calendar
            key={`${currentMonth.year}-${currentMonth.month}`}
            current={getMonthStartKey(currentMonth.month, currentMonth.year)}
            hideArrows
            hideExtraDays
            showSixWeeks={false}
            renderHeader={() => <View />}
            firstDay={0}
            enableSwipeMonths={false}
            disableAllTouchEventsForDisabledDays
            onMonthChange={handleMonthChange}
            dayComponent={({ date }) =>
              renderCalendarDay({
                date,
                markedDates,
                selectedDate,
                onPressDate: handleDayPress,
              })
            }
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#707780',
              textSectionTitleDisabledColor: '#A7AFB8',
              textDayHeaderFontSize: 16,
              textDayHeaderFontWeight: '700',
              monthTextColor: '#22262D',
              textMonthFontWeight: '700',
              dayTextColor: '#2E3338',
              'stylesheet.calendar.header': {
                header: {
                  marginTop: 8,
                  marginBottom: 6,
                },
                week: {
                  marginTop: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                },
                dayHeader: {
                  width: 42,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#707780',
                },
              },
            }}
          />
        </View>

        <View style={styles.legendWrap}>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.present }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.absent }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.half }]} />
            <Text style={styles.legendText}>Half day</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.leave }]} />
            <Text style={styles.legendText}>Leave</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.holiday }]} />
            <Text style={styles.legendText}>Holiday</Text>
          </View>
        </View>

        {!!selectedDate && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsHeading}>
              {formatDisplayDate(selectedDate).toUpperCase()}
            </Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Status</Text>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      selectedDayStatus === 'holiday'
                        ? '#E4E7EB'
                        : `${STATUS_COLORS[selectedDayStatus] || '#8B93A0'}22`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    {
                      color:
                        selectedDayStatus === 'holiday'
                          ? '#69707A'
                          : STATUS_COLORS[selectedDayStatus] || '#69707A',
                    },
                  ]}
                >
                  {statusBadgeLabel}
                </Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Check-in</Text>
              <Text style={styles.detailsValue}>
                {formatTimeValue(selectedDayRecord?.checkIn)}
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Check-out</Text>
              <Text style={styles.detailsValue}>
                {formatTimeValue(selectedDayRecord?.checkOut)}
              </Text>
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
          </View>
        )}

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
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topBar: {
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#232830',
    marginHorizontal: 8,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 15,
    letterSpacing: 1.2,
    color: '#666D76',
    fontWeight: '700',
  },
  dropdownWrapper: {
    zIndex: 30,
  },
  staffSelector: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#D9DCE1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  staffAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
  },
  staffNameText: {
    flex: 1,
    fontSize: 17,
    color: '#262B32',
    fontWeight: '700',
    marginRight: 10,
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9DCE1',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },
  dropdownItemActive: {
    backgroundColor: '#EEF4FF',
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B2B8C2',
    marginRight: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#323741',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#2F4E8B',
    fontWeight: '700',
  },
  errorBanner: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFD8D5',
    backgroundColor: '#FFF4F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    flex: 1,
    color: '#AE3A31',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  retryButton: {
    borderRadius: 9,
    backgroundColor: FPO_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  monthRow: {
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE1E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADDE2',
    backgroundColor: '#F6F6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '500',
    color: '#838A93',
  },
  monthCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 17,
    color: '#2A2F35',
    fontWeight: '600',
  },
  monthSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6D737C',
    fontWeight: '500',
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#ECEDEF',
    borderRadius: 16,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#5E656E',
    fontWeight: '500',
  },
  calendarBlock: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDE1E6',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dayCell: {
    width: 42,
    height: 62,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 8,
    borderRadius: 14,
  },
  dayCellSelected: {
    backgroundColor: '#DFEAFF',
  },
  emptyDayCell: {
    width: 42,
    height: 62,
  },
  dayNumberText: {
    fontSize: 18,
    fontWeight: '500',
  },
  dayNumberSelectedCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4785E9',
  },
  dayStatusLine: {
    width: 44,
    height: 5,
    borderRadius: 6,
  },
  legendWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#ECEDEF',
    paddingHorizontal: 14,
    height: 44,
    marginRight: 8,
    marginBottom: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#5D646D',
    fontWeight: '700',
  },
  detailsCard: {
    marginTop: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    backgroundColor: '#EFF0F2',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailsHeading: {
    fontSize: 14,
    color: '#5B626B',
    fontWeight: '800',
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  detailsLabel: {
    fontSize: 13,
    color: '#5E656E',
    fontWeight: '500',
    marginRight: 12,
  },
  detailsValue: {
    fontSize: 13,
    color: '#2D3138',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#D3D7DD',
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyStateCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#ECEDEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  emptyStateText: {
    color: '#676E77',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AttendanceCalendar;

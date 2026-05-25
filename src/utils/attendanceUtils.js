import { ATTENDANCE_STATES, STATUS_COLORS, MONTH_NAMES } from '../constants/attendanceConstants';

export const padNumber = value => String(value).padStart(2, '0');

export const getMonthStartKey = (month, year) => `${year}-${padNumber(month)}-01`;

export const getAttendanceQueryKey = (staffId, month, year) =>
  `${staffId || 'none'}-${month || '00'}-${year || '0000'}`;

export const formatMonthTitle = ({ month, year }) =>
  `${MONTH_NAMES[month - 1] || ''} ${year || ''}`.trim();

export const formatDateKey = dateObj => {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
    return null;
  }
  return `${dateObj.getFullYear()}-${padNumber(
    dateObj.getMonth() + 1,
  )}-${padNumber(dateObj.getDate())}`;
};

export const sanitizeTextValue = value => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined' || lowered === 'nan') return null;
    return trimmed;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return String(value);
  }
  return String(value);
};

export const normalizeAttendanceTimestamp = value => {
  const normalized = sanitizeTextValue(value);
  if (!normalized || normalized === '0') return null;
  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return normalized;
};

export const hasAttendanceValue = value => !!normalizeAttendanceTimestamp(value);

export const isWeekendDate = dateKey => {
  if (!dateKey) return false;
  const parsedDate = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return false;
  const day = parsedDate.getDay();
  return day === 0 || day === 6;
};

export const normalizeStatusValue = status => {
  const normalized = sanitizeTextValue(status);
  if (!normalized) return null;
  const lowered = normalized.toLowerCase();
  if (lowered === 'leave') return 'Leave';
  if (lowered === 'present') return 'Present';
  if (lowered === 'half_day' || lowered === 'half day' || lowered === 'halfday') return 'Half Day';
  if (lowered === 'absent') return 'Absent';
  return normalized;
};

export const getDateKey = rawDate => {
  if (rawDate === null || rawDate === undefined) return null;
  if (rawDate instanceof Date) return formatDateKey(rawDate);
  if (typeof rawDate === 'number') return formatDateKey(new Date(rawDate));
  if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (!trimmed) return null;
    const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch?.[1]) return isoDateMatch[1];
    if (/^\d+$/.test(trimmed)) {
      const epoch = Number(trimmed);
      if (!Number.isFinite(epoch)) return null;
      const normalizedEpoch = trimmed.length <= 10 ? epoch * 1000 : epoch;
      return formatDateKey(new Date(normalizedEpoch));
    }
    return formatDateKey(new Date(trimmed));
  }
  return null;
};

export const mapAttendanceStateToMarker = attendanceState => {
  switch (attendanceState) {
    case ATTENDANCE_STATES.PRESENT:
      return { statusKey: 'present', disabled: false };
    case ATTENDANCE_STATES.ABSENT:
      return { statusKey: 'absent', disabled: false };
    case ATTENDANCE_STATES.HALF_DAY:
      return { statusKey: 'half', disabled: false };
    case ATTENDANCE_STATES.CHECKIN_PENDING:
    case ATTENDANCE_STATES.CHECKOUT_PENDING:
    case ATTENDANCE_STATES.SYNCING:
      return { statusKey: 'pending', disabled: false };
    case ATTENDANCE_STATES.LEAVE:
      return { statusKey: 'leave', disabled: false };
    default:
      return { statusKey: 'holiday', disabled: true };
  }
};

export const deriveAttendanceState = (
  record,
  dateKey,
  todayKey,
  { isDisabled = false, disableReason = null, isQueryLoaded = true, isSyncing = false } = {},
) => {
  const status = normalizeStatusValue(record?.status);
  const checkIn = record?.checkIn;
  const checkOut = record?.checkOut;
  const hasCheckIn = hasAttendanceValue(checkIn);
  const hasCheckOut = hasAttendanceValue(checkOut);
  const isToday = dateKey === todayKey;
  const isFutureDate = dateKey > todayKey;
  const weekend = isWeekendDate(dateKey);

  if (isDisabled) {
    if (disableReason === 'future') return ATTENDANCE_STATES.FUTURE_DATE;
    if (disableReason === 'weekend') return ATTENDANCE_STATES.WEEKEND;
    return ATTENDANCE_STATES.HOLIDAY;
  }
  if (!isQueryLoaded) return ATTENDANCE_STATES.NO_DATA;
  if (status === 'Leave') return ATTENDANCE_STATES.LEAVE;
  if (status === 'Present') {
    return hasCheckOut
      ? ATTENDANCE_STATES.PRESENT
      : isToday
      ? ATTENDANCE_STATES.CHECKOUT_PENDING
      : ATTENDANCE_STATES.HALF_DAY;
  }
  if (status === 'Half Day') return ATTENDANCE_STATES.HALF_DAY;
  if (status === 'Absent') {
    return isToday ? ATTENDANCE_STATES.CHECKIN_PENDING : ATTENDANCE_STATES.ABSENT;
  }
  if (hasCheckIn && hasCheckOut) return ATTENDANCE_STATES.PRESENT;
  if (hasCheckIn && !hasCheckOut) {
    return isToday
      ? isSyncing
        ? ATTENDANCE_STATES.SYNCING
        : ATTENDANCE_STATES.CHECKOUT_PENDING
      : ATTENDANCE_STATES.HALF_DAY;
  }
  if (weekend && !status && !hasCheckIn && !hasCheckOut) return ATTENDANCE_STATES.WEEKEND;
  if (isFutureDate) return ATTENDANCE_STATES.FUTURE_DATE;
  if (isToday) return isSyncing ? ATTENDANCE_STATES.SYNCING : ATTENDANCE_STATES.CHECKIN_PENDING;
  return ATTENDANCE_STATES.ABSENT;
};

export const generateMonthDates = (month, year) => {
  if (!month || !year) return [];
  const totalDays = new Date(year, month, 0).getDate();
  const normalizedMonth = padNumber(month);
  return Array.from({ length: totalDays }, (_, index) => {
    const day = padNumber(index + 1);
    return `${year}-${normalizedMonth}-${day}`;
  });
};

export const getInitials = label => {
  const name = sanitizeTextValue(label);
  if (!name) return 'ST';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

export const addMonth = (month, year, step) => {
  const nextDate = new Date(year, month - 1 + step, 1);
  return { month: nextDate.getMonth() + 1, year: nextDate.getFullYear() };
};

export const normalizeAttendance = records => {
  const source = Array.isArray(records) ? records : [];
  const attendanceByDate = {};
  const attendanceMetaByDate = {};
  let firstAttendanceDate = null;

  source.forEach(item => {
    const dateKey = getDateKey(item?.date);
    if (!dateKey) return;

    attendanceByDate[dateKey] = {
      checkIn: normalizeAttendanceTimestamp(item?.checkIn),
      checkOut: normalizeAttendanceTimestamp(item?.checkOut),
      status: normalizeStatusValue(item?.status),
    };

    attendanceMetaByDate[dateKey] = {
      leaveReason: sanitizeTextValue(item?.leaveReason),
      checkInLocation: sanitizeTextValue(item?.location?.checkInLocation),
      checkOutLocation: sanitizeTextValue(item?.location?.checkOutLocation),
    };

    if (!firstAttendanceDate || dateKey < firstAttendanceDate) {
      firstAttendanceDate = dateKey;
    }
  });

  return { attendanceByDate, attendanceMetaByDate, firstAttendanceDate };
};

export const generateMarkedDates = ({
  monthDates,
  attendanceByDate,
  firstAttendanceDate,
  todayKey,
  isQueryLoaded,
  isSyncing,
}) => {
  const markedDates = {};
  const statusCounts = { present: 0, absent: 0, half: 0, leave: 0, holiday: 0 };
  let workingDays = 0;

  monthDates.forEach(dateKey => {
    const isBeforeFirstAttendance = !!firstAttendanceDate && dateKey < firstAttendanceDate;
    const isFutureDate = dateKey > todayKey;
    const weekend = isWeekendDate(dateKey);
    const disableReason = isBeforeFirstAttendance
      ? 'before_first_attendance'
      : isFutureDate
      ? 'future'
      : weekend && !attendanceByDate?.[dateKey]
      ? 'weekend'
      : null;
    const attendanceState = deriveAttendanceState(
      attendanceByDate?.[dateKey],
      dateKey,
      todayKey,
      { isDisabled: !!disableReason, disableReason, isQueryLoaded, isSyncing: isSyncing && dateKey === todayKey },
    );
    const marker = mapAttendanceStateToMarker(attendanceState);

    markedDates[dateKey] = { ...marker, attendanceState, isWeekend: weekend };

    if (
      attendanceState !== ATTENDANCE_STATES.HOLIDAY &&
      attendanceState !== ATTENDANCE_STATES.WEEKEND &&
      attendanceState !== ATTENDANCE_STATES.FUTURE_DATE
    ) {
      workingDays += 1;
    }

    if (attendanceState === ATTENDANCE_STATES.PRESENT) statusCounts.present += 1;
    else if (attendanceState === ATTENDANCE_STATES.ABSENT) statusCounts.absent += 1;
    else if (attendanceState === ATTENDANCE_STATES.HALF_DAY) statusCounts.half += 1;
    else if (attendanceState === ATTENDANCE_STATES.LEAVE) statusCounts.leave += 1;
    else if (
      attendanceState === ATTENDANCE_STATES.HOLIDAY ||
      attendanceState === ATTENDANCE_STATES.WEEKEND ||
      attendanceState === ATTENDANCE_STATES.FUTURE_DATE
    ) {
      statusCounts.holiday += 1;
    }
  });

  return { markedDates, statusCounts, workingDays };
};

export const getAttendanceStateLabel = attendanceState => {
  switch (attendanceState) {
    case ATTENDANCE_STATES.PRESENT: return 'Present';
    case ATTENDANCE_STATES.ABSENT: return 'Absent';
    case ATTENDANCE_STATES.HALF_DAY: return 'Half Day';
    case ATTENDANCE_STATES.CHECKIN_PENDING:
    case ATTENDANCE_STATES.CHECKOUT_PENDING: return 'Pending';
    case ATTENDANCE_STATES.SYNCING: return 'Syncing';
    case ATTENDANCE_STATES.LEAVE: return 'Leave';
    case ATTENDANCE_STATES.WEEKEND: return 'Weekend';
    case ATTENDANCE_STATES.HOLIDAY: return 'Holiday';
    case ATTENDANCE_STATES.FUTURE_DATE: return 'Future date';
    default: return 'No data';
  }
};

export const getAttendanceStateChipColors = attendanceState => {
  switch (attendanceState) {
    case ATTENDANCE_STATES.PRESENT:
      return { backgroundColor: `${STATUS_COLORS.present}22`, textColor: STATUS_COLORS.present };
    case ATTENDANCE_STATES.ABSENT:
      return { backgroundColor: `${STATUS_COLORS.absent}22`, textColor: STATUS_COLORS.absent };
    case ATTENDANCE_STATES.HALF_DAY:
      return { backgroundColor: `${STATUS_COLORS.half}22`, textColor: STATUS_COLORS.half };
    case ATTENDANCE_STATES.CHECKIN_PENDING:
    case ATTENDANCE_STATES.CHECKOUT_PENDING:
    case ATTENDANCE_STATES.SYNCING:
      return { backgroundColor: `${STATUS_COLORS.pending}22`, textColor: STATUS_COLORS.pending };
    case ATTENDANCE_STATES.LEAVE:
      return { backgroundColor: `${STATUS_COLORS.leave}22`, textColor: STATUS_COLORS.leave };
    default:
      return { backgroundColor: '#E4E7EB', textColor: '#69707A' };
  }
};

export const formatDisplayDate = dateKey => {
  if (!dateKey) return '--';
  const parsedDate = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return dateKey;
  return parsedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTimeValue = value => {
  const normalized = sanitizeTextValue(value);
  if (!normalized) return '--';
  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) return '--';
  return parsedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const manageCacheSize = (cache, maxEntries) => {
  const keys = Object.keys(cache);
  if (keys.length > maxEntries) {
    const sortedKeys = keys.sort((a, b) => (cache[a].fetchedAt || 0) - (cache[b].fetchedAt || 0));
    const keysToRemove = sortedKeys.slice(0, keys.length - maxEntries);
    keysToRemove.forEach(key => delete cache[key]);
  }
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

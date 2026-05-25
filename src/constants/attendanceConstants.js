export const STATUS_COLORS = {
  present: '#1E9A5A',
  absent: '#D84A3C',
  half: '#E4A900',
  leave: '#4A7FE5',
  pending: '#F0A202',
  holiday: '#D3D7DD',
  disabled: '#BFC5CD',
};

export const ATTENDANCE_STATES = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  CHECKIN_PENDING: 'CHECKIN_PENDING',
  CHECKOUT_PENDING: 'CHECKOUT_PENDING',
  NO_DATA: 'NO_DATA',
  FUTURE_DATE: 'FUTURE_DATE',
  HOLIDAY: 'HOLIDAY',
  WEEKEND: 'WEEKEND',
  SYNCING: 'SYNCING',
  LEAVE: 'LEAVE',
};

export const CONFIG = {
  BACKGROUND_REFRESH_INTERVAL_MS: 10 * 60 * 1000, // 10 mins (optimized from 3)
  MAX_CACHE_ENTRIES: 6, // 6 months max
  API_TIMEOUT_MS: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,
  DEBOUNCE_DELAY_MS: 500,
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

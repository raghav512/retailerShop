import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CONFIG } from '../constants/attendanceConstants';
import {
  getAttendanceQueryKey,
  getMonthStartKey,
  normalizeAttendance,
  manageCacheSize,
} from '../utils/attendanceUtils';

const api = require('../Redux/apiService').api;

const retryWithBackoff = async (fn, retries = CONFIG.MAX_RETRY_ATTEMPTS) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};

export const useAttendanceData = (currentMonthStartKey, todayKey) => {
  const [attendanceViewState, setAttendanceViewState] = useState({
    queryKey: '',
    attendanceByDate: {},
    attendanceMetaByDate: {},
    firstAttendanceDate: null,
    source: 'initial',
    todayFallbackApplied: false,
  });

  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  const attendanceCacheRef = useRef({});
  const attendanceRequestIdRef = useRef(0);
  const activeAttendanceQueryRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadFromStorage = useCallback(async queryKey => {
    try {
      const cached = await AsyncStorage.getItem(`attendance_${queryKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Validate cache age (24 hours)
        if (Date.now() - parsed.fetchedAt < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
    return null;
  }, []);

  const saveToStorage = useCallback(async (queryKey, data) => {
    try {
      await AsyncStorage.setItem(`attendance_${queryKey}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }, []);

  const fetchStaffAttendance = useCallback(
    async (
      staffId,
      month,
      year,
      { reason = 'effect', forceRefresh = false, silent = false, userInitiated = false } = {},
    ) => {
      const queryKey = getAttendanceQueryKey(staffId, month, year);

      if (!staffId) {
        setAttendanceViewState({
          queryKey,
          attendanceByDate: {},
          attendanceMetaByDate: {},
          firstAttendanceDate: null,
          source: 'no-staff',
          todayFallbackApplied: false,
        });
        return;
      }

      const requestedMonthStartKey = getMonthStartKey(month, year);
      if (requestedMonthStartKey > currentMonthStartKey) {
        setAttendanceViewState({
          queryKey,
          attendanceByDate: {},
          attendanceMetaByDate: {},
          firstAttendanceDate: null,
          source: 'future-month',
          todayFallbackApplied: false,
        });
        return;
      }

      // Check for in-flight request
      if (
        activeAttendanceQueryRef.current?.queryKey === queryKey &&
        activeAttendanceQueryRef.current?.inFlight
      ) {
        return;
      }

      // Check memory cache
      const cachedEntry = attendanceCacheRef.current[queryKey];
      const hasCache = !!cachedEntry;

      if (hasCache) {
        setAttendanceViewState({
          queryKey,
          attendanceByDate: cachedEntry.attendanceByDate,
          attendanceMetaByDate: cachedEntry.attendanceMetaByDate,
          firstAttendanceDate: cachedEntry.firstAttendanceDate,
          source: forceRefresh ? 'cache-then-refresh' : 'cache',
          todayFallbackApplied: false,
        });
      } else {
        // Try loading from AsyncStorage
        const storedData = await loadFromStorage(queryKey);
        if (storedData) {
          attendanceCacheRef.current[queryKey] = storedData;
          setAttendanceViewState({
            queryKey,
            attendanceByDate: storedData.attendanceByDate,
            attendanceMetaByDate: storedData.attendanceMetaByDate,
            firstAttendanceDate: storedData.firstAttendanceDate,
            source: 'storage',
            todayFallbackApplied: false,
          });
        } else {
          setAttendanceViewState({
            queryKey,
            attendanceByDate: {},
            attendanceMetaByDate: {},
            firstAttendanceDate: null,
            source: 'reset-before-fetch',
            todayFallbackApplied: false,
          });
        }
      }

      if (hasCache && !forceRefresh) return;

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setAttendanceError('No internet connection');
        return;
      }

      const requestId = attendanceRequestIdRef.current + 1;
      attendanceRequestIdRef.current = requestId;
      activeAttendanceQueryRef.current = { requestId, queryKey, inFlight: true, reason };

      if (userInitiated) {
        setIsRefreshing(true);
      } else if (silent || hasCache) {
        setIsBackgroundRefreshing(true);
      } else {
        setIsAttendanceLoading(true);
      }
      setAttendanceError(null);

      try {
        const apiCall = () =>
          api.get(`/api/attendance/staff/${staffId}`, { params: { month, year } });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), CONFIG.API_TIMEOUT_MS)
        );

        const response = await Promise.race([
          retryWithBackoff(apiCall),
          timeoutPromise,
        ]);

        if (!isMountedRef.current || requestId !== attendanceRequestIdRef.current) return;

        const records = Array.isArray(response?.data?.data) ? response.data.data : [];
        const normalized = normalizeAttendance(records);

        // Apply today fallback if needed
        const todayAttendance = normalized.attendanceByDate?.[todayKey];
        const cachedTodayAttendance = cachedEntry?.attendanceByDate?.[todayKey];
        let todayFallbackApplied = false;

        if (
          !todayAttendance &&
          cachedTodayAttendance &&
          requestedMonthStartKey === currentMonthStartKey
        ) {
          normalized.attendanceByDate[todayKey] = cachedTodayAttendance;
          normalized.attendanceMetaByDate[todayKey] =
            cachedEntry?.attendanceMetaByDate?.[todayKey] || {};
          todayFallbackApplied = true;
        }

        const nextCacheEntry = {
          attendanceByDate: normalized.attendanceByDate,
          attendanceMetaByDate: normalized.attendanceMetaByDate,
          firstAttendanceDate: normalized.firstAttendanceDate,
          fetchedAt: Date.now(),
        };

        // Manage cache size
        manageCacheSize(attendanceCacheRef.current, CONFIG.MAX_CACHE_ENTRIES);
        attendanceCacheRef.current[queryKey] = nextCacheEntry;

        // Save to AsyncStorage
        await saveToStorage(queryKey, nextCacheEntry);

        setAttendanceViewState({
          queryKey,
          attendanceByDate: normalized.attendanceByDate,
          attendanceMetaByDate: normalized.attendanceMetaByDate,
          firstAttendanceDate: normalized.firstAttendanceDate,
          source: 'network',
          todayFallbackApplied,
        });
      } catch (error) {
        if (!isMountedRef.current || requestId !== attendanceRequestIdRef.current) return;
        setAttendanceViewState({
          queryKey,
          attendanceByDate: {},
          attendanceMetaByDate: {},
          firstAttendanceDate: null,
          source: 'attendance-error',
          todayFallbackApplied: false,
        });
        setAttendanceError(error?.message || 'Unable to load attendance');
      } finally {
        if (
          activeAttendanceQueryRef.current?.requestId === requestId &&
          activeAttendanceQueryRef.current?.queryKey === queryKey
        ) {
          activeAttendanceQueryRef.current = {
            ...activeAttendanceQueryRef.current,
            inFlight: false,
          };
        }
        if (isMountedRef.current && requestId === attendanceRequestIdRef.current) {
          setIsAttendanceLoading(false);
          setIsRefreshing(false);
          setIsBackgroundRefreshing(false);
        }
      }
    },
    [currentMonthStartKey, todayKey, loadFromStorage, saveToStorage],
  );

  return {
    attendanceViewState,
    isAttendanceLoading,
    isRefreshing,
    isBackgroundRefreshing,
    attendanceError,
    fetchStaffAttendance,
    isMountedRef,
  };
};

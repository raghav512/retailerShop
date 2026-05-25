import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { sanitizeTextValue } from '../utils/attendanceUtils';

const api = require('../Redux/apiService').api;

export const useStaffList = () => {
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const staffRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchStaffList = useCallback(async () => {
    const requestId = staffRequestIdRef.current + 1;
    staffRequestIdRef.current = requestId;

    setIsStaffLoading(true);
    setStaffError(null);

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // Load from cache
        const cachedStaff = await AsyncStorage.getItem('staff_list_cache');
        if (cachedStaff) {
          const parsed = JSON.parse(cachedStaff);
          setStaffOptions(parsed);
          return;
        }
        throw new Error('No internet connection');
      }

      // API call with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      const apiPromise = api.get('/api/admin/staff');
      const response = await Promise.race([apiPromise, timeoutPromise]);

      const staffList = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      if (!isMountedRef.current || requestId !== staffRequestIdRef.current) return;

      const options = staffList.map(staff => {
        const firstName = sanitizeTextValue(staff?.firstName) || '';
        const lastName = sanitizeTextValue(staff?.lastName) || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return {
          label: fullName || 'Unknown Staff',
          value: staff?._id || staff?.id,
        };
      });

      // Handle duplicate names
      const labelCounts = {};
      options.forEach(option => {
        labelCounts[option.label] = (labelCounts[option.label] || 0) + 1;
      });

      const finalOptions = options.map(option => {
        if ((labelCounts[option.label] || 0) <= 1) return option;
        return {
          ...option,
          label: `${option.label} (${String(option.value).slice(-4)})`,
        };
      });

      setStaffOptions(finalOptions);

      // Cache staff list
      await AsyncStorage.setItem('staff_list_cache', JSON.stringify(finalOptions));

      // Restore last selected staff
      const savedStaffId = await AsyncStorage.getItem('lastSelectedStaffId');
      if (savedStaffId && finalOptions.length > 0) {
        const matchedStaff = finalOptions.find(opt => opt.value === savedStaffId);
        if (matchedStaff) {
          setSelectedStaff(matchedStaff);
        } else {
          setSelectedStaff(finalOptions[0]);
        }
      } else if (finalOptions.length > 0) {
        setSelectedStaff(finalOptions[0]);
      }
    } catch (error) {
      if (!isMountedRef.current || requestId !== staffRequestIdRef.current) return;
      setStaffOptions([]);
      setSelectedStaff(null);
      setStaffError(error?.message || 'Unable to load staff list');
    } finally {
      if (isMountedRef.current && requestId === staffRequestIdRef.current) {
        setIsStaffLoading(false);
      }
    }
  }, []);

  const handleSelectStaff = useCallback(async option => {
    setSelectedStaff(option);
    try {
      await AsyncStorage.setItem('lastSelectedStaffId', option.value);
    } catch (error) {
      console.warn('Failed to save staff selection');
    }
  }, []);

  return {
    staffOptions,
    selectedStaff,
    isStaffLoading,
    staffError,
    fetchStaffList,
    handleSelectStaff,
    setSelectedStaff,
    isMountedRef,
  };
};

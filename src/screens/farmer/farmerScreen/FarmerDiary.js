import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  BackHandler,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  AppState,
  Alert,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { getUserData, getAccessToken } from '../../../Redux/Storage';
import { API_BASE_URL } from '../../../config';
import COLORS from '../../../utils/colors';
import { FARMER_COLORS } from '../../../colorsList/ColorList';
import { wp, hp, rw, rh, rf } from '../../../utils/responsive';

const FarmerDiary = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState(new Date(2026, 3, 1));
  const [endDate, setEndDate] = useState(new Date(2026, 3, 27));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [incomesLoading, setIncomesLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [incomeAccordionOpen, setIncomeAccordionOpen] = useState(false);
  const [expenseAccordionOpen, setExpenseAccordionOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [recentExpensesOpen, setRecentExpensesOpen] = useState(false);
  const [recentIncomesOpen, setRecentIncomesOpen] = useState(false);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses(true);
      fetchIncomes(true);
    }, [fetchExpenses, fetchIncomes]),
  );

  useEffect(() => {
    isMountedRef.current = true;
    abortControllerRef.current = new AbortController();

    const unsubscribeNetwork = NetInfo.addEventListener(state => {
      if (isMountedRef.current) {
        setIsOffline(!state.isConnected);
      }
    });

    // AppState listener for background refresh
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // Silent refresh without loading spinner
          fetchExpenses(true);
          fetchIncomes(true);
        }
        appStateRef.current = nextAppState;
      },
    );

    fetchExpenses();
    fetchIncomes();

    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.goBack();
          return true;
        },
      );
      return () => {
        isMountedRef.current = false;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        backHandler.remove();
        unsubscribeNetwork();
        appStateSubscription.remove();
      };
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      unsubscribeNetwork();
      appStateSubscription.remove();
    };
  }, [navigation, fetchExpenses, fetchIncomes]);

  useEffect(() => {
    const profit = totalIncome - totalExpense;
    setTotalProfit(profit);
  }, [totalIncome, totalExpense]);

  const getErrorMessage = useCallback(errObj => {
    if (!errObj.response) {
      return 'No internet connection. Please check and try again.';
    }
    switch (errObj.response?.status) {
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Data not found. Please try again later.';
      case 422:
        return 'Invalid data provided. Please check your inputs.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }, []);

  const fetchExpenses = useCallback(
    async (silent = false) => {
      if (isOffline) {
        return;
      }

      try {
        if (!silent && isMountedRef.current) setSummaryLoading(true);
        if (!silent && isMountedRef.current) setExpensesLoading(true);
        const user = await getUserData();
        const userId = user?.id || user?._id || user?.user_id;

        if (!userId) {
          return;
        }

        // Check if aborted before API call
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const response = await apiService.getExpensesByUserId(userId);

        // Check if aborted after API call
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response?.success && isMountedRef.current) {
          const expensesData = response.data || [];
          setExpenses(expensesData);

          const calculatedExpense = expensesData.reduce(
            (sum, expense) => sum + (expense.amount || 0),
            0,
          );
          setTotalExpense(calculatedExpense);
        }
      } catch (err) {
        // Error handling can be added here if needed
      } finally {
        if (isMountedRef.current) {
          if (!silent) {
            setExpensesLoading(false);
            setSummaryLoading(false);
          }
        }
      }
    },
    [isOffline],
  );

  const fetchIncomes = useCallback(
    async (silent = false) => {
      if (isOffline) {
        return;
      }

      try {
        if (!silent && isMountedRef.current) setIncomesLoading(true);
        const user = await getUserData();
        const userId = user?.id || user?._id || user?.user_id;

        if (!userId) {
          return;
        }

        // Check if aborted before API call
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const response = await apiService.getIncomesByUserId(userId);

        // Check if aborted after API call
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response?.success && isMountedRef.current) {
          const incomesData = response.data || [];
          setIncomes(incomesData);

          const calculatedIncome = incomesData.reduce(
            (sum, income) => sum + (income.amount || income.saleValue || 0),
            0,
          );
          setTotalIncome(calculatedIncome);
        }
      } catch (err) {
        // Error handling can be added here if needed
      } finally {
        if (!silent && isMountedRef.current) setIncomesLoading(false);
      }
    },
    [isOffline],
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddIncome = () => {
    navigation.navigate('AddIncomeToDiary');
  };

  const handleAddExpense = () => {
    navigation.navigate('AddNewExpense');
  };

  const handleEditIncome = income => {
    navigation.navigate('AddIncomeToDiary', { incomeData: income });
  };

  const handleEditExpense = expense => {
    navigation.navigate('AddNewExpense', { expenseData: expense });
  };

  const handleDeleteIncome = async (date, incomeId) => {
    if (isOffline) {
      Alert.alert(t('farmer_diary.offline'), t('farmer_diary.offline_msg'));
      return;
    }

    Alert.alert(
      t('farmer_diary.delete_income_title'),
      t('farmer_diary.delete_income_msg'),
      [
        { text: t('farmer_diary.cancel'), style: 'cancel' },
        {
          text: t('farmer_diary.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingItem(incomeId);

              // Try deleting by ID first
              const response = await apiService.deleteIncomeById(incomeId);

              Alert.alert(t('farmer_diary.success'), t('farmer_diary.income_deleted'));
              await fetchIncomes(true);
            } catch (error) {
              Alert.alert(
                t('farmer_diary.error'),
                error.response?.data?.message ||
                  error.response?.data?.error ||
                  t('farmer_diary.delete_failed'),
              );
            } finally {
              setDeletingItem(null);
            }
          },
        },
      ],
    );
  };

  const handleDeleteExpense = async (date, expenseId) => {
    if (isOffline) {
      Alert.alert(t('farmer_diary.offline'), t('farmer_diary.offline_msg'));
      return;
    }

    Alert.alert(
      t('farmer_diary.delete_expense_title'),
      t('farmer_diary.delete_expense_msg'),
      [
        { text: t('farmer_diary.cancel'), style: 'cancel' },
        {
          text: t('farmer_diary.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingItem(expenseId);

              // Try deleting by ID first
              const response = await apiService.deleteExpenseById(expenseId);

              Alert.alert(t('farmer_diary.success'), t('farmer_diary.expense_deleted'));
              await fetchExpenses(true);
            } catch (error) {
              Alert.alert(
                t('farmer_diary.error'),
                error.response?.data?.message ||
                  error.response?.data?.error ||
                  t('farmer_diary.delete_failed'),
              );
            } finally {
              setDeletingItem(null);
            }
          },
        },
      ],
    );
  };

  const onRefresh = useCallback(async () => {
    if (isOffline) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([fetchExpenses(true), fetchIncomes(true)]);
    } catch (err) {
      // Error handling can be added here if needed
    } finally {
      setRefreshing(false);
    }
  }, [isOffline, fetchExpenses, fetchIncomes]);

  const formatDate = useCallback(date => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const formatDateForAPI = useCallback(date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          return true;
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to download PDF',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf || isOffline) {
      if (isOffline) {
        Alert.alert(
          'Offline',
          'No internet connection. Please check and try again.',
        );
      }
      return;
    }

    try {
      setDownloadingPdf(true);

      // Fetch fresh data before downloading PDF
      try {
        await Promise.all([fetchExpenses(true), fetchIncomes(true)]);
      } catch (fetchError) {
        // If data fetch fails, STOP and show error
        Alert.alert(
          'Error',
          'Failed to fetch latest data. Please check your connection and try again.',
        );
        return; // Stop PDF download
      }

      // Edge Case 1: Check storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download PDF',
        );
        return;
      }

      // Edge Case 2: Validate user data
      const user = await getUserData();
      const userId = user?.id || user?._id || user?.user_id;

      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      // Edge Case 3: Validate date range
      if (startDate > endDate) {
        Alert.alert(
          'Invalid Date Range',
          'Start date cannot be after end date.',
        );
        return;
      }

      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      const token = await getAccessToken();

      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        return;
      }



      const fileName = `Ledger_${startDateStr}_to_${endDateStr}.pdf`;
      const { dirs } = ReactNativeBlobUtil.fs;
      const downloadPath =
        Platform.OS === 'ios'
          ? `${dirs.DocumentDir}/${fileName}`
          : `${dirs.DownloadDir}/${fileName}`;
      const downloadUrl = `${API_BASE_URL}/api/khata/ledger/pdf/${userId}?startDate=${startDateStr}&endDate=${endDateStr}`;

      // iOS path is owned by app; safe to clear old file before downloading.
      if (Platform.OS === 'ios') {
        const fileExists = await ReactNativeBlobUtil.fs.exists(downloadPath);
        if (fileExists) {
          await ReactNativeBlobUtil.fs.unlink(downloadPath);
        }
      }

      // Edge Case 5: Download with timeout
      const response = await ReactNativeBlobUtil.config(
        Platform.OS === 'android'
          ? {
              timeout: 60000,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: fileName,
                description: 'Downloading ledger PDF',
                mime: 'application/pdf',
                mediaScannable: true,
                path: downloadPath,
              },
            }
          : {
              fileCache: true,
              path: downloadPath,
              timeout: 60000,
            },
      ).fetch('GET', downloadUrl, {
        Authorization: `Bearer ${token}`,
      });

      const statusCode = Number(response?.info?.()?.status || 0);
      if (statusCode && (statusCode < 200 || statusCode >= 300)) {
        throw new Error(`Download failed (${statusCode})`);
      }

      let resolvedPath = response.path?.() || downloadPath;

      // For Android DownloadManager, response.path() may not be directly readable.
      // Validate path strictly on iOS; on Android prefer best-effort open + user success feedback.
      if (Platform.OS === 'ios') {
        const downloadedFileExists = await ReactNativeBlobUtil.fs.exists(
          resolvedPath,
        );
        if (!downloadedFileExists) {
          throw new Error('File download failed. File not found.');
        }

        const fileInfo = await ReactNativeBlobUtil.fs.stat(resolvedPath);
        if (fileInfo.size === 0 || fileInfo.size === '0') {
          await ReactNativeBlobUtil.fs.unlink(resolvedPath);
          throw new Error('Downloaded file is empty. Please try again.');
        }
      } else {
        const configuredPathExists = await ReactNativeBlobUtil.fs.exists(
          downloadPath,
        );
        if (configuredPathExists) {
          resolvedPath = downloadPath;
        }
      }

      // Edge Case 8: Try to open PDF with error handling
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Wait for file to be fully written

        if (Platform.OS === 'android') {
          // Edge Case 9: Check if PDF viewer is available
          try {
            const hasReadablePath = resolvedPath
              ? await ReactNativeBlobUtil.fs.exists(resolvedPath)
              : false;

            if (hasReadablePath) {
              await ReactNativeBlobUtil.android.actionViewIntent(
                resolvedPath,
                'application/pdf',
              );
              Alert.alert(
                'Success',
                'PDF downloaded and opened!\nSaved in Downloads folder',
              );
            } else {
              Alert.alert(
                'PDF Downloaded',
                'PDF downloaded successfully in Downloads folder.',
              );
            }
          } catch (viewError) {
            // No PDF viewer installed
            Alert.alert(
              'PDF Downloaded',
              'PDF saved successfully in Downloads folder.\n\nPlease install a PDF viewer app to open the file.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (__DEV__)
                      console.log('[FarmerDiary] No PDF viewer available');
                  },
                },
              ],
            );
          }
        } else {
          await ReactNativeBlobUtil.ios.openDocument(resolvedPath);
          Alert.alert(
            'Success',
            `PDF downloaded and opened!\nSaved in Documents`,
          );
        }
      } catch (openError) {
        Alert.alert(
          'PDF Downloaded',
          `PDF saved successfully but could not be opened automatically.\n\nPlease check your ${
            Platform.OS === 'android' ? 'Downloads' : 'Documents'
          } folder.`,
        );
      }
    } catch (err) {

      // Edge Case 10: Handle specific error types
      let errorMessage = 'Failed to download PDF. Please try again.';

      if (err.message?.includes('timeout')) {
        errorMessage =
          'Download timeout. Please check your internet connection and try again.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.message?.includes('404')) {
        errorMessage = 'No data found for the selected date range.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (
        err.message?.includes('storage') ||
        err.message?.includes('ENOSPC')
      ) {
        errorMessage =
          'Not enough storage space. Please free up some space and try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Download Failed', errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleViewDetails = useCallback(async () => {
    if (loading || isOffline) {
      if (isOffline) {
        setError('No internet connection. Please check and try again.');
        setShowLedgerModal(true);
      }
      return;
    }

    setShowLedgerModal(true);

    try {
      setLoading(true);
      setError(null);
      const user = await getUserData();
      const userId = user?.id || user?._id || user?.user_id;

      if (!userId) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);



      // Check if aborted before API call
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const response = await apiService.getLedgerDetails(
        userId,
        startDateStr,
        endDateStr,
      );

      // Check if aborted after API call
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response?.success && isMountedRef.current) {
        setLedgerData(response.data);
      } else if (isMountedRef.current) {
        setError(response?.message || 'Failed to fetch ledger details');
      }
    } catch (err) {

      if (isMountedRef.current) {
        const backendMessage =
          err.response?.data?.message || err.response?.data?.error || null;
        setError(backendMessage ?? getErrorMessage(err));
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [
    loading,
    isOffline,
    startDate,
    endDate,
    formatDateForAPI,
    getErrorMessage,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to previous screen"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IonIcon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{t('farmer_diary.title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh"
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {/* Task 2 - Summary Cards */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Icon name="wifi-off" size={16} color="#E53935" />
            <Text style={styles.offlineText}>{t('farmer_diary.no_internet')}</Text>
          </View>
        )}

        <View style={styles.summaryContainer}>
          {summaryLoading ? (
            // Dummy UI - same layout as actual cards
            <>
              <View style={[styles.summaryCard, styles.dummyCard]}>
                <View style={styles.dummyLabel} />
                <View style={styles.dummyValue} />
              </View>
              <View style={[styles.summaryCard, styles.dummyCard]}>
                <View style={styles.dummyLabel} />
                <View style={styles.dummyValue} />
              </View>
              <View style={[styles.summaryCard, styles.dummyCard]}>
                <View style={styles.dummyLabel} />
                <View style={styles.dummyValue} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('farmer_diary.total_income')}</Text>
                <Text style={styles.summaryValueGreen}>₹{totalIncome}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('farmer_diary.total_expense')}</Text>
                <Text style={styles.summaryValueRed}>₹{totalExpense}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('farmer_diary.total_profit')}</Text>
                <Text
                  style={[
                    styles.summaryValueGreen,
                    totalProfit < 0 && styles.summaryValueRed,
                  ]}
                >
                  ₹{totalProfit}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Task 3 - Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addIncomeButton]}
            onPress={handleAddIncome}
            accessibilityLabel="Add New Income"
            accessibilityHint="Navigate to add income screen"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t('farmer_diary.add_income')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addExpenseButton]}
            onPress={handleAddExpense}
            accessibilityLabel="Add New Expense"
            accessibilityHint="Navigate to add expense screen"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{t('farmer_diary.add_expense')}</Text>
          </TouchableOpacity>
        </View>

        {/* Expenses List */}
        <View style={styles.expensesContainer}>
          <TouchableOpacity
            style={styles.recentAccordionHeader}
            onPress={() => setRecentExpensesOpen(!recentExpensesOpen)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.expenseIconBadge}>
                <Icon name="trending-down" size={18} color={COLORS.error} />
              </View>
              <Text style={styles.expensesTitle}>{t('farmer_diary.recent_expenses')}</Text>
            </View>
            <Icon
              name={recentExpensesOpen ? 'expand-less' : 'expand-more'}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {recentExpensesOpen && (
            <View style={styles.recentAccordionContent}>
              {expensesLoading ? (
                <View style={styles.expensesList}>
                  {[1, 2, 3].map(item => (
                    <View key={item} style={styles.skeletonItem}>
                      <View style={styles.skeletonLeft}>
                        <View style={styles.skeletonCategory} />
                        <View style={styles.skeletonProduct} />
                        <View style={styles.skeletonDate} />
                      </View>
                      <View style={styles.skeletonAmount} />
                    </View>
                  ))}
                </View>
              ) : expenses.length > 0 ? (
                <View style={styles.expensesList}>
                  {expenses
                    .slice(0, 10)
                    .reverse()
                    .map((expense, index) => (
                      <View
                        key={expense._id || index}
                        style={styles.expenseItem}
                      >
                        <View style={styles.expenseLeft}>
                          <Text style={styles.expenseCategory}>
                            {expense.category}
                          </Text>
                          <Text style={styles.expenseProduct}>
                            {expense.productType}
                          </Text>
                          <Text style={styles.expenseDate}>
                            {new Date(expense.date).toLocaleDateString('en-GB')}
                          </Text>
                        </View>
                        <View style={styles.expenseRight}>
                          <Text style={styles.listExpenseAmount}>
                            ₹{expense.amount}
                          </Text>
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              onPress={() => handleEditExpense(expense)}
                              style={styles.editButton}
                              disabled={deletingItem === expense._id}
                            >
                              <Icon name="edit" size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                handleDeleteExpense(expense.date, expense._id)
                              }
                              style={styles.deleteButton}
                              disabled={deletingItem === expense._id}
                            >
                              {deletingItem === expense._id ? (
                                <ActivityIndicator
                                  size="small"
                                  color={COLORS.error}
                                />
                              ) : (
                                <Icon
                                  name="delete"
                                  size={18}
                                  color={COLORS.error}
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.listEmptyText}>
                    {t('farmer_diary.no_expenses')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Incomes List */}
        <View style={styles.expensesContainer}>
          <TouchableOpacity
            style={styles.recentAccordionHeader}
            onPress={() => setRecentIncomesOpen(!recentIncomesOpen)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.incomeIconBadge}>
                <Icon name="trending-up" size={18} color={COLORS.success} />
              </View>
              <Text style={styles.expensesTitle}>{t('farmer_diary.recent_incomes')}</Text>
            </View>
            <Icon
              name={recentIncomesOpen ? 'expand-less' : 'expand-more'}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {recentIncomesOpen && (
            <View style={styles.recentAccordionContent}>
              {incomesLoading ? (
                <View style={styles.expensesList}>
                  {[1, 2, 3].map(item => (
                    <View key={item} style={styles.skeletonItem}>
                      <View style={styles.skeletonLeft}>
                        <View style={styles.skeletonCategory} />
                        <View style={styles.skeletonProduct} />
                        <View style={styles.skeletonDate} />
                      </View>
                      <View style={styles.skeletonAmount} />
                    </View>
                  ))}
                </View>
              ) : incomes.length > 0 ? (
                <View style={styles.expensesList}>
                  {incomes
                    .slice(0, 10)
                    .reverse()
                    .map((income, index) => (
                      <View
                        key={income._id || index}
                        style={styles.expenseItem}
                      >
                        <View style={styles.expenseLeft}>
                          <Text style={styles.expenseCategory}>
                            {income.category}
                          </Text>
                          <Text style={styles.expenseProduct}>
                            {income.category === 'Government Subsidy' 
                              ? 'Government Subsidy' 
                              : (income.productType && income.productType.trim() ? income.productType : 'No product specified')
                            }
                          </Text>
                          <Text style={styles.expenseDate}>
                            {new Date(income.date).toLocaleDateString('en-GB')}
                          </Text>
                        </View>
                        <View style={styles.expenseRight}>
                          <Text style={styles.listIncomeAmount}>
                            ₹{income.amount || income.saleValue}
                          </Text>
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              onPress={() => handleEditIncome(income)}
                              style={styles.editButton}
                              disabled={deletingItem === income._id}
                            >
                              <Icon name="edit" size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                handleDeleteIncome(income.date, income._id)
                              }
                              style={styles.deleteButton}
                              disabled={deletingItem === income._id}
                            >
                              {deletingItem === income._id ? (
                                <ActivityIndicator
                                  size="small"
                                  color={COLORS.error}
                                />
                              ) : (
                                <Icon
                                  name="delete"
                                  size={18}
                                  color={COLORS.error}
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.listEmptyText}>{t('farmer_diary.no_incomes')}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Task 4 - Ledger Section */}
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>{t('farmer_diary.view_ledger')}</Text>
          <Text style={styles.dateRangeLabel}>{t('farmer_diary.date_range')}</Text>
          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartPicker(true)}
              accessibilityLabel="Select start date"
              accessibilityHint="Opens date picker for start date"
              accessibilityRole="button"
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
              accessibilityLabel="Select end date"
              accessibilityHint="Opens date picker for end date"
              accessibilityRole="button"
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Task 5 - Ledger Actions */}
          <View style={styles.ledgerActionsRow}>
            <TouchableOpacity
              style={[styles.ledgerActionButton, styles.viewDetailsButton]}
              onPress={handleViewDetails}
              accessibilityLabel="View ledger details"
              accessibilityHint="Fetches and displays ledger data for selected date range"
              accessibilityRole="button"
              disabled={loading}
            >
              <Icon name="visibility" size={20} color="#1A1A1A" />
              <Text style={styles.ledgerActionText}>{t('farmer_diary.view_details')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ledgerActionButton, styles.downloadPdfButton]}
              onPress={handleDownloadPdf}
              accessibilityLabel="Download PDF"
              accessibilityHint="Downloads ledger as PDF file"
              accessibilityRole="button"
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <ActivityIndicator size="small" color="#1A1A1A" />
              ) : (
                <Icon name="file-download" size={20} color="#1A1A1A" />
              )}
              <Text style={styles.ledgerActionText}>
                {downloadingPdf ? t('farmer_diary.downloading') : t('farmer_diary.download_pdf')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ledger Details Modal */}
        <Modal
          visible={showLedgerModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLedgerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('farmer_diary.ledger_details')}</Text>
                <TouchableOpacity
                  onPress={() => setShowLedgerModal(false)}
                  style={styles.closeButton}
                  accessibilityLabel="Close modal"
                  accessibilityHint="Closes the ledger details modal"
                  accessibilityRole="button"
                >
                  <Icon name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {loading ? (
                // Dummy UI - ledger item placeholders
                <View style={styles.ledgerList}>
                  {[1, 2, 3, 4].map(item => (
                    <View
                      key={item}
                      style={[styles.ledgerItem, styles.dummyLedgerItem]}
                    >
                      <View style={styles.dummyLedgerHeader}>
                        <View style={styles.dummyBadge} />
                        <View style={styles.dummyDate} />
                      </View>
                      <View style={styles.dummyCategory} />
                      <View style={styles.dummyProduct} />
                      <View style={styles.dummyAmount} />
                    </View>
                  ))}
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleViewDetails}
                  >
                     <Text style={styles.retryButtonText}>{t('farmer_diary.retry')}</Text>
                  </TouchableOpacity>
                </View>
              ) : ledgerData?.entries?.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSummary}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.modalSummaryLabel}>{t('farmer_diary.total_income')}</Text>
                      <Text style={styles.summaryValueGreen}>
                        ₹{ledgerData.totalIncome}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.modalSummaryLabel}>
                        {t('farmer_diary.total_expense')}
                      </Text>
                      <Text style={styles.summaryValueRed}>
                        ₹{ledgerData.totalExpense}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.modalSummaryLabel}>{t('farmer_diary.total_profit')}</Text>
                      <Text style={styles.summaryValueGreen}>
                        ₹{ledgerData.totalProfit}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.accordionContainer}>
                    {/* Income Accordion */}
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() =>
                        setIncomeAccordionOpen(!incomeAccordionOpen)
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.accordionHeaderLeft}>
                        <View style={styles.incomeIconBadge}>
                          <Icon
                            name="trending-up"
                            size={18}
                            color={COLORS.success}
                          />
                        </View>
                        <Text style={styles.accordionTitle}>
                          {t('farmer_diary.income_entries')}
                        </Text>
                      </View>
                      <Icon
                        name={
                          incomeAccordionOpen ? 'expand-less' : 'expand-more'
                        }
                        size={24}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                    {incomeAccordionOpen && (
                      <View style={styles.accordionContent}>
                        {ledgerData.entries
                          .filter(
                            item =>
                              item.type === 'income' ||
                              item.entryType === 'income',
                          )
                          .slice(0, 5)
                          .reverse()
                          .map((item, index) => {
                            const date = new Date(item.date);
                            const formattedDate = formatDate(date);
                            return (
                              <View
                                key={item._id || index}
                                style={styles.accordionItem}
                              >
                                <View style={styles.accordionItemHeader}>
                                  <Text style={styles.accordionCategory}>
                                    {item.category}
                                  </Text>
                                  <Text style={styles.accordionDate}>
                                    {formattedDate}
                                  </Text>
                                </View>
                                <Text style={styles.accordionProduct}>
                                  {item.category === 'Government Subsidy' 
                                    ? 'Government Subsidy' 
                                    : (item.productType && item.productType.trim() ? item.productType : 'No product specified')
                                  }
                                </Text>
                                {item.category !== 'Government Subsidy' && item.totalProduce > 0 && item.unit ? (
                                  <Text style={styles.accordionDetails}>
                                    {item.totalProduce} {item.unit}
                                  </Text>
                                ) : null}
                                <Text style={styles.accordionIncomeAmount}>
                                  ₹{item.amount || item.saleValue || 0}
                                </Text>
                              </View>
                            );
                          })}
                      </View>
                    )}

                    {/* Expense Accordion */}
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() =>
                        setExpenseAccordionOpen(!expenseAccordionOpen)
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.accordionHeaderLeft}>
                        <View style={styles.expenseIconBadge}>
                          <Icon
                            name="trending-down"
                            size={18}
                            color={COLORS.error}
                          />
                        </View>
                        <Text style={styles.accordionTitle}>
                          {t('farmer_diary.expense_entries')}
                        </Text>
                      </View>
                      <Icon
                        name={
                          expenseAccordionOpen ? 'expand-less' : 'expand-more'
                        }
                        size={24}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                    {expenseAccordionOpen && (
                      <View style={styles.accordionContent}>
                        {ledgerData.entries
                          .filter(
                            item =>
                              item.type === 'expense' ||
                              item.entryType === 'expense',
                          )
                          .slice(0, 5)
                          .reverse()
                          .map((item, index) => {
                            const date = new Date(item.date);
                            const formattedDate = formatDate(date);
                            return (
                              <View
                                key={item._id || index}
                                style={styles.accordionItem}
                              >
                                <View style={styles.accordionItemHeader}>
                                  <Text style={styles.accordionCategory}>
                                    {item.category}
                                  </Text>
                                  <Text style={styles.accordionDate}>
                                    {formattedDate}
                                  </Text>
                                </View>
                                <Text style={styles.accordionProduct}>
                                  {item.productType}
                                </Text>
                                <Text style={styles.accordionExpenseAmount}>
                                  ₹{item.amount}
                                </Text>
                              </View>
                            );
                          })}
                      </View>
                    )}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('farmer_diary.no_entries_found')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmerDiary;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  /* GRADIENT HEADER */
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: rh(24),
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5.3),
    paddingTop: rh(20),
    gap: rw(14),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: rw(16),
    paddingVertical: rh(20),
    paddingHorizontal: wp(3.2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryLabel: {
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: rh(14),
    marginBottom: rh(8),
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    minHeight: rh(28),
  },
  summaryValueGreen: {
    fontSize: rf(18),
    fontWeight: '700',
    color: COLORS.success,
    lineHeight: rh(24),
  },
  summaryValueRed: {
    fontSize: rf(18),
    fontWeight: '700',
    color: COLORS.error,
    lineHeight: rh(24),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5.3),
    paddingTop: rh(20),
    gap: rw(14),
  },
  actionButton: {
    flex: 1,
    height: rh(54),
    borderRadius: rw(12),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addIncomeButton: {
    backgroundColor: COLORS.primary,
  },
  addExpenseButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    fontSize: rf(15),
    fontWeight: '600',
    color: COLORS.backgroundWhite,
    lineHeight: rh(22),
    letterSpacing: 0.2,
  },
  ledgerContainer: {
    marginHorizontal: wp(5.3),
    marginTop: rh(20),
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: rw(16),
    padding: rw(24),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ledgerTitle: {
    fontSize: rf(19),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: rh(20),
    lineHeight: rh(26),
    letterSpacing: -0.3,
  },
  dateRangeLabel: {
    fontSize: rf(14),
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: rh(14),
    lineHeight: rh(20),
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: rw(12),
    marginBottom: rh(24),
  },
  datePickerButton: {
    flex: 1,
    height: rh(52),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: rw(12),
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.3),
  },
  dateText: {
    fontSize: rf(15),
    fontWeight: '500',
    color: COLORS.textDark,
    lineHeight: rh(22),
  },
  calendarIcon: {
    fontSize: 18,
  },
  ledgerActionsRow: {
    flexDirection: 'row',
    gap: rw(12),
  },
  ledgerActionButton: {
    flex: 1,
    height: rh(54),
    borderRadius: rw(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rw(10),
    paddingHorizontal: wp(4),
    paddingVertical: rh(12),
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  viewDetailsButton: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreenBorder,
  },
  downloadPdfButton: {
    backgroundColor: COLORS.accentRed,
    borderColor: COLORS.accentRedBorder,
  },
  ledgerActionText: {
    fontSize: rf(15),
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: rh(22),
    letterSpacing: 0.1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundWhite,
    borderTopLeftRadius: rw(20),
    borderTopRightRadius: rw(20),
    maxHeight: '80%',
    paddingBottom: rh(20),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: rw(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: rf(20),
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: rh(28),
  },
  closeButton: {
    width: rw(32),
    height: rh(32),
    borderRadius: rw(16),
    backgroundColor: COLORS.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalSummary: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalSummaryLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  ledgerList: {
    padding: 16,
  },
  ledgerItem: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  ledgerItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incomeBadge: {
    backgroundColor: COLORS.incomeBadge,
  },
  expenseBadge: {
    backgroundColor: COLORS.expenseBadge,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  ledgerDate: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  ledgerCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  ledgerProduct: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  ledgerDetails: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  ledgerAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  incomeAmount: {
    color: COLORS.income,
  },
  expenseAmount: {
    color: COLORS.expense,
  },
  ledgerReference: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.expense,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3D8B7C',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.backgroundWhite,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentRed,
    paddingVertical: rh(10),
    paddingHorizontal: wp(4.3),
    marginHorizontal: wp(5.3),
    marginTop: rh(20),
    borderRadius: rw(12),
    gap: rw(8),
    borderWidth: 1,
    borderColor: COLORS.accentRedBorder,
  },
  offlineText: {
    fontSize: rf(14),
    fontWeight: '500',
    color: COLORS.expense,
    lineHeight: rh(20),
  },
  dummyCard: {
    backgroundColor: COLORS.backgroundGray,
  },
  dummyLabel: {
    width: rw(60),
    height: rh(16),
    backgroundColor: '#E0E0E0',
    borderRadius: rw(4),
    marginBottom: rh(8),
  },
  dummyValue: {
    width: rw(80),
    height: rh(24),
    backgroundColor: '#E0E0E0',
    borderRadius: rw(4),
  },
  dummyLedgerItem: {
    backgroundColor: COLORS.backgroundGray,
  },
  dummyLedgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dummyBadge: {
    width: 60,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  dummyDate: {
    width: 80,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  dummyCategory: {
    width: '70%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  dummyProduct: {
    width: '50%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  dummyAmount: {
    width: 100,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  expensesContainer: {
    marginHorizontal: wp(5.3),
    marginTop: rh(20),
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: rw(16),
    padding: rw(16),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  accordionContainer: {
    padding: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  incomeIconBadge: {
    width: rw(36),
    height: rh(36),
    borderRadius: rw(18),
    backgroundColor: COLORS.incomeBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIconBadge: {
    width: rw(36),
    height: rh(36),
    borderRadius: rw(18),
    backgroundColor: COLORS.expenseBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  accordionContent: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  accordionItem: {
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  accordionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  accordionCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  accordionDate: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  accordionProduct: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  accordionDetails: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  accordionIncomeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
    lineHeight: 22,
  },
  accordionExpenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
    lineHeight: 22,
  },
  expensesTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: rh(22),
  },
  recentAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recentAccordionContent: {
    marginTop: 12,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: rw(14),
    borderRadius: rw(12),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  expenseLeft: {
    flex: 1,
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseCategory: {
    fontSize: rf(16),
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: rh(4),
  },
  expenseProduct: {
    fontSize: rf(14),
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: rh(2),
  },
  expenseDate: {
    fontSize: rf(12),
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
  listExpenseAmount: {
    fontSize: rf(18),
    fontWeight: '700',
    color: COLORS.expense,
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  listLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  listEmptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listIncomeAmount: {
    fontSize: rf(18),
    fontWeight: '700',
    color: COLORS.income,
  },
  skeletonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  skeletonLeft: {
    flex: 1,
    gap: 6,
  },
  skeletonCategory: {
    width: '60%',
    height: 18,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonProduct: {
    width: '45%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonDate: {
    width: '35%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonAmount: {
    width: 80,
    height: 22,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  deleteButton: {
    padding: rw(4),
    borderRadius: rw(6),
    backgroundColor: COLORS.accentRed,
    minWidth: rw(32),
    minHeight: rh(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    padding: rw(4),
    borderRadius: rw(6),
    backgroundColor: COLORS.accentGreen,
    minWidth: rw(32),
    minHeight: rh(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: rw(6),
  },
});

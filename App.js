import React, { useEffect, useRef } from 'react';
import {
  LogBox,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import Route from './src/Route/Route';
import Splashscreen from './src/common/reusableComponent/Spalshscreen';
import { persistor, store } from './src/Redux/store';
import notificationService from './src/services/notificationService';
import { CustomAlertHost } from './src/common/reusableComponent/CustomAlert';
import { LanguageProvider } from './src/context/LanguageProvider';

import './src/i18n';

/* ========================================================= */
/* 🔥 APP COMPONENT                                          */
/* ========================================================= */
const App = () => {
  const navigationRef = useRef();

  useEffect(() => {
    LogBox.ignoreAllLogs();

    // ── Wire navigation ref into notification service ──
    notificationService.setNavigationRef(navigationRef);

    const init = async () => {
      try {
        // Android 13+ permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }

        // Register device & get FCM token
        await messaging().registerDeviceForRemoteMessages();
        const token = await notificationService.getFCMToken();
        global.fcmToken = token;

        // Configure all notification handlers + channels
        await notificationService.configure();

      } catch (error) {
        console.log('❌ Notification Init Error:', error);
      }
    };

    init();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Splashscreen />} persistor={persistor}>
        <LanguageProvider>
          <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
              <Route />
            </NavigationContainer>
            {/* 🍭 Global sweet alerts — works from any screen */}
            <CustomAlertHost />
          </SafeAreaProvider>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

/* ========================================================= */
/* 🔥 STYLES                                                 */
/* ========================================================= */


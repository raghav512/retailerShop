/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';
import { name as appName } from './app.json';
import notificationService from './src/services/notificationService';

// 🔥 BACKGROUND HANDLER (Runs even if app is killed)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Message handled in background!', remoteMessage);
  try {
    if (remoteMessage.data?.type === 'ADMIN_BROADCAST') {
      // Increment unread badge count
      const storedCount = await AsyncStorage.getItem('unreadCount');
      const newCount = storedCount ? parseInt(storedCount) + 1 : 1;
      await AsyncStorage.setItem('unreadCount', newCount.toString());
    }

    // Display the notification via notifee 
    // This requires notification channels to be pre-created, which we do
    await notificationService.displayNotification(remoteMessage);
  } catch (error) {
    console.log('❌ Background handler error:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);

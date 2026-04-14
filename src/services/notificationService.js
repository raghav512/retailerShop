import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, AndroidStyle } from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ─────────────────────────────────────────
   Navigation reference is set by App.js
   via notificationService.setNavigationRef(ref)
───────────────────────────────────────── */
let _navigationRef = null;

class NotificationService {
    /* ───────── Init ───────── */
    async configure() {
        await this.requestUserPermission();

        if (Platform.OS === 'android') {
            await this.createNotificationChannels();
        }

        this.setupForegroundHandler();
        this.setupNotificationPressHandlers();
    }

    /** Call this from App.js after the NavigationContainer mounts */
    setNavigationRef(ref) {
        _navigationRef = ref;
    }

    /* ───────── Permission ───────── */
    async requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        console.log('🔔 Notification permission enabled:', enabled);
        return enabled;
    }

    /* ───────── Android Channels ───────── */
    async createNotificationChannels() {
        await notifee.createChannel({
            id: 'broadcast',
            name: 'Broadcast Messages',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        await notifee.createChannel({
            id: 'orders',
            name: 'Order Updates',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        await notifee.createChannel({
            id: 'default',
            name: 'General Notifications',
            importance: AndroidImportance.DEFAULT,
            sound: 'default',
        });

        console.log('✅ Notification channels created');
    }

    /* ───────── Fallback for Headless JS (App Killed) ───────── */
    async ensureConfigured() {
        if (Platform.OS === 'android') {
            await this.createNotificationChannels();
        }
    }

    /* ───────── Foreground handler (called inside component) ───────── */
    setupForegroundHandler() {
        messaging().onMessage(async remoteMessage => {
            console.log('📩 Foreground FCM message:', remoteMessage);

            if (remoteMessage.data?.type === 'ADMIN_BROADCAST') {
                // Increment unread badge count for foreground messages natively here
                try {
                    const storedCount = await AsyncStorage.getItem('unreadCount');
                    const newCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;
                    await AsyncStorage.setItem('unreadCount', newCount.toString());
                } catch (err) {
                    console.log('Failed to save unread count', err);
                }
            }

            await this.displayNotification(remoteMessage);
        });
    }

    /* ───────── Press handlers ───────── */
    setupNotificationPressHandlers() {
        // App in foreground – notifee press
        notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                console.log('📲 Foreground notification pressed:', detail);
                this.handleNotificationPress(detail.notification);
            }
        });

        // App in background – FCM opens app
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('📱 Notification opened app (background):', remoteMessage);
            this.handleNotificationNavigation(remoteMessage.data);
        });

        // App was killed – FCM opened app
        // Delay ensures NavigationContainer is fully mounted before navigating
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('🚀 App opened from quit state:', remoteMessage);
                    setTimeout(() => {
                        this.handleNotificationNavigation(remoteMessage.data);
                    }, 500);
                }
            });
    }

    /* ───────── Display notification via notifee ───────── */
    async displayNotification(remoteMessage) {
        const { notification, data } = remoteMessage;

        const notificationType = data?.type || 'default';
        let channelId = 'default';
        if (notificationType === 'ADMIN_BROADCAST') channelId = 'broadcast';
        else if (
            notificationType === 'NEW_ORDER' ||
            notificationType === 'ORDER_STATUS_UPDATE'
        )
            channelId = 'orders';

        const config = {
            title: notification?.title || data?.title || 'Notification',
            body: notification?.body || data?.description || '',
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
                sound: 'default',
                largeIcon: data?.image || undefined,
                style: data?.image
                    ? { type: AndroidStyle.BIGPICTURE, picture: data?.image }
                    : undefined,
            },
            ios: {
                attachments: data?.image
                    ? [{ url: data?.image, thumbnailHidden: false }]
                    : [],
                sound: 'default',
            },
            data: data || {},
        };

        try {
            await this.ensureConfigured(); // Ensure channels exist in headless mode
            await notifee.displayNotification(config);
        } catch (error) {
            console.error('❌ Error displaying notification:', error);
        }
    }

    /* ───────── Navigation from press ───────── */
    handleNotificationPress(notification) {
        const data = notification?.data;
        if (data) this.handleNotificationNavigation(data);
    }

    handleNotificationNavigation(data) {
        if (!data) return;
        const type = data?.type;

        switch (type) {
            case 'ADMIN_BROADCAST':
                this.navigateTo('BroadcastDetails', {
                    title: data?.title,
                    description: data?.description,
                    image: data?.image,
                    timestamp: data?.timestamp,
                });
                break;

            case 'NEW_ORDER':
            case 'ORDER_STATUS_UPDATE':
                this.navigateTo('MyOrders', { orderId: data?.orderId });
                break;

            default:
                this.navigateTo('Broadcasts');
        }
    }

    navigateTo(screen, params = {}) {
        if (_navigationRef?.current) {
            _navigationRef.current.navigate(screen, params);
        } else {
            console.warn('⚠️ navigationRef not set yet. Cannot navigate to:', screen);
        }
    }

    /* ───────── FCM token helpers ───────── */
    async getFCMToken() {
        try {
            const token = await messaging().getToken();
            console.log('🔥 FCM Token:', token);
            return token;
        } catch (error) {
            console.error('❌ Error getting FCM token:', error);
            return null;
        }
    }

    async subscribeToTopic(topic) {
        try {
            await messaging().subscribeToTopic(topic);
            console.log(`✅ Subscribed to topic: ${topic}`);
        } catch (error) {
            console.error(`❌ Error subscribing to topic ${topic}:`, error);
        }
    }

    async unsubscribeFromTopic(topic) {
        try {
            await messaging().unsubscribeFromTopic(topic);
            console.log(`✅ Unsubscribed from topic: ${topic}`);
        } catch (error) {
            console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
        }
    }
}

export default new NotificationService();

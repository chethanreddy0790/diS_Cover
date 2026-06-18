import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * ✅ Check if running in Expo Go.
 * SDK 53+ has deprecated notifications in Expo Go, and even importing
 * the library can trigger loud warnings or internal initialization errors.
 */
const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Safe wrapper for setting the notification handler.
 * Called only outside of Expo Go via dynamic import.
 */
const initializeNotificationHandler = async () => {
  if (isExpoGo) return;
  
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('[Notifications] Failed to initialize handler:', error);
  }
};

// Initialize only if safe
if (!isExpoGo) {
  initializeNotificationHandler();
}

export async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.log('[Notifications] Registration skipped: Unsupported in Expo Go');
    return null;
  }

  try {
    // ✅ Dynamic imports to prevent auto-loading in Expo Go
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    if (!Device.isDevice) {
      console.log('[Notifications] Registration skipped: Not a physical device');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    
    if (!projectId) {
      console.warn('[Notifications] Missing projectId in app config');
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push] Token generated successfully');
    return token;
  } catch (error) {
    console.warn('[Notifications] Registration error (silenced for Expo Go):', error);
    return null;
  }
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string, data: any = {}) {
  if (!expoPushToken) return;

  // We don't need expo-notifications to SEND a push notification via API
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    // Silent success
  } catch (error) {
    console.warn('[Push] Send warning (non-fatal):', error);
  }
}

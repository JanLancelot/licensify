import { router } from 'expo-router';
import { Platform } from 'react-native';

export interface PushNotificationPayload {
  type?: 'study_room' | 'exam' | 'reminder' | 'announcement' | 'flashcards' | 'topic';
  roomId?: string;
  quizId?: string;
  topicId?: string;
  subjectId?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

/**
 * Parses push notification payload data and handles deep-linking navigation.
 */
export function handleNotificationDeepLink(data?: Record<string, unknown> | PushNotificationPayload) {
  if (!data) return;

  const type = (data as any).type as string | undefined;
  const roomId = (data as any).roomId as string | undefined;
  const quizId = (data as any).quizId as string | undefined;
  const topicId = (data as any).topicId as string | undefined;
  const subjectId = (data as any).subjectId as string | undefined;

  try {
    if (type === 'study_room' && roomId) {
      router.push(`/room/${roomId}` as any);
    } else if (type === 'exam' && quizId) {
      router.push(`/explore` as any);
    } else if (type === 'flashcards' && (topicId || subjectId)) {
      router.push(`/explore` as any);
    } else if (type === 'reminder' || type === 'announcement') {
      router.push(`/` as any);
    }
  } catch (error) {
    console.warn('[FCM] Failed to navigate on deep link:', error);
  }
}

/**
 * Requests FCM push notification permissions and retrieves token (fallback for Expo/Web).
 */
export async function requestFcmToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      console.log('[FCM] Web platform detected - Push notification token mocked or standard web worker required');
      return 'web_fcm_token_placeholder';
    }

    // Dynamic optional import for Firebase Messaging to avoid crash on Expo Go / Web without native build
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messaging = require('@react-native-firebase/messaging')?.default;
    if (!messaging) {
      console.log('[FCM] Firebase messaging module not available, using fallback notification token');
      return null;
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      return token;
    }
  } catch (error) {
    console.warn('[FCM] Error requesting FCM token:', error);
  }
  return null;
}

/**
 * Sets up foreground and background notification interaction listeners.
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: PushNotificationPayload) => void
): () => void {
  if (Platform.OS === 'web') {
    return () => {};
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messaging = require('@react-native-firebase/messaging')?.default;
    if (!messaging) {
      return () => {};
    }

    // 1. Foreground message listener
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage: any) => {
      console.log('[FCM] Foreground notification received:', remoteMessage);
      if (onNotificationReceived && remoteMessage?.data) {
        onNotificationReceived(remoteMessage.data as PushNotificationPayload);
      }
    });

    // 2. Notification opened app from background state
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('[FCM] Notification opened app from background:', remoteMessage);
      if (remoteMessage?.data) {
        handleNotificationDeepLink(remoteMessage.data);
      }
    });

    // 3. Notification opened app from completely quit state (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage?.data) {
          console.log('[FCM] Initial notification loaded from quit state:', remoteMessage);
          handleNotificationDeepLink(remoteMessage.data);
        }
      })
      .catch((err: any) => {
        console.warn('[FCM] Error checking initial notification:', err);
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  } catch (error) {
    console.warn('[FCM] Could not attach native notification listeners:', error);
    return () => {};
  }
}

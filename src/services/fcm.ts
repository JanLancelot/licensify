import { router } from 'expo-router';
import { Platform } from 'react-native';

export interface PushNotificationPayload {
  type?: 'study_room' | 'exam' | 'reminder' | 'announcement';
  roomId?: string;
  quizId?: string;
  title?: string;
  body?: string;
}

/**
 * Parses push notification payload data and handles deep-linking navigation.
 */
export function handleNotificationDeepLink(data?: Record<string, unknown>) {
  if (!data) return;

  const type = data.type as string | undefined;
  const roomId = data.roomId as string | undefined;
  const quizId = data.quizId as string | undefined;

  if (type === 'study_room' && roomId) {
    // Deep link to study room
    router.push(`/room/${roomId}` as any);
  } else if (type === 'exam' && quizId) {
    // Deep link to quiz/exam
    router.push(`/explore` as any);
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

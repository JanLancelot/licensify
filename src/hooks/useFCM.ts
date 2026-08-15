import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { handleNotificationDeepLink, requestFcmToken, setupNotificationListeners, PushNotificationPayload } from '../services/fcm';

/**
 * Custom hook to register FCM push notification token and set up deep link handling.
 */
export function useFCM(onNotification?: (payload: PushNotificationPayload) => void) {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const updateFcmToken = useMutation(api.users.updateFcmToken);

  // 1. Token Registration Lifecycle
  useEffect(() => {
    if (!profile) return;

    let isMounted = true;

    async function initFCM() {
      const token = await requestFcmToken();
      if (token && isMounted) {
        try {
          await updateFcmToken({ fcmToken: token });
        } catch (err) {
          console.warn('[useFCM] Failed to update FCM token in database:', err);
        }
      }
    }

    initFCM();

    return () => {
      isMounted = false;
    };
  }, [profile, updateFcmToken]);

  // 2. Notification Listeners Lifecycle
  useEffect(() => {
    const cleanup = setupNotificationListeners((payload) => {
      if (onNotification) {
        onNotification(payload);
      }
    });

    return () => {
      cleanup();
    };
  }, [onNotification]);

  return {
    handleNotificationDeepLink,
  };
}

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { handleNotificationDeepLink, requestFcmToken } from '../services/fcm';

/**
 * Custom hook to register FCM push notification token and set up deep link handling.
 */
export function useFCM() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const updateFcmToken = useMutation(api.users.updateFcmToken);

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

  return {
    handleNotificationDeepLink,
  };
}

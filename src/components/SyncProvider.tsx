import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { useSyncService } from '../services/useSyncService';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { syncDown, syncUp } = useSyncService();

  useEffect(() => {
    const checkAndSync = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        // Fallback: if isInternetReachable is null (some Android devices), rely on isConnected
        const isOnline = state.isConnected && (state.isInternetReachable !== false);
        
        if (isOnline) {
          await syncUp();
          await syncDown();
        }
      } catch (err) {
        console.warn('[SyncProvider] Network check failed', err);
      }
    };

    // Run on initial mount
    checkAndSync();

    // Run when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAndSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncDown, syncUp]);

  return <>{children}</>;
}

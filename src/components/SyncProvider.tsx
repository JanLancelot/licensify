import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { useSyncService } from '../services/useSyncService';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { syncDown, syncUp } = useSyncService();

  const syncDownRef = React.useRef(syncDown);
  const syncUpRef = React.useRef(syncUp);

  useEffect(() => {
    syncDownRef.current = syncDown;
    syncUpRef.current = syncUp;
  }, [syncDown, syncUp]);

  useEffect(() => {
    const checkAndSync = async () => {
      try {
        let isOnline = true;
        try {
          const state = await Network.getNetworkStateAsync();
          isOnline = state.isConnected !== false;
        } catch {
          // Assume online if network check throws
        }
        
        if (isOnline) {
          // Down-sync first so the local device has all latest questions, subjects, and quizzes
          try {
            await syncDownRef.current();
          } catch (e) {
            console.warn('[SyncProvider] syncDown error:', e);
          }

          // Up-sync pending attempts in background
          try {
            await syncUpRef.current();
          } catch (e) {
            console.warn('[SyncProvider] syncUp error:', e);
          }
        }
      } catch (err) {
        console.warn('[SyncProvider] Sync sequence notice:', err);
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
  }, []);

  return <>{children}</>;
}

import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { useSyncService } from '../services/useSyncService';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { syncDown, syncUp } = useSyncService();

  const syncDownRef = useRef(syncDown);
  const syncUpRef = useRef(syncUp);
  const lastSyncTimestampRef = useRef(0);

  useEffect(() => {
    syncDownRef.current = syncDown;
    syncUpRef.current = syncUp;
  }, [syncDown, syncUp]);

  useEffect(() => {
    const checkAndSync = async () => {
      // Debounce sync triggers within 3 seconds
      const now = Date.now();
      if (now - lastSyncTimestampRef.current < 3000) {
        return;
      }
      lastSyncTimestampRef.current = now;

      try {
        let isOnline = true;
        try {
          const state = await Network.getNetworkStateAsync();
          isOnline = state.isConnected !== false;
        } catch {
          // Assume online if network check throws
        }

        if (isOnline) {
          // 1. Down-sync first (fast single-query bundle / delta)
          try {
            await syncDownRef.current();
          } catch (e) {
            console.warn('[SyncProvider] syncDown notice:', e);
          }

          // 2. Up-sync pending attempts in background (single batch mutation)
          try {
            await syncUpRef.current();
          } catch (e) {
            console.warn('[SyncProvider] syncUp notice:', e);
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

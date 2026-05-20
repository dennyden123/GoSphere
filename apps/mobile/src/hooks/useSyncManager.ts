import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncGroSphere } from '../database/sync';

/**
 * Hook to manage automatic background synchronization.
 * Triggers a sync when:
 * 1. The app mounts.
 * 2. The device comes back online.
 */
export function useSyncManager() {
  useEffect(() => {
    // 1. Initial Sync on Mount
    const initialSync = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        try {
          await syncGroSphere();
          console.log('SyncManager: Initial sync complete');
        } catch (error) {
          console.error('SyncManager: Initial sync failed', error);
        }
      }
    };

    initialSync();

    // 2. Subscribe to Network Changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('SyncManager: Network restored, triggering sync...');
        syncGroSphere().catch(err => console.error('SyncManager: Network-triggered sync failed', err));
      }
    });

    return () => unsubscribe();
  }, []);
}

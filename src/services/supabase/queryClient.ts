import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { syncKeyValueStorage } from '../../stores/persistStorage';

const DAY = 24 * 60 * 60 * 1000;

/**
 * One query client for every Supabase read. Results are persisted to the encrypted on-device
 * store, so the last server answer shows instantly and offline; a slow or missing network
 * only delays the refresh. Retries back off, because the app runs on mobile data.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 7 * DAY,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(30_000, 2_000 * 2 ** attempt),
      networkMode: 'offlineFirst',
    },
    mutations: { networkMode: 'offlineFirst', retry: 1 },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: syncKeyValueStorage,
  key: 'thrivefold.query-cache.v1',
  throttleTime: 2_000,
});

export const PERSIST_MAX_AGE = 7 * DAY;

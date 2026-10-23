import { createClient } from '@supabase/supabase-js';

import { asyncKeyValueStorage } from '../../stores/persistStorage';

// Thrivefold must use its own Supabase project. There is deliberately no fallback:
// without these variables the app runs fully on-device and `supabase` is null.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export const isBackendConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

/** The session is kept in the same on-device store as the rest of the app (MMKV). */
export const supabase = isBackendConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: asyncKeyValueStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

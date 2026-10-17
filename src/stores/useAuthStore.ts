import { create } from 'zustand';

export interface UserProfile {
  id: string;
  pseudonym: string;
  avatarSeed: string;
  age: number;
  isAgeVerified: boolean;
  ageBand: string;
  email?: string;
  hasActiveSubscription: boolean;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  activeTrialStartDate: string | null;
  introsSentToday: number;
  lastIntroDate: string | null;
  setUser: (user: UserProfile | null) => void;
  startTrial: () => void;
  incrementIntroQuota: () => void;
  resetDailyQuotaIfNewDay: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true, // Default active session for offline-first experience
  user: {
    id: 'user_dev_01',
    pseudonym: 'SolsticeSeeker',
    avatarSeed: 'seed_lotus_01',
    age: 26,
    isAgeVerified: true,
    ageBand: '25_29',
    hasActiveSubscription: false,
    createdAt: new Date().toISOString(),
  },
  activeTrialStartDate: new Date().toISOString(),
  introsSentToday: 0,
  lastIntroDate: new Date().toISOString().split('T')[0],

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  startTrial: () => set({ activeTrialStartDate: new Date().toISOString() }),
  incrementIntroQuota: () =>
    set((state) => ({
      introsSentToday: state.introsSentToday + 1,
      lastIntroDate: new Date().toISOString().split('T')[0],
    })),
  resetDailyQuotaIfNewDay: () => {
    const today = new Date().toISOString().split('T')[0];
    if (get().lastIntroDate !== today) {
      set({ introsSentToday: 0, lastIntroDate: today });
    }
  },
  signOut: () => set({ isAuthenticated: false, user: null }),
}));

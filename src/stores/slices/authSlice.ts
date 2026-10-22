import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';


export interface UserProfile {
  id: string;
  pseudonym: string;
  avatarSeed: string;
  /** Unknown until the person states it; never assumed. */
  age: number | null;
  /**
   * True only after a real age-assurance check (REQ-013). Self-declaration and
   * sign-in never set this, so adult social features stay locked by default.
   */
  isAgeVerified: boolean;
  ageBand: string | null;
  email?: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface AuthSlice {
  isAuthenticated: boolean;
  user: UserProfile | null;
  activeTrialStartDate: string | null;
  introsSentToday: number;
  lastIntroDate: string | null;
  setUser: (user: UserProfile | null) => void;
  continueAsGuest: () => void;
  startTrial: () => void;
  incrementIntroQuota: () => void;
  resetDailyQuotaIfNewDay: () => void;
  signOut: () => void;
}

const newLocalId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const createAuthSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  AuthSlice
> = (set, get) => ({
      // Nobody is signed in until they choose to be.
      isAuthenticated: false,
      user: null,
      activeTrialStartDate: null,
      introsSentToday: 0,
      lastIntroDate: null,

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      continueAsGuest: () => {
        const guestUser: UserProfile = {
          id: newLocalId('guest'),
          pseudonym: 'Guest',
          avatarSeed: 'seed_lotus_guest',
          age: null,
          isAgeVerified: false,
          ageBand: null,
          isGuest: true,
          createdAt: new Date().toISOString(),
        };
        set({
          user: guestUser,
          isAuthenticated: true,
          activeTrialStartDate: null,
          introsSentToday: 0,
          lastIntroDate: null,
        });
      },
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
      signOut: () =>
        set({
          isAuthenticated: false,
          user: null,
          activeTrialStartDate: null,
          introsSentToday: 0,
          lastIntroDate: null,
        }),
});

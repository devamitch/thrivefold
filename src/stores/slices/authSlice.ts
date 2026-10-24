import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';


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
  /** As saved in the person's Google account and confirmed by them; never inferred. */
  gender?: string | null;
  photoUrl?: string | null;
  /** Where name/age/gender came from. Google-provided age is self-reported, not verified. */
  profileSource?: 'google' | 'manual' | 'email';
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

export const newLocalId = (prefix: string) =>
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

      setUser: (user) => {
        const updates: Record<string, unknown> = { user, isAuthenticated: Boolean(user) };
        if (user?.gender?.toLowerCase() === 'male' && get().experience === 'women_health') {
          updates.experience = 'men_health';
          updates.experienceConfirmed = true;
        } else if (user?.gender?.toLowerCase() === 'female' && get().experience === 'men_health') {
          updates.experience = 'women_health';
          updates.experienceConfirmed = true;
        }
        set(updates as any);
      },
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
          lastIntroDate: formatLocalDate(new Date()),
        })),
      resetDailyQuotaIfNewDay: () => {
        const today = formatLocalDate(new Date());
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

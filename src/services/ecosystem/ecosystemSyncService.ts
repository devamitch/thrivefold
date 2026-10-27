/**
 * Thrivefold Unified Vault SOS — Cross-App Unified User Profile & Ecosystem Data Engine
 *
 * Peer-to-peer ecosystem connection: Any app in the ecosystem (Setu, Thrivefold,
 * HarmonyBloom, Neev, BlinkQuest) can connect with any other app directly
 * with complete data access.
 *
 * RULE: Non-destructive nullish merging.
 * Never overwrite valid existing non-nullish data with null/undefined/empty values.
 * Unify, finish, fix, and fill gaps across identity, addresses, places,
 * preferences, biological rhythms, and progression.
 */

import { Linking } from 'react-native';
import { useRootStore } from '../../stores/useRootStore';
import type { PeriodLogRecord, FlowIntensity } from '../../stores/slices/healthSlice';
import type { UserProfile } from '../../stores/slices/authSlice';

export interface EcosystemAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface SanctuaryPlace {
  id: string;
  name: string;
  category: 'home' | 'office' | 'studio' | 'nature' | 'retreat' | 'clinic' | 'gym' | 'temple' | 'other';
  address?: string;
  latitude?: number;
  longitude?: number;
  favorite?: boolean;
}

export interface DetailedUserProfile {
  userId: string;
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: 'female' | 'male' | 'other' | string | null;
  age?: number | null;
  ageBand?: string | null;
  isAgeVerified?: boolean;
  avatar?: string | null;
  avatarSeed?: string | null;
  avatarIndex?: number | null;
  photoUrl?: string | null;
  bio?: string | null;
  occupation?: string | null;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  provider?: string | null;
  createdAt?: string;
  updatedAt?: number;
}

export interface EcosystemLocations {
  homeAddress?: EcosystemAddress | null;
  officeAddress?: EcosystemAddress | null;
  sanctuaryPlaces?: SanctuaryPlace[];
  recentLocations?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    visitedAt: string;
  }>;
}

export interface EcosystemPreferences {
  themeMode?: 'system' | 'light' | 'dark';
  eatingPreference?: string | null;
  routineDurationMinutes?: number | null;
  sleepTime?: string | null;
  wakeTime?: string | null;
  workStart?: string | null;
  workEnd?: string | null;
  breakIntervalMin?: number | null;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  notificationsEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  units?: 'metric' | 'imperial';
  language?: string;
}

export interface EcosystemExperience {
  activeExperience?: string | null;
  experienceConfirmed?: boolean;
  selectedExperiences?: string[];
  worldview?: {
    faith?: string | null;
    tradition?: string | null;
    dietaryObservances?: string[];
    mindfulnessPractice?: string | null;
  };
  goals?: string[];
  constraints?: string[];
}

export interface PeriodRecordItem {
  id: string;
  startDate: string;
  endDate?: string;
  flow?: string;
  length?: number;
  symptoms?: string[];
  painLevel?: number;
  mood?: number;
  notes?: string;
}

export interface EcosystemHealth {
  lastPeriodDate?: string | null;
  cycleLengthDays?: number | null;
  periodLengthDays?: number | null;
  flowIntensity?: string | null;
  currentPhase?: string | null;
  estimatedNextPeriodDate?: string | null;
  reproductiveContext?: string | null;
  symptoms?: string[];
  symptomsByDate?: Record<string, string[]>;
  periodHistory?: PeriodRecordItem[];
  dailyWaterGoalMl?: number | null;
  recentDailyCheckIns?: Array<{
    date: string;
    energy?: number;
    mood?: number;
    stress?: number;
    sleepHours?: number;
    symptoms?: string[];
    notes?: string;
  }>;
  eyeHealth?: {
    lastBlinkRate?: number;
    screenTimeMinutesToday?: number;
    eyeBatteryPercentage?: number;
  };
}

export interface EcosystemProgression {
  level?: number;
  xp?: number;
  diamonds?: number;
  streakDays?: number;
  lastActiveDate?: string;
  completedQuestsCount?: number;
  badges?: string[];
  unlockedFeatures?: string[];
}

export interface EcosystemDeviceInventory {
  deviceId: string;
  installedApps: {
    setu?: boolean;
    thrivefold?: boolean;
    harmonybloom?: boolean;
    neev?: boolean;
    blinkquest?: boolean;
  };
  lastSeenOnline?: string;
  lastSyncApp?: string;
}

export interface UnifiedVaultSosData {
  version: number;
  lastSyncedAt: number;
  originApp: string;
  identity: DetailedUserProfile;
  locations: EcosystemLocations;
  preferences: EcosystemPreferences;
  experience: EcosystemExperience;
  health: EcosystemHealth;
  progression: EcosystemProgression;
  deviceInventory?: EcosystemDeviceInventory;
}

export type UnifiedEcosystemData = UnifiedVaultSosData;

const SUPABASE_BACKEND_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kwrdugillyakxgvgbrsu.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  '';

export const isNullish = (val: unknown): boolean => {
  return val === undefined || val === null || val === '';
};

export const isPlaceholderName = (name?: string | null): boolean => {
  if (!name || isNullish(name)) return true;
  const lower = name.trim().toLowerCase();
  return (
    lower === 'guest' ||
    lower === 'setu user' ||
    lower === 'user' ||
    lower === 'setu explorer' ||
    lower === 'thrivefold member' ||
    lower === 'unknown'
  );
};

export const pickNonNullishString = (a?: string | null, b?: string | null): string => {
  const aEmpty = isNullish(a);
  const bEmpty = isNullish(b);

  if (aEmpty && bEmpty) return '';
  if (aEmpty) return b!.trim();
  if (bEmpty) return a!.trim();

  if (isPlaceholderName(a) && !isPlaceholderName(b)) return b!.trim();
  if (!isPlaceholderName(a) && isPlaceholderName(b)) return a!.trim();

  return b!.trim();
};

export const mergeUniqueArrays = <T>(a?: T[] | null, b?: T[] | null): T[] => {
  const set = new Set<T>();
  if (Array.isArray(a)) {
    for (const item of a) {
      if (!isNullish(item)) set.add(item);
    }
  }
  if (Array.isArray(b)) {
    for (const item of b) {
      if (!isNullish(item)) set.add(item);
    }
  }
  return Array.from(set);
};

export const mergeAddress = (
  a?: EcosystemAddress | null,
  b?: EcosystemAddress | null
): EcosystemAddress | null => {
  if (!a && !b) return null;
  if (!a) return b ? { ...b } : null;
  if (!b) return a ? { ...a } : null;

  return {
    name: pickNonNullishString(a.name, b.name) || 'Saved Address',
    addressLine1: pickNonNullishString(a.addressLine1, b.addressLine1),
    addressLine2: pickNonNullishString(a.addressLine2, b.addressLine2) || undefined,
    landmark: pickNonNullishString(a.landmark, b.landmark) || undefined,
    city: pickNonNullishString(a.city, b.city),
    state: pickNonNullishString(a.state, b.state),
    postalCode: pickNonNullishString(a.postalCode, b.postalCode),
    country: pickNonNullishString(a.country, b.country) || 'India',
    latitude: b.latitude ?? a.latitude,
    longitude: b.longitude ?? a.longitude,
    notes: pickNonNullishString(a.notes, b.notes) || undefined,
  };
};

export const mergePeriodRecords = (
  a?: PeriodRecordItem[] | null,
  b?: PeriodRecordItem[] | null
): PeriodRecordItem[] => {
  const map = new Map<string, PeriodRecordItem>();

  const ingest = (records?: PeriodRecordItem[] | null) => {
    if (!Array.isArray(records)) return;
    for (const r of records) {
      if (!r || isNullish(r.startDate)) continue;
      const key = r.startDate.trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...r });
      } else {
        map.set(key, {
          id: existing.id || r.id || `period_${key}`,
          startDate: key,
          endDate: r.endDate || existing.endDate,
          flow: !isNullish(r.flow) ? r.flow : existing.flow,
          length: r.length && r.length > 0 ? r.length : existing.length,
          symptoms: mergeUniqueArrays(existing.symptoms, r.symptoms),
          painLevel: r.painLevel !== undefined ? r.painLevel : existing.painLevel,
          mood: r.mood !== undefined ? r.mood : existing.mood,
          notes: pickNonNullishString(existing.notes, r.notes),
        });
      }
    }
  };

  ingest(a);
  ingest(b);

  return Array.from(map.values()).sort(
    (x, y) => new Date(y.startDate).getTime() - new Date(x.startDate).getTime()
  );
};

export const mergeSanctuaryPlaces = (
  a?: SanctuaryPlace[] | null,
  b?: SanctuaryPlace[] | null
): SanctuaryPlace[] => {
  const map = new Map<string, SanctuaryPlace>();

  const ingest = (places?: SanctuaryPlace[] | null) => {
    if (!Array.isArray(places)) return;
    for (const p of places) {
      if (!p || isNullish(p.name)) continue;
      const key = (p.id || p.name).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...p });
      } else {
        map.set(key, {
          id: existing.id || p.id,
          name: p.name || existing.name,
          category: p.category || existing.category || 'other',
          address: pickNonNullishString(existing.address, p.address) || undefined,
          latitude: p.latitude ?? existing.latitude,
          longitude: p.longitude ?? existing.longitude,
          favorite: Boolean(existing.favorite || p.favorite),
        });
      }
    }
  };

  ingest(a);
  ingest(b);

  return Array.from(map.values());
};

/**
 * Universal Non-Destructive Nullish Merging Engine
 */
export function unifyEcosystemData(
  existing?: Partial<UnifiedVaultSosData> | null,
  incoming?: Partial<UnifiedVaultSosData> | null,
  originApp: string = 'thrivefold'
): UnifiedVaultSosData {
  const now = Date.now();

  const exId = existing?.identity;
  const inId = incoming?.identity;

  const identity: DetailedUserProfile = {
    userId: pickNonNullishString(exId?.userId, inId?.userId) || `tf_${now}`,
    displayName: pickNonNullishString(exId?.displayName, inId?.displayName) || 'Thrive Member',
    email: pickNonNullishString(exId?.email, inId?.email) || null,
    phoneNumber: pickNonNullishString(exId?.phoneNumber, inId?.phoneNumber) || null,
    dateOfBirth: pickNonNullishString(exId?.dateOfBirth, inId?.dateOfBirth) || null,
    gender: pickNonNullishString(exId?.gender, inId?.gender) || null,
    age: !isNullish(inId?.age) ? inId!.age : !isNullish(exId?.age) ? exId!.age : null,
    ageBand: pickNonNullishString(exId?.ageBand, inId?.ageBand) || null,
    isAgeVerified: Boolean(exId?.isAgeVerified || inId?.isAgeVerified),
    avatar: pickNonNullishString(exId?.avatar, inId?.avatar) || null,
    avatarSeed: pickNonNullishString(exId?.avatarSeed, inId?.avatarSeed) || null,
    avatarIndex: !isNullish(inId?.avatarIndex)
      ? inId!.avatarIndex
      : !isNullish(exId?.avatarIndex)
      ? exId!.avatarIndex
      : 0,
    photoUrl: pickNonNullishString(exId?.photoUrl, inId?.photoUrl) || null,
    bio: pickNonNullishString(exId?.bio, inId?.bio) || null,
    occupation: pickNonNullishString(exId?.occupation, inId?.occupation) || null,
    emergencyContact: inId?.emergencyContact || exId?.emergencyContact || null,
    provider: pickNonNullishString(exId?.provider, inId?.provider) || 'unified_vault_sos',
    createdAt: exId?.createdAt || inId?.createdAt || new Date().toISOString(),
    updatedAt: now,
  };

  const exLoc = existing?.locations;
  const inLoc = incoming?.locations;

  const locations: EcosystemLocations = {
    homeAddress: mergeAddress(exLoc?.homeAddress, inLoc?.homeAddress),
    officeAddress: mergeAddress(exLoc?.officeAddress, inLoc?.officeAddress),
    sanctuaryPlaces: mergeSanctuaryPlaces(exLoc?.sanctuaryPlaces, inLoc?.sanctuaryPlaces),
    recentLocations: mergeUniqueArrays(exLoc?.recentLocations, inLoc?.recentLocations),
  };

  const exExp = existing?.experience;
  const inExp = incoming?.experience;

  let activeExp = pickNonNullishString(exExp?.activeExperience, inExp?.activeExperience);
  if (identity.gender?.toLowerCase() === 'female' && activeExp === 'men_health') {
    activeExp = 'women_health';
  } else if (identity.gender?.toLowerCase() === 'male' && activeExp === 'women_health') {
    activeExp = 'men_health';
  }

  const experience: EcosystemExperience = {
    activeExperience:
      activeExp || (identity.gender?.toLowerCase() === 'female' ? 'women_health' : 'holistic'),
    experienceConfirmed: Boolean(exExp?.experienceConfirmed || inExp?.experienceConfirmed),
    selectedExperiences: mergeUniqueArrays(exExp?.selectedExperiences, inExp?.selectedExperiences),
    worldview: {
      faith: pickNonNullishString(exExp?.worldview?.faith, inExp?.worldview?.faith) || null,
      tradition: pickNonNullishString(exExp?.worldview?.tradition, inExp?.worldview?.tradition) || null,
      dietaryObservances: mergeUniqueArrays(
        exExp?.worldview?.dietaryObservances,
        inExp?.worldview?.dietaryObservances
      ),
      mindfulnessPractice:
        pickNonNullishString(exExp?.worldview?.mindfulnessPractice, inExp?.worldview?.mindfulnessPractice) || null,
    },
    goals: mergeUniqueArrays(exExp?.goals, inExp?.goals),
    constraints: mergeUniqueArrays(exExp?.constraints, inExp?.constraints),
  };

  const exPref = existing?.preferences;
  const inPref = incoming?.preferences;

  const preferences: EcosystemPreferences = {
    themeMode: (inPref?.themeMode || exPref?.themeMode || 'system') as 'system' | 'light' | 'dark',
    eatingPreference: pickNonNullishString(exPref?.eatingPreference, inPref?.eatingPreference) || null,
    routineDurationMinutes:
      !isNullish(inPref?.routineDurationMinutes)
        ? inPref!.routineDurationMinutes
        : !isNullish(exPref?.routineDurationMinutes)
        ? exPref!.routineDurationMinutes
        : 10,
    sleepTime: pickNonNullishString(exPref?.sleepTime, inPref?.sleepTime) || '22:30',
    wakeTime: pickNonNullishString(exPref?.wakeTime, inPref?.wakeTime) || '06:30',
    workStart: pickNonNullishString(exPref?.workStart, inPref?.workStart) || '09:00',
    workEnd: pickNonNullishString(exPref?.workEnd, inPref?.workEnd) || '18:00',
    breakIntervalMin: !isNullish(inPref?.breakIntervalMin)
      ? inPref!.breakIntervalMin
      : !isNullish(exPref?.breakIntervalMin)
      ? exPref!.breakIntervalMin
      : 20,
    soundEnabled: inPref?.soundEnabled ?? exPref?.soundEnabled ?? true,
    hapticsEnabled: inPref?.hapticsEnabled ?? exPref?.hapticsEnabled ?? true,
    notificationsEnabled: inPref?.notificationsEnabled ?? exPref?.notificationsEnabled ?? true,
    quietHoursEnabled: inPref?.quietHoursEnabled ?? exPref?.quietHoursEnabled ?? false,
    quietHoursStart: pickNonNullishString(exPref?.quietHoursStart, inPref?.quietHoursStart) || '22:00',
    quietHoursEnd: pickNonNullishString(exPref?.quietHoursEnd, inPref?.quietHoursEnd) || '07:00',
    units: inPref?.units || exPref?.units || 'metric',
    language: inPref?.language || exPref?.language || 'en',
  };

  const exH = existing?.health;
  const inH = incoming?.health;

  const lastPeriodDate = pickNonNullishString(exH?.lastPeriodDate, inH?.lastPeriodDate) || null;

  const symptomsByDate: Record<string, string[]> = {
    ...(exH?.symptomsByDate || {}),
  };
  if (inH?.symptomsByDate) {
    for (const [date, syms] of Object.entries(inH.symptomsByDate)) {
      symptomsByDate[date] = mergeUniqueArrays(symptomsByDate[date], syms);
    }
  }

  const health: EcosystemHealth = {
    lastPeriodDate,
    cycleLengthDays:
      inH?.cycleLengthDays && inH.cycleLengthDays > 0
        ? inH.cycleLengthDays
        : exH?.cycleLengthDays && exH.cycleLengthDays > 0
        ? exH.cycleLengthDays
        : 28,
    periodLengthDays:
      inH?.periodLengthDays && inH.periodLengthDays > 0
        ? inH.periodLengthDays
        : exH?.periodLengthDays && exH.periodLengthDays > 0
        ? exH.periodLengthDays
        : 5,
    flowIntensity: pickNonNullishString(exH?.flowIntensity, inH?.flowIntensity) || 'medium',
    currentPhase: pickNonNullishString(exH?.currentPhase, inH?.currentPhase) || 'follicular',
    estimatedNextPeriodDate:
      pickNonNullishString(exH?.estimatedNextPeriodDate, inH?.estimatedNextPeriodDate) || null,
    reproductiveContext: pickNonNullishString(exH?.reproductiveContext, inH?.reproductiveContext) || 'regular',
    symptoms: mergeUniqueArrays(exH?.symptoms, inH?.symptoms),
    symptomsByDate,
    periodHistory: mergePeriodRecords(exH?.periodHistory, inH?.periodHistory),
    dailyWaterGoalMl: inH?.dailyWaterGoalMl || exH?.dailyWaterGoalMl || 2400,
    recentDailyCheckIns: inH?.recentDailyCheckIns || exH?.recentDailyCheckIns || [],
    eyeHealth: {
      lastBlinkRate: inH?.eyeHealth?.lastBlinkRate ?? exH?.eyeHealth?.lastBlinkRate,
      screenTimeMinutesToday:
        inH?.eyeHealth?.screenTimeMinutesToday ?? exH?.eyeHealth?.screenTimeMinutesToday,
      eyeBatteryPercentage:
        inH?.eyeHealth?.eyeBatteryPercentage ?? exH?.eyeHealth?.eyeBatteryPercentage,
    },
  };

  const exProg = existing?.progression;
  const inProg = incoming?.progression;

  const progression: EcosystemProgression = {
    level: Math.max(exProg?.level || 1, inProg?.level || 1),
    xp: Math.max(exProg?.xp || 0, inProg?.xp || 0),
    diamonds: Math.max(exProg?.diamonds || 0, inProg?.diamonds || 0),
    streakDays: Math.max(exProg?.streakDays || 0, inProg?.streakDays || 0),
    lastActiveDate:
      pickNonNullishString(exProg?.lastActiveDate, inProg?.lastActiveDate) ||
      new Date().toISOString().split('T')[0],
    completedQuestsCount: Math.max(
      exProg?.completedQuestsCount || 0,
      inProg?.completedQuestsCount || 0
    ),
    badges: mergeUniqueArrays(exProg?.badges, inProg?.badges),
    unlockedFeatures: mergeUniqueArrays(exProg?.unlockedFeatures, inProg?.unlockedFeatures),
  };

  const deviceInventory: EcosystemDeviceInventory = {
    deviceId:
      existing?.deviceInventory?.deviceId ||
      incoming?.deviceInventory?.deviceId ||
      `dev_${Math.random().toString(36).slice(2, 10)}`,
    installedApps: {
      thrivefold: true,
      ...(existing?.deviceInventory?.installedApps || {}),
      ...(incoming?.deviceInventory?.installedApps || {}),
      [originApp]: true,
    },
    lastSeenOnline: new Date().toISOString(),
    lastSyncApp: originApp,
  };

  return {
    version: 2,
    lastSyncedAt: now,
    originApp,
    identity,
    locations,
    preferences,
    experience,
    health,
    progression,
    deviceInventory,
  };
}

export function encodeEcosystemPayload(data: UnifiedVaultSosData): string {
  try {
    const json = JSON.stringify(data);
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    return Buffer.from(json).toString('base64url');
  } catch {
    return encodeURIComponent(JSON.stringify(data));
  }
}

export function decodeEcosystemPayload(payload: string): Partial<UnifiedVaultSosData> | null {
  if (!payload) return null;
  try {
    let json = '';
    if (typeof atob !== 'undefined') {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      json = decodeURIComponent(escape(atob(padded)));
    } else {
      json = Buffer.from(payload, 'base64url').toString('utf8');
    }
    return JSON.parse(json) as Partial<UnifiedVaultSosData>;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(payload)) as Partial<UnifiedVaultSosData>;
    } catch {
      return null;
    }
  }
}

export const ecosystemSyncService = {
  /**
   * Extracts current local state from Thrivefold and returns an Ecosystem payload.
   */
  buildLocalEcosystemPayload(): UnifiedVaultSosData {
    const state = useRootStore.getState();
    const user = state.user;
    const cycle = state.cycleData;

    const periodHistory: PeriodRecordItem[] = (cycle?.periodHistory || []).map((p) => ({
      id: p.id,
      startDate: p.startDate,
      endDate: p.endDate,
      flow: p.flowIntensity,
      length: p.endDate
        ? Math.max(1, Math.round((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 86400000) + 1)
        : 5,
      symptoms: p.symptoms || [],
      painLevel: p.painLevel,
      mood: p.mood,
      notes: p.notes,
    }));

    return unifyEcosystemData(
      {
        identity: {
          userId: user?.id || `tf_${Date.now()}`,
          displayName: user?.pseudonym || 'Thrivefold User',
          email: user?.email || null,
          photoUrl: user?.photoUrl || null,
          gender: user?.gender || (state.experience === 'women_health' ? 'female' : 'male'),
          age: user?.age || null,
          ageBand: user?.ageBand || null,
          isAgeVerified: user?.isAgeVerified || false,
          provider: user?.profileSource || 'unified_vault_sos',
        },
        locations: {
          homeAddress: {
            name: 'Home Sanctuary',
            addressLine1: 'Main Residency',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
          officeAddress: {
            name: 'Focus Workspace',
            addressLine1: 'Innovation Hub',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
        },
        experience: {
          activeExperience: state.experience,
          experienceConfirmed: state.experienceConfirmed,
          goals: state.onboarding?.goals || [],
          constraints: state.onboarding?.constraints || [],
          worldview: {
            faith: state.worldviewProfile?.ids?.[0] || state.worldviewProfile?.selfDescribed || null,
            dietaryObservances: state.onboarding?.observances || [],
          },
        },
        preferences: {
          themeMode: state.themeMode,
          routineDurationMinutes: state.onboarding?.routineMinutes || 10,
          eatingPreference: state.onboarding?.diet || null,
          quietHoursEnabled: state.quietHoursEnabled,
        },
        health: {
          lastPeriodDate: cycle?.lastPeriodDate || null,
          cycleLengthDays: cycle?.cycleLengthDays || 28,
          periodLengthDays: cycle?.periodLengthDays || 5,
          currentPhase: cycle?.currentPhase || 'follicular',
          estimatedNextPeriodDate: cycle?.estimatedNextPeriodDate || null,
          reproductiveContext: cycle?.reproductiveContext || 'regular',
          periodHistory,
        },
        progression: {
          level: state.level || 1,
          xp: state.xp || 0,
          diamonds: state.diamonds || 0,
          streakDays: state.currentStreak || 0,
          completedQuestsCount: state.questsCompleted || 0,
        },
      },
      null,
      'thrivefold'
    );
  },

  /**
   * Detects which sibling apps are installed on the device.
   */
  async detectInstalledApps(): Promise<Record<string, boolean>> {
    const schemes: Record<string, string> = {
      setu: 'setu://',
      thrivefold: 'thrivefold://',
      harmonybloom: 'harmonybloom://',
      neev: 'neev://',
      blinkquest: 'blinkquest://',
    };

    const status: Record<string, boolean> = {};
    await Promise.all(
      Object.entries(schemes).map(async ([app, scheme]) => {
        try {
          status[app] = await Linking.canOpenURL(scheme).catch(() => false);
        } catch {
          status[app] = false;
        }
      })
    );
    return status;
  },

  /**
   * Hydrates the local Thrivefold root store with incoming unified ecosystem data,
   * non-destructively filling gaps.
   */
  hydrateStoreFromEcosystem(incoming: Partial<UnifiedVaultSosData>): UnifiedVaultSosData {
    const currentLocal = this.buildLocalEcosystemPayload();
    const unified = unifyEcosystemData(currentLocal, incoming, 'thrivefold');
    const rootState = useRootStore.getState();

    // 1. User Profile
    const prevUser = rootState.user;
    const updatedUser: UserProfile = {
      id: unified.identity.userId || prevUser?.id || `tf_${Date.now()}`,
      pseudonym:
        unified.identity.displayName && !isPlaceholderName(unified.identity.displayName)
          ? unified.identity.displayName
          : prevUser?.pseudonym || 'Thrive Member',
      avatarSeed: prevUser?.avatarSeed || 'lotus',
      email: unified.identity.email || prevUser?.email,
      gender: unified.identity.gender || prevUser?.gender || null,
      age: unified.identity.age ?? prevUser?.age ?? null,
      ageBand: unified.identity.ageBand || prevUser?.ageBand || null,
      isAgeVerified: Boolean(unified.identity.isAgeVerified || prevUser?.isAgeVerified),
      photoUrl: unified.identity.photoUrl || prevUser?.photoUrl || null,
      profileSource: 'manual',
      isGuest: false,
      createdAt: prevUser?.createdAt || new Date().toISOString(),
    };

    // 2. Health & Cycle Records
    const prevCycle = rootState.cycleData;
    const convertedPeriodHistory: PeriodLogRecord[] = (unified.health.periodHistory || []).map((p) => ({
      id: p.id || `period_${p.startDate}`,
      startDate: p.startDate,
      endDate: p.endDate,
      flowIntensity: (p.flow as FlowIntensity) || 'medium',
      painLevel: p.painLevel,
      mood: p.mood,
      symptoms: p.symptoms || [],
      notes: p.notes,
      loggedAt: p.startDate,
    }));

    const updatedCycle = {
      ...prevCycle,
      lastPeriodDate: unified.health.lastPeriodDate || prevCycle?.lastPeriodDate || '',
      cycleLengthDays: unified.health.cycleLengthDays || prevCycle?.cycleLengthDays || 28,
      periodLengthDays: unified.health.periodLengthDays || prevCycle?.periodLengthDays || 5,
      currentPhase: (unified.health.currentPhase as any) || prevCycle?.currentPhase || 'follicular',
      estimatedNextPeriodDate:
        unified.health.estimatedNextPeriodDate || prevCycle?.estimatedNextPeriodDate || '',
      reproductiveContext:
        (unified.health.reproductiveContext as any) || prevCycle?.reproductiveContext || 'regular',
      periodHistory:
        convertedPeriodHistory.length > 0
          ? convertedPeriodHistory
          : prevCycle?.periodHistory || [],
    };

    // 3. Experience & Alignment
    let experience = rootState.experience;
    if (unified.identity.gender?.toLowerCase() === 'female' || unified.health.periodHistory?.length) {
      experience = 'women_health';
    } else if (
      unified.experience.activeExperience === 'men_health' ||
      unified.experience.activeExperience === 'women_health' ||
      unified.experience.activeExperience === 'pride_wellbeing'
    ) {
      experience = unified.experience.activeExperience as any;
    }

    useRootStore.setState({
      user: updatedUser,
      isAuthenticated: true,
      experience,
      experienceConfirmed: true,
      cycleData: updatedCycle,
      level: Math.max(rootState.level, unified.progression.level || 1),
      xp: Math.max(rootState.xp, unified.progression.xp || 0),
      diamonds: Math.max(rootState.diamonds, unified.progression.diamonds || 0),
      currentStreak: Math.max(rootState.currentStreak, unified.progression.streakDays || 0),
      questsCompleted: Math.max(rootState.questsCompleted, unified.progression.completedQuestsCount || 0),
      themeMode: unified.preferences.themeMode || rootState.themeMode,
    });

    // Best effort online cloud sync
    void this.syncToSupabase(unified);

    return unified;
  },

  /**
   * Online cloud sync with Supabase backend.
   */
  async syncToSupabase(data: UnifiedVaultSosData): Promise<boolean> {
    try {
      const installed = await this.detectInstalledApps().catch(() => ({}));
      const payload = {
        user_id: data.identity.userId,
        display_name: data.identity.displayName,
        installed_apps: { ...(data.deviceInventory?.installedApps || {}), ...installed, thrivefold: true },
        last_sync_app: 'thrivefold',
        vault_data: data,
        updated_at: new Date().toISOString(),
      };

      if (!SUPABASE_ANON_KEY) return false;

      const response = await fetch(`${SUPABASE_BACKEND_URL}/rest/v1/unified_vault_sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      return Boolean(response?.ok);
    } catch {
      return false;
    }
  },
};

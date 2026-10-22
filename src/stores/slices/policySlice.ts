import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';


export interface SafetyReport {
  id: string;
  targetId: string;
  category: 'harassment' | 'spam' | 'coercive_recruitment' | 'contact_sharing' | 'impersonation';
  evidenceSummary: string;
  createdAt: string;
  status: 'submitted' | 'under_review' | 'resolved';
}

export interface PolicySlice {
  consentedFeatures: string[];
  blockedUserIds: string[];
  safetyReports: SafetyReport[];
  isSocialPathRevealed: boolean;
  grantConsent: (featureId: string) => void;
  revokeConsent: (featureId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  submitReport: (report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => void;
  setSocialPathRevealed: (revealed: boolean) => void;
}

export const createPolicySlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  PolicySlice
> = (set) => ({
  // Consent is only ever given by the person, one feature at a time.
  consentedFeatures: [],
  blockedUserIds: [],
  safetyReports: [],
  // Social features stay out of sight until the gradual-reveal rules offer them.
  isSocialPathRevealed: false,

  grantConsent: (featureId) =>
    set((state) => ({
      consentedFeatures: state.consentedFeatures.includes(featureId)
        ? state.consentedFeatures
        : [...state.consentedFeatures, featureId],
    })),

  revokeConsent: (featureId) =>
    set((state) => ({
      consentedFeatures: state.consentedFeatures.filter((f) => f !== featureId),
    })),

  blockUser: (userId) =>
    set((state) => ({
      blockedUserIds: state.blockedUserIds.includes(userId)
        ? state.blockedUserIds
        : [...state.blockedUserIds, userId],
      // Blocking also ends any pen-pal connection with that person.
      connections: state.connections.filter((c) => c.partnerId !== userId),
    })),

  unblockUser: (userId) =>
    set((state) => ({
      blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
    })),

  submitReport: (report) =>
    set((state) => ({
      safetyReports: [
        {
          ...report,
          id: `rep_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'submitted',
        },
        ...state.safetyReports,
      ],
    })),

  setSocialPathRevealed: (isSocialPathRevealed) => set({ isSocialPathRevealed }),
});

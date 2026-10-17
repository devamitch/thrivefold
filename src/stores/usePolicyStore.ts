import { create } from 'zustand';

export interface SafetyReport {
  id: string;
  targetId: string;
  category: 'harassment' | 'spam' | 'coercive_recruitment' | 'contact_sharing' | 'impersonation';
  evidenceSummary: string;
  createdAt: string;
  status: 'submitted' | 'under_review' | 'resolved';
}

interface PolicyState {
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

export const usePolicyStore = create<PolicyState>((set) => ({
  consentedFeatures: ['restricted_correspondence_trial', 'letters'],
  blockedUserIds: [],
  safetyReports: [],
  isSocialPathRevealed: true, // Enabled for demonstration of progressive feature reveal

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
}));

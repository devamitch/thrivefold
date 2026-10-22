import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';


export interface Letter {
  id: string;
  senderId: string;
  senderPseudonym?: string;
  recipientId: string;
  recipientPseudonym?: string;
  chipIds: string[];
  stampId: string;
  status: 'draft' | 'pending' | 'in_transit' | 'delivered' | 'opened' | 'rejected';
  createdAt: string;
  scheduledDeliveryAt: string;
  deliveredAt?: string;
  openedAt?: string;
  distanceKm: number;
  deliveryHours: number;
}

export interface Connection {
  id: string;
  userId: string;
  partnerId: string;
  partnerPseudonym: string;
  partnerAvatar?: string;
  startedAt: string;
  lastActivityAt: string;
  isActive: boolean;
  letterCount: number;
}

export interface Stamp {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface LetterSlice {
  inbox: Letter[];
  outbox: Letter[];
  drafts: Letter[];
  connections: Connection[];
  stamps: Stamp[];
  unlockedStamps: string[];
  createDraft: (chipIds: string[], stampId: string) => string;
  sendLetter: (letterId: string, recipientId: string) => void;
  acceptConnection: (connectionId: string) => void;
  declineConnection: (connectionId: string) => void;
  unlockStamp: (stampId: string) => void;
}

export const STAMP_CATALOG: Stamp[] = [
  {
    id: 'stamp_rose',
    name: 'Rose Petal',
    imageUrl: 'assets/stamps/rose.png',
    rarity: 'common',
    isUnlocked: true,
  },
  {
    id: 'stamp_wave',
    name: 'Ocean Wave',
    imageUrl: 'assets/stamps/wave.png',
    rarity: 'common',
    isUnlocked: true,
  },
  {
    id: 'stamp_sun',
    name: 'Golden Sun',
    imageUrl: 'assets/stamps/sun.png',
    rarity: 'rare',
    isUnlocked: false,
  },
  {
    id: 'stamp_mountain',
    name: 'Mountain Peak',
    imageUrl: 'assets/stamps/mountain.png',
    rarity: 'rare',
    isUnlocked: false,
  },
  {
    id: 'stamp_constellation',
    name: 'Night Sky',
    imageUrl: 'assets/stamps/constellation.png',
    rarity: 'epic',
    isUnlocked: false,
  },
  {
    id: 'stamp_rainbow',
    name: 'Rainbow Bridge',
    imageUrl: 'assets/stamps/rainbow.png',
    rarity: 'legendary',
    isUnlocked: false,
  },
];

// No letters or pen pals exist until real correspondence happens.

export const createLetterSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  LetterSlice
> = (set) => ({
  inbox: [],
  outbox: [],
  drafts: [],
  connections: [],
  stamps: STAMP_CATALOG,
  unlockedStamps: ['stamp_rose', 'stamp_wave'],

  createDraft: (chipIds, stampId) => {
    const draftId = `draft_${Date.now()}`;
    set((state) => {
      const newDraft = {
        id: draftId,
        senderId: 'me',
        recipientId: '',
        chipIds,
        stampId,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        scheduledDeliveryAt: '',
        distanceKm: 0,
        deliveryHours: 0,
      };
      return {
        drafts: [newDraft, ...state.drafts],
      };
    });
    return draftId;
  },

  sendLetter: (letterId, recipientId) =>
    set((state) => ({
      drafts: state.drafts.filter((l) => l.id !== letterId),
      outbox: [
        {
          ...state.drafts.find((l) => l.id === letterId)!,
          id: letterId,
          recipientId,
          status: 'pending',
          scheduledDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        ...state.outbox,
      ],
    })),

  acceptConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId ? { ...c, isActive: true } : c
      ),
    })),

  declineConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
    })),

  unlockStamp: (stampId) =>
    set((state) => {
      if (state.unlockedStamps.includes(stampId)) return state;
      return {
        unlockedStamps: [...state.unlockedStamps, stampId],
        stamps: state.stamps.map((s) =>
          s.id === stampId ? { ...s, isUnlocked: true, unlockedAt: new Date().toISOString() } : s
        ),
      };
    }),
});

import { create } from 'zustand';

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

export interface LetterStore {
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
  blockUser: (userId: string) => void;
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

export const useLetterStore = create<LetterStore>((set) => ({
  inbox: [
    {
      id: 'letter_in_1',
      senderId: 'user_123',
      recipientId: 'me',
      chipIds: ['intro_1', 'interest_1'],
      stampId: 'stamp_rose',
      status: 'delivered',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      scheduledDeliveryAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      distanceKm: 850,
      deliveryHours: 8,
    },
    {
      id: 'letter_in_2',
      senderId: 'user_456',
      recipientId: 'me',
      chipIds: ['intro_2', 'checkin_1'],
      stampId: 'stamp_wave',
      status: 'in_transit',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      scheduledDeliveryAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      distanceKm: 1200,
      deliveryHours: 12,
    },
  ],
  outbox: [
    {
      id: 'letter_out_1',
      senderId: 'me',
      recipientId: 'user_123',
      chipIds: ['intro_1', 'appreciate_1'],
      stampId: 'stamp_rose',
      status: 'opened',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      scheduledDeliveryAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      distanceKm: 850,
      deliveryHours: 8,
    },
  ],
  drafts: [],
  connections: [
    {
      id: 'conn_1',
      userId: 'me',
      partnerId: 'user_123',
      partnerPseudonym: 'BookLover42',
      partnerAvatar: 'assets/avatars/book.png',
      startedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      letterCount: 4,
    },
  ],
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

  blockUser: (userId) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.partnerId !== userId),
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
}));

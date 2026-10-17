export type LetterDeliveryStatus =
  | 'draft'
  | 'scheduled'
  | 'in_transit'
  | 'delivered'
  | 'opened'
  | 'declined'
  | 'cancelled_due_to_block';

export interface Stamp {
  id: string;
  name: string;
  category: 'foundational' | 'seasonal' | 'milestone' | 'cultural';
  icon: string;
  color: string;
  description: string;
  unlocked: boolean;
}

export interface CorrespondentProfile {
  opaqueId: string;
  pseudonym: string;
  avatarSeed: string;
  approximateRegion: string; // Coarse location only e.g. "Northern Hemisphere / Region 4"
  languages: string[];
  interests: string[];
  bioTemplate: string;
  distanceKmApprox: number;
}

export interface Letter {
  id: string;
  senderId: string;
  senderPseudonym: string;
  recipientId: string;
  recipientPseudonym: string;
  stampId: string;
  chipIds: string[];
  assembledBody: string;
  status: LetterDeliveryStatus;
  sentAt: string;
  scheduledDeliveryAt: string;
  deliveredAt?: string;
  openedAt?: string;
  distanceKmApprox: number;
  transitHoursEstimated: number;
}

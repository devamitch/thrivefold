/**
 * When to invite someone to the social side (slow letters, groups). Health-first: never at
 * first launch, never to guests, only after two separate days of check-ins, and never again
 * once dismissed. This only decides whether to *offer*; the person chooses, and the age check
 * and server rules still decide what they can actually use.
 */
export const SOCIAL_INVITE_AFTER_DAYS = 2;

export function shouldOfferSocialPath(s: {
  signedIn: boolean;
  revealed: boolean;
  dismissedAt: string | null;
  checkInDays: number;
}): boolean {
  return s.signedIn && !s.revealed && !s.dismissedAt && s.checkInDays >= SOCIAL_INVITE_AFTER_DAYS;
}

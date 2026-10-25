import { shouldOfferSocialPath } from '../../src/domain/policy/socialReveal';

const base = { signedIn: true, revealed: false, dismissedAt: null, checkInDays: 2 };

describe('social path invitation', () => {
  it('is offered after two check-in days to a signed-in person', () => {
    expect(shouldOfferSocialPath(base)).toBe(true);
  });
  it('is never offered on the first day', () => {
    expect(shouldOfferSocialPath({ ...base, checkInDays: 1 })).toBe(false);
  });
  it('is never offered to guests', () => {
    expect(shouldOfferSocialPath({ ...base, signedIn: false })).toBe(false);
  });
  it('is not repeated once dismissed or accepted', () => {
    expect(shouldOfferSocialPath({ ...base, dismissedAt: '2026-10-25T10:00:00Z' })).toBe(false);
    expect(shouldOfferSocialPath({ ...base, revealed: true })).toBe(false);
  });
});

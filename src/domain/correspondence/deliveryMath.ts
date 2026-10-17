/**
 * Distance-delayed delivery formula
 * Calculates delivery hours based on geographic distance
 * Formula: min(72, max(4, round(DistanceKm / 120)))
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DeliveryEstimate {
  hours: number;
  estimatedDeliveryDate: Date;
  isExpedited: boolean;
}

/**
 * Calculate delivery hours based on distance in kilometers
 * @param distanceKm Distance between sender and recipient in kilometers
 * @returns Number of hours for delivery (4-72 hours)
 */
export function calculateDeliveryHours(distanceKm: number): number {
  const baseDelay = Math.round(distanceKm / 120);
  const minDelay = 4;
  const maxDelay = 72;
  return Math.min(maxDelay, Math.max(minDelay, baseDelay));
}

/**
 * Calculate delivery estimate with date
 * @param senderLocation Sender's coordinates
 * @param recipientLocation Recipient's coordinates
 * @returns Delivery estimate with hours and estimated date
 */
export function calculateDeliveryEstimate(
  senderLocation: Location,
  recipientLocation: Location,
): DeliveryEstimate {
  const distanceKm = calculateDistance(senderLocation, recipientLocation);
  const hours = calculateDeliveryHours(distanceKm);
  const estimatedDeliveryDate = new Date(Date.now() + hours * 60 * 60 * 1000);

  return {
    hours,
    estimatedDeliveryDate,
    isExpedited: hours <= 12, // Consider 12 hours or less as expedited
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param loc1 First location
 * @param loc2 Second location
 * @returns Distance in kilometers
 */
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) *
      Math.cos(toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get delivery status text
 * @param hours Delivery hours
 * @returns Human-readable status
 */
export function getDeliveryStatusText(hours: number): string {
  if (hours <= 4) return 'Very Soon (4 hours)';
  if (hours <= 12) return 'Today (within 12 hours)';
  if (hours <= 24) return 'Tomorrow (within 24 hours)';
  if (hours <= 48) return 'In 1-2 days';
  return 'In 2-3 days';
}

/**
 * Check if delivery can be expedited
 * @param hours Current delivery hours
 * @returns Whether expedited delivery is available
 */
export function canExpediteDelivery(hours: number): boolean {
  return hours > 4; // Can't expedite if already at minimum
}

/**
 * Calculate expedited delivery hours
 * @param currentHours Current delivery hours
 * @returns Expedited hours (minimum 4)
 */
export function calculateExpeditedHours(currentHours: number): number {
  return Math.max(4, Math.round(currentHours / 2));
}

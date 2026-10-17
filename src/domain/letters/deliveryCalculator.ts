/**
 * Distance-aware letter delivery calculation inspired by Slowly
 * Computes calm, delayed transit hours based on approximate geographic distances.
 */
export function calculateDeliveryHours(distanceKm: number): number {
  if (distanceKm <= 200) {
    return 1; // 1 hour for local area
  }
  if (distanceKm <= 1000) {
    return 3; // 3 hours regional
  }
  if (distanceKm <= 3500) {
    return 8; // 8 hours continental
  }
  if (distanceKm <= 8000) {
    return 16; // 16 hours cross-continent
  }
  return 24; // 24 hours global
}

export function computeScheduledDeliveryTime(sentDate: Date, distanceKm: number): Date {
  const hours = calculateDeliveryHours(distanceKm);
  const deliveryTime = new Date(sentDate.getTime() + hours * 60 * 60 * 1000);
  return deliveryTime;
}

export function formatTimeRemaining(targetDate: Date): string {
  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) return 'Arrived';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

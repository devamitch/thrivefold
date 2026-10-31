/**
 * Emergency Location & Jurisdiction Resolver
 *
 * Implements authoritative location determination for safety services:
 * 1. User's explicit country override
 * 2. Device GPS Location via expo-location (with explicit user consent)
 * 3. User's saved home/kosh profile country hint
 * 4. Device system locale / timezone hint
 * 5. Fallback with country selector
 *
 * Also provides nearby emergency facility discovery (Hospitals, ER, Urgent Care)
 * with one-tap native directions and dialer actions.
 */

import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { Linking, Platform } from 'react-native';
import {
  getEmergencyContactsForCountry,
  getPrimaryEmergencyContact,
  getPrimaryMentalHealthContact,
  SUPPORTED_COUNTRIES,
  type EmergencyServiceContact,
  type SupportedCountryMeta,
} from '../ai/emergencyDirectory';

export interface ResolvedJurisdiction {
  countryCode: string;
  countryName: string;
  flag: string;
  source: 'explicit' | 'gps' | 'profile' | 'device_locale' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
  primaryEmergency: EmergencyServiceContact;
  primaryMentalHealth: EmergencyServiceContact;
  allContacts: EmergencyServiceContact[];
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'emergency_room' | 'urgent_care' | 'crisis_center';
  distanceKm?: number;
  address?: string;
  phone?: string;
  lat: number;
  lon: number;
  open247: boolean;
  actionDirectionsUrl: string;
  actionDialUrl?: string;
}

// In-memory cache for user's explicit country selection during session
let explicitUserCountry: string | null = null;

export function setExplicitUserCountry(code: string | null): void {
  explicitUserCountry = code ? code.toUpperCase() : null;
}

export function getExplicitUserCountry(): string | null {
  return explicitUserCountry;
}

/**
 * Extracts ISO-2 country code from expo-localization, device locale, or timezone.
 */
function inferCountryFromLocale(): string {
  try {
    const locales = Localization.getLocales();
    const region = locales?.[0]?.regionCode;
    if (region && /^[A-Z]{2}$/i.test(region)) {
      return region.toUpperCase();
    }

    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const parts = locale.split(/[-_]/);
    if (parts.length > 1) {
      const reg = parts[parts.length - 1].toUpperCase();
      if (/^[A-Z]{2}$/.test(reg)) {
        return reg;
      }
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) return 'IN';
    if (timeZone.includes('New_York') || timeZone.includes('Chicago') || timeZone.includes('Los_Angeles') || timeZone.includes('Denver')) return 'US';
    if (timeZone.includes('London')) return 'GB';
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver')) return 'CA';
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Perth')) return 'AU';
    if (timeZone.includes('Auckland')) return 'NZ';
  } catch {
    // Ignore and fallback
  }
  return 'IN';
}

/**
 * Resolves current jurisdiction with strict priority.
 */
export async function resolveEmergencyJurisdiction(profileCountryHint?: string | null): Promise<ResolvedJurisdiction> {
  // 1. Explicit user country selection
  if (explicitUserCountry) {
    const meta = SUPPORTED_COUNTRIES.find((c) => c.code === explicitUserCountry) || {
      code: explicitUserCountry,
      name: explicitUserCountry,
      flag: '📍',
      defaultEmergency: '112',
      defaultMentalHealth: '112',
    };
    return {
      countryCode: meta.code,
      countryName: meta.name,
      flag: meta.flag,
      source: 'explicit',
      confidence: 'high',
      primaryEmergency: getPrimaryEmergencyContact(meta.code),
      primaryMentalHealth: getPrimaryMentalHealthContact(meta.code),
      allContacts: getEmergencyContactsForCountry(meta.code),
    };
  }

  // 2. Device GPS Location (Check permission non-intrusively first)
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      const position = await Location.getLastKnownPositionAsync();
      const coords = position?.coords ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null))?.coords;

      if (coords) {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }).catch(() => null);

        const geoCountry = reverse?.[0]?.isoCountryCode?.toUpperCase();
        if (geoCountry) {
          const meta = SUPPORTED_COUNTRIES.find((c) => c.code === geoCountry) || {
            code: geoCountry,
            name: reverse?.[0]?.country || geoCountry,
            flag: '📍',
            defaultEmergency: '112',
            defaultMentalHealth: '112',
          };
          return {
            countryCode: meta.code,
            countryName: meta.name,
            flag: meta.flag,
            source: 'gps',
            confidence: 'high',
            primaryEmergency: getPrimaryEmergencyContact(meta.code),
            primaryMentalHealth: getPrimaryMentalHealthContact(meta.code),
            allContacts: getEmergencyContactsForCountry(meta.code),
          };
        }
      }
    }
  } catch {
    // Location check skipped gracefully
  }

  // 3. Profile Country Hint
  if (profileCountryHint && profileCountryHint.trim().length === 2) {
    const pCode = profileCountryHint.trim().toUpperCase();
    const meta = SUPPORTED_COUNTRIES.find((c) => c.code === pCode);
    if (meta) {
      return {
        countryCode: meta.code,
        countryName: meta.name,
        flag: meta.flag,
        source: 'profile',
        confidence: 'medium',
        primaryEmergency: getPrimaryEmergencyContact(meta.code),
        primaryMentalHealth: getPrimaryMentalHealthContact(meta.code),
        allContacts: getEmergencyContactsForCountry(meta.code),
      };
    }
  }

  // 4. Device Locale
  const localeCountry = inferCountryFromLocale();
  const localeMeta = SUPPORTED_COUNTRIES.find((c) => c.code === localeCountry) || SUPPORTED_COUNTRIES[0];
  return {
    countryCode: localeMeta.code,
    countryName: localeMeta.name,
    flag: localeMeta.flag,
    source: 'device_locale',
    confidence: 'low',
    primaryEmergency: getPrimaryEmergencyContact(localeMeta.code),
    primaryMentalHealth: getPrimaryMentalHealthContact(localeMeta.code),
    allContacts: getEmergencyContactsForCountry(localeMeta.code),
  };
}

/**
 * Request device location permissions explicitly for finding nearby emergency care.
 */
export async function requestLocationForEmergencyCare(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Creates native map navigation URL for a coordinate or query.
 */
export function createMapNavigationUrl(lat: number, lon: number, label: string): string {
  const encLabel = encodeURIComponent(label);
  if (Platform.OS === 'ios') {
    return `maps:0,0?q=${encLabel}&ll=${lat},${lon}`;
  }
  return `geo:${lat},${lon}?q=${lat},${lon}(${encLabel})`;
}

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula.
 */
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Discover nearby emergency facilities (Hospital / ER) based on GPS coordinates.
 * Queries Overpass API with local timeout, falling back to Google Maps search or curated points.
 */
export async function findNearbyEmergencyCare(lat: number, lon: number): Promise<EmergencyFacility[]> {
  try {
    // 5 km bounding box search via OpenStreetMap Overpass
    const query = `
      [out:json][timeout:8];
      (
        node["amenity"="hospital"](around:7000,${lat},${lon});
        node["emergency"="yes"](around:7000,${lat},${lon});
        way["amenity"="hospital"](around:7000,${lat},${lon});
      );
      out center 8;
    `;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const elements: any[] = json.elements || [];
      if (elements.length > 0) {
        return elements
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            const name = el.tags?.name || el.tags?.['name:en'] || 'Emergency Medical Center';
            const phone = el.tags?.phone || el.tags?.['contact:phone'];
            const dist = elLat && elLon ? calculateHaversineKm(lat, lon, elLat, elLon) : undefined;
            return {
              id: `facility_${el.id}`,
              name,
              type: 'hospital' as const,
              distanceKm: dist,
              address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || undefined,
              phone,
              lat: elLat,
              lon: elLon,
              open247: el.tags?.opening_hours === '24/7',
              actionDirectionsUrl: createMapNavigationUrl(elLat, elLon, name),
              actionDialUrl: phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : undefined,
            };
          })
          .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
          .slice(0, 6);
      }
    }
  } catch {
    // Fallback to direct maps query
  }

  // Graceful fallback: Provides direct action links to open native maps for "hospital emergency"
  return [
    {
      id: 'maps_fallback_hospitals',
      name: 'Nearest Hospital Emergency Department',
      type: 'hospital',
      lat,
      lon,
      open247: true,
      actionDirectionsUrl:
        Platform.OS === 'ios'
          ? `http://maps.apple.com/?q=Hospital+Emergency+Room&sll=${lat},${lon}`
          : `https://www.google.com/maps/search/hospital+emergency+room/@${lat},${lon},14z`,
    },
    {
      id: 'maps_fallback_urgent_care',
      name: 'Nearby Urgent Medical Care Clinic',
      type: 'urgent_care',
      lat,
      lon,
      open247: false,
      actionDirectionsUrl:
        Platform.OS === 'ios'
          ? `http://maps.apple.com/?q=Urgent+Care&sll=${lat},${lon}`
          : `https://www.google.com/maps/search/urgent+care/@${lat},${lon},14z`,
    },
  ];
}

/**
 * Open external URL safely (tel, sms, or web maps).
 */
export async function openEmergencyUrl(url: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

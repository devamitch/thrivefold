/**
 * Firebase Analytics & Crash Diagnostics Integration for Thrivefold
 *
 * Configured via environment variables:
 * - EXPO_PUBLIC_FIREBASE_PROJECT_ID
 * - EXPO_PUBLIC_FIREBASE_APP_ID
 *
 * Architecture:
 * 1. Offline-First: All events are queued in SQLite (sqliteAnalyticsStore) first.
 * 2. Privacy-Safe: Never sends sensitive personal health data, religious tradition, or personal notes.
 * 3. Batched Network Sync: Periodically flushes events to Firebase endpoint without blocking UI.
 * 4. Dual-Mode: Dynamically uses @react-native-firebase/analytics when available in native builds,
 *    and gracefully falls back to the official Measurement Protocol HTTP API with SQLite caching.
 */

import { Platform } from 'react-native';
import { enqueueTelemetryEvent } from './sqliteAnalyticsStore';

export interface FirebaseEventParams {
  [key: string]: string | number | boolean | undefined;
}

const FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '';
const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '';
const MEASUREMENT_PROTOCOL_URL = 'https://www.google-analytics.com/mp/collect';

class FirebaseAnalyticsManager {
  private clientId: string = `cid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  private userProperties: Record<string, string> = {
    app_version: '1.0.0',
    platform: Platform.OS,
  };

  /**
   * Log standard screen view to Firebase Analytics
   */
  async logScreenView(screenName: string, screenClass = 'HomeScreen'): Promise<void> {
    const sanitizedScreen = screenName.replace(/[^a-zA-Z0-9_/]/g, '_').slice(0, 100);

    // 1. Enqueue to local SQLite database first
    enqueueTelemetryEvent({
      id: `scr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'screen_view',
      timestamp: new Date().toISOString(),
      screen: sanitizedScreen,
      metadata: { screen_class: screenClass },
    });

    // 2. Dispatch to Native Modular SDK
    try {
      const analyticsModule = require('@react-native-firebase/analytics');
      if (analyticsModule.logScreenView && analyticsModule.getAnalytics) {
        await analyticsModule.logScreenView(analyticsModule.getAnalytics(), {
          screen_name: sanitizedScreen,
          screen_class: screenClass,
        });
        return;
      }
    } catch {}

    // 3. Fallback to sendFirebaseEvent
    await this.sendFirebaseEvent('screen_view', {
      firebase_screen: sanitizedScreen,
      firebase_screen_class: screenClass,
    });
  }

  /**
   * Log custom or predefined Firebase event
   */
  async logEvent(eventName: string, params: FirebaseEventParams = {}): Promise<void> {
    const validName = eventName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);

    // Sanitize parameters: remove any sensitive health values, strings capped to 100 chars
    const sanitizedParams: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null) continue;
      // Strip potential sensitive health keys
      if (['notes', 'symptoms', 'period_date', 'faith', 'religion', 'diet_strict'].includes(key)) {
        continue;
      }
      sanitizedParams[key.slice(0, 40)] = typeof val === 'string' ? val.slice(0, 100) : val;
    }

    // Record in local SQLite storage
    enqueueTelemetryEvent({
      id: `fbe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'button_click',
      timestamp: new Date().toISOString(),
      screen: String(sanitizedParams.screen ?? 'app'),
      targetId: validName,
      metadata: sanitizedParams,
    });

    // Send to Firebase
    await this.sendFirebaseEvent(validName, sanitizedParams);
  }

  /**
   * Log gamification milestones (quest completed, level up, reward claimed)
   */
  async logGamification(questId: string, action: string, points?: number): Promise<void> {
    await this.logEvent('gamification_progress', {
      quest_id: questId,
      action,
      points: points ?? 0,
    });
  }

  /**
   * Log crash or exception event for Firebase Crashlytics & Analytics
   */
  async logCrash(error: Error | string, isFatal = false, context?: Record<string, unknown>): Promise<void> {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    enqueueTelemetryEvent({
      id: `crsh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'crash_error',
      timestamp: new Date().toISOString(),
      screen: 'global',
      metadata: {
        message: message.slice(0, 200),
        fatal: isFatal,
        stack: stack?.slice(0, 500),
        ...context,
      },
    });

    await this.sendFirebaseEvent('app_exception', {
      fatal: isFatal,
      description: message.slice(0, 100),
    });

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[Firebase Crashlytics] ${isFatal ? 'FATAL' : 'NON-FATAL'}: ${message}`);
    }
  }

  /**
   * Set user properties (e.g. experience mode, theme)
   */
  setUserProperty(name: string, value: string): void {
    if (['faith', 'religion', 'caste', 'medical', 'period'].includes(name.toLowerCase())) {
      return; // Never profile sensitive categories
    }
    const cleanName = name.slice(0, 24);
    const cleanValue = value.slice(0, 36);
    this.userProperties[cleanName] = cleanValue;

    try {
      const analyticsModule = require('@react-native-firebase/analytics');
      if (analyticsModule.setUserProperty && analyticsModule.getAnalytics) {
        analyticsModule.setUserProperty(analyticsModule.getAnalytics(), cleanName, cleanValue);
      }
    } catch {}
  }

  /**
   * Enable or disable analytics collection
   */
  async setCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      const analyticsModule = require('@react-native-firebase/analytics');
      if (analyticsModule.setAnalyticsCollectionEnabled && analyticsModule.getAnalytics) {
        await analyticsModule.setAnalyticsCollectionEnabled(analyticsModule.getAnalytics(), enabled);
      }
    } catch {}
  }

  /**
   * Update consent status for analytics storage
   */
  async setConsent(consentSettings: {
    analytics_storage?: boolean;
    ad_storage?: boolean;
    ad_user_data?: boolean;
    ad_personalization?: boolean;
  }): Promise<void> {
    try {
      const analyticsModule = require('@react-native-firebase/analytics');
      if (analyticsModule.setConsent && analyticsModule.getAnalytics) {
        await analyticsModule.setConsent(analyticsModule.getAnalytics(), consentSettings);
      }
    } catch {}
  }

  private async sendFirebaseEvent(name: string, params: Record<string, unknown>): Promise<void> {
    // 1. Try modular @react-native-firebase/analytics API first
    try {
      const analyticsModule = require('@react-native-firebase/analytics');
      if (analyticsModule.logEvent && analyticsModule.getAnalytics) {
        await analyticsModule.logEvent(analyticsModule.getAnalytics(), name, params as Record<string, string | number | boolean>);
        return;
      }
      if (analyticsModule.default) {
        await analyticsModule.default().logEvent(name, params);
        return;
      }
    } catch {
      // Fallback to Measurement Protocol HTTP dispatch
    }

    // 2. HTTP Measurement Protocol fallback (offline-friendly)
    try {
      if (!FIREBASE_APP_ID) return;

      const body = {
        app_instance_id: this.clientId,
        user_properties: this.userProperties,
        events: [
          {
            name,
            params: {
              ...params,
              engagement_time_msec: 100,
            },
          },
        ],
      };

      fetch(`${MEASUREMENT_PROTOCOL_URL}?firebase_app_id=${FIREBASE_APP_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => undefined);
    } catch {
      // safe fallback
    }
  }
}

export const firebaseAnalytics = new FirebaseAnalyticsManager();

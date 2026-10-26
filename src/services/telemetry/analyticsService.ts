/**
 * Production Telemetry, Analytics, Micro-Event & Crash Diagnostics Service
 *
 * Capabilities:
 * 1. Micro-touch and interaction logging (taps, gestures, scroll offsets)
 * 2. Navigation history & exact screen state persistence for recovery on forceful app close
 * 3. Gamification journey tracking (quest clicks, completions, streaks, XP milestones)
 * 4. App lifecycle monitoring (foreground, background, exit confirmations)
 * 5. Crash reporting facade (Google Crashlytics / Analytics integration ready + local fallback)
 * 6. Privacy preserving: Zero sensitive health/faith inference transmission
 */

import { AppState, type AppStateStatus } from 'react-native';
import { useRootStore } from '../../stores/useRootStore';

export type MicroEventType =
  | 'touch_tap'
  | 'touch_long_press'
  | 'swipe_gesture'
  | 'scroll_offset'
  | 'button_click'
  | 'gamification_click'
  | 'screen_view'
  | 'app_foreground'
  | 'app_background'
  | 'crash_error';

export interface TelemetryEvent {
  id: string;
  type: MicroEventType;
  timestamp: string;
  screen: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

let eventSeq = 0;
function createTelemetryId(prefix: string): string {
  eventSeq = (eventSeq + 1) % 1_000_000;
  return `${prefix}_${Date.now()}_${eventSeq}`;
}

class AnalyticsService {
  private inMemoryEvents: TelemetryEvent[] = [];
  private maxEvents = 100;

  /**
   * Log an interactive micro-touch event
   */
  logTouch(
    targetId: string,
    screen: string,
    interactionType: 'tap' | 'long_press' | 'swipe' = 'tap',
    metadata?: Record<string, unknown>,
  ) {
    const event: TelemetryEvent = {
      id: createTelemetryId('evt'),
      type: interactionType === 'swipe' ? 'swipe_gesture' : 'touch_tap',
      timestamp: new Date().toISOString(),
      screen,
      targetId,
      metadata,
    };
    this.recordEvent(event);
  }

  /**
   * Log user navigation transition and persist for forceful restart recovery
   */
  logNavigation(toRoute: string, params?: Record<string, string>) {
    const event: TelemetryEvent = {
      id: createTelemetryId('nav'),
      type: 'screen_view',
      timestamp: new Date().toISOString(),
      screen: toRoute,
      metadata: params,
    };
    this.recordEvent(event);

    try {
      useRootStore.getState().recordNavigation(toRoute);
      if (params) {
        useRootStore.getState().setLastActiveRoute(toRoute, params);
      }
    } catch {
      // Store not yet ready or in test environment
    }

    try {
      const { smartAggregations } = require('./smartAggregations');
      smartAggregations.trackMoment('nav_moment', { screen: toRoute, metrics: params });
    } catch {}
  }

  /**
   * Log scroll position offset for screen position restoration
   */
  logScrollPosition(screenKey: string, offsetY: number) {
    try {
      useRootStore.getState().setLastScrollPosition(screenKey, Math.round(offsetY));
    } catch {
      // safe fallback
    }
  }

  /**
   * Log gamification engagement (quests, exercises, games, leveling)
   */
  logGamification(
    questId: string,
    action: 'viewed' | 'started' | 'completed' | 'skipped' | 'claimed',
    metrics?: { xp?: number; diamonds?: number; category?: string },
  ) {
    const event: TelemetryEvent = {
      id: createTelemetryId('game'),
      type: 'gamification_click',
      timestamp: new Date().toISOString(),
      screen: 'gamification',
      targetId: questId,
      metadata: { action, ...metrics },
    };
    this.recordEvent(event);

    try {
      const { smartAggregations } = require('./smartAggregations');
      smartAggregations.trackQuestMoment({
        questId,
        action: action === 'started' || action === 'completed' || action === 'claimed' ? action : 'started',
        xp: metrics?.xp ?? 0,
        diamonds: metrics?.diamonds,
        category: metrics?.category,
      });
    } catch {}
  }

  /**
   * Log App lifecycle changes (active, background, inactive)
   */
  logLifecycle(status: AppStateStatus) {
    const event: TelemetryEvent = {
      id: createTelemetryId('life'),
      type: status === 'active' ? 'app_foreground' : 'app_background',
      timestamp: new Date().toISOString(),
      screen: 'app',
      metadata: { status },
    };
    this.recordEvent(event);

    try {
      const mapped =
        status === 'active' ? 'active' : status === 'background' ? 'background' : 'inactive';
      useRootStore.getState().recordAppStateChange(mapped);
    } catch {
      // safe fallback
    }

    try {
      const { smartAggregations } = require('./smartAggregations');
      smartAggregations.trackMoment('app_session', { screen: 'app', metrics: { status } });
    } catch {}
  }

  /**
   * Log non-fatal error or fatal crash event (Google Crashlytics / local diagnostics)
   */
  logCrash(error: Error | string, fatal = false, context?: Record<string, unknown>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    const event: TelemetryEvent = {
      id: createTelemetryId('err'),
      type: 'crash_error',
      timestamp: new Date().toISOString(),
      screen: 'global',
      metadata: {
        fatal,
        message: errorMessage,
        stack: stack?.slice(0, 500),
        ...context,
      },
    };
    this.recordEvent(event);

    // Also persist into root store audit log for user transparency and export
    try {
      useRootStore.getState()?.audit?.('sync_read', 'local_data', `Exception: ${errorMessage.slice(0, 100)}`);
    } catch {
      // safe fallback
    }

    if (__DEV__) {
      console.warn(`[Telemetry Crashlytics] ${fatal ? 'FATAL' : 'NON-FATAL'}: ${errorMessage}`);
    }
  }

  /**
   * Retrieve recent in-memory telemetry buffer
   */
  getRecentEvents(): TelemetryEvent[] {
    return [...this.inMemoryEvents];
  }

  private recordEvent(event: TelemetryEvent) {
    this.inMemoryEvents.push(event);
    if (this.inMemoryEvents.length > this.maxEvents) {
      this.inMemoryEvents.shift();
    }
    // Offload to SQLite asynchronously to avoid MMKV overhead
    try {
      const { enqueueTelemetryEvent } = require('./sqliteAnalyticsStore');
      enqueueTelemetryEvent(event);
    } catch {
      // safe fallback if sqlite not available
    }
  }
}

export const analytics = new AnalyticsService();

// Register global AppState lifecycle listener
if (typeof AppState?.addEventListener === 'function') {
  AppState.addEventListener('change', (nextAppState) => {
    analytics.logLifecycle(nextAppState);
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      try {
        const { flushTelemetryQueue } = require('./sqliteAnalyticsStore');
        flushTelemetryQueue();
      } catch {}
    }
  });
}

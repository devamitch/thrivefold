import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import { mergeReadings, type DeviceReading } from '../../domain/interop/readings';

export type IntegrationSource = 'health_connect' | 'ble_heart_rate' | 'pose_camera' | 'fhir_export' | 'json_export' | 'local_data' | 'meal_photo_ai';

/** A consent decision for one source and the data types it covers. Kept even after revoke. */
export interface ConsentRecord {
  id: string;
  source: IntegrationSource;
  scopes: string[];
  decision: 'granted' | 'revoked';
  at: string;
}

/** Who did what with health data on this device, for the person to review. */
export interface AuditEvent {
  id: string;
  at: string;
  action:
    | 'consent_granted'
    | 'consent_revoked'
    | 'sync_read'
    | 'sync_write'
    | 'device_connected'
    | 'device_disconnected'
    | 'export_fhir'
    | 'export_json'
    | 'data_erased';
  source: IntegrationSource;
  detail: string;
}

export interface IntegrationSlice {
  healthConnect: { scopes: string[]; connectedAt: string; lastSyncAt: string | null } | null;
  bleDevice: { id: string; name: string; connectedAt: string } | null;
  deviceReadings: DeviceReading[];
  consentRecords: ConsentRecord[];
  auditLog: AuditEvent[];
  recordConsent: (source: IntegrationSource, scopes: string[], decision: ConsentRecord['decision']) => void;
  audit: (action: AuditEvent['action'], source: IntegrationSource, detail: string) => void;
  setHealthConnect: (value: IntegrationSlice['healthConnect']) => void;
  setBleDevice: (value: IntegrationSlice['bleDevice']) => void;
  importReadings: (readings: DeviceReading[]) => void;
  removeReadings: (source: DeviceReading['source']) => void;
}

const id = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const createIntegrationSlice: StateCreator<RootState, [['zustand/persist', unknown]], [], IntegrationSlice> = (set) => ({
  healthConnect: null,
  bleDevice: null,
  deviceReadings: [],
  consentRecords: [],
  auditLog: [],

  recordConsent: (source, scopes, decision) =>
    set((s) => {
      const action: AuditEvent['action'] = decision === 'granted' ? 'consent_granted' : 'consent_revoked';
      const detail = scopes.join(', ') || 'all';

      // Offload to SQLite for long-term durable storage
      try {
        const { enqueueTelemetryEvent } = require('../../services/telemetry/sqliteAnalyticsStore');
        enqueueTelemetryEvent({
          id: id('audit'),
          type: 'button_click',
          timestamp: new Date().toISOString(),
          screen: 'system',
          targetId: String(action),
          metadata: { source, detail, decision },
        });
      } catch {}

      return {
        consentRecords: [{ id: id('consent'), source, scopes, decision, at: new Date().toISOString() }, ...s.consentRecords].slice(0, 50),
        auditLog: [
          {
            id: id('audit'),
            at: new Date().toISOString(),
            action,
            source,
            detail,
          },
          ...s.auditLog,
        ].slice(0, 50),
      };
    }),

  audit: (action, source, detail) =>
    set((s) => {
      try {
        const { enqueueTelemetryEvent } = require('../../services/telemetry/sqliteAnalyticsStore');
        enqueueTelemetryEvent({
          id: id('audit'),
          type: 'button_click',
          timestamp: new Date().toISOString(),
          screen: 'system',
          targetId: String(action),
          metadata: { source, detail },
        });
      } catch {}

      return {
        auditLog: [{ id: id('audit'), at: new Date().toISOString(), action, source, detail }, ...s.auditLog].slice(0, 50),
      };
    }),

  setHealthConnect: (healthConnect) => set({ healthConnect }),
  setBleDevice: (bleDevice) => set({ bleDevice }),
  importReadings: (readings) => set((s) => ({ deviceReadings: mergeReadings(s.deviceReadings, readings) })),
  removeReadings: (source) => set((s) => ({ deviceReadings: s.deviceReadings.filter((r) => r.source !== source) })),
});

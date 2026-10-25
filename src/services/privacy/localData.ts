/**
 * The person's own data on this device (REQ-008): export everything as JSON,
 * or export as an Excel/CSV spreadsheet format, or erase everything.
 * Health records are local-first, so these are the authoritative copies.
 */
import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { wipeLocalData } from '../../stores/persistStorage';
import { wipeSummaryOutbox } from '../sync/summaryOutbox';
import { useRootStore } from '../../stores/useRootStore';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';

export function buildLocalExport(): string {
  const state = useRootStore.getState();
  const data = Object.fromEntries(
    Object.entries(state).filter(([key, value]) => typeof value !== 'function' && key !== 'toasts'),
  );
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), format: 'thrivefold-local-export/v2', data },
    null,
    2,
  );
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a comprehensive, multi-table CSV spreadsheet compatible with Excel, Numbers, and Google Sheets.
 */
export function buildCsvSpreadsheetExport(): string {
  const state = useRootStore.getState();
  const lines: string[] = [];

  // Metadata header
  lines.push('=== THRIVEFOLD COMPLETE PERSONAL DATA EXPORT ===');
  lines.push(`Exported At,${escapeCsv(new Date().toISOString())}`);
  lines.push(`Format,Excel/CSV Multi-Table Specification v2`);
  lines.push('');

  // 1. Check-in History
  lines.push('--- DAILY CHECK-INS & MOOD LOGS ---');
  lines.push('Date,Mood (1-10),Energy (1-10),Stress (1-10),Sleep Hours,Intensity,Notes');
  for (const c of state.checkInHistory ?? []) {
    lines.push(
      [
        escapeCsv(c.date),
        escapeCsv(c.mood ?? ''),
        escapeCsv(c.energy ?? ''),
        escapeCsv(c.stress ?? ''),
        escapeCsv(c.sleepHours ?? ''),
        escapeCsv(c.intensity ?? ''),
        escapeCsv(c.notes ?? ''),
      ].join(','),
    );
  }
  lines.push('');

  // 2. Workout Sessions
  lines.push('--- WORKOUT & MOVEMENT SESSIONS ---');
  lines.push('Date,Plan ID,Started At,Finished At,Verification,Sets Logged');
  for (const w of state.workoutSessions ?? []) {
    const setCount = w.entries?.reduce((sum, e) => sum + (e.sets?.length ?? 0), 0) ?? 0;
    lines.push(
      [
        escapeCsv(w.date),
        escapeCsv(w.planId),
        escapeCsv(w.startedAt),
        escapeCsv(w.finishedAt),
        escapeCsv(w.verification),
        escapeCsv(setCount),
      ].join(','),
    );
  }
  lines.push('');

  // 3. Nutrition & Meal Logs
  lines.push('--- NUTRITION & MEAL LOGS ---');
  lines.push('Date,Meal Type,Time,Item Count');
  for (const m of state.mealLogs ?? []) {
    lines.push(
      [
        escapeCsv(m.date),
        escapeCsv(m.type),
        escapeCsv(m.at ?? ''),
        escapeCsv(m.items?.length ?? 0),
      ].join(','),
    );
  }
  lines.push('');

  // 4. Daily Quests & Gamification History
  lines.push('--- DAILY QUESTS & GAMIFICATION ---');
  lines.push('Assigned Date,Assignment ID,Task ID,Status');
  for (const q of state.dailyAssignments ?? []) {
    lines.push(
      [
        escapeCsv(q.assignedDate),
        escapeCsv(q.assignmentId),
        escapeCsv(q.taskId),
        escapeCsv(q.status),
      ].join(','),
    );
  }
  lines.push('');

  // 5. Connected Health & Device Readings
  lines.push('--- CONNECTED SENSOR & DEVICE READINGS ---');
  lines.push('Date,Metric Kind,Value');
  for (const r of state.deviceReadings ?? []) {
    lines.push(
      [
        escapeCsv(r.date),
        escapeCsv(r.kind),
        escapeCsv(r.value),
      ].join(','),
    );
  }
  lines.push('');

  // 6. Reproductive & Cycle Data (if present)
  if (state.cycleData?.lastPeriodDate) {
    lines.push('--- CYCLE & REPRODUCTIVE HEALTH ---');
    lines.push('Last Period Date,Cycle Length (Days),Period Length (Days)');
    lines.push(
      [
        escapeCsv(state.cycleData.lastPeriodDate),
        escapeCsv(state.cycleData.cycleLengthDays),
        escapeCsv(state.cycleData.periodLengthDays),
      ].join(','),
    );
    lines.push('');
  }

  // 7. Local Audit & App State Telemetry
  lines.push('--- LOCAL AUDIT & ENGAGEMENT LOGS ---');
  lines.push('Timestamp,Action,Source,Detail');
  for (const a of state.auditLog ?? []) {
    lines.push(
      [
        escapeCsv(a.at),
        escapeCsv(a.action),
        escapeCsv(a.source),
        escapeCsv(a.detail),
      ].join(','),
    );
  }
  lines.push('');

  // 8. SQLite Telemetry & Micro-Touch Records
  try {
    const { getStoredAnalytics } = require('../telemetry/sqliteAnalyticsStore');
    const stored = getStoredAnalytics(200);
    if (stored.length > 0) {
      lines.push('--- SQLITE TELEMETRY & MICRO-EVENTS ---');
      lines.push('Event ID,Type,Timestamp,Screen,Target ID,Metadata');
      for (const ev of stored) {
        lines.push(
          [
            escapeCsv(ev.id),
            escapeCsv(ev.type),
            escapeCsv(ev.timestamp),
            escapeCsv(ev.screen),
            escapeCsv(ev.targetId ?? ''),
            escapeCsv(ev.metadata ?? ''),
          ].join(','),
        );
      }
    }
  } catch {
    // safe fallback
  }

  return lines.join('\n');
}

/**
 * Saves and opens native share sheet for the exported CSV file.
 */
export async function exportDataToCsvFile(): Promise<boolean> {
  try {
    const csv = buildCsvSpreadsheetExport();
    const filename = `thrivefold_export_${formatLocalDate(new Date())}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }

    const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!dir) return false;
    const path = `${dir}${filename}`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

    await Share.share({
      title: 'Export Thrivefold Data (CSV / Excel)',
      url: path,
      message: 'Here is your exported Thrivefold personal wellness spreadsheet.',
    });
    return true;
  } catch {
    return false;
  }
}

/** Erases every Thrivefold record on this device and returns the app to a fresh state. */
export function eraseLocalData(): void {
  useRootStore.setState(useRootStore.getInitialState(), true);
  useRootStore.persist.clearStorage();
  wipeLocalData();
  try {
    wipeSummaryOutbox();
  } catch {
    // No outbox on this platform.
  }
  try {
    const { wipeAnalyticsDatabase } = require('../telemetry/sqliteAnalyticsStore');
    wipeAnalyticsDatabase();
  } catch {
    // Safe fallback
  }
}

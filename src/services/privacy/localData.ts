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
import { worldviewExportRows } from '../../domain/identity/worldview';
import { buildXlsx, toBase64, type Sheet } from './xlsx';
import { mergeBackup } from '../../domain/privacy/backupMerge';

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

const local = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '');

/**
 * The person's data as an Excel workbook (V3 §3): an About sheet that lists every category
 * with its row count and the time zone, then one sheet per category. Instants appear in both
 * local time and UTC; calendar dates are the local day they were recorded for.
 */
export function buildExportWorkbook(now = new Date()): Sheet[] {
  const s = useRootStore.getState();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
  const sheets: Sheet[] = [];
  const add = (name: string, header: string[], rows: (string | number | null | undefined)[][]) =>
    sheets.push({ name, rows: [header, ...rows] });

  add('Check-ins', ['Date (local day)', 'Mood 1-10', 'Energy 1-10', 'Stress 1-10', 'Sleep hours', 'Intensity', 'Symptoms', 'Notes', 'Record ID'],
    (s.checkInHistory ?? []).map((c) => [c.date, c.mood, c.energy, c.stress, c.sleepHours, c.intensity ?? '', (c.symptoms ?? []).join('; '), c.notes ?? '', c.id]));
  add('Cycle', ['Start (local day)', 'End', 'Ongoing', 'Flow', 'Pain 0-10', 'Symptoms', 'Notes', 'Logged (local)', 'Logged (UTC)', 'Record ID'],
    (s.cycleData?.periodHistory ?? []).map((p) => [p.startDate, p.endDate ?? '', p.isOngoing ? 'Yes' : 'No', p.flowIntensity, p.painLevel ?? '', (p.symptoms ?? []).join('; '), p.notes ?? '', local(p.loggedAt), p.loggedAt, p.id]));
  add('Workouts', ['Date (local day)', 'Plan', 'Started (local)', 'Finished (local)', 'Started (UTC)', 'Finished (UTC)', 'How it was checked', 'Sets', 'Record ID'],
    (s.workoutSessions ?? []).map((w) => [w.date, w.planId, local(w.startedAt), local(w.finishedAt), w.startedAt, w.finishedAt, w.verification, w.entries?.reduce((n, e) => n + (e.sets?.length ?? 0), 0) ?? 0, w.id]));
  add('Activities', ['Date (local day)', 'Type', 'Minutes', 'Distance km', 'Effort 1-10', 'Note', 'Record ID'],
    (s.activityLogs ?? []).map((a) => [a.date, a.type, a.minutes, a.distanceKm ?? '', a.effort ?? '', a.note ?? '', a.id]));
  add('Meals', ['Date (local day)', 'Meal', 'Time', 'Items', 'Record ID'],
    (s.mealLogs ?? []).map((m) => [m.date, m.type, m.at ?? '', (m.items ?? []).map((it: { name?: string; foodId?: string }) => it.name ?? it.foodId ?? '').join('; '), m.id]));
  add('Water', ['Date (local day)', 'Glasses'], Object.entries(s.hydration ?? {}).sort().map(([d, n]) => [d, n]));
  add('Medications', ['Name', 'Dose', 'Time', 'Record ID'], (s.medications ?? []).map((m) => [m.name, m.dose, m.time, m.id]));
  add('Journal', ['Written (local)', 'Written (UTC)', 'Title', 'Text', 'Mood tag', 'Record ID'],
    (s.journalEntries ?? []).map((j) => [local(j.createdAt), j.createdAt, j.title, j.content, j.moodTag, j.id]));
  add('Calendar events', ['Date', 'Title', 'Category', 'Repeats', 'Notes', 'Record ID'],
    (s.personalEvents ?? []).map((e) => [e.date, e.title, e.category, e.recurrence ?? '', e.notes ?? '', e.id]));
  add('Quests', ['Assigned (local day)', 'Task', 'Status', 'Assignment ID'],
    (s.dailyAssignments ?? []).map((q) => [q.assignedDate, q.taskId, q.status, q.assignmentId]));
  add('Device readings', ['Date (local day)', 'Kind', 'Value'], (s.deviceReadings ?? []).map((r) => [r.date, r.kind, r.value]));
  add('AI memories', ['Created (UTC)', 'Category', 'Memory', 'Source', 'Record ID'],
    (s.aiMemories ?? []).map((m) => [m.createdAt, m.category, m.content, m.source, m.id]));
  add('Beliefs and culture', ['Field', 'Value'], worldviewExportRows(s.worldviewProfile).map((r) => [r.label, r.value]));
  add('Access history', ['When (UTC)', 'Action', 'Source', 'Detail'], (s.auditLog ?? []).map((a) => [a.at, a.action, a.source, a.detail]));

  const about: Sheet = {
    name: 'About this export',
    rows: [
      ['Thrivefold personal data export', ''],
      ['Exported (local)', now.toLocaleString()],
      ['Exported (UTC)', now.toISOString()],
      ['Time zone', tz],
      ['Account', s.user?.isGuest ? 'Guest on this phone' : s.user?.email ?? 'Local profile'],
      ['Scope', 'Everything Thrivefold keeps on this phone for you. Letters and groups live on the server.'],
      ['', ''],
      ['Sheet', 'Rows'],
      ...sheets.map((sh) => [sh.name, sh.rows.length - 1]),
    ],
  };
  return [about, ...sheets];
}

async function saveFile(filename: string, mime: string, base64: string, title: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
  if (Platform.OS === 'android') {
    // React Native's Share ignores files on Android; the system folder picker saves it for real.
    const SAF = FileSystem.StorageAccessFramework;
    const perm = await SAF.requestDirectoryPermissionsAsync();
    if (!perm.granted) return false;
    const uri = await SAF.createFileAsync(perm.directoryUri, filename.replace(/\.[^.]+$/, ''), mime);
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return true;
  }
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) return false;
  const path = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  await Share.share({ title, url: path });
  return true;
}

/** Saves the Excel workbook where the person chooses (Android) or opens the share sheet (iOS). */
export async function exportDataToWorkbook(): Promise<boolean> {
  try {
    const bytes = buildXlsx(buildExportWorkbook());
    return await saveFile(
      `thrivefold_export_${formatLocalDate(new Date())}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      toBase64(bytes),
      'Thrivefold data export',
    );
  } catch {
    return false;
  }
}

/** The complete raw record as JSON, for moving to another app or keeping a full backup. */
export async function exportRawJson(): Promise<boolean> {
  try {
    return await saveFile(
      `thrivefold_backup_${formatLocalDate(new Date())}.json`,
      'application/json',
      toBase64(new TextEncoder().encode(buildLocalExport())),
      'Thrivefold raw data export',
    );
  } catch {
    return false;
  }
}

/**
 * Restores a backup made with "Export everything" (or a raw JSON export). The person picks the
 * folder they saved it in; the newest Thrivefold export there is read and merged without
 * overwriting anything already on this phone. Returns how many kinds of record were restored,
 * or null when nothing was chosen or no backup was found.
 */
export async function restoreFromBackup(): Promise<number | null> {
  if (Platform.OS !== 'android') return null;
  const SAF = FileSystem.StorageAccessFramework;
  const perm = await SAF.requestDirectoryPermissionsAsync();
  if (!perm.granted) return null;
  const files = (await SAF.readDirectoryAsync(perm.directoryUri))
    .filter((u) => /thrivefold_(export|backup)[^/]*\.json$/i.test(decodeURIComponent(u)))
    .sort();
  const newest = files[files.length - 1];
  if (!newest) return null;
  const parsed = JSON.parse(await FileSystem.readAsStringAsync(newest)) as { format?: string; data?: Record<string, unknown> };
  if (!parsed?.data || !String(parsed.format ?? '').startsWith('thrivefold-local-export')) return null;
  const state = useRootStore.getState() as unknown as Record<string, unknown>;
  const { patch, changed } = mergeBackup(state, parsed.data);
  if (changed.length) useRootStore.setState(patch as never);
  const d = parsed.data;
  const restoredPoints = useRootStore
    .getState()
    .mergeRemoteProgress(
      Array.isArray(d.rewardLedger) ? (d.rewardLedger as never) : [],
      Array.isArray(d.completedCheckpoints) ? (d.completedCheckpoints as string[]) : [],
      Array.isArray(d.achievements) ? (d.achievements as string[]) : [],
    );
  return changed.length + (restoredPoints ? 1 : 0);
}

/** @deprecated Kept for older callers; exports the Excel workbook. */
export const exportDataToCsvFile = exportDataToWorkbook;

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
  try {
    const { thriveRag } = require('../local-ai/rag/thriveRag');
    void thriveRag.clear().catch(() => undefined);
    require('../ai/aiInteractionStore').wipeAiInteractions();
    require('../assistant/chatStore').chatStore.clear();
  } catch {
    // No knowledge store on this platform.
  }
}

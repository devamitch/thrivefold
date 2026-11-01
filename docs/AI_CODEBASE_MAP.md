## `src/services/ai/aiInteractionStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import { getSharedLocalMemoryDb } from '../local-ai/db/localMemoryDb';
export interface AiInteractionRecord {
  id: string;
  createdAt: string;
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status: 'success' | 'error';
}
let initialized = false;
export function isGuestAccount(user: { isGuest?: boolean } | null | undefined): boolean {
  return !user || user.isGuest !== false;
}
function getDb(): SQLite.SQLiteDatabase | null {
  try {
    const db = getSharedLocalMemoryDb();
    if (!initialized) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS ai_interactions (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          user_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt TEXT NOT NULL,
          response TEXT NOT NULL,
          latency_ms INTEGER NOT NULL,
          status TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON ai_interactions(created_at);
      `);
      initialized = true;
    }
    return db;
  } catch {
    return null;
  }
}
export function logCoachTurnLocally(prompt: string, response: string, provider: string, latencyMs = 0): void {
  try {
    getDb()?.runSync(
      `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
       VALUES (?, ?, 'local_user', ?, 'coach', ?, ?, ?, 'success')`,
      [`turn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, new Date().toISOString(), provider, prompt, response, Math.max(0, Math.round(latencyMs))],
    );
  } catch {
  }
}
export async function recordAiInteraction(record: {
  userId?: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status?: 'success' | 'error';
}): Promise<void> {
  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();
  const userId = record.userId || 'local_user';
  const status = record.status ?? 'success';
  try {
    const database = getDb();
    if (database) {
      database.runSync(
        `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          createdAt,
          userId,
          record.provider,
          record.model,
          record.prompt,
          record.response,
          record.latencyMs,
          status,
        ],
      );
    }
  } catch {
  }
  try {
    const { supabase } = require('../supabase/supabaseClient');
    if (supabase) {
      supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
        if (data?.session) {
          supabase
            .from('thrivefold_ai_interactions')
            ?.insert?.([
              {
                id,
                created_at: createdAt,
                provider: record.provider,
                model: record.model,
                status,
                latency_ms: record.latencyMs,
              },
            ])
            .then(() => undefined)
            .catch(() => undefined);
        }
      }).catch(() => undefined);
    }
  } catch {
  }
}
export function checkCloudAiPermission(opts: {
  isGuest: boolean;
  hasByok: boolean;
  userId?: string;
}): { allowed: boolean; reason?: string } {
  if (opts.isGuest) {
    return {
      allowed: false,
      reason: 'Guests operate 100% on-device. Sign in or configure BYOK in Settings to use cloud AI.',
    };
  }
  if (opts.hasByok) {
    return { allowed: true };
  }
  try {
    const database = getDb();
    if (database) {
      const rows = database.getAllSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ai_interactions WHERE user_id = ? AND provider != 'local'`,
        [opts.userId || 'local_user'],
      );
      const count = rows[0]?.count ?? 0;
      if (count >= 2) {
        return {
          allowed: false,
          reason: 'Trial cloud usage reached. Please add your personal BYOK key in Settings to continue.',
        };
      }
    }
  } catch {
  }
  return { allowed: true };
}
export function wipeAiInteractions(): void {
  try {
    getDb()?.runSync('DELETE FROM ai_interactions');
  } catch {
  }
}
```

## `src/services/ai/cloudChat.ts`

```ts
import { supabase } from '../supabase/supabaseClient';
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}
export async function askThrive(turns: ChatTurn[]): Promise<{ reply: string; remaining: number }> {
  if (!supabase) throw new Error('not_configured');
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('not_authenticated');
  const { data, error } = await supabase.functions.invoke('ai-chat', { body: { messages: turns.slice(-12) } });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    let code = '';
    try {
      code = ctx ? ((await ctx.json()) as { error?: string }).error ?? '' : '';
    } catch {
    }
    throw new Error(code || error.message);
  }
  return data as { reply: string; remaining: number };
}
export function aiErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to talk with Thrive.';
  if (m.includes('daily_limit')) return 'That’s today’s limit for the AI companion. It resets tomorrow.';
  if (m.includes('unavailable')) return 'The AI companion is busy right now. Try again in a minute.';
  if (m.includes('not_configured')) return 'The AI companion needs the Thrivefold server.';
  return 'Couldn’t reach the AI companion. Check your connection and try again.';
}
```

## `src/services/ai/env.ts`

```ts
export const env = Object.freeze({
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
  GEMINI_API_KEY: '',
  GEMINI_API_KEY_2: '',
  GROQ_API_KEY: '',
  GROQ_API_KEY_2: '',
  OPENROUTER_API_KEY: '',
  CLAUDE_API_KEY: '',
  SARVAM_API_KEY: '',
  SARVAM_API_KEY_2: '',
  ELEVENLABS_API_KEY: '',
  DEEPGRAM_API_KEY: '',
  COHERE_API_KEY: '',
  VOYAGE_API_KEY: '',
  EXA_API_KEY: '',
  MEM0_API_KEY: '',
  ENABLE_ALL_FEATURES: process.env.EXPO_PUBLIC_ENABLE_ALL_FEATURES === 'true',
});
export interface UserApiKeys {
  gemini?: string;
  groq?: string;
  openrouter?: string;
  claude?: string;
  sarvam?: string;
  elevenlabs?: string;
}
export type AiDeliveryMode = 'local_only' | 'byok' | 'hybrid';
let runtimeUserKeys: UserApiKeys = {};
let runtimeDeliveryMode: AiDeliveryMode = 'local_only';
export function setRuntimeUserKeys(keys: UserApiKeys, mode?: AiDeliveryMode) {
  runtimeUserKeys = { ...keys };
  if (mode) runtimeDeliveryMode = mode;
}
function getUserKeys(): UserApiKeys {
  try {
    const { useRootStore } = require('../../stores/useRootStore');
    const storeKeys = useRootStore.getState()?.userApiKeys;
    if (storeKeys && Object.keys(storeKeys).length > 0) return storeKeys;
  } catch {
  }
  return runtimeUserKeys;
}
export function getAiDeliveryMode(): AiDeliveryMode {
  try {
    const { useRootStore } = require('../../stores/useRootStore');
    const storeMode = useRootStore.getState()?.aiDeliveryMode;
    if (storeMode) return storeMode;
  } catch {
  }
  return runtimeDeliveryMode;
}
export function isLocalOnly(): boolean {
  return getAiDeliveryMode() === 'local_only';
}
export function hasAiKeys(): boolean {
  if (isLocalOnly()) return false;
  const userKeys = getUserKeys();
  return !!(
    userKeys.gemini ||
    userKeys.groq ||
    userKeys.openrouter ||
    userKeys.claude ||
    env.GEMINI_API_KEY ||
    env.GROQ_API_KEY ||
    env.OPENROUTER_API_KEY ||
    env.CLAUDE_API_KEY
  );
}
export function pickGeminiKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.gemini) return userKeys.gemini;
  if (isLocalOnly()) return '';
  return env.GEMINI_API_KEY || env.GEMINI_API_KEY_2;
}
export function pickGroqKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.groq) return userKeys.groq;
  if (isLocalOnly()) return '';
  return env.GROQ_API_KEY || env.GROQ_API_KEY_2;
}
export function pickOpenRouterKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.openrouter) return userKeys.openrouter;
  if (isLocalOnly()) return '';
  return env.OPENROUTER_API_KEY;
}
export function pickClaudeKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.claude) return userKeys.claude;
  if (isLocalOnly()) return '';
  return env.CLAUDE_API_KEY;
}
export function pickSarvamKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.sarvam) return userKeys.sarvam;
  if (isLocalOnly()) return '';
  return env.SARVAM_API_KEY || env.SARVAM_API_KEY_2;
}
```

## `src/services/ai/localModel.ts`

```ts
import { LocalAI, getLocalModelFilePath, getModelPresetById, isModelDownloaded } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { importedFileOf, importedPath, isImportedId } from './modelImport';
let loading: Promise<boolean> | null = null;
export const localModelSupported = () => LocalAI.isAvailable();
export async function ensureLocalModel(): Promise<boolean> {
  if (!LocalAI.isAvailable()) return false;
  if (LocalAI.isLoaded()) return true;
  const id = useRootStore.getState().localModelId;
  if (!id) return false;
  const imported = isImportedId(id);
  if (!imported && (!getModelPresetById(id) || !(await isModelDownloaded(id)))) return false;
  loading ??= (async () => {
    try {
      const path = (imported ? importedPath(importedFileOf(id)) : getLocalModelFilePath(id)).replace(/^file:\/\//, '');
      const r = await LocalAI.loadModel(path, false, { temperature: 0.4, maxTokens: 220, topP: 0.9, repeatPenalty: 1.1 });
      return !!r?.success;
    } catch {
      return false;
    } finally {
      loading = null;
    }
  })();
  return loading;
}
export async function askLocal(prompt: string, system: string, context?: string): Promise<string | null> {
  if (!(await ensureLocalModel())) return null;
  try {
    const out = await LocalAI.generateText({ prompt: prompt.slice(0, 2000), system, context: context?.slice(0, 3000) });
    return out.trim() || null;
  } catch {
    return null;
  }
}
```

## `src/services/ai/modelImport.ts`

```ts
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
const IMPORT_DIR = `${FileSystem.documentDirectory ?? ''}local_ai_models/imported/`;
export const IMPORT_PREFIX = 'import:';
export const importedPath = (fileName: string) => `${IMPORT_DIR}${fileName}`;
export const isImportedId = (id: string | null | undefined): id is string => !!id && id.startsWith(IMPORT_PREFIX);
export const importedFileOf = (id: string) => id.slice(IMPORT_PREFIX.length);
export function safeModelName(name: string): string {
  const base = name.replace(/\.gguf$/i, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'model';
  return `${base}.gguf`;
}
export interface ImportedModel {
  id: string;
  fileName: string;
  sizeMb: number;
}
export async function listImportedModels(): Promise<ImportedModel[]> {
  try {
    const info = await FileSystem.getInfoAsync(IMPORT_DIR);
    if (!info.exists) return [];
    const names = (await FileSystem.readDirectoryAsync(IMPORT_DIR)).filter((n) => n.endsWith('.gguf'));
    return Promise.all(
      names.map(async (fileName) => {
        const f = await FileSystem.getInfoAsync(importedPath(fileName));
        return { id: `${IMPORT_PREFIX}${fileName}`, fileName, sizeMb: f.exists ? Math.round((f.size ?? 0) / 1048576) : 0 };
      }),
    );
  } catch {
    return [];
  }
}
export async function importModelFile(): Promise<string | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: false, multiple: false });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  if (!/\.gguf$/i.test(a.name)) throw new Error('Choose a .gguf model file (llama.cpp format).');
  await FileSystem.makeDirectoryAsync(IMPORT_DIR, { intermediates: true }).catch(() => undefined);
  const fileName = safeModelName(a.name);
  await FileSystem.deleteAsync(importedPath(fileName), { idempotent: true });
  await FileSystem.copyAsync({ from: a.uri, to: importedPath(fileName) });
  return `${IMPORT_PREFIX}${fileName}`;
}
export async function deleteImportedModel(id: string): Promise<void> {
  await FileSystem.deleteAsync(importedPath(importedFileOf(id)), { idempotent: true });
}
```

## `src/services/ai/modelSetup.ts`

```ts
import {
  DurableDownloads,
  LocalAI,
  MODEL_PRESETS,
  downloadModelWithProgress,
  ensureModelsDirectory,
  getLocalModelFilePath,
  getRecommendedModel,
  isModelDownloaded,
  type ModelDownloadHandle,
  type ModelPreset,
} from '../../../modules/local-ai';
import * as FileSystem from 'expo-file-system/legacy';
import { asyncKeyValueStorage } from '../../stores/persistStorage';
import { useRootStore } from '../../stores/useRootStore';
import { ensureLocalModel } from './localModel';
export type SetupPhase =
  | 'idle'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'loading'
  | 'ready'
  | 'failed'
  | 'unsupported';
export interface SetupState {
  phase: SetupPhase;
  model: ModelPreset | null;
  progress: number;
  message: string | null;
  durable?: boolean;
}
let state: SetupState = { phase: 'idle', model: null, progress: 0, message: null };
const DM_KEY = 'thrive.modelDM.v1';
type DmJob = { modelId: string; id: number };
async function readDmJob(): Promise<DmJob | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(DM_KEY);
    return raw ? (JSON.parse(raw) as DmJob) : null;
  } catch {
    return null;
  }
}
const clearDmJob = () => asyncKeyValueStorage.removeItem(DM_KEY).catch(() => undefined);
let dmTimer: ReturnType<typeof setInterval> | null = null;
async function durableDownload(model: ModelPreset): Promise<void> {
  if (!DurableDownloads) throw new Error('unavailable');
  let job = await readDmJob();
  if (!job || job.modelId !== model.id || DurableDownloads.query(job.id).status === 'missing') {
    const id = DurableDownloads.enqueue(model.downloadUrl, `${model.id}.gguf.part`, `Thrivefold AI: ${model.name}`);
    job = { modelId: model.id, id };
    await asyncKeyValueStorage.setItem(DM_KEY, JSON.stringify(job)).catch(() => undefined);
  }
  const jobId = job.id;
  emit({ phase: 'downloading', model, durable: true, message: null });
  const localUri = await new Promise<string>((resolve, reject) => {
    if (dmTimer) clearInterval(dmTimer);
    dmTimer = setInterval(() => {
      const q = DurableDownloads!.query(jobId);
      if (q.total && q.total > 0) emit({ progress: Math.min(1, (q.bytes ?? 0) / q.total) });
      if (q.status === 'paused') emit({ message: 'Waiting for a network connection…' });
      else if (state.message) emit({ message: null });
      if (q.status === 'done' && q.localUri) {
        clearInterval(dmTimer!);
        dmTimer = null;
        resolve(q.localUri);
      } else if (q.status === 'failed' || q.status === 'missing') {
        clearInterval(dmTimer!);
        dmTimer = null;
        reject(new Error('The download failed. Check the connection and try again.'));
      }
    }, 1000);
  });
  emit({ phase: 'verifying', progress: 1 });
  const path = localUri.replace(/^file:\/\//, '');
  const info = await FileSystem.getInfoAsync(localUri);
  const size = info.exists ? (info.size ?? 0) : 0;
  const okSize = size > 0 && Math.abs(size - model.sizeBytes) <= model.sizeBytes * 0.01;
  const okHash = okSize && (await LocalAI.verifyModelChecksum(path, model.expectedSha256).catch(() => ({ matches: false }))).matches;
  if (!okHash) {
    DurableDownloads.remove(jobId);
    await clearDmJob();
    throw new Error('Model SHA-256 integrity check failed. File has been removed.');
  }
  await ensureModelsDirectory();
  const dest = getLocalModelFilePath(model.id);
  await FileSystem.deleteAsync(dest, { idempotent: true });
  try {
    await FileSystem.moveAsync({ from: localUri, to: dest });
  } catch {
    await FileSystem.copyAsync({ from: localUri, to: dest });
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }
  DurableDownloads.remove(jobId);
  await clearDmJob();
}
let handle: ModelDownloadHandle | null = null;
const RESUME_KEY = 'thrive.modelDownload.v1';
type Saved = { modelId: string; resumeData: string; progress: number };
async function readSaved(): Promise<Saved | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(RESUME_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
const clearSaved = () => asyncKeyValueStorage.removeItem(RESUME_KEY).catch(() => undefined);
const listeners = new Set<(s: SetupState) => void>();
const emit = (patch: Partial<SetupState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
};
export const getSetupState = () => state;
export function subscribeSetup(fn: (s: SetupState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}
export function recommendedModel(): ModelPreset | null {
  if (!LocalAI.isAvailable()) return null;
  return getRecommendedModel(LocalAI.getDeviceCapabilities().totalRamMb);
}
export async function brainReady(): Promise<boolean> {
  const id = useRootStore.getState().localModelId;
  return !!id && (await isModelDownloaded(id)) && (await ensureLocalModel());
}
async function probe(): Promise<boolean> {
  try {
    const out = await LocalAI.generateText({ prompt: 'Reply with the single word: ready', system: 'Answer briefly.' });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}
export async function setUpBrain(model: ModelPreset | null = recommendedModel()): Promise<boolean> {
  if (!model) {
    emit({ phase: 'unsupported', message: 'On-device AI is not available on this phone.' });
    return false;
  }
  if (state.phase === 'downloading' || state.phase === 'verifying' || state.phase === 'loading') return false;
  const saved = await readSaved();
  const setId = useRootStore.getState().setLocalModelId;
  try {
    if (!(await isModelDownloaded(model.id)) && DurableDownloads) {
      await durableDownload(model);
    }
    if (!(await isModelDownloaded(model.id))) {
      const resume = saved?.modelId === model.id ? saved.resumeData : null;
      emit({ phase: 'downloading', model, progress: resume ? (saved?.progress ?? 0) : 0, message: null });
      const caps = LocalAI.getDeviceCapabilities();
      handle = downloadModelWithProgress(
        model,
        caps.availableStorageBytes,
        (p) => emit({ progress: p.progress ?? 0, phase: (p.progress ?? 0) >= 1 ? 'verifying' : 'downloading' }),
        (path, hash) => LocalAI.verifyModelChecksum(path, hash),
        resume,
      );
      await handle.promise;
      handle = null;
      void clearSaved();
    }
    emit({ phase: 'loading', model, progress: 1 });
    if (LocalAI.isLoaded()) await LocalAI.unloadModel();
    setId(model.id);
    if (!(await ensureLocalModel()) || !(await probe())) {
      setId(null);
      emit({ phase: 'failed', message: 'The model downloaded but did not start. Close other apps and try again.' });
      return false;
    }
    emit({ phase: 'ready', message: null });
    return true;
  } catch (e) {
    handle = null;
    if (e instanceof Error && e.message === 'paused') return false;
    emit({ phase: 'failed', message: e instanceof Error ? e.message : 'Download failed. Try again on Wi-Fi.' });
    return false;
  }
}
export async function cancelSetup(): Promise<void> {
  const job = await readDmJob();
  if (job && DurableDownloads) DurableDownloads.remove(job.id);
  void clearDmJob();
  if (dmTimer) clearInterval(dmTimer);
  dmTimer = null;
  await handle?.cancel();
  handle = null;
  void clearSaved();
  emit({ phase: 'idle', progress: 0, message: null });
}
export async function pauseSetup(): Promise<void> {
  const model = state.model;
  const data = await handle?.pause();
  handle = null;
  if (model && data) {
    await asyncKeyValueStorage
      .setItem(RESUME_KEY, JSON.stringify({ modelId: model.id, resumeData: data, progress: state.progress }))
      .catch(() => undefined);
  }
  emit({ phase: 'paused' });
}
export async function resumeSetup(): Promise<boolean> {
  const job = await readDmJob();
  const saved = await readSaved();
  const id = job?.modelId ?? saved?.modelId;
  const model = id ? (MODEL_PRESETS.find((m) => m.id === id) ?? null) : state.model;
  return setUpBrain(model);
}
export async function pendingDownload(): Promise<{ model: ModelPreset; progress: number } | null> {
  const job = await readDmJob();
  const dmModel = job ? MODEL_PRESETS.find((m) => m.id === job.modelId) : undefined;
  if (job && dmModel) return { model: dmModel, progress: 0 };
  const saved = await readSaved();
  const model = saved ? MODEL_PRESETS.find((m) => m.id === saved.modelId) : undefined;
  return saved && model ? { model, progress: saved.progress } : null;
}
```

## `src/services/ai/providers.ts`

```ts
import { env, pickGeminiKey, pickGroqKey, pickOpenRouterKey, pickClaudeKey, isLocalOnly } from './env';
import { recordAiInteraction, checkCloudAiPermission, isGuestAccount } from './aiInteractionStore';
export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
export interface AiResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'none';
  model: string;
}
async function askGemini(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGeminiKey();
  if (!key) throw new Error('no_gemini_key');
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { text, provider: 'gemini', model };
}
async function askGroq(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGroqKey();
  if (!key) throw new Error('no_groq_key');
  const model = 'llama-3.3-70b-versatile';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`groq_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'groq', model };
}
async function askOpenRouter(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickOpenRouterKey();
  if (!key) throw new Error('no_openrouter_key');
  const model = 'google/gemini-2.0-flash-exp:free';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'Thrivefold',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`openrouter_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'openrouter', model };
}
async function askClaude(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickClaudeKey();
  if (!key) throw new Error('no_claude_key');
  const model = 'claude-3-5-haiku-latest';
  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
  const body: Record<string, unknown> = {
    model,
    max_tokens: 1024,
    messages: anthropicMessages,
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`claude_${res.status}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.[0]?.text ?? '';
  return { text, provider: 'claude', model };
}
export async function testProviderKey(
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'sarvam',
  key: string,
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  const trimmed = key.trim();
  if (!trimmed) {
    return { ok: false, message: 'Key cannot be empty', latencyMs: 0 };
  }
  try {
    if (provider === 'gemini') {
      const model = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmed}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 2 },
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Check key permissions)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trimmed}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 2,
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Invalid key)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }
    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Valid key (${latency}ms)`, latencyMs: latency };
    }
    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': trimmed,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 2,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }
    if (provider === 'sarvam') {
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': trimmed,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: ['hi'],
          target_language_code: 'en-IN',
          speaker: 'shubh',
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }
    return { ok: false, message: 'Unknown provider', latencyMs: 0 };
  } catch (err) {
    const latency = Date.now() - start;
    return { ok: false, message: err instanceof Error ? err.message : 'Network failure', latencyMs: latency };
  }
}
export async function askAi(
  messages: AiMessage[],
  opts?: {
    systemPrompt?: string;
    preferredProvider?: 'gemini' | 'groq' | 'openrouter' | 'claude';
    forceCloud?: boolean;
    userId?: string;
  },
): Promise<AiResponse> {
  if (isLocalOnly() && !opts?.forceCloud) {
    return { text: '', provider: 'none', model: 'local_only' };
  }
  let isGuest = true;
  let hasByok = false;
  try {
    const { useRootStore } = require('../../stores/useRootStore');
    const st = useRootStore.getState?.();
    if (st) {
      isGuest = isGuestAccount(st.user);
      const k = st.userApiKeys ?? {};
      hasByok = !!(k.gemini || k.groq || k.openrouter || k.claude || k.sarvam);
    }
  } catch {
  }
  const perm = checkCloudAiPermission({ isGuest, hasByok, userId: opts?.userId });
  if (!perm.allowed && (isGuest || !opts?.forceCloud)) {
    return { text: '', provider: 'none', model: 'quota_exceeded' };
  }
  const system = opts?.systemPrompt;
  const providers = [askGemini, askGroq, askOpenRouter, askClaude];
  if (opts?.preferredProvider === 'groq') {
    providers.splice(0, 0, providers.splice(1, 1)[0]);
  } else if (opts?.preferredProvider === 'openrouter') {
    providers.splice(0, 0, providers.splice(2, 1)[0]);
  } else if (opts?.preferredProvider === 'claude') {
    providers.splice(0, 0, providers.splice(3, 1)[0]);
  }
  const promptText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const t0 = Date.now();
  for (const provider of providers) {
    try {
      const res = await provider(messages, system);
      if (res.text) {
        recordAiInteraction({
          userId: opts?.userId,
          provider: res.provider,
          model: res.model,
          prompt: promptText,
          response: res.text,
          latencyMs: Date.now() - t0,
          status: 'success',
        }).catch(() => undefined);
        return res;
      }
    } catch {
    }
  }
  recordAiInteraction({
    userId: opts?.userId,
    provider: 'none',
    model: 'none',
    prompt: promptText,
    response: '',
    latencyMs: Date.now() - t0,
    status: 'error',
  }).catch(() => undefined);
  return { text: '', provider: 'none', model: '' };
}
export async function quickAsk(prompt: string, systemPrompt?: string): Promise<string> {
  const r = await askAi([{ role: 'user', content: prompt }], { systemPrompt });
  return r.text;
}
```

## `src/services/local-ai/db/localMemoryDb.ts`

```ts
import * as SQLite from 'expo-sqlite';
let sharedDb: SQLite.SQLiteDatabase | null = null;
export function getSharedLocalMemoryDb(): SQLite.SQLiteDatabase {
  if (sharedDb) return sharedDb;
  try {
    sharedDb = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    sharedDb.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    return sharedDb;
  } catch (err) {
    throw new Error(`[localMemoryDb] Failed to open shared local memory database: ${err}`);
  }
}
export function resetSharedLocalMemoryDb(): void {
  sharedDb = null;
}
```

## `src/services/local-ai/memory/memoryStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import type {
  MemoryFilter,
  MemoryRetrievalResult,
  UserMemory,
} from './types';
import { cosineSimilarity } from './vectorMath';
import { anvayFtsStore } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';
let initialized = false;
function getDb(): SQLite.SQLiteDatabase {
  const db = getSharedLocalMemoryDb();
  if (!initialized) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding_json TEXT,
        source_event_ids_json TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT,
        origin TEXT NOT NULL,
        status TEXT NOT NULL,
        metadata_json TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_memories_user ON user_memories(user_id);
      CREATE INDEX IF NOT EXISTS idx_memories_kind ON user_memories(kind);
      CREATE INDEX IF NOT EXISTS idx_memories_status ON user_memories(status);
    `);
    initialized = true;
  }
  return db;
}
interface RawMemoryRow {
  id: string;
  user_id: string;
  kind: string;
  content: string;
  embedding_json: string | null;
  source_event_ids_json: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  origin: string;
  status: string;
  metadata_json: string | null;
}
function rowToMemory(row: RawMemoryRow): UserMemory {
  let embedding: number[] | undefined;
  if (row.embedding_json) {
    try {
      embedding = JSON.parse(row.embedding_json);
    } catch {}
  }
  let sourceEventIds: string[] = [];
  try {
    sourceEventIds = JSON.parse(row.source_event_ids_json);
  } catch {}
  let metadata: Record<string, unknown> | undefined;
  if (row.metadata_json) {
    try {
      metadata = JSON.parse(row.metadata_json);
    } catch {}
  }
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as UserMemory['kind'],
    content: row.content,
    embedding,
    sourceEventIds,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at ?? undefined,
    origin: row.origin as UserMemory['origin'],
    status: row.status as UserMemory['status'],
    metadata,
  };
}
export class AnalyticalMemoryStore {
  async addMemory(
    params: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserMemory> {
    const database = getDb();
    const now = new Date().toISOString();
    const existingExact = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE user_id = ? AND kind = ? AND content = ? LIMIT 1`,
      [params.userId, params.kind, params.content]
    );
    if (existingExact) {
      const existing = rowToMemory(existingExact);
      const mergedEvents = Array.from(
        new Set([...existing.sourceEventIds, ...params.sourceEventIds])
      );
      const updatedConfidence = Math.min(
        1.0,
        Math.max(existing.confidence, params.confidence) + 0.05
      );
      database.runSync(
        `UPDATE user_memories
         SET source_event_ids_json = ?, confidence = ?, updated_at = ?
         WHERE id = ?`,
        [JSON.stringify(mergedEvents), updatedConfidence, now, existing.id]
      );
      anvayFtsStore.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: existing.id,
        ownerId: params.userId,
        domain: 'memories',
        sourceType: existing.kind,
        title: `Memory: ${existing.kind}`,
        content: existing.content,
        createdAt: now,
        metadata: {
          ...existing.metadata,
          confidence: updatedConfidence,
          sourceEventIds: mergedEvents,
        },
      });
      return {
        ...existing,
        sourceEventIds: mergedEvents,
        confidence: updatedConfidence,
        updatedAt: now,
      };
    }
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    database.runSync(
      `INSERT INTO user_memories (
        id, user_id, kind, content, embedding_json, source_event_ids_json,
        confidence, created_at, updated_at, expires_at, origin, status, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId,
        params.kind,
        params.content,
        params.embedding ? JSON.stringify(params.embedding) : null,
        JSON.stringify(params.sourceEventIds),
        params.confidence,
        now,
        now,
        params.expiresAt ?? null,
        params.origin,
        params.status,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
    anvayFtsStore.upsertEntry({
      sourceTable: 'user_memories',
      sourceId: id,
      ownerId: params.userId,
      domain: 'memories',
      sourceType: params.kind,
      title: `Memory: ${params.kind}`,
      content: params.content,
      createdAt: now,
      metadata: params.metadata,
    });
    return {
      id,
      userId: params.userId,
      kind: params.kind,
      content: params.content,
      embedding: params.embedding,
      sourceEventIds: params.sourceEventIds,
      confidence: params.confidence,
      createdAt: now,
      updatedAt: now,
      expiresAt: params.expiresAt,
      origin: params.origin,
      status: params.status,
      metadata: params.metadata,
    };
  }
  async getMemory(id: string, userId: string): Promise<UserMemory | null> {
    const database = getDb();
    const row = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId]
    );
    return row ? rowToMemory(row) : null;
  }
  async updateMemory(
    id: string,
    userId: string,
    updates: Partial<Pick<UserMemory, 'content' | 'confidence' | 'status' | 'expiresAt' | 'metadata'>>
  ): Promise<UserMemory | null> {
    const database = getDb();
    const existing = await this.getMemory(id, userId);
    if (!existing) return null;
    const now = new Date().toISOString();
    const content = updates.content ?? existing.content;
    const confidence = updates.confidence ?? existing.confidence;
    const status = updates.status ?? existing.status;
    const expiresAt = updates.expiresAt !== undefined ? updates.expiresAt : existing.expiresAt;
    const metadata = updates.metadata ?? existing.metadata;
    database.runSync(
      `UPDATE user_memories
       SET content = ?, confidence = ?, status = ?, expires_at = ?, metadata_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [
        content,
        confidence,
        status,
        expiresAt ?? null,
        metadata ? JSON.stringify(metadata) : null,
        now,
        id,
        userId,
      ]
    );
    if (status === 'archived' || (expiresAt && new Date(expiresAt).getTime() <= Date.now())) {
      anvayFtsStore.deleteEntry('user_memories', id, null, userId);
    } else {
      anvayFtsStore.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: id,
        ownerId: userId,
        domain: 'memories',
        sourceType: existing.kind,
        title: `Memory: ${existing.kind}`,
        content,
        createdAt: now,
        metadata: {
          ...metadata,
          confidence,
          status,
        },
      });
    }
    return {
      ...existing,
      content,
      confidence,
      status,
      expiresAt,
      metadata,
      updatedAt: now,
    };
  }
  async deleteMemory(id: string, userId: string): Promise<boolean> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    anvayFtsStore.deleteEntry('user_memories', id);
    return res.changes > 0;
  }
  async clearAllMemories(userId: string): Promise<boolean> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE user_id = ?`,
      [userId]
    );
    database.runSync(
      `DELETE FROM anvay_search_entries WHERE owner_id = ? AND domain = 'memories'`,
      [userId]
    );
    return res.changes > 0;
  }
  async listMemories(userId: string, filter?: MemoryFilter): Promise<UserMemory[]> {
    const database = getDb();
    let query = `SELECT * FROM user_memories WHERE user_id = ?`;
    const params: SQLite.SQLiteBindValue[] = [userId];
    if (filter?.kind) {
      query += ` AND kind = ?`;
      params.push(filter.kind);
    }
    if (filter?.status) {
      query += ` AND status = ?`;
      params.push(filter.status);
    }
    if (filter?.origin) {
      query += ` AND origin = ?`;
      params.push(filter.origin);
    }
    if (filter?.minConfidence) {
      query += ` AND confidence >= ?`;
      params.push(filter.minConfidence);
    }
    query += ` ORDER BY updated_at DESC`;
    const rows = database.getAllSync<RawMemoryRow>(query, params);
    const nowTime = Date.now();
    return rows
      .map(rowToMemory)
      .filter((m) => {
        if (filter?.includeExpired) return true;
        if (!m.expiresAt) return true;
        return new Date(m.expiresAt).getTime() > nowTime;
      });
  }
  async searchMemoriesByVector(
    userId: string,
    queryEmbedding: number[],
    topK = 5,
    minSimilarity = 0.55
  ): Promise<MemoryRetrievalResult[]> {
    if (queryEmbedding.length === 0 || topK <= 0) return [];
    const database = getDb();
    const now = Date.now();
    const results: MemoryRetrievalResult[] = [];
    const pageSize = 128;
    let afterId = '';
    while (true) {
      const rows = database.getAllSync<RawMemoryRow>(
        `SELECT * FROM user_memories
         WHERE user_id = ? AND status = 'active' AND id > ? AND embedding_json IS NOT NULL
           AND (expires_at IS NULL OR expires_at > ?)
         ORDER BY id LIMIT ?`,
        [userId, afterId, new Date(now).toISOString(), pageSize],
      );
      if (rows.length === 0) break;
      afterId = rows[rows.length - 1].id;
      for (const row of rows) {
        const mem = rowToMemory(row);
        if (!mem.embedding || mem.embedding.length === 0) continue;
        const sim = cosineSimilarity(queryEmbedding, mem.embedding);
        if (sim < minSimilarity) continue;
        const ageDays = (now - new Date(mem.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(0.5, Math.exp(-ageDays / 30));
        const score = sim * 0.65 + mem.confidence * 0.25 + recencyWeight * 0.10;
        results.push({ memory: mem, similarity: sim, score });
      }
      results.sort((a, b) => b.score - a.score);
      if (results.length > topK) results.length = topK;
    }
    return results;
  }
  async exportMemories(userId: string): Promise<UserMemory[]> {
    return this.listMemories(userId, { includeExpired: true });
  }
  async eraseAllUserMemories(userId: string): Promise<number> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE user_id = ?`,
      [userId]
    );
    return res.changes;
  }
}
export const memoryStore = new AnalyticalMemoryStore();
```

## `src/services/local-ai/memory/types.ts`

```ts
export type MemoryKind =
  | 'profile'      // User-approved facts, bio-traits, settings
  | 'preference'   // Explicit or observed habit/UI preferences
  | 'episode'      // Summaries of meaningful check-ins, workouts, milestones
  | 'fact'         // Specific verified facts (e.g., "Prefers morning yoga")
  | 'workflow'     // Procedural routines and learned step-by-step instructions
  | 'semantic';    // Conceptual relationships between tags, habits, goals
export type MemoryOrigin = 'user_declared' | 'observed' | 'ai_inferred';
export type MemoryStatus = 'active' | 'needs_confirmation' | 'archived';
export interface UserMemory {
  id: string;
  userId: string;
  kind: MemoryKind;
  content: string;
  embedding?: number[];
  sourceEventIds: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  origin: MemoryOrigin;
  status: MemoryStatus;
  metadata?: Record<string, unknown>;
}
export interface MemoryRetrievalResult {
  memory: UserMemory;
  similarity: number;
  score: number; // Combined relevance * recency * confidence
}
export interface MemoryFilter {
  kind?: MemoryKind;
  status?: MemoryStatus;
  includeExpired?: boolean;
  minConfidence?: number;
  origin?: MemoryOrigin;
}
```

## `src/services/local-ai/memory/vectorMath.ts`

```ts
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const valA = a[i];
    const valB = b[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA <= 0 || normB <= 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return Infinity;
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
export function normalizeVector(vec: number[]): number[] {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  if (norm <= 0) return vec.slice();
  const mag = Math.sqrt(norm);
  return vec.map((val) => val / mag);
}
export function topKSimilar<T extends { vector?: number[] }>(
  query: number[],
  items: T[],
  k = 5,
  minThreshold = 0.0
): { item: T; similarity: number }[] {
  const scored = items
    .map((item) => {
      const sim = item.vector ? cosineSimilarity(query, item.vector) : 0;
      return { item, similarity: sim };
    })
    .filter((entry) => entry.similarity >= minThreshold)
    .sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, k);
}
```

## `src/services/local-ai/rag/hybridRagPipeline.ts`

```ts
import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { knowledgeStore, type KnowledgeChunk } from './knowledgeStore';
import { tokenize, makeSnippet } from '../../../domain/ai/localRetrieval';
import { EXERCISES } from '../../../domain/fitness/workouts';
import { anvayFtsStore, type FtsSearchHit } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';
export interface RagDocument {
  id: string;
  sourceType:
    | 'user_memory'
    | 'user_journal'
    | 'exercise_catalog'
    | 'wellness_guide'
    | 'user_document'
    | 'user_note'
    | 'health_article'
    | 'imported_file'
    | 'medical_reference'
    | 'learn_library'
    | 'conversation_history';
  title: string;
  content: string;
  date?: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
  chunkOffset?: { start: number; end: number };
}
export interface RagEvidenceHit {
  document: RagDocument;
  denseRank?: number;
  sparseRank?: number;
  hybridScore: number;
  snippet: string;
}
export interface RagResponse {
  answer: string;
  citations: string[];
  evidenceHits: RagEvidenceHit[];
  confidence: number;
  isGrounded: boolean;
}
const RRF_K = 60; // Standard reciprocal rank fusion smoothing constant
export function getExerciseCatalogDocuments(): RagDocument[] {
  return EXERCISES.map((ex) => ({
    id: `catalog_ex_${ex.id}`,
    sourceType: 'exercise_catalog' as const,
    title: ex.name,
    content: `${ex.name} (${ex.pattern} movement, ${ex.equipment} equipment). Steps: ${ex.steps.join(' ')}. Safety: ${ex.safety}. Easier variation: ${ex.easier}. Harder variation: ${ex.harder}.`,
    metadata: {
      exerciseId: ex.id,
      pattern: ex.pattern,
      equipment: ex.equipment,
      timed: ex.timed ?? false,
    },
  }));
}
export function rankSparseBM25(docs: RagDocument[], query: string): { doc: RagDocument; score: number }[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];
  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.content}`));
  const avgLen = tokenized.reduce((a, t) => a + t.length, 0) / docs.length || 1;
  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }
  const K1 = 1.2;
  const B = 0.75;
  const hits: { doc: RagDocument; score: number }[] = [];
  docs.forEach((doc, i) => {
    const tokens = tokenized[i];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * tokens.length) / avgLen));
    }
    if (score > 0) {
      hits.push({ doc, score });
    }
  });
  return hits.sort((a, b) => b.score - a.score);
}
function hydrateCandidateDocuments(
  userId: string,
  candidateKeys: { chunkIds: string[]; memoryIds: string[]; exerciseIds: string[] }
): Map<string, RagDocument> {
  const docMap = new Map<string, RagDocument>();
  const db = getSharedLocalMemoryDb();
  if (candidateKeys.exerciseIds.length > 0) {
    const catalog = getExerciseCatalogDocuments();
    for (const exDoc of catalog) {
      const bareId = exDoc.id.replace('catalog_ex_', '');
      if (candidateKeys.exerciseIds.includes(bareId) || candidateKeys.exerciseIds.includes(exDoc.id)) {
        docMap.set(exDoc.id, exDoc);
        docMap.set(bareId, exDoc);
      }
    }
  }
  if (candidateKeys.memoryIds.length > 0) {
    const placeholders = candidateKeys.memoryIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT * FROM user_memories WHERE id IN (${placeholders}) AND user_id = ? AND status = 'active'`,
      [...candidateKeys.memoryIds, userId]
    );
    for (const r of rows) {
      docMap.set(r.id, {
        id: r.id,
        sourceType: 'user_memory',
        title: `${r.kind.toUpperCase()} Memory`,
        content: r.content,
        date: r.updated_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
      });
    }
  }
  if (candidateKeys.chunkIds.length > 0) {
    const placeholders = candidateKeys.chunkIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT c.*, d.title as doc_title, d.source_type, d.metadata_json
       FROM rag_chunks c
       JOIN rag_documents d ON d.id = c.document_id
       WHERE c.id IN (${placeholders}) AND c.user_id = ?`,
      [...candidateKeys.chunkIds, userId]
    );
    for (const r of rows) {
      const metadata = r.metadata_json ? JSON.parse(r.metadata_json) : undefined;
      docMap.set(r.id, {
        id: r.id,
        sourceType: metadata?.key === 'me:chat' ? 'conversation_history' : r.source_type,
        title: r.doc_title || 'Document Chunk',
        content: r.content,
        date: r.created_at,
        chunkOffset: { start: r.start_offset, end: r.end_offset },
        metadata: { ...metadata, documentId: r.document_id, tokenEstimate: r.token_estimate },
      });
    }
  }
  return docMap;
}
export async function retrieveHybridEvidence(
  userId: string,
  query: string,
  topK = 4
): Promise<RagEvidenceHit[]> {
  const ftsHits = anvayFtsStore.search(query, { ownerId: userId, limit: 30 });
  const sparseRankMap = new Map<string, number>();
  const ftsSnippetMap = new Map<string, string>();
  const candidateChunkIds: string[] = [];
  const candidateMemoryIds: string[] = [];
  const candidateExerciseIds: string[] = [];
  ftsHits.forEach((hit, idx) => {
    const key = hit.chunkId || hit.sourceId;
    sparseRankMap.set(key, idx + 1);
    if (hit.snippet) ftsSnippetMap.set(key, hit.snippet);
    if (hit.sourceTable === 'rag_chunks' && hit.chunkId) {
      candidateChunkIds.push(hit.chunkId);
    } else if (hit.sourceTable === 'user_memories') {
      candidateMemoryIds.push(hit.sourceId);
    } else if (hit.sourceTable === 'exercise_catalog') {
      candidateExerciseIds.push(hit.sourceId);
    }
  });
  const denseRankMap = new Map<string, number>();
  if (LocalAI.isLoaded()) {
    try {
      const queryVec = await LocalAI.embed(query);
      if (queryVec && queryVec.length > 0) {
        const denseMemories = await memoryStore.searchMemoriesByVector(userId, queryVec, 10, 0.4);
        denseMemories.forEach((res, idx) => {
          denseRankMap.set(res.memory.id, idx + 1);
          candidateMemoryIds.push(res.memory.id);
        });
        const denseChunks = await knowledgeStore.searchChunksByVector(userId, queryVec, 10, 0.4);
        denseChunks.forEach((res, idx) => {
          const currentRank = denseRankMap.get(res.chunk.id);
          if (currentRank === undefined || idx + 1 < currentRank) {
            denseRankMap.set(res.chunk.id, idx + 1);
          }
          candidateChunkIds.push(res.chunk.id);
        });
      }
    } catch {
    }
  }
  if (sparseRankMap.size === 0 && denseRankMap.size === 0) {
    const catalog = getExerciseCatalogDocuments();
    const fallbackHits = rankSparseBM25(catalog, query);
    fallbackHits.slice(0, topK).forEach((hit, idx) => {
      sparseRankMap.set(hit.doc.id, idx + 1);
      candidateExerciseIds.push(hit.doc.id);
    });
  }
  const docMap = hydrateCandidateDocuments(userId, {
    chunkIds: Array.from(new Set(candidateChunkIds)),
    memoryIds: Array.from(new Set(candidateMemoryIds)),
    exerciseIds: Array.from(new Set(candidateExerciseIds)),
  });
  const candidateIds = new Set<string>([...sparseRankMap.keys(), ...denseRankMap.keys()]);
  const fusionHits: RagEvidenceHit[] = [];
  for (const docId of candidateIds) {
    const doc = docMap.get(docId);
    if (!doc) continue;
    const sRank = sparseRankMap.get(docId);
    const dRank = denseRankMap.get(docId);
    let score = 0;
    if (sRank !== undefined) score += 1 / (RRF_K + sRank);
    if (dRank !== undefined) score += 1.2 / (RRF_K + dRank); // 1.2x multiplier for semantic relevance
    const terms = tokenize(query);
    const snippet = ftsSnippetMap.get(docId) || makeSnippet(doc.content, terms);
    fusionHits.push({
      document: doc,
      sparseRank: sRank,
      denseRank: dRank,
      hybridScore: score,
      snippet,
    });
  }
  return fusionHits.sort((a, b) => b.hybridScore - a.hybridScore).slice(0, topK);
}
export function calculateCalibratedConfidence(
  query: string,
  hits: RagEvidenceHit[],
  isModelSynthesized: boolean
): number {
  if (hits.length === 0) return 0;
  const topHit = hits[0];
  const EPSILON = 0.05;
  const c1 = Math.min(1.0, Math.max(0.1, topHit.hybridScore * 30));
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0.5;
  const combinedContent = hits.map((h) => `${h.document.title} ${h.document.content}`).join(' ').toLowerCase();
  const coveredTokens = queryTokens.filter((t) => combinedContent.includes(t.toLowerCase())).length;
  const c2 = Math.min(1.0, Math.max(0.1, coveredTokens / queryTokens.length));
  const sourceType = topHit.document.sourceType;
  const c3 =
    sourceType === 'exercise_catalog'
      ? 1.0
      : sourceType === 'user_document' || sourceType === 'health_article'
        ? 0.95
        : sourceType === 'wellness_guide'
          ? 0.88
          : 0.80;
  const c4 = isModelSynthesized ? 0.92 : 0.85;
  const logScore =
    0.35 * Math.log(Math.max(EPSILON, c1)) +
    0.30 * Math.log(Math.max(EPSILON, c2)) +
    0.20 * Math.log(Math.max(EPSILON, c3)) +
    0.15 * Math.log(Math.max(EPSILON, c4));
  const confidence = Math.exp(logScore);
  return Math.round(confidence * 100) / 100;
}
export async function answerWithHybridRag(
  userId: string,
  query: string
): Promise<RagResponse> {
  const hits = (await retrieveHybridEvidence(userId, query, 40))
    .filter((hit) => hit.document.sourceType !== 'conversation_history')
    .slice(0, 3);
  if (hits.length === 0 || hits[0].hybridScore < 0.01) {
    return {
      answer: 'I could not find enough relevant records in your personal wellness notes, documents, or exercise library to answer that with certainty.',
      citations: [],
      evidenceHits: [],
      confidence: 0,
      isGrounded: false,
    };
  }
  const citations: string[] = hits.map((h) => {
    if (h.document.sourceType === 'exercise_catalog') {
      return `[Exercise Catalog: ${h.document.title}]`;
    }
    if (h.document.sourceType === 'user_document') {
      return `[Document: ${h.document.title}]`;
    }
    return `[Personal Memory: ${h.document.title}]`;
  });
  if (LocalAI.isLoaded()) {
    const evidenceText = hits.map((h, i) => `[Source ${i + 1} - ${h.document.title}]: ${h.document.content}`).join('\n\n');
    const prompt =
      `You are Thrive Coach, an evidence-grounded on-device wellness assistant.\n` +
      `Use ONLY the provided evidence below to answer the user's question.\n` +
      `Cite sources using [Source 1], [Source 2], etc. If the answer is not in the context, say "I don't know based on your recorded notes and documents." Do not invent facts.\n\n` +
      `Evidence Context:\n${evidenceText}\n\n` +
      `Question: "${query}"\n\n` +
      `Answer:`;
    try {
      const generated = await LocalAI.generateText({
        prompt,
        system: 'You are an accurate, evidence-grounded on-device wellness assistant. Never invent facts beyond the evidence.',
      });
      const confidence = calculateCalibratedConfidence(query, hits, true);
      return {
        answer: generated.trim(),
        citations,
        evidenceHits: hits,
        confidence,
        isGrounded: true,
      };
    } catch {
    }
  }
  const topDoc = hits[0].document;
  const sourceLabel =
    topDoc.sourceType === 'exercise_catalog'
      ? 'exercise catalog'
      : topDoc.sourceType === 'user_document'
      ? 'saved health documents'
      : 'recorded notes';
  const answer = `Based on your ${sourceLabel}: ${hits.map((h) => h.snippet).join(' ')}`;
  const confidence = calculateCalibratedConfidence(query, hits, false);
  return {
    answer,
    citations,
    evidenceHits: hits,
    confidence,
    isGrounded: true,
  };
}
```

## `src/services/local-ai/rag/knowledgeStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import { LocalAI, type DocumentChunkResult } from '../../../../modules/local-ai';
import { cosineSimilarity } from '../memory/vectorMath';
import { anvayFtsStore } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';
export interface KnowledgeDocument {
  id: string;
  userId: string;
  title: string;
  sourceType: 'user_note' | 'health_article' | 'wellness_guide' | 'imported_file' | 'medical_reference' | 'conversation_history';
  rawText: string;
  chunkCount: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
export interface KnowledgeChunk {
  id: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
  embedding?: number[];
  createdAt: string;
  documentTitle?: string;
}
export interface KnowledgeChunkHit {
  chunk: KnowledgeChunk;
  similarity: number;
}
let initialized = false;
function getDb(): SQLite.SQLiteDatabase {
  const db = getSharedLocalMemoryDb();
  if (!initialized) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS rag_documents (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        chunk_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT
      );
      CREATE TABLE IF NOT EXISTS rag_chunks (
        id TEXT PRIMARY KEY NOT NULL,
        document_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        start_offset INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        token_estimate INTEGER NOT NULL,
        embedding_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
      CREATE INDEX IF NOT EXISTS idx_rag_chunks_user ON rag_chunks(user_id);
    `);
    initialized = true;
  }
  return db;
}
export class KnowledgeStore {
  async ingestDocument(
    userId: string,
    doc: {
      title: string;
      text: string;
      sourceType?: KnowledgeDocument['sourceType'];
      metadata?: Record<string, unknown>;
    }
  ): Promise<KnowledgeDocument> {
    const database = getDb();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const sourceType = doc.sourceType || 'user_note';
    const rawChunks: DocumentChunkResult[] = LocalAI.chunkDocument(doc.text, 320, 40);
    const chunksWithEmbeddings: {
      chunk: DocumentChunkResult;
      embedding?: number[];
    }[] = [];
    for (const c of rawChunks) {
      let emb: number[] | undefined;
      if (LocalAI.isLoaded()) {
        try {
          emb = await LocalAI.embed(c.text);
        } catch {
        }
      }
      chunksWithEmbeddings.push({ chunk: c, embedding: emb });
    }
    database.withTransactionSync(() => {
      database.runSync(
        `INSERT INTO rag_documents (id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          userId,
          doc.title.trim(),
          sourceType,
          doc.text,
          rawChunks.length,
          now,
          doc.metadata ? JSON.stringify(doc.metadata) : null,
        ]
      );
      for (const item of chunksWithEmbeddings) {
        const chunkId = `chk_${docId}_${item.chunk.index}`;
        database.runSync(
          `INSERT INTO rag_chunks (id, document_id, user_id, chunk_index, content, start_offset, end_offset, token_estimate, embedding_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            chunkId,
            docId,
            userId,
            item.chunk.index,
            item.chunk.text,
            item.chunk.startOffset,
            item.chunk.endOffset,
            item.chunk.tokenEstimate,
            item.embedding ? JSON.stringify(item.embedding) : null,
            now,
          ]
        );
        anvayFtsStore.upsertEntry({
          sourceTable: 'rag_chunks',
          sourceId: docId,
          chunkId,
          ownerId: userId,
          domain: 'documents',
          sourceType,
          title: doc.title.trim(),
          content: item.chunk.text,
          createdAt: now,
          metadata: doc.metadata,
        });
      }
    });
    return {
      id: docId,
      userId,
      title: doc.title.trim(),
      sourceType,
      rawText: doc.text,
      chunkCount: rawChunks.length,
      createdAt: now,
      metadata: doc.metadata,
    };
  }
  async getAllChunks(userId: string): Promise<KnowledgeChunk[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
              c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
       FROM rag_chunks c LEFT JOIN rag_documents d ON d.id = c.document_id
       WHERE c.user_id = ?
       ORDER BY c.document_id, c.chunk_index ASC`,
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      documentId: r.document_id,
      userId: r.user_id,
      chunkIndex: r.chunk_index,
      content: r.content,
      startOffset: r.start_offset,
      endOffset: r.end_offset,
      tokenEstimate: r.token_estimate,
      embedding: r.embedding_json ? JSON.parse(r.embedding_json) : undefined,
      createdAt: r.created_at,
      documentTitle: r.document_title ?? undefined,
    }));
  }
  async searchChunksByVector(
    userId: string,
    queryVec: number[],
    topK = 5,
    minSimilarity = 0.35
  ): Promise<KnowledgeChunkHit[]> {
    if (queryVec.length === 0 || topK <= 0) return [];
    const database = getDb();
    const hits: KnowledgeChunkHit[] = [];
    const pageSize = 128;
    let afterId = '';
    while (true) {
      const rows = database.getAllSync<{
        id: string; document_id: string; user_id: string; chunk_index: number; content: string;
        start_offset: number; end_offset: number; token_estimate: number; embedding_json: string;
        created_at: string; document_title: string | null;
      }>(
        `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
                c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
         FROM rag_chunks c JOIN rag_documents d ON d.id = c.document_id
         WHERE c.user_id = ? AND c.id > ? AND c.embedding_json IS NOT NULL
         ORDER BY c.id LIMIT ?`,
        [userId, afterId, pageSize],
      );
      if (rows.length === 0) break;
      afterId = rows[rows.length - 1].id;
      for (const row of rows) {
        let embedding: number[];
        try {
          embedding = JSON.parse(row.embedding_json);
        } catch {
          continue;
        }
        if (embedding.length === 0) continue;
        const similarity = cosineSimilarity(queryVec, embedding);
        if (similarity >= minSimilarity) {
          hits.push({
            chunk: {
              id: row.id,
              documentId: row.document_id,
              userId: row.user_id,
              chunkIndex: row.chunk_index,
              content: row.content,
              startOffset: row.start_offset,
              endOffset: row.end_offset,
              tokenEstimate: row.token_estimate,
              embedding,
              createdAt: row.created_at,
              documentTitle: row.document_title ?? undefined,
            },
            similarity,
          });
        }
      }
      hits.sort((a, b) => b.similarity - a.similarity);
      if (hits.length > topK) hits.length = topK;
    }
    return hits;
  }
  async listDocuments(userId: string): Promise<KnowledgeDocument[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json
       FROM rag_documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      sourceType: r.source_type,
      rawText: r.raw_text,
      chunkCount: r.chunk_count,
      createdAt: r.created_at,
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
    }));
  }
  async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const database = getDb();
    let changes = 0;
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE document_id = ? AND user_id = ?`, [
        documentId,
        userId,
      ]);
      const res = database.runSync(
        `DELETE FROM rag_documents WHERE id = ? AND user_id = ?`,
        [documentId, userId]
      );
      changes = res.changes;
      anvayFtsStore.deleteEntry('rag_chunks', documentId);
    });
    return changes > 0;
  }
  async clearAllDocuments(userId: string): Promise<boolean> {
    const database = getDb();
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE user_id = ?`, [userId]);
      database.runSync(`DELETE FROM rag_documents WHERE user_id = ?`, [userId]);
      database.runSync(
        `DELETE FROM anvay_search_entries WHERE owner_id = ? AND domain = 'documents'`,
        [userId]
      );
    });
    return true;
  }
}
export const knowledgeStore = new KnowledgeStore();
```

## `src/services/local-ai/rag/thriveRag.ts`

```ts
import type { Embeddings, GetResult, LLM, Message, QueryResult, VectorStore } from 'react-native-rag';
import { LocalAI } from '../../../../modules/local-ai';
import { bestFileLines, type FileLine } from '../../../domain/ai/fileEvidence';
import { isConversationRecallQuery } from '../../../domain/ai/localRetrieval';
import { asyncKeyValueStorage } from '../../../stores/persistStorage';
import { answerWithHybridRag, retrieveHybridEvidence, type RagEvidenceHit, type RagResponse } from './hybridRagPipeline';
import { knowledgeStore, type KnowledgeDocument } from './knowledgeStore';
import { anvayFtsStore, type FtsSearchHit, type FtsBenchmarkResult } from '../search/anvayFtsStore';
const USER = 'local_user';
export class LocalEmbeddings implements Embeddings {
  async load() {
    return this;
  }
  async unload() {}
  async embed(text: string): Promise<number[]> {
    if (!LocalAI.isLoaded()) return [];
    try {
      return (await LocalAI.embed(text)) ?? [];
    } catch {
      return [];
    }
  }
}
export class LocalLLM implements LLM {
  private turn: string | null = null;
  async load() {
    return this;
  }
  async unload() {}
  async interrupt() {
    if (this.turn) LocalAI.cancelGeneration();
  }
  generate(messages: Message[], callback: (token: string) => void): Promise<string> {
    if (!LocalAI.isLoaded()) return Promise.reject(new Error('No on-device model is loaded.'));
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    const talk = messages.filter((m) => m.role !== 'system');
    const last = talk[talk.length - 1]?.content ?? '';
    const context = talk
      .slice(0, -1)
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Person' : 'Coach'}: ${m.content}`)
      .join('\n');
    const turnId = `rag_${Date.now()}`;
    this.turn = turnId;
    return new Promise<string>((resolve, reject) => {
      const subs = [
        LocalAI.onToken((e) => {
          if (e.turnId === turnId) callback(e.token);
        }),
        LocalAI.onStreamComplete((e) => {
          if (e.turnId !== turnId) return;
          done();
          resolve(e.fullText);
        }),
        LocalAI.onStreamError((e) => {
          if (e.turnId !== turnId) return;
          done();
          reject(new Error(e.error));
        }),
      ];
      const done = () => {
        subs.forEach((s) => s.remove());
        if (this.turn === turnId) this.turn = null;
      };
      if (!LocalAI.startStream(turnId, last, context || undefined, system || undefined)) {
        done();
        reject(new Error('The on-device model is busy.'));
      }
    });
  }
}
const toGetResult = (d: KnowledgeDocument): GetResult => ({
  id: d.id,
  document: d.rawText,
  embedding: [],
  metadata: { ...(d.metadata ?? {}), title: d.title, sourceType: d.sourceType },
});
export class SqliteVectorStore implements VectorStore {
  async load() {
    return this;
  }
  async unload() {}
  async add(params: { id?: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<string> {
    const meta = params.metadata ?? {};
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: String(meta.title ?? params.document?.slice(0, 60) ?? 'Note'),
      text: params.document ?? '',
      sourceType: (meta.sourceType as KnowledgeDocument['sourceType']) ?? 'user_note',
      metadata: meta,
    });
    return doc.id;
  }
  async update(params: { id: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<void> {
    await knowledgeStore.deleteDocument(USER, params.id);
    await this.add({ document: params.document, metadata: params.metadata });
  }
  async delete(params: { predicate: (value: GetResult) => boolean }): Promise<void> {
    const docs = await knowledgeStore.listDocuments(USER);
    for (const d of docs) if (params.predicate(toGetResult(d))) await knowledgeStore.deleteDocument(USER, d.id);
  }
  async query(params: { queryText?: string; nResults?: number; predicate?: (value: QueryResult) => boolean }): Promise<QueryResult[]> {
    if (!params.queryText) return [];
    const hits = await retrieveHybridEvidence(USER, params.queryText, params.nResults ?? 4);
    const results = hits.map<QueryResult>((h) => ({
      id: h.document.id,
      document: h.document.content,
      embedding: h.document.embedding ?? [],
      metadata: { ...(h.document.metadata ?? {}), title: h.document.title, snippet: h.snippet },
      similarity: h.hybridScore,
    }));
    return params.predicate ? results.filter(params.predicate) : results;
  }
}
const INDEX_KEY = 'thrive.appKnowledge.v1';
type KeyIndex = Record<string, { id: string; hash: string }>;
async function readIndex(): Promise<KeyIndex> {
  try {
    const raw = await asyncKeyValueStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as KeyIndex) : {};
  } catch {
    return {};
  }
}
export const thriveRag = {
  embeddings: new LocalEmbeddings(),
  store: new SqliteVectorStore(),
  llm: new LocalLLM(),
  search(query: string, topK = 4): Promise<RagEvidenceHit[]> {
    return retrieveHybridEvidence(USER, query, topK);
  },
  async fileLines(query: string, max = 3): Promise<FileLine[]> {
    try {
      const docs = (await knowledgeStore.listDocuments(USER)).filter((d) => d.sourceType === 'imported_file');
      return bestFileLines(docs.map((d) => ({ name: d.title, text: d.rawText })), query, max);
    } catch {
      return [];
    }
  },
  async contextFor(query: string, maxChars = 1500, topK = 4): Promise<string> {
    try {
      const hits = await retrieveHybridEvidence(USER, query, topK);
      const recallQuery = isConversationRecallQuery(query);
      return hits
        .filter((h) => h.hybridScore > 0)
        .filter((h) => h.document.sourceType !== 'conversation_history' || recallQuery)
        .map((h) => `- ${h.document.title}: ${h.document.sourceType === 'user_document' ? h.document.content.replace(/\s+/g, ' ') : h.snippet}`)
        .join('\n')
        .slice(0, maxChars);
    } catch {
      return '';
    }
  },
  answer(question: string): Promise<RagResponse> {
    return answerWithHybridRag(USER, question);
  },
  remember(title: string, text: string, sourceType: KnowledgeDocument['sourceType'] = 'user_note', metadata?: Record<string, unknown>) {
    return knowledgeStore.ingestDocument(USER, { title, text, sourceType, metadata });
  },
  ftsSearch(query: string, options: { domain?: string; limit?: number } = {}): FtsSearchHit[] {
    return anvayFtsStore.search(query, { ownerId: USER, domain: options.domain, limit: options.limit });
  },
  ftsBenchmark(): FtsBenchmarkResult {
    return anvayFtsStore.benchmark(USER);
  },
  syncFts(): { synchronized: number } {
    return anvayFtsStore.syncAllSources();
  },
  async rememberDocument(name: string, pages: { page: number; text: string }[], hash: string): Promise<{ id: string; duplicate: boolean }> {
    const existing = (await knowledgeStore.listDocuments(USER)).find((d) => d.metadata?.hash === hash);
    if (existing) return { id: existing.id, duplicate: true };
    const text = pages
      .filter((p) => p.text.trim())
      .map((p) => `[${name}, page ${p.page}]\n${p.text.trim()}`)
      .join('\n\n');
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: name,
      text,
      sourceType: 'imported_file',
      metadata: { source: 'chat_attachment', hash, pages: pages.length, at: new Date().toISOString() },
    });
    return { id: doc.id, duplicate: false };
  },
  async sync(docs: { key: string; title: string; text: string; hash: string; sourceType?: KnowledgeDocument['sourceType'] }[]): Promise<number> {
    const index = await readIndex();
    const present = new Set((await knowledgeStore.listDocuments(USER)).map((d) => d.id));
    for (const key of Object.keys(index)) if (!present.has(index[key].id)) delete index[key];
    const keep = new Set(docs.map((d) => d.key));
    let changed = 0;
    for (const doc of docs) {
      const prev = index[doc.key];
      if (prev?.hash === doc.hash) continue;
      if (prev) await knowledgeStore.deleteDocument(USER, prev.id).catch(() => false);
      const saved = await knowledgeStore.ingestDocument(USER, {
        title: doc.title,
        text: doc.text,
        sourceType: doc.sourceType ?? 'wellness_guide',
        metadata: { source: 'app', key: doc.key },
      });
      index[doc.key] = { id: saved.id, hash: doc.hash };
      changed++;
    }
    for (const key of Object.keys(index)) {
      if (keep.has(key)) continue;
      await knowledgeStore.deleteDocument(USER, index[key].id).catch(() => false);
      delete index[key];
      changed++;
    }
    await asyncKeyValueStorage.setItem(INDEX_KEY, JSON.stringify(index));
    return changed;
  },
  async clear(): Promise<void> {
    await knowledgeStore.clearAllDocuments(USER);
    await asyncKeyValueStorage.removeItem(INDEX_KEY);
  },
};
```

## `src/services/local-ai/search/anvayFtsStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';
export interface SearchEntryInput {
  sourceTable:
    | 'rag_chunks'
    | 'rag_documents'
    | 'user_memories'
    | 'coach_messages'
    | 'exercise_catalog'
    | 'learn_library'
    | 'ai_interactions';
  sourceId: string;
  chunkId?: string | null;
  ownerId: string;
  appId?: string;
  domain: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions';
  sourceType: string;
  title: string;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}
export interface FtsSearchFilter {
  ownerId: string;
  appId?: string;
  domain?: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions' | string;
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
export interface FtsSearchHit {
  rowid: number;
  entryKey: string;
  sourceTable: string;
  sourceId: string;
  chunkId: string | null;
  ownerId: string;
  appId: string;
  domain: string;
  sourceType: string;
  title: string;
  content: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  bm25Score: number;
  snippet: string;
}
export interface FtsBenchmarkResult {
  indexedCount: number;
  dbSizeBytes: number;
  queryLatencyMs: {
    englishTerm: number;
    hindiTerm: number;
    bengaliTerm: number;
    prefixTerm: number;
    phraseTerm: number;
  };
  integrityOk: boolean;
}
const queryCache = new Map<string, { timestamp: number; results: FtsSearchHit[] }>();
const CACHE_TTL_MS = 60_000; // 1 minute
const MAX_CACHE_ENTRIES = 200;
export function buildEntryKey(
  appId: string,
  ownerId: string,
  sourceTable: string,
  sourceId: string,
  chunkId?: string | null
): string {
  const safeApp = (appId || 'thrivefold').trim();
  const safeOwner = (ownerId || 'local_user').trim();
  const safeTable = sourceTable.trim();
  const safeSource = sourceId.trim();
  const safeChunk = (chunkId && chunkId.trim()) || '__root__';
  return `${safeApp}:${safeOwner}:${safeTable}:${safeSource}:${safeChunk}`;
}
let isInitialized = false;
function ensureInitialized(database: SQLite.SQLiteDatabase): void {
  if (isInitialized) return;
  initFtsSchema(database);
  isInitialized = true;
}
function initFtsSchema(database: SQLite.SQLiteDatabase): void {
  database.execSync(`
    -- Master Search Table (Stores authoritative metadata & text with integer rowid and unique entry_key)
    CREATE TABLE IF NOT EXISTS anvay_search_entries (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_key TEXT NOT NULL,
      source_table TEXT NOT NULL,
      source_id TEXT NOT NULL,
      chunk_id TEXT,
      owner_id TEXT NOT NULL,
      app_id TEXT NOT NULL DEFAULT 'thrivefold',
      domain TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      metadata_json TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_anvay_search_entry_key ON anvay_search_entries(entry_key);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_owner ON anvay_search_entries(owner_id, domain);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_app ON anvay_search_entries(app_id);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_created ON anvay_search_entries(created_at);
    -- FTS5 Virtual Table (External Content pattern: content='anvay_search_entries')
    -- Tokenizer: unicode61 with remove_diacritics=2 for accent-insensitivity while preserving Indian alphabets
    CREATE VIRTUAL TABLE IF NOT EXISTS anvay_search_fts USING fts5(
      title,
      content,
      content='anvay_search_entries',
      content_rowid='rowid',
      tokenize = 'unicode61 remove_diacritics 2'
    );
    -- Synchronization Triggers: Keep FTS5 in atomic lockstep with anvay_search_entries
    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ai AFTER INSERT ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;
    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ad AFTER DELETE ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
    END;
    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_au AFTER UPDATE ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
      INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;
  `);
  try {
    const tableInfo = database.getAllSync<{ name: string }>(`PRAGMA table_info(anvay_search_entries);`);
    const hasEntryKey = tableInfo.some((col) => col.name === 'entry_key');
    if (!hasEntryKey) {
      database.execSync(`
        ALTER TABLE anvay_search_entries ADD COLUMN entry_key TEXT;
        UPDATE anvay_search_entries
        SET entry_key = app_id || ':' || owner_id || ':' || source_table || ':' || source_id || ':' || COALESCE(chunk_id, '__root__')
        WHERE entry_key IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_anvay_search_entry_key ON anvay_search_entries(entry_key);
      `);
    }
  } catch {
  }
}
export function sanitizeFtsQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';
  const phraseMatch = trimmed.match(/^"([^"]+)"$/);
  if (phraseMatch) {
    const inner = phraseMatch[1].replace(/["*]/g, '').trim();
    return inner ? `"${inner}"` : '';
  }
  const tokens = trimmed
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && !['and', 'or', 'not'].includes(t));
  if (tokens.length === 0) return '';
  return tokens.map((t) => `"${t}"*`).join(' AND ');
}
export class AnvayFtsStore {
  private invalidateCache(): void {
    queryCache.clear();
  }
  upsertEntry(input: SearchEntryInput, txDb?: SQLite.SQLiteDatabase): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);
    const now = input.createdAt || new Date().toISOString();
    const metaJson = input.metadata ? JSON.stringify(input.metadata) : null;
    const appId = input.appId || 'thrivefold';
    const chunkId = input.chunkId || null;
    const entryKey = buildEntryKey(appId, input.ownerId, input.sourceTable, input.sourceId, chunkId);
    database.runSync(
      `INSERT INTO anvay_search_entries
        (entry_key, source_table, source_id, chunk_id, owner_id, app_id, domain, source_type, title, content, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(entry_key) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        domain = excluded.domain,
        source_type = excluded.source_type,
        created_at = excluded.created_at,
        metadata_json = excluded.metadata_json`,
      [
        entryKey,
        input.sourceTable,
        input.sourceId,
        chunkId,
        input.ownerId,
        appId,
        input.domain,
        input.sourceType,
        input.title.trim(),
        input.content.trim(),
        now,
        metaJson,
      ]
    );
    this.invalidateCache();
  }
  upsertEntries(inputs: SearchEntryInput[], txDb?: SQLite.SQLiteDatabase): void {
    if (inputs.length === 0) return;
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);
    const perform = (db: SQLite.SQLiteDatabase) => {
      for (const input of inputs) {
        this.upsertEntry(input, db);
      }
    };
    if (txDb) {
      perform(txDb);
    } else {
      database.withTransactionSync(() => perform(database));
    }
  }
  deleteEntry(
    sourceTable: string,
    sourceId: string,
    chunkId?: string | null,
    ownerId = 'local_user',
    appId = 'thrivefold',
    txDb?: SQLite.SQLiteDatabase
  ): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);
    if (chunkId !== undefined) {
      const entryKey = buildEntryKey(appId, ownerId, sourceTable, sourceId, chunkId);
      database.runSync(`DELETE FROM anvay_search_entries WHERE entry_key = ?`, [entryKey]);
    } else {
      database.runSync(
        `DELETE FROM anvay_search_entries
         WHERE source_table = ? AND source_id = ? AND owner_id = ? AND app_id = ?`,
        [sourceTable, sourceId, ownerId, appId]
      );
    }
    this.invalidateCache();
  }
  search(query: string, filters: FtsSearchFilter): FtsSearchHit[] {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    const sanitized = sanitizeFtsQuery(query);
    if (!sanitized) return [];
    const ownerId = filters.ownerId;
    const appId = filters.appId || 'thrivefold';
    const limit = Math.max(1, Math.min(filters.limit || 20, 100));
    const offset = Math.max(0, filters.offset || 0);
    const cacheKey = [
      ownerId,
      appId,
      filters.domain || '*',
      filters.sourceType || '*',
      filters.startDate || '*',
      filters.endDate || '*',
      sanitized,
      limit,
      offset,
    ].join('|');
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }
    const whereClauses: string[] = [
      `anvay_search_fts MATCH ?`,
      `e.owner_id = ?`,
      `e.app_id = ?`,
    ];
    const params: (string | number)[] = [sanitized, ownerId, appId];
    if (filters.domain) {
      whereClauses.push(`e.domain = ?`);
      params.push(filters.domain);
    }
    if (filters.sourceType) {
      whereClauses.push(`e.source_type = ?`);
      params.push(filters.sourceType);
    }
    if (filters.startDate) {
      whereClauses.push(`e.created_at >= ?`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClauses.push(`e.created_at <= ?`);
      params.push(filters.endDate);
    }
    params.push(limit, offset);
    const sql = `
      SELECT
        e.rowid,
        e.entry_key,
        e.source_table,
        e.source_id,
        e.chunk_id,
        e.owner_id,
        e.app_id,
        e.domain,
        e.source_type,
        e.title,
        e.content,
        e.created_at,
        e.metadata_json,
        bm25(anvay_search_fts, 2.0, 1.0) AS bm25_score,
        snippet(anvay_search_fts, 1, '«', '»', '...', 28) AS snippet
      FROM anvay_search_fts f
      JOIN anvay_search_entries e ON e.rowid = f.rowid
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY bm25_score ASC
      LIMIT ? OFFSET ?;
    `;
    try {
      const rows = database.getAllSync<any>(sql, params);
      const hits: FtsSearchHit[] = rows.map((r) => ({
        rowid: r.rowid,
        entryKey: r.entry_key,
        sourceTable: r.source_table,
        sourceId: r.source_id,
        chunkId: r.chunk_id,
        ownerId: r.owner_id,
        appId: r.app_id,
        domain: r.domain,
        sourceType: r.source_type,
        title: r.title,
        content: r.content,
        createdAt: r.created_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
        bm25Score: r.bm25_score,
        snippet: r.snippet || r.content.slice(0, 120),
      }));
      if (queryCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = queryCache.keys().next().value;
        if (oldestKey) queryCache.delete(oldestKey);
      }
      queryCache.set(cacheKey, { timestamp: Date.now(), results: hits });
      return hits;
    } catch {
      return [];
    }
  }
  syncAllSources(ownerId = 'local_user', appId = 'thrivefold'): { synchronized: number } {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    let count = 0;
    const BATCH_SIZE = 100;
    let lastChunkRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT c.rowid as chunk_rowid, c.id AS chunk_id, c.document_id, c.user_id, c.content, c.created_at,
                d.title, d.source_type
         FROM rag_chunks c
         JOIN rag_documents d ON d.id = c.document_id
         WHERE c.rowid > ? AND c.user_id = ?
         ORDER BY c.rowid ASC
         LIMIT ?`,
        [lastChunkRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;
      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'rag_chunks',
              sourceId: r.document_id,
              chunkId: r.chunk_id,
              ownerId: r.user_id,
              appId,
              domain: 'documents',
              sourceType: r.source_type,
              title: r.title,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastChunkRowid = r.chunk_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }
    let lastMemRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as mem_rowid, id, user_id, kind, content, created_at, status
         FROM user_memories
         WHERE rowid > ? AND user_id = ? AND status = 'active'
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMemRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;
      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'user_memories',
              sourceId: r.id,
              chunkId: null,
              ownerId: r.user_id,
              appId,
              domain: 'memories',
              sourceType: r.kind,
              title: `Memory: ${r.kind}`,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastMemRowid = r.mem_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }
    let lastMsgRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as msg_rowid, id, who, text, at
         FROM coach_messages
         WHERE rowid > ? AND text IS NOT NULL AND length(trim(text)) > 0
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMsgRowid, BATCH_SIZE]
      );
      if (rows.length === 0) break;
      database.withTransactionSync(() => {
        for (const r of rows) {
          const title = r.who === 'you' ? 'User Question' : 'Anvay Coach Reply';
          const dateIso = new Date(r.at).toISOString();
          this.upsertEntry(
            {
              sourceTable: 'coach_messages',
              sourceId: r.id,
              chunkId: null,
              ownerId,
              appId,
              domain: 'conversations',
              sourceType: r.who,
              title,
              content: r.text,
              createdAt: dateIso,
            },
            database
          );
          count++;
          lastMsgRowid = r.msg_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }
    try {
      const learnRows = database.getAllSync<any>(
        `SELECT id, source, topic, title, summary, url FROM learn_library LIMIT 100`
      );
      for (const lr of learnRows) {
        this.upsertEntry(
          {
            sourceTable: 'learn_library',
            sourceId: lr.id,
            chunkId: null,
            ownerId,
            appId,
            domain: 'knowledge',
            sourceType: lr.source,
            title: lr.title,
            content: `${lr.title}: ${lr.summary}`,
          },
          database
        );
        count++;
      }
    } catch {
    }
    this.invalidateCache();
    return { synchronized: count };
  }
  rebuild(): void {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('rebuild');`);
    this.invalidateCache();
  }
  checkIntegrity(): boolean {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    try {
      database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('integrity-check');`);
      return true;
    } catch {
      return false;
    }
  }
  benchmark(ownerId = 'local_user', appId = 'thrivefold'): FtsBenchmarkResult {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    const countRow = database.getFirstSync<{ count: number }>(
      `SELECT count(*) as count FROM anvay_search_entries WHERE owner_id = ? AND app_id = ?`,
      [ownerId, appId]
    );
    const count = countRow?.count ?? 0;
    const pageCountRow = database.getFirstSync<{ page_count: number }>(`PRAGMA page_count;`);
    const pageSizeRow = database.getFirstSync<{ page_size: number }>(`PRAGMA page_size;`);
    const dbSizeBytes = (pageCountRow?.page_count ?? 0) * (pageSizeRow?.page_size ?? 0);
    const measure = (q: string) => {
      const t0 = performance.now();
      this.search(q, { ownerId, appId, limit: 10 });
      return Math.round((performance.now() - t0) * 100) / 100;
    };
    return {
      indexedCount: count,
      dbSizeBytes,
      queryLatencyMs: {
        englishTerm: measure('water'),
        hindiTerm: measure('तनाव'),
        bengaliTerm: measure('ঘুম'),
        prefixTerm: measure('brea*'),
        phraseTerm: measure('"box breathing"'),
      },
      integrityOk: this.checkIntegrity(),
    };
  }
}
export const anvayFtsStore = new AnvayFtsStore();
```

## `src/services/local-ai/orchestration/taskRouter.ts`

```ts
import { classifyReflection, type ClassificationResult } from '../tasks/classification';
import { extractWellnessEntities, type ExtractedEntities } from '../tasks/entityExtraction';
import { summarizeWellnessJournal, type SummaryResult } from '../tasks/summarization';
import { suggestOrganization, type OrganizationSuggestion } from '../tasks/organizationSuggestions';
import { searchMemoriesSemantically } from '../tasks/semanticSearch';
import type { MemoryRetrievalResult } from '../memory/types';
export type OrchestratedTask =
  | { type: 'classify'; text: string }
  | { type: 'extract_entities'; text: string }
  | { type: 'summarize'; notes: string[] }
  | { type: 'suggest_organization'; content: string }
  | { type: 'semantic_search'; userId: string; query: string; topK?: number };
export type OrchestratedResult =
  | { type: 'classify'; data: ClassificationResult }
  | { type: 'extract_entities'; data: ExtractedEntities }
  | { type: 'summarize'; data: SummaryResult }
  | { type: 'suggest_organization'; data: OrganizationSuggestion }
  | { type: 'semantic_search'; data: MemoryRetrievalResult[] };
export function checkCrisisInterception(text: string): { isCrisis: boolean; helplineNotice?: string } {
  const lower = text.toLowerCase();
  const crisisPatterns = [
    'suicide',
    'kill myself',
    'end my life',
    'self harm',
    'cutting myself',
    'want to die',
    'overdose',
  ];
  for (const pattern of crisisPatterns) {
    if (lower.includes(pattern)) {
      return {
        isCrisis: true,
        helplineNotice:
          'If you or someone you know is going through a difficult time, free, confidential support is available 24/7. Please call or text 988 (Suicide & Crisis Lifeline) or your local emergency services.',
      };
    }
  }
  return { isCrisis: false };
}
export async function routeLocalAiTask(task: OrchestratedTask): Promise<OrchestratedResult> {
  switch (task.type) {
    case 'classify': {
      const crisis = checkCrisisInterception(task.text);
      if (crisis.isCrisis) {
        return {
          type: 'classify',
          data: {
            category: 'tense',
            confidence: 1.0,
            keywords: ['crisis_intercepted'],
            suggestedAction: crisis.helplineNotice ?? 'Please reach out to emergency support.',
            reasoning: 'Immediate crisis circuit breaker triggered.',
          },
        };
      }
      const data = await classifyReflection(task.text);
      return { type: 'classify', data };
    }
    case 'extract_entities': {
      const data = await extractWellnessEntities(task.text);
      return { type: 'extract_entities', data };
    }
    case 'summarize': {
      const data = await summarizeWellnessJournal(task.notes);
      return { type: 'summarize', data };
    }
    case 'suggest_organization': {
      const data = await suggestOrganization(task.content);
      return { type: 'suggest_organization', data };
    }
    case 'semantic_search': {
      const data = await searchMemoriesSemantically(task.userId, task.query, task.topK);
      return { type: 'semantic_search', data };
    }
  }
}
```

## `src/services/local-ai/orchestration/langGraphOrchestrator.ts`

```ts
import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { routeLocalAiTask, type OrchestratedTask, type OrchestratedResult } from './taskRouter';
export interface WorkflowCheckpoint {
  id: string;
  workflowName: string;
  userId: string;
  step: 'intake' | 'evidence' | 'execution' | 'validation' | 'commit' | 'completed' | 'failed';
  stateJson: string;
  createdAt: string;
}
export interface WorkflowState<TInput = unknown, TOutput = unknown> {
  workflowId: string;
  userId: string;
  taskType: string;
  input: TInput;
  retrievedMemories: UserMemory[];
  rawOutput?: unknown;
  validatedOutput?: TOutput;
  proposedMemoryItems: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>[];
  error?: string;
  isComplete: boolean;
}
export interface NonSensitiveCohortFeatures {
  userId: string;
  activeExperience: 'women' | 'men' | 'all';
  weeklyCheckInFrequency: number;
  prefersMorningRoutine: boolean;
  averageWorkoutDurationMinutes: number;
  streakCount: number;
  consentGranted: boolean;
}
export class StatefulOrchestrator {
  private checkpoints: Map<string, WorkflowCheckpoint> = new Map();
  async runWorkflow(
    userId: string,
    task: OrchestratedTask,
    options?: {
      autoCommitMemories?: boolean;
      userConsentAnalytics?: boolean;
    }
  ): Promise<{
    result: OrchestratedResult;
    retrievedMemoriesCount: number;
    committedMemoriesCount: number;
  }> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.saveCheckpoint(workflowId, 'intake', userId, { task });
    const memories = await memoryStore.listMemories(userId, { status: 'active' });
    this.saveCheckpoint(workflowId, 'evidence', userId, { retrievedCount: memories.length });
    const result = await routeLocalAiTask(task);
    this.saveCheckpoint(workflowId, 'execution', userId, { resultType: result.type });
    this.saveCheckpoint(workflowId, 'validation', userId, { valid: true });
    let committedCount = 0;
    if (options?.autoCommitMemories) {
      if (result.type === 'classify') {
        const mem = await memoryStore.addMemory({
          userId,
          kind: 'episode',
          content: `Reflection classified as ${result.data.category}: "${result.data.suggestedAction}"`,
          sourceEventIds: [workflowId],
          confidence: result.data.confidence,
          origin: 'ai_inferred',
          status: result.data.confidence > 0.85 ? 'active' : 'needs_confirmation',
          metadata: { keywords: result.data.keywords },
        });
        if (mem) committedCount++;
      } else if (result.type === 'extract_entities') {
        if (result.data.habitsMentioned.length > 0) {
          const mem = await memoryStore.addMemory({
            userId,
            kind: 'preference',
            content: `Habits mentioned: ${result.data.habitsMentioned.join(', ')}`,
            sourceEventIds: [workflowId],
            confidence: 0.8,
            origin: 'observed',
            status: 'active',
          });
          if (mem) committedCount++;
        }
      }
    }
    this.saveCheckpoint(workflowId, 'completed', userId, { committedCount });
    return {
      result,
      retrievedMemoriesCount: memories.length,
      committedMemoriesCount: committedCount,
    };
  }
  clusterNonSensitiveCohorts(
    cohortData: NonSensitiveCohortFeatures[]
  ): Record<string, { label: string; userIds: string[]; description: string }> {
    const eligible = cohortData.filter((c) => c.consentGranted);
    const morningHabitGroup: string[] = [];
    const highStreakGroup: string[] = [];
    const steadyPacedGroup: string[] = [];
    for (const user of eligible) {
      if (user.prefersMorningRoutine) {
        morningHabitGroup.push(user.userId);
      }
      if (user.streakCount >= 7) {
        highStreakGroup.push(user.userId);
      } else {
        steadyPacedGroup.push(user.userId);
      }
    }
    return {
      morning_routine_cohort: {
        label: 'Dawn Rhythms Cohort',
        userIds: morningHabitGroup,
        description: 'Users who consistently engage in morning check-ins and restorative starts.',
      },
      high_consistency_cohort: {
        label: 'Continuous Momentum Cohort',
        userIds: highStreakGroup,
        description: 'Users maintaining week-long or greater daily check-in streaks.',
      },
      gentle_paced_cohort: {
        label: 'Gentle Pacing Cohort',
        userIds: steadyPacedGroup,
        description: 'Users engaging periodically with flexible mindfulness sessions.',
      },
    };
  }
  private saveCheckpoint(
    workflowId: string,
    step: WorkflowCheckpoint['step'],
    userId: string,
    state: Record<string, unknown>
  ): void {
    const cp: WorkflowCheckpoint = {
      id: `${workflowId}_${step}`,
      workflowName: 'local_wellness_workflow',
      userId,
      step,
      stateJson: JSON.stringify(state),
      createdAt: new Date().toISOString(),
    };
    this.checkpoints.set(cp.id, cp);
  }
  getCheckpoints(workflowId: string): WorkflowCheckpoint[] {
    return Array.from(this.checkpoints.values()).filter((cp) => cp.id.startsWith(workflowId));
  }
}
export const statefulOrchestrator = new StatefulOrchestrator();
```

## `src/services/local-ai/tasks/classification.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';
export const MoodCategorySchema = z.enum([
  'grounded',
  'reflective',
  'tense',
  'energized',
  'fatigued',
]);
export type MoodCategory = z.infer<typeof MoodCategorySchema>;
export const ClassificationResultSchema = z.object({
  category: MoodCategorySchema,
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  suggestedAction: z.string(),
  reasoning: z.string().optional(),
});
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;
function deterministicClassify(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  if (
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('drained') ||
    lower.includes('sleepy') ||
    lower.includes('burnout')
  ) {
    return {
      category: 'fatigued',
      confidence: 0.85,
      keywords: ['tired', 'sleepy'],
      suggestedAction: 'Take a 10-minute restorative breathwork pause or wind down early.',
      reasoning: 'Matched high-fatigue keywords deterministically.',
    };
  }
  if (
    lower.includes('anxious') ||
    lower.includes('stressed') ||
    lower.includes('overwhelmed') ||
    lower.includes('tense') ||
    lower.includes('deadline')
  ) {
    return {
      category: 'tense',
      confidence: 0.88,
      keywords: ['stress', 'tension'],
      suggestedAction: 'Step outside for a short grounding walk or try box breathing.',
      reasoning: 'Matched stress and tension markers deterministically.',
    };
  }
  if (
    lower.includes('excited') ||
    lower.includes('hyped') ||
    lower.includes('great') ||
    lower.includes('pumped') ||
    lower.includes('active')
  ) {
    return {
      category: 'energized',
      confidence: 0.90,
      keywords: ['energized', 'active'],
      suggestedAction: 'Channel this vitality into a mindful training routine or creative work.',
      reasoning: 'Matched high-energy markers deterministically.',
    };
  }
  if (
    lower.includes('calm') ||
    lower.includes('peaceful') ||
    lower.includes('steady') ||
    lower.includes('good') ||
    lower.includes('fine')
  ) {
    return {
      category: 'grounded',
      confidence: 0.82,
      keywords: ['calm', 'steady'],
      suggestedAction: 'Maintain this gentle balance with your daily hydration and routines.',
      reasoning: 'Matched grounded balance markers deterministically.',
    };
  }
  return {
    category: 'reflective',
    confidence: 0.70,
    keywords: ['thoughtful', 'journaling'],
    suggestedAction: 'Reflect further on what supported you today.',
    reasoning: 'Defaulted to reflective posture in absence of acute triggers.',
  };
}
export async function classifyReflection(text: string): Promise<ClassificationResult> {
  if (!text || text.trim().length === 0) {
    return deterministicClassify('');
  }
  if (!LocalAI.isLoaded()) {
    return deterministicClassify(text);
  }
  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['grounded', 'reflective', 'tense', 'energized', 'fatigued'],
      },
      confidence: { type: 'number' },
      keywords: { type: 'array', items: { type: 'string' } },
      suggestedAction: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['category', 'confidence', 'keywords', 'suggestedAction'],
  });
  const prompt = `Analyze the emotional tone of this user note and classify it into one category: "grounded", "reflective", "tense", "energized", or "fatigued". Return strict JSON matching the schema.\n\nNote: "${text}"`;
  try {
    return await LocalAI.generateStructured<ClassificationResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an accurate, private on-device wellness classifier. Output only valid JSON.',
      validator: (raw) => ClassificationResultSchema.parse(raw),
    });
  } catch {
    return deterministicClassify(text);
  }
}
```

## `src/services/local-ai/tasks/entityExtraction.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';
export const ExtractedEntitiesSchema = z.object({
  symptoms: z.array(z.string()),
  activities: z.array(z.string()),
  metrics: z.record(z.string(), z.union([z.number(), z.string()])),
  habitsMentioned: z.array(z.string()),
  sentimentScore: z.number().min(-1).max(1),
});
export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;
export async function extractWellnessEntities(text: string): Promise<ExtractedEntities> {
  if (!text || text.trim().length === 0) {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }
  if (!LocalAI.isLoaded()) {
    const metrics: Record<string, number | string> = {};
    const sleepMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\s*(?:of\s*)?sleep/i);
    if (sleepMatch) metrics.sleepHours = parseFloat(sleepMatch[1]);
    const waterMatch = text.match(/(\d+)\s*(?:glasses|liters|l|cups)\s*(?:of\s*)?water/i);
    if (waterMatch) metrics.waterIntake = parseInt(waterMatch[1], 10);
    const stepsMatch = text.match(/(\d{3,6})\s*steps/i);
    if (stepsMatch) metrics.steps = parseInt(stepsMatch[1], 10);
    return {
      symptoms: [],
      activities: [],
      metrics,
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }
  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      symptoms: { type: 'array', items: { type: 'string' } },
      activities: { type: 'array', items: { type: 'string' } },
      metrics: { type: 'object' },
      habitsMentioned: { type: 'array', items: { type: 'string' } },
      sentimentScore: { type: 'number' },
    },
    required: ['symptoms', 'activities', 'metrics', 'habitsMentioned', 'sentimentScore'],
  });
  const prompt = `Extract structured wellness entities from this text: symptoms, physical activities, quantified metrics (sleep, water, steps), habits mentioned, and a sentiment score between -1.0 (negative) and 1.0 (positive).\n\nText: "${text}"`;
  try {
    return await LocalAI.generateStructured<ExtractedEntities>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device entity extractor. Output strictly valid JSON conforming to the schema.',
      validator: (raw) => ExtractedEntitiesSchema.parse(raw),
    });
  } catch {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }
}
```

## `src/services/local-ai/tasks/organizationSuggestions.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';
export const OrganizationSuggestionSchema = z.object({
  suggestedTags: z.array(z.string()),
  relatedRoutines: z.array(z.string()),
  categorySuggestion: z.string(),
  reasoning: z.string(),
});
export type OrganizationSuggestion = z.infer<typeof OrganizationSuggestionSchema>;
export async function suggestOrganization(content: string): Promise<OrganizationSuggestion> {
  if (!content || content.trim().length === 0) {
    return {
      suggestedTags: ['wellness'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Default organization category.',
    };
  }
  if (!LocalAI.isLoaded()) {
    const lower = content.toLowerCase();
    const tags: string[] = [];
    if (lower.includes('run') || lower.includes('walk') || lower.includes('workout') || lower.includes('gym')) {
      tags.push('fitness', 'movement');
    }
    if (lower.includes('water') || lower.includes('food') || lower.includes('meal') || lower.includes('diet')) {
      tags.push('nutrition');
    }
    if (lower.includes('sleep') || lower.includes('nap') || lower.includes('bed')) {
      tags.push('sleep-hygiene');
    }
    if (lower.includes('calm') || lower.includes('anxious') || lower.includes('breathe')) {
      tags.push('mindfulness');
    }
    if (tags.length === 0) tags.push('reflection');
    return {
      suggestedTags: tags,
      relatedRoutines: tags.map((t) => `${t}-check`),
      categorySuggestion: tags[0],
      reasoning: 'Deterministic keyword matching.',
    };
  }
  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      suggestedTags: { type: 'array', items: { type: 'string' } },
      relatedRoutines: { type: 'array', items: { type: 'string' } },
      categorySuggestion: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['suggestedTags', 'relatedRoutines', 'categorySuggestion', 'reasoning'],
  });
  const prompt = `Analyze this wellness entry and suggest up to 3 relevant tags, related routines, and a category:\n\n"${content}"`;
  try {
    return await LocalAI.generateStructured<OrganizationSuggestion>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device organization assistant. Return strictly valid JSON.',
      validator: (raw) => OrganizationSuggestionSchema.parse(raw),
    });
  } catch {
    return {
      suggestedTags: ['reflection'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Fallback organization.',
    };
  }
}
```

## `src/services/local-ai/tasks/semanticSearch.ts`

```ts
import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { MemoryRetrievalResult } from '../memory/types';
export async function searchMemoriesSemantically(
  userId: string,
  query: string,
  topK = 5
): Promise<MemoryRetrievalResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  if (!LocalAI.isLoaded()) {
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    const matched = all.filter((m) => m.content.toLowerCase().includes(qLower));
    return matched.slice(0, topK).map((mem) => ({
      memory: mem,
      similarity: 1.0,
      score: mem.confidence,
    }));
  }
  try {
    const queryVector = await LocalAI.embed(query);
    return await memoryStore.searchMemoriesByVector(userId, queryVector, topK, 0.50);
  } catch {
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    return all
      .filter((m) => m.content.toLowerCase().includes(qLower))
      .slice(0, topK)
      .map((mem) => ({
        memory: mem,
        similarity: 1.0,
        score: mem.confidence,
      }));
  }
}
```

## `src/services/local-ai/tasks/summarization.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';
export const SummaryResultSchema = z.object({
  headline: z.string(),
  bulletPoints: z.array(z.string()),
  mindfulTakeaway: z.string(),
});
export type SummaryResult = z.infer<typeof SummaryResultSchema>;
export async function summarizeWellnessJournal(notes: string[]): Promise<SummaryResult> {
  const combined = notes.filter((n) => n && n.trim().length > 0).join('\n---\n');
  if (!combined) {
    return {
      headline: 'A Quiet Day',
      bulletPoints: ['No self-reflection notes recorded today.'],
      mindfulTakeaway: 'Take a gentle breath and acknowledge your presence.',
    };
  }
  if (!LocalAI.isLoaded()) {
    const firstLine = notes[0].split('\n')[0].slice(0, 80);
    return {
      headline: firstLine || 'Daily Reflection',
      bulletPoints: notes.slice(0, 3).map((n) => n.slice(0, 100)),
      mindfulTakeaway: 'Consistency is found in returning gently each day.',
    };
  }
  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      headline: { type: 'string' },
      bulletPoints: { type: 'array', items: { type: 'string' } },
      mindfulTakeaway: { type: 'string' },
    },
    required: ['headline', 'bulletPoints', 'mindfulTakeaway'],
  });
  const prompt = `Synthesize these wellness journal reflections into a concise summary with a clear headline, 2-3 key bullet points, and one warm, encouraging mindful takeaway.\n\nJournal entries:\n${combined}`;
  try {
    return await LocalAI.generateStructured<SummaryResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device personal wellness synthesizer. Output strictly valid JSON.',
      validator: (raw) => SummaryResultSchema.parse(raw),
    });
  } catch {
    return {
      headline: 'Daily Reflection Digest',
      bulletPoints: notes.slice(0, 3),
      mindfulTakeaway: 'Every step taken with mindful intention counts.',
    };
  }
}
```

## `modules/local-ai/index.ts`

```ts
import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';
import type {
  CachedModelFile,
  ChecksumVerifyResult,
  DeviceCapabilities,
  GenerateRequest,
  GenerateResult,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  ModelLoadResult,
  RuntimeStatus,
  StreamCompleteEvent,
  StreamErrorEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './src/types';
export * from './src/types';
export * from './src/modelCatalog';
export * from './src/modelDownloader';
export * from './src/useLocalAI';
export type OcrScript = 'latin' | 'chinese' | 'japanese' | 'korean' | 'devanagari';
export function scriptForLanguage(code: string | null | undefined): OcrScript {
  if (code === 'zh') return 'chinese';
  if (code === 'ja') return 'japanese';
  if (code === 'ko') return 'korean';
  if (code === 'hi' || code === 'mr' || code === 'ne') return 'devanagari';
  return 'latin';
}
export interface ExtractedDocument {
  name: string | null;
  mime: string;
  method: 'text' | 'pdf-ocr' | 'image-ocr';
  pages: { page: number; text: string }[];
}
export interface DocumentChunkResult {
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
}
export function jsChunkDocument(
  text: string,
  targetChunkSize = 320,
  overlapChars = 40
): DocumentChunkResult[] {
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  if (cleaned.length <= targetChunkSize) {
    return [
      {
        index: 0,
        text: cleaned,
        startOffset: 0,
        endOffset: cleaned.length,
        tokenEstimate: Math.max(1, Math.round(cleaned.split(' ').filter(Boolean).length * 1.3)),
      },
    ];
  }
  const chunks: DocumentChunkResult[] = [];
  const sentences = cleaned.split(/(?<=[.!?\n])\s+/).filter(Boolean);
  let buffer = '';
  let chunkIdx = 0;
  let currentStart = 0;
  for (const sentence of sentences) {
    if (buffer.length + sentence.length > targetChunkSize && buffer.length > 0) {
      const chunkText = buffer.trim();
      chunks.push({
        index: chunkIdx++,
        text: chunkText,
        startOffset: currentStart,
        endOffset: currentStart + chunkText.length,
        tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
      });
      const overlapText =
        chunkText.length > overlapChars ? chunkText.slice(-overlapChars) : chunkText;
      currentStart += chunkText.length - overlapText.length;
      buffer = `${overlapText} `;
    }
    buffer += `${sentence} `;
  }
  if (buffer.trim()) {
    const chunkText = buffer.trim();
    chunks.push({
      index: chunkIdx,
      text: chunkText,
      startOffset: currentStart,
      endOffset: currentStart + chunkText.length,
      tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
    });
  }
  return chunks;
}
export function jsComputeTermFrequencies(text: string): Record<string, number> {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  const tf: Record<string, number> = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  return tf;
}
interface LocalAINative {
  isSupported: boolean;
  nativeEngine: string;
  sdkVersion: string;
  isAvailable(): boolean;
  getRuntimeStatus(): RuntimeStatus;
  getDeviceCapabilities(): DeviceCapabilities;
  verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult>;
  dmEnqueue?(url: string, fileName: string, title: string): number;
  dmQuery?(id: number): DurableDownloadState;
  dmRemove?(id: number): boolean;
  listCachedModels(): CachedModelFile[];
  deleteCachedModel(fileName: string): boolean;
  isLoaded(): boolean;
  isGenerating(): boolean;
  loadModel(
    modelPathOrAsset: string,
    isAsset: boolean,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult>;
  unloadModel(): Promise<boolean>;
  updateParams(params: Record<string, unknown>): boolean;
  generateText(prompt: string, context?: string, system?: string): Promise<GenerateResult>;
  generateStructured(
    prompt: string,
    schema?: string,
    context?: string,
    system?: string
  ): Promise<{ json: string; durationMs: number }>;
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean;
  cancelGeneration(): boolean;
  embed(text: string): Promise<number[]>;
  chunkDocument(
    text: string,
    targetChunkSize?: number,
    overlapChars?: number
  ): DocumentChunkResult[];
  computeTermFrequencies(text: string): Record<string, number>;
  extractDocumentText?(uri: string, mime: string | null, script: string | null): Promise<ExtractedDocument>;
  translateText?(text: string, target: string, source: string | null): Promise<{ text: string; source: string; target: string }>;
  addListener(eventName: string, listener: (event: unknown) => void): { remove: () => void };
  removeAllListeners(eventName: string): void;
}
const native: LocalAINative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<LocalAINative>('LocalAI');
        } catch {
          return null;
        }
      })()
    : null;
class LocalAIService {
  isAvailable(): boolean {
    try {
      return native?.isAvailable() ?? false;
    } catch {
      return false;
    }
  }
  getRuntimeStatus(): RuntimeStatus {
    if (!native) {
      return {
        isSupported: false,
        isLoaded: false,
        isGenerating: false,
        loadedModelPath: '',
        loadedFileName: '',
        modelSizeBytes: 0,
        modelSizeMb: 0,
        nativeEngine: 'unavailable',
        sdkVersion: '0.0.0',
      };
    }
    return native.getRuntimeStatus();
  }
  getDeviceCapabilities(): DeviceCapabilities {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.getDeviceCapabilities();
  }
  async verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.verifyModelChecksum(filePath, expectedSha256);
  }
  listCachedModels(): CachedModelFile[] {
    return native?.listCachedModels() ?? [];
  }
  deleteCachedModel(fileName: string): boolean {
    return native?.deleteCachedModel(fileName) ?? false;
  }
  isLoaded(): boolean {
    return native?.isLoaded() ?? false;
  }
  isGenerating(): boolean {
    return native?.isGenerating() ?? false;
  }
  async loadModel(
    modelPathOrAsset: string,
    isAsset = false,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.loadModel(modelPathOrAsset, isAsset, options);
  }
  async unloadModel(): Promise<boolean> {
    if (!native) return false;
    return native.unloadModel();
  }
  updateParams(params: Record<string, unknown>): boolean {
    return native?.updateParams(params) ?? false;
  }
  async generateText(request: GenerateRequest): Promise<string> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateText(request.prompt, request.context, request.system);
    return res.text;
  }
  async generateStructured<T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateStructured(
      request.prompt,
      request.schema,
      request.context,
      request.system
    );
    let parsed: unknown;
    try {
      parsed = JSON.parse(res.json);
    } catch (e: unknown) {
      throw new Error(
        `Failed to parse JSON response from local AI: ${e instanceof Error ? e.message : String(e)}. Raw output was: ${res.json}`
      );
    }
    if (request.validator) {
      return request.validator(parsed);
    }
    return parsed as T;
  }
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.startStream(turnId, prompt, context, system);
  }
  cancelGeneration(): boolean {
    return native?.cancelGeneration() ?? false;
  }
  async embed(text: string): Promise<number[]> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.embed(text);
  }
  async translateText(text: string, target: string, source?: string | null): Promise<{ text: string; source: string; target: string }> {
    if (!native?.translateText) throw new Error('Translation needs the latest app build.');
    return native.translateText(text, target, source ?? null);
  }
  async extractDocumentText(uri: string, mime?: string | null, script?: OcrScript | null): Promise<ExtractedDocument> {
    if (!native?.extractDocumentText) throw new Error('Reading files needs the latest app build.');
    return native.extractDocumentText(uri, mime ?? null, script ?? null);
  }
  chunkDocument(
    text: string,
    targetChunkSize = 320,
    overlapChars = 40
  ): DocumentChunkResult[] {
    if (!native) {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
    try {
      return native.chunkDocument(text, targetChunkSize, overlapChars);
    } catch {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
  }
  computeTermFrequencies(text: string): Record<string, number> {
    if (!native) {
      return jsComputeTermFrequencies(text);
    }
    try {
      return native.computeTermFrequencies(text);
    } catch {
      return jsComputeTermFrequencies(text);
    }
  }
  onToken(callback: (event: TokenEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onToken', callback as (e: unknown) => void);
  }
  onStreamComplete(callback: (event: StreamCompleteEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamComplete', callback as (e: unknown) => void);
  }
  onStreamError(callback: (event: StreamErrorEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamError', callback as (e: unknown) => void);
  }
  onModelLoadProgress(callback: (event: ModelLoadProgressEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onModelLoadProgress', callback as (e: unknown) => void);
  }
}
export interface DurableDownloadState {
  status: 'pending' | 'running' | 'paused' | 'done' | 'failed' | 'missing';
  bytes?: number;
  total?: number;
  localUri?: string;
  reason?: number;
}
export const DurableDownloads = native?.dmEnqueue
  ? {
      enqueue: (url: string, fileName: string, title: string) => native.dmEnqueue!(url, fileName, title),
      query: (id: number): DurableDownloadState => native.dmQuery!(id),
      remove: (id: number) => native.dmRemove!(id),
    }
  : null;
export const LocalAI = new LocalAIService();
export default LocalAI;
```

## `modules/local-ai/src/types.ts`

```ts
export interface DeviceCapabilities {
  totalRamBytes: number;
  totalRamMb: number;
  availableRamBytes: number;
  availableRamMb: number;
  thresholdBytes: number;
  isLowMemory: boolean;
  availableStorageBytes: number;
  availableStorageMb: number;
  cpuCores: number;
  optimalThreads: number;
  recommendedContextLength: number;
  safeModelCeilingBytes: number;
  safeModelCeilingMb: number;
  supportedAbis: string[];
  isArm64: boolean;
  deviceModel: string;
  androidSdk: number;
}
export interface RuntimeStatus {
  isSupported: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  loadedModelPath: string;
  loadedFileName: string;
  modelSizeBytes: number;
  modelSizeMb: number;
  nativeEngine: string;
  sdkVersion: string;
}
export interface ModelPreset {
  id: string;
  name: string;
  author: string;
  parameters: string;
  sizeBytes: number;
  sizeMb: number;
  minRamMb: number;
  role: 'chat' | 'reasoning' | 'embedding' | 'assistant';
  downloadUrl: string;
  expectedSha256: string;
  contextLength: number;
  license: string;
  description: string;
  needsNewerRuntime?: boolean;
}
export interface ModelLoadOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  force?: boolean;
}
export interface ModelLoadResult {
  success: boolean;
  modelPath: string;
  fileName: string;
  sizeBytes: number;
  sizeMb: number;
  durationMs: number;
  threads: number;
}
export interface GenerateRequest {
  prompt: string;
  context?: string;
  system?: string;
}
export interface GenerateResult {
  text: string;
  durationMs: number;
}
export interface StructuredGenerateRequest<T = unknown> {
  prompt: string;
  schema?: string;
  context?: string;
  system?: string;
  validator?: (data: unknown) => T;
}
export interface TokenEvent {
  turnId: string;
  token: string;
  index: number;
}
export interface StreamCompleteEvent {
  turnId: string;
  fullText: string;
  tokenCount: number;
  durationMs: number;
  tokensPerSecond: number;
}
export interface StreamErrorEvent {
  turnId: string;
  error: string;
}
export interface ModelLoadProgressEvent {
  progress: number;
  status: string;
}
export interface ChecksumVerifyResult {
  matches: boolean;
  actualSha256: string;
  expectedSha256: string;
}
export interface CachedModelFile {
  name: string;
  path: string;
  sizeBytes: number;
  sizeMb: number;
  lastModified: number;
}
export type LocalAIStatus =
  | 'unloaded'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'error';
```

## `modules/local-ai/src/modelCatalog.ts`

```ts
import type { ModelPreset } from './types';
export const MODEL_CATALOG: Record<string, ModelPreset> = {
  'qwen2.5-0.5b-instruct': {
    id: 'qwen2.5-0.5b-instruct',
    name: 'Qwen 2.5 0.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.5B',
    sizeBytes: 491_400_032,
    sizeMb: 469,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    expectedSha256: '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Fast everyday model: short answers, commands, summaries. Multilingual, including Hindi and Bengali.',
  },
  'qwen2.5-1.5b-instruct': {
    id: 'qwen2.5-1.5b-instruct',
    name: 'Qwen 2.5 1.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.5B',
    sizeBytes: 1_117_320_736,
    sizeMb: 1066,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    expectedSha256: '6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Better reasoning and longer answers for phones with 6 GB RAM or more. Slower to start.',
  },
  'gemma-3-1b-it': {
    id: 'gemma-3-1b-it',
    name: 'Gemma 3 1B Instruct (Q4_K_M)',
    author: 'Google',
    parameters: '1B',
    sizeBytes: 806_058_240,
    sizeMb: 769,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf',
    expectedSha256: '8ccc5cd1f1b3602548715ae25a66ed73fd5dc68a210412eea643eb20eb75a135',
    contextLength: 4096,
    license: 'Gemma Terms of Use',
    description: "Google's small Gemma model: warm, fluent replies and good instruction following.",
  },
  'qwen3-0.6b': {
    id: 'qwen3-0.6b',
    name: 'Qwen 3 0.6B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.6B',
    sizeBytes: 396_705_472,
    sizeMb: 378,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf',
    expectedSha256: 'ac2d97712095a558e31573f62f466a3f9d93990898b0ec79d7c974c1780d524a',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Newest tiny Qwen: quicker and smarter than Qwen 2.5 0.5B for its size. Thinking mode is turned off for speed.',
  },
  'qwen3-1.7b': {
    id: 'qwen3-1.7b',
    name: 'Qwen 3 1.7B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.7B',
    sizeBytes: 1_107_409_472,
    sizeMb: 1056,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf',
    expectedSha256: 'b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Strong small all-rounder for 6 GB phones: plans, explanations and multilingual replies.',
  },
  'llama-3.2-1b-instruct': {
    id: 'llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B Instruct (Q4_K_M)',
    author: 'Meta',
    parameters: '1B',
    sizeBytes: 807_694_464,
    sizeMb: 770,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    expectedSha256: '6f85a640a97cf2bf5b8e764087b1e83da0fdb51d7c9fab7d0fece9385611df83',
    contextLength: 4096,
    license: 'Llama 3.2 Community License',
    description: "Meta's small model built for phones: good at summaries and following instructions.",
  },
  'lfm2-1.2b': {
    id: 'lfm2-1.2b',
    name: 'LFM2 1.2B (Q4_K_M)',
    author: 'Liquid AI',
    parameters: '1.2B',
    sizeBytes: 730_893_248,
    sizeMb: 697,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/LiquidAI/LFM2-1.2B-GGUF/resolve/main/LFM2-1.2B-Q4_K_M.gguf',
    expectedSha256: '55175400e3f509a9616227afeffd58d87e80b9f628a5d3d54ada884d85221fed',
    contextLength: 4096,
    license: 'LFM Open License v1.0',
    description: 'Designed for on-device speed: fast first word on phone CPUs. Good for RAG answers over your notes.',
    needsNewerRuntime: true,
  },
  'gemma-4-e2b-it': {
    id: 'gemma-4-e2b-it',
    name: 'Gemma 4 E2B Instruct (Q4_0)',
    author: 'Google',
    parameters: 'E2B (2B effective)',
    sizeBytes: 2_841_481_184,
    sizeMb: 2710,
    minRamMb: 6000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_0.gguf',
    expectedSha256: '8e30dff3ac4c8434c49a7036fa15564bdbb6044e42bf04550bf1a096ad7e6a52',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: "Google's newest phone-sized Gemma: the best answers here, but a large download and slower on mid-range phones.",
    needsNewerRuntime: true,
  },
};
export const DEFAULT_CHAT_MODEL_ID = 'qwen2.5-0.5b-instruct';
export const MODEL_PRESETS = Object.values(MODEL_CATALOG);
export function getModelPresetById(id: string): ModelPreset | undefined {
  return MODEL_CATALOG[id];
}
export function getRecommendedModelForDevice(totalRamMb: number): ModelPreset {
  return totalRamMb >= 5500 ? MODEL_CATALOG['qwen2.5-1.5b-instruct'] : MODEL_CATALOG['qwen2.5-0.5b-instruct'];
}
export const getRecommendedModel = getRecommendedModelForDevice;
```

## `modules/local-ai/src/modelDownloader.ts`

```ts
import * as FileSystem from 'expo-file-system/legacy';
import type { ModelPreset } from './types';
export interface DownloadProgressInfo {
  progress: number;
  totalBytesWritten: number;
  totalBytesExpected: number;
}
export type DownloadProgressCallback = (info: DownloadProgressInfo) => void;
const MODELS_FOLDER = `${FileSystem.documentDirectory ?? ''}local_ai_models/`;
export async function ensureModelsDirectory(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_FOLDER, { intermediates: true });
  }
  return MODELS_FOLDER;
}
export function getLocalModelFilePath(modelId: string): string {
  return `${MODELS_FOLDER}${modelId}.gguf`;
}
export async function isModelDownloaded(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory && (info.size ?? 0) > 0;
}
export async function getDownloadedModelSize(modelId: string): Promise<number> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory ? (info.size ?? 0) : 0;
}
export interface ModelDownloadHandle {
  promise: Promise<string>;
  cancel: () => Promise<void>;
  pause: () => Promise<string | null>;
}
export function downloadModelWithProgress(
  preset: ModelPreset,
  availableStorageBytes: number,
  onProgress?: DownloadProgressCallback,
  verifyChecksumFn?: (filePath: string, expectedHash: string) => Promise<{ matches: boolean }>,
  resumeData?: string | null,
): ModelDownloadHandle {
  const requiredBytesWithHeadroom = Math.round(preset.sizeBytes * 1.25);
  if (availableStorageBytes > 0 && availableStorageBytes < requiredBytesWithHeadroom) {
    const availMb = Math.round(availableStorageBytes / (1024 * 1024));
    const reqMb = Math.round(requiredBytesWithHeadroom / (1024 * 1024));
    return {
      promise: Promise.reject(
        new Error(
          `Insufficient storage space to download model. Available: ${availMb}MB, Required: ${reqMb}MB.`
        )
      ),
      cancel: async () => {},
      pause: async () => null,
    };
  }
  const tmpPath = `${MODELS_FOLDER}${preset.id}.download.tmp`;
  const finalPath = getLocalModelFilePath(preset.id);
  let downloadResumable: FileSystem.DownloadResumable | null = null;
  let isCancelled = false;
  let isPaused = false;
  const promise = (async () => {
    await ensureModelsDirectory();
    const tmpInfo = await FileSystem.getInfoAsync(tmpPath);
    const canResume = !!resumeData && tmpInfo.exists;
    if (tmpInfo.exists && !canResume) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    }
    downloadResumable = FileSystem.createDownloadResumable(
      preset.downloadUrl,
      tmpPath,
      {},
      (downloadProgress) => {
        if (isCancelled) return;
        const total = downloadProgress.totalBytesExpectedToWrite;
        const written = downloadProgress.totalBytesWritten;
        const ratio = total > 0 ? Math.min(1, written / total) : 0;
        onProgress?.({
          progress: ratio,
          totalBytesWritten: written,
          totalBytesExpected: total,
        });
      },
      canResume ? (resumeData ?? undefined) : undefined,
    );
    const result = canResume ? await downloadResumable.resumeAsync() : await downloadResumable.downloadAsync();
    if (isPaused) throw new Error('paused');
    if (!result || isCancelled) {
      throw new Error('Download was cancelled or interrupted.');
    }
    const downloadedInfo = await FileSystem.getInfoAsync(tmpPath);
    const size = downloadedInfo.exists ? (downloadedInfo.size ?? 0) : 0;
    if (size === 0 || (preset.sizeBytes > 0 && Math.abs(size - preset.sizeBytes) > preset.sizeBytes * 0.01)) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
      throw new Error('Downloaded file is not the expected model. Please try again.');
    }
    if (preset.expectedSha256) {
      let matches = false;
      try {
        matches = !!verifyChecksumFn && (await verifyChecksumFn(tmpPath, preset.expectedSha256)).matches;
      } catch {
        matches = false;
      }
      if (!matches) {
        await FileSystem.deleteAsync(tmpPath, { idempotent: true });
        throw new Error('Model SHA-256 integrity check failed. File has been removed.');
      }
    }
    const existingFinal = await FileSystem.getInfoAsync(finalPath);
    if (existingFinal.exists) {
      await FileSystem.deleteAsync(finalPath, { idempotent: true });
    }
    try {
      await FileSystem.moveAsync({
        from: tmpPath,
        to: finalPath,
      });
    } catch {
      await FileSystem.copyAsync({ from: tmpPath, to: finalPath });
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    }
    return finalPath;
  })();
  const cancel = async () => {
    isCancelled = true;
    if (downloadResumable) {
      try {
        await downloadResumable.pauseAsync();
      } catch {}
    }
    try {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    } catch {}
  };
  const pause = async () => {
    if (!downloadResumable) return null;
    isPaused = true;
    try {
      await downloadResumable.pauseAsync();
      return downloadResumable.savable().resumeData ?? null;
    } catch {
      return null;
    }
  };
  return { promise, cancel, pause };
}
export async function deleteLocalModel(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  if (info.exists) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true });
    return true;
  }
  return false;
}
```

## `modules/local-ai/src/useLocalAI.ts`

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalAI } from '../index';
import type {
  DeviceCapabilities,
  GenerateRequest,
  LocalAIStatus,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  RuntimeStatus,
  StreamCompleteEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './types';
export interface UseLocalAIReturn {
  status: LocalAIStatus;
  isAvailable: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  runtimeStatus: RuntimeStatus | null;
  capabilities: DeviceCapabilities | null;
  loadProgress: ModelLoadProgressEvent | null;
  streamText: string;
  tokensPerSecond: number;
  lastDurationMs: number;
  error: string | null;
  loadModel: (modelPathOrAsset: string, isAsset?: boolean, options?: ModelLoadOptions) => Promise<boolean>;
  unloadModel: () => Promise<boolean>;
  generateText: (request: GenerateRequest) => Promise<string>;
  generateStream: (
    request: GenerateRequest,
    onTokenDelta?: (token: string) => void
  ) => Promise<string>;
  generateStructured: <T = unknown>(request: StructuredGenerateRequest<T>) => Promise<T>;
  embed: (text: string) => Promise<number[]>;
  stop: () => void;
  refreshStatus: () => void;
}
export function useLocalAI(): UseLocalAIReturn {
  const [status, setStatus] = useState<LocalAIStatus>('unloaded');
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgressEvent | null>(null);
  const [streamText, setStreamText] = useState('');
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const turnIdCounter = useRef(1);
  const activeStreamResolver = useRef<{
    resolve: (val: string) => void;
    reject: (err: Error) => void;
  } | null>(null);
  const tokenCallbackRef = useRef<((t: string) => void) | null>(null);
  const refreshStatus = useCallback(() => {
    const avail = LocalAI.isAvailable();
    setIsAvailable(avail);
    if (avail) {
      const rt = LocalAI.getRuntimeStatus();
      setRuntimeStatus(rt);
      setIsLoaded(rt.isLoaded);
      setIsGenerating(rt.isGenerating);
      setStatus(rt.isGenerating ? 'generating' : rt.isLoaded ? 'ready' : 'unloaded');
      try {
        const caps = LocalAI.getDeviceCapabilities();
        setCapabilities(caps);
      } catch {}
    }
  }, []);
  useEffect(() => {
    refreshStatus();
    const tokenSub = LocalAI.onToken((ev: TokenEvent) => {
      setStreamText((prev) => prev + ev.token);
      tokenCallbackRef.current?.(ev.token);
    });
    const completeSub = LocalAI.onStreamComplete((ev: StreamCompleteEvent) => {
      setIsGenerating(false);
      setStatus('ready');
      setTokensPerSecond(ev.tokensPerSecond);
      setLastDurationMs(ev.durationMs);
      activeStreamResolver.current?.resolve(ev.fullText);
      activeStreamResolver.current = null;
    });
    const errorSub = LocalAI.onStreamError((ev) => {
      setIsGenerating(false);
      setStatus('error');
      setError(ev.error);
      activeStreamResolver.current?.reject(new Error(ev.error));
      activeStreamResolver.current = null;
    });
    const progressSub = LocalAI.onModelLoadProgress((ev) => {
      setLoadProgress(ev);
    });
    return () => {
      tokenSub.remove();
      completeSub.remove();
      errorSub.remove();
      progressSub.remove();
    };
  }, [refreshStatus]);
  const loadModel = useCallback(
    async (modelPathOrAsset: string, isAsset = false, options?: ModelLoadOptions): Promise<boolean> => {
      setError(null);
      setStatus('loading');
      try {
        await LocalAI.loadModel(modelPathOrAsset, isAsset, options);
        setIsLoaded(true);
        setStatus('ready');
        refreshStatus();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [refreshStatus]
  );
  const unloadModel = useCallback(async (): Promise<boolean> => {
    try {
      const ok = await LocalAI.unloadModel();
      setIsLoaded(false);
      setStatus('unloaded');
      refreshStatus();
      return ok;
    } catch {
      return false;
    }
  }, [refreshStatus]);
  const generateText = useCallback(async (request: GenerateRequest): Promise<string> => {
    setError(null);
    setIsGenerating(true);
    setStatus('generating');
    try {
      const res = await LocalAI.generateText(request);
      setStatus('ready');
      setIsGenerating(false);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      setIsGenerating(false);
      throw err;
    }
  }, []);
  const generateStream = useCallback(
    async (request: GenerateRequest, onTokenDelta?: (token: string) => void): Promise<string> => {
      setError(null);
      setStreamText('');
      setTokensPerSecond(0);
      setIsGenerating(true);
      setStatus('generating');
      tokenCallbackRef.current = onTokenDelta ?? null;
      const turnId = `turn_${Date.now()}_${turnIdCounter.current++}`;
      return new Promise<string>((resolve, reject) => {
        activeStreamResolver.current = { resolve, reject };
        try {
          LocalAI.startStream(turnId, request.prompt, request.context, request.system);
        } catch (e: unknown) {
          activeStreamResolver.current = null;
          setIsGenerating(false);
          setStatus('error');
          const errorObj = e instanceof Error ? e : new Error(String(e));
          setError(errorObj.message);
          reject(errorObj);
        }
      });
    },
    []
  );
  const generateStructured = useCallback(
    async <T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> => {
      setError(null);
      setIsGenerating(true);
      setStatus('generating');
      try {
        const res = await LocalAI.generateStructured<T>(request);
        setStatus('ready');
        setIsGenerating(false);
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        setIsGenerating(false);
        throw err;
      }
    },
    []
  );
  const embed = useCallback(async (text: string): Promise<number[]> => {
    return LocalAI.embed(text);
  }, []);
  const stop = useCallback(() => {
    LocalAI.cancelGeneration();
    setIsGenerating(false);
    setStatus(isLoaded ? 'ready' : 'unloaded');
  }, [isLoaded]);
  return {
    status,
    isAvailable,
    isLoaded,
    isGenerating,
    runtimeStatus,
    capabilities,
    loadProgress,
    streamText,
    tokensPerSecond,
    lastDurationMs,
    error,
    loadModel,
    unloadModel,
    generateText,
    generateStream,
    generateStructured,
    embed,
    stop,
    refreshStatus,
  };
}
```

## `modules/local-ai/expo-module.config.json`

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.localai.LocalAIModule"]
  }
}
```

## `modules/local-ai/android/build.gradle`

```groovy
plugins {
  id 'com.android.library'
  id 'expo-module-gradle-plugin'
}
group = 'expo.modules.localai'
version = '0.1.0'
android {
  namespace "expo.modules.localai"
  defaultConfig {
    versionCode 1
    versionName "0.1.0"
    consumerProguardFiles 'consumer-rules.pro'
  }
  androidResources {
    noCompress += ['gguf', 'bin']
  }
}
dependencies {
  implementation 'com.llamatik:library-android:0.12.0'
  implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0'
  implementation 'com.google.mlkit:text-recognition:16.0.1'
  implementation 'com.google.mlkit:translate:17.0.3'
  implementation 'com.google.mlkit:language-id:17.0.6'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-chinese:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-japanese:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-korean:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-devanagari:16.0.1'
}
```

## `modules/local-ai/android/consumer-rules.pro`

```text
# Local AI: the module is created by name, and Llamatik's native code calls back into Kotlin
# (stream callbacks) and is looked up with Class.forName, so neither may be renamed or removed.
-keep class expo.modules.localai.** { *; }
-keep class com.llamatik.** { *; }
-keep interface com.llamatik.** { *; }
-dontwarn com.llamatik.**
```

## `modules/local-ai/android/src/main/java/expo/modules/localai/LocalAIModule.kt`

```kotlin
package expo.modules.localai
import android.os.Bundle
import android.util.Log
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch
import java.io.File
private const val TAG = "AnvaykoshAIModule"
class LocalAIModule : Module() {
  private val engine = AnvaykoshAiEngine()
  override fun definition() = ModuleDefinition {
    Name("LocalAI")
    Events(
      "onToken",
      "onStreamComplete",
      "onStreamError",
      "onModelLoadProgress"
    )
    Constant("isSupported") { true }
    Constant("nativeEngine") { "Anvaykosh AI (Llamatik/llama.cpp)" }
    Constant("engineBranding") { "Anvaykosh AI" }
    Constant("sdkVersion") { "1.0.0" }
    Function("isAvailable") {
      try {
        Class.forName("com.llamatik.library.platform.LlamaBridge") != null
      } catch (e: Throwable) {
        Log.e(TAG, "LlamaBridge is unavailable: ${e.message}", e)
        false
      }
    }
    Function("getRuntimeStatus") {
      mapOf(
        "isSupported" to true,
        "isLoaded" to engine.isModelLoaded.get(),
        "isGenerating" to engine.isGenerating.get(),
        "loadedModelPath" to (engine.loadedModelPath ?: ""),
        "loadedFileName" to (engine.loadedFileName ?: ""),
        "modelSizeBytes" to engine.loadedModelSizeBytes,
        "modelSizeMb" to (engine.loadedModelSizeBytes / (1024 * 1024)),
        "nativeEngine" to "Anvaykosh AI (Llamatik/llama.cpp)",
        "sdkVersion" to "1.0.0"
      )
    }
    Function("getDeviceCapabilities") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("ReactContext is unavailable")
      LlmMemoryGuard.getDeviceCapabilities(ctx)
    }
    Function("dmEnqueue") { url: String, fileName: String, title: String ->
      val ctx = appContext.reactContext ?: throw IllegalStateException("No context")
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      val dir = ctx.getExternalFilesDir("model_downloads") ?: throw IllegalStateException("No storage")
      File(dir, fileName).delete()
      val req = android.app.DownloadManager.Request(android.net.Uri.parse(url))
        .setTitle(title)
        .setDescription("On-device AI model for Thrivefold")
        .setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE)
        .setDestinationInExternalFilesDir(ctx, "model_downloads", fileName)
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(false)
      dm.enqueue(req).toDouble()
    }
    Function("dmQuery") { id: Double ->
      val ctx = appContext.reactContext ?: throw IllegalStateException("No context")
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      val c = dm.query(android.app.DownloadManager.Query().setFilterById(id.toLong()))
      c.use {
        if (!it.moveToFirst()) return@Function mapOf("status" to "missing")
        val st = it.getInt(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS))
        val done = it.getLong(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
        val total = it.getLong(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
        val local = it.getString(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_LOCAL_URI)) ?: ""
        val reason = it.getInt(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_REASON))
        val status = when (st) {
          android.app.DownloadManager.STATUS_SUCCESSFUL -> "done"
          android.app.DownloadManager.STATUS_FAILED -> "failed"
          android.app.DownloadManager.STATUS_PAUSED -> "paused"
          android.app.DownloadManager.STATUS_PENDING -> "pending"
          else -> "running"
        }
        mapOf(
          "status" to status,
          "bytes" to done.toDouble(),
          "total" to total.toDouble(),
          "localUri" to local,
          "reason" to reason,
        )
      }
    }
    Function("dmRemove") { id: Double ->
      val ctx = appContext.reactContext ?: return@Function false
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      dm.remove(id.toLong()) > 0
    }
    AsyncFunction("verifyModelChecksum") { filePath: String, expectedSha256: String, promise: Promise ->
      engine.scope.launch {
        try {
          val cleanPath = filePath.removePrefix("file://")
          val file = File(cleanPath)
          if (!file.exists() || !file.isFile) {
            promise.reject("FILE_NOT_FOUND", "File does not exist at $cleanPath", null)
            return@launch
          }
          val actualHash = AssetModelExtractor.computeSha256(file)
          val matches = actualHash.equals(expectedSha256.trim(), ignoreCase = true)
          promise.resolve(
            mapOf(
              "matches" to matches,
              "actualSha256" to actualHash,
              "expectedSha256" to expectedSha256
            )
          )
        } catch (e: Throwable) {
          promise.reject("CHECKSUM_ERROR", e.message ?: "Failed to verify checksum", e)
        }
      }
    }
    Function("listCachedModels") {
      val ctx = appContext.reactContext ?: return@Function emptyList<Map<String, Any>>()
      AssetModelExtractor.listCachedModels(ctx)
    }
    Function("deleteCachedModel") { fileName: String ->
      val ctx = appContext.reactContext ?: return@Function false
      AssetModelExtractor.deleteCachedModel(ctx, fileName)
    }
    Function("isLoaded") {
      engine.isModelLoaded.get()
    }
    Function("isGenerating") {
      engine.isGenerating.get()
    }
    AsyncFunction("loadModel") { modelPathOrAsset: String, isAsset: Boolean, options: Map<String, Any>?, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("CONTEXT_NULL", "ReactContext is not available", null)
        return@AsyncFunction
      }
      engine.scope.launch {
        try {
          sendProgress(0.2f, "Resolving model path...")
          val file = AssetModelExtractor.resolveModelPath(ctx, modelPathOrAsset, isAsset)
          val fileSize = file.length()
          if (!file.exists() || fileSize == 0L) {
            promise.reject("MODEL_NOT_FOUND", "Model file at ${file.absolutePath} is missing or empty.", null)
            return@launch
          }
          val force = options?.get("force") as? Boolean ?: false
          val memCheck = LlmMemoryGuard.checkMemorySafety(ctx, fileSize)
          if (!memCheck.isSafe && !force) {
            promise.reject(
              "INSUFFICIENT_MEMORY",
              memCheck.warningMessage ?: "Model requires more RAM than safely available.",
              null
            )
            return@launch
          }
          sendProgress(0.6f, "Loading model weights into Anvaykosh AI engine...")
          val temperature = (options?.get("temperature") as? Number)?.toFloat() ?: 0.7f
          val maxTokens = (options?.get("maxTokens") as? Number)?.toInt() ?: 512
          val topP = (options?.get("topP") as? Number)?.toFloat() ?: 0.9f
          val topK = (options?.get("topK") as? Number)?.toInt() ?: 40
          val repeatPenalty = (options?.get("repeatPenalty") as? Number)?.toFloat() ?: 1.1f
          val result = engine.loadModel(
            modelFile = file,
            temperature = temperature,
            maxTokens = maxTokens,
            topP = topP,
            topK = topK,
            repeatPenalty = repeatPenalty
          )
          result.onSuccess { durationMs ->
            sendProgress(1.0f, "Ready")
            promise.resolve(
              mapOf(
                "success" to true,
                "modelPath" to file.absolutePath,
                "fileName" to file.name,
                "sizeBytes" to fileSize,
                "sizeMb" to (fileSize / (1024 * 1024)),
                "durationMs" to durationMs,
                "engine" to "Anvaykosh AI"
              )
            )
          }.onFailure { err ->
            promise.reject("LOAD_FAILED", err.message ?: "Failed to initialize Anvaykosh AI model", err)
          }
        } catch (e: Throwable) {
          Log.e(TAG, "Failed to load model: ${e.message}", e)
          promise.reject("LOAD_EXCEPTION", e.message ?: "Unknown model loading exception", e)
        }
      }
    }
    AsyncFunction("unloadModel") { promise: Promise ->
      engine.scope.launch {
        val success = engine.unload()
        promise.resolve(success)
      }
    }
    AsyncFunction("generateText") { prompt: String, context: String?, system: String?, promise: Promise ->
      engine.scope.launch {
        val startTime = System.currentTimeMillis()
        val res = engine.generateText(prompt, context, system)
        val elapsed = System.currentTimeMillis() - startTime
        res.onSuccess { text ->
          promise.resolve(
            mapOf(
              "text" to text,
              "durationMs" to elapsed
            )
          )
        }.onFailure { err ->
          promise.reject("GENERATE_FAILED", err.message ?: "Inference error", err)
        }
      }
    }
    AsyncFunction("generateStructured") { prompt: String, schema: String?, context: String?, system: String?, promise: Promise ->
      engine.scope.launch {
        val startTime = System.currentTimeMillis()
        val res = engine.generateJson(prompt, schema, context, system)
        val elapsed = System.currentTimeMillis() - startTime
        res.onSuccess { json ->
          promise.resolve(
            mapOf(
              "json" to json,
              "durationMs" to elapsed
            )
          )
        }.onFailure { err ->
          promise.reject("GENERATE_JSON_FAILED", err.message ?: "JSON Inference error", err)
        }
      }
    }
    Function("startStream") { turnId: String, prompt: String, context: String?, system: String? ->
      engine.startStream(
        prompt = prompt,
        context = context,
        system = system,
        onDelta = { token ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("token", token)
          }
          sendEvent("onToken", bundle)
        },
        onComplete = { fullText, tokenCount, durationMs, tps ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("fullText", fullText)
            putInt("tokenCount", tokenCount)
            putLong("durationMs", durationMs)
            putDouble("tokensPerSecond", tps)
          }
          sendEvent("onStreamComplete", bundle)
        },
        onError = { err ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("error", err)
          }
          sendEvent("onStreamError", bundle)
        }
      )
      true
    }
    Function("cancelGeneration") {
      engine.cancel()
    }
    AsyncFunction("embed") { text: String, promise: Promise ->
      engine.scope.launch {
        val res = engine.embed(text)
        res.onSuccess { floatArray ->
          val list = floatArray.map { it.toDouble() }
          promise.resolve(list)
        }.onFailure { err ->
          promise.reject("EMBED_FAILED", err.message ?: "Embedding error", err)
        }
      }
    }
    AsyncFunction("extractDocumentText") { uri: String, mime: String?, script: String?, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "ReactContext is unavailable", null)
        return@AsyncFunction
      }
      Thread({
        try {
          promise.resolve(DocumentTextExtractor.extract(ctx, uri, mime, script))
        } catch (e: Throwable) {
          promise.reject("extract_failed", e.message ?: "Could not read this file", e)
        }
      }, "AnvaykoshDocReader").start()
    }
    AsyncFunction("translateText") { text: String, target: String, source: String?, promise: Promise ->
      Thread({
        try {
          promise.resolve(OnDeviceTranslator.translate(text, target, source))
        } catch (e: Throwable) {
          promise.reject("translate_failed", e.message ?: "Could not translate", e)
        }
      }, "AnvaykoshTranslate").start()
    }
    Function("chunkDocument") { text: String, targetChunkSize: Int?, overlapChars: Int? ->
      val chunks = AnvaykoshDocumentProcessor.chunkDocument(
        text = text,
        targetChunkSize = targetChunkSize ?: 320,
        overlapChars = overlapChars ?: 40
      )
      chunks.map { c ->
        mapOf(
          "index" to c.index,
          "text" to c.text,
          "startOffset" to c.startOffset,
          "endOffset" to c.endOffset,
          "tokenEstimate" to c.tokenEstimate
        )
      }
    }
    Function("computeTermFrequencies") { text: String ->
      AnvaykoshDocumentProcessor.computeTermFrequencies(text)
    }
    OnActivityDestroys {
      engine.scope.launch {
        engine.unload()
      }
    }
  }
  private fun sendProgress(progress: Float, status: String) {
    val bundle = Bundle().apply {
      putFloat("progress", progress)
      putString("status", status)
    }
    sendEvent("onModelLoadProgress", bundle)
  }
}
```

## `modules/local-ai/android/src/main/java/expo/modules/localai/AnvaykoshAiEngine.kt`

```kotlin
package expo.modules.localai
import android.os.SystemClock
import android.util.Log
import com.llamatik.library.platform.GenStream
import com.llamatik.library.platform.LlamaBridge
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
private const val TAG = "AnvaykoshAiEngine"
class AnvaykoshAiEngine {
  private val inferenceExecutor = Executors.newSingleThreadExecutor { r ->
    Thread(r, "AnvaykoshAi-InferenceWorker").apply { priority = Thread.NORM_PRIORITY + 1 }
  }
  val inferenceDispatcher = inferenceExecutor.asCoroutineDispatcher()
  val scope = CoroutineScope(SupervisorJob() + inferenceDispatcher)
  val isModelLoaded = AtomicBoolean(false)
  val isGenerating = AtomicBoolean(false)
  var loadedModelPath: String? = null
    private set
  var loadedFileName: String? = null
    private set
  var loadedModelSizeBytes: Long = 0L
    private set
  suspend fun loadModel(
    modelFile: File,
    temperature: Float = 0.7f,
    maxTokens: Int = 512,
    topP: Float = 0.9f,
    topK: Int = 40,
    repeatPenalty: Float = 1.1f
  ): Result<Long> = withContext(inferenceDispatcher) {
    try {
      if (isModelLoaded.get()) {
        unload()
      }
      val optimalThreads = LlmMemoryGuard.getOptimalThreadCount()
      LlamaBridge.updateGenerateParams(
        temperature = temperature,
        maxTokens = maxTokens,
        topP = topP,
        topK = topK,
        repeatPenalty = repeatPenalty
      )
      val startTime = SystemClock.elapsedRealtime()
      val success = LlamaBridge.initGenerateModel(modelFile.absolutePath)
      if (success) loadedPath = modelFile.absolutePath
      val durationMs = SystemClock.elapsedRealtime() - startTime
      if (!success) {
        return@withContext Result.failure(
          IllegalStateException("LlamaBridge failed to initialize model at ${modelFile.absolutePath}")
        )
      }
      isModelLoaded.set(true)
      loadedModelPath = modelFile.absolutePath
      loadedFileName = modelFile.name
      loadedModelSizeBytes = modelFile.length()
      Log.i(TAG, "Anvaykosh AI loaded ${modelFile.name} in ${durationMs}ms with $optimalThreads threads")
      Result.success(durationMs)
    } catch (e: Throwable) {
      Log.e(TAG, "Error loading model: ${e.message}", e)
      Result.failure(e)
    }
  }
  suspend fun unload(): Boolean = withContext(inferenceDispatcher) {
    try {
      if (isGenerating.get()) {
        cancel()
      }
      LlamaBridge.shutdown()
      isModelLoaded.set(false)
      loadedModelPath = null
      loadedFileName = null
      loadedModelSizeBytes = 0L
      System.gc()
      Log.i(TAG, "Anvaykosh AI native model unloaded successfully")
      true
    } catch (e: Throwable) {
      Log.w(TAG, "Error during model unload: ${e.message}")
      false
    }
  }
  fun cancel(): Boolean {
    return try {
      LlamaBridge.nativeCancelGenerate()
      isGenerating.set(false)
      Log.d(TAG, "Anvaykosh AI cancelled native generation")
      true
    } catch (e: Throwable) {
      Log.w(TAG, "Failed to cancel generation: ${e.message}")
      false
    }
  }
  private fun chatPrompt(prompt: String, context: String?, system: String?): String {
    val sys = listOfNotNull(
      system?.takeIf { it.isNotBlank() },
      context?.takeIf { it.isNotBlank() }?.let { "Context:\n$it" },
    ).joinToString("\n\n")
    val messages = buildList {
      if (sys.isNotBlank()) add("system" to sys)
      add("user" to prompt)
    }
    if (loadedPath.contains("gemma", ignoreCase = true)) {
      val user = if (sys.isNotBlank()) "$sys\n\n$prompt" else prompt
      return "<start_of_turn>user\n$user<end_of_turn>\n<start_of_turn>model\n"
    }
    if (loadedPath.contains("llama", ignoreCase = true)) {
      return "<|begin_of_text|>" + messages.joinToString("") { (role, text) ->
        "<|start_header_id|>$role<|end_header_id|>\n\n$text<|eot_id|>"
      } + "<|start_header_id|>assistant<|end_header_id|>\n\n"
    }
    val noThink = if (loadedPath.contains("qwen3", ignoreCase = true)) "<think>\n\n</think>\n\n" else ""
    return messages.joinToString("") { (role, text) -> "<|im_start|>$role\n$text<|im_end|>\n" } + "<|im_start|>assistant\n" + noThink
  }
  private fun cutAtStop(text: String): String {
    var end = text.length
    for (m in STOP_MARKERS) {
      val i = text.indexOf(m)
      if (i in 0 until end) end = i
    }
    return text.substring(0, end).trimEnd()
  }
  suspend fun generateText(
    prompt: String,
    context: String? = null,
    system: String? = null
  ): Result<String> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded in Anvaykosh AI engine"))
    }
    try {
      isGenerating.set(true)
      val result = cutAtStop(LlamaBridge.generate(chatPrompt(prompt, context, system)))
      isGenerating.set(false)
      Result.success(result)
    } catch (e: Throwable) {
      isGenerating.set(false)
      Result.failure(e)
    }
  }
  suspend fun generateJson(
    prompt: String,
    schema: String? = null,
    context: String? = null,
    system: String? = null
  ): Result<String> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded in Anvaykosh AI engine"))
    }
    try {
      isGenerating.set(true)
      val result = if (!system.isNullOrBlank() || !context.isNullOrBlank()) {
        LlamaBridge.generateJsonWithContext(system ?: "", context ?: "", prompt, schema)
      } else {
        LlamaBridge.generateJson(prompt, schema)
      }
      isGenerating.set(false)
      Result.success(result)
    } catch (e: Throwable) {
      isGenerating.set(false)
      Result.failure(e)
    }
  }
  suspend fun embed(text: String): Result<FloatArray> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded for embeddings in Anvaykosh AI"))
    }
    try {
      val vector: FloatArray? = LlamaBridge.embed(text)
      if (vector == null || vector.isEmpty()) {
        Result.failure(IllegalStateException("This model cannot make embeddings"))
      } else {
        Result.success(vector)
      }
    } catch (e: Throwable) {
      Result.failure(e)
    }
  }
  fun startStream(
    prompt: String,
    context: String? = null,
    system: String? = null,
    onDelta: (token: String) -> Unit,
    onComplete: (fullText: String, tokenCount: Int, durationMs: Long, tps: Double) -> Unit,
    onError: (errorMessage: String) -> Unit
  ) {
    if (!isModelLoaded.get()) {
      onError("No model is loaded in Anvaykosh AI engine")
      return
    }
    isGenerating.set(true)
    scope.launch {
      val startTime = SystemClock.elapsedRealtime()
      var tokenCount = 0
      val accumulator = java.lang.StringBuilder()
      var sent = 0
      var finished = false
      val streamCallback = object : GenStream {
        override fun onDelta(text: String) {
          if (finished) return
          tokenCount++
          accumulator.append(text)
          val clean = cutAtStop(accumulator.toString())
          if (STOP_MARKERS.any { accumulator.indexOf(it) >= 0 }) {
            if (clean.length > sent) onDelta(clean.substring(sent))
            sent = clean.length
            try { LlamaBridge.nativeCancelGenerate() } catch (_: Throwable) {}
            onComplete()
            return
          }
          val safe = accumulator.length - (accumulator.lastIndexOf("<").takeIf { it >= sent && accumulator.length - it < 16 }?.let { accumulator.length - it } ?: 0)
          if (safe > sent) {
            onDelta(accumulator.substring(sent, safe))
            sent = safe
          }
        }
        override fun onComplete() {
          if (finished) return
          finished = true
          isGenerating.set(false)
          val elapsedMs = SystemClock.elapsedRealtime() - startTime
          val tps = if (elapsedMs > 0) (tokenCount.toDouble() / (elapsedMs.toDouble() / 1000.0)) else 0.0
          onComplete(cutAtStop(accumulator.toString()), tokenCount, elapsedMs, tps)
        }
        override fun onError(message: String) {
          isGenerating.set(false)
          onError(message)
        }
      }
      try {
        LlamaBridge.generateStream(chatPrompt(prompt, context, system), streamCallback)
      } catch (e: Throwable) {
        isGenerating.set(false)
        streamCallback.onError(e.message ?: "Native stream failure")
      }
    }
  }
  @Volatile private var loadedPath: String = ""
  companion object {
    private val STOP_MARKERS = listOf("<|eot_id|>", "<|start_header_id|>", "<|im_end|>", "<|endoftext|>", "<end_of_turn>", "<|im_start|>", "<start_of_turn>", "\nHuman:", "\nUser:")
  }
}
```

## `modules/local-ai/android/src/main/java/expo/modules/localai/LlmMemoryGuard.kt`

```kotlin
package expo.modules.localai
import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import java.io.File
import kotlin.math.min
data class MemoryStats(
  val totalRamBytes: Long,
  val availableRamBytes: Long,
  val thresholdBytes: Long,
  val isLowMemory: Boolean
)
data class MemorySafetyResult(
  val isSafe: Boolean,
  val availableRamBytes: Long,
  val requiredBytes: Long,
  val warningMessage: String? = null
)
object LlmMemoryGuard {
  fun getMemoryStats(context: Context): MemoryStats {
    val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
    val memInfo = ActivityManager.MemoryInfo()
    activityManager?.getMemoryInfo(memInfo)
    return MemoryStats(
      totalRamBytes = memInfo.totalMem,
      availableRamBytes = memInfo.availMem,
      thresholdBytes = memInfo.threshold,
      isLowMemory = memInfo.lowMemory
    )
  }
  fun checkMemorySafety(
    context: Context,
    modelSizeBytes: Long,
    safetyBufferBytes: Long = 250L * 1024L * 1024L
  ): MemorySafetyResult {
    val stats = getMemoryStats(context)
    val estimatedAllocation = modelSizeBytes + (64L * 1024L * 1024L)
    val effectiveAvailable = stats.availableRamBytes - stats.thresholdBytes
    if (stats.isLowMemory) {
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Device is currently under critical system low-memory pressure."
      )
    }
    if (estimatedAllocation + safetyBufferBytes > effectiveAvailable) {
      val availMb = stats.availableRamBytes / (1024 * 1024)
      val reqMb = (estimatedAllocation + safetyBufferBytes) / (1024 * 1024)
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Insufficient RAM to safely load model. Available: ${availMb}MB, Required with headroom: ${reqMb}MB."
      )
    }
    return MemorySafetyResult(
      isSafe = true,
      availableRamBytes = stats.availableRamBytes,
      requiredBytes = estimatedAllocation
    )
  }
  fun getAvailableStorageBytes(context: Context): Long {
    val stat = StatFs(context.filesDir.absolutePath)
    return stat.availableBlocksLong * stat.blockSizeLong
  }
  fun getOptimalThreadCount(): Int {
    val cores = Runtime.getRuntime().availableProcessors()
    return when {
      cores >= 8 -> 4 // Typical big.LITTLE 8-core CPU: 4 performance threads
      cores >= 6 -> 4
      cores >= 4 -> 3
      cores >= 2 -> 2
      else -> 1
    }
  }
  fun getRecommendedContextLength(availableRamBytes: Long): Int {
    val ramGb = availableRamBytes / (1024L * 1024L * 1024L)
    return when {
      ramGb >= 6 -> 4096
      ramGb >= 3 -> 2048
      ramGb >= 2 -> 1024
      else -> 512
    }
  }
  fun getDeviceCapabilities(context: Context): Map<String, Any> {
    val stats = getMemoryStats(context)
    val storageBytes = getAvailableStorageBytes(context)
    val cores = Runtime.getRuntime().availableProcessors()
    val abis = Build.SUPPORTED_ABIS.toList()
    val isArm64 = abis.any { it.contains("arm64", ignoreCase = true) }
    val safeModelCeilingBytes = min(
      (stats.availableRamBytes * 0.45).toLong(),
      2500L * 1024L * 1024L
    )
    return mapOf(
      "totalRamBytes" to stats.totalRamBytes,
      "totalRamMb" to (stats.totalRamBytes / (1024 * 1024)),
      "availableRamBytes" to stats.availableRamBytes,
      "availableRamMb" to (stats.availableRamBytes / (1024 * 1024)),
      "thresholdBytes" to stats.thresholdBytes,
      "isLowMemory" to stats.isLowMemory,
      "availableStorageBytes" to storageBytes,
      "availableStorageMb" to (storageBytes / (1024 * 1024)),
      "cpuCores" to cores,
      "optimalThreads" to getOptimalThreadCount(),
      "recommendedContextLength" to getRecommendedContextLength(stats.availableRamBytes),
      "safeModelCeilingBytes" to safeModelCeilingBytes,
      "safeModelCeilingMb" to (safeModelCeilingBytes / (1024 * 1024)),
      "supportedAbis" to abis,
      "isArm64" to isArm64,
      "deviceModel" to "${Build.MANUFACTURER} ${Build.MODEL}",
      "androidSdk" to Build.VERSION.SDK_INT
    )
  }
}
```

## `supabase/functions/ai-chat/index.ts`

```ts
import { createClient } from 'npm:@supabase/supabase-js@2';
const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_TURNS = 12;
const MAX_CHARS = 2000;
const SYSTEM = `You are Thrive, the supportive wellbeing companion inside the Thrivefold app.
Be warm, brief (under 120 words unless asked), practical and plain-spoken.
You help with habits, movement, sleep, stress, food routines, cycle tracking questions and reflection.
You are not a doctor or therapist: never diagnose, never prescribe or dose medication, and suggest seeing a clinician when symptoms are severe, new, or worrying.
If someone mentions self-harm, suicide, abuse or danger, respond with care, encourage contacting local emergency services or a crisis line now, and suggest a trusted person.
Never guess someone's religion, caste, sexuality, ethnicity or other sensitive traits. Never ask for contact details.`;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
type Msg = { role: 'user' | 'assistant'; content: string };
async function gemini(messages: Msg[]): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}
async function openAiCompatible(url: string, key: string, model: string, messages: Msg[], extra: Record<string, string> = {}) {
  if (!key) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extra },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM }, ...messages],
      temperature: 0.6,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}
const PROVIDERS: { name: string; run: (m: Msg[]) => Promise<string | null> }[] = [
  { name: 'gemini', run: gemini },
  {
    name: 'groq',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'groq_2',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY_2'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'openrouter',
    run: (m) =>
      openAiCompatible('https://openrouter.ai/api/v1/chat/completions', env('OPENROUTER_API_KEY'), env('OPENROUTER_MODEL') || 'openai/gpt-4o-mini', m, {
        'HTTP-Referer': 'https://thrivefold.app',
        'X-Title': 'Thrivefold',
      }),
  },
];
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);
  let body: { messages?: Msg[] } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'invalid_request' }, 400);
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: null });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);
  for (const p of PROVIDERS) {
    let reply: string | null = null;
    try {
      reply = await p.run(messages);
    } catch {
      reply = null;
    }
    if (!reply) continue;
    return json({ reply, provider: p.name, remaining: Math.max(0, DAILY_LIMIT - (count as number)) });
  }
  return json({ error: 'unavailable' }, 503);
});
```

## `supabase/migrations/20261026000015_thrivefold_ai_usage.sql`

```sql
-- ============================================================================
-- Thrivefold migration 15: cloud AI usage ledger (spec: cloud AI optional, consent-controlled,
-- cost-capped). The ai-chat function counts requests per person per day with the service role;
-- nobody can read or write this table from the app. No message content is stored.
-- ============================================================================
create table if not exists public.thrivefold_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  requests int not null default 0,
  provider text,
  primary key (user_id, day)
);
alter table public.thrivefold_ai_usage enable row level security;
revoke all on public.thrivefold_ai_usage from anon, authenticated;
-- Atomically counts one request and returns the new total (called by the edge function only).
create or replace function public.tf_ai_count(p_user uuid, p_provider text)
returns int language sql security definer set search_path = '' as $$
  insert into public.thrivefold_ai_usage (user_id, day, requests, provider)
  values (p_user, current_date, 1, p_provider)
  on conflict (user_id, day) do update
    set requests = public.thrivefold_ai_usage.requests + 1, provider = excluded.provider
  returning requests;
$$;
revoke all on function public.tf_ai_count(uuid, text) from public, anon, authenticated;
```

## `tests/unit/local-ai.test.ts`

```ts
import { evaluateDeterministicRoutine } from '../../src/domain/ai/deterministicRules';
import { classifyLocalInput } from '../../src/domain/ai/localClassifier';
describe('Thrivefold Local-First AI & Deterministic Task Rules', () => {
  test('P0: High stress and low energy trigger breathing recommendation without cloud', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 2,
      mood: 4,
      stress: 9,
      experience: 'women_health',
    });
    expect(recommendation.category).toBe('breathing');
    expect(recommendation.title).toContain('Parasympathetic');
    expect(recommendation.aiExplanation.source).toBe('local_deterministic');
  });
  test('P0: Severe pain triggers clinical signposting and halts strenuous workouts', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 5,
      stress: 5,
      physicalPainOrLimitation: 'Severe acute pelvic pain',
      experience: 'women_health',
    });
    expect(recommendation.category).toBe('rest');
    expect(recommendation.title).toContain('Professional Consultation Signpost');
    expect(recommendation.cautionNotice).toContain('Thrivefold does not provide clinical diagnosis');
  });
  test('P0: Men health experience generates posture mobility routine', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 6,
      stress: 5,
      experience: 'men_health',
    });
    expect(recommendation.category).toBe('movement');
    expect(recommendation.title).toContain('Desk Worker');
  });
  test('P0: Local classifier detects crisis signal on device and flags alert', () => {
    const classification = classifyLocalInput({ text: 'I feel completely hopeless and want to end my life' });
    expect(classification.isCrisisAlert).toBe(true);
    expect(classification.intent).toBe('crisis_signal');
    expect(classification.result.text).toContain('Immediate care alert');
  });
});
```

## `tests/unit/local-ai-subsystem.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));
jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    openDatabaseAsync: jest.fn(async () => mockDb),
  };
});
import {
  cosineSimilarity,
  euclideanDistance,
  topKSimilar,
  normalizeVector,
} from '../../src/services/local-ai/memory/vectorMath';
import { isConversationRecallQuery } from '../../src/domain/ai/localRetrieval';
import {
  MODEL_PRESETS,
  getModelPresetById,
  getRecommendedModel,
} from '../../modules/local-ai/src/modelCatalog';
import { classifyReflection } from '../../src/services/local-ai/tasks/classification';
import { extractWellnessEntities } from '../../src/services/local-ai/tasks/entityExtraction';
import { summarizeWellnessJournal } from '../../src/services/local-ai/tasks/summarization';
import { suggestOrganization } from '../../src/services/local-ai/tasks/organizationSuggestions';
import {
  checkCrisisInterception,
  routeLocalAiTask,
} from '../../src/services/local-ai/orchestration/taskRouter';
import {
  statefulOrchestrator,
  type NonSensitiveCohortFeatures,
} from '../../src/services/local-ai/orchestration/langGraphOrchestrator';
describe('Local AI - Vector Math & Similarity Engine', () => {
  test('P0: Cosine similarity of identical vectors is 1.0', () => {
    const v1 = [0.2, 0.5, 0.8, -0.3];
    const sim = cosineSimilarity(v1, v1);
    expect(sim).toBeCloseTo(1.0, 5);
  });
  test('P0: Cosine similarity of orthogonal vectors is 0.0', () => {
    const v1 = [1, 0, 0];
    const v2 = [0, 1, 0];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(0.0, 5);
  });
  test('P0: Cosine similarity of opposite vectors is -1.0', () => {
    const v1 = [1, 2, 3];
    const v2 = [-1, -2, -3];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(-1.0, 5);
  });
  test('P0: Handles zero-magnitude or empty vectors gracefully without NaN', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0.0);
    expect(cosineSimilarity([], [])).toBe(0.0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0.0);
  });
  test('P0: Euclidean distance between vectors', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5.0, 5);
    expect(euclideanDistance([1, 1], [1, 1])).toBeCloseTo(0.0, 5);
    expect(euclideanDistance([1], [1, 2])).toBe(Number.POSITIVE_INFINITY);
  });
  test('P0: Normalizes vector to unit length', () => {
    const v = [3, 4];
    const norm = normalizeVector(v);
    expect(norm[0]).toBeCloseTo(0.6, 5);
    expect(norm[1]).toBeCloseTo(0.8, 5);
    expect(cosineSimilarity(norm, norm)).toBeCloseTo(1.0, 5);
  });
  test('P0: topKSimilar ranks candidate embeddings descending by similarity', () => {
    const query = [1, 0, 0];
    const candidates = [
      { id: 'c1', vector: [0, 1, 0] },     // orthogonal -> 0.0
      { id: 'c2', vector: [0.9, 0.1, 0] }, // high match -> ~0.99
      { id: 'c3', vector: [0.5, 0.5, 0] }, // moderate match -> ~0.707
      { id: 'c4', vector: [-1, 0, 0] },    // opposite -> -1.0
    ];
    const results = topKSimilar(query, candidates, 2, 0.1);
    expect(results).toHaveLength(2);
    expect(results[0].item.id).toBe('c2');
    expect(results[1].item.id).toBe('c3');
  });
});
describe('Local AI - Model Catalog & Hardware Suitability', () => {
  test('P0: Catalog lists real downloadable models with their published SHA-256', () => {
    expect(MODEL_PRESETS.length).toBe(8);
    for (const m of MODEL_PRESETS) {
      expect(m.downloadUrl).toMatch(/^https:\/\/huggingface\.co\/(Qwen|ggml-org|unsloth|bartowski|LiquidAI)\/.+\.gguf$/);
      expect(m.sizeMb).toBe(Math.round(m.sizeBytes / 1024 / 1024));
      expect(m.expectedSha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(getModelPresetById('qwen2.5-0.5b-instruct')?.sizeBytes).toBe(491_400_032);
    expect(getModelPresetById('gemma-3-1b-it')?.sizeBytes).toBe(806_058_240);
    expect(getModelPresetById('gemma-4-e2b-it')?.sizeBytes).toBe(2_841_481_184);
    expect(getModelPresetById('gemma-4-e2b-it')?.needsNewerRuntime).toBe(true);
  });
  test('P0: Recommends the larger model only with enough RAM', () => {
    expect(getRecommendedModel(4000).id).toBe('qwen2.5-0.5b-instruct');
    expect(getRecommendedModel(6000).id).toBe('qwen2.5-1.5b-instruct');
  });
});
describe('Local AI - Structured AI Tasks & Fallbacks', () => {
  test('P0: classifyReflection classifies high stress/anxiety deterministically', async () => {
    const result = await classifyReflection(
      'Work was overwhelming today, heart racing with anxiety and strict deadlines'
    );
    expect(result.category).toBe('tense');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.suggestedAction).toContain('box breathing');
  });
  test('P0: classifyReflection classifies fatigue deterministically', async () => {
    const result = await classifyReflection(
      'Feeling completely drained, sleepy and exhausted after a sleepless night'
    );
    expect(result.category).toBe('fatigued');
    expect(result.suggestedAction).toContain('restorative breathwork');
  });
  test('P0: extractWellnessEntities extracts quantified sleep, water and steps', async () => {
    const result = await extractWellnessEntities(
      'Logged 7.5 hours of sleep, drank 3 liters of water, and reached 10000 steps today.'
    );
    expect(result.metrics.sleepHours).toBe(7.5);
    expect(result.metrics.waterIntake).toBe(3);
    expect(result.metrics.steps).toBe(10000);
  });
  test('P0: summarizeWellnessJournal produces clean bulleted insights', async () => {
    const notes = [
      'Morning: Slept well, went for a run.',
      'Afternoon: Busy day at work, felt tight in the neck.',
      'Evening: Gentle yoga, felt much more relaxed.',
    ];
    const summary = await summarizeWellnessJournal(notes);
    expect(summary.headline).toBeDefined();
    expect(summary.bulletPoints.length).toBeGreaterThan(0);
    expect(summary.mindfulTakeaway).toBeDefined();
  });
  test('P0: suggestOrganization clusters items into clear tags and routines', async () => {
    const content = 'Did a 5km morning run and finished with upper body gym workout';
    const suggestions = await suggestOrganization(content);
    expect(suggestions.suggestedTags).toContain('fitness');
    expect(suggestions.categorySuggestion).toBe('fitness');
  });
});
describe('Local AI - Safety Circuit Breaker & Task Router', () => {
  test('P0: Safety circuit breaker intercepts self-harm and provides crisis line', () => {
    const crisis = checkCrisisInterception('I feel completely hopeless and want to end my life');
    expect(crisis.isCrisis).toBe(true);
    expect(crisis.helplineNotice).toContain('988');
  });
  test('P0: Task router catches crisis phrases and halts standard processing', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Thinking about suicide and self harm',
    });
    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('tense');
      expect(result.data.keywords).toContain('crisis_intercepted');
      expect(result.data.suggestedAction).toContain('988');
    }
  });
  test('P0: Task router executes normal classification task', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Feeling peaceful, calm and steady after meditation',
    });
    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('grounded');
      expect(result.data.keywords).toContain('calm');
    }
  });
});
describe('Local AI - Stateful LangGraph Orchestration & Cohort Clustering', () => {
  test('P0: StatefulOrchestrator tracks checkpoints across pipeline execution', async () => {
    const res = await statefulOrchestrator.runWorkflow('usr-test-1', {
      type: 'classify',
      text: 'Had an active and energized day at the park',
    });
    expect(res.result.type).toBe('classify');
    if (res.result.type === 'classify') {
      expect(res.result.data.category).toBe('energized');
    }
  });
  test('P0: Non-sensitive cohort clustering clusters users strictly on consented behavioral features', () => {
    const mockCohortData: NonSensitiveCohortFeatures[] = [
      {
        userId: 'u1',
        activeExperience: 'women',
        weeklyCheckInFrequency: 6,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 25,
        streakCount: 14,
        consentGranted: true,
      },
      {
        userId: 'u2',
        activeExperience: 'men',
        weeklyCheckInFrequency: 2,
        prefersMorningRoutine: false,
        averageWorkoutDurationMinutes: 15,
        streakCount: 3,
        consentGranted: true,
      },
      {
        userId: 'u3',
        activeExperience: 'all',
        weeklyCheckInFrequency: 5,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 30,
        streakCount: 2,
        consentGranted: false, // Opted out
      },
    ];
    const clusters = statefulOrchestrator.clusterNonSensitiveCohorts(mockCohortData);
    expect(clusters.morning_routine_cohort.userIds).toContain('u1');
    expect(clusters.morning_routine_cohort.userIds).not.toContain('u3');
    expect(clusters.high_consistency_cohort.userIds).toContain('u1');
    expect(clusters.gentle_paced_cohort.userIds).toContain('u2');
  });
});
describe('Local AI - Hybrid RAG Pipeline', () => {
  const {
    getExerciseCatalogDocuments,
    rankSparseBM25,
    retrieveHybridEvidence,
    answerWithHybridRag,
  } = require('../../src/services/local-ai/rag/hybridRagPipeline') as typeof import('../../src/services/local-ai/rag/hybridRagPipeline');
  test('P0: getExerciseCatalogDocuments indexes exercise library with steps and safety', () => {
    const docs = getExerciseCatalogDocuments();
    expect(docs.length).toBeGreaterThan(20);
    const squatDoc = docs.find((d) => d.id.includes('squat'));
    expect(squatDoc).toBeDefined();
    expect(squatDoc?.content).toContain('Steps:');
    expect(squatDoc?.sourceType).toBe('exercise_catalog');
  });
  test('P0: rankSparseBM25 ranks documents relevant to query keyword', () => {
    const docs = getExerciseCatalogDocuments();
    const hits = rankSparseBM25(docs, 'squat knees');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].doc.title.toLowerCase()).toContain('squat');
    expect(hits[0].score).toBeGreaterThan(0);
  });
  test('P0: retrieveHybridEvidence fuses results with RRF scores', async () => {
    const hits = await retrieveHybridEvidence('usr-rag-1', 'squat posture', 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].hybridScore).toBeGreaterThan(0);
    expect(hits[0].snippet).toBeDefined();
  });
  test('P0: answerWithHybridRag answers with verified citations', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'How do I do a squat safely?');
    expect(res.isGrounded).toBe(true);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0]).toContain('Exercise Catalog');
    expect(res.confidence).toBeGreaterThan(0.7);
  });
  test('P0: answerWithHybridRag stays honest when no records match', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'quantum electrodynamics astrophysics');
    expect(res.isGrounded).toBe(false);
    expect(res.answer).toContain('not find enough relevant records');
    expect(res.citations).toHaveLength(0);
  });
});
describe('Conversation history retrieval scope', () => {
  test('uses conversation history only for explicit recall questions', () => {
    expect(isConversationRecallQuery('What did you tell me about sleep last time?')).toBe(true);
    expect(isConversationRecallQuery('Tell me how to improve my sleep')).toBe(false);
  });
});
```

## `tests/unit/modelImport.test.ts`

```ts
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///data/' }));
import { importedFileOf, isImportedId, safeModelName } from '../../src/services/ai/modelImport';
describe('model import names', () => {
  it('makes safe .gguf file names', () => {
    expect(safeModelName('Qwen3 0.6B (Q4_K_M).GGUF')).toBe('Qwen3-0.6B-Q4_K_M.gguf');
    expect(safeModelName('???')).toBe('model.gguf');
  });
  it('recognises imported ids', () => {
    expect(isImportedId('import:a.gguf')).toBe(true);
    expect(isImportedId('qwen2.5-0.5b-instruct')).toBe(false);
    expect(importedFileOf('import:a.gguf')).toBe('a.gguf');
  });
});
```

## `tests/unit/byok.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
  Linking: { canOpenURL: jest.fn(async () => true), openURL: jest.fn(async () => {}) },
}));
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));
import { pickGeminiKey, pickGroqKey, pickOpenRouterKey, isLocalOnly, hasAiKeys, setRuntimeUserKeys } from '../../src/services/ai/env';
import { useRootStore } from '../../src/stores/useRootStore';
describe('BYOK & Local-First AI Architecture', () => {
  beforeEach(() => {
    useRootStore.getState().clearAllUserApiKeys();
    useRootStore.getState().setAiDeliveryMode('local_only');
  });
  test('defaults to local_only mode with empty userApiKeys', () => {
    const state = useRootStore.getState();
    expect(state.aiDeliveryMode).toBe('local_only');
    expect(state.userApiKeys).toEqual({});
    expect(isLocalOnly()).toBe(true);
  });
  test('local_only mode suppresses external AI keys', () => {
    expect(isLocalOnly()).toBe(true);
    expect(pickGeminiKey()).toBe('');
    expect(pickGroqKey()).toBe('');
    expect(pickOpenRouterKey()).toBe('');
    expect(hasAiKeys()).toBe(false);
  });
  test('setUserApiKey persists user credentials and prioritizes user key', () => {
    const store = useRootStore.getState();
    store.setUserApiKey('gemini', 'user_custom_gemini_key_123');
    store.setUserApiKey('groq', 'user_custom_groq_key_456');
    expect(useRootStore.getState().userApiKeys.gemini).toBe('user_custom_gemini_key_123');
    expect(useRootStore.getState().userApiKeys.groq).toBe('user_custom_groq_key_456');
    expect(pickGeminiKey()).toBe('user_custom_gemini_key_123');
    expect(pickGroqKey()).toBe('user_custom_groq_key_456');
  });
  test('clearUserApiKey cleanly removes single provider key', () => {
    const store = useRootStore.getState();
    store.setUserApiKey('gemini', 'key_gemini');
    store.setUserApiKey('openrouter', 'key_or');
    store.clearUserApiKey('gemini');
    expect(useRootStore.getState().userApiKeys.gemini).toBeUndefined();
    expect(useRootStore.getState().userApiKeys.openrouter).toBe('key_or');
  });
  test('switching delivery mode between local_only and byok', () => {
    const store = useRootStore.getState();
    store.setAiDeliveryMode('byok');
    expect(useRootStore.getState().aiDeliveryMode).toBe('byok');
    expect(isLocalOnly()).toBe(false);
    store.setAiDeliveryMode('local_only');
    expect(useRootStore.getState().aiDeliveryMode).toBe('local_only');
    expect(isLocalOnly()).toBe(true);
  });
});
```

## `tests/unit/appKnowledge.test.ts`

```ts
import { ARTICLES } from '../../src/content/learn';
import {
  chatDoc,
  hashText,
  lastDays,
  learnDocs,
  recentDaysDoc,
  recentDaysLines,
  screensDoc,
  standingLines,
  type RecentDaysInput,
} from '../../src/domain/assistant/appKnowledge';
import { DESTINATIONS, findScreenFor } from '../../src/domain/search/destinations';
import { plainText } from '../../src/domain/assistant/plainText';
import { PERSONAS, personaFor } from '../../src/domain/assistant/personas';
const NOW = new Date(2026, 9, 30, 10, 0, 0);
const empty: RecentDaysInput = {
  checkInHistory: [],
  hydration: {},
  hydrationTargetGlasses: 8,
  mealLogs: [],
  medications: [],
  journalEntries: [],
  deviceReadings: [],
  todayQuests: [],
  level: 1,
  xp: 0,
  streak: 0,
};
describe('app knowledge documents', () => {
  it('lists the last days as local dates, newest first, across a month change', () => {
    expect(lastDays(new Date(2026, 10, 2), 3)).toEqual(['2026-11-02', '2026-11-01', '2026-10-31']);
  });
  it('describes every screen with its route', () => {
    const doc = screensDoc(DESTINATIONS);
    expect(doc.key).toBe('app:screens');
    for (const d of DESTINATIONS) expect(doc.text).toContain(d.route);
  });
  it('makes one document per Learn article and keeps the title on every paragraph', () => {
    const docs = learnDocs(ARTICLES);
    expect(docs).toHaveLength(ARTICLES.length);
    const first = docs[0].text.split('\n').slice(1);
    expect(first.every((line) => line.startsWith(ARTICLES[0].title))).toBe(true);
  });
  it('summarises only days with real logs and says so when nothing is logged', () => {
    expect(recentDaysLines(empty, NOW)).toEqual([]);
    expect(recentDaysDoc(empty, NOW).text).toContain('Nothing logged in the last 7 days.');
    const s: RecentDaysInput = {
      ...empty,
      checkInHistory: [{ date: '2026-10-29', energy: 6, mood: 7, stress: 3, sleepHours: 7.5, symptoms: ['headache'] }],
      hydration: { '2026-10-30': 5 },
      mealLogs: [{ date: '2026-10-30', type: 'breakfast', items: [] }],
      deviceReadings: [{ date: '2026-10-30', kind: 'steps', value: 4210.4, unit: 'count', source: 'health_connect' }],
      journalEntries: [{ createdAt: '2026-10-29T12:00:00.000Z' }],
      todayQuests: [],
    };
    const lines = recentDaysLines(s, NOW);
    expect(lines[0]).toBe('2026-10-30: water 5 of 8 glasses; meals logged: breakfast; steps 4210 (health_connect)');
    expect(lines[1]).toContain('mood 7/10');
    expect(lines[1]).toContain('symptoms headache');
    expect(lines[1]).toContain('1 journal entry');
    expect(recentDaysLines({ ...s, hydration: { '2026-10-01': 3 } }, NOW, 7).join()).not.toContain('2026-10-01');
  });
  it('lists medicines and today’s quests', () => {
    const lines = standingLines({
      ...empty,
      medications: [{ name: 'Vitamin D', dose: '1 tablet', time: '09:00' }],
      todayQuests: [
        { title: 'Drink water', isCompleted: true, status: 'completed' },
        { title: 'Walk 10 minutes', isCompleted: false, status: 'assigned' },
        { title: 'Stretch', isCompleted: false, status: 'skipped' },
      ],
    });
    expect(lines).toContain('Medicines: Vitamin D 1 tablet at 09:00');
    expect(lines).toContain("Today's open quests: Walk 10 minutes");
    expect(lines).toContain("Today's finished quests: Drink water");
  });
  it('hashes text stably', () => {
    expect(hashText('abc')).toBe(hashText('abc'));
    expect(hashText('abc')).not.toBe(hashText('abd'));
  });
  it('keeps the coach conversation, newest last, and says when there is none', () => {
    expect(chatDoc([]).text).toBe('No conversations with the coach yet.');
    const at = new Date(2026, 9, 30, 9).getTime();
    const doc = chatDoc([
      { who: 'you', text: 'How did  I sleep?', at },
      { who: 'coach', text: 'You slept 7.5 hours.', at },
    ]);
    expect(doc.text).toBe('2026-10-30 You asked: How did I sleep?\n2026-10-30 Coach said: You slept 7.5 hours.');
  });
  it('has one focus per role and falls back to the coach', () => {
    expect(new Set(PERSONAS.map((p) => p.id)).size).toBe(PERSONAS.length);
    expect(personaFor(undefined).id).toBe('coach');
    expect(personaFor('health').focus).toMatch(/never diagnose/i);
  });
});
describe('coach helpers', () => {
  it('finds the screen for "where do I" questions', () => {
    expect(findScreenFor('where do I add my medicines')?.route).toBe('/(app)/health/medications');
    expect(findScreenFor('how do I log water')?.route).toBe('/(app)/health/nutrition');
    expect(findScreenFor('what is a good bedtime')).toBeNull();
  });
  it('turns markdown into plain text', () => {
    expect(plainText('Go to the **Medicines** section.\n- one\n## Head')).toBe('Go to the Medicines section.\n• one\nHead');
  });
});
it('leaves how-to coaching questions to the coach', () => {
  expect(findScreenFor('How do I do squats?')).toBeNull();
});
```

## `tests/unit/anvay-fts5.test.ts`

```ts
import { sanitizeFtsQuery, AnvayFtsStore, type SearchEntryInput } from '../../src/services/local-ai/search/anvayFtsStore';
const mockSearchEntries: any[] = [];
let nextRowId = 1;
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('INSERT INTO anvay_search_entries')) {
        const entryKey = params[0];
        const existingIdx = mockSearchEntries.findIndex((e) => e.entry_key === entryKey);
        if (existingIdx >= 0) {
          mockSearchEntries[existingIdx] = {
            ...mockSearchEntries[existingIdx],
            title: params[8],
            content: params[9],
            domain: params[6],
            source_type: params[7],
            created_at: params[10],
          };
        } else {
          mockSearchEntries.push({
            rowid: nextRowId++,
            entry_key: params[0],
            source_table: params[1],
            source_id: params[2],
            chunk_id: params[3],
            owner_id: params[4],
            app_id: params[5] || 'thrivefold',
            domain: params[6],
            source_type: params[7],
            title: params[8],
            content: params[9],
            created_at: params[10],
            metadata_json: params[11],
          });
        }
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM anvay_search_entries')) {
        const initialLen = mockSearchEntries.length;
        if (sql.includes('entry_key = ?')) {
          const key = params[0];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].entry_key === key) {
              mockSearchEntries.splice(i, 1);
            }
          }
        } else {
          const table = params[0];
          const id = params[1];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].source_table === table && mockSearchEntries[i].source_id === id) {
              mockSearchEntries.splice(i, 1);
            }
          }
        }
        return { changes: initialLen - mockSearchEntries.length };
      }
      return { changes: 0 };
    }),
    getAllSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('FROM anvay_search_fts f')) {
        const queryTerm = String(params[0]).replace(/["*]/g, '').toLowerCase();
        const ownerId = params[1];
        const appId = params[2];
        return mockSearchEntries
          .filter((e) => {
            if (e.owner_id !== ownerId || e.app_id !== appId) return false;
            const full = `${e.title} ${e.content}`.toLowerCase();
            return full.includes(queryTerm);
          })
          .map((e, idx) => ({
            rowid: e.rowid,
            source_table: e.source_table,
            source_id: e.source_id,
            chunk_id: e.chunk_id,
            owner_id: e.owner_id,
            app_id: e.app_id,
            domain: e.domain,
            source_type: e.source_type,
            title: e.title,
            content: e.content,
            created_at: e.created_at,
            metadata_json: e.metadata_json,
            bm25_score: -(10.0 / (idx + 1)), // Mock BM25 score
            snippet: `...«${queryTerm}»...`,
          }));
      }
      return [];
    }),
    getFirstSync: jest.fn((sql: string) => {
      if (sql.includes('count(*)')) {
        return { count: mockSearchEntries.length };
      }
      return null;
    }),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
}));
describe('AnvayCore SQLite FTS5 Intelligence Engine', () => {
  let fts: AnvayFtsStore;
  beforeEach(() => {
    mockSearchEntries.length = 0;
    nextRowId = 1;
    fts = new AnvayFtsStore();
  });
  describe('Query Sanitizer & Multilingual Tokenizer', () => {
    it('sanitizes plain English query into prefix search tokens', () => {
      const q = sanitizeFtsQuery('morning walk');
      expect(q).toBe('"morning"* AND "walk"*');
    });
    it('preserves exact quoted phrases', () => {
      const q = sanitizeFtsQuery('"box breathing"');
      expect(q).toBe('"box breathing"');
    });
    it('preserves Hindi Devanagari Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('तनाव मुक्ति');
      expect(q).toBe('"तनाव"* AND "मुक्ति"*');
    });
    it('preserves Bengali Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('ঘুমের সমস্যা');
      expect(q).toBe('"ঘুমের"* AND "সমস্যা"*');
    });
    it('strips dangerous FTS5 punctuation and operators', () => {
      const q = sanitizeFtsQuery('walk AND (drop: *table^2)');
      expect(q).not.toContain('(');
      expect(q).not.toContain('^');
      expect(q).not.toContain(':');
    });
    it('returns empty string for pure whitespace or punctuation', () => {
      expect(sanitizeFtsQuery('')).toBe('');
      expect(sanitizeFtsQuery('   ')).toBe('');
      expect(sanitizeFtsQuery('***:::^^^')).toBe('');
    });
  });
  describe('Indexing & Authorization Scoping', () => {
    it('indexes documents and retrieves matches strictly scoped to owner', () => {
      const doc1: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_1',
        chunkId: 'chk_1_0',
        ownerId: 'user_alice',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Morning Yoga and Hydration',
        content: 'Drinking 500ml warm water after waking up activates metabolism and calms the gut.',
      };
      const doc2: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_2',
        chunkId: 'chk_2_0',
        ownerId: 'user_bob',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Bob Secret Note',
        content: 'Water filtration notes for Bob.',
      };
      fts.upsertEntry(doc1);
      fts.upsertEntry(doc2);
      const aliceHits = fts.search('water', { ownerId: 'user_alice' });
      expect(aliceHits.length).toBe(1);
      expect(aliceHits[0].sourceId).toBe('doc_1');
      expect(aliceHits[0].ownerId).toBe('user_alice');
      const leakCheck = aliceHits.find((h) => h.ownerId === 'user_bob');
      expect(leakCheck).toBeUndefined();
    });
    it('indexes Hindi and Bengali records and finds them via search', () => {
      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_hi_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'प्राणायाम और तनाव मुक्ति',
        content: 'अनुलोम विलोम प्राणायाम से मानसिक तनाव और चिंता में तुरंत आराम मिलता है।',
      });
      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_bn_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'গভীর ঘুমের নিয়মাবলী',
        content: 'রাতে শোবার আগে হালকা গরম দুধ এবং শ্বাস-প্রশ্বাসের ব্যায়াম ভালো ঘুমের জন্য উপকারী।',
      });
      const hindiHits = fts.search('तनाव', { ownerId: 'local_user' });
      expect(hindiHits.length).toBe(1);
      expect(hindiHits[0].title).toContain('तनाव');
      const bengaliHits = fts.search('ঘুমের', { ownerId: 'local_user' });
      expect(bengaliHits.length).toBe(1);
      expect(bengaliHits[0].title).toContain('ঘুমের');
    });
    it('deletes entries correctly and propagates deletions', () => {
      fts.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: 'mem_123',
        ownerId: 'local_user',
        domain: 'memories',
        sourceType: 'fact',
        title: 'Memory: fact',
        content: 'User prefers evening strength training and 8 hours of sleep.',
      });
      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(1);
      fts.deleteEntry('user_memories', 'mem_123');
      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(0);
    });
    it('runs integrity checks and diagnostics without failure', () => {
      const integrity = fts.checkIntegrity();
      expect(integrity).toBe(true);
      const bench = fts.benchmark('local_user');
      expect(bench.integrityOk).toBe(true);
      expect(typeof bench.queryLatencyMs.englishTerm).toBe('number');
    });
  });
});
```

## `tests/unit/assistant-engine.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));
jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getCurrentPositionAsync: jest.fn(async () => null),
  reverseGeocodeAsync: jest.fn(async () => []),
}));
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ regionCode: 'IN', languageCode: 'en' }]),
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ changes: 1 })),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(() => []),
  })),
}));
import { resolveScreenCapability } from '../../src/domain/assistant/screenRegistry';
import { executeTool } from '../../src/domain/assistant/toolRegistry';
import { lookupMedicine, analyzePrescriptionText } from '../../src/services/ai/medicineResearch';
import { isGuestAccount } from '../../src/services/ai/aiInteractionStore';
import {
  agentEngine,
  isInsufficientPrecisionAnswer,
  shouldEscalateToCloud,
} from '../../src/services/assistant/agentEngine';
describe('Local-first cloud escalation policy', () => {
  it('treats missing and guest profiles as local-only', () => {
    expect(isGuestAccount(null)).toBe(true);
    expect(isGuestAccount({ isGuest: true })).toBe(true);
    expect(isGuestAccount({ isGuest: false })).toBe(false);
  });
  it('does not escalate after a usable local answer', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: false, localOutcome: 'answered' }),
    ).toBe(false);
  });
  it('does not escalate for guests or safety contexts', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: true, isSafetyContext: false, localOutcome: 'failed' }),
    ).toBe(false);
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: true, localOutcome: 'failed' }),
    ).toBe(false);
  });
  it('allows an authorized fallback after local failure or a clear evidence refusal', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: false, localOutcome: 'failed' }),
    ).toBe(true);
    expect(isInsufficientPrecisionAnswer("I don't have enough verified information to answer that." )).toBe(true);
    expect(isInsufficientPrecisionAnswer('A 20 minute walk can be a gentle start.')).toBe(false);
  });
});
describe('Screen Capability Registry', () => {
  it('resolves home tab capability with suggested chips', () => {
    const cap = resolveScreenCapability('/(app)/(tabs)');
    expect(cap.title).toBe('Home Sanctuary');
    expect(cap.supportedTools).toContain('log_water');
    expect(cap.suggestedChips.length).toBeGreaterThan(0);
  });
  it('resolves pose-check capability for workout screen', () => {
    const cap = resolveScreenCapability('/(app)/health/pose-check');
    expect(cap.title).toBe('Coach & Movement Check');
    expect(cap.visibleMetrics).toContain('reps');
  });
  it('falls back safely for unknown paths', () => {
    const cap = resolveScreenCapability('/unknown/random/route');
    expect(cap.title).toBe('Home Sanctuary');
  });
});
describe('Typed Tool Execution Registry', () => {
  it('executes log_water and updates hydration state', async () => {
    const res = await executeTool('log_water', { glasses: 2 }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Logged 2 glasses');
  });
  it('executes get_metrics for water and steps', async () => {
    const resWater = await executeTool('get_metrics', { metric: 'water' }, { userId: 'test_user' });
    expect(resWater.success).toBe(true);
    const resSteps = await executeTool('get_metrics', { metric: 'steps' }, { userId: 'test_user' });
    expect(resSteps.success).toBe(true);
    expect(resSteps.message).toContain('steps today');
  });
  it('executes trigger_urgent_support with crisis hotline info', async () => {
    const res = await executeTool('trigger_urgent_support', {}, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.routeToOpen).toBe('/(app)/safety/urgent-support');
    expect(res.message).toContain('14416');
  });
  it('executes lookup_medicine_info for verified entry', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'Paracetamol' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Paracetamol');
    expect(res.message).toContain('MedlinePlus');
  });
  it('handles unknown medicine lookup gracefully', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'FakemedicineXYZ' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('could not find a verified educational entry');
  });
});
describe('Medicine Educational Research & Safety', () => {
  it('looks up metformin with authoritative source and class', () => {
    const med = lookupMedicine('Metformin');
    expect(med).not.toBeNull();
    expect(med?.genericName).toBe('Metformin Hydrochloride');
    expect(med?.authoritativeSource.publisher).toContain('MedlinePlus');
  });
  it('analyzes prescription text with disclaimers and safety notice', () => {
    const analysis = analyzePrescriptionText('Take Paracetamol 500mg twice daily with meals');
    expect(analysis.detectedMedicines.length).toBeGreaterThan(0);
    expect(analysis.detectedMedicines[0].extractedName).toBe('Paracetamol');
    expect(analysis.disclaimer).toContain('not a medical device');
    expect(analysis.safetyNotice).toContain('Always verify exact doses');
  });
});
describe('Agent Execution Engine', () => {
  it('handles fast-path water logging command', async () => {
    const result = await agentEngine.processUserInput('log 2 glasses of water');
    expect(result.text).toContain('Logged 2 glasses');
    expect(result.toolResult?.success).toBe(true);
  });
  it('handles fast-path crisis intervention immediately', async () => {
    const result = await agentEngine.processUserInput('I feel like hurting myself');
    expect(result.text).toContain('14416');
    expect(result.toolResult?.routeToOpen).toBe('/(app)/safety/urgent-support');
  });
  it('handles medicine question with educational citation', async () => {
    const result = await agentEngine.processUserInput('What is the medicine called Ibuprofen?');
    expect(result.text).toContain('Ibuprofen');
    expect(result.text).toContain('OpenFDA');
  });
  it('falls back to deterministic coach for exercise questions', async () => {
    const result = await agentEngine.processUserInput('How do I do squats?');
    expect(result.text.toLowerCase()).toContain('chest tall');
  });
});
```

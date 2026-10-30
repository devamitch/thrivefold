/**
 * Bring-your-own model: pick a GGUF file from the phone and keep one private copy in the app's
 * model folder (llama.cpp needs a real file path). The copy is reused offline from then on; the
 * same file name replaces the old copy instead of duplicating it.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const IMPORT_DIR = `${FileSystem.documentDirectory ?? ''}local_ai_models/imported/`;
export const IMPORT_PREFIX = 'import:';

export const importedPath = (fileName: string) => `${IMPORT_DIR}${fileName}`;
export const isImportedId = (id: string | null | undefined): id is string => !!id && id.startsWith(IMPORT_PREFIX);
export const importedFileOf = (id: string) => id.slice(IMPORT_PREFIX.length);

/** Turns any picked name into a safe file name ending in .gguf. */
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

/** Picks a .gguf file and copies it in. Returns the model id, or null when cancelled. */
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

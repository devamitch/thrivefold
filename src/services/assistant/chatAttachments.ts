/**
 * Files attached in the coach chat, read entirely on the phone.
 *
 * - PDFs, photos, screenshots, text, Markdown, CSV, JSON and HTML are read in place through the
 *   system picker's content URI (no copy is made, nothing is uploaded). PDFs and photos go through
 *   the offline text recogniser in the native module, page by page.
 * - Only the extracted text is kept, in Thrive RAG, marked with the file name and page so later
 *   answers can cite it. The same file read twice is recognised and not stored again.
 * - With an on-device model loaded, the coach writes a short summary; without one it shows what it
 *   read and says it can answer questions from it.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { LocalAI, scriptForLanguage, type ExtractedDocument } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { hashText } from '../../domain/assistant/appKnowledge';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { globalVoiceController } from '../voice/globalVoiceController';

export interface PickedFile {
  uri: string;
  name: string;
  mime: string | null;
  kind: 'image' | 'pdf' | 'file';
}

export const SUPPORTED_TYPES = ['application/pdf', 'image/*', 'text/*', 'application/json'];

export function kindOf(mime: string | null, name: string): PickedFile['kind'] {
  if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  if (mime?.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(name)) return 'image';
  return 'file';
}

/** Any supported file from the system picker, without copying it into the app. */
export async function pickFile(): Promise<PickedFile | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: SUPPORTED_TYPES, copyToCacheDirectory: false, multiple: false });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  return { uri: a.uri, name: a.name, mime: a.mimeType ?? null, kind: kindOf(a.mimeType ?? null, a.name) };
}

/** A photo taken now (the camera writes one temporary file; nothing else is kept). */
export async function takePhoto(): Promise<PickedFile | null> {
  if (!(await ImagePicker.requestCameraPermissionsAsync()).granted) return null;
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  return { uri: a.uri, name: a.fileName ?? 'Photo', mime: a.mimeType ?? 'image/jpeg', kind: 'image' };
}

/** All page text joined, blank pages dropped, whitespace tidied. */
export function documentText(doc: Pick<ExtractedDocument, 'pages'>): string {
  return doc.pages
    .map((p) => p.text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim())
    .filter(Boolean)
    .join('\n\n');
}

/** A few readable lines for the reply when no on-device model is loaded. */
export function preview(text: string, max = 420): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).replace(/\s\S*$/, '')}…` : t;
}

/** Reads one picked file and reports in the chat. Never throws. */
export async function readAttachment(file: PickedFile, question: string): Promise<void> {
  const post = globalVoiceController;
  post.postReply(`Reading ${file.name} on this phone…`, { success: true, message: '', data: { transient: true } });

  let doc: ExtractedDocument;
  try {
    doc = await LocalAI.extractDocumentText(file.uri, file.mime, scriptForLanguage(useRootStore.getState().coachLanguage));
  } catch (e) {
    post.postReply(`I could not read ${file.name}: ${e instanceof Error ? e.message : 'unknown error'}`);
    return;
  }
  const text = documentText(doc);
  if (!text) {
    post.postReply(`I found no readable text in ${file.name}. For photos, try a sharper picture in good light.`);
    return;
  }

  const pages = doc.pages.length;
  const { duplicate } = await thriveRag
    .rememberDocument(file.name, doc.pages, hashText(text))
    .catch(() => ({ duplicate: false, id: '' }));
  const where = `${pages} ${pages === 1 ? 'page' : 'pages'}${doc.method === 'text' ? '' : ', read with on-device text recognition'}`;
  const kept = duplicate ? 'I had already saved this file, so nothing new was stored.' : 'I kept its text in your private knowledge on this phone (not the file).';

  if (LocalAI.isLoaded()) {
    try {
      const ask = question.trim() || 'Summarise this document in plain words: what it is, the key points, and anything that needs action.';
      const answer = await LocalAI.generateText({
        prompt: ask,
        context: `Document "${file.name}" (${pages} pages):\n${text.slice(0, 3500)}`,
        system:
          'Answer only from the document text. Name the page when you can. If the answer is not in the text, say so. ' +
          'Never invent doses or numbers. Keep it under 120 words. No markdown.',
      });
      post.postReply(`${answer.trim()}\n\n(${file.name}, ${where}. ${kept})`);
      return;
    } catch {
      // Fall back to the plain reply below.
    }
  }
  post.postReply(
    `Read ${file.name} (${where}). ${kept} Ask me anything about it.\n\n"${preview(text)}"`,
  );
}

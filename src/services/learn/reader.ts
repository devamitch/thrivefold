import type { Href } from 'expo-router';

/** Opens any link in the in-app reader (web pages in a WebView; PDFs and text read on the phone). */
export const readerHref = (url: string, title?: string): Href =>
  `/(app)/reader?${new URLSearchParams(title ? { url, title } : { url }).toString()}` as Href;

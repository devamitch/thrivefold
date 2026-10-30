import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { LocalAI, scriptForLanguage } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { useCoach } from '../../components/assistant/CoachProvider';
import { AppHeader } from '../../components/ui/AppHeader';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { hashText } from '../../domain/assistant/appKnowledge';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { documentText } from '../../services/assistant/chatAttachments';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import { LANGUAGES } from '../../domain/languages';
import { useTheme } from '../../theme/useTheme';

// react-native-webview 14's combined prop types collapse to `never` under TypeScript 6.
const WebViewView = WebView as unknown as React.ComponentType<Record<string, unknown>>;

const LANGS = LANGUAGES;
const DOC_EXT = /\.(pdf|txt|md|csv|json)(\?|#|$)/i;
// Collects the readable text of the current page and posts it back (no scripts are changed).
const READ_PAGE = `(function(){try{var t=(document.querySelector('article')||document.querySelector('main')||document.body).innerText;
window.ReactNativeWebView.postMessage(JSON.stringify({type:'text',text:t.slice(0,20000)}));}catch(e){}})();true;`;

/**
 * Everything opened from Learn, the Library or the coach opens here, never in an outside browser.
 * Web pages show in a WebView; PDFs and text files are downloaded to the app cache, read on the
 * phone (offline text recognition for PDFs) and shown as text. Both can be read aloud, asked
 * about, and kept in the coach's knowledge.
 */
export default function ReaderScreen() {
  const { url, title } = useLocalSearchParams<{ url?: string; title?: string }>();
  const { colors, typography, spacing } = useTheme();
  const coach = useCoach();
  const web = useRef<WebView | null>(null);
  const [current, setCurrent] = useState(url ?? '');
  const [pageTitle, setPageTitle] = useState(title ?? 'Reader');
  const [doc, setDoc] = useState<{ text: string; pages: number } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const pendingRead = useRef<'speak' | 'keep' | 'translate' | null>(null);
  // On-device translation: pick a language, the text is translated on the phone (the language's
  // model downloads once, then works offline).
  const [langPicker, setLangPicker] = useState(false);
  const [translated, setTranslated] = useState<{ lang: string; text: string } | null>(null);
  const [translating, setTranslating] = useState(false);
  const targetLang = useRef('hi');

  const isDoc = useMemo(() => DOC_EXT.test(current), [current]);

  // Documents: download into the cache (replaced each time, never duplicated), then read on-device.
  useEffect(() => {
    if (!current || !isDoc) return;
    let alive = true;
    setState('loading');
    (async () => {
      try {
        const target = `${FileSystem.cacheDirectory}reader_${hashText(current)}${current.match(DOC_EXT)?.[0].replace(/[?#].*$/, '') ?? ''}`;
        await FileSystem.downloadAsync(current, target);
        const extracted = await LocalAI.extractDocumentText(target, null, scriptForLanguage(useRootStore.getState().coachLanguage));
        await FileSystem.deleteAsync(target, { idempotent: true });
        if (!alive) return;
        setDoc({ text: documentText(extracted) || 'This document has no readable text.', pages: extracted.pages.length });
        setState('ready');
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Could not open this document.');
        setState('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [current, isDoc]);

  useEffect(() => () => stopCoachSpeech(), []);

  const speak = (text: string) => {
    if (speaking) {
      stopCoachSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speakCoachLine(text.slice(0, 4000), { onEnd: () => setSpeaking(false) });
  };
  const keep = (text: string) => {
    void thriveRag.rememberDocument(pageTitle, [{ page: 1, text }], hashText(text)).catch(() => undefined);
  };

  const translate = async (text: string) => {
    setTranslating(true);
    try {
      const r = await LocalAI.translateText(text, targetLang.current);
      setTranslated({ lang: targetLang.current, text: r.text });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not translate.');
    } finally {
      setTranslating(false);
    }
  };
  const withPageText = (then: 'speak' | 'keep' | 'translate') => {
    if (doc) return then === 'speak' ? speak(translated?.text ?? doc.text) : then === 'keep' ? keep(doc.text) : void translate(doc.text);
    pendingRead.current = then;
    web.current?.injectJavaScript(READ_PAGE);
  };
  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string; text?: string };
      if (m.type !== 'text' || !m.text) return;
      if (pendingRead.current === 'speak') speak(m.text);
      if (pendingRead.current === 'keep') keep(m.text);
      if (pendingRead.current === 'translate') void translate(m.text);
      pendingRead.current = null;
    } catch {
      // Not ours.
    }
  };
  // Links to documents inside a page open in this reader's document view instead.
  const onShouldStart = (req: WebViewNavigation) => {
    if (DOC_EXT.test(req.url) && req.url !== current) {
      setCurrent(req.url);
      return false;
    }
    return true;
  };

  const actions = (
    <View style={[styles.actions, { borderTopColor: colors.surface2, backgroundColor: colors.background }]}>
      <Action icon={speaking ? 'stop-circle' : 'volume-high-outline'} label={speaking ? 'Stop' : 'Read aloud'} onPress={() => withPageText('speak')} />
      <Action icon="chatbubble-ellipses-outline" label="Ask Anvay" onPress={() => coach.ask(`Explain "${pageTitle}" simply and what it means for me.`)} />
      <Action icon="language-outline" label={translating ? 'Translating…' : 'Translate'} onPress={() => setLangPicker((v) => !v)} />
      <Action icon="bookmark-outline" label="Keep" onPress={() => withPageText('keep')} />
    </View>
  );
  const picker = langPicker ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: colors.surface, borderTopColor: colors.surface2, borderTopWidth: StyleSheet.hairlineWidth, flexGrow: 0 }} contentContainerStyle={styles.langs}>
      {LANGS.map((l) => (
        <PressableScale
          key={l.code}
          onPress={() => {
            targetLang.current = l.code;
            setLangPicker(false);
            withPageText('translate');
          }}
          style={[styles.lang, { backgroundColor: colors.surface1 }]}
          accessibilityRole="button"
          accessibilityLabel={`Translate to ${l.label}`}
        >
          <Text style={[typography.captionBold, { color: colors.primary }]}>{l.native}</Text>
        </PressableScale>
      ))}
    </ScrollView>
  ) : null;
  const translation = translated ? (
    <View style={[styles.translation, { backgroundColor: colors.background, borderTopColor: colors.surface2 }]}>
      <View style={styles.translationHead}>
        <Text style={[typography.captionBold, styles.flex, { color: colors.text.secondary }]}>
          {LANGS.find((l) => l.code === translated.lang)?.label ?? translated.lang}, translated on this phone
        </Text>
        <PressableScale onPress={() => setTranslated(null)} hitSlop={10} accessibilityLabel="Close translation">
          <Ionicons name="close" size={20} color={colors.text.muted} />
        </PressableScale>
      </View>
      <ScrollView>
        <Text style={[typography.body, { color: colors.text.primary }]} selectable>
          {translated.text}
        </Text>
      </ScrollView>
    </View>
  ) : null;

  if (!current) {
    return (
      <ScreenContainer header={<AppHeader title="Reader" showBack />} scrollMode="shell-scroll-view">
        <Text style={[typography.body, { color: colors.text.secondary }]}>Nothing to open.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={pageTitle} subtitle={new URL(current).hostname} showBack compact />} scrollMode="none">
      <View style={styles.flex}>
        {isDoc ? (
          state === 'ready' && doc ? (
            <ScrollView contentContainerStyle={{ padding: spacing.base }}>
              <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing.sm }]}>
                {doc.pages} {doc.pages === 1 ? 'page' : 'pages'}, read on this phone
              </Text>
              <Text style={[typography.body, { color: colors.text.primary }]} selectable>
                {doc.text}
              </Text>
            </ScrollView>
          ) : state === 'error' ? (
            <Text style={[typography.body, { color: colors.error, padding: spacing.base }]}>{error}</Text>
          ) : (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8 }]}>Reading the document…</Text>
            </View>
          )
        ) : (
          <WebViewView
            ref={web}
            source={{ uri: current }}
            style={styles.flex}
            originWhitelist={['https://*', 'http://*']}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={onShouldStart}
            onLoadEnd={(e: { nativeEvent: { title?: string; url: string } }) => {
              setState('ready');
              if (e.nativeEvent.title && !title) setPageTitle(e.nativeEvent.title);
            }}
            onError={() => {
              setError('This page could not be opened.');
              setState('error');
            }}
            onMessage={onMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          />
        )}
        {translation}
        {picker}
        {actions}
      </View>
    </ScreenContainer>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} style={styles.action} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[typography.captionBold, { color: colors.primary }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  langs: { flexDirection: 'row', gap: 8, padding: 10 },
  lang: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  translation: { maxHeight: '45%', padding: 14, borderTopWidth: StyleSheet.hairlineWidth },
  translationHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 8 },
  action: { alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 4, minWidth: 72 },
});

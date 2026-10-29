import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThriveCharacter } from './ThriveCharacter';
import { FaceWatcher } from './FaceWatcher';
import { HALO, useCompanion } from './companion';
import { GUIDES, type GuideName } from './intents';
import type { Activity, Mood, Period } from './types';

const PALETTE: Record<Period, { bg: string; fg: string; chip: string; chipOn: string }> = {
  dawn: { bg: '#FFEBDD', fg: '#3A2A22', chip: '#F7D9C6', chipOn: '#D17A5A' },
  morning: { bg: '#FFF7E8', fg: '#3A2A22', chip: '#F6E8CB', chipOn: '#D17A5A' },
  afternoon: { bg: '#FDF1DC', fg: '#3A2A22', chip: '#F3E0BC', chipOn: '#D17A5A' },
  evening: { bg: '#F6DDCD', fg: '#3A2A22', chip: '#EBC9B3', chipOn: '#C46A4A' },
  night: { bg: '#27304A', fg: '#F2EEE8', chip: '#35405F', chipOn: '#D17A5A' },
  lateNight: { bg: '#161B2E', fg: '#E9E6F2', chip: '#232A45', chipOn: '#D17A5A' },
};

const ACTIVITIES: Activity[] = ['wave', 'drink', 'exercise', 'jacks', 'stretch', 'yawn', 'dance', 'roll', 'clap', 'laugh', 'think', 'meditate', 'hug', 'wind', 'sob', 'tantrum', 'peek'];
const MOODS: Mood[] = ['happy', 'joy', 'love', 'proud', 'curious', 'surprised', 'shy', 'thinking', 'bored', 'sleepy', 'sad', 'crying', 'angry', 'scared', 'dizzy'];

function Chip({ label, onPress, bg, fg }: { label: string; onPress: () => void; bg: string; fg: string }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export default function CompanionScreen() {
  const { rig, ui, actions } = useCompanion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pal = PALETTE[ui.period];
  const size = Math.min(width * 0.92, 440);

  const round = (on: boolean) => ({ backgroundColor: on ? pal.chipOn : pal.chip });

  return (
    <View style={[s.root, { backgroundColor: pal.bg, paddingTop: insets.top + 8 }]}>
      <View style={s.top}>
        <View>
          <Text style={[s.title, { color: pal.fg }]}>Thrivefold</Text>
          <Text style={[s.sub, { color: pal.fg }]}>
            {ui.period === 'lateNight' ? 'late night' : ui.period} · {ui.mood} · bond {ui.bond}
            {ui.guide ? ` · ${ui.guide}` : ''}
          </Text>
        </View>
        <FaceWatcher active={ui.cameraOn} onSignal={actions.onFace} width={96} height={128} />
      </View>

      <View style={s.stage}>
        <ThriveCharacter rig={rig} size={size} halo={HALO[ui.period]} onPress={actions.poke} />
      </View>

      <View style={[s.bubble, { backgroundColor: pal.chip }]}>
        <Text style={[s.bubbleText, { color: pal.fg }]} numberOfLines={3}>
          {ui.partial || ui.line || 'Tap me, talk to me, or say "guide me through a workout".'}
        </Text>
      </View>

      <View style={s.row}>
        <Pressable onPress={actions.toggleMic} style={[s.orb, round(ui.listening)]}>
          <Text style={[s.orbText, { color: ui.listening ? '#fff' : pal.fg }]}>{ui.listening ? 'Listening' : 'Mic'}</Text>
        </Pressable>
        <Pressable onPress={() => actions.setCamera(!ui.cameraOn)} style={[s.orb, round(ui.cameraOn)]}>
          <Text style={[s.orbText, { color: ui.cameraOn ? '#fff' : pal.fg }]}>{ui.cameraOn ? 'Cam on' : 'Camera'}</Text>
        </Pressable>
        <Pressable onPress={() => actions.setGlasses(!ui.glasses)} style={[s.orb, round(ui.glasses)]}>
          <Text style={[s.orbText, { color: ui.glasses ? '#fff' : pal.fg }]}>Glasses</Text>
        </Pressable>
        <Pressable onPress={() => (ui.asleep ? actions.wake() : actions.sleep())} style={[s.orb, round(ui.asleep)]}>
          <Text style={[s.orbText, { color: ui.asleep ? '#fff' : pal.fg }]}>{ui.asleep ? 'Wake' : 'Sleep'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <Text style={[s.h, { color: pal.fg }]}>Guide me</Text>
        <View style={s.wrap}>
          {(Object.keys(GUIDES) as GuideName[]).map((g) => (
            <Chip key={g} label={GUIDES[g].title} bg={pal.chip} fg={pal.fg} onPress={() => actions.startGuide(g)} />
          ))}
          {ui.guide ? <Chip label="Stop" bg={pal.chipOn} fg="#fff" onPress={actions.stopGuide} /> : null}
        </View>

        <Text style={[s.h, { color: pal.fg }]}>Do</Text>
        <View style={s.wrap}>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={a} bg={pal.chip} fg={pal.fg} onPress={() => actions.perform(a, { prio: 3, force: true })} />
          ))}
        </View>

        <Text style={[s.h, { color: pal.fg }]}>Feel</Text>
        <View style={s.wrap}>
          {MOODS.map((m) => (
            <Chip key={m} label={m} bg={pal.chip} fg={pal.fg} onPress={() => actions.setMood(m)} />
          ))}
        </View>

        <Text style={[s.h, { color: pal.fg }]}>Dictation {ui.dictating ? '· on' : ''}</Text>
        <View style={s.wrap}>
          <Chip label={ui.dictating ? 'Stop dictation' : 'Start dictation'} bg={ui.dictating ? pal.chipOn : pal.chip} fg={ui.dictating ? '#fff' : pal.fg} onPress={() => actions.setDictating(!ui.dictating)} />
          {ui.notes.length ? <Chip label="Clear notes" bg={pal.chip} fg={pal.fg} onPress={actions.clearNotes} /> : null}
        </View>
        {ui.notes.map((n, i) => (
          <View key={i} style={[s.note, { backgroundColor: pal.chip }]}>
            <Text style={{ color: pal.fg, fontSize: 15 }}>{n}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontWeight: '700' },
  sub: { fontSize: 13, opacity: 0.7, marginTop: 2 },
  stage: { alignItems: 'center', marginTop: -20 },
  bubble: { borderRadius: 22, borderCurve: 'continuous', paddingHorizontal: 16, paddingVertical: 12, marginTop: -10 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  orb: { flex: 1, height: 52, borderRadius: 26, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  orbText: { fontSize: 14, fontWeight: '600' },
  h: { fontSize: 13, fontWeight: '700', opacity: 0.6, marginTop: 18, marginBottom: 8, textTransform: 'uppercase' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderCurve: 'continuous' },
  chipText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  note: { borderRadius: 16, borderCurve: 'continuous', padding: 12, marginTop: 8 },
});

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBrandIcon } from '../AnimatedBrandIcon';
import { FaceWatcher } from './FaceWatcher';
import { HALO, useCompanion } from './companion';
import { useHeartRate } from './heart';
import { GUIDES, type GuideName } from './intents';
import { ThriveBoundary } from './ThriveBoundary';
import { ThriveCharacter } from './ThriveCharacter';
import type { Activity, Mood, Period } from './types';

const PALETTE: Record<Period, { bg: string; card: string; fg: string; soft: string; on: string }> = {
  dawn: { bg: '#FFF0E4', card: '#FFE3D0', fg: '#3A2A22', soft: '#F3D3BE', on: '#D9825F' },
  morning: { bg: '#FFF9EE', card: '#FFEFD2', fg: '#3A2A22', soft: '#F5E4C3', on: '#D9825F' },
  afternoon: { bg: '#FEF4E2', card: '#FBE6C2', fg: '#3A2A22', soft: '#F1DCB6', on: '#D9825F' },
  evening: { bg: '#F9E3D4', card: '#F2CDB5', fg: '#3A2A22', soft: '#E8BEA3', on: '#C46F4E' },
  night: { bg: '#232B45', card: '#2E3858', fg: '#F2EEE8', soft: '#3A4568', on: '#D9825F' },
  lateNight: { bg: '#141829', card: '#1E2440', fg: '#E9E6F2', soft: '#2A3152', on: '#D9825F' },
};

const ACTIVITIES: Activity[] = ['wave', 'drink', 'exercise', 'jacks', 'stretch', 'yawn', 'dance', 'roll', 'clap', 'laugh', 'think', 'meditate', 'hug', 'wind', 'sob', 'tantrum', 'peek'];
const MOODS: Mood[] = ['happy', 'joy', 'love', 'proud', 'curious', 'surprised', 'shy', 'thinking', 'bored', 'sleepy', 'sad', 'crying', 'angry', 'scared', 'dizzy'];

export default function CompanionScreen({ userGender = 'other' }: { userGender?: 'male' | 'female' | 'other' }) {
  const { rig, ui, actions } = useCompanion({ userGender });
  useHeartRate(actions.onHeart);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [panel, setPanel] = useState(false);
  const p = PALETTE[ui.period];
  const stage = Math.min(width - 32, height * 0.46, 420);
  const caption = ui.partial || ui.line;

  const Chip = ({ label, onPress, on }: { label: string; onPress: () => void; on?: boolean }) => (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: on ? p.on : p.soft }]}>
      <Text style={[s.chipText, { color: on ? '#fff' : p.fg }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[s.root, { backgroundColor: p.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: p.fg }]}>Thrivefold</Text>
          <Text style={[s.sub, { color: p.fg }]} numberOfLines={1}>
            {ui.guide ?? (ui.asleep ? 'sleeping' : ui.mood)}
          </Text>
        </View>
        {ui.bpm ? (
          <View style={[s.pill, { backgroundColor: p.soft }]}>
            <Text style={[s.pillText, { color: p.fg }]}>♥ {ui.bpm}</Text>
          </View>
        ) : null}
        <FaceWatcher active={ui.cameraOn} onSignal={actions.onFace} width={72} height={96} />
      </View>

      <View style={[s.stage, { backgroundColor: p.card }]}>
        <ThriveBoundary fallback={<AnimatedBrandIcon size={stage * 0.5} />}>
          <ThriveCharacter rig={rig} size={stage} halo={HALO[ui.period]} onPress={actions.poke} />
        </ThriveBoundary>
      </View>

      <View style={s.captionBox}>
        <Text style={[s.caption, { color: p.fg, opacity: caption ? 1 : 0.5 }]} numberOfLines={3}>
          {caption || 'Tap me, or press the mic and talk.'}
        </Text>
      </View>

      {panel ? (
        <ScrollView style={[s.panel, { backgroundColor: p.card }]} contentContainerStyle={{ padding: 14, gap: 10 }} showsVerticalScrollIndicator={false}>
          <Text style={[s.h, { color: p.fg }]}>Guide me</Text>
          <View style={s.wrap}>
            {(Object.keys(GUIDES) as GuideName[]).map((g) => (
              <Chip key={g} label={GUIDES[g].title} onPress={() => actions.startGuide(g)} on={ui.guide === GUIDES[g].title} />
            ))}
            {ui.guide ? <Chip label="Stop" onPress={actions.stopGuide} on /> : null}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Do</Text>
          <View style={s.wrap}>
            {ACTIVITIES.map((a) => <Chip key={a} label={a} onPress={() => actions.perform(a, { prio: 3, force: true })} />)}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Feel</Text>
          <View style={s.wrap}>
            {MOODS.map((m) => <Chip key={m} label={m} onPress={() => actions.setMood(m)} />)}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Notes</Text>
          <View style={s.wrap}>
            <Chip label={ui.dictating ? 'Stop dictation' : 'Dictate'} onPress={() => actions.setDictating(!ui.dictating)} on={ui.dictating} />
            <Chip label="Glasses" onPress={() => actions.setGlasses(!ui.glasses)} on={ui.glasses} />
            {ui.notes.length ? <Chip label="Clear notes" onPress={actions.clearNotes} /> : null}
          </View>
          {ui.notes.map((n, i) => (
            <View key={i} style={[s.note, { backgroundColor: p.soft }]}>
              <Text style={{ color: p.fg, fontSize: 15 }}>{n}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={s.dock}>
        <Pressable onPress={() => actions.setCamera(!ui.cameraOn)} style={[s.side, { backgroundColor: ui.cameraOn ? p.on : p.soft }]}>
          <Text style={[s.sideText, { color: ui.cameraOn ? '#fff' : p.fg }]}>Camera</Text>
        </Pressable>
        <Pressable onPress={actions.toggleMic} style={[s.mic, { backgroundColor: ui.listening ? p.on : p.fg }]}>
          <Text style={[s.micText, { color: ui.listening ? '#fff' : p.bg }]}>{ui.listening ? 'Listening' : 'Talk'}</Text>
        </Pressable>
        <Pressable onPress={() => setPanel((v) => !v)} style={[s.side, { backgroundColor: panel ? p.on : p.soft }]}>
          <Text style={[s.sideText, { color: panel ? '#fff' : p.fg }]}>{panel ? 'Close' : 'More'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  sub: { fontSize: 13, opacity: 0.65, textTransform: 'capitalize' },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderCurve: 'continuous' },
  pillText: { fontSize: 14, fontWeight: '700' },
  stage: { alignSelf: 'center', marginTop: 8, borderRadius: 36, borderCurve: 'continuous', padding: 6, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  captionBox: { minHeight: 72, justifyContent: 'center', paddingHorizontal: 8, marginTop: 10 },
  caption: { fontSize: 18, lineHeight: 25, textAlign: 'center', fontWeight: '600' },
  panel: { flex: 1, borderRadius: 28, borderCurve: 'continuous', marginTop: 4, marginBottom: 12 },
  h: { fontSize: 12, fontWeight: '800', opacity: 0.55, textTransform: 'uppercase', letterSpacing: 0.8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderCurve: 'continuous' },
  chipText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  note: { borderRadius: 16, borderCurve: 'continuous', padding: 12 },
  dock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  side: { flex: 1, height: 52, borderRadius: 26, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  sideText: { fontSize: 15, fontWeight: '700' },
  mic: { flex: 1.4, height: 64, borderRadius: 32, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  micText: { fontSize: 17, fontWeight: '800' },
});

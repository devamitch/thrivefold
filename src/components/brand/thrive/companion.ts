import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { asyncKeyValueStorage as AsyncStorage } from '../../../stores/persistStorage';
import { GUIDES, parseIntent, type GuideName } from './intents';
import { useThriveRig, type ThriveRig } from './rig';
import type { Activity, FaceSignal, Mood, Period } from './types';
import { useVoice } from './voice';

const KEY = 'thrive.companion.v1';
const NOTES_KEY = 'thrive.notes.v1';

export interface CompanionOptions {
  /** Speak on its own (reminders, greetings). Replies to your commands are always spoken. */
  chatty?: boolean;
  hydrationMin?: number;
  eyeBreakMin?: number;
  lang?: string;
}

export interface CompanionUI {
  mood: Mood;
  activity: Activity;
  line: string;
  partial: string;
  period: Period;
  bond: number;
  listening: boolean;
  speaking: boolean;
  cameraOn: boolean;
  faceOn: boolean;
  glasses: boolean;
  asleep: boolean;
  dictating: boolean;
  guide: string | null;
  notes: string[];
}

const INITIAL: CompanionUI = {
  mood: 'neutral',
  activity: 'none',
  line: '',
  partial: '',
  period: 'morning',
  bond: 0,
  listening: false,
  speaking: false,
  cameraOn: false,
  faceOn: false,
  glasses: false,
  asleep: false,
  dictating: false,
  guide: null,
  notes: [],
};

export const HALO: Record<Period, string> = {
  dawn: '#FFB38A',
  morning: '#FFD36B',
  afternoon: '#FFC15A',
  evening: '#F08A5D',
  night: '#6C7BD9',
  lateNight: '#3E4A9E',
};

export function periodOf(d: Date): Period {
  const h = d.getHours();
  if (h >= 23 || h < 5) return 'lateNight';
  if (h < 7) return 'dawn';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

const LIFE: Record<Period, [Activity, number][]> = {
  dawn: [
    ['yawn', 3],
    ['stretch', 3],
    ['drink', 1],
  ],
  morning: [
    ['stretch', 2],
    ['exercise', 2],
    ['drink', 2],
    ['wave', 1],
    ['dance', 1],
    ['think', 1],
  ],
  afternoon: [
    ['drink', 2],
    ['think', 2],
    ['stretch', 2],
    ['clap', 1],
    ['dance', 1],
    ['wind', 1],
    ['laugh', 1],
    ['roll', 1],
  ],
  evening: [
    ['dance', 2],
    ['meditate', 2],
    ['think', 1],
    ['laugh', 1],
    ['drink', 1],
    ['stretch', 1],
  ],
  night: [
    ['yawn', 3],
    ['meditate', 2],
    ['stretch', 1],
  ],
  lateNight: [
    ['yawn', 3],
    ['sleep', 3],
  ],
};
const pick = (table: [Activity, number][]): Activity => {
  const total = table.reduce((n, [, w]) => n + w, 0);
  let x = Math.random() * total;
  for (const [a, w] of table) {
    x -= w;
    if (x <= 0) return a;
  }
  return table[0][0];
};

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const sleepMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const timeLine = () => {
  const d = new Date();
  const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const tail: Record<Period, string> = {
    dawn: 'Early start. Nice.',
    morning: 'A good time to focus.',
    afternoon: 'Remember to drink some water.',
    evening: 'Time to slow down a little.',
    night: 'Getting late. Wind down soon.',
    lateNight: 'It is very late. You should rest.',
  };
  return `It is ${t}. ${tail[periodOf(d)]}`;
};
const dateLine = () =>
  `Today is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.`;

interface Ctx {
  rig: ThriveRig;
  patch: (p: Partial<CompanionUI>) => void;
  speak: (t: string, interrupt?: boolean) => void;
  voice: { start: () => Promise<void>; stop: () => void };
  opts: Required<CompanionOptions>;
}

function createBrain(ctx: { current: Ctx }) {
  const st = {
    prio: -1,
    endAt: 0,
    endTimer: null as ReturnType<typeof setTimeout> | null,
    asleep: false,
    listening: false,
    dictating: false,
    camera: false,
    lastUser: Date.now(),
    nextLife: Date.now() + 9000,
    lastWater: Date.now(),
    lastEye: Date.now(),
    exerciseDay: '',
    period: periodOf(new Date()) as Period,
    bond: 0,
    facePresent: false,
    lastFaceSeen: 0,
    faceMood: null as Mood | null,
    faceMoodAt: 0,
    closedSince: 0,
    lastPeek: 0,
    lastWave: 0,
    lastComfort: 0,
    glassesOn: false,
    glassFromFace: false,
    noGlassSince: 0,
    pokes: [] as number[],
    guideToken: 0,
    guideActive: false,
    notes: [] as string[],
    lastSave: 0,
  };
  const R = () => ctx.current.rig;
  const P = (p: Partial<CompanionUI>) => ctx.current.patch(p);
  const say = (text: string, force = false, interrupt = false) => {
    P({ line: text });
    if (force || ctx.current.opts.chatty) ctx.current.speak(text, interrupt);
  };
  const idle = () =>
    Date.now() >= st.endAt && !st.listening && !st.dictating && !st.guideActive && !st.asleep;

  const base = (): Mood => {
    if (st.asleep) return 'asleep';
    if (st.listening) return 'listening';
    if (st.facePresent && st.faceMood) return st.faceMood;
    if (periodOf(new Date()) === 'lateNight') return 'sleepy';
    return st.bond > 60 ? 'happy' : 'neutral';
  };

  const save = () => {
    st.lastSave = Date.now();
    AsyncStorage.setItem(KEY, JSON.stringify({ lastSeen: Date.now(), bond: st.bond })).catch(
      () => {},
    );
  };
  const touch = (n = 1) => {
    st.lastUser = Date.now();
    st.bond = clamp(st.bond + n * 0.4, 0, 100);
    P({ bond: Math.round(st.bond) });
    if (Date.now() - st.lastSave > 15000) save();
  };

  const finish = () => {
    st.prio = -1;
    st.endAt = 0;
    R().setMood(base());
    R().settle();
    P({ activity: 'none', mood: R().mood.current });
  };

  const perform = (
    a: Activity,
    o: { prio?: number; say?: string; mood?: Mood; force?: boolean } = {},
  ) => {
    const prio = o.prio ?? 0;
    if (!o.force && Date.now() < st.endAt && prio < st.prio) return false;
    if (st.asleep && a !== 'sleep' && prio < 3) return false;
    if (st.endTimer) clearTimeout(st.endTimer);
    if (st.asleep && a !== 'sleep') {
      st.asleep = false;
      P({ asleep: false });
    }
    const dur = R().play(a);
    if (o.mood) R().setMood(o.mood);
    st.prio = prio;
    st.endAt = dur ? Date.now() + dur : Infinity;
    if (a === 'sleep') {
      st.asleep = true;
      P({ asleep: true });
    }
    P({ activity: a, mood: R().mood.current });
    if (o.say) say(o.say, prio >= 2);
    if (dur) st.endTimer = setTimeout(finish, dur + 120);
    return true;
  };

  const wake = (line?: string) => {
    st.asleep = false;
    P({ asleep: false });
    perform('yawn', { prio: 3, force: true, say: line ?? 'Good morning. I am awake.' });
  };
  const sleep = (line = 'Good night. Sleep well. I will be right here.') => {
    say(line, true);
    perform('sleep', { prio: 4, force: true });
  };
  const setGlasses = (on: boolean, line?: string, fromFace = false) => {
    st.glassesOn = on;
    st.glassFromFace = fromFace;
    R().setGlasses(on);
    P({ glasses: on });
    if (line) say(line, true);
  };

  const stopGuide = () => {
    st.guideToken++;
    st.guideActive = false;
    P({ guide: null });
    if (Date.now() < st.endAt) finish();
  };
  const startGuide = async (name: GuideName) => {
    const g = GUIDES[name];
    const token = ++st.guideToken;
    st.guideActive = true;
    P({ guide: g.title });
    for (const step of g.steps) {
      if (token !== st.guideToken) return;
      say(step.say, true, true);
      perform(step.activity, { prio: 3, force: true });
      const end = Date.now() + step.ms;
      while (Date.now() < end) {
        if (token !== st.guideToken) return;
        await sleepMs(Math.min(500, Math.max(50, end - Date.now())));
        if (st.endAt !== Infinity && Date.now() > st.endAt && Date.now() < end - 800)
          perform(step.activity, { prio: 3, force: true });
      }
    }
    if (token !== st.guideToken) return;
    st.guideActive = false;
    P({ guide: null });
    say(g.done, true, true);
    perform('clap', { prio: 3, force: true });
    touch(3);
  };

  const poke = () => {
    const now = Date.now();
    touch(1);
    st.pokes = st.pokes.filter((t) => now - t < 4000).concat(now);
    if (st.asleep) {
      wake('Mmm... oh! You woke me up.');
      return;
    }
    if (st.pokes.length >= 4) {
      st.pokes = [];
      perform('tantrum', { prio: 3, force: true, say: 'Hey! Stop poking me!' });
      setTimeout(
        () =>
          perform('hug', { prio: 3, force: true, say: 'Okay, I forgive you. I am loyal to you.' }),
        3800,
      );
      return;
    }
    const a = (['laugh', 'wave', 'dance', 'roll', 'clap'] as Activity[])[
      Math.floor(Math.random() * 5)
    ];
    perform(a, { prio: 2, say: a === 'laugh' ? 'Hehe, that tickles!' : undefined });
  };

  const handleUtterance = (text: string) => {
    touch(2);
    if (st.dictating) {
      if (/\b(stop|end|finish) (dictation|dictating|notes?)\b/i.test(text)) {
        setDictating(false);
        return;
      }
      st.notes = [...st.notes, text];
      P({ notes: st.notes });
      AsyncStorage.setItem(NOTES_KEY, JSON.stringify(st.notes)).catch(() => {});
      R().nod();
      return;
    }
    const it = parseIntent(text);
    switch (it.type) {
      case 'activity':
        perform(it.activity, { prio: 3, force: true, say: it.say });
        break;
      case 'mood':
        R().setMood(it.mood);
        P({ mood: it.mood });
        say(it.say, true);
        st.endAt = Date.now() + 4000;
        st.endTimer = setTimeout(finish, 4100);
        st.prio = 3;
        break;
      case 'glasses':
        setGlasses(it.on, it.say);
        perform('think', { prio: 2 });
        break;
      case 'guide':
        startGuide(it.name);
        break;
      case 'time':
        say(timeLine(), true);
        perform('think', { prio: 3, force: true });
        break;
      case 'date':
        say(dateLine(), true);
        perform('think', { prio: 3, force: true });
        break;
      case 'status': {
        const per = periodOf(new Date());
        const feel =
          st.bond > 60
            ? 'really happy, because you are here'
            : st.bond > 25
              ? 'good'
              : 'fine, and happy to meet you';
        say(`I feel ${feel}. It is ${per === 'lateNight' ? 'very late' : per}.`, true);
        perform('wave', { prio: 3, force: true });
        break;
      }
      case 'dictate':
        setDictating(it.on);
        break;
      case 'sleep':
        sleep();
        break;
      case 'wake':
        wake();
        break;
      case 'stop':
        stopGuide();
        say('Okay.', true);
        break;
      case 'chat':
        perform('hug', { prio: 3, force: true, mood: it.mood, say: it.say });
        break;
      default:
        perform('think', {
          prio: 3,
          force: true,
          say: `I heard "${text}", but I do not know that one yet.`,
        });
    }
  };

  const setDictating = (on: boolean) => {
    st.dictating = on;
    P({ dictating: on });
    if (on) {
      perform('listen', { prio: 3, force: true });
      say('Dictation on. I am writing everything down.', true);
    } else {
      finish();
      say(`Dictation saved. ${st.notes.length} note${st.notes.length === 1 ? '' : 's'}.`, true);
    }
  };

  const setFaceMood = (m: Mood) => {
    const now = Date.now();
    if (st.faceMood === m || now - st.faceMoodAt < 800) return;
    st.faceMood = m;
    st.faceMoodAt = now;
    if (m === 'sad' && now - st.lastComfort > 120000 && !st.asleep) {
      st.lastComfort = now;
      perform('hug', { prio: 2, say: 'You look sad. I am here with you.' });
      return;
    }
    if (idle() && Date.now() >= st.endAt) {
      R().setMood(m);
      P({ mood: m });
    }
  };

  const api = {
    perform,
    poke,
    wake,
    sleep,
    say,
    startGuide,
    stopGuide,
    setDictating,
    setMood(m: Mood) {
      R().setMood(m);
      P({ mood: m });
    },
    clearNotes() {
      st.notes = [];
      P({ notes: [] });
      AsyncStorage.removeItem(NOTES_KEY).catch(() => {});
    },
    setGlasses: (on: boolean) => setGlasses(on, on ? 'Glasses on.' : 'Glasses off.'),

    setCamera(on: boolean) {
      st.camera = on;
      P({ cameraOn: on });
      if (on) {
        touch(2);
        perform('peek', { prio: 3, force: true, say: 'Camera on. I can see you now.' });
        setTimeout(() => perform('wave', { prio: 3, force: true }), 2900);
      } else {
        st.facePresent = false;
        st.faceMood = null;
        P({ faceOn: false });
        R().track(null);
        R().lean(0);
        say('Okay, camera off.', true);
      }
    },

    async toggleMic() {
      if (st.listening) {
        ctx.current.voice.stop();
        return;
      }
      await ctx.current.voice.start();
    },
    onVoiceStart() {
      st.listening = true;
      P({ listening: true });
      if (!st.dictating) perform('listen', { prio: 3, force: true });
    },
    onVoiceEnd() {
      st.listening = false;
      P({ listening: false, partial: '' });
      if (st.dictating) setDictating(false);
      else if (Date.now() >= st.endAt || st.endAt === Infinity) {
        if (!st.asleep) finish();
      }
    },
    onVolume(v: number) {
      if (!st.listening) return;
      R().v.glow.value = 0.4 + 0.6 * clamp(v / 8, 0, 1);
    },
    onTranscript(text: string, final: boolean) {
      st.lastUser = Date.now();
      P({ partial: final ? '' : text });
      if (final) handleUtterance(text);
    },
    onSpeaking(on: boolean) {
      R().setTalking(on);
      P({ speaking: on });
    },
    onError(msg: string) {
      P({ line: msg });
    },

    onWave() {
      const now = Date.now();
      if (now - st.lastWave < 4000) return;
      st.lastWave = now;
      touch(2);
      if (st.asleep) wake('Oh, hi! I saw you wave.');
      else perform('wave', { prio: 2, say: 'Hey! I saw that.' });
    },

    onFace(f: FaceSignal) {
      const now = Date.now();
      if (!f.present) return;
      const wasAway = !st.facePresent && now - st.lastFaceSeen > 8000;
      st.lastFaceSeen = now;
      st.lastUser = now;
      if (!st.facePresent) {
        st.facePresent = true;
        P({ faceOn: true });
      }
      R().track(f.x * 0.9, f.y * 0.9);
      if (wasAway && st.camera) {
        if (st.asleep) wake('Oh, you are back!');
        else perform('greet', { prio: 2, say: 'There you are!' });
      }
      if (idle()) R().lean(clamp(-f.roll * 0.4, -12, 12));

      let m: Mood | null = f.emotion ?? null;
      if (!m) {
        if (f.eyesOpen < 0.25) {
          if (!st.closedSince) st.closedSince = now;
          if (now - st.closedSince > 1500) m = 'sleepy';
        } else {
          st.closedSince = 0;
          m =
            f.smile > 0.65
              ? 'joy'
              : f.smile > 0.3
                ? 'happy'
                : Math.abs(f.yaw) > 25
                  ? 'curious'
                  : 'neutral';
        }
      }
      if (m) setFaceMood(m);

      if (f.size > 0.55 && now - st.lastPeek > 20000 && Date.now() >= st.endAt) {
        st.lastPeek = now;
        perform('peek', { prio: 1 });
      }
      if (f.glasses === true && !st.glassesOn)
        setGlasses(true, 'Nice glasses! I will wear mine too.', true);
      if (f.glasses === false && st.glassesOn && st.glassFromFace) {
        if (!st.noGlassSince) st.noGlassSince = now;
        if (now - st.noGlassSince > 4000) {
          st.noGlassSince = 0;
          setGlasses(false);
        }
      } else st.noGlassSince = 0;
    },

    async boot() {
      let saved: { lastSeen?: number; bond?: number } = {};
      try {
        saved = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');
        st.notes = JSON.parse((await AsyncStorage.getItem(NOTES_KEY)) ?? '[]');
      } catch {
        /* first run */
      }
      st.bond = saved.bond ?? 0;
      P({ bond: Math.round(st.bond), notes: st.notes, period: st.period });
      const away = saved.lastSeen ? Date.now() - saved.lastSeen : 0;
      const h = new Date().getHours();
      const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      if (!saved.lastSeen)
        perform('greet', {
          prio: 3,
          say: "Hi! I'm your Thrivefold companion. I live on your device and I work offline.",
        });
      else if (away > 24 * 3600e3) {
        perform('sob', { prio: 3, say: 'You were gone so long...' });
        setTimeout(
          () => perform('hug', { prio: 3, force: true, say: `${hello}! I missed you so much.` }),
          4700,
        );
      } else if (away > 6 * 3600e3) perform('hug', { prio: 3, say: `${hello}! I missed you.` });
      else if (away > 5 * 60e3) perform('greet', { prio: 3, say: `${hello}!` });
      else perform('wave', { prio: 2 });
      save();
    },

    tick() {
      const now = Date.now();
      const d = new Date();
      const per = periodOf(d);
      if (per !== st.period) {
        st.period = per;
        P({ period: per });
      }
      if (st.facePresent && now - st.lastFaceSeen > 1500) {
        st.facePresent = false;
        st.faceMood = null;
        P({ faceOn: false });
        R().track(null);
        R().lean(0);
      }
      const { hydrationMin, eyeBreakMin } = ctx.current.opts;

      if (st.asleep) {
        if (per === 'dawn' && d.getHours() >= 5 && now - st.lastUser > 30 * 60e3)
          wake('Good morning. Time to start the day.');
        return;
      }
      if (!idle()) return;

      if (per === 'lateNight' && now - st.lastUser > 90e3) {
        sleep('It is late. I am going to sleep. Good night.');
        return;
      }
      if (now - st.lastWater > hydrationMin * 60e3) {
        st.lastWater = now;
        perform('drink', { prio: 1, say: 'Water break. Drink some water.' });
        return;
      }
      if (st.facePresent && now - st.lastEye > eyeBreakMin * 60e3) {
        st.lastEye = now;
        startGuide('eyebreak');
        return;
      }
      const day = d.toDateString();
      const h = d.getHours();
      if (st.exerciseDay !== day && ((h >= 7 && h < 9) || (h >= 18 && h < 19))) {
        st.exerciseDay = day;
        perform('exercise', { prio: 1, say: "Let's move a little. Join me!" });
        return;
      }
      if (now >= st.nextLife) {
        perform(pick(LIFE[per]), { prio: 0 });
        st.nextLife = now + (9 + Math.random() * 14) * 1000;
      }
    },

    background() {
      save();
    },
  };
  return api;
}

export function useCompanion(options: CompanionOptions = {}) {
  const opts: Required<CompanionOptions> = {
    chatty: true,
    hydrationMin: 90,
    eyeBreakMin: 20,
    lang: 'en-IN',
    ...options,
  };
  const rig = useThriveRig({ living: true });
  const [ui, setUi] = useState<CompanionUI>({ ...INITIAL, period: periodOf(new Date()) });
  const patch = useCallback((p: Partial<CompanionUI>) => setUi((u) => ({ ...u, ...p })), []);
  const ctx = useRef<Ctx>(null as unknown as Ctx);
  const brain = useMemo(() => createBrain(ctx), []);

  const voice = useVoice({
    lang: opts.lang,
    onStart: () => brain.onVoiceStart(),
    onEnd: () => brain.onVoiceEnd(),
    onTranscript: (t, f) => brain.onTranscript(t, f),
    onVolume: (v) => brain.onVolume(v),
    onSpeaking: (s) => brain.onSpeaking(s),
    onError: (m) => brain.onError(m),
  });
  ctx.current = { rig, patch, opts, speak: voice.speak, voice };

  useEffect(() => {
    brain.boot();
    const iv = setInterval(() => brain.tick(), 1000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') brain.background();
      if (s === 'active') brain.boot();
    });
    return () => {
      clearInterval(iv);
      sub.remove();
      brain.background();
    };
  }, [brain]);

  return { rig, ui, actions: brain };
}

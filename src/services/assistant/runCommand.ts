import { LocalAI } from '../../../modules/local-ai';
import { MediaPipeTools } from '../../../modules/pose-landmarker/tools';
import { activeCalories } from '../../domain/activity/calories';
import type { Command } from '../../domain/assistant/commands';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { stepsByDate } from '../../domain/interop/readings';
import { describeCode, planWalk } from '../../domain/world/outdoor';
import { useRootStore } from '../../stores/useRootStore';
import { alertsFor } from '../world/officialAlerts';
import { getForecast } from '../world/weather';

export interface AssistantReply {
  text: string;
  /** A screen to open after speaking, for "open" commands. */
  route?: string;
  /** True when the reply came from the on-device language model. */
  fromModel?: boolean;
  /** True when no on-device model was available for an open question. */
  needsModel?: boolean;
}

/** Short, practical support for everyday pressures, with a pointer to real help. Not therapy. */
const LIFE: Record<'work' | 'balance' | 'relationship' | 'low', string> = {
  work:
    "Work pressure is heavy. Try this: write the three things that truly must happen this week, and one you can drop or delegate. Take a five-minute walk between big tasks. I'm opening a journal page so you can get it out of your head. If it keeps you from sleeping or eating, Tele-MANAS on 14416 is free and confidential.",
  balance:
    "Let's protect some time for you. Pick one fixed slot this week, even 20 minutes, for something that's only yours, and put it in your calendar like a meeting. I'm opening a journal page to note what drains you and what fills you up.",
  relationship:
    "Relationship stress affects everything. When things are calm, try one 'I feel… when… I need…' sentence instead of blame, and agree on a time to talk without phones. Writing your side first helps; I'm opening a journal page. A couples counsellor can help both of you, and Tele-MANAS on 14416 is free if you need to talk today.",
  low:
    "I'm sorry you're feeling low. Small things help: a short walk in daylight, water, and messaging one person you trust. If it has lasted two weeks or more, please talk to a doctor. Tele-MANAS on 14416 is free, 24 hours, in many languages. If you ever think about harming yourself, call 112 now.",
};

const LANG: Record<string, string> = { hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu', es: 'Spanish', fr: 'French', de: 'German' };

const SYSTEM =
  'You are Thrive, a warm, brief wellbeing coach inside a health app. Answer in at most three short sentences. ' +
  'Give general wellbeing guidance only. Never diagnose, never name medicines or doses, and suggest a doctor for anything worrying or urgent.';

/** Carries out one command against the person's own data on this phone and says what happened. */
export async function runCommand(cmd: Command): Promise<AssistantReply> {
  const s = useRootStore.getState();
  const today = formatLocalDate(new Date());

  switch (cmd.kind) {
    case 'open':
      return { text: `Opening ${cmd.label}.`, route: cmd.route };

    case 'life':
      return { text: LIFE[cmd.topic], route: cmd.topic === 'low' ? undefined : '/(app)/journal/new' };

    case 'crisis':
      return {
        text: "I'm really glad you told me. You don't have to go through this alone. I'm opening urgent support so you can reach someone right now. If you are in danger, call your local emergency number.",
        route: '/(app)/safety/urgent-support',
      };

    case 'log_water': {
      s.addWaterLog(cmd.glasses * 250, today);
      const total = useRootStore.getState().hydration[today] ?? 0;
      return { text: `Logged ${cmd.glasses} glass${cmd.glasses === 1 ? '' : 'es'} of water. That's ${total} today.` };
    }

    case 'ask': {
      if (cmd.metric === 'weather') {
        const place = s.outdoorPlace;
        if (!place) return { text: 'Choose your town in the Outdoors card on Home and I can tell you the weather and the best time to walk.' };
        try {
          const f = await getForecast(place);
          let alerts: Awaited<ReturnType<typeof alertsFor>> = [];
          try {
            alerts = await alertsFor(place.lat, place.lon);
          } catch {
            // Alerts are optional for this answer; the weather still helps.
          }
          const plan = planWalk(f.hours, new Date(), alerts);
          const best = plan.best ? ` The best time to walk is around ${Number(plan.best.time.slice(11, 13)) % 12 || 12} ${Number(plan.best.time.slice(11, 13)) < 12 ? 'am' : 'pm'}.` : '';
          const warn = alerts[0] ? ` Official alert: ${alerts[0].event}, from ${alerts[0].sender}.` : '';
          return { text: `In ${place.name} it is ${Math.round(f.now.tempC)} degrees, ${describeCode(f.now.code).toLowerCase()}.${best}${warn} ${plan.tips[0] ?? ''}`.trim() };
        } catch {
          return { text: 'I could not get the weather just now. Check your connection and try again.' };
        }
      }
      if (cmd.metric === 'steps') {
        const d = stepsByDate(s.deviceReadings).get(today);
        return { text: d ? `You have ${Math.round(d.value).toLocaleString()} steps today.` : 'No steps are counted yet today. Turn on step counting from the Steps tile on Home.' };
      }
      if (cmd.metric === 'water') {
        const g = s.hydration[today] ?? 0;
        return { text: g ? `You've had ${g} glass${g === 1 ? '' : 'es'} of water today, of ${s.hydrationTargetGlasses ?? 8}.` : 'No water logged yet today.' };
      }
      if (cmd.metric === 'calories') {
        const steps = stepsByDate(s.deviceReadings).get(today)?.value ?? null;
        const c = activeCalories({ date: today, steps, weightKg: s.weightKg ?? null, activityLogs: s.activityLogs, workoutSessions: s.workoutSessions });
        return { text: c.total ? `About ${c.total} active calories so far today. That's an estimate.` : 'No activity recorded yet today, so no calorie estimate.' };
      }
      const open = s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'replaced' && q.status !== 'skipped');
      return {
        text: open.length
          ? `${open.length} quest${open.length === 1 ? '' : 's'} left today. Next: ${open[0].title}.`
          : "You've finished today's quests.",
      };
    }

    case 'unknown': {
      if (!cmd.text) return { text: 'Say or type what you need, for example: start breathing.' };
      // Note the language the person wrote in (on-device language detector).
      let langNote = '';
      try {
        const langs = MediaPipeTools ? await MediaPipeTools.detectLanguage(cmd.text) : [];
        const top = langs[0];
        if (top && top.code !== 'en' && top.score > 0.7) langNote = ` (I noticed you wrote in ${LANG[top.code] ?? top.code}; I reply in English for now.)`;
      } catch {
        langNote = '';
      }
      if (!LocalAI.isLoaded()) {
        return {
          text: `I can open screens, log water and tell you today's numbers without a model. For open questions, load an on-device model first.${langNote}`,
          needsModel: true,
        };
      }
      try {
        // Today's own numbers as context, so answers can be personal; it never leaves the phone.
        const steps = stepsByDate(s.deviceReadings).get(today)?.value;
        const context = [
          steps ? `Steps today: ${Math.round(steps)}` : null,
          `Water today: ${s.hydration[today] ?? 0} glasses`,
          s.weightKg ? `Weight: ${s.weightKg} kg` : null,
          s.heightCm ? `Height: ${s.heightCm} cm` : null,
          s.koshProfile.preferredName ? `Call them ${s.koshProfile.preferredName}` : null,
          s.koshProfile.allergies.length ? `Allergies: ${s.koshProfile.allergies.join(', ')}` : null,
          s.koshProfile.foodRestrictions.length ? `Food rules: ${s.koshProfile.foodRestrictions.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join('. ');
        const out = await LocalAI.generateText({ prompt: cmd.text, context, system: SYSTEM });
        return { text: (out.trim() || "I don't have a good answer for that.") + langNote, fromModel: true };
      } catch {
        return { text: 'The on-device model could not answer just now.', needsModel: true };
      }
    }
  }
}

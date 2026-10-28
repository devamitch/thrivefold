import { LocalAI } from '../../../modules/local-ai';
import { activeCalories } from '../../domain/activity/calories';
import type { Command } from '../../domain/assistant/commands';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { stepsByDate } from '../../domain/interop/readings';
import { useRootStore } from '../../stores/useRootStore';

export interface AssistantReply {
  text: string;
  /** A screen to open after speaking, for "open" commands. */
  route?: string;
  /** True when the reply came from the on-device language model. */
  fromModel?: boolean;
  /** True when no on-device model was available for an open question. */
  needsModel?: boolean;
}

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

    case 'log_water': {
      s.addWaterLog(cmd.glasses * 250, today);
      const total = useRootStore.getState().hydration[today] ?? 0;
      return { text: `Logged ${cmd.glasses} glass${cmd.glasses === 1 ? '' : 'es'} of water. That's ${total} today.` };
    }

    case 'ask': {
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
      if (!LocalAI.isLoaded()) {
        return {
          text: "I can open screens, log water and tell you today's numbers without a model. For open questions, load an on-device model first.",
          needsModel: true,
        };
      }
      try {
        const out = await LocalAI.generateText({ prompt: cmd.text, system: SYSTEM });
        return { text: out.trim() || "I don't have a good answer for that.", fromModel: true };
      } catch {
        return { text: 'The on-device model could not answer just now.', needsModel: true };
      }
    }
  }
}

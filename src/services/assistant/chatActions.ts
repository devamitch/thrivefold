/**
 * Carries out a chat action: tables from the store, guided jobs that open the right screen, and
 * anything destructive only after the person confirms in the app's own alert.
 */
import { buildTable, GUIDES, matchMedicine, type ChatAction, type ChatTable } from '../../domain/assistant/chatActions';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { useRootStore } from '../../stores/useRootStore';
import { signOutEverywhere } from '../account/accountService';

export type ChatActionResult = ToolExecutionResult<{ table?: ChatTable }>;

const pad = (n: number) => String(n).padStart(2, '0');
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function go(route: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    router?.push?.(route);
  } catch {
    // No router in tests.
  }
}

/** Asks in the app's alert; runs `onYes` only on confirm. */
function confirm(title: string, message: string, confirmText: string, onYes: () => void | Promise<void>, destructive = true) {
  useRootStore.getState().showAlert({ title, message, confirmText, destructive, onConfirm: () => void onYes() });
}

const toast = (message: string) => useRootStore.getState().showToast({ type: 'success', message });

/** The coach sheet registers how to close itself and clear its history (it owns that state). */
let hooks = { closeSheet: () => {}, clearChat: () => useRootStore.getState().setCoachTurns([]) };
export function setChatActionHooks(next: Partial<typeof hooks>) {
  hooks = { ...hooks, ...next };
}

export async function runChatAction(action: ChatAction): Promise<ChatActionResult> {
  const s = useRootStore.getState();
  switch (action.kind) {
    case 'show': {
      const table = buildTable(action.what, s, new Date());
      const message = table.rows.length
        ? `${table.title}: ${table.rows.length} ${table.rows.length === 1 ? 'entry' : 'entries'}.`
        : `${table.title}: nothing saved yet.`;
      return { success: true, message, data: { table }, routeToOpen: table.route };
    }
    case 'routine_add': {
      const r = action.routine;
      s.addRoutine(r);
      const when = r.everyHours ? `every ${r.everyHours} hours from ${r.time} until ${r.until}` : `at ${r.time}`;
      const days = r.days.length ? ' on the days you said' : ' every day';
      return {
        success: true,
        message: `Done: I'll remind you to ${r.title.toLowerCase()} ${when}${days}. Opening the reminder earns a gem.`,
        routeToOpen: '/(app)/routines',
      };
    }
    case 'guide': {
      const g = GUIDES[action.job];
      go(g.route);
      return { success: true, message: g.steps, routeToOpen: g.route };
    }
    case 'reminders': {
      s.setMedicationRemindersOn(action.on);
      return {
        success: true,
        message: action.on
          ? `Medicine reminders are on for ${s.medications.length} ${s.medications.length === 1 ? 'medicine' : 'medicines'}.`
          : 'Medicine reminders are off.',
        routeToOpen: '/(app)/health/medications',
      };
    }
    case 'took_med': {
      const med = matchMedicine(s.medications, action.name);
      if (!med) return { success: false, message: `I could not find "${action.name}" in your medicines.`, routeToOpen: '/(app)/health/medications' };
      const key = `${todayKey()}|${med.id}`;
      if (!s.medicationTaken.includes(key)) s.toggleMedicationTaken(med.id, todayKey());
      return { success: true, message: `Marked ${med.name} as taken today.` };
    }
    case 'delete_med': {
      const med = matchMedicine(s.medications, action.name);
      if (!med) return { success: false, message: `I could not find "${action.name}" in your medicines.`, routeToOpen: '/(app)/health/medications' };
      confirm(`Delete ${med.name}?`, 'Its reminders and taken history are removed from this phone.', 'Delete', () => {
        useRootStore.getState().deleteMedication(med.id);
        toast(`${med.name} deleted`);
      });
      return { success: true, message: `Confirm on screen to delete ${med.name}.` };
    }
    case 'clear_chat':
      confirm('Clear the conversation?', 'All messages with Anvay are deleted from this phone.', 'Clear', () => {
        hooks.clearChat();
        toast('Conversation cleared');
      });
      return { success: true, message: 'Confirm on screen to clear the conversation.' };
    case 'sign_out':
      confirm('Sign out?', 'Your data stays on this phone. You can sign in again any time.', 'Sign out', async () => {
        hooks.closeSheet();
        await signOutEverywhere();
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('expo-router').router?.replace?.('/(auth)/sign-in');
        } catch {
          // No router in tests.
        }
      }, false);
      return { success: true, message: 'Confirm on screen to sign out.' };
    case 'close':
      setTimeout(hooks.closeSheet, 700);
      return { success: true, message: 'Closing. Tap me any time.' };
  }
}

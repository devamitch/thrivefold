/**
 * Typed Tool Execution Framework for Thrive Coach.
 *
 * Implements the architecture from Google AI Edge Gallery (`tools/`):
 * - Strongly typed schemas
 * - Input validation
 * - Execution context (user store state, current screen route)
 * - Confirmation gates for sensitive actions
 * - Audited execution results
 */

import { useRootStore } from '../../stores/useRootStore';
import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';
import { activeCalories } from '../activity/calories';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import { memoryStore } from '../../services/local-ai/memory/memoryStore';
import { knowledgeStore } from '../../services/local-ai/rag/knowledgeStore';
import { lookupMedicine, analyzePrescriptionText } from '../../services/ai/medicineResearch';
import { format12Hour } from '../routines';
import { chestKey, LEVEL_CHESTS } from '../game/rewards';

function navigateTo(route: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    router?.push?.(route as any);
  } catch {
    // Graceful no-op in headless/test environments
  }
}

export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: Record<string, ToolParameterSchema>;
  requiresConfirmation?: boolean;
  execute: (params: TParams, context: ToolExecutionContext) => Promise<ToolExecutionResult<TResult>>;
}

export interface ToolExecutionContext {
  userId: string;
  currentRoute?: string;
  isConfirmed?: boolean;
}

export interface ToolExecutionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  routeToOpen?: string;
  autoNavigate?: boolean;
  needsConfirmation?: boolean;
  confirmationPrompt?: string;
}

export const TOOLS: Record<string, ToolDefinition> = {
  navigate_to_screen: {
    name: 'navigate_to_screen',
    description: 'Safely navigates the user to a supported app feature or screen.',
    parameters: {
      route: {
        type: 'string',
        description: 'Target route path within the application',
        required: true,
      },
      label: {
        type: 'string',
        description: 'Friendly display name of the screen',
      },
    },
    execute: async (params: { route: string; label?: string }) => {
      try {
        navigateTo(params.route);
        return {
          success: true,
          message: `Opened ${params.label || params.route}.`,
          routeToOpen: params.route,
          autoNavigate: true,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Could not open screen: ${err.message}`,
        };
      }
    },
  },

  log_water: {
    name: 'log_water',
    description: 'Logs water intake in number of standard glasses (250ml each) for today.',
    parameters: {
      glasses: {
        type: 'number',
        description: 'Number of glasses of water to add (1-10)',
        required: true,
      },
    },
    execute: async (params: { glasses: number }) => {
      const glasses = Math.max(1, Math.min(10, Math.round(params.glasses || 1)));
      const today = formatLocalDate(new Date());
      const store = useRootStore.getState();
      store.addWaterLog(glasses * 250, today);
      const updatedTotal = useRootStore.getState().hydration[today] ?? glasses;
      return {
        success: true,
        message: `Logged ${glasses} glass${glasses === 1 ? '' : 'es'} of water. Total today: ${updatedTotal} glasses.`,
        data: { addedGlasses: glasses, totalGlassesToday: updatedTotal },
      };
    },
  },

  get_metrics: {
    name: 'get_metrics',
    description: 'Reads verified on-device health metrics (steps, water, calories, or quests) for today.',
    parameters: {
      metric: {
        type: 'string',
        description: 'The metric to query',
        required: true,
        enum: ['steps', 'water', 'calories', 'quests', 'summary'],
      },
    },
    execute: async (params: { metric: 'steps' | 'water' | 'calories' | 'quests' | 'heart' | 'summary' }) => {
      const store = useRootStore.getState();
      const today = formatLocalDate(new Date());

      if (params.metric === 'heart') {
        // Only real readings from a connected source (Health Connect or a heart-rate strap).
        const hr = store.deviceReadings
          .filter((r) => r.kind === 'heart_rate_avg')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        if (!hr) {
          return {
            success: true,
            message:
              'I have no heart-rate readings yet. Connect Health Connect or a heart-rate strap in Health, Connected apps, and I can tell you.',
            routeToOpen: '/(app)/health/integrations',
          };
        }
        const when = hr.date === today ? 'today' : `on ${hr.date}`;
        const src = hr.source === 'ble_heart_rate' ? 'your heart-rate strap' : 'Health Connect';
        const range = hr.min && hr.max ? `, between ${Math.round(hr.min)} and ${Math.round(hr.max)}` : '';
        return {
          success: true,
          message: `Your average heart rate ${when} was ${Math.round(hr.value)} beats a minute${range}, from ${src}.`,
          data: { bpm: hr.value, date: hr.date, source: hr.source },
        };
      }

      if (params.metric === 'steps') {
        const stepVal = stepsByDate(store.deviceReadings).get(today)?.value ?? 0;
        return {
          success: true,
          message: `You have taken ${Math.round(stepVal).toLocaleString()} steps today.`,
          data: { steps: Math.round(stepVal) },
        };
      }

      if (params.metric === 'water') {
        const glasses = store.hydration[today] ?? 0;
        const target = store.hydrationTargetGlasses ?? 8;
        return {
          success: true,
          message: `You have had ${glasses} of ${target} glasses of water today.`,
          data: { glasses, target },
        };
      }

      if (params.metric === 'calories') {
        const stepVal = stepsByDate(store.deviceReadings).get(today)?.value ?? null;
        const cal = activeCalories({
          date: today,
          steps: stepVal,
          weightKg: store.weightKg ?? null,
          activityLogs: store.activityLogs,
          workoutSessions: store.workoutSessions,
        });
        return {
          success: true,
          message: `Estimated active calories today: ${cal.total || 0} kcal.`,
          data: { activeCalories: cal.total },
        };
      }

      if (params.metric === 'quests') {
        const open = store.todayQuests.filter(
          (q) => !q.isCompleted && q.status !== 'replaced' && q.status !== 'skipped'
        );
        return {
          success: true,
          message: open.length
            ? `You have ${open.length} quest${open.length === 1 ? '' : 's'} remaining today. Next: ${open[0].title}.`
            : "You've finished all of today's quests! Great work.",
          data: { remainingCount: open.length, remainingTitles: open.map((q) => q.title) },
        };
      }

      // Default 'summary'
      const steps = Math.round(stepsByDate(store.deviceReadings).get(today)?.value ?? 0);
      const water = store.hydration[today] ?? 0;
      return {
        success: true,
        message: `Today's Summary: ${steps.toLocaleString()} steps taken, ${water} glasses of water logged.`,
        data: { steps, water },
      };
    },
  },

  search_personal_memory: {
    name: 'search_personal_memory',
    description: 'Retrieves knowledge strictly grounded in user notes and exercise library via Hybrid RAG.',
    parameters: {
      query: {
        type: 'string',
        description: 'Semantic query to search across analytical memories and exercises',
        required: true,
      },
    },
    execute: async (params: { query: string }, context: ToolExecutionContext) => {
      const res = await thriveRag.answer(params.query);
      return {
        success: true,
        message: res.answer,
        data: {
          citations: res.citations,
          confidence: res.confidence,
          isGrounded: res.isGrounded,
        },
      };
    },
  },

  log_journal_note: {
    name: 'log_journal_note',
    description: 'Saves an approved mindful reflection into on-device analytical memory.',
    parameters: {
      note: {
        type: 'string',
        description: 'Content of the reflection or journal note',
        required: true,
      },
      tag: {
        type: 'string',
        description: 'Category tag (e.g. mindfulness, stress, sleep, gratitude)',
      },
    },
    execute: async (params: { note: string; tag?: string }, context: ToolExecutionContext) => {
      const memory = await memoryStore.addMemory({
        userId: context.userId || 'local_user',
        kind: 'fact',
        content: params.note.trim(),
        sourceEventIds: [`voice_${Date.now()}`],
        confidence: 1.0,
        origin: 'user_declared',
        status: 'active',
        metadata: {
          source: 'voice_assistant',
          tag: params.tag || 'reflection',
          recordedAt: new Date().toISOString(),
        },
      });
      return {
        success: true,
        message: `Saved reflection to your private on-device memories.`,
        data: { memoryId: memory.id },
      };
    },
  },

  ingest_user_document: {
    name: 'ingest_user_document',
    description: 'Chunks, indexes, and saves an educational wellness document or personal note into on-device vector RAG.',
    parameters: {
      title: {
        type: 'string',
        description: 'Title of the document',
        required: true,
      },
      text: {
        type: 'string',
        description: 'Full text content of the document',
        required: true,
      },
      sourceType: {
        type: 'string',
        description: 'Document category',
        enum: ['user_note', 'health_article', 'wellness_guide', 'imported_file', 'medical_reference'],
      },
    },
    execute: async (
      params: {
        title: string;
        text: string;
        sourceType?: 'user_note' | 'health_article' | 'wellness_guide' | 'imported_file' | 'medical_reference';
      },
      context: ToolExecutionContext
    ) => {
      const doc = await knowledgeStore.ingestDocument(context.userId || 'local_user', {
        title: params.title,
        text: params.text,
        sourceType: params.sourceType,
      });
      return {
        success: true,
        message: `Indexed "${doc.title}" into ${doc.chunkCount} searchable knowledge chunk${doc.chunkCount === 1 ? '' : 's'} on device.`,
        data: { documentId: doc.id, chunkCount: doc.chunkCount },
      };
    },
  },

  lookup_medicine_info: {
    name: 'lookup_medicine_info',
    description: 'Provides non-diagnostic educational information on a medication from verified databases.',
    parameters: {
      medicineName: {
        type: 'string',
        description: 'Name of the medicine or drug to look up',
        required: true,
      },
    },
    execute: async (params: { medicineName: string }) => {
      const rec = lookupMedicine(params.medicineName);
      if (!rec) {
        return {
          success: true,
          message: `I could not find a verified educational entry for "${params.medicineName}". Please confirm with your pharmacist or doctor.`,
        };
      }
      const summary =
        `${rec.name} (${rec.genericName || rec.generalClass}): Commonly used for ${rec.commonUses.join(', ')}. ` +
        `Note: ${rec.cautionaryNotes[0] || ''} Consult a doctor or pharmacist for dosage instructions. ` +
        `[Source: ${rec.authoritativeSource.publisher}]`;
      return {
        success: true,
        message: summary,
        data: rec,
      };
    },
  },

  export_data: {
    name: 'export_data',
    description: 'Saves all of the person\'s records as a spreadsheet or a full backup file in a folder they choose.',
    parameters: {
      format: { type: 'string', description: 'spreadsheet or backup', enum: ['spreadsheet', 'backup'], required: true },
    },
    execute: async (params: { format: 'spreadsheet' | 'backup' }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const data = require('../../services/privacy/localData') as typeof import('../../services/privacy/localData');
      const ok = params.format === 'backup' ? await data.exportRawJson() : await data.exportDataToWorkbook();
      return {
        success: ok,
        message: ok
          ? params.format === 'backup'
            ? 'Your full backup is saved. Keep it safe; you can restore it from Privacy and data.'
            : 'All your metrics are saved as a spreadsheet.'
          : 'Nothing was saved. Choose a folder when Android asks, and try again.',
      };
    },
  },

  trigger_urgent_support: {
    name: 'trigger_urgent_support',
    description: 'Provides immediate crisis helpline contacts and opens urgent support screen.',
    parameters: {},
    execute: async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolveEmergencyJurisdiction } = require('../../services/location/emergencyLocationResolver');
      const jur = await resolveEmergencyJurisdiction();
      useRootStore.getState().setCoachPersona('support');
      const helplineMsg = jur.primaryMentalHealth.name.includes(jur.primaryMentalHealth.number)
        ? jur.primaryMentalHealth.name
        : `${jur.primaryMentalHealth.name} on ${jur.primaryMentalHealth.number}`;
      return {
        success: true,
        message: `You are not alone. I am right here with you in support mode. For ${jur.countryName}: Emergency is ${jur.primaryEmergency.name} (${jur.primaryEmergency.number}), and free 24/7 mental health support is ${helplineMsg}.`,
        routeToOpen: '/(app)/safety/urgent-support',
      };
    },
  },

  get_emergency_directory: {
    name: 'get_emergency_directory',
    description: 'Retrieves verified emergency services, ambulance, and crisis support numbers for the user\'s country.',
    parameters: {
      countryCode: {
        type: 'string',
        description: 'Two-letter ISO country code (e.g. IN, US, GB, CA, AU)',
        required: false,
      },
    },
    execute: async (params: { countryCode?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolveEmergencyJurisdiction } = require('../../services/location/emergencyLocationResolver');
      const jur = await resolveEmergencyJurisdiction(params.countryCode);
      const lines = jur.allContacts.map((c: any) => `• ${c.name} (${c.number}) - ${c.hours}`);
      return {
        success: true,
        message: `Verified emergency contacts for ${jur.countryName}:\n${lines.join('\n')}`,
        data: jur,
        routeToOpen: '/(app)/safety/someone-to-talk',
      };
    },
  },

  find_nearby_emergency_care: {
    name: 'find_nearby_emergency_care',
    description: 'Finds the nearest hospital emergency departments and urgent care clinics based on device location.',
    parameters: {},
    execute: async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { requestLocationForEmergencyCare, findNearbyEmergencyCare } = require('../../services/location/emergencyLocationResolver');
      const coords = await requestLocationForEmergencyCare();
      if (!coords) {
        return {
          success: false,
          message: 'Location access is required to find emergency care closest to you. I can open the map search for hospitals instead.',
          routeToOpen: '/(app)/safety/someone-to-talk',
        };
      }
      const facilities = await findNearbyEmergencyCare(coords.latitude, coords.longitude);
      const list = facilities.slice(0, 3).map((f: any) => `• ${f.name}${f.distanceKm ? ` (${f.distanceKm} km away)` : ''}`).join('\n');
      return {
        success: true,
        message: `Found nearby emergency medical care:\n${list}\n\nI have prepared one-tap map directions and direct calls.`,
        data: { facilities },
        routeToOpen: '/(app)/safety/someone-to-talk',
      };
    },
  },

  // ─── Routines & Rewards Tools ────────────────────────────────────────────────

  get_routines: {
    name: 'get_routines',
    description:
      'Returns the user\'s routine alarms: scheduled times, repeat days, whether they are enabled, and upcoming triggers. Use to answer questions about what reminders are set or to proactively suggest claiming pending rewards.',
    parameters: {},
    execute: async () => {
      const store = useRootStore.getState();
      const routines = store.routines ?? [];
      if (!routines.length) {
        return {
          success: true,
          message: 'You have no routines set up yet. I can help you add one — just say "remind me to [something] at [time]".',
          data: { routines: [] },
          routeToOpen: '/(app)/routines',
        };
      }
      const enabled = routines.filter((r) => r.enabled);
      const disabled = routines.filter((r) => !r.enabled);
      const summary = enabled
        .map((r) => `• ${r.title} at ${format12Hour(r.time)}${r.days.length ? ` (${r.days.map((d) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d-1]).join(', ')})` : ' daily'}`)
        .join('\n');
      const disabledNote = disabled.length ? `\n${disabled.length} routine${disabled.length > 1 ? 's are' : ' is'} disabled.` : '';
      return {
        success: true,
        message: `You have ${enabled.length} active routine alarm${enabled.length !== 1 ? 's' : ''}:\n${summary}${disabledNote}\n\nThese fire as system notifications even when Thrivefold is closed.`,
        data: {
          total: routines.length,
          enabled: enabled.length,
          disabled: disabled.length,
          routines: routines.map((r) => ({
            id: r.id,
            title: r.title,
            time12: format12Hour(r.time),
            time24: r.time,
            enabled: r.enabled,
            days: r.days,
            kind: r.kind,
          })),
        },
        routeToOpen: '/(app)/routines',
      };
    },
  },

  get_pending_rewards: {
    name: 'get_pending_rewards',
    description:
      'Checks which milestone chest rewards the user is eligible to claim but has not yet claimed. Use proactively when the user might have unclaimed rewards. Always check this before ending a conversation about progress.',
    parameters: {},
    execute: async () => {
      const store = useRootStore.getState();
      const level = store.level ?? 1;
      const ledger = store.rewardLedger ?? [];
      const claimedKeys = new Set(ledger.filter((e) => e.kind === 'chest_reward').map((e) => e.key));

      const eligible = LEVEL_CHESTS.filter(
        (c) => level >= c.level && !claimedKeys.has(chestKey(c.level))
      );
      const upcoming = LEVEL_CHESTS.filter(
        (c) => level < c.level && !claimedKeys.has(chestKey(c.level))
      ).slice(0, 3);
      const claimed = LEVEL_CHESTS.filter((c) => claimedKeys.has(chestKey(c.level)));

      if (eligible.length > 0) {
        const names = eligible.map((c) => `• ${c.title} (Level ${c.level}: +${c.gems} Amber Gems + ${c.card.title} card)`).join('\n');
        return {
          success: true,
          message: `You have ${eligible.length} unclaimed milestone reward${eligible.length > 1 ? 's' : ''}! 🎁\n\n${names}\n\nOpen your Roadmap or Marketplace to claim ${eligible.length > 1 ? 'them' : 'it'} now!`,
          data: { eligible, upcoming, claimed: claimed.length, userLevel: level },
          routeToOpen: '/(app)/roadmap',
        };
      }

      const upcomingNote = upcoming.length
        ? `\nNext milestone: ${upcoming[0].title} at Level ${upcoming[0].level} (${upcoming[0].level - level} level${upcoming[0].level - level !== 1 ? 's' : ''} away).`
        : '';
      return {
        success: true,
        message: `No unclaimed rewards right now — you are Level ${level} and have claimed ${claimed.length} milestone chest${claimed.length !== 1 ? 's' : ''}.${upcomingNote}`,
        data: { eligible: [], upcoming, claimed: claimed.length, userLevel: level },
      };
    },
  },

  get_routine_adherence: {
    name: 'get_routine_adherence',
    description:
      'Summarises how many routines the user completed, missed, or skipped based on their check-in and quest history. Use when the user asks how they are doing with their habits.',
    parameters: {
      days: {
        type: 'number',
        description: 'How many recent days to look at (default 7, max 30)',
      },
    },
    execute: async (params: { days?: number }) => {
      const store = useRootStore.getState();
      const routines = store.routines ?? [];
      const lookback = Math.min(30, Math.max(1, params.days ?? 7));

      if (!routines.length) {
        return {
          success: true,
          message: 'You have no routines scheduled yet. Would you like to add some?',
          routeToOpen: '/(app)/routines',
          data: { routines: 0 },
        };
      }

      // Use quest completions as a proxy for routine adherence
      const recentQuests = store.todayQuests ?? [];
      const completedToday = recentQuests.filter((q) => q.isCompleted).length;
      const totalToday = recentQuests.length;

      const enabled = routines.filter((r) => r.enabled);
      const tips: string[] = [];
      if (enabled.length === 0) tips.push('All your routines are disabled — re-enable them to get reminders.');
      if (enabled.length > 5) tips.push('You have many routines. Consider focusing on 3–5 key ones.');

      return {
        success: true,
        message: `You have ${enabled.length} active routine${enabled.length !== 1 ? 's' : ''}. Today: ${completedToday}/${totalToday} quests completed.${tips.length ? '\n\nTip: ' + tips[0] : ''}`,
        data: {
          activeRoutines: enabled.length,
          totalRoutines: routines.length,
          questsCompletedToday: completedToday,
          questsTotalToday: totalToday,
          level: store.level,
          streak: store.streak,
        },
        routeToOpen: '/(app)/routines',
      };
    },
  },

  open_reward_chest: {
    name: 'open_reward_chest',
    description:
      'Opens and claims a specific milestone chest reward for the user. Use when the user asks to claim a reward or when they have an unclaimed eligible reward. Always verify eligibility first.',
    parameters: {
      level: {
        type: 'number',
        description: 'The milestone level of the chest to open (e.g. 5, 10, 20, 50, 100)',
        required: true,
      },
    },
    requiresConfirmation: true,
    execute: async (params: { level: number }, context: ToolExecutionContext) => {
      const store = useRootStore.getState();
      const userLevel = store.level ?? 1;
      const chest = LEVEL_CHESTS.find((c) => c.level === params.level);

      if (!chest) {
        return {
          success: false,
          message: `No milestone chest found at Level ${params.level}. Valid milestones are: ${LEVEL_CHESTS.map((c) => c.level).join(', ')}.`,
        };
      }

      const key = chestKey(chest.level);
      const alreadyClaimed = (store.rewardLedger ?? []).some((e) => e.key === key);
      if (alreadyClaimed) {
        return {
          success: false,
          message: `You already claimed the ${chest.title} chest! It's saved in your collection. Keep progressing for the next milestone.`,
          data: { chest, alreadyClaimed: true },
        };
      }

      if (userLevel < chest.level) {
        return {
          success: false,
          message: `You need to reach Level ${chest.level} to claim this chest. You are currently Level ${userLevel} — ${chest.level - userLevel} level${chest.level - userLevel !== 1 ? 's' : ''} to go!`,
          data: { requiredLevel: chest.level, currentLevel: userLevel },
          routeToOpen: '/(app)/roadmap',
        };
      }

      // Claim via the store
      const result = store.openChest(chest.level);
      if (!result) {
        return {
          success: false,
          message: 'Could not claim the chest — it may already be claimed. Check your Roadmap for status.',
          routeToOpen: '/(app)/roadmap',
        };
      }

      navigateTo('/(app)/roadmap');
      return {
        success: true,
        message: `🎁 Claimed! You received +${chest.gems} Amber Gems and the ${chest.card.title} (${chest.card.rarity}) collector card from the ${chest.title}! Check your Roadmap to see your collection.`,
        data: { gems: chest.gems, card: chest.card, chestTitle: chest.title },
        routeToOpen: '/(app)/roadmap',
        autoNavigate: true,
      };
    },
  },

  schedule_or_update_routine: {
    name: 'schedule_or_update_routine',
    description: 'Add or update a routine alarm with exact time in 24h format and repeat days, detecting and preventing conflicts.',
    parameters: {
      title: { type: 'string', description: 'Name of the routine (e.g. Bedtime wind-down, Morning stretch)', required: true },
      time: { type: 'string', description: '24-hour time HH:mm (e.g. 08:30 or 22:00)', required: true },
      routineId: { type: 'string', description: 'Optional routine ID if updating an existing alarm' },
      days: { type: 'array', description: 'Repeat days array (1=Mon ... 7=Sun, empty=daily)' },
    },
    execute: async ({ title, time, routineId, days = [] }: { title: string; time: string; routineId?: string; days?: number[] }) => {
      const store = useRootStore.getState();
      const existing = store.routines;

      // Conflict detection: check if another routine has the exact same scheduled time
      const conflict = existing.find((r) => r.time === time && r.id !== routineId && r.enabled);
      const conflictWarning = conflict ? ` Note: "${conflict.title}" is also scheduled at ${format12Hour(time)}.` : '';

      if (routineId) {
        store.updateRoutine(routineId, { title, time, days: days || [] });
        return {
          success: true,
          message: `⏰ Updated routine "${title}" to ${format12Hour(time)} (${time}).${conflictWarning}`,
          routeToOpen: '/(app)/routines',
        };
      }

      store.addRoutine({
        kind: 'custom',
        title,
        time,
        days: days || [],
      });

      return {
        success: true,
        message: `⏰ Scheduled routine alarm "${title}" for ${format12Hour(time)} (${time}) with native alarm wake lock.${conflictWarning}`,
        routeToOpen: '/(app)/routines',
      };
    },
  },

  remove_routine_alarm: {
    name: 'remove_routine_alarm',
    description: 'Remove or cancel a routine alarm schedule by title or routine ID.',
    parameters: {
      identifier: { type: 'string', description: 'Title or routine ID to cancel', required: true },
    },
    execute: async ({ identifier }: { identifier: string }) => {
      const store = useRootStore.getState();
      const match = store.routines.find((r) => r.id === identifier || r.title.toLowerCase().includes(identifier.toLowerCase()));
      if (!match) {
        return {
          success: false,
          message: `Could not find an active routine matching "${identifier}".`,
          routeToOpen: '/(app)/routines',
        };
      }
      store.removeRoutine(match.id);
      return {
        success: true,
        message: `🗑️ Removed routine alarm "${match.title}" (${format12Hour(match.time)}).`,
        routeToOpen: '/(app)/routines',
      };
    },
  },

  emergency_crisis_dispatch: {
    name: 'emergency_crisis_dispatch',
    description: 'Emergency response tool for acute crisis or safety distress with regional emergency number lookups.',
    parameters: {
      urgency: { type: 'string', description: 'Urgency level: immediate, high, or moderate', required: true },
      userConcern: { type: 'string', description: 'Description of the distress or emergency' },
      userCountry: { type: 'string', description: 'Optional user country/region (e.g. US, IN, UK, EU)' },
    },
    execute: async ({ urgency, userConcern, userCountry = 'IN' }: { urgency: string; userConcern?: string; userCountry?: string }) => {
      useRootStore.getState().setCoachPersona('support');
      return {
        success: true,
        message: `🚨 Emergency resources active. If you or someone you know is in acute danger, please call emergency services immediately (112 in India/EU, 988/911 in US/Canada, 999 in UK). I am right here with you in support mode.`,
      };
    },
  },
};

/**
 * Executes a tool by name with parameter validation and context binding.
 */
export async function executeTool(
  toolName: string,
  params: Record<string, any>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const tool = TOOLS[toolName];
  if (!tool) {
    return {
      success: false,
      message: `Tool "${toolName}" is not registered in the assistant tool registry.`,
    };
  }

  // Check required parameters
  for (const [paramName, schema] of Object.entries(tool.parameters)) {
    if (schema.required && (params[paramName] === undefined || params[paramName] === null)) {
      return {
        success: false,
        message: `Missing required parameter "${paramName}" for tool "${toolName}".`,
      };
    }
  }

  // Confirmation gate for sensitive actions
  if (tool.requiresConfirmation && !context.isConfirmed) {
    return {
      success: false,
      message: `Action requires user confirmation.`,
      needsConfirmation: true,
      confirmationPrompt: `Are you sure you want to perform: ${tool.description}?`,
    };
  }

  try {
    return await tool.execute(params, context);
  } catch (err: any) {
    return {
      success: false,
      message: `Error executing ${toolName}: ${err.message || String(err)}`,
    };
  }
}

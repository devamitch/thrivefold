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
import { answerWithHybridRag } from '../../services/local-ai/rag/hybridRagPipeline';
import { memoryStore } from '../../services/local-ai/memory/memoryStore';
import { knowledgeStore } from '../../services/local-ai/rag/knowledgeStore';
import { lookupMedicine, analyzePrescriptionText } from '../../services/ai/medicineResearch';

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
    execute: async (params: { metric: 'steps' | 'water' | 'calories' | 'quests' | 'summary' }) => {
      const store = useRootStore.getState();
      const today = formatLocalDate(new Date());

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
      const res = await answerWithHybridRag(context.userId || 'local_user', params.query);
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
      navigateTo('/(app)/safety/urgent-support');
      return {
        success: true,
        message:
          "You are not alone. I'm opening urgent support right now. Tele-MANAS on 14416 is free, 24/7. In emergency, call 112.",
        routeToOpen: '/(app)/safety/urgent-support',
        autoNavigate: true,
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

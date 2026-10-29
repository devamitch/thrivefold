jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));
jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    openDatabaseAsync: jest.fn(async () => mockDb),
  };
});

import {
  cosineSimilarity,
  euclideanDistance,
  topKSimilar,
  normalizeVector,
} from '../../src/services/local-ai/memory/vectorMath';
import {
  MODEL_PRESETS,
  getModelPresetById,
  getRecommendedModel,
} from '../../modules/local-ai/src/modelCatalog';
import { classifyReflection } from '../../src/services/local-ai/tasks/classification';
import { extractWellnessEntities } from '../../src/services/local-ai/tasks/entityExtraction';
import { summarizeWellnessJournal } from '../../src/services/local-ai/tasks/summarization';
import { suggestOrganization } from '../../src/services/local-ai/tasks/organizationSuggestions';
import {
  checkCrisisInterception,
  routeLocalAiTask,
} from '../../src/services/local-ai/orchestration/taskRouter';
import {
  statefulOrchestrator,
  type NonSensitiveCohortFeatures,
} from '../../src/services/local-ai/orchestration/langGraphOrchestrator';

describe('Local AI - Vector Math & Similarity Engine', () => {
  test('P0: Cosine similarity of identical vectors is 1.0', () => {
    const v1 = [0.2, 0.5, 0.8, -0.3];
    const sim = cosineSimilarity(v1, v1);
    expect(sim).toBeCloseTo(1.0, 5);
  });

  test('P0: Cosine similarity of orthogonal vectors is 0.0', () => {
    const v1 = [1, 0, 0];
    const v2 = [0, 1, 0];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(0.0, 5);
  });

  test('P0: Cosine similarity of opposite vectors is -1.0', () => {
    const v1 = [1, 2, 3];
    const v2 = [-1, -2, -3];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(-1.0, 5);
  });

  test('P0: Handles zero-magnitude or empty vectors gracefully without NaN', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0.0);
    expect(cosineSimilarity([], [])).toBe(0.0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0.0);
  });

  test('P0: Euclidean distance between vectors', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5.0, 5);
    expect(euclideanDistance([1, 1], [1, 1])).toBeCloseTo(0.0, 5);
    expect(euclideanDistance([1], [1, 2])).toBe(Number.POSITIVE_INFINITY);
  });

  test('P0: Normalizes vector to unit length', () => {
    const v = [3, 4];
    const norm = normalizeVector(v);
    expect(norm[0]).toBeCloseTo(0.6, 5);
    expect(norm[1]).toBeCloseTo(0.8, 5);
    expect(cosineSimilarity(norm, norm)).toBeCloseTo(1.0, 5);
  });

  test('P0: topKSimilar ranks candidate embeddings descending by similarity', () => {
    const query = [1, 0, 0];
    const candidates = [
      { id: 'c1', vector: [0, 1, 0] },     // orthogonal -> 0.0
      { id: 'c2', vector: [0.9, 0.1, 0] }, // high match -> ~0.99
      { id: 'c3', vector: [0.5, 0.5, 0] }, // moderate match -> ~0.707
      { id: 'c4', vector: [-1, 0, 0] },    // opposite -> -1.0
    ];

    const results = topKSimilar(query, candidates, 2, 0.1);
    expect(results).toHaveLength(2);
    expect(results[0].item.id).toBe('c2');
    expect(results[1].item.id).toBe('c3');
  });
});

describe('Local AI - Model Catalog & Hardware Suitability', () => {
  test('P0: Catalog lists real downloadable models with their published SHA-256', () => {
    expect(MODEL_PRESETS.length).toBe(2);
    for (const m of MODEL_PRESETS) {
      expect(m.downloadUrl).toMatch(/^https:\/\/huggingface\.co\/Qwen\//);
      expect(m.expectedSha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(getModelPresetById('qwen2.5-0.5b-instruct')?.sizeBytes).toBe(491_400_032);
  });

  test('P0: Recommends the larger model only with enough RAM', () => {
    expect(getRecommendedModel(4000).id).toBe('qwen2.5-0.5b-instruct');
    expect(getRecommendedModel(6000).id).toBe('qwen2.5-1.5b-instruct');
  });
});

describe('Local AI - Structured AI Tasks & Fallbacks', () => {
  test('P0: classifyReflection classifies high stress/anxiety deterministically', async () => {
    const result = await classifyReflection(
      'Work was overwhelming today, heart racing with anxiety and strict deadlines'
    );
    expect(result.category).toBe('tense');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.suggestedAction).toContain('box breathing');
  });

  test('P0: classifyReflection classifies fatigue deterministically', async () => {
    const result = await classifyReflection(
      'Feeling completely drained, sleepy and exhausted after a sleepless night'
    );
    expect(result.category).toBe('fatigued');
    expect(result.suggestedAction).toContain('restorative breathwork');
  });

  test('P0: extractWellnessEntities extracts quantified sleep, water and steps', async () => {
    const result = await extractWellnessEntities(
      'Logged 7.5 hours of sleep, drank 3 liters of water, and reached 10000 steps today.'
    );
    expect(result.metrics.sleepHours).toBe(7.5);
    expect(result.metrics.waterIntake).toBe(3);
    expect(result.metrics.steps).toBe(10000);
  });

  test('P0: summarizeWellnessJournal produces clean bulleted insights', async () => {
    const notes = [
      'Morning: Slept well, went for a run.',
      'Afternoon: Busy day at work, felt tight in the neck.',
      'Evening: Gentle yoga, felt much more relaxed.',
    ];

    const summary = await summarizeWellnessJournal(notes);
    expect(summary.headline).toBeDefined();
    expect(summary.bulletPoints.length).toBeGreaterThan(0);
    expect(summary.mindfulTakeaway).toBeDefined();
  });

  test('P0: suggestOrganization clusters items into clear tags and routines', async () => {
    const content = 'Did a 5km morning run and finished with upper body gym workout';
    const suggestions = await suggestOrganization(content);
    expect(suggestions.suggestedTags).toContain('fitness');
    expect(suggestions.categorySuggestion).toBe('fitness');
  });
});

describe('Local AI - Safety Circuit Breaker & Task Router', () => {
  test('P0: Safety circuit breaker intercepts self-harm and provides crisis line', () => {
    const crisis = checkCrisisInterception('I feel completely hopeless and want to end my life');
    expect(crisis.isCrisis).toBe(true);
    expect(crisis.helplineNotice).toContain('988');
  });

  test('P0: Task router catches crisis phrases and halts standard processing', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Thinking about suicide and self harm',
    });

    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('tense');
      expect(result.data.keywords).toContain('crisis_intercepted');
      expect(result.data.suggestedAction).toContain('988');
    }
  });

  test('P0: Task router executes normal classification task', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Feeling peaceful, calm and steady after meditation',
    });

    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('grounded');
      expect(result.data.keywords).toContain('calm');
    }
  });
});

describe('Local AI - Stateful LangGraph Orchestration & Cohort Clustering', () => {
  test('P0: StatefulOrchestrator tracks checkpoints across pipeline execution', async () => {
    const res = await statefulOrchestrator.runWorkflow('usr-test-1', {
      type: 'classify',
      text: 'Had an active and energized day at the park',
    });

    expect(res.result.type).toBe('classify');
    if (res.result.type === 'classify') {
      expect(res.result.data.category).toBe('energized');
    }
  });

  test('P0: Non-sensitive cohort clustering clusters users strictly on consented behavioral features', () => {
    const mockCohortData: NonSensitiveCohortFeatures[] = [
      {
        userId: 'u1',
        activeExperience: 'women',
        weeklyCheckInFrequency: 6,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 25,
        streakCount: 14,
        consentGranted: true,
      },
      {
        userId: 'u2',
        activeExperience: 'men',
        weeklyCheckInFrequency: 2,
        prefersMorningRoutine: false,
        averageWorkoutDurationMinutes: 15,
        streakCount: 3,
        consentGranted: true,
      },
      {
        userId: 'u3',
        activeExperience: 'all',
        weeklyCheckInFrequency: 5,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 30,
        streakCount: 2,
        consentGranted: false, // Opted out
      },
    ];

    const clusters = statefulOrchestrator.clusterNonSensitiveCohorts(mockCohortData);

    // u3 should NOT be clustered because consentGranted is false
    expect(clusters.morning_routine_cohort.userIds).toContain('u1');
    expect(clusters.morning_routine_cohort.userIds).not.toContain('u3');

    // u1 has streak 14 -> high consistency
    expect(clusters.high_consistency_cohort.userIds).toContain('u1');

    // u2 has streak 3 -> gentle paced
    expect(clusters.gentle_paced_cohort.userIds).toContain('u2');
  });
});

describe('Local AI - Hybrid RAG Pipeline', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    getExerciseCatalogDocuments,
    rankSparseBM25,
    retrieveHybridEvidence,
    answerWithHybridRag,
  } = require('../../src/services/local-ai/rag/hybridRagPipeline') as typeof import('../../src/services/local-ai/rag/hybridRagPipeline');

  test('P0: getExerciseCatalogDocuments indexes exercise library with steps and safety', () => {
    const docs = getExerciseCatalogDocuments();
    expect(docs.length).toBeGreaterThan(20);
    const squatDoc = docs.find((d) => d.id.includes('squat'));
    expect(squatDoc).toBeDefined();
    expect(squatDoc?.content).toContain('Steps:');
    expect(squatDoc?.sourceType).toBe('exercise_catalog');
  });

  test('P0: rankSparseBM25 ranks documents relevant to query keyword', () => {
    const docs = getExerciseCatalogDocuments();
    const hits = rankSparseBM25(docs, 'squat knees');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].doc.title.toLowerCase()).toContain('squat');
    expect(hits[0].score).toBeGreaterThan(0);
  });

  test('P0: retrieveHybridEvidence fuses results with RRF scores', async () => {
    const hits = await retrieveHybridEvidence('usr-rag-1', 'squat posture', 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].hybridScore).toBeGreaterThan(0);
    expect(hits[0].snippet).toBeDefined();
  });

  test('P0: answerWithHybridRag answers with verified citations', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'How do I do a squat safely?');
    expect(res.isGrounded).toBe(true);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0]).toContain('Exercise Catalog');
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  test('P0: answerWithHybridRag stays honest when no records match', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'quantum electrodynamics astrophysics');
    expect(res.isGrounded).toBe(false);
    expect(res.answer).toContain('not find enough relevant records');
    expect(res.citations).toHaveLength(0);
  });
});


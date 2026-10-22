const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'content', 'game');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 20 Chapters with 50 levels each = 1,000 Levels
const CHAPTER_THEMES = [
  { chapter: 1, title: 'Foundations & Somatic Awakening', theme: 'Establishing baseline nervous system balance and micro-routines' },
  { chapter: 2, title: 'Habituation & Consistency', theme: 'Anchoring daily practices without friction or strain' },
  { chapter: 3, title: 'Resilience & Stress Reset', theme: 'Downregulating cortisol and activating parasympathetic pathways' },
  { chapter: 4, title: 'Mobility & Physical Autonomy', theme: 'Spine, hip, and shoulder decompression for sustainable posture' },
  { chapter: 5, title: 'Circadian Architecture & Sleep', theme: 'Optimizing sleep depth, melatonin rhythms, and wake vitality' },
  { chapter: 6, title: 'Metabolic & Hydration Flow', theme: 'Cellular nourishment, electrolyte timing, and steady fuel' },
  { chapter: 7, title: 'Mind-Body Attunement', theme: 'Refining interoceptive awareness and somatic cues' },
  { chapter: 8, title: 'Strength & Tendon Integrity', theme: 'Functional joint stability and core activation' },
  { chapter: 9, title: 'Deep Parasympathetic Mastery', theme: 'Prolonged vagal tone regulation and restorative stillness' },
  { chapter: 10, title: 'Adaptive Consistency', theme: 'Navigating travel, demanding schedules, and routine recovery' },
  { chapter: 11, title: 'Energy Distribution & Pacing', theme: 'Preventing afternoon crashes and pacing mental output' },
  { chapter: 12, title: 'Somatic Posture & Spine Alignment', theme: 'Undoing chronic sitting posture and thoracic stiffness' },
  { chapter: 13, title: 'Intuitive Recovery & Rest Days', theme: 'Honoring recovery periods as active physiological regeneration' },
  { chapter: 14, title: 'Focus Sprints & Cognitive Clarity', theme: 'Deep work endurance and cognitive calm' },
  { chapter: 15, title: 'Breath Mechanics & CO2 Tolerance', theme: 'Diaphragmatic control, nasal breathing, and oxygen efficiency' },
  { chapter: 16, title: 'Emotional Equilibrium & Grounding', theme: 'Stabilizing moods and developing compassionate self-talk' },
  { chapter: 17, title: 'Seasonal & Chronobiological Flow', theme: 'Aligning energy with light cycles and environmental changes' },
  { chapter: 18, title: 'Relational & Social Wellbeing', theme: 'Cultivating safe boundaries and meaningful community bonds' },
  { chapter: 19, title: 'Autonomous Mastery', theme: 'Designing bespoke daily protocols for lifetime vitality' },
  { chapter: 20, title: 'Transcendent Harmony & Stewardship', theme: 'Pinnacle integration of physical, mental, and restorative wellness' },
];

const LEVEL_SUB_TITLES = [
  'Initial Spark', 'Rhythmic Alignment', 'Steady Footing', 'Deep Grounding', 'Micro-Practice',
  'Gentle Awakening', 'Nervous Baseline', 'Centering Breath', 'Hydration Anchor', 'Unshakable Focus',
  'Tension Dissolution', 'Fluid Joint Motion', 'Spinal Relief', 'Pelvic Stability', 'Nourishing Rhythm',
  'Deep Rest Initiation', 'Restorative Slumber', 'Morning Clarity', 'Pacing Mastery', 'Quiet Strength',
  'Inner Equilibrium', 'Sustainable Cadence', 'Resilient Presence', 'Postural Grace', 'Vital Circulation',
  'Vagal Tone Activation', 'Breath Horizon', 'Balanced Chemistry', 'Calm Concentration', 'Gentle Momentum',
  'Recovery Instinct', 'Core Centering', 'Stamina Unfolding', 'Mindful Pause', 'Cellular Renewal',
  'Harmonic Baseline', 'Dynamic Balance', 'Steadfast Routine', 'Self-Attunement', 'Effortless Flow',
  'Quiet Discipline', 'Embodied Peace', 'Clarity Anchor', 'Somatic Depth', 'Restful Regeneration',
  'Graceful Adaptation', 'Unbroken Calm', 'Physical Autonomy', 'Integrated Vitality', 'Pinnacle Milestone'
];

const levelDefinitions = [];
for (let lvl = 1; lvl <= 1000; lvl++) {
  const chapterIdx = Math.min(19, Math.floor((lvl - 1) / 50));
  const chapterNumber = chapterIdx + 1;
  const chapter = CHAPTER_THEMES[chapterIdx];
  const subIdx = (lvl - 1) % 50;
  const subTitle = LEVEL_SUB_TITLES[subIdx];
  const requiredCumulativeXp = Math.floor(100 * Math.pow(lvl, 1.25));

  const unlockedFeatures = [];
  if (lvl === 5) unlockedFeatures.push('Special Quests Vault Tier 1');
  if (lvl === 10) unlockedFeatures.push('Custom Daily Point Targets');
  if (lvl === 25) unlockedFeatures.push('Advanced Mobility Challenges');
  if (lvl === 50) unlockedFeatures.push('Chapter 1 Mastery Badge & Deep Rest Protocols');
  if (lvl % 50 === 0 && lvl > 50) unlockedFeatures.push(`Chapter ${chapterNumber} Champion Milestone`);

  levelDefinitions.push({
    level: lvl,
    chapterNumber,
    title: `Level ${lvl} — ${chapter.title}: ${subTitle}`,
    arc: chapter.title,
    requiredCumulativeXp,
    unlockedFeatures,
  });
}

const chapters = CHAPTER_THEMES.map((c) => ({
  chapterNumber: c.chapter,
  title: c.title,
  theme: c.theme,
  levelRange: [(c.chapter - 1) * 50 + 1, c.chapter * 50],
}));

const skillDefinitions = [
  { id: 'consistency', name: 'Consistency & Routine', description: 'Building unbreakable, low-friction habits', experienceScope: 'shared' },
  { id: 'movement', name: 'Mobility & Conditioning', description: 'Functional posture, athletic movement, and spinal integrity', experienceScope: 'shared' },
  { id: 'sleep', name: 'Sleep & Circadian Rhythm', description: 'Restorative architecture and recovery sleep', experienceScope: 'shared' },
  { id: 'mindfulness', name: 'Parasympathetic Regulation', description: 'Nervous system down-regulation and box breathing', experienceScope: 'shared' },
  { id: 'nutrition', name: 'Nourishment & Hydration', description: 'Cellular hydration, macro balance, and tailored nutrition', experienceScope: 'shared' },
  { id: 'mens_vitality', name: "Men's Vitality & Stamina", description: "Desk posture relief, pelvic floor endurance, and peak vitality", experienceScope: 'men_health' },
  { id: 'cycle_care', name: 'Restorative Cycle Sanctuary', description: 'Harmony Bloom follicular, luteal, and gentle pelvic care', experienceScope: 'women_health' },
  { id: 'affirming_care', name: 'Affirming Somatic Care', description: 'Compassionate grounding, posture release, and self-care', experienceScope: 'pride_wellbeing' },
];

const taskDefinitions = [
  // --- MEN'S HEALTH SPECIFIC TASKS ---
  {
    id: 'task_men_desk_decompression',
    version: 1,
    title: 'Desk Worker Spine & Hip Decompression',
    shortDescription: 'Unclamp lumbar spine and open hip flexors after prolonged sitting',
    purpose: 'Relieves lower back compression, engages glutes, and releases psoas tension without gym equipment.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Half-Kneeling Hip Flexor Stretch', body: 'Kneel on one knee, tuck pelvis under gently, and shift hips forward for 45s per side.' },
      { id: 's2', stepNumber: 2, title: 'Thoracic Extension over Chair', body: 'Sit tall, interlace fingers behind head, and arch gently over the chair backrest for 5 deep breaths.' },
      { id: 's3', stepNumber: 3, title: 'Glute Bridge Activation', body: 'Lie on your back, plant heels, and squeeze glutes at the top for 10 slow reps.' },
    ],
    category: 'mens_vitality',
    experienceScopes: ['men_health'],
    skillOutcomes: [{ skillId: 'mens_vitality', skillXp: 15 }, { skillId: 'movement', skillXp: 10 }],
    difficulty: 'standard',
    estimatedDurationMinutes: 6,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'evidence_supported',
    verificationPolicyId: 'activity-log-v1',
    verificationRequirements: [{ type: 'activity_log_details', description: 'Confirm completion of all 3 spinal decompression stations' }],
    points: { taskPoints: 15, xp: 25, coins: 10 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
  {
    id: 'task_men_box_breathing',
    version: 1,
    title: 'Tactical Box Breathing for Stress Reset',
    shortDescription: '4-4-4-4 diaphragmatic breathing to rapidly lower heart rate and cortisol',
    purpose: 'Activates vagus nerve, clears cognitive fatigue, and restores autonomic nervous system control.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Inhale 4 Seconds', body: 'Inhale slowly through your nose into the low belly for 4 counts.' },
      { id: 's2', stepNumber: 2, title: 'Hold 4 Seconds', body: 'Pause gently with relaxed throat for 4 counts.' },
      { id: 's3', stepNumber: 3, title: 'Exhale 4 Seconds', body: 'Exhale smoothly through lips for 4 counts.' },
      { id: 's4', stepNumber: 4, title: 'Hold Empty 4 Seconds', body: 'Remain empty and calm for 4 counts. Repeat for 6 complete rounds.' },
    ],
    category: 'mindfulness',
    experienceScopes: ['men_health', 'shared'],
    skillOutcomes: [{ skillId: 'mindfulness', skillXp: 15 }],
    difficulty: 'gentle',
    estimatedDurationMinutes: 4,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'system_verified',
    verificationPolicyId: 'in-app-timer-v1',
    verificationRequirements: [{ type: 'in_app_timer', description: 'Complete 4-minute paced breathing session', minDurationSeconds: 240 }],
    points: { taskPoints: 10, xp: 20, coins: 8 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
  {
    id: 'task_men_athletic_mobility',
    version: 1,
    title: 'Athletic Hamstring & Adductor Floss',
    shortDescription: 'Dynamic groin and hamstring mobility sequence',
    purpose: 'Improves squat depth, relieves pelvic floor tension, and supports athletic power.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Cossack Squats', body: 'Shift weight side to side smoothly, keeping chest proud, 8 reps each side.' },
      { id: 's2', stepNumber: 2, title: 'Deep Squat Pry', body: 'Drop into a deep comfortable squat, press elbows against knees, and breathe for 60s.' },
    ],
    category: 'movement',
    experienceScopes: ['men_health'],
    skillOutcomes: [{ skillId: 'movement', skillXp: 20 }, { skillId: 'mens_vitality', skillXp: 10 }],
    difficulty: 'progressive',
    estimatedDurationMinutes: 8,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'evidence_supported',
    verificationPolicyId: 'activity-log-v1',
    verificationRequirements: [{ type: 'activity_log_details', description: 'Log session duration and mobility feel' }],
    points: { taskPoints: 15, xp: 30, coins: 12 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
  {
    id: 'task_men_cold_finish',
    version: 1,
    title: 'Cold Finish Shower (60 Seconds)',
    shortDescription: 'Turn water to cold for the final 60 seconds of your morning shower',
    purpose: 'Enhances norepinephrine release, promotes alertness, and builds stress inoculation.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Prepare Breath', body: 'Take 3 steady deep breaths before turning the knob to cold.' },
      { id: 's2', stepNumber: 2, title: 'Controlled Exhales', body: 'Step under cold water, focusing on slow, extended exhales rather than gasping for 60 seconds.' },
    ],
    category: 'routine',
    experienceScopes: ['men_health'],
    skillOutcomes: [{ skillId: 'consistency', skillXp: 15 }, { skillId: 'mens_vitality', skillXp: 10 }],
    difficulty: 'standard',
    estimatedDurationMinutes: 2,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'self_reported',
    verificationPolicyId: 'self-declaration-v1',
    verificationRequirements: [{ type: 'self_declaration', description: 'Honest declaration of completing 60s cold finish' }],
    points: { taskPoints: 10, xp: 20, coins: 5 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },

  // --- WOMEN'S HEALTH SPECIFIC TASKS (HARMONY BLOOM INSPIRED) ---
  {
    id: 'task_women_bloom_pelvic_flow',
    version: 1,
    title: 'Harmony Bloom: Gentle Pelvic & Sacral Release',
    shortDescription: 'Restorative hip and sacral gentle poses for pelvic floor calm',
    purpose: 'Eases cramps, supports lymphatic flow in the pelvic bowl, and reduces lower back tension.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Supported Child Pose', body: 'Widen knees, rest torso forward on cushions or mat, breathe into low back for 2 minutes.' },
      { id: 's2', stepNumber: 2, title: 'Supta Baddha Konasana', body: 'Recline with soles of feet together, knees open, placing hands on belly for 3 minutes.' },
    ],
    category: 'cycle_care',
    experienceScopes: ['women_health'],
    skillOutcomes: [{ skillId: 'cycle_care', skillXp: 20 }, { skillId: 'movement', skillXp: 10 }],
    difficulty: 'gentle',
    estimatedDurationMinutes: 7,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'system_verified',
    verificationPolicyId: 'in-app-timer-v1',
    verificationRequirements: [{ type: 'in_app_timer', description: 'Completed guided 5-minute restorative session', minDurationSeconds: 300 }],
    points: { taskPoints: 15, xp: 25, coins: 10 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
  {
    id: 'task_women_magnesium_anchor',
    version: 1,
    title: 'Nourishment Anchor: Magnesium & Mineral Hydration',
    shortDescription: 'Replenish electrolytes and minerals to support muscle relaxation',
    purpose: 'Assists natural neurotransmitter synthesis and smooth muscle relaxation during sensitive phases.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Prepare Beverage', body: 'Mix warm water or herbal infusion with lemon and pinch of unrefined sea salt or magnesium glycinate.' },
      { id: 's2', stepNumber: 2, title: 'Sip Mindfully', body: 'Drink slowly over 5 minutes while seated without screens.' },
    ],
    category: 'nutrition',
    experienceScopes: ['women_health'],
    skillOutcomes: [{ skillId: 'nutrition', skillXp: 15 }, { skillId: 'cycle_care', skillXp: 10 }],
    difficulty: 'starter',
    estimatedDurationMinutes: 3,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'self_reported',
    verificationPolicyId: 'self-declaration-v1',
    verificationRequirements: [{ type: 'self_declaration', description: 'Self-confirm mineral nourishment drink' }],
    points: { taskPoints: 10, xp: 15, coins: 5 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },

  // --- PRIDE / LGBTQ+ TASKS ---
  {
    id: 'task_pride_chest_posture_release',
    version: 1,
    title: 'Somatic Chest & Upper Spine Release',
    shortDescription: 'Gentle opening for pectoral and intercostal strain',
    purpose: 'Relieves upper body binding or posture tension through gentle breath expansion.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Doorway Pec Stretch', body: 'Place forearm on door frame, step gently forward, breathe into collarbones for 45s per side.' },
      { id: 's2', stepNumber: 2, title: 'Prone Cactus Arm Extension', body: 'Lie face down or seated, open arms to 90 degrees, and lift gently with soft exhales.' },
    ],
    category: 'affirming_care',
    experienceScopes: ['pride_wellbeing'],
    skillOutcomes: [{ skillId: 'affirming_care', skillXp: 20 }, { skillId: 'movement', skillXp: 10 }],
    difficulty: 'gentle',
    estimatedDurationMinutes: 5,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'evidence_supported',
    verificationPolicyId: 'activity-log-v1',
    verificationRequirements: [{ type: 'activity_log_details', description: 'Confirm completion of somatic chest release' }],
    points: { taskPoints: 15, xp: 25, coins: 10 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },

  // --- SHARED TASKS ---
  {
    id: 'task_shared_sunlight_walk',
    version: 1,
    title: '15-Minute Morning Sunlight Walk',
    shortDescription: 'Brisk outdoor walk in natural light to set circadian rhythm',
    purpose: 'Stimulates retinal ganglion cells, sets sleep timer for tonight, and boosts core temperature.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Step Outside', body: 'Get outdoors within 90 minutes of waking without wearing sunglasses if comfortable.' },
      { id: 's2', stepNumber: 2, title: 'Brisk Pace', body: 'Maintain a brisk, steady stride for 15 minutes.' },
    ],
    category: 'movement',
    experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
    skillOutcomes: [{ skillId: 'movement', skillXp: 15 }, { skillId: 'sleep', skillXp: 15 }],
    difficulty: 'standard',
    estimatedDurationMinutes: 15,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'evidence_supported',
    verificationPolicyId: 'activity-log-v1',
    verificationRequirements: [{ type: 'activity_log_details', description: 'Log walk completion and duration' }],
    points: { taskPoints: 15, xp: 30, coins: 10 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
  {
    id: 'task_shared_digital_sunset',
    version: 1,
    title: 'Digital Sunset: Screens Off 45 Min Before Bed',
    shortDescription: 'Silence notifications and dim harsh overhead lighting',
    purpose: 'Allows natural melatonin surge and lowers sympathetic arousal before sleep.',
    instructions: [
      { id: 's1', stepNumber: 1, title: 'Dim Lighting', body: 'Switch overhead lights to warm ambient lamps.' },
      { id: 's2', stepNumber: 2, title: 'Dock Devices', body: 'Place phone on charger across the room.' },
    ],
    category: 'sleep',
    experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
    skillOutcomes: [{ skillId: 'sleep', skillXp: 20 }, { skillId: 'consistency', skillXp: 10 }],
    difficulty: 'standard',
    estimatedDurationMinutes: 45,
    levelEligibility: { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: [],
    verificationClass: 'self_reported',
    verificationPolicyId: 'self-declaration-v1',
    verificationRequirements: [{ type: 'self_declaration', description: 'Self-confirm digital sunset completion' }],
    points: { taskPoints: 15, xp: 25, coins: 10 },
    availability: { assignmentTypes: ['daily', 'special_quest'], canReplaceDaily: true },
    contentProvenance: { authored: true, reviewed: true },
  },
];

const specialQuestDefinitions = [
  // Special Quest 1 for Men:
  {
    ...taskDefinitions[0],
    id: 'sq_men_lumbar_overhaul',
    title: 'Special Quest: Total Spine & Pelvic Reset',
    shortDescription: 'In-depth lumbar decompression + hip capsule release to complete daily points',
    purpose: 'A comprehensive athletic recovery session designed to substitute for any routine daily task.',
    points: { taskPoints: 20, xp: 40, coins: 15 },
    replacesAssignmentType: 'daily',
    vaultCategory: 'mobility',
    experienceScopes: ['men_health'],
  },
  // Special Quest 2 for Men:
  {
    ...taskDefinitions[2],
    id: 'sq_men_deep_squat_endurance',
    title: 'Special Quest: Deep Squat & Groin Floss Vault',
    shortDescription: '10-minute deep hip capsule and adductor restoration sprint',
    purpose: 'Builds hip flexibility and pelvic floor decompression for active males.',
    points: { taskPoints: 20, xp: 40, coins: 15 },
    replacesAssignmentType: 'daily',
    vaultCategory: 'strength',
    experienceScopes: ['men_health'],
  },
  // Special Quest for Women:
  {
    ...taskDefinitions[4],
    id: 'sq_women_harmony_bloom_sanctuary',
    title: 'Special Quest: Harmony Bloom Restorative Sanctuary',
    shortDescription: 'Dedicated sacral release and nourishing breath to complete daily points',
    purpose: 'Complete restorative wellness flow designed to replace any strenuous task.',
    points: { taskPoints: 20, xp: 40, coins: 15 },
    replacesAssignmentType: 'daily',
    vaultCategory: 'restorative',
    experienceScopes: ['women_health'],
  },
  // Special Quest for Pride:
  {
    ...taskDefinitions[6],
    id: 'sq_pride_grounding_mastery',
    title: 'Special Quest: Somatic Grounding & Safe Space Anchor',
    shortDescription: 'Deep nervous system down-regulation and somatic expansion',
    purpose: 'Protective, affirming self-care session to achieve daily goal points.',
    points: { taskPoints: 20, xp: 40, coins: 15 },
    replacesAssignmentType: 'daily',
    vaultCategory: 'nervous_system',
    experienceScopes: ['pride_wellbeing'],
  },
  // Universal Special Quest:
  {
    ...taskDefinitions[7],
    id: 'sq_shared_outdoor_nature_quest',
    title: 'Special Quest: 30-Minute Outdoor Nature Immersion',
    shortDescription: 'Extended brisk walk in nature to completely achieve today points',
    purpose: 'High-point replacement challenge that can fulfill 25 of your 40 daily goal points.',
    points: { taskPoints: 25, xp: 45, coins: 20 },
    replacesAssignmentType: 'daily',
    vaultCategory: 'mobility',
    experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
  },
];

const catalog = {
  catalogMeta: {
    id: 'thrivefold-game-catalog-v1',
    version: 1,
    updatedAt: new Date().toISOString(),
    totalLevels: 1000,
    author: 'Google Antigravity Team',
  },
  experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
  skillDefinitions,
  difficultyDefinitions: ['starter', 'gentle', 'standard', 'progressive', 'advanced', 'mastery'],
  verificationPolicies: [
    {
      id: 'in-app-timer-v1',
      name: 'System Paced Timer Verification',
      verificationClass: 'system_verified',
      description: 'Measures elapsed in-app active execution time through deterministic timer hooks.',
    },
    {
      id: 'activity-log-v1',
      name: 'Structured Activity Log Verification',
      verificationClass: 'evidence_supported',
      description: 'Evaluates required movement logs, sets, or user-entered session details against schema criteria.',
    },
    {
      id: 'self-declaration-v1',
      name: 'Honest Self-Declaration Policy',
      verificationClass: 'self_reported',
      description: 'Records transparent self-report without falsely asserting device-level verification.',
    },
  ],
  chapters,
  levels: levelDefinitions,
  tasks: taskDefinitions,
  specialQuests: specialQuestDefinitions,
  dailyTaskRules: {
    defaultTargetPoints: 40,
    maxDailyAssignedTasks: 3,
    skipCooldownMinutes: 0,
  },
};

const outputPath = path.join(targetDir, 'thrivefold-game-catalog.v1.json');
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`Generated canonical game catalog at: ${outputPath}`);
console.log(`Total levels: ${catalog.levels.length}`);
console.log(`Total tasks: ${catalog.tasks.length}`);
console.log(`Total special quests: ${catalog.specialQuests.length}`);

import type { ProductExperience } from '../theme/tokens';

/**
 * Short, plain-language articles. General information drawn from public health guidance
 * (NHS, WHO, CDC); not reviewed by a clinician for this app, and never a diagnosis.
 */
export interface Article {
  id: string;
  category: string;
  title: string;
  minutes: number;
  experiences: (ProductExperience | 'shared')[];
  body: string[];
  /** When to get professional help; shown highlighted. */
  seekHelp?: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'sleep_basics',
    category: 'Sleep',
    title: 'Sleep basics that actually help',
    minutes: 3,
    experiences: ['shared'],
    body: [
      'Most adults do best with about 7 to 9 hours. Regular timing matters as much as length: waking at the same time every day, weekends included, steadies your body clock faster than anything else.',
      'Morning daylight helps you feel sleepy at night. Bright screens, caffeine after early afternoon, alcohol and large late meals all make sleep lighter.',
      'If you cannot sleep after about 20 minutes, get up and do something quiet in dim light, then go back when sleepy. Lying in bed awake trains your brain to link bed with being awake.',
    ],
    seekHelp: 'See a doctor if poor sleep lasts more than a few weeks, if you snore loudly and stop breathing in your sleep, or if you fall asleep during the day without meaning to.',
  },
  {
    id: 'slow_breathing',
    category: 'Stress',
    title: 'Slow breathing for a stressful moment',
    minutes: 2,
    experiences: ['shared'],
    body: [
      'Breathing slowly, with the out-breath a little longer than the in-breath, is a simple way to settle a racing body. Try in through the nose for 4, out through the mouth for 6, for two to five minutes.',
      'It does not fix the cause of stress, but it can lower the intensity enough to think clearly about the next step.',
      'If slow breathing makes you dizzy or more anxious, breathe normally and focus on what you can see and hear around you instead.',
    ],
  },
  {
    id: 'activity_guidelines',
    category: 'Movement',
    title: 'How much movement is enough?',
    minutes: 3,
    experiences: ['shared'],
    body: [
      'Health guidelines suggest about 150 minutes of moderate activity a week (brisk walking counts), or 75 minutes of vigorous activity, plus muscle-strengthening work on two days.',
      'Any amount is better than none. Ten-minute blocks add up, and breaking up long sitting with a few minutes of movement helps on its own.',
      'Start below what you think you can do and build up slowly. Mild muscle soreness a day or two later is normal; sharp or joint pain is a reason to stop and change the exercise.',
    ],
    seekHelp: 'Stop and get urgent help for chest pain, severe breathlessness, fainting or a racing irregular heartbeat during exercise.',
  },
  {
    id: 'cycle_basics',
    category: 'Cycle',
    title: 'What counts as a normal cycle',
    minutes: 3,
    experiences: ['women_health', 'pride_wellbeing'],
    body: [
      'A cycle is counted from the first day of one period to the day before the next. Anywhere from about 21 to 35 days is common in adults, and it often varies by a few days month to month.',
      'Period estimates in this app are averages of what you log, so they get better with more records and are never exact. Stress, illness, travel, weight change and some medicines can shift a cycle.',
      'Logging symptoms alongside dates helps you notice your own patterns and gives a clinician useful information.',
    ],
    seekHelp: 'See a clinician for periods that are very heavy (soaking a pad or tampon every hour or two), bleeding between periods or after sex, cycles regularly shorter than 21 or longer than 35 days, missed periods, or pain that stops you doing daily things.',
  },
  {
    id: 'pelvic_floor',
    category: 'Pelvic floor',
    title: 'Pelvic floor: strengthen or relax?',
    minutes: 3,
    experiences: ['shared'],
    body: [
      'The pelvic floor muscles support the bladder and bowel and play a part in sexual function, in every body.',
      'Squeeze-and-lift exercises help many people with leaking when they cough or sneeze. But some people have muscles that are too tight rather than weak, and for them more squeezing can make pain or urgency worse; relaxing and breathing work helps instead.',
      'If you are unsure which applies to you, a pelvic health physiotherapist can check and teach the right exercises.',
    ],
    seekHelp: 'See a clinician for pelvic pain, pain with sex, blood in urine, or leaking that is new or getting worse.',
  },
  {
    id: 'mens_urinary_sexual',
    category: 'Men’s health',
    title: 'Urinary and sexual health: when to get checked',
    minutes: 3,
    experiences: ['men_health'],
    body: [
      'Changes like getting up at night to urinate, a weaker stream or needing to go more often become more common with age. They are often treatable and worth mentioning to a doctor rather than putting up with.',
      'Erection problems now and then are common and often linked to stress, tiredness or alcohol. When they keep happening, they can be an early sign of heart or blood-vessel problems, so they are worth a check-up.',
      'Exercise, sleep, not smoking and less alcohol help both urinary and sexual health, but no exercise or routine is a cure on its own.',
    ],
    seekHelp: 'See a doctor promptly for blood in urine or semen, pain when urinating, being unable to urinate, a lump in a testicle, or any sudden change.',
  },
  {
    id: 'posture_desk',
    category: 'Men’s health',
    title: 'Desk days, posture and stiff backs',
    minutes: 2,
    experiences: ['men_health', 'shared'],
    body: [
      'There is no single perfect posture. The bigger problem is staying in any one position for hours.',
      'Every 30 to 60 minutes, stand up, walk a little or do a minute of stretches. Set the top of the screen near eye level, keep feet flat and elbows near your sides.',
      'A ten-minute desk reset in Workouts covers hips, back and shoulders.',
    ],
  },
  {
    id: 'listening',
    category: 'Confidence',
    title: 'Listening well and saying what you need',
    minutes: 3,
    experiences: ['men_health', 'shared'],
    body: [
      'Active listening means letting the other person finish, then saying back what you heard in your own words before giving your view. People feel respected when they feel understood, even if you disagree.',
      'For your own needs, try: "When X happens, I feel Y, and I would like Z." It describes the situation without blaming, and makes a clear, reasonable request.',
      'A boundary is about what you will do, not controlling what others do: "If the shouting starts, I will leave the room and we can talk later."',
    ],
  },
  {
    id: 'work_frustration',
    category: 'Stress',
    title: 'When work makes you angry',
    minutes: 3,
    experiences: ['shared'],
    body: [
      'Anger is a signal that something matters to you. The goal is to respond rather than react.',
      'In the moment: pause before replying, take a few slow breaths, and if you can, step away or wait until the next day before sending anything written.',
      'Afterwards: write down what happened, what you need, and one concrete step, such as a calm conversation with your manager or asking for clearer expectations. Physical activity helps burn off the tension.',
    ],
    seekHelp: 'If anger often feels out of control or leads to hurting yourself or others, speak to a doctor or counsellor.',
  },
  {
    id: 'affirming_care',
    category: 'Self-care',
    title: 'Finding affirming healthcare',
    minutes: 2,
    experiences: ['pride_wellbeing'],
    body: [
      'You deserve care where you feel safe to be honest. It is fine to ask a clinic in advance whether they have experience with LGBTQ+ patients, and to bring a trusted person.',
      'Preparing a short list of questions before an appointment helps. The journal can hold it privately.',
      'You only share what you choose. This app never infers identity and keeps your notes on this phone.',
    ],
  },
];

export const articlesFor = (experience: ProductExperience) =>
  ARTICLES.filter((a) => a.experiences.includes('shared') || a.experiences.includes(experience)).sort(
    (a, b) => Number(b.experiences.includes(experience)) - Number(a.experiences.includes(experience)),
  );

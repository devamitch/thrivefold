/**
 * voiceCommands.ts — Natural language hands-free voice command engine for Coach.
 *
 * Translates spoken commands (like Siri/Google Assistant) into deterministic
 * workout session actions and natural coaching responses.
 */

export type VoiceCommand =
  | 'pause'
  | 'resume'
  | 'next_set'
  | 'add_rest'
  | 'previous'
  | 'toggle_video'
  | 'help';

interface CommandPattern {
  command: VoiceCommand;
  keywords: string[];
  phrases: RegExp[];
}

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    command: 'toggle_video',
    keywords: ['video', 'demo', 'tutorial', 'toggle video', 'pause video'],
    phrases: [
      /^(?:toggle\s+video|pause\s+video|play\s+video|show\s+video|hide\s+video)$/i,
      /^(?:demo\s+video|watch\s+demo|video\s+toggle|toggle\s+demo)$/i,
    ],
  },
  {
    command: 'add_rest',
    keywords: ['add rest', 'more rest', 'more time', 'thirty seconds', '30 seconds', 'break'],
    phrases: [
      /^(?:add\s+rest|more\s+rest|more\s+time|need\s+a\s+break)$/i,
      /^(?:give\s+me\s+)?(?:thirty|30)\s+seconds$/i,
      /^(?:extra\s+rest|give\s+me\s+time)$/i,
    ],
  },
  {
    command: 'previous',
    keywords: ['previous', 'go back', 'step back', 'redo', 'last exercise'],
    phrases: [
      /^(?:previous(?:\s+exercise)?|go\s+back|step\s+back|redo|last\s+exercise)$/i,
    ],
  },
  {
    command: 'pause',
    keywords: ['pause', 'stop', 'freeze', 'hold on', 'wait'],
    phrases: [
      /^(?:pause(?:\s+(?:workout|session|exercise))?|hold\s+on|wait|take\s+a\s+break|freeze)$/i,
      /^stop(?:\s+(?:workout|session|exercise))?$/i,
    ],
  },
  {
    command: 'resume',
    keywords: ['resume', 'continue', 'play', 'start', 'go', 'keep going'],
    phrases: [
      /^(?:resume(?:\s+(?:workout|session))?|continue|keep\s+going|let'?s\s+go|unpause)$/i,
      /^(?:i'?m\s+ready|ready|start(?:\s+(?:set|workout))?)$/i,
    ],
  },
  {
    command: 'next_set',
    keywords: ['next', 'finish', 'done', 'skip', 'complete', 'next set'],
    phrases: [
      /^(?:next(?:\s+set)?|skip\s+rest|finished|i'?m\s+done|done|complete(?:\s+set)?|finish(?:\s+set)?)$/i,
    ],
  },
  {
    command: 'help',
    keywords: ['help', 'commands', 'what can i say'],
    phrases: [
      /^(?:help|commands|what\s+can\s+i\s+say|how\s+to\s+use|coach\s+help)$/i,
    ],
  },
];

export interface ParseVoiceCommandOptions {
  /**
   * Only commands present in this allowlist will be returned.
   * Useful to restrict commands based on workout phase (e.g. no set-complete during positioning).
   */
  allowedCommands?: VoiceCommand[];
}

/**
 * Parses user speech into a recognized VoiceCommand.
 * Ignores casual sentence chatter where command words appear incidentally.
 */
export function parseVoiceCommand(
  transcript: string,
  options?: ParseVoiceCommandOptions,
): VoiceCommand | null {
  if (!transcript || typeof transcript !== 'string') return null;
  const raw = transcript.trim().toLowerCase();
  if (!raw) return null;

  // Strip leading wake phrases like "hey coach", "coach", "please"
  const cleaned = raw
    .replace(/^(?:hey\s+)?coach\s*,?\s*/i, '')
    .replace(/^please\s+/i, '')
    .trim();

  if (!cleaned) return null;

  let recognized: VoiceCommand | null = null;

  // 1. Check specific multi-word phrase patterns first
  for (const { command, phrases } of COMMAND_PATTERNS) {
    for (const phrase of phrases) {
      if (phrase.test(cleaned)) {
        recognized = command;
        break;
      }
    }
    if (recognized) break;
  }

  // 2. Check exact command phrase matches or short focused phrases (<= 3 words)
  if (!recognized) {
    const words = cleaned.split(/\s+/);
    if (words.length <= 3) {
      for (const { command, keywords } of COMMAND_PATTERNS) {
        for (const kw of keywords) {
          if (cleaned === kw || (words.length <= 2 && words.includes(kw))) {
            recognized = command;
            break;
          }
        }
        if (recognized) break;
      }
    }
  }

  // 3. Filter against allowedCommands if provided
  if (recognized && options?.allowedCommands && !options.allowedCommands.includes(recognized)) {
    return null;
  }

  return recognized;
}

/**
 * Generates natural, human spoken confirmation for recognized voice commands.
 */
export function voiceCommandResponseSpeech(
  command: VoiceCommand,
  context: { videoPlaying?: boolean; rest?: boolean; itemIdx?: number } = {},
): string {
  switch (command) {
    case 'pause':
      return 'Workout paused. Take a deep breath. Say resume when you are ready to continue.';
    case 'resume':
      return 'Resuming now! Let’s get right back into strong form.';
    case 'next_set':
      return context.rest
        ? 'Skipping rest. Starting your next set!'
        : 'Set completed! Outstanding effort. Take a breather.';
    case 'add_rest':
      return 'Got it! Added thirty seconds of extra rest. Breathe deep and reset.';
    case 'previous':
      return (context.itemIdx ?? 0) > 0
        ? 'Going back to the previous exercise. Let’s reset.'
        : 'You are already at the first exercise. Let’s finish this one!';
    case 'toggle_video':
      return context.videoPlaying
        ? 'Pausing the demo video for you.'
        : 'Playing the demo video. Follow along!';
    case 'help':
      return 'You can say: pause, resume, next, add rest, go back, or toggle video. Or use your camera gestures anytime!';
  }
}

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
    keywords: ['video', 'demo', 'tutorial'],
    phrases: [
      /\b(?:toggle\s+video|pause\s+video|play\s+video|show\s+video|hide\s+video)\b/i,
      /\b(?:demo\s+video|watch\s+demo)\b/i,
    ],
  },
  {
    command: 'add_rest',
    keywords: ['rest', 'more time', 'thirty seconds', 'break'],
    phrases: [
      /\b(?:add\s+rest|more\s+rest|more\s+time|need\s+a\s+break)\b/i,
      /\b(?:thirty\s+seconds|30\s+seconds|give\s+me\s+time)\b/i,
    ],
  },
  {
    command: 'previous',
    keywords: ['previous', 'go back', 'back', 'redo'],
    phrases: [
      /\b(?:previous|go\s+back|step\s+back|redo)\b/i,
      /\b(?:last\s+exercise|go\s+to\s+last)\b/i,
    ],
  },
  {
    command: 'pause',
    keywords: ['pause', 'stop', 'freeze', 'hold on', 'wait'],
    phrases: [
      /\b(?:pause|stop|freeze|hold\s+on|wait)\b/i,
      /\b(?:take\s+a\s+break|hold\s+up)\b/i,
    ],
  },
  {
    command: 'resume',
    keywords: ['resume', 'continue', 'play', 'start', 'go', 'keep going'],
    phrases: [
      /\b(?:resume|continue|start|keep\s+going|let'?s\s+go)\b/i,
      /\b(?:ready|i'?m\s+ready|unpause)\b/i,
    ],
  },
  {
    command: 'next_set',
    keywords: ['next', 'finish', 'done', 'skip', 'complete'],
    phrases: [
      /\b(?:next|finish|done|skip|complete)\b/i,
      /\b(?:next\s+set|skip\s+rest|finished|i'?m\s+done)\b/i,
    ],
  },
  {
    command: 'help',
    keywords: ['help', 'coach', 'commands', 'what can i say'],
    phrases: [
      /\b(?:help|commands|what\s+can\s+i\s+say|how\s+to\s+use)\b/i,
      /\b(?:hey\s+coach|coach\s+help)\b/i,
    ],
  },
];

/**
 * Parses user speech into a recognized VoiceCommand.
 */
export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  if (!transcript || typeof transcript !== 'string') return null;
  const cleaned = transcript.trim().toLowerCase();
  if (!cleaned) return null;

  // 1. Check specific multi-word phrase patterns first
  for (const { command, phrases } of COMMAND_PATTERNS) {
    for (const phrase of phrases) {
      if (phrase.test(cleaned)) return command;
    }
  }

  // 2. Check exact word token matches
  const words = cleaned.split(/\s+/);
  for (const { command, keywords } of COMMAND_PATTERNS) {
    for (const kw of keywords) {
      if (cleaned === kw || words.includes(kw)) return command;
    }
  }

  return null;
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

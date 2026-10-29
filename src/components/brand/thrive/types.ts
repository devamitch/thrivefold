export type Mood =
  | 'neutral' | 'happy' | 'joy' | 'sad' | 'crying' | 'angry' | 'sleepy' | 'asleep'
  | 'surprised' | 'love' | 'thinking' | 'listening' | 'speaking' | 'scared'
  | 'proud' | 'bored' | 'curious' | 'shy' | 'dizzy';

export type Activity =
  | 'none' | 'wave' | 'greet' | 'drink' | 'exercise' | 'jacks' | 'sleep' | 'yawn'
  | 'stretch' | 'roll' | 'dance' | 'sob' | 'tantrum' | 'wind' | 'peek' | 'clap'
  | 'think' | 'laugh' | 'meditate' | 'hug' | 'listen';

export type Period = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'lateNight';

/** What the camera tells the character about the user. All values are on-device. */
export interface FaceSignal {
  present: boolean;
  smile: number; // 0..1
  eyesOpen: number; // 0..1
  yaw: number; // degrees
  pitch: number;
  roll: number;
  x: number; // -1..1 face centre (positive = user is to the character's right)
  y: number; // -1..1
  size: number; // face height / frame height
  /** Optional: set these if you plug in a TFLite emotion / glasses model. */
  emotion?: Mood;
  glasses?: boolean;
}

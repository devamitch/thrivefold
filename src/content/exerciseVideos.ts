/**
 * Tutorial videos for exercises. Only IDs checked against YouTube's oEmbed endpoint
 * (embeddable, title and channel confirmed on 2026-10-25) are listed; every other exercise
 * links to a YouTube search instead of a guessed video.
 */
export interface ExerciseVideo {
  videoId: string;
  title: string;
  channel: string;
}

export const EXERCISE_VIDEOS: Record<string, ExerciseVideo> = {
  squat_bw: { videoId: 'eWatHIujxPM', title: 'How to Do a Bodyweight Squat (Perfect Form + Common Mistakes)', channel: 'Over The Hill Athlete' },
  pushup: { videoId: 'zF0jbubK_jU', title: 'How To Do A Push-Up: Proper Form & Technique', channel: 'BuiltLean' },
  glute_bridge: { videoId: 'OUgsJ8-Vi0E', title: 'How to Perform the Perfect Glute Bridge', channel: 'Airrosti Rehab Centers' },
  plank: { videoId: 'mwlp75MS6Rg', title: 'How to do a Plank | Proper Form & Technique', channel: 'NASM' },
};

export const videoFor = (exerciseId: string): ExerciseVideo | undefined => EXERCISE_VIDEOS[exerciseId];

export const youtubeSearchUrl = (exerciseName: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} proper form tutorial`)}`;

export const youtubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

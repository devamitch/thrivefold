/**
 * Tutorial videos for exercises. Every ID was taken from YouTube's own search results for
 * that exercise and checked against YouTube's oEmbed endpoint (exists, embeddable, title and
 * channel recorded) on 2026-10-25. The four hand-picked ones are below; the rest are in
 * exercise-videos.json. Anything without a checked video opens an in-app YouTube search.
 */
import gathered from './exercise-videos.json';
import taskVideos from './task-videos.json';

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

// thrivefold-videos-all.json is an append-only research log of raw search results; most of
// its quest matches were unrelated (e.g. dance or game clips for wellbeing tasks), so it is
// never shown as a vetted tutorial. Only the reviewed sets below are.
const ALL_VIDEOS: Record<string, ExerciseVideo> = {
  ...(gathered as Record<string, ExerciseVideo>),
  ...EXERCISE_VIDEOS,
};

export const videoFor = (exerciseId: string): ExerciseVideo | undefined => ALL_VIDEOS[exerciseId];

export const youtubeSearchUrl = (exerciseName: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} proper form tutorial`)}`;

export const youtubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

/** Quests with a hand-reviewed video (same checks as exercises; unrelated results were dropped). */
const TASK_VIDEOS: Record<string, ExerciseVideo> = taskVideos as Record<string, ExerciseVideo>;
export const taskVideoFor = (taskId: string): ExerciseVideo | undefined => TASK_VIDEOS[taskId];

/** Route to watch a tutorial inside the app: the checked video, or a search for the topic. */
export function watchHref(topic: string, exerciseId?: string, taskId?: string): string {
  const v = (exerciseId ? videoFor(exerciseId) : undefined) ?? (taskId ? taskVideoFor(taskId) : undefined);
  const params = new URLSearchParams({ title: topic, ...(v ? { v: v.videoId } : { q: `${topic} how to` }) });
  return `/(app)/watch?${params.toString()}`;
}

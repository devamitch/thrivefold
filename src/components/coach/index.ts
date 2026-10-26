/**
 * Coach module — decomposed workout coaching components and hooks.
 *
 * Components:
 *   CoachIntro      — pre-workout details & start button
 *   SessionComplete — workout done summary
 *   CoachHUD        — bottom progress ring + set done
 *   CoachBanner     — coaching message strip
 *   CountdownOverlay — 3-2-1 before each set
 *   RestOverlay     — glass rest screen between sets
 *   GlassButton     — small round glass control
 *
 * Hooks:
 *   useCoachSession — core session state machine
 *   usePoseTracking — camera pose detection + rep counting
 */

export { CoachIntro } from './CoachIntro';
export { SessionComplete } from './SessionComplete';
export { CoachHUD } from './CoachHUD';
export { CoachBanner, type BannerTone } from './CoachBanner';
export { CountdownOverlay } from './CountdownOverlay';
export { RestOverlay } from './RestOverlay';
export { GlassButton } from './GlassButton';
export { CoachVideoStage, type VideoDisplayMode } from './CoachVideoStage';
export { GestureRemoteGuideModal } from './GestureRemoteGuideModal';

export { useCoachSession, clock, say, type Phase, type DoneSummary, type ExerciseResult } from './useCoachSession';
export { usePoseTracking } from './usePoseTracking';

import { Easing, makeMutable } from 'react-native-reanimated';

/**
 * One animated value (0 closed, 1 open) shared by the panel, the screen that slides aside,
 * and every staggered row, so they all move together while dragging
 * and when opening or closing.
 */
export const drawerProgress = makeMutable(0);

/**
 * Where the drawer is heading (0 or 1). A finished swipe and the store effect both read it,
 * so a swipe that already animated to its target is never animated a second time.
 */
export const drawerTarget = makeMutable(0);

/** Same width for the panel and for how far the screen slides. */
export const drawerWidthFor = (screenWidth: number) =>
  Math.min(320, Math.round(screenWidth * 0.78));

/** How far the screen recedes when the drawer is fully open. */
export const DRAWER_SCENE_SCALE = 0.88;
export const DRAWER_SCENE_RADIUS = 28;
/** Width of the left strip that starts an open-swipe on tab roots. */
export const DRAWER_EDGE_WIDTH = 36;

/** Smooth predictable timing curve for drawer transitions — no spring oscillations. */
export const DRAWER_TIMING = {
  duration: 260,
  easing: Easing.bezier(0.2, 0.9, 0.25, 1),
} as const;


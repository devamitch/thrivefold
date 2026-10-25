import { makeMutable } from 'react-native-reanimated';

/**
 * One animated value (0 closed, 1 open) shared by the drawer panel and the screen that
 * slides aside, so both move together while dragging and when opening or closing.
 */
export const drawerProgress = makeMutable(0);

/** Same width for the panel and for how far the screen slides. */
export const drawerWidthFor = (screenWidth: number) => Math.min(320, Math.round(screenWidth * 0.78));

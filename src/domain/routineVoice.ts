/**
 * One-tap voice for the alarm sheet.
 * Plug your existing speech-to-text in ONCE at app start:
 *
 *   registerRoutineVoice(async () => myStt.listenOnce()); // resolves the FINAL transcript, or null
 *
 * The sheet only parses with parseRoutineRequest and fills the form.
 * It never saves by itself: the user always confirms.
 */
export type RoutineTranscriber = () => Promise<string | null>;

let transcriber: RoutineTranscriber | null = null;

export const registerRoutineVoice = (fn: RoutineTranscriber | null) => {
  transcriber = fn;
};
export const isRoutineVoiceAvailable = () => transcriber !== null;
export const listenForRoutine = async (): Promise<string | null> => (transcriber ? transcriber() : null);

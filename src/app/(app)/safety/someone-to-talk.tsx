/**
 * Someone to Talk To — Unified Safety AI Companion Redirect
 *
 * Redirects all safety/someone-to-talk routes immediately into GlobalVoiceAssistant
 * with the 'support' persona active.
 *
 * Adheres to ThriveFold Single Unified Assistant Architecture:
 * - One assistant, one voice engine, one conversation thread
 * - No redundant, disconnected chat screens
 * - Full emergency helplines, country switching, and grounding available inside GlobalVoiceAssistant
 */

import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { globalVoiceController } from '../../../services/voice/globalVoiceController';
import { useRootStore } from '../../../stores/useRootStore';

export default function SomeoneToTalkRedirect() {
  useEffect(() => {
    // 1. Activate Anvay Support Companion persona
    useRootStore.getState().setCoachPersona('support');

    // 2. Open Global Voice Assistant sheet in support mode (mic resting until tapped)
    void globalVoiceController.open(undefined, { listen: false });

    // 3. Immediately pop this route back so the user stays on their previous screen with the sheet open
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)');
    }
  }, []);

  return <View style={{ flex: 1 }} />;
}

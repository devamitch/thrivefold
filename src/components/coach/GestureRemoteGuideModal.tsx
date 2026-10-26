/**
 * GestureRemoteGuideModal — Interactive hands-free camera control guide.
 *
 * Explains and demonstrates the 5 computer-vision tracked pose gestures
 * that let users control the workout without touching the phone 6-10 feet away.
 * Includes a "Listen to Coach" audio preview powered by the virtual coach voice.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { gestureIntroSpeech } from '../../domain/pose/coachVoice';
import { speakCoach } from '../../services/ai/coachVoiceService';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal, SheetFooterRow } from '../ui/AppBottomSheetModal';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { Squircle } from '../ui/Squircle';
import { SquircleSurface } from '../ui/SquircleSurface';

interface GestureRemoteGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GestureItem {
  gesture: string;
  action: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
}

const GESTURES: GestureItem[] = [
  {
    gesture: 'One Hand Raised',
    action: 'Play / Pause Video Demo',
    desc: 'Hold your left or right wrist above your head for 1 second. The demo video pauses or resumes so you can inspect form.',
    icon: 'hand-left-outline',
    badge: '1s HOLD',
  },
  {
    gesture: 'Both Hands Up High',
    action: 'Finish Set / Skip Rest',
    desc: 'Raise both arms straight up over your head. Instantly finishes your set with counted reps or skips the rest countdown.',
    icon: 'body-outline',
    badge: '1.2s HOLD',
  },
  {
    gesture: 'Cross Arms Over Chest',
    action: 'Quick Pause Workout',
    desc: 'Cross both wrists across your chest. Pauses the timer and camera so you can drink water, adjust phone, or catch your breath.',
    icon: 'pause-circle-outline',
    badge: '1s HOLD',
  },
  {
    gesture: 'Hands on Hips',
    action: '+30s Extra Rest Time',
    desc: 'Rest both hands on your hips during recovery. Grants 30 additional seconds of rest when your muscles need recovery.',
    icon: 'time-outline',
    badge: '1.2s HOLD',
  },
  {
    gesture: 'T-Pose (Arms Wide)',
    action: 'Go Back to Previous Move',
    desc: 'Spread both arms wide horizontally. Steps back to the previous exercise in the plan so you can repeat or retry it.',
    icon: 'arrow-undo-outline',
    badge: '1.2s HOLD',
  },
];

export function GestureRemoteGuideModal({ visible, onClose }: GestureRemoteGuideModalProps) {
  const { colors, typography, spacing } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleVoiceGuide = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        const speech = gestureIntroSpeech();
        await speakCoach(speech, true);
        // Wait or listen for finish
        setTimeout(() => setIsSpeaking(false), 16000);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleClose = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
    onClose();
  };

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={handleClose}
      eyebrow="HANDS-FREE CONTROLS"
      title="Camera Gesture Guide"
      subtitle="Control your virtual coach from 6 to 10 feet back without touching your phone."
      maxHeight="88%"
      footer={
        <SheetFooterRow>
          <Button
            label={isSpeaking ? 'Stop Coach Voice' : 'Hear Coach Explain'}
            variant="secondary"
            icon={<Ionicons name={isSpeaking ? 'volume-mute-outline' : 'volume-high-outline'} size={18} color={colors.primary} />}
            onPress={toggleVoiceGuide}
          />
          <Button label="Got it" variant="primary" onPress={handleClose} />
        </SheetFooterRow>
      }
    >
      <View style={styles.container}>
        {/* Placement guidance card */}
        <Squircle
          radius={18}
          fill={colors.surface1}
          style={[styles.tipCard, { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
        >
          <View style={styles.tipRow}>
            <View style={[styles.tipIconBox, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Phone Setup Tips
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
                Prop phone at hip height, 2 metres away. Make sure your head and feet are visible in frame.
              </Text>
            </View>
          </View>
        </Squircle>

        {/* 5 Gestures List */}
        <View style={{ marginTop: spacing.base, gap: spacing.sm }}>
          {GESTURES.map((item) => (
            <Squircle
              key={item.gesture}
              radius={16}
              fill={colors.surface}
              style={[
                styles.gestureCard,
                {
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={[styles.gestureTitles, { marginLeft: spacing.sm }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {item.gesture}
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.accentText }]}>
                    {item.action}
                  </Text>
                </View>
                <SquircleSurface
                  radius={8}
                  fill={colors.primaryAlpha}
                  style={styles.badge}
                >
                  <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                    {item.badge}
                  </Text>
                </SquircleSurface>
              </View>

              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
                {item.desc}
              </Text>
            </Squircle>
          ))}
        </View>

        {/* Real Human Voice note */}
        <View style={[styles.voiceNote, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
          <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}>
            The coach responds verbally in real time to acknowledge each gesture, provide form cues, and cheer you on.
          </Text>
        </View>
      </View>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  gestureCard: {
    padding: 14,
  },
  gestureTitles: {
    flex: 1,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  tipCard: {
    padding: 14,
  },
  tipIconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tipRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  tipTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  voiceNote: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
  },
});

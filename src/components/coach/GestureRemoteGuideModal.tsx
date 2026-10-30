/**
 * GestureRemoteGuideModal — Interactive hands-free camera control guide.
 *
 * Explains and demonstrates the 5 computer-vision tracked pose gestures
 * that let users control the workout without touching the phone 6-10 feet away.
 * Includes a "Listen to Coach" audio preview powered by the virtual coach voice.
 */

import { Ionicons } from '@expo/vector-icons';
import { hapticLight, hapticMedium } from '../../services/haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { gestureIntroSpeech } from '../../domain/pose/coachVoice';
import { voiceCommandResponseSpeech, type VoiceCommand } from '../../domain/coach/voiceCommands';
import { speakCoach, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal, SheetFooterRow } from '../ui/AppBottomSheetModal';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { Squircle } from '../ui/Squircle';
import { SquircleSurface } from '../ui/SquircleSurface';

interface GestureRemoteGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onExecuteCommand?: (cmd: VoiceCommand) => void;
}

interface GestureItem {
  gesture: string;
  action: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
}

interface VoiceItem {
  command: VoiceCommand;
  phrases: string[];
  action: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
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

const VOICE_COMMANDS: VoiceItem[] = [
  {
    command: 'pause',
    phrases: ['"Pause"', '"Stop workout"', '"Hold on"'],
    action: 'Pause Timer & Video',
    desc: 'Freezes tracking and active timers so you can step away without losing progress.',
    icon: 'pause-circle-outline',
  },
  {
    command: 'resume',
    phrases: ['"Resume"', '"Let\'s go"', '"I\'m ready"'],
    action: 'Resume Workout',
    desc: 'Restarts active reps counting and skips waiting rest timers.',
    icon: 'play-circle-outline',
  },
  {
    command: 'next_set',
    phrases: ['"Next set"', '"Done"', '"Finished"'],
    action: 'Complete Set / Skip Rest',
    desc: 'Immediately records current set and transitions to rest interval or next movement.',
    icon: 'checkmark-circle-outline',
  },
  {
    command: 'add_rest',
    phrases: ['"Add rest"', '"More time"', '"30 seconds"'],
    action: '+30s Recovery Rest',
    desc: 'Extends your current rest timer by 30 seconds for complete muscle recovery.',
    icon: 'time-outline',
  },
  {
    command: 'previous',
    phrases: ['"Go back"', '"Previous exercise"', '"Redo"'],
    action: 'Previous Movement',
    desc: 'Steps back to the prior exercise in your workout plan to repeat sets.',
    icon: 'arrow-undo-outline',
  },
  {
    command: 'toggle_video',
    phrases: ['"Toggle video"', '"Demo video"', '"Show demo"'],
    action: 'Toggle Video Demo',
    desc: 'Plays or pauses the synchronized form tutorial video.',
    icon: 'videocam-outline',
  },
];

export function GestureRemoteGuideModal({
  visible,
  onClose,
  onExecuteCommand,
}: GestureRemoteGuideModalProps) {
  const { colors, typography, spacing } = useTheme();
  const [activeTab, setActiveTab] = useState<'gestures' | 'voice'>('gestures');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceTest, setActiveVoiceTest] = useState<string | null>(null);

  const toggleVoiceGuide = async () => {
    try {
      hapticLight();
      if (isSpeaking) {
        stopCoachSpeech();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        const speech =
          activeTab === 'gestures'
            ? gestureIntroSpeech()
            : "You can talk to me just like Siri or Google Assistant! Say 'Pause', 'Resume', 'Next set', or 'Add rest' from across the room, and I'll take care of it!";
        await speakCoach(speech, true);
        setTimeout(() => setIsSpeaking(false), 14000);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const testVoiceCommand = async (item: VoiceItem) => {
    try {
      hapticMedium();
      setActiveVoiceTest(item.command);
      const speech = voiceCommandResponseSpeech(item.command);
      await speakCoach(speech, true);
      if (onExecuteCommand) {
        onExecuteCommand(item.command);
      }
      setTimeout(() => setActiveVoiceTest(null), 2500);
    } catch {
      setActiveVoiceTest(null);
    }
  };

  const handleClose = () => {
    if (isSpeaking) {
      stopCoachSpeech();
      setIsSpeaking(false);
    }
    onClose();
  };

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={handleClose}
      eyebrow="REMOTE WORKOUT CONTROL"
      title="Hands-Free Coach Controls"
      subtitle="Control your virtual coach 6 to 10 feet away using camera gestures or voice commands."
      maxHeight="92%"
      footer={
        <SheetFooterRow>
          <Button
            label={isSpeaking ? 'Stop Voice' : 'Hear Coach Explain'}
            variant="secondary"
            icon={
              <Ionicons
                name={isSpeaking ? 'volume-mute-outline' : 'volume-high-outline'}
                size={18}
                color={colors.primary}
              />
            }
            onPress={toggleVoiceGuide}
          />
          <Button label="Got it" variant="primary" onPress={handleClose} />
        </SheetFooterRow>
      }
    >
      <View style={styles.container}>
        {/* Tab Switcher: Gestures vs Voice Commands */}
        <View
          style={[
            styles.tabRow,
            { backgroundColor: colors.surface1, borderColor: colors.border },
          ]}
        >
          <PressableScale
            onPress={() => setActiveTab('gestures')}
            style={[
              styles.tabBtn,
              activeTab === 'gestures' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Ionicons
              name="hand-left-outline"
              size={16}
              color={activeTab === 'gestures' ? colors.primary : colors.text.muted}
            />
            <Text
              style={[
                typography.subbodyBold,
                {
                  color: activeTab === 'gestures' ? colors.text.primary : colors.text.secondary,
                  marginLeft: 6,
                },
              ]}
            >
              Pose Gestures
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => setActiveTab('voice')}
            style={[
              styles.tabBtn,
              activeTab === 'voice' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Ionicons
              name="mic-outline"
              size={16}
              color={activeTab === 'voice' ? colors.primary : colors.text.muted}
            />
            <Text
              style={[
                typography.subbodyBold,
                {
                  color: activeTab === 'voice' ? colors.text.primary : colors.text.secondary,
                  marginLeft: 6,
                },
              ]}
            >
              Voice Commands
            </Text>
          </PressableScale>
        </View>

        {activeTab === 'gestures' ? (
          <>
            {/* Placement guidance card */}
            <Squircle
              radius={18}
              fill={colors.surface1}
              style={[
                styles.tipCard,
                { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={styles.tipRow}>
                <View style={[styles.tipIconBox, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.tipTextCol}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Phone Setup Tips
                  </Text>
                  <Text
                    style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}
                  >
                    Prop phone at hip height, 2 metres away. Make sure your head and feet are visible
                    in frame.
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
                    <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.badge}>
                      <Text
                        style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}
                      >
                        {item.badge}
                      </Text>
                    </SquircleSurface>
                  </View>

                  <Text
                    style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}
                  >
                    {item.desc}
                  </Text>
                </Squircle>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Voice Overview Card */}
            <Squircle
              radius={18}
              fill={colors.surface1}
              style={[
                styles.tipCard,
                { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={styles.tipRow}>
                <View style={[styles.tipIconBox, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="mic" size={20} color={colors.primary} />
                </View>
                <View style={styles.tipTextCol}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Speak Naturally from Across the Room
                  </Text>
                  <Text
                    style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}
                  >
                    Say any command below clearly. The Coach confirms verbally and executes the
                    action instantly.
                  </Text>
                </View>
              </View>
            </Squircle>

            {/* Voice Commands List with Test Trigger */}
            <View style={{ marginTop: spacing.base, gap: spacing.sm }}>
              {VOICE_COMMANDS.map((item) => {
                const isTesting = activeVoiceTest === item.command;
                return (
                  <Squircle
                    key={item.command}
                    radius={16}
                    fill={colors.surface}
                    style={[
                      styles.gestureCard,
                      {
                        borderColor: isTesting ? colors.primary : colors.border,
                        borderWidth: isTesting ? 1.5 : StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
                        <Ionicons name={item.icon} size={20} color={colors.primary} />
                      </View>
                      <View style={[styles.gestureTitles, { marginLeft: spacing.sm }]}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {item.action}
                        </Text>
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          {item.phrases.join(' · ')}
                        </Text>
                      </View>
                      <PressableScale
                        onPress={() => testVoiceCommand(item)}
                        style={[
                          styles.testVoiceBtn,
                          {
                            backgroundColor: isTesting ? colors.primary : colors.primaryAlpha,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Test ${item.action}`}
                      >
                        <Ionicons
                          name={isTesting ? 'volume-high' : 'play-outline'}
                          size={14}
                          color={isTesting ? colors.onPrimary : colors.primary}
                        />
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isTesting ? colors.onPrimary : colors.primary,
                              marginLeft: 4,
                              fontSize: 11,
                            },
                          ]}
                        >
                          {isTesting ? 'Playing...' : 'Test'}
                        </Text>
                      </PressableScale>
                    </View>

                    <Text
                      style={[
                        typography.subbody,
                        { color: colors.text.secondary, marginTop: spacing.xs },
                      ]}
                    >
                      {item.desc}
                    </Text>
                  </Squircle>
                );
              })}
            </View>
          </>
        )}

        {/* Real Human Voice note */}
        <View
          style={[styles.voiceNote, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
        >
          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
          <Text
            style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}
          >
            The coach responds verbally in real time with natural human feedback, confirming
            commands, counting reps, and guiding your posture.
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
  tabBtn: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  tabRow: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 3,
  },
  testVoiceBtn: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
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


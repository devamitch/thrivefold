/**
 * CoachVideoStage — manages the exercise tutorial video in 3 modes:
 * - 'fullscreen': covers the stage (auto-shown first time, skippable with a single tap)
 * - 'pip': floating 16:9 glass card in corner
 * - 'minimized': compact glass pill that leaves 100% of the screen for the camera scanner
 */

import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PressableScale } from '../ui/PressableScale';
import { Button } from '../ui/Button';
import { CoachGlass } from '../workout/CoachGlass';
import { YouTubePlayer, type YouTubePlayerHandle } from '../workout/YouTubePlayer';
import { useTheme } from '../../theme/useTheme';

export type VideoDisplayMode = 'fullscreen' | 'pip' | 'minimized';

interface CoachVideoStageProps {
  exerciseId: string;
  exerciseName: string;
  videoId?: string;
  hasWatched: boolean;
  onMarkWatched: () => void;
  videoPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  stageWidth: number;
  topInset: number;
  cameraMain: boolean;
  onSkipFirstTime?: () => void;
}

export const CoachVideoStage = forwardRef<YouTubePlayerHandle, CoachVideoStageProps>(
  function CoachVideoStage(
    {
      exerciseId,
      exerciseName,
      videoId,
      hasWatched,
      onMarkWatched,
      videoPlaying,
      onPlayingChange,
      stageWidth,
      topInset,
      cameraMain,
      onSkipFirstTime,
    },
    ref,
  ) {
    const { colors, typography, spacing } = useTheme();
    const playerRef = useRef<YouTubePlayerHandle>(null);

    // Initial mode: if never watched, show fullscreen preview; if already watched, minimize by default
    const [mode, setMode] = useState<VideoDisplayMode>(hasWatched ? 'minimized' : 'fullscreen');

    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      seek: (s: number) => playerRef.current?.seek(s),
    }));

    // If exercise changes, update mode based on whether it was watched
    useEffect(() => {
      setMode(hasWatched ? 'minimized' : 'fullscreen');
    }, [exerciseId, hasWatched]);

    const handleSkipFirstTime = () => {
      onMarkWatched();
      setMode('minimized');
      if (onSkipFirstTime) onSkipFirstTime();
    };

    const pipWidth = Math.round(Math.min(stageWidth || 360, 520) * 0.44);

    const videoElement = (
      <YouTubePlayer
        key={exerciseId}
        ref={playerRef}
        videoId={videoId}
        query={`${exerciseName} proper form tutorial`}
        style={StyleSheet.absoluteFill}
        onPlayingChange={onPlayingChange}
      />
    );

    // MODE 1: MINIMIZED (Compact Glass Pill)
    if (mode === 'minimized') {
      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.minimizedPill, { top: topInset + 72, left: spacing.base }]}
        >
          <PressableScale
            onPress={() => setMode('pip')}
            accessibilityRole="button"
            accessibilityLabel="Expand tutorial video"
            hitSlop={8}
          >
            <CoachGlass radius={20} style={styles.minimizedContent}>
              <Ionicons name="film-outline" size={16} color={colors.callText} />
              <Text style={[typography.captionBold, { color: colors.callText, marginLeft: 6 }]}>
                Tutorial
              </Text>
            </CoachGlass>
          </PressableScale>
        </Animated.View>
      );
    }

    // MODE 2: PIP (Picture-in-Picture 16:9 floating card)
    if (mode === 'pip') {
      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.pipContainer,
            { top: topInset + 72, left: spacing.base, width: pipWidth },
          ]}
        >
          <CoachGlass radius={18} style={styles.pipGlass}>
            {videoElement}
            {/* Top controls: Fullscreen & Minimize */}
            <View style={styles.pipTopControls} pointerEvents="box-none">
              <PressableScale
                onPress={() => setMode('fullscreen')}
                accessibilityRole="button"
                accessibilityLabel="Expand to full screen"
                hitSlop={6}
                style={[styles.miniControlBtn, { backgroundColor: colors.callSurface }]}
              >
                <Ionicons name="expand-outline" size={13} color={colors.callText} />
              </PressableScale>
              <PressableScale
                onPress={() => setMode('minimized')}
                accessibilityRole="button"
                accessibilityLabel="Minimize tutorial"
                hitSlop={6}
                style={[styles.miniControlBtn, { backgroundColor: colors.callSurface }]}
              >
                <Ionicons name="contract-outline" size={13} color={colors.callText} />
              </PressableScale>
            </View>

            {/* Bottom playback button */}
            <View style={styles.pipBottomControls} pointerEvents="box-none">
              <PressableScale
                onPress={() => {
                  if (videoPlaying) playerRef.current?.pause();
                  else playerRef.current?.play();
                }}
                accessibilityRole="button"
                accessibilityLabel={videoPlaying ? 'Pause tutorial' : 'Play tutorial'}
                hitSlop={6}
                style={[styles.playBtn, { backgroundColor: colors.callSurface }]}
              >
                <Ionicons
                  name={videoPlaying ? 'pause' : 'play'}
                  size={14}
                  color={colors.callText}
                />
              </PressableScale>
            </View>
          </CoachGlass>
        </Animated.View>
      );
    }

    // MODE 3: FULLSCREEN (Skippable First-time or expanded mode)
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.callBackground, zIndex: 50 }]}
      >
        <View style={styles.fullscreenVideoWrap}>{videoElement}</View>

        {/* Top bar with back to scanner & title */}
        <View style={[styles.fullscreenTopBar, { top: topInset + 12, paddingHorizontal: spacing.base }]}>
          <PressableScale
            onPress={() => {
              onMarkWatched();
              setMode('minimized');
            }}
            accessibilityRole="button"
            accessibilityLabel="Close tutorial and return to camera"
            style={[styles.roundBtn, { backgroundColor: colors.callSurface }]}
          >
            <Ionicons name="close" size={20} color={colors.callText} />
          </PressableScale>
          <CoachGlass radius={20} style={styles.fullscreenTitlePill}>
            <Text style={[typography.subbodyBold, { color: colors.callText }]} numberOfLines={1}>
              {exerciseName} Tutorial
            </Text>
          </CoachGlass>
          <PressableScale
            onPress={() => {
              onMarkWatched();
              setMode('pip');
            }}
            accessibilityRole="button"
            accessibilityLabel="Switch to Picture-in-Picture"
            style={[styles.roundBtn, { backgroundColor: colors.callSurface }]}
          >
            <Ionicons name="contract-outline" size={18} color={colors.callText} />
          </PressableScale>
        </View>

        {/* Skippable action card for first-time tutorial */}
        {!hasWatched ? (
          <View style={[styles.firstTimeBottomBar, { paddingHorizontal: spacing.base }]}>
            <CoachGlass radius={24} style={styles.firstTimeGlass}>
              <View style={styles.firstTimeInfo}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text
                  style={[
                    typography.captionBold,
                    { color: colors.callText, marginLeft: 8, flex: 1 },
                  ]}
                >
                  Watch once to master form, or jump straight into camera tracking.
                </Text>
              </View>
              <Button
                label="Skip & Start Scanner"
                size="md"
                onPress={handleSkipFirstTime}
                style={{ marginTop: 8 }}
              />
            </CoachGlass>
          </View>
        ) : null}
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  firstTimeBottomBar: {
    bottom: 30,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  firstTimeGlass: {
    padding: 14,
  },
  firstTimeInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullscreenTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 60,
  },
  fullscreenVideoWrap: {
    flex: 1,
  },
  fullscreenTitlePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  miniControlBtn: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  minimizedContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  minimizedPill: {
    position: 'absolute',
    zIndex: 40,
  },
  pipBottomControls: {
    bottom: 6,
    position: 'absolute',
    right: 6,
  },
  pipContainer: {
    aspectRatio: 16 / 9,
    position: 'absolute',
    zIndex: 40,
  },
  pipGlass: {
    flex: 1,
    overflow: 'hidden',
  },
  pipTopControls: {
    flexDirection: 'row',
    gap: 6,
    left: 6,
    position: 'absolute',
    top: 6,
  },
  playBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  roundBtn: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

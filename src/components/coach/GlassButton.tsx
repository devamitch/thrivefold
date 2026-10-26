/**
 * GlassButton — round glassmorphic control overlaid on the camera during live coaching.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';

import { PressableScale } from '../ui/PressableScale';
import { CoachGlass } from '../workout/CoachGlass';
import { useTheme } from '../../theme/useTheme';

interface GlassButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}

export function GlassButton({ icon, label, onPress, active = false }: GlassButtonProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
    >
      <CoachGlass
        radius={22}
        style={[styles.glassBtn, active ? { backgroundColor: colors.primary } : null]}
      >
        <Ionicons name={icon} size={20} color={colors.callText} />
      </CoachGlass>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  glassBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});

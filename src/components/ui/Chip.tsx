import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/useTheme';

import * as Haptics from 'expo-haptics';

interface ChipProps {
  label: string;
  subtext?: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  subtext,
  selected = false,
  onPress,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  const handlePress = () => {
    if (onPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onPress();
    }
  };

  const chipStyle: ViewStyle = {
    backgroundColor: selected ? colors.primaryAlpha : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  };

  const labelStyle: TextStyle = {
    color: selected ? colors.primary : colors.text.primary,
    ...typography.subbodyBold,
  };

  const subtextStyle: TextStyle = {
    color: colors.text.muted,
    ...typography.caption,
    marginTop: 2,
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        chipStyle,
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={labelStyle}>{label}</Text>
      {subtext && <Text style={subtextStyle}>{subtext}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
});

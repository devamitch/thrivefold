import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export interface ChipProps {
  label: string;
  subtext?: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  subtext,
  selected = false,
  onPress,
  style,
  icon,
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

  const bg = selected ? colors.primary : colors.surface1;
  const labelColor = selected ? colors.onPrimary : colors.text.primary;

  const labelStyle: TextStyle = {
    color: labelColor,
    ...typography.subbodyBold,
  };

  const subtextStyle: TextStyle = {
    color: colors.text.muted,
    ...typography.caption,
    marginTop: 2,
  };

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.96}
      style={[styles.chip, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={subtext ? `${label}, ${subtext}` : label}
    >
      <SquircleSurface
        radius={14}
        smoothing={1}
        fill={bg}
        style={[
          styles.surface,
          {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <View>
            <Text style={labelStyle}>{label}</Text>
            {subtext && <Text style={subtextStyle}>{subtext}</Text>}
          </View>
        </View>
      </SquircleSurface>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginRight: 8,
  },
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconWrap: {
    marginRight: 6,
  },
});

export default Chip;

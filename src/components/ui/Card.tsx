import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'surface1' | 'glass' | 'tinted';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  radius?: number;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  style,
  onPress,
  radius = 20,
  padding,
}) => {
  const { colors, spacing } = useTheme();

  const handlePress = () => {
    if (onPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onPress();
    }
  };

  let bg = colors.surface;
  if (variant === 'surface1') bg = colors.surface1;
  if (variant === 'glass') bg = colors.surfaceGlass;
  if (variant === 'tinted') bg = colors.primaryAlpha;

  const cardStyle: ViewStyle = {
    backgroundColor: bg,
    borderRadius: radius,
    borderColor: colors.border,
    borderWidth: 1,
    padding: padding !== undefined ? padding : spacing.base,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          cardStyle,
          pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

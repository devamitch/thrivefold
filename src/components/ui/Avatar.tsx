import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/useTheme';

/** Placeholder names that are not the person's own and must never become initials. */
const PLACEHOLDER_NAMES = new Set(['friend', 'guest', 'you', 'user']);

/** Up to two initials from a real name; null for empty or placeholder names. */
export function initialsFor(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  if (!trimmed || PLACEHOLDER_NAMES.has(trimmed.toLowerCase())) return null;
  const words = trimmed.split(/\s+/).filter((w) => /\p{L}|\p{N}/u.test(w[0] ?? ''));
  if (words.length === 0) return null;
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toLocaleUpperCase();
}

export interface AvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  size?: number;
  /** Fill behind initials or the fallback glyph. */
  fill: string;
  /** Initials and glyph colour. */
  ink: string;
  ring?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The person's own photo when they added one, else their initials, else a neutral person glyph.
 * Never a stock or generated face.
 */
export const Avatar = memo(function Avatar({
  photoUrl,
  name,
  size = 36,
  fill,
  ink,
  ring,
  style,
}: AvatarProps) {
  const { typography } = useTheme();
  const initials = photoUrl ? null : initialsFor(name);
  const box = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[
        styles.base,
        box,
        { backgroundColor: fill },
        ring ? { borderWidth: 1.5, borderColor: ring } : null,
        style,
      ]}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={box}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      ) : initials ? (
        <Text
          allowFontScaling={false}
          style={[typography.captionBold, { color: ink, fontSize: size * 0.38, lineHeight: size * 0.46 }]}
        >
          {initials}
        </Text>
      ) : (
        <Ionicons name="person-outline" size={size * 0.48} color={ink} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});

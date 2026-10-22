import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { newLocalId } from '../../stores/slices/authSlice';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const PROMISES = [
  { icon: 'phone-portrait-outline' as const, text: 'Your health records stay on this device.' },
  { icon: 'eye-off-outline' as const, text: 'Nothing about your health is shared or sold.' },
  { icon: 'trash-outline' as const, text: 'Export or erase everything any time in Settings.' },
];

/**
 * Entry screen. Creates a private, on-device profile (a pseudonym is optional) or a
 * guest session, then hands off to the root resolver, which runs onboarding when
 * needed. The experience is chosen once, in onboarding — not here.
 */
export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const setUser = useRootStore((s) => s.setUser);
  const continueAsGuest = useRootStore((s) => s.continueAsGuest);
  const [pseudonym, setPseudonym] = useState('');

  const name = pseudonym.trim();
  const tooLong = name.length > 24;

  const createProfile = () => {
    if (tooLong) return;
    setUser({
      id: newLocalId('user'),
      pseudonym: name || 'Friend',
      avatarSeed: newLocalId('seed'),
      age: null,
      isAgeVerified: false,
      ageBand: null,
      createdAt: new Date().toISOString(),
    });
    router.replace('/');
  };

  const guest = () => {
    continueAsGuest();
    router.replace('/');
  };

  const link = (label: string, href: '/(public)/legal/terms' | '/(public)/legal/privacy' | '/(public)/legal/health-disclaimer') => (
    <Pressable onPress={() => router.push(href)} hitSlop={10} accessibilityRole="link">
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image
              source={require('../../../assets/brand/icon.png')}
              style={styles.markImage}
              contentFit="contain"
              accessibilityIgnoresInvertColors
              accessible
              accessibilityLabel="Thrivefold"
            />
          </View>
          <Text
            style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.lg }]}
            accessibilityRole="header"
          >
            Thrivefold
          </Text>
          <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            Small, steady routines for your health — kept on your phone.
          </Text>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <TextField
            label="What should we call you?"
            placeholder="A first name or nickname"
            value={pseudonym}
            onChangeText={setPseudonym}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={createProfile}
            error={tooLong ? 'Keep it under 25 characters' : undefined}
            maxLength={40}
          />
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
            Optional. No real name, email or phone number needed.
          </Text>

          <Button
            label="Get started"
            size="lg"
            onPress={createProfile}
            disabled={tooLong}
            style={{ marginTop: spacing.lg }}
          />
          <Button
            label="Look around as a guest"
            variant="ghost"
            onPress={guest}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View
          style={[
            styles.promise,
            { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.xl },
          ]}
        >
          {PROMISES.map((row) => (
            <View key={row.text} style={styles.promiseRow}>
              <Ionicons name={row.icon} size={18} color={colors.primary} />
              <Text style={[typography.subbody, styles.promiseText, { color: colors.text.secondary }]}>
                {row.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.links, { marginTop: spacing.lg }]}>
          {link('Terms', '/(public)/legal/terms')}
          <Text style={[typography.caption, { color: colors.text.muted }]}>  ·  </Text>
          {link('Privacy', '/(public)/legal/privacy')}
          <Text style={[typography.caption, { color: colors.text.muted }]}>  ·  </Text>
          {link('Not medical advice', '/(public)/legal/health-disclaimer')}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { alignItems: 'center' },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  mark: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  markImage: { height: 96, width: 96 },
  promise: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 16,
  },
  promiseRow: { alignItems: 'center', flexDirection: 'row' },
  promiseText: { flex: 1, marginLeft: 10 },
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
});

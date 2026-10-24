import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { newLocalId } from '../../stores/slices/authSlice';
import { useRootStore } from '../../stores/useRootStore';
import { accountsAvailable, requestEmailCode, verifyEmailCode } from '../../services/account/accountService';
import { googleAvailable, signInWithGoogle } from '../../services/account/googleAccount';
import { IntroSlider } from '../../components/onboarding/IntroSlider';
import { AnimatedThrivefoldMark } from '../../components/brand/AnimatedThrivefoldMark';
import { useTheme } from '../../theme/useTheme';


type Step = 'account' | 'name' | 'email' | 'code';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const setUser = useRootStore((s) => s.setUser);
  const continueAsGuest = useRootStore((s) => s.continueAsGuest);

  const introSeen = useRootStore((s) => s.introSeen);
  const setIntroSeen = useRootStore((s) => s.setIntroSeen);
  const [step, setStep] = useState<Step>('account');

  const [pseudonym, setPseudonym] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.ok) router.push('/(auth)/confirm-profile');
    else if (!res.cancelled) setAuthError(res.message);
  };

  const guest = () => {
    continueAsGuest();
    router.replace('/');
  };

  const sendCode = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    const res = await requestEmailCode(email);
    setBusy(false);
    if (res.ok) setStep('code');
    else setAuthError(res.message);
  };

  const confirmCode = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    const res = await verifyEmailCode(email, code);
    setBusy(false);
    if (!res.ok) {
      setAuthError(res.message);
      return;
    }
    // Records already on this device stay; the account is attached to them.
    const existing = useRootStore.getState().user;
    setUser({
      id: res.userId,
      pseudonym: existing?.pseudonym && existing.pseudonym !== 'Guest' ? existing.pseudonym : name || 'Friend',
      avatarSeed: existing?.avatarSeed ?? newLocalId('seed'),
      age: existing?.age ?? null,
      isAgeVerified: false,
      ageBand: existing?.ageBand ?? null,
      email: res.email,
      isGuest: false,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    router.replace('/');
  };

  const legal = (
    <View style={[styles.links, { marginTop: spacing.md }]}>
      {(
        [
          ['Terms', '/(public)/legal/terms'],
          ['Privacy', '/(public)/legal/privacy'],
          ['Not medical advice', '/(public)/legal/health-disclaimer'],
        ] as const
      ).map(([label, href], i) => (
        <React.Fragment key={href}>
          {i > 0 ? <Text style={[typography.caption, { color: colors.text.muted }]}> · </Text> : null}
          <Pressable onPress={() => router.push(href)} hitSlop={10} accessibilityRole="link">
            <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );

  if (!introSeen) {
    return <IntroSlider onFinish={() => setIntroSeen(true)} />;
  }

  if (step === 'account') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }]}>
        <Pressable
          onPress={() => {
            setAuthError(null);
            setIntroSeen(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="See the introduction again"
          style={[styles.back, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.hero}>
          <AnimatedThrivefoldMark size={132} />
          <Text style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.lg }]} accessibilityRole="header">
            Welcome to Thrivefold
          </Text>
          <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            Sign in with Google and we will show you what your account shares so you can confirm it. Your health records
            stay on this phone either way.
          </Text>
        </View>
        {googleAvailable() ? (
          <Pressable
            onPress={google}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            style={[styles.google, { backgroundColor: colors.surface, borderColor: colors.borderStrong, opacity: busy ? 0.6 : 1 }]}
          >
            <Ionicons name="logo-google" size={20} color={colors.text.primary} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 12 }]}>
              {busy ? 'Opening Google…' : 'Continue with Google'}
            </Text>
          </Pressable>
        ) : null}
        {authError ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm, textAlign: 'center' }]}>{authError}</Text>
        ) : null}
        {accountsAvailable() ? (
          <Button label="Sign in with email" variant="outline" onPress={() => setStep('email')} style={{ marginTop: spacing.sm }} />
        ) : null}
        <Button label="Continue without an account" variant="ghost" onPress={() => setStep('name')} style={{ marginTop: spacing.xs }} />
        <Button label="Explore as guest" variant="ghost" onPress={guest} />
        <View style={{ paddingBottom: insets.bottom + spacing.md }}>{legal}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => {
            setAuthError(null);
            setStep(step === 'code' ? 'email' : 'account');
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.back, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>

        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(250)} style={{ marginTop: spacing.xl }}>
          <Text style={[typography.display, { color: colors.text.primary }]} accessibilityRole="header">
            {step === 'name' ? 'What should we call you?' : step === 'email' ? 'Sign in with email' : 'Enter your code'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            {step === 'name'
              ? 'A first name or nickname. You can change it later. No email or password needed.'
              : step === 'email'
                ? 'We will send a 6-digit code. Your health records still stay on this phone.'
                : `We sent a code to ${email.trim()}.`}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            {step === 'name' ? (
              <TextField
                label="Name or nickname"
                placeholder="e.g. Alex"
                value={pseudonym}
                onChangeText={setPseudonym}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                returnKeyType="go"
                onSubmitEditing={createProfile}
                error={tooLong ? 'Keep it under 25 characters' : undefined}
                maxLength={40}
              />
            ) : step === 'email' ? (
              <TextField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={sendCode}
                error={authError ?? undefined}
              />
            ) : (
              <TextField
                label="6-digit code"
                placeholder="123456"
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoFocus
                returnKeyType="go"
                onSubmitEditing={confirmCode}
                error={authError ?? undefined}
              />
            )}
          </View>
        </Animated.View>

        <View style={styles.flex} />

        <Button
          label={step === 'name' ? 'Continue' : step === 'email' ? 'Send code' : 'Sign in'}
          size="lg"
          loading={busy}
          disabled={busy || (step === 'name' && tooLong) || (step === 'code' && code.length !== 6)}
          onPress={step === 'name' ? createProfile : step === 'email' ? sendCode : confirmCode}
          style={{ marginTop: spacing.lg }}
        />
        {step === 'code' ? (
          <Button label="Send a new code" variant="ghost" onPress={sendCode} disabled={busy} style={{ marginTop: spacing.xs }} />
        ) : null}
        {legal}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  center: { textAlign: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', height: 56 },
  brandMark: { width: 32, height: 32 },
  slides: { flexGrow: 0 },
  imageWrap: { width: '100%', aspectRatio: 1.3, borderRadius: 24, borderCurve: 'continuous', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  slideIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center', height: 20 },
  dot: { height: 8, borderRadius: 4 },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
});

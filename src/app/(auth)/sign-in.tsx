import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquircleSurface } from '../../components/ui/SquircleSurface';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PRIVACY_SECTIONS } from '../(public)/legal/privacy';
import { TERMS_SECTIONS } from '../(public)/legal/terms';
import { AnimatedThrivefoldMark } from '../../components/brand/AnimatedThrivefoldMark';
import { IntroSlider } from '../../components/onboarding/IntroSlider';
import { Button } from '../../components/ui/Button';
import { PressableScale } from '../../components/ui/PressableScale';
import { TextField } from '../../components/ui/TextField';
import { suggestedExperience } from '../../domain/account/googleProfile';
import { TERMS_VERSION } from '../../domain/legal/terms';
import {
  accountsAvailable,
  requestEmailCode,
  verifyEmailCode,
} from '../../services/account/accountService';
import {
  googleAvailable,
  pendingGoogleProfile,
  requestBirthdayAndGender,
  signInWithGoogle,
} from '../../services/account/googleAccount';
import {
  applyProfile,
  profileFromGoogle,
  pullProfile,
  pushProfile,
} from '../../services/account/profileSync';
import { joinAsBetaTester, shareApp } from '../../services/distribution/appDistribution';
import { newLocalId } from '../../stores/slices/authSlice';
import { useRootStore } from '../../stores/useRootStore';
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
  const keyboardInset = useKeyboardInset();
  const [step, setStep] = useState<Step>('account');
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

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
    if (!res.ok) {
      setBusy(false);
      if (!res.cancelled) setAuthError(res.message);
      return;
    }
    // Continuing with an account is the agreement stated under the buttons.
    useRootStore.getState().acceptTerms(TERMS_VERSION);
    // Returning person: restore the saved profile (server first, then this phone) instead of
    // asking for the birthday and space again.
    const p = res.profile;
    const base = {
      id: `google_${p.id}`,
      email: p.email,
      photo: p.photo,
      name: (p.givenName || p.name?.split(' ')[0] || 'Friend').slice(0, 24),
    };
    const remote = p.serverSession ? await pullProfile() : null;
    const local = useRootStore.getState();
    const knownHere =
      !!local.user &&
      !local.user.isGuest &&
      local.user.email === p.email &&
      local.user.age !== null &&
      local.experienceConfirmed;
    setBusy(false);
    if (remote && applyProfile(remote, base)) {
      void pushProfile();
      router.replace('/');
    } else if (knownHere) {
      void pushProfile();
      router.replace('/');
    } else {
      // New here: ask Google (its own consent screen) for the birthday and gender in the account.
      // With a full birthday and a gender that maps to a space, nothing needs to be typed.
      await requestBirthdayAndGender();
      const g = pendingGoogleProfile();
      const space = suggestedExperience(g?.gender ?? null);
      const bd =
        g?.birthDateString && /^\d{4}-\d{2}-\d{2}$/.test(g.birthDateString)
          ? g.birthDateString
          : null;
      if (
        g &&
        bd &&
        space &&
        (g.age ?? 0) >= 18 &&
        applyProfile(profileFromGoogle(bd, space, base.name), { ...base, gender: g.gender })
      ) {
        void pushProfile();
        router.replace('/');
      } else {
        router.push('/(auth)/confirm-profile');
      }
    }
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
      pseudonym:
        existing?.pseudonym && existing.pseudonym !== 'Guest'
          ? existing.pseudonym
          : name || 'Friend',
      avatarSeed: existing?.avatarSeed ?? newLocalId('seed'),
      age: existing?.age ?? null,
      isAgeVerified: false,
      ageBand: existing?.ageBand ?? null,
      email: res.email,
      isGuest: false,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    useRootStore.getState().acceptTerms(TERMS_VERSION);
    const remote = await pullProfile();
    if (remote)
      applyProfile(remote, {
        id: res.userId,
        email: res.email,
        photo: null,
        name: name || 'Friend',
      });
    void pushProfile();
    router.replace('/');
  };

  const legal = (
    <>
      <Text
        style={[
          typography.caption,
          { color: colors.text.muted, textAlign: 'center', marginTop: spacing.md, fontSize: 11 },
        ]}
      >
        By continuing with an account you confirm you are 18 or older and agree to our
      </Text>
      <View
        style={[
          styles.links,
          { marginTop: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
        ]}
      >
        <PressableScale
          hitSlop={10}
          accessibilityRole="button"
          onPress={() => setLegalModal('terms')}
        >
          <Text
            style={[
              typography.captionBold,
              { color: colors.primary, fontSize: 11, textDecorationLine: 'underline' },
            ]}
          >
            Terms of Service
          </Text>
        </PressableScale>
        <Text style={[typography.caption, { color: colors.text.muted, fontSize: 11 }]}> · </Text>
        <PressableScale
          hitSlop={10}
          accessibilityRole="button"
          onPress={() => setLegalModal('privacy')}
        >
          <Text
            style={[
              typography.captionBold,
              { color: colors.primary, fontSize: 11, textDecorationLine: 'underline' },
            ]}
          >
            Privacy Policy
          </Text>
        </PressableScale>
        <Text style={[typography.caption, { color: colors.text.muted, fontSize: 11 }]}> · </Text>
        <Link href="/(public)/legal/health-disclaimer" asChild>
          <PressableScale hitSlop={10} accessibilityRole="link">
            <Text style={[typography.caption, { color: colors.text.muted, fontSize: 11 }]}>
              Not medical advice
            </Text>
          </PressableScale>
        </Link>
      </View>
    </>
  );

  const legalModalView = (
    <Modal
      visible={legalModal !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setLegalModal(null)}
    >
      <GestureHandlerRootView
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.md,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setLegalModal(null)} />
        <SquircleSurface
          radius={24}
          fill={colors.background}
          style={{
            width: '100%',
            maxHeight: '82%',
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={[typography.heading, { color: colors.text.primary }]}>
              {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </Text>
            <PressableScale
              onPress={() => setLegalModal(null)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </PressableScale>
          </View>
          <Text
            style={[
              typography.caption,
              { color: colors.text.muted, marginBottom: spacing.md, fontSize: 11 },
            ]}
          >
            Version 2.4 · Effective November 1, 2026 · AnvayKosh Ecosystem
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
            {(legalModal === 'privacy' ? PRIVACY_SECTIONS : TERMS_SECTIONS).map((sec) => (
              <View key={sec.title} style={{ marginBottom: spacing.md }}>
                <Text
                  style={[
                    typography.captionBold,
                    { color: colors.text.primary, marginBottom: 4, fontSize: 12 },
                  ]}
                >
                  {sec.title}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, lineHeight: 18, fontSize: 11 },
                  ]}
                >
                  {sec.body}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Button
            label="Done"
            variant="primary"
            size="sm"
            onPress={() => setLegalModal(null)}
            style={{ marginTop: spacing.md }}
          />
        </SquircleSurface>
      </GestureHandlerRootView>
    </Modal>
  );

  if (!introSeen) {
    return <IntroSlider onFinish={() => setIntroSeen(true)} />;
  }

  if (step === 'account') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.lg,
          }}
        >
          <PressableScale
            onPress={() => {
              setAuthError(null);
              setIntroSeen(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="See the introduction again"
            style={[styles.back, { backgroundColor: colors.surface1 }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </PressableScale>
          <View style={[styles.hero, { marginTop: spacing.sm }]}>
            <AnimatedThrivefoldMark size={112} />
            <Text
              style={[
                typography.display,
                styles.center,
                { color: colors.text.primary, marginTop: spacing.md },
              ]}
              accessibilityRole="header"
            >
              Welcome to Thrivefold
            </Text>
            <Text
              style={[
                typography.body,
                styles.center,
                { color: colors.text.secondary, marginTop: spacing.xs },
              ]}
            >
              A calm, local-first sanctuary for your biological rhythm, daily check-ins, and
              holistic health.
            </Text>
          </View>

          {/* Editorial Value & Privacy Guarantee Points */}
          <SquircleSurface
            radius={20}
            fill={colors.surface1}
            style={{ padding: spacing.md, marginVertical: spacing.md, width: '100%' }}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: colors.primary,
                  fontWeight: '700',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Private & Transparent Authentication
            </Text>

            <View style={{ gap: 10, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, fontSize: 13 }]}>
                    Local-First & Encrypted
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.text.secondary, marginTop: 1, lineHeight: 17 },
                    ]}
                  >
                    Sensitive check-ins, cycles, and journal notes stay stored on your device only.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Ionicons name="cloud-done-outline" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, fontSize: 13 }]}>
                    Seamless Device Restore
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.text.secondary, marginTop: 1, lineHeight: 17 },
                    ]}
                  >
                    Switch phones anytime without losing streaks, achievements, or customized
                    routines.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Ionicons name="eye-off-outline" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, fontSize: 13 }]}>
                    Zero Ads or Data Broking
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.text.secondary, marginTop: 1, lineHeight: 17 },
                    ]}
                  >
                    No hidden trackers, third-party profiling, or monetization of personal health.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, fontSize: 13 }]}>
                    1-Tap Guest Access Anytime
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.text.secondary, marginTop: 1, lineHeight: 17 },
                    ]}
                  >
                    Every core wellness tool is always 100% accessible offline without an account.
                  </Text>
                </View>
              </View>
            </View>
          </SquircleSurface>

          {googleAvailable() ? (
            <PressableScale
              onPress={google}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={[
                styles.google,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderStrong,
                  opacity: busy ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="logo-google" size={20} color={colors.text.primary} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 12 }]}>
                {busy ? 'Opening Google…' : 'Continue with Google'}
              </Text>
            </PressableScale>
          ) : null}
          {authError ? (
            <Text
              style={[
                typography.caption,
                { color: colors.error, marginTop: spacing.sm, textAlign: 'center' },
              ]}
            >
              {authError}
            </Text>
          ) : null}
          {accountsAvailable() ? (
            <Button
              label="Sign in with email"
              variant="outline"
              onPress={() => setStep('email')}
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
          {/* <Button label="Continue without an account" variant="ghost" onPress={() => setStep('name')} style={{ marginTop: spacing.xs }} /> */}
          <Button label="Explore as guest" variant="ghost" onPress={guest} />
          <View style={[styles.distributionRow, { marginTop: spacing.xs }]}>
            <PressableScale
              onPress={() => void shareApp()}
              accessibilityRole="button"
              accessibilityLabel="Share Thrivefold app"
              style={[styles.distributionAction, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons name="share-outline" size={16} color={colors.primary} />
              <Text
                style={[
                  typography.captionBold,
                  { color: colors.text.primary, marginLeft: spacing.xs },
                ]}
              >
                Share app
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => void joinAsBetaTester()}
              accessibilityRole="button"
              accessibilityLabel="Join the Thrivefold beta"
              style={[styles.distributionAction, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons name="people-outline" size={16} color={colors.primary} />
              <Text
                style={[
                  typography.captionBold,
                  { color: colors.text.primary, marginLeft: spacing.xs },
                ]}
              >
                Join beta
              </Text>
            </PressableScale>
          </View>
          <View style={{ paddingBottom: spacing.md }}>{legal}</View>
        </ScrollView>
        {legalModalView}
      </View>
    );
  }

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background, paddingBottom: keyboardInset }]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PressableScale
          onPress={() => {
            setAuthError(null);
            setStep(step === 'code' ? 'email' : 'account');
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.back, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </PressableScale>

        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(250)}
          style={{ marginTop: spacing.xl }}
        >
          <Text
            style={[typography.display, { color: colors.text.primary }]}
            accessibilityRole="header"
          >
            {step === 'name'
              ? 'What should we call you?'
              : step === 'email'
                ? 'Sign in with email'
                : 'Enter your code'}
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
          <Button
            label="Send a new code"
            variant="ghost"
            onPress={sendCode}
            disabled={busy}
            style={{ marginTop: spacing.xs }}
          />
        ) : null}
        {legal}
      </ScrollView>
      {legalModalView}
    </View>
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
  imageWrap: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  slideIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
    height: 20,
  },
  dot: { height: 8, borderRadius: 4 },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  distributionRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  distributionAction: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 18,
    borderCurve: 'continuous',
  },
});

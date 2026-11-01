import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Animated, {
  FadeIn,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedThrivefoldMark } from '../../components/brand/AnimatedThrivefoldMark';
import { IntroSlider } from '../../components/onboarding/IntroSlider';
import { PressableScale } from '../../components/ui/PressableScale';
import { suggestedExperience } from '../../domain/account/googleProfile';
import { TERMS_VERSION } from '../../domain/legal/terms';
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
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const PINS = [0, 1, 2, 3, 4];

const FACTS = [
  { icon: 'hardware-chip-outline', label: 'On-device AI' },
  { icon: 'cloud-offline-outline', label: 'Offline' },
  { icon: 'shield-checkmark-outline', label: 'No trackers' },
] as const;

/** Chip legs on all four sides. Sits behind the chip body. */
function Pins({ color }: { color: string }) {
  return (
    <>
      <View style={[styles.pinRowH, { top: 0 }]}>
        {PINS.map((i) => (
          <View key={`t${i}`} style={[styles.pinV, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={[styles.pinRowH, { bottom: 0 }]}>
        {PINS.map((i) => (
          <View key={`b${i}`} style={[styles.pinV, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={[styles.pinColV, { left: 0 }]}>
        {PINS.map((i) => (
          <View key={`l${i}`} style={[styles.pinH, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={[styles.pinColV, { right: 0 }]}>
        {PINS.map((i) => (
          <View key={`r${i}`} style={[styles.pinH, { backgroundColor: color }]} />
        ))}
      </View>
    </>
  );
}

/** The one moving thing on the screen: a double-beat, then rest. */
function Heartbeat({ still }: { still: boolean }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (still) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 120 }),
        withTiming(1, { duration: 160 }),
        withTiming(1.18, { duration: 110 }),
        withTiming(1, { duration: 180 }),
        withTiming(1, { duration: 1100 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(scale);
  }, [still, scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.pulseRow}>
      <View style={[styles.pulseLine, { backgroundColor: colors.surface2 }]} />
      <Animated.View style={iconStyle}>
        <Ionicons name="pulse" size={22} color={colors.primary} />
      </Animated.View>
      <View style={[styles.pulseLine, { backgroundColor: colors.surface2 }]} />
    </View>
  );
}

type ActionProps = {
  label: string;
  onPress: () => void;
  solid?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Flat full-width action. Solid = the main one, tonal = the alternative. */
function Action({ label, onPress, solid, icon, disabled, accessibilityLabel }: ActionProps) {
  const { colors, typography } = useTheme();
  const bg = solid ? colors.text.primary : colors.surface1;
  const fg = solid ? colors.background : colors.text.primary;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!disabled }}
      style={[styles.action, { backgroundColor: bg, opacity: disabled ? 0.6 : 1 }]}
    >
      {icon ? <Ionicons name={icon} size={19} color={fg} style={styles.actionIcon} /> : null}
      <Text style={[typography.bodyBold, { color: fg }]}>{label}</Text>
    </PressableScale>
  );
}

/** Sign-in: Google or guest. Flat and tonal, no borders and no shadows. */
export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const continueAsGuest = useRootStore((s) => s.continueAsGuest);

  const introSeen = useRootStore((s) => s.introSeen);
  const setIntroSeen = useRootStore((s) => s.setIntroSeen);

  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const hasGoogle = googleAvailable();

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    // Busy stays on through the whole hand-off, so a second tap can't start another sign-in
    // while Google's birthday consent is still open.
    try {
      const res = await signInWithGoogle();
      if (!res.ok) {
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
    } finally {
      setBusy(false);
    }
  };

  const guest = () => {
    if (busy) return;
    continueAsGuest();
    router.replace('/');
  };

  if (!introSeen) {
    return <IntroSlider onFinish={() => setIntroSeen(true)} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
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

        {/* Hero: a chip with the Thrivefold mark as its die. Only the heartbeat moves. */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(400)}
          style={styles.hero}
        >
          <View style={styles.chipStage}>
            <Pins color={colors.surface3} />
            <View style={[styles.chipBody]}>
              {/* <View style={[styles.chipDie]}> */}
              <AnimatedThrivefoldMark size={140} />
              {/* </View> */}
            </View>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Heartbeat still={reduceMotion} />
          </View>

          <Text
            style={[
              typography.display,
              styles.center,
              { color: colors.text.primary, marginTop: spacing.md },
            ]}
            accessibilityRole="header"
          >
            {'Your health,\non your device.'}
          </Text>
          <Text
            style={[
              typography.body,
              styles.center,
              { color: colors.text.secondary, marginTop: spacing.xs, maxWidth: 300 },
            ]}
          >
            Check-ins, routines and guidance in one private health app.
          </Text>

          <View style={[styles.factRow, { marginTop: spacing.md }]}>
            {FACTS.map((f) => (
              <View key={f.label} style={[styles.fact, { backgroundColor: colors.surface }]}>
                <Ionicons name={f.icon} size={15} color={colors.primary} />
                <Text
                  style={[
                    typography.captionBold,
                    { color: colors.text.primary, marginLeft: 6, fontSize: 12 },
                  ]}
                >
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Actions: sign-in first. Guest is the main action only when Google isn't available. */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(380).delay(120)}
          style={{ marginTop: spacing.lg }}
        >
          {hasGoogle ? (
            <>
              <Action
                solid
                icon="logo-google"
                label={busy ? 'Opening Google…' : 'Continue with Google'}
                accessibilityLabel="Continue with Google"
                onPress={google}
                disabled={busy}
              />
              <View style={{ height: spacing.sm }} />
              <Action label="Continue as guest" onPress={guest} disabled={busy} />
            </>
          ) : (
            <Action solid label="Continue as guest" onPress={guest} />
          )}

          {authError ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                typography.caption,
                { color: colors.error, marginTop: spacing.sm, textAlign: 'center' },
              ]}
            >
              {authError}
            </Text>
          ) : null}

          {/* Legal lives in the existing public pages. No copies here. */}
          <Text
            style={[
              typography.caption,
              styles.center,
              { color: colors.text.muted, fontSize: 12, marginTop: spacing.md },
            ]}
          >
            By continuing with Google you confirm you are 18 or older and agree to our
          </Text>
          <View style={[styles.links, { marginTop: spacing.xs }]}>
            <Link href="/(public)/legal/terms" asChild>
              <PressableScale hitSlop={10} accessibilityRole="link">
                <Text style={[typography.captionBold, styles.legalLink, { color: colors.primary }]}>
                  Terms of Service
                </Text>
              </PressableScale>
            </Link>
            <Text style={[typography.caption, styles.dot, { color: colors.text.muted }]}> · </Text>
            <Link href="/(public)/legal/privacy" asChild>
              <PressableScale hitSlop={10} accessibilityRole="link">
                <Text style={[typography.captionBold, styles.legalLink, { color: colors.primary }]}>
                  Privacy Policy
                </Text>
              </PressableScale>
            </Link>
            <Text style={[typography.caption, styles.dot, { color: colors.text.muted }]}> · </Text>
            <Link href="/(public)/legal/health-disclaimer" asChild>
              <PressableScale hitSlop={10} accessibilityRole="link">
                <Text style={[typography.caption, styles.legalLink, { color: colors.text.muted }]}>
                  Not medical advice
                </Text>
              </PressableScale>
            </Link>
          </View>

          <View style={[styles.links, { marginTop: spacing.md, gap: spacing.lg }]}>
            <PressableScale
              onPress={() => void shareApp()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Share Thrivefold app"
            >
              <Text style={[typography.caption, { color: colors.text.muted, fontSize: 12 }]}>
                Share app
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => void joinAsBetaTester()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Join the Thrivefold beta"
            >
              <Text style={[typography.caption, { color: colors.text.muted, fontSize: 12 }]}>
                Join beta
              </Text>
            </PressableScale>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { textAlign: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  hero: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  chipStage: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  chipBody: {
    width: 150,
    height: 150,
    borderRadius: 34,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDie: {
    width: 130,
    height: 130,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRowH: {
    position: 'absolute',
    left: 26,
    right: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pinColV: { position: 'absolute', top: 26, bottom: 26, justifyContent: 'space-between' },
  pinV: { width: 1, height: 12, borderRadius: 3 },
  pinH: { width: 12, height: 1, borderRadius: 3 },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pulseLine: { width: 56, height: 2, borderRadius: 1 },
  factRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 18,
    borderCurve: 'continuous',
  },
  actionIcon: { marginRight: 10 },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  legalLink: { fontSize: 12, textDecorationLine: 'underline' },
  dot: { fontSize: 12 },
});

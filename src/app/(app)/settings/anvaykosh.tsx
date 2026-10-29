import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AnvayKoshIcon } from '../../../components/brand/AnvayKoshIcon';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import type { VaultField, VaultProfile } from '../../../domain/ecosystem/anvayVault';
import { googleAvailable, signInWithGoogle } from '../../../services/account/googleAccount';
import {
  anvayIdStatus,
  deleteVault,
  installedAnvayApps,
  openAnvayApp,
  readVault,
  syncVault,
  type AnvayApp,
  type AnvayIdStatus,
} from '../../../services/ecosystem/anvayKosh';
import {
  pullProfile,
  pullProgress,
  pushProfile,
  pushProgress,
} from '../../../services/account/profileSync';
import { hapticSuccess } from '../../../services/haptics';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const FIELD_LABEL: Record<VaultField, string> = {
  display_name: 'Name',
  avatar_seed: 'Avatar',
  photo_url: 'Photo',
  locale: 'Language',
  time_zone: 'Time zone',
};

const APP_NAME: Record<string, string> = {
  'com.amit.thrivefold': 'Thrivefold',
  'com.amit.setu': 'Setu',
  'com.amit.neev': 'Neev',
  'com.amit.harmonybloom': 'HarmonyBloom',
  'com.amit.blinkquest': 'BlinkQuest',
  vault: 'Anvay Vault',
};

/**
 * AnvayKosh: one sign-in (Anvay ID), a small owner-only shared profile (Anvay Vault) and the
 * sibling apps on this phone. Health data never leaves Thrivefold through any of these.
 */
export default function AnvayKoshScreen() {
  const { colors, typography, spacing } = useTheme();
  const { user, level, xp, streak, diamonds, questsCompleted } = useRootStore(
    useShallow((s) => ({
      user: s.user,
      level: s.level,
      xp: s.xp,
      streak: s.currentStreak,
      diamonds: s.diamonds,
      questsCompleted: s.questsCompleted,
    })),
  );
  const [status, setStatus] = useState<AnvayIdStatus | null>(null);
  const [vault, setVault] = useState<VaultProfile | null>(null);
  const [apps, setApps] = useState<(AnvayApp & { installed: boolean })[]>([]);
  const [busy, setBusy] = useState<'signin' | 'sync' | 'delete' | 'supabase' | 'pull' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const s = await anvayIdStatus();
    setStatus(s);
    setApps(await installedAnvayApps());
    if (s.signedIn) {
      try {
        setVault(await readVault());
      } catch {
        setVault(null);
      }
    } else {
      setVault(null);
    }
  }, []);

  const syncSupabase = async () => {
    setBusy('supabase');
    setMessage(null);
    try {
      const okProfile = await pushProfile();
      const okProgress = await pushProgress();
      hapticSuccess();
      if (okProfile || okProgress) {
        setMessage(`Saved: Level ${level}, ${xp} XP, ${streak} day streak.`);
      } else {
        setMessage('Saved on this phone. Sign in with Google to save to your account.');
      }
    } catch {
      setMessage('Could not save. Check your connection.');
    } finally {
      setBusy(null);
    }
  };

  const pullSupabase = async () => {
    setBusy('pull');
    setMessage(null);
    try {
      const rem = await pullProfile();
      const prog = await pullProgress();
      hapticSuccess();
      if (rem || prog) {
        setMessage('Your saved profile and progress were added. Nothing here was replaced.');
      } else {
        setMessage('Nothing saved in your account yet. This phone\'s copy has been saved.');
      }
    } catch {
      setMessage('Could not restore. Check your connection.');
    } finally {
      setBusy(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const signIn = async () => {
    setBusy('signin');
    setMessage(null);
    const res = await signInWithGoogle();
    setBusy(null);
    if (!res.ok && !res.cancelled) setMessage(res.message);
    await load();
  };

  const sync = async () => {
    setBusy('sync');
    setMessage(null);
    try {
      const res = await syncVault();
      setVault(res.profile);
      hapticSuccess();
      setMessage(
        res.shared.length || res.received.length
          ? [
              res.shared.length ? `Shared ${res.shared.map((f) => FIELD_LABEL[f]).join(', ')}.` : '',
              res.received.length ? `Filled ${res.received.map((f) => FIELD_LABEL[f]).join(', ')} here.` : '',
            ]
              .filter(Boolean)
              .join(' ')
          : 'Already in sync. Nothing changed.',
      );
    } catch {
      setMessage('Could not reach Anvay Vault. Check your connection and try again.');
    } finally {
      setBusy(null);
    }
  };

  const remove = () => {
    useRootStore.getState().showAlert({
      title: 'Remove your Anvay Vault profile?',
      message:
        'The shared profile is deleted from the server. Thrivefold keeps everything on this phone. Other AnvayKosh apps keep their own copies.',
      confirmText: 'Remove',
      cancelText: 'Keep',
      onConfirm: async () => {
        setBusy('delete');
        try {
          await deleteVault();
          setVault({});
          setMessage('Vault profile removed.');
        } catch {
          setMessage('Could not remove it right now. Try again.');
        } finally {
          setBusy(null);
        }
      },
    });
  };

  const filledFields = (Object.keys(FIELD_LABEL) as VaultField[]).filter((f) => vault?.[f]);

  return (
    <ScreenContainer
      header={<AppHeader title="AnvayKosh" subtitle="Your apps, one account" showBack />}
      scrollMode="shell-scroll-view"
    >
      <View style={styles.hero}>
        <AnvayKoshIcon size={64} />
        <View style={styles.flex}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>AnvayKosh</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Thrivefold, Neev, HarmonyBloom, BlinkQuest and Setu. Each app works on its own; connecting
            only shares what is listed here.
          </Text>
        </View>
      </View>

      {/* Anvay ID */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
            Anvay ID
          </Text>
          {status ? (
            <Text style={[typography.captionBold, { color: status.signedIn ? colors.success : colors.text.muted }]}>
              {status.signedIn ? 'Connected' : 'Not connected'}
            </Text>
          ) : (
            <ActivityIndicator size="small" color={colors.text.muted} />
          )}
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          {status?.signedIn
            ? `Signed in${status.email ? ` as ${status.email}` : ''}. Use the same Google account in other AnvayKosh apps.`
            : status && !status.configured
              ? 'This build has no AnvayKosh server configured.'
              : 'One Google sign-in for your AnvayKosh apps. Your Thrivefold data stays on this phone.'}
        </Text>
        {status && !status.signedIn && status.configured && googleAvailable() ? (
          <Button
            label={busy === 'signin' ? 'Connecting…' : 'Continue with Anvay ID'}
            onPress={signIn}
            disabled={busy !== null}
            style={{ marginTop: spacing.md }}
            icon={<AnvayKoshIcon size={20} />}
            variant="outline"
          />
        ) : null}
      </Card>

      {/* Supabase Cloud & Progress Sync */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.row}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
            Saved to your account
          </Text>
          <Text style={[typography.captionBold, { color: user && !user.isGuest ? colors.success : colors.text.muted }]}>
            {user && !user.isGuest ? 'Online account' : 'Local guest'}
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          Sync your personal profile and progress (Level {level}, {xp} XP, {streak} day streak, {diamonds} diamonds)
          so signing in on another phone restores everything.
        </Text>

        <View style={[styles.progressBox, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
          <View style={styles.progressItem}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>Lvl {level}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Level</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[typography.captionBold, { color: colors.accent }]}>{xp}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>XP</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>{streak}d</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Streak</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[typography.captionBold, { color: colors.warning }]}>{diamonds}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Diamonds</Text>
          </View>
        </View>

        <View style={[styles.row, { gap: 8, marginTop: spacing.md }]}>
          <Button
            label={busy === 'supabase' ? 'Saving…' : 'Save to my account'}
            onPress={syncSupabase}
            disabled={busy !== null}
            style={styles.flex}
          />
          <Button
            label={busy === 'pull' ? 'Restoring…' : 'Restore from my account'}
            variant="outline"
            onPress={pullSupabase}
            disabled={busy !== null}
            style={styles.flex}
          />
        </View>
      </Card>

      {/* Anvay Vault */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.row}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
            Anvay Vault
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          A small profile only you can read: name, avatar, photo, language and time zone. Syncing
          fills blanks and never overwrites. Health, cycle and journal data are never part of it.
        </Text>
        {status?.signedIn ? (
          <>
            {filledFields.length ? (
              <View style={{ marginTop: spacing.sm }}>
                {filledFields.map((f) => (
                  <View key={f} style={[styles.field, { borderTopColor: colors.surface1 }]}>
                    <Text style={[typography.caption, styles.fieldLabel, { color: colors.text.muted }]}>
                      {FIELD_LABEL[f]}
                    </Text>
                    <Text numberOfLines={1} style={[typography.subbody, styles.flex, { color: colors.text.primary }]}>
                      {f === 'photo_url' ? 'Added' : vault?.[f]}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted }]}>
                      {APP_NAME[vault?.sources?.[f]?.app ?? ''] ?? ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
                Your vault is empty. Sync to start it from this phone.
              </Text>
            )}
            <View style={[styles.row, { gap: 8, marginTop: spacing.md }]}>
              <Button
                label={busy === 'sync' ? 'Syncing…' : 'Sync now'}
                onPress={sync}
                disabled={busy !== null}
                style={styles.flex}
              />
              {filledFields.length ? (
                <Button label="Remove" variant="ghost" onPress={remove} disabled={busy !== null} />
              ) : null}
            </View>
          </>
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            Connect Anvay ID to use the vault.
          </Text>
        )}
      </Card>

      {message ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>{message}</Text>
      ) : null}

      {/* Apps */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        AnvayKosh apps
      </Text>
      <Card style={{ paddingVertical: spacing.xs }}>
        {apps.map((app, i) => (
          <View
            key={app.id}
            style={[styles.appRow, i > 0 ? { borderTopColor: colors.surface1, borderTopWidth: StyleSheet.hairlineWidth } : null]}
          >
            <View style={styles.flex}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{app.name}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>{app.purpose}</Text>
            </View>
            <PressableScale
              onPress={() => void openAnvayApp(app, app.installed)}
              accessibilityRole="button"
              accessibilityLabel={app.installed ? `Open ${app.name}` : `Get ${app.name} on Google Play`}
              style={[styles.appBtn, { backgroundColor: app.installed ? colors.primaryAlpha : colors.surface1 }]}
            >
              <Text style={[typography.captionBold, { color: app.installed ? colors.primary : colors.text.secondary }]}>
                {app.installed ? 'Open' : 'Get'}
              </Text>
            </PressableScale>
          </View>
        ))}
      </Card>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Opening an app passes no data. Each app asks for its own permissions.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  fieldLabel: { width: 72 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  appBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, justifyContent: 'center' },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 12,
  },
  progressItem: {
    alignItems: 'center',
  },
});

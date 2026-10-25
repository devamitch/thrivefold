import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Toggle } from '../../../components/ui/Toggle';
import { APPROVED_CHIPS } from '../../../domain/chips/catalog';
import {
  datingErrorText,
  useDatingProfile,
  useDeleteDatingProfile,
  useSaveDatingProfile,
  type DatingGender,
} from '../../../services/supabase/dating';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const GENDERS: { id: DatingGender; label: string }[] = [
  { id: 'woman', label: 'Woman' },
  { id: 'man', label: 'Man' },
  { id: 'nonbinary', label: 'Non-binary' },
];

const INTERESTS = [
  'Walks', 'Reading', 'Cooking', 'Music', 'Art', 'Films', 'Travel', 'Fitness', 'Yoga', 'Gardening',
  'Tea and coffee', 'Languages', 'Games', 'Photography', 'Volunteering', 'Nature',
];

const PROMPTS = APPROVED_CHIPS.filter((c) => c.category === 'dating_reflection');

/**
 * Dating profile: self-declared gender and who you'd like to meet (never inferred), interests
 * from a list, up to three "about me" cards. No photos, location or contact details.
 */
export default function DatingProfileScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const profile = useDatingProfile(true);
  const save = useSaveDatingProfile();
  const remove = useDeleteDatingProfile();

  const [gender, setGender] = useState<DatingGender | null>(null);
  const [into, setInto] = useState<DatingGender[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    setGender(p.gender);
    setInto(p.interested_in);
    setInterests(p.interests);
    setPrompts(p.prompt_chip_ids);
    setActive(p.is_active);
  }, [profile.data]);

  const toggleIn = <T,>(list: T[], v: T, max: number) =>
    list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

  const onSave = () => {
    if (!gender || into.length === 0) return;
    save.mutate(
      { gender, interested_in: into, interests, prompt_chip_ids: prompts, is_active: active },
      {
        onSuccess: () => router.back(),
        onError: (e) => showAlert({ title: 'Not saved', message: datingErrorText(e), confirmText: 'OK', cancelText: null }),
      },
    );
  };

  const onDelete = () =>
    showAlert({
      title: 'Delete your dating profile?',
      message: 'You disappear from Discover. Existing conversations stay until you or the other person end them.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () =>
        remove.mutate(undefined, {
          onSuccess: () => router.back(),
          onError: (e) => showAlert({ title: 'Not deleted', message: datingErrorText(e), confirmText: 'OK', cancelText: null }),
        }),
    });

  const section = (title: string, hint?: string) => (
    <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{title}</Text>
      {hint ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{hint}</Text> : null}
    </View>
  );

  return (
    <ScreenWrapper
      scrollable
      footer={
        <Button
          label={!gender ? 'Choose how you identify' : into.length === 0 ? 'Choose who you’d like to meet' : 'Save profile'}
          onPress={onSave}
          loading={save.isPending}
          disabled={!gender || into.length === 0 || save.isPending}
        />
      }
    >
      <Header title="Dating profile" subtitle="Only what you choose to share" showBack />
      <View>
        {section('I am', 'Your own answer; it is never guessed.')}
        <View style={styles.wrap}>
          {GENDERS.map((g) => (
            <Chip key={g.id} label={g.label} selected={gender === g.id} onPress={() => setGender(g.id)} />
          ))}
        </View>

        {section('I’d like to meet')}
        <View style={styles.wrap}>
          {GENDERS.map((g) => (
            <Chip key={g.id} label={g.label} selected={into.includes(g.id)} onPress={() => setInto((l) => toggleIn(l, g.id, 3))} />
          ))}
        </View>

        {section('Interests', 'Up to 12.')}
        <View style={styles.wrap}>
          {INTERESTS.map((i) => (
            <Chip key={i} label={i} selected={interests.includes(i)} onPress={() => setInterests((l) => toggleIn(l, i, 12))} />
          ))}
        </View>

        {section('About me', 'Up to three cards shown on your profile.')}
        <View style={{ gap: 8 }}>
          {PROMPTS.map((p) => (
            <Chip key={p.id} label={p.text} selected={prompts.includes(p.id)} onPress={() => setPrompts((l) => toggleIn(l, p.id, 3))} />
          ))}
        </View>

        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Show me in Discover</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>Pause to stop new hellos.</Text>
            </View>
            <Toggle value={active} onValueChange={setActive} accessibilityLabel="Show me in Discover" />
          </View>
        </Card>

        {profile.data ? (
          <Button label="Delete dating profile" variant="ghost" onPress={onDelete} style={{ marginTop: spacing.md }} />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});

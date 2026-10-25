import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { TextField } from '../../../components/ui/TextField';
import { letterErrorText, useMySocialProfile, useSaveSocialProfile } from '../../../services/supabase/letters';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const INTERESTS = ['Mindful habits', 'Books and poetry', 'Nature and walks', 'Language exchange', 'Tea and quiet living', 'Movement', 'Philosophy', 'Art and photography'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Swedish', 'Bengali'];

/** The pseudonymous card other people see on your letters, stored on the server. */
export default function LetterProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const { user, setUser, showToast, showAlert } = useRootStore(
    useShallow((s) => ({ user: s.user, setUser: s.setUser, showToast: s.showToast, showAlert: s.showAlert })),
  );
  const profile = useMySocialProfile(true);
  const save = useSaveSocialProfile();
  const [pseudonym, setPseudonym] = useState(user?.pseudonym ?? '');
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (!profile.data) return;
    setPseudonym(profile.data.pseudonym);
    setInterests(profile.data.interests);
    setLanguages(profile.data.languages);
  }, [profile.data]);

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const name = pseudonym.trim();

  const onSave = () =>
    save.mutate(
      { pseudonym: name, interests, languages },
      {
        onSuccess: () => {
          if (user) setUser({ ...user, pseudonym: name });
          showToast({ type: 'success', message: 'Your letter card is saved.' });
        },
        onError: (e) => showAlert({ title: 'Not saved', message: letterErrorText(e), confirmText: 'OK', cancelText: null }),
      },
    );

  return (
    <ScreenWrapper
      scrollable
      footer={<Button label="Save" onPress={onSave} loading={save.isPending} disabled={name.length < 2 || save.isPending} />}
    >
      <Header title="Letter card" subtitle="What others see. No real name needed." showBack />
      {profile.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View>
          <Card style={{ padding: spacing.base }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>Pen name</Text>
            <TextField value={pseudonym} onChangeText={setPseudonym} placeholder="e.g. QuietRiver" maxLength={24} />
          </Card>
          <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>Languages you write in</Text>
            <View style={styles.wrap}>
              {LANGUAGES.map((l) => (
                <Chip key={l} label={l} selected={languages.includes(l)} onPress={() => setLanguages((x) => toggle(x, l))} />
              ))}
            </View>
          </Card>
          <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>Interests</Text>
            <View style={styles.wrap}>
              {INTERESTS.map((i) => (
                <Chip key={i} label={i} selected={interests.includes(i)} onPress={() => setInterests((x) => toggle(x, i))} />
              ))}
            </View>
          </Card>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

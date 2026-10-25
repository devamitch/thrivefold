import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Toggle } from '../../../components/ui/Toggle';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** Whether new people can write to you. Synced to your server card; existing pen pals unaffected. */
export default function LetterPreferencesScreen() {
  const { colors, typography, spacing } = useTheme();
  const prefs = useRootStore((s) => s.letterPreferences);
  const setPrefs = useRootStore((s) => s.setLetterPreferences);

  return (
    <ScreenWrapper scrollable>
      <Header title="Letter settings" showBack />
      <Card style={{ padding: spacing.base }}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Accept letters from new people</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              When off, you don’t appear in Find a pen pal. People you already write with can still reply.
            </Text>
          </View>
          <Toggle
            value={prefs.acceptingLetters}
            onValueChange={(v) => setPrefs({ ...prefs, acceptingLetters: v })}
            accessibilityLabel="Accept letters from new people"
          />
        </View>
      </Card>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        Every letter arrives about 12 hours after it is sent. No location is used.
      </Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});

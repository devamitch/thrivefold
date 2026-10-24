import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function LetterProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const { user, setUser, showToast } = useRootStore(
    useShallow((s) => ({ user: s.user, setUser: s.setUser, showToast: s.showToast })),
  );

  const [pseudonym, setPseudonym] = useState(user?.pseudonym ?? 'SolsticeSeeker');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Mindful Habits', 'Literature & Poetry']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);

  const allInterests = ['Mindful Habits', 'Literature & Poetry', 'Nature & Hiking', 'Language Exchange', 'Tea & Quiet Living', 'Body and movement', 'Philosophy', 'Art & Photography'];
  const allLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Swedish', 'Hindi'];

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        pseudonym: pseudonym.trim() || user.pseudonym,
      });
    }
    showToast({ type: 'success', title: 'Profile Updated', message: 'Your pseudonymous card has been saved.' });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Letter profile" subtitle="The name others see on your letters" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 4 }]}>
            PSEUDONYM DISPLAY NAME
          </Text>
          <TextInput
            value={pseudonym}
            onChangeText={setPseudonym}
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />
        </Card>

        {/* Languages */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Languages You Write In
          </Text>
          <View style={styles.chipRow}>
            {allLanguages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected={selectedLanguages.includes(lang)}
                onPress={() => toggleLanguage(lang)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        {/* Interests */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Topic Interests (Used for Match Pacing)
          </Text>
          <View style={styles.chipRow}>
            {allInterests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onPress={() => toggleInterest(interest)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Button label="Save Changes" onPress={handleSave} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

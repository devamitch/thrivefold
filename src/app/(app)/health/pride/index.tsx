import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter, type Href } from 'expo-router';

import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Header } from '../../../../components/ui/Header';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { TextField } from '../../../../components/ui/TextField';
import { GuidedTimer } from '../../../../components/ui/GuidedTimer';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { BetaStudioEntries } from '../../../../components/beta/BetaStudioEntries';

/** LGBTQ+ wellbeing hub: private identity settings, care tracking, support and community. */
export default function PrideWellbeingScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { identity, setPrivateIdentity, showToast } = useRootStore(
    useShallow((s) => ({ identity: s.privateIdentity, setPrivateIdentity: s.setPrivateIdentity, showToast: s.showToast })),
  );
  const [editing, setEditing] = useState(false);
  const [pronouns, setPronouns] = useState(identity.pronouns);
  const [gender, setGender] = useState(identity.genderDescription);

  const saveIdentity = () => {
    setPrivateIdentity({ pronouns, genderDescription: gender });
    setEditing(false);
    showToast({ type: 'success', message: 'Saved privately on this device.' });
  };

  const section = (title: string, body: string, children: React.ReactNode) => (
    <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
      <Text style={[typography.subheading, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{body}</Text>
      <View style={{ marginTop: spacing.md }}>{children}</View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="LGBTQ+ wellbeing" subtitle="Affirming care, on your terms" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../../assets/illustrations/health-pride.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Affirming care, on your terms
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            Private identity notes, hormone reminders, grounding exercises and calm support spaces.
          </Text>
        </Card>
        {section(
          'Your identity',
          identity.pronouns || identity.genderDescription
            ? [identity.pronouns, identity.genderDescription].filter(Boolean).join(' · ')
            : 'Optional. Kept only on this device, never shown to anyone and never used to decide what you can access.',
          editing ? (
            <>
              <TextField label="Pronouns" value={pronouns} onChangeText={setPronouns} placeholder="e.g. they/them" maxLength={40} />
              <TextField label="Gender, in your words" value={gender} onChangeText={setGender} maxLength={80} containerStyle={{ marginTop: spacing.sm }} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md }}>
                <Button label="Save" size="sm" onPress={saveIdentity} />
                <Button label="Cancel" size="sm" variant="ghost" onPress={() => setEditing(false)} />
              </View>
            </>
          ) : (
            <Button label={identity.pronouns || identity.genderDescription ? 'Edit' : 'Add'} size="sm" variant="outline" onPress={() => setEditing(true)} style={{ alignSelf: 'flex-start' }} />
          ),
        )}

        {section(
          'Hormones and medications',
          'Track doses and times privately, and tick them off each day. Thrivefold never doses or changes a prescription.',
          <Link href={'/(app)/health/medications' as Href} asChild>
            <Button label="Open tracker" size="sm" variant="outline" style={{ alignSelf: 'flex-start' }} />
          </Link>,
        )}

        {section(
          'When things feel heavy',
          'A short grounding exercise, a private note, or immediate support options.',
          <>
            <GuidedTimer
              minutes={3}
              startLabel="3-minute grounding"
              cues={['Name 5 things you can see.', 'Name 4 things you can feel.', 'Name 3 things you can hear.', 'Take slow breaths, longer out than in.']}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm }}>
              <Link href={'/(app)/journal/new' as Href} asChild>
                <Button label="Write a private note" size="sm" variant="outline" />
              </Link>
              <Link href={'/(app)/safety/urgent-support' as Href} asChild>
                <Button label="Urgent support" size="sm" variant="ghost" />
              </Link>
            </View>
          </>,
        )}

        {section(
          'Quick exit',
          'Leaves this screen straight away and goes back to the main home screen.',
          <Button label="Exit now" size="sm" variant="outline" onPress={() => router.replace('/(app)/(tabs)')} style={{ alignSelf: 'flex-start' }} />,
        )}

        {section(
          'Everyday health',
          'Check-ins, sleep, movement, nutrition and your patterns.',
          <Link href={'/(app)/health' as Href} asChild>
            <Button label="Open health" size="sm" variant="outline" style={{ alignSelf: 'flex-start' }} />
          </Link>,
        )}

        {section(
          'Private community',
          'Peer support spaces open once communities are available to you; membership is never shown outside the group.',
          <Link href={'/(app)/circles' as Href} asChild>
            <Button label="Circles" size="sm" variant="outline" style={{ alignSelf: 'flex-start' }} />
          </Link>,
        )}
        <BetaStudioEntries section="wellbeing" />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});

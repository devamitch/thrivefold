import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, ScrollView, Linking, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

export default function UrgentSupportScreen() {
  const { colors, typography, spacing, experience } = useTheme();

  const helplines = [
    {
      country: 'India',
      service: 'Emergency (police, fire, ambulance)',
      number: '112',
      action: 'tel:112',
      hours: '24/7',
    },
    {
      country: 'India',
      service: 'Tele-MANAS mental health support (Government of India)',
      number: '14416',
      action: 'tel:14416',
      hours: '24/7 Free, many languages',
    },
    {
      country: 'United States & Canada',
      service: 'Suicide & Crisis Lifeline',
      number: '988',
      action: 'tel:988',
      hours: '24/7 Free & Confidential',
    },
    {
      country: 'United Kingdom',
      service: 'Samaritans Helpline',
      number: '116 123',
      action: 'tel:116123',
      hours: '24/7 Free & Confidential',
    },
    {
      country: 'European Union',
      service: 'European Emergency Number',
      number: '112',
      action: 'tel:112',
      hours: 'Immediate Emergency Response',
    },
    {
      country: 'International / Online',
      service: 'Befrienders Worldwide',
      number: 'befrienders.org',
      action: 'https://www.befrienders.org',
      hours: 'Global Crisis Directory',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Get help now" subtitle="Free, confidential help" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <BetaHero source={getSanctuaryIllustration('emergency', experience)} label="Support" />
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="heart" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              You Are Not Alone
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            If you or someone you know is in acute distress or experiencing thoughts of self-harm, please connect with a compassionate professional immediately. Thrivefold does not substitute emergency intervention.
          </Text>
          <Link href={'/(app)/safety/someone-to-talk' as Href} asChild>
            <Button
              label="Talk With Voice Support & Grounding"
              size="sm"
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
              icon={<Ionicons name="heart-circle" size={14} color={colors.onPrimary} />}
            />
          </Link>
        </Card>

        {helplines.map((hl) => (
          <Card key={hl.country} style={{ marginBottom: spacing.sm, padding: spacing.lg }}>
            <View style={styles.headerRow}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{hl.country}</Text>
              <Badge label={hl.hours} variant="primary" />
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {hl.service}
            </Text>
            <Text style={[typography.heading, { color: colors.primary, marginVertical: 6 }]}>
              {hl.number}
            </Text>
            <Button
              label={`Connect: ${hl.number}`}
              size="sm"
              style={{ marginTop: 6, alignSelf: 'flex-start' }}
              onPress={() => Linking.openURL(hl.action)}
            />
          </Card>
        ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

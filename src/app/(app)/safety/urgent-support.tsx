import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function UrgentSupportScreen() {
  const { colors, typography, spacing } = useTheme();

  const helplines = [
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
      country: 'India',
      service: 'KIRAN Mental Health Helpline',
      number: '1800-599-0019',
      action: 'tel:18005990019',
      hours: '24/7 Toll-Free Support',
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
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="heart" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              You Are Not Alone
            </Text>
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            If you or someone you know is in acute distress or experiencing thoughts of self-harm, please connect with a compassionate professional immediately. Thrivefold does not substitute emergency intervention.
          </Text>
        </Card>

        {helplines.map((hl) => (
          <Card key={hl.country} style={{ marginBottom: spacing.sm, padding: spacing.lg }}>
            <SquircleSurface style={styles.headerRow}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{hl.country}</Text>
              <Badge label={hl.hours} variant="primary" />
            </SquircleSurface>
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

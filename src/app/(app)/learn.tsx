import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';

export default function LearnScreen() {
  const { colors, typography, spacing } = useTheme();

  const articles = [
    {
      id: 'art_01',
      category: 'Reproductive Wellbeing',
      title: 'Understanding Hormonal Fluctuations & Daily Energy',
      summary: 'How estrogen and progesterone shift throughout the cycle, affecting metabolic rate and natural rest needs.',
      readTime: '4 min read',
    },
    {
      id: 'art_02',
      category: 'Physical Resilience',
      title: 'Pelvic-Floor Awareness & Spine Stabilization',
      summary: 'Dispelling myths around universal exercises: why relaxing hypertonic pelvic muscles is just as critical as strengthening.',
      readTime: '5 min read',
    },
    {
      id: 'art_03',
      category: 'Stress Regulation',
      title: 'Vagal Nerve Activation: The Science of Parasympathetic Breathing',
      summary: 'How 4-second inhales and 8-second slow exhales physically trigger heart rate variability recovery.',
      readTime: '3 min read',
    },
    {
      id: 'art_04',
      category: 'Men’s Health & Confidence',
      title: 'Workplace Decompression & Mindful Boundaries',
      summary: 'Practical cognitive habits to disengage from job stress without emotional reactivity or chronic fatigue.',
      readTime: '4 min read',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Learn" subtitle="Plain-language health basics" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            Non-Diagnostic Educational Portal
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            All guidance is reviewed for clinical safety. Thrivefold does not prescribe treatments or replace professional medical consultations.
          </Text>
        </Card>

        {articles.map((art) => (
          <Card key={art.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.cardHeader}>
              <Badge label={art.category} variant="primary" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>{art.readTime}</Text>
            </View>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xs }]}>
              {art.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
              {art.summary}
            </Text>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme/useTheme';

export default function ReproductiveHealthScreen() {
  const { colors, typography, spacing } = useTheme();

  const articles = [
    {
      id: 'rep_1',
      title: 'Hormonal Rhythms & Energy Cycles',
      category: 'Endocrinology Basics',
      summary: 'Understanding how natural estrogen, progesterone, and testosterone fluctuations influence daily stamina and cognitive focus.',
      readTime: '4 min read',
    },
    {
      id: 'rep_2',
      title: 'Fertility Awareness & Ovulation Variability',
      category: 'Reproductive Literacy',
      summary: 'Why calendar-only calculations have natural uncertainty windows, and how basal temperature and cervical fluid provide physiological context.',
      readTime: '6 min read',
    },
    {
      id: 'rep_3',
      title: 'Pelvic & Urinary Health Indicators',
      category: 'Clinical Care Signposting',
      summary: 'Distinguishing normal physical sensations from persistent dysuria, pelvic pressure, or pain that warrants qualified in-person evaluation.',
      readTime: '5 min read',
    },
    {
      id: 'rep_4',
      title: 'Perimenopause & Midlife Transitions',
      category: 'Life Stage Transitions',
      summary: 'Evidence-based strategies for sleep hygiene, vasomotor symptoms, bone mineral density maintenance, and cardiovascular care.',
      readTime: '7 min read',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Reproductive Health" subtitle="Evidence-Based Clinical Education" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Clinician Advisory Banner */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="medical-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              Non-Diagnostic Educational Library
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Thrivefold provides educational literacy and clinician care signposting. It does not replace individualized diagnosis, ultrasound, or blood biomarker testing.
          </Text>
        </Card>

        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Core Educational Guides
        </Text>

        {articles.map((art) => (
          <Card key={art.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.articleHeader}>
              <Badge label={art.category} variant="primary" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>{art.readTime}</Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              {art.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
              {art.summary}
            </Text>
            <Button
              label="Read Full Guide"
              variant="outline"
              size="sm"
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
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
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

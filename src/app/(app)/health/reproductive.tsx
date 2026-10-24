import React, { useState } from 'react';
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
  const [open, setOpen] = useState<string | null>(null);

  const articles = [
    {
      id: 'rep_1',
      body: 'Hormone levels change across the menstrual cycle, and many people notice differences in energy, sleep, appetite or mood at different points. These patterns vary a lot between people and from cycle to cycle, so your own records are a better guide than any general chart. Logging how you feel alongside your cycle can show your personal pattern over a few months. Sudden or severe changes in mood, energy or bleeding are worth discussing with a clinician.',
      title: 'Hormonal Rhythms & Energy Cycles',
      category: 'Endocrinology Basics',
      summary: 'Understanding how natural estrogen, progesterone, and testosterone fluctuations influence daily stamina and cognitive focus.',
      readTime: '4 min read',
    },
    {
      id: 'rep_2',
      body: 'Ovulation usually happens about 12 to 16 days before the next period, but the exact day shifts even in regular cycles. Calendar estimates are therefore ranges, not certainties. Basal body temperature and cervical fluid changes can add context but take training and consistent tracking. Calendar-based estimates are not a reliable method of contraception. If you are trying to conceive or avoid pregnancy, a clinician or family-planning service can explain methods and their failure rates.',
      title: 'Fertility Awareness & Ovulation Variability',
      category: 'Reproductive Literacy',
      summary: 'Why calendar-only calculations have natural uncertainty windows, and how basal temperature and cervical fluid provide physiological context.',
      readTime: '6 min read',
    },
    {
      id: 'rep_3',
      body: 'Some pelvic and urinary sensations come and go with the cycle or with activity. See a clinician if you have burning or pain when passing urine, blood in your urine, pelvic pain that is new, severe or persistent, unusual discharge, pain during sex, or leaking urine that affects daily life. Seek urgent care for severe pain with fever, fainting, or heavy bleeding. A pelvic health physiotherapist can help with pelvic floor problems.',
      title: 'Pelvic & Urinary Health Indicators',
      category: 'Clinical Care Signposting',
      summary: 'Distinguishing normal physical sensations from persistent dysuria, pelvic pressure, or pain that warrants qualified in-person evaluation.',
      readTime: '5 min read',
    },
    {
      id: 'rep_4',
      body: 'Perimenopause often starts in the 40s and can last several years. Periods may become irregular, and hot flushes, night sweats, sleep changes, mood changes and vaginal dryness are common. Regular movement, strength training and enough calcium and vitamin D support bone health; not smoking and a balanced diet support heart health. Treatments such as hormone therapy help many people, and a clinician can discuss benefits and risks for you. Bleeding after 12 months without a period should always be checked.',
      title: 'Perimenopause & Midlife Transitions',
      category: 'Life Stage Transitions',
      summary: 'Evidence-based strategies for sleep hygiene, vasomotor symptoms, bone mineral density maintenance, and cardiovascular care.',
      readTime: '7 min read',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Reproductive health" subtitle="Plain facts and when to see a clinician" showBack />
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
            {open === art.id ? (
              <Text style={[typography.body, { color: colors.text.primary, marginTop: 10 }]}>{art.body}</Text>
            ) : null}
            <Button
              label={open === art.id ? 'Show less' : 'Read guide'}
              variant="outline"
              size="sm"
              onPress={() => setOpen(open === art.id ? null : art.id)}
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

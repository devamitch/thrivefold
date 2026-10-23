import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { GuidedTimer } from '../../../components/ui/GuidedTimer';
import { useTheme } from '../../../theme/useTheme';

export default function PelvicFloorScreen() {
  const { colors, typography, spacing } = useTheme();
  const [activeTab, setActiveTab] = useState<'awareness' | 'exercises' | 'contraindications'>('awareness');

  return (
    <ScreenWrapper scrollable>
      <Header title="Pelvic-Floor Health" subtitle="Awareness, Mobility & Safe Practice" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Caution Banner (Section 4.1 & 4.2) */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              Clinical Caution: Not One-Size-Fits-All
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Do NOT prescribe Kegels to every person or every symptom. Hypertonic (overly tight) pelvic floor muscles require relaxation and diaphragmatic breathing, not repetitive contraction.
          </Text>
        </Card>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
          {(['awareness', 'exercises', 'contraindications'] as const).map((tab) => (
            <Button
              key={tab}
              label={tab === 'awareness' ? 'Awareness' : tab === 'exercises' ? 'Routines' : 'Caution Flags'}
              variant={activeTab === tab ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1 }}
            />
          ))}
        </View>

        {activeTab === 'awareness' && (
          <View>
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
                Diaphragmatic Breath & Pelvic Excursion
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
                The pelvic floor works in tandem with your thoracic diaphragm. Upon inhalation, the pelvic floor gently descends and relaxes; upon exhalation, it naturally recoils upward.
              </Text>
              <View style={[styles.stepBox, { backgroundColor: colors.surface1, marginTop: 12 }]}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>Quick 3-Minute Practice</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Place one hand on your lower belly. Inhale deeply through your nose for 4 seconds, allowing your ribs and perineum to expand gently without straining.
                </Text>
              </View>
            </Card>
          </View>
        )}

        {activeTab === 'exercises' && (
          <View>
            <Card style={{ marginBottom: spacing.md }}>
              <Badge label="Gentle Mobilization" variant="neutral" />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                Happy Baby / Supported Child's Pose
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
                Encourages gentle lengthening of the pubococcygeus and obturator internus muscles without intra-abdominal pressure.
              </Text>
              <GuidedTimer
                minutes={4}
                startLabel="Start 4-minute session"
                cues={['Settle into the position with support under you.', 'Breathe into your belly and let the pelvic floor soften.', 'Keep breathing slowly; no pushing or straining.', 'Ease out of the position gently.']}
              />
            </Card>

            <Card style={{ marginBottom: spacing.md }}>
              <Badge label="Gentle Engagement" variant="neutral" />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                Bridge Pose with Exhale Cue
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
                Subtle gluteal and hamstrings activation while maintaining neutral lumbar curvature and pelvic floor synchrony.
              </Text>
              <GuidedTimer
                minutes={5}
                startLabel="Start 5-minute session"
                cues={['Lie on your back, knees bent, feet flat.', 'Breathe out and lift your hips slowly.', 'Breathe in as you lower with control.', 'Rest a moment between lifts; stop if anything hurts.']}
              />
            </Card>
          </View>
        )}

        {activeTab === 'contraindications' && (
          <View>
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
                When to Pause & Seek a Pelvic Physical Therapist
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
                • Sharp stabbing pelvic, groin, or tailbone pain.{'\n'}
                • Burning during urination with no bacterial infection.{'\n'}
                • Inability to completely empty the bladder or bowel.{'\n'}
                • Pain during or following intimate intercourse.{'\n'}
                • Heavy pelvic organ prolapse sensation.
              </Text>
            </Card>
          </View>
        )}
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
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  stepBox: {
    padding: 12,
    borderRadius: 10,
  },
});

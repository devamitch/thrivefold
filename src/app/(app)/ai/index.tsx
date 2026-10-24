import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { checkInsUntilInsights, computeInsights, type Insight } from '../../../domain/ai/insights';
import { searchDocuments, type RetrievalDocument } from '../../../domain/ai/localRetrieval';
import { activeMemories } from '../../../domain/ai/types';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { totals } from '../../../domain/nutrition/foods';

const KIND_LABEL: Record<Insight['kind'], string> = {
  trend: 'This week',
  link: 'Connection',
  pattern: 'Weekly rhythm',
  symptom: 'Recurring',
  cycle: 'Cycle',
  consistency: 'Habit',
  activity: 'Activity',
};

/** Same date convention the check-in screen uses when it saves records. */
const todayKey = () => formatLocalDate(new Date());

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { checkInHistory, periodHistory, journalEntries, aiMemories, aiMemoryEnabled, addAiMemory, showToast, workoutSessions, activityLogs, mealLogs } =
    useRootStore(
      useShallow((s) => ({
        checkInHistory: s.checkInHistory,
        periodHistory: s.cycleData?.periodHistory,
        journalEntries: s.journalEntries,
        aiMemories: s.aiMemories,
        workoutSessions: s.workoutSessions,
        activityLogs: s.activityLogs,
        mealLogs: s.mealLogs,
        aiMemoryEnabled: s.aiMemoryEnabled,
        addAiMemory: s.addAiMemory,
        showToast: s.showToast,
      })),
    );

  const [query, setQuery] = useState('');
  const today = todayKey();

  const insights = useMemo(
    () =>
      computeInsights({
        checkIns: checkInHistory,
        periods: periodHistory ?? [],
        today,
        activeDates: [...workoutSessions.map((w) => w.date), ...activityLogs.map((a) => a.date)],
        proteinByDate: mealLogs.reduce<Record<string, number>>((acc, m) => {
          acc[m.date] = (acc[m.date] ?? 0) + totals(m.items).protein;
          return acc;
        }, {}),
      }),
    [checkInHistory, periodHistory, today, workoutSessions, activityLogs, mealLogs],
  );
  const daysToGo = useMemo(() => checkInsUntilInsights(checkInHistory, today), [checkInHistory, today]);

  const memories = useMemo(() => activeMemories(aiMemories), [aiMemories]);
  const keptRefs = useMemo(() => new Set(memories.map((m) => m.sourceRef).filter(Boolean)), [memories]);

  const documents = useMemo<RetrievalDocument[]>(
    () => [
      ...journalEntries.map((j) => ({
        id: j.id,
        kind: 'journal' as const,
        title: j.title,
        text: j.content,
        date: j.createdAt,
      })),
      // A paused vault is not used for anything, search included.
      ...(aiMemoryEnabled ? memories : []).map((m) => ({
        id: m.id,
        kind: 'memory' as const,
        title: '',
        text: m.content,
        date: m.createdAt,
      })),
    ],
    [journalEntries, memories, aiMemoryEnabled],
  );
  const hits = useMemo(() => searchDocuments(documents, query, 6), [documents, query]);

  const keep = (insight: Insight) => {
    if (!insight.memoryCandidate) return;
    addAiMemory({
      content: insight.memoryCandidate,
      category: 'pattern',
      source: 'insight',
      sourceRef: insight.id,
    });
    showToast({ type: 'success', title: 'Kept in your memory', message: 'Stored on this device for 90 days.' });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Your patterns" subtitle="Worked out on this phone from your own records" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        {/* Hero */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/intro-vault.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            On-Device Cryptographic Memory
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            All memories, journal retrieval vectors, and hormonal patterns are processed locally on your phone.
          </Text>
        </Card>

        {insights.length === 0 ? (
          <Card variant="surface1" style={{ padding: spacing.lg, marginBottom: spacing.md }}>
            <Ionicons name="analytics-outline" size={26} color={colors.text.muted} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.sm }]}>
              No patterns yet
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {daysToGo > 0
                ? `Patterns start appearing after ${daysToGo} more check-in ${daysToGo === 1 ? 'day' : 'days'}. Nothing is guessed before there is enough data.`
                : 'Your check-ins look steady so far. Patterns appear here when something clear shows up.'}
            </Text>
            <Button
              label="Check in now"
              size="sm"
              onPress={() => router.push('/(app)/check-in')}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
          </Card>
        ) : (
          insights.map((insight) => {
            const kept = keptRefs.has(insight.id);
            return (
              <Card key={insight.id} style={{ marginBottom: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Badge label={KIND_LABEL[insight.kind]} variant="neutral" />
                  <Badge
                    label={insight.strength === 'clear' ? 'Clear' : 'Emerging'}
                    variant={insight.strength === 'clear' ? 'success' : 'info'}
                  />
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.sm }]}>
                  {insight.title}
                </Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {insight.detail}
                </Text>
                {insight.suggestion ? (
                  <Text style={[typography.subbody, { color: colors.text.primary, marginTop: spacing.sm }]}>
                    {insight.suggestion}
                  </Text>
                ) : null}
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
                  {insight.evidence}
                </Text>
                {insight.memoryCandidate && aiMemoryEnabled ? (
                  <Button
                    label={kept ? 'Kept in memory' : 'Keep in memory'}
                    size="sm"
                    variant="outline"
                    disabled={kept}
                    icon={
                      <Ionicons
                        name={kept ? 'checkmark' : 'bookmark-outline'}
                        size={14}
                        color={kept ? colors.text.muted : colors.primary}
                      />
                    }
                    onPress={() => keep(insight)}
                    style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
                  />
                ) : null}
              </Card>
            );
          })
        )}

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>
          Search your notes
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
          Finds journal entries and kept memories on this device. Nothing is sent anywhere.
        </Text>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. sleep, back pain, work"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search your notes"
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
        />
        {query.trim().length > 0 && hits.length === 0 ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            {documents.length === 0
              ? 'You have no journal entries or memories yet.'
              : 'Nothing matches. Try a different word.'}
          </Text>
        ) : null}
        {hits.map((hit) => (
          <Card
            key={`${hit.doc.kind}_${hit.doc.id}`}
            onPress={
              hit.doc.kind === 'journal'
                ? () => router.push({ pathname: '/(app)/journal/[entryId]', params: { entryId: hit.doc.id } })
                : () => router.push('/(app)/ai/memory')
            }
            style={{ marginTop: spacing.sm }}
          >
            <View style={styles.rowBetween}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary, flex: 1 }]} numberOfLines={1}>
                {hit.doc.kind === 'journal' ? hit.doc.title || 'Journal entry' : 'Memory'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {new Date(hit.doc.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{hit.snippet}</Text>
          </Card>
        ))}

        <Card variant="surface1" style={{ marginTop: spacing.lg, padding: spacing.base }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>How this works</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Patterns come from simple statistics on your own check-ins and logged periods, and only appear once
            there is enough data. They describe your records; they are not medical advice or a diagnosis.
          </Text>
          <View style={styles.links}>
            <LinkRow label={`Memory (${memories.length})`} icon="bookmark-outline" onPress={() => router.push('/(app)/ai/memory')} />
            <LinkRow label="Privacy" icon="shield-checkmark-outline" onPress={() => router.push('/(app)/ai/privacy')} />
            <LinkRow label="What runs on this device" icon="hardware-chip-outline" onPress={() => router.push('/(app)/ai/model-status')} />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

function LinkRow({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.linkRow} hitSlop={4}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[typography.subbody, { color: colors.text.primary, flex: 1, marginLeft: 10 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  links: {
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});

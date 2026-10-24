import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { articlesFor } from '../../content/learn';
import { useTheme } from '../../theme/useTheme';

/** Plain-language health basics for the selected experience; tap an article to read it. */
export default function LearnScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const articles = articlesFor(experience);

  return (
    <ScreenContainer header={<AppHeader title="Learn" subtitle="Plain-language health basics" showBack />} scrollMode="shell-scroll-view">
      <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          General information based on public health guidance (NHS, WHO, CDC). Not medical advice and not a diagnosis.
        </Text>
      </Card>

      {articles.map((art) => {
        const expanded = open === art.id;
        return (
          <Card
            key={art.id}
            onPress={() => setOpen(expanded ? null : art.id)}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.cardHeader}>
              <Badge label={art.category} variant="primary" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>{art.minutes} min read</Text>
            </View>
            <View style={[styles.cardHeader, { marginTop: spacing.xs }]}>
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>{art.title}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.muted} />
            </View>
            {expanded ? (
              <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)}>
                {art.body.map((p) => (
                  <Text key={p.slice(0, 24)} style={[typography.body, { color: colors.text.secondary, marginTop: spacing.sm }]}>
                    {p}
                  </Text>
                ))}
                <Pressable
                  onPress={() => router.push(`/(app)/watch?${new URLSearchParams({ title: art.title, q: art.videoQuery }).toString()}` as Href)}
                  accessibilityRole="link"
                  style={[styles.cardHeader, { justifyContent: 'flex-start', marginTop: spacing.md }]}
                >
                  <Ionicons name="logo-youtube" size={16} color={colors.text.secondary} />
                  <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 6 }]}>Watch videos on this topic</Text>
                </Pressable>
                {art.seekHelp ? (
                  <View style={[styles.help, { backgroundColor: colors.warningSurface, marginTop: spacing.md }]}>
                    <Ionicons name="medkit-outline" size={18} color={colors.warning} />
                    <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>{art.seekHelp}</Text>
                  </View>
                ) : null}
              </Animated.View>
            ) : null}
          </Card>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  flex: { flex: 1 },
  help: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', padding: 12 },
});

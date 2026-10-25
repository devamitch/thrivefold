import { Ionicons } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { TextField } from '../../../components/ui/TextField';
import { Toggle } from '../../../components/ui/Toggle';
import {
  CATEGORY_LABELS,
  childrenOf,
  MAX_WORLDVIEWS,
  PREFER_NOT_TO_SAY,
  searchWorldviews,
  WORLDVIEWS,
  worldviewFullLabel,
  worldviewLabel,
  type WorldviewCategory,
} from '../../../domain/identity/worldview';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const BROWSE: WorldviewCategory[] = ['religion', 'indigenous', 'spiritual', 'secular', 'ideology', 'philosophy'];

/**
 * Beliefs and culture (V3 §6). Entirely optional, chosen by the person, kept on this phone.
 * Used only for the observance reminders they switch on and their own profile and export.
 */
export default function BeliefsScreen() {
  const { colors, typography, spacing } = useTheme();
  const locale = getLocales()[0]?.languageTag ?? 'en';
  const { saved, save, clear, showToast } = useRootStore(
    useShallow((s) => ({
      saved: s.worldviewProfile,
      save: s.setWorldviewProfile,
      clear: s.clearWorldviewProfile,
      showToast: s.showToast,
    })),
  );

  const [ids, setIds] = useState<string[]>(saved?.ids ?? []);
  const [own, setOwn] = useState(saved?.selfDescribed ?? '');
  const [reminders, setReminders] = useState(saved?.observanceReminders ?? false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<WorldviewCategory>('religion');
  const [expanded, setExpanded] = useState<string | null>(null);

  const preferNot = ids.includes(PREFER_NOT_TO_SAY);
  const results = useMemo(
    () => (query.trim() ? searchWorldviews(query, locale) : WORLDVIEWS.filter((w) => w.category === category && !w.parentId)),
    [query, category, locale],
  );

  const toggle = (id: string) =>
    setIds((cur) => {
      if (id === PREFER_NOT_TO_SAY) return cur.includes(id) ? [] : [id];
      const base = cur.filter((x) => x !== PREFER_NOT_TO_SAY);
      if (base.includes(id)) return base.filter((x) => x !== id);
      return base.length >= MAX_WORLDVIEWS ? base : [...base, id];
    });

  const dirty =
    JSON.stringify(ids) !== JSON.stringify(saved?.ids ?? []) ||
    (own.trim() || null) !== (saved?.selfDescribed ?? null) ||
    reminders !== (saved?.observanceReminders ?? false);

  const onSave = () => {
    if (ids.length === 0 && !own.trim()) {
      clear();
      showToast({ type: 'success', message: 'Cleared. Nothing is stored about your beliefs.' });
      return;
    }
    save({ ids, selfDescribed: own, observanceReminders: reminders });
    showToast({ type: 'success', message: 'Saved on this phone.' });
  };

  return (
    <ScreenWrapper scrollable footer={<Button label={dirty ? 'Save' : 'Saved'} onPress={onSave} disabled={!dirty} />}>
      <Header title="Beliefs and culture" subtitle="Optional. Only you choose this." showBack />
      <View>
        <Card variant="surface1" style={{ padding: spacing.base }}>
          {[
            ['phone-portrait-outline', 'Kept on this phone. Never sent to Thrivefold’s servers or analytics.'],
            ['eye-off-outline', 'Never guessed from your name, food, location or activity.'],
            ['lock-open-outline', 'Never used to decide what you can access, who you meet or what you see.'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.point}>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.primary} />
              <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>{text}</Text>
            </View>
          ))}
        </Card>

        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.lg }]}>
          Your choices {ids.length > 0 && !preferNot ? `(${ids.length}/${MAX_WORLDVIEWS})` : ''}
        </Text>
        <View style={[styles.wrap, { marginTop: spacing.sm }]}>
          {ids.length === 0 ? (
            <Text style={[typography.caption, { color: colors.text.muted }]}>Nothing chosen. That’s fine.</Text>
          ) : (
            ids.map((id) => (
              <Chip
                key={id}
                label={id === PREFER_NOT_TO_SAY ? 'Prefer not to say' : worldviewFullLabel(id, locale)}
                selected
                onPress={() => toggle(id)}
              />
            ))
          )}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <TextField value={query} onChangeText={setQuery} placeholder="Search, e.g. Sikh, Sunni, Parsi, humanist" />
        </View>

        {!query.trim() ? (
          <View style={[styles.wrap, { marginTop: spacing.sm }]}>
            {BROWSE.map((c) => (
              <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        ) : null}

        {category === 'ideology' && !query.trim() ? (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            Political and social worldviews are listed separately from religions.
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.sm, gap: 8 }}>
          {results.length === 0 ? (
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Not listed? Describe it in your own words below.
            </Text>
          ) : (
            results.map((w) => {
              const kids = childrenOf(w.id);
              const on = ids.includes(w.id);
              return (
                <Card key={w.id} style={{ padding: spacing.sm }}>
                  <View style={styles.row}>
                    <Text style={[typography.body, styles.flex, { color: colors.text.primary }]}>
                      {query.trim() ? worldviewFullLabel(w.id, locale) : worldviewLabel(w.id, locale)}
                    </Text>
                    {kids.length > 0 && !query.trim() ? (
                      <Button
                        label={expanded === w.id ? 'Hide' : `${kids.length} traditions`}
                        variant="ghost"
                        size="sm"
                        onPress={() => setExpanded(expanded === w.id ? null : w.id)}
                      />
                    ) : null}
                    <Button label={on ? 'Chosen' : 'Choose'} variant={on ? 'tinted' : 'secondary'} size="sm" onPress={() => toggle(w.id)} />
                  </View>
                  {expanded === w.id ? (
                    <View style={[styles.wrap, { marginTop: spacing.sm }]}>
                      {kids.map((k) => (
                        <Chip key={k.id} label={worldviewLabel(k.id, locale)} selected={ids.includes(k.id)} onPress={() => toggle(k.id)} />
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            })
          )}
        </View>

        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>In your own words</Text>
          <TextField value={own} onChangeText={setOwn} placeholder="Optional" maxLength={60} editable={!preferNot} />
          <View style={[styles.wrap, { marginTop: spacing.md }]}>
            <Chip label="Prefer not to say" selected={preferNot} onPress={() => toggle(PREFER_NOT_TO_SAY)} />
          </View>
        </Card>

        <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Observance reminders</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Fasting days, festivals and rest days for what you chose, in your calendar. Dates are approximate.
              </Text>
            </View>
            <Toggle value={reminders && !preferNot} onValueChange={setReminders} disabled={preferNot || ids.length === 0} accessibilityLabel="Observance reminders" />
          </View>
        </Card>

        {saved ? (
          <Button
            label="Clear everything here"
            variant="ghost"
            onPress={() => {
              clear();
              setIds([]);
              setOwn('');
              setReminders(false);
              showToast({ type: 'success', message: 'Cleared. Nothing is stored about your beliefs.' });
            }}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  point: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, paddingVertical: 5 },
});

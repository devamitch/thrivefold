import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function LetterPreferencesScreen() {
  const { colors, typography, spacing } = useTheme();

  const saved = useRootStore((s) => s.letterPreferences);
  const setLetterPreferences = useRootStore((s) => s.setLetterPreferences);
  const showToast = useRootStore((s) => s.showToast);
  const [acceptingLetters, setAcceptingLetters] = useState(saved.acceptingLetters);
  const [distanceBand, setDistanceBand] = useState(saved.distanceBand);
  const [deliveryPacing, setDeliveryPacing] = useState(saved.pacing);

  const distanceBands = ['Same Country Only', 'Same Continent', 'Worldwide (Any Distance)'];
  const pacingOptions = ['Realistic Postal (~1h per 200km)', 'Extra Slow (Reflection Mode)'];

  return (
    <ScreenWrapper scrollable>
      <Header title="Delivery preferences" subtitle="Pace, distance and boundaries" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <SquircleSurface style={styles.switchRow}>
            <SquircleSurface style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Accept New Letters & Introductions
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                When turned off, no new correspondents can find your card in discovery.
              </Text>
            </SquircleSurface>
            <Switch
              value={acceptingLetters}
              onValueChange={setAcceptingLetters}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </SquircleSurface>
        </Card>

        {/* Distance Band */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Geographic Distance Scope
          </Text>
          <SquircleSurface style={styles.chipRow}>
            {distanceBands.map((band) => (
              <Chip
                key={band}
                label={band}
                selected={distanceBand === band}
                onPress={() => setDistanceBand(band)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </SquircleSurface>
        </Card>

        {/* Pacing Speed */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Postal Transit Simulation Pacing
          </Text>
          <SquircleSurface style={styles.chipRow}>
            {pacingOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={deliveryPacing === opt}
                onPress={() => setDeliveryPacing(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </SquircleSurface>
        </Card>

        <Button
          label="Save preferences"
          onPress={() => {
            setLetterPreferences({ acceptingLetters, distanceBand, pacing: deliveryPacing });
            showToast({ type: 'success', message: 'Letter preferences saved on this device.' });
          }}
        />
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

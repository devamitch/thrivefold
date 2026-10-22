import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';

export default function LetterPreferencesScreen() {
  const { colors, typography, spacing } = useTheme();

  const [acceptingLetters, setAcceptingLetters] = useState(true);
  const [distanceBand, setDistanceBand] = useState('Worldwide (Any Distance)');
  const [deliveryPacing, setDeliveryPacing] = useState('Realistic Postal (~1h per 200km)');

  const distanceBands = ['Same Country Only', 'Same Continent', 'Worldwide (Any Distance)'];
  const pacingOptions = ['Realistic Postal (~1h per 200km)', 'Extra Slow (Reflection Mode)'];

  return (
    <ScreenWrapper scrollable>
      <Header title="Delivery Preferences" subtitle="Pacing, Distance Bands & Boundaries" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Accept New Letters & Introductions
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                When turned off, no new correspondents can find your card in discovery.
              </Text>
            </View>
            <Switch
              value={acceptingLetters}
              onValueChange={setAcceptingLetters}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        {/* Distance Band */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Geographic Distance Scope
          </Text>
          <View style={styles.chipRow}>
            {distanceBands.map((band) => (
              <Chip
                key={band}
                label={band}
                selected={distanceBand === band}
                onPress={() => setDistanceBand(band)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        {/* Pacing Speed */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Postal Transit Simulation Pacing
          </Text>
          <View style={styles.chipRow}>
            {pacingOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={deliveryPacing === opt}
                onPress={() => setDeliveryPacing(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Button label="Save Preferences" />
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

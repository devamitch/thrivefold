import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function MedicationsScreen() {
  const { colors, typography, spacing } = useTheme();

  const [reminders, setReminders] = useState([
    { id: 'rem_1', name: 'Vitamin D3 & K2 Drop', dosage: '2000 IU', time: '08:00 AM', taken: true },
    { id: 'rem_2', name: 'Magnesium Bisglycinate', dosage: '200 mg', time: '09:30 PM', taken: false },
    { id: 'rem_3', name: 'Hydration Electrolytes', dosage: '1 Packet', time: '12:00 PM', taken: true },
  ]);

  const toggleTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Medications & Supplements" subtitle="Local Reminder Schedules (Non-Prescriptive)" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Clinical Disclaimer Banner */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Tracking Only (Section 4.1 & 15.1)
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Thrivefold does NOT prescribe medications, iron, or supplements. This module is strictly a private, user-configured reminder schedule.
          </Text>
        </Card>

        <View style={styles.headerRow}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Daily Schedule</Text>
          <Button label="+ Add Reminder" variant="outline" size="sm" />
        </View>

        {reminders.map((rem) => (
          <Pressable key={rem.id} onPress={() => toggleTaken(rem.id)}>
            <Card style={{ marginTop: spacing.sm, borderColor: rem.taken ? colors.success : colors.border }}>
              <View style={styles.reminderRow}>
                <Ionicons
                  name={rem.taken ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={rem.taken ? colors.success : colors.text.muted}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, textDecorationLine: rem.taken ? 'line-through' : 'none' }]}>
                    {rem.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {rem.dosage} · {rem.time}
                  </Text>
                </View>
                <Badge label={rem.taken ? 'Completed' : 'Pending'} variant={rem.taken ? 'success' : 'neutral'} />
              </View>
            </Card>
          </Pressable>
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
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

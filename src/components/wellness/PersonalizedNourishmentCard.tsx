import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { CalendarEvent } from '../../domain/calendar/universalCalendarEngine';

export interface PersonalizedNourishmentCardProps {
  activeDiet: string | null;
  waterGlasses: number;
  onSetWaterGlasses: (glasses: number) => void;
  agendaEvents: CalendarEvent[];
  onToggleEvent: (event: CalendarEvent) => void;
  onViewNutrition: () => void;
}

export const PersonalizedNourishmentCard: React.FC<PersonalizedNourishmentCardProps> = ({
  activeDiet,
  waterGlasses,
  onSetWaterGlasses,
  agendaEvents,
  onToggleEvent,
  onViewNutrition,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      {/* Personalized Dietary Rhythm Card */}
      <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <SquircleSurface style={styles.rowBetween}>
          <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>
              PERSONALIZED NOURISHMENT
            </Text>
            <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
              {activeDiet ? `${activeDiet} Rhythm` : 'Balanced Whole Foods'}
            </Text>
          </SquircleSurface>
          <Badge label="Active Diet" variant="primary" />
        </SquircleSurface>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          {activeDiet
            ? `Recipes and daily meal guidance tailored to your ${activeDiet} onboarding choice.`
            : 'Whole food, nutrient-dense suggestions supporting hormone balance and steady energy.'}
        </Text>
        <Button
          label="View Full Nutrition Recipes"
          size="sm"
          variant="outline"
          onPress={onViewNutrition}
          style={{ marginTop: 12, alignSelf: 'flex-start' }}
        />
      </Card>

      {/* Hydration Tracker */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <SquircleSurface style={styles.rowBetween}>
          <SquircleSurface>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Cellular Hydration
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Target: 8 glasses daily (2.0L)
            </Text>
          </SquircleSurface>
          <Badge label={`${waterGlasses}/8 glasses`} variant="primary" />
        </SquircleSurface>
        <SquircleSurface style={[styles.waterRow, { marginTop: spacing.md }]}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
            <PressableScale
              key={g}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                onSetWaterGlasses(g);
              }}
              scaleTo={0.88}
              style={[
                styles.waterGlass,
                {
                  backgroundColor: g <= waterGlasses ? colors.primary : colors.surface1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Glass ${g} ${g <= waterGlasses ? 'Filled' : 'Empty'}`}
            >
              <Ionicons
                name="water"
                size={16}
                color={g <= waterGlasses ? colors.onPrimary : colors.text.muted}
              />
            </PressableScale>
          ))}
        </SquircleSurface>
      </Card>

      {/* Daily Precalculated Agenda Events */}
      <SquircleSurface style={{ marginTop: spacing.lg }}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Calculated Daily Schedule
        </Text>
        {agendaEvents.map((evt) => {
          const isDone = evt.status === 'completed';
          return (
            <Card
              key={evt.id}
              onPress={() => onToggleEvent(evt)}
              style={[
                styles.agendaCard,
                {
                  backgroundColor: isDone ? colors.surface1 : colors.surface,
                  opacity: isDone ? 0.75 : 1,
                  marginBottom: 8,
                },
              ]}
            >
              <SquircleSurface style={styles.agendaRow}>
                <PressableScale
                  onPress={() => onToggleEvent(evt)}
                  scaleTo={0.9}
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isDone ? colors.success : 'transparent',
                      borderColor: isDone ? colors.success : colors.text.muted,
                    },
                  ]}
                >
                  {isDone && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </PressableScale>

                <SquircleSurface style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[
                      typography.bodyBold,
                      {
                        color: colors.text.primary,
                        textDecorationLine: isDone ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {evt.title}
                  </Text>
                  {evt.description && (
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      {evt.description}
                    </Text>
                  )}
                </SquircleSurface>

                <Badge label={evt.kind.replace('_', ' ')} variant="neutral" />
              </SquircleSurface>
            </Card>
          );
        })}
      </SquircleSurface>
    </>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  waterGlass: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaCard: {
    padding: 12,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

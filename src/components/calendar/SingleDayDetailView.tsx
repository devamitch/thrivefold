import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PressableScale } from '../ui/PressableScale';
import {
  DayRangeInfo,
  formatLocalDate,
  parseLocalDate,
} from '../../domain/calendar/universalCalendarEngine';
import { PhaseConfig } from './SelectedDateOverviewCard';

export interface SingleDayDetailViewProps {
  selectedDateStr: string;
  selectedDateRangeInfo: DayRangeInfo;
  phaseConfig: PhaseConfig;
  isWomen: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onJumpToday: () => void;
}

export const SingleDayDetailView: React.FC<SingleDayDetailViewProps> = ({
  selectedDateStr,
  selectedDateRangeInfo,
  phaseConfig,
  isWomen,
  onPrevDay,
  onNextDay,
  onJumpToday,
}) => {
  const { colors, typography, spacing } = useTheme();

  const formattedDate = parseLocalDate(selectedDateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDateStr === formatLocalDate(new Date());

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      <SquircleSurface style={styles.calendarNavRow}>
        <PressableScale
          onPress={() => {
            try {
              Haptics.selectionAsync();
            } catch {}
            onPrevDay();
          }}
          scaleTo={0.9}
          style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
        </PressableScale>

        <SquircleSurface style={{ alignItems: 'center' }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {formattedDate}
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
            {isToday ? 'Today' : 'Single Day View'}
          </Text>
        </SquircleSurface>

        <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PressableScale
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              onJumpToday();
            }}
            scaleTo={0.93}
            style={[styles.todayJumpBtn, { backgroundColor: colors.surface1, marginRight: 6 }]}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              onNextDay();
            }}
            scaleTo={0.9}
            style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
            accessibilityRole="button"
            accessibilityLabel="Next day"
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
          </PressableScale>
        </SquircleSurface>
      </SquircleSurface>

      {/* Day Physiology / Rhythm Info */}
      {isWomen && (
        <SquircleSurface style={[styles.dayPhysiologyBox, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <SquircleSurface style={styles.rowBetween}>
            <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 8 }}>
              <SquircleSurface
                style={[
                  styles.phaseDot,
                  {
                    backgroundColor: selectedDateRangeInfo.isRecordedPeriod
                      ? '#DA7756'
                      : selectedDateRangeInfo.isOvulationPeak
                      ? '#E2B258'
                      : colors.primary,
                    marginRight: 8,
                  },
                ]}
              />
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {selectedDateRangeInfo.phaseLabel}
              </Text>
            </SquircleSurface>
            <Badge
              label={selectedDateRangeInfo.isFollicular && selectedDateRangeInfo.isRecordedPeriod ? 'Follicular Overlap' : phaseConfig.label}
              variant="neutral"
            />
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
            {phaseConfig.energyDesc} • {phaseConfig.description}
          </Text>
        </SquircleSurface>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayJumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dayPhysiologyBox: {
    padding: 14,
    borderRadius: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

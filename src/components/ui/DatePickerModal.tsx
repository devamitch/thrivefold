import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '../../services/haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatLocalDate, parseLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal, SheetFooterRow } from './AppBottomSheetModal';
import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
  minDate?: string;
  maxDate?: string;
  /** Start on the year grid (birthdays) instead of the month. */
  initialView?: 'day' | 'year';
}

type View3 = 'day' | 'month' | 'year';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const YEAR_ROW = 56;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const tick = () => hapticSelection();

/**
 * Gesture-driven bottom-sheet date picker with squircle geometry and tactile spring physics.
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  onChange,
  onClose,
  title = 'Choose a date',
  minDate,
  maxDate,
  initialView = 'day',
}) => {
  const { colors, typography, spacing } = useTheme();
  const start = value ? parseLocalDate(value) : new Date();
  const [year, setYear] = useState(start.getFullYear());
  const [month, setMonth] = useState(start.getMonth());
  const [selected, setSelected] = useState(value || formatLocalDate(new Date()));
  const [mode, setMode] = useState<View3>(initialView);
  const yearScroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) return;
    const d = value ? parseLocalDate(value) : new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(value || formatLocalDate(new Date()));
    setMode(initialView);
  }, [visible, value, initialView]);

  const minY = minDate ? Number(minDate.slice(0, 4)) : 1910;
  const maxY = maxDate ? Number(maxDate.slice(0, 4)) : new Date().getFullYear() + 25;
  const years = useMemo(() => {
    const out: number[] = [];
    for (let y = maxY; y >= minY; y--) out.push(y);
    return out;
  }, [minY, maxY]);

  const allowed = (d: string) => (!minDate || d >= minDate) && (!maxDate || d <= maxDate);
  const monthAllowed = (y: number, m: number) =>
    (!minDate || iso(y, m, new Date(y, m + 1, 0).getDate()) >= minDate) && (!maxDate || iso(y, m, 1) <= maxDate);

  const cells = useMemo(() => {
    const first = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const out: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= days; d++) out.push(d);
    while (out.length % 7) out.push(null);
    return out;
  }, [year, month]);

  const shift = (delta: number) => {
    tick();
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const canPrev = !minDate || iso(year, month, 1) > minDate;
  const canNext = !maxDate || iso(year, month, new Date(year, month + 1, 0).getDate()) < maxDate;

  const sel = parseLocalDate(selected);
  const headline = `${sel.getDate()} ${MONTHS[sel.getMonth()]} ${sel.getFullYear()}`;
  const today = formatLocalDate(new Date());

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={headline}
      subtitle={title}
      maxHeight="90%"
      contentContainerStyle={{ paddingBottom: 8 }}
      headerRight={
        selected !== today && allowed(today) ? (
          <PressableScale
            onPress={() => {
              tick();
              const t = parseLocalDate(today);
              setSelected(today);
              setYear(t.getFullYear());
              setMonth(t.getMonth());
              setMode('day');
            }}
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <SquircleSurface shape="pill" fill={colors.primaryAlpha} style={styles.todayChip}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
            </SquircleSurface>
          </PressableScale>
        ) : null
      }
      footer={
        <SheetFooterRow>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button label="Done" onPress={() => allowed(selected) && onChange(selected)} disabled={!allowed(selected)} />
        </SheetFooterRow>
      }
    >
      <View style={[styles.nav, { marginTop: spacing.xs }]}>
        <PressableScale
          onPress={() => {
            tick();
            setMode(mode === 'day' ? 'year' : 'day');
          }}
          scaleTo={0.96}
          accessibilityRole="button"
          accessibilityLabel={mode === 'day' ? `${MONTHS[month]} ${year}. Choose year and month` : 'Back to days'}
        >
          <SquircleSurface radius={14} fill={colors.surface1} style={styles.chip}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {mode === 'year' ? 'Choose a year' : mode === 'month' ? `${year}` : `${MONTHS[month]} ${year}`}
            </Text>
            <Ionicons name={mode === 'day' ? 'chevron-down' : 'chevron-up'} size={16} color={colors.text.secondary} />
          </SquircleSurface>
        </PressableScale>
        {mode === 'day' ? (
          <View style={styles.arrows}>
            <PressableScale onPress={() => shift(-1)} disabled={!canPrev} scaleTo={0.94} accessibilityRole="button" accessibilityLabel="Previous month">
              <SquircleSurface radius={12} fill={colors.surface1} style={[styles.arrow, { opacity: canPrev ? 1 : 0.35 }]}>
                <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
              </SquircleSurface>
            </PressableScale>
            <PressableScale onPress={() => shift(1)} disabled={!canNext} scaleTo={0.94} accessibilityRole="button" accessibilityLabel="Next month">
              <SquircleSurface radius={12} fill={colors.surface1} style={[styles.arrow, { opacity: canNext ? 1 : 0.35 }]}>
                <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
              </SquircleSurface>
            </PressableScale>
          </View>
        ) : null}
      </View>

      <View style={[styles.body, { marginTop: spacing.md }]}>
        {mode === 'year' ? (
          <ScrollView
            ref={yearScroll}
            showsVerticalScrollIndicator={false}
            onLayout={() => {
              const row = Math.floor(years.indexOf(year) / 4);
              yearScroll.current?.scrollTo({ y: Math.max(0, (row - 2) * YEAR_ROW), animated: false });
            }}
          >
            <View style={styles.grid}>
              {years.map((y) => {
                const on = y === year;
                return (
                  <PressableScale
                    key={y}
                    onPress={() => {
                      tick();
                      setYear(y);
                      setMode('month');
                    }}
                    scaleTo={0.94}
                    style={styles.yearCell}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <SquircleSurface radius={14} fill={on ? colors.primary : 'transparent'} style={styles.yearPill}>
                      <Text style={[typography.bodyBold, { color: on ? colors.onPrimary : colors.text.primary }]}>{y}</Text>
                    </SquircleSurface>
                  </PressableScale>
                );
              })}
            </View>
          </ScrollView>
        ) : mode === 'month' ? (
          <View style={styles.grid}>
            {MONTHS.map((m, i) => {
              const on = i === month;
              const ok = monthAllowed(year, i);
              return (
                <PressableScale
                  key={m}
                  disabled={!ok}
                  onPress={() => {
                    tick();
                    setMonth(i);
                    setMode('day');
                  }}
                  scaleTo={0.95}
                  style={styles.monthCell}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on, disabled: !ok }}
                >
                  <SquircleSurface radius={14} fill={on ? colors.primary : colors.surface1} style={[styles.monthPill, { opacity: ok ? 1 : 0.35 }]}>
                    <Text style={[typography.subbodyBold, { color: on ? colors.onPrimary : colors.text.primary }]}>{m.slice(0, 3)}</Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        ) : (
          <>
            <View style={styles.week}>
              {WEEKDAYS.map((d, i) => (
                <Text key={i} style={[typography.captionBold, styles.weekCell, { color: colors.text.muted }]}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((d, i) => {
                if (d === null) return <View key={`e${i}`} style={styles.dayCell} />;
                const ds = iso(year, month, d);
                const on = ds === selected;
                const ok = allowed(ds);
                return (
                  <PressableScale
                    key={ds}
                    disabled={!ok}
                    onPress={() => {
                      tick();
                      setSelected(ds);
                    }}
                    scaleTo={0.92}
                    style={styles.dayCell}
                    accessibilityRole="button"
                    accessibilityLabel={`${d} ${MONTHS[month]} ${year}`}
                    accessibilityState={{ selected: on, disabled: !ok }}
                  >
                    <SquircleSurface
                      shape="circle"
                      fill={on ? colors.primary : ds === today ? colors.primaryAlpha : 'transparent'}
                      style={styles.dayPill}
                    >
                      <Text
                        style={[
                          typography.subbodyBold,
                          { color: on ? colors.onPrimary : ok ? colors.text.primary : colors.text.muted, opacity: ok ? 1 : 0.45 },
                        ]}
                      >
                        {d}
                      </Text>
                    </SquircleSurface>
                  </PressableScale>
                );
              })}
            </View>
          </>
        )}
      </View>

    </AppBottomSheetModal>
  );
};

const styles = StyleSheet.create({
  todayChip: { alignItems: 'center', height: 32, justifyContent: 'center', paddingHorizontal: 14 },
  arrow: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  arrows: { flexDirection: 'row', gap: 8 },
  body: { height: 300 },
  chip: { alignItems: 'center', flexDirection: 'row', gap: 6, height: 40, paddingHorizontal: 14 },
  dayCell: { alignItems: 'center', height: 44, justifyContent: 'center', width: `${100 / 7}%` },
  dayPill: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { padding: 5, width: '33.333%' },
  monthPill: { alignItems: 'center', height: 64, justifyContent: 'center' },
  nav: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  week: { flexDirection: 'row' },
  weekCell: { textAlign: 'center', width: `${100 / 7}%` },
  yearCell: { height: YEAR_ROW, padding: 4, width: '25%' },
  yearPill: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});

export default DatePickerModal;

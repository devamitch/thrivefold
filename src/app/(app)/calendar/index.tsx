import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '../../../services/haptics';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, HeaderIconButton } from '../../../components/ui/AppHeader';
import { Chip } from '../../../components/ui/Chip';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { PersonalEventModal } from '../../../components/ui/PersonalEventModal';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import {
  formatLocalDate,
  generateDayAgenda,
  generateMonthGrid,
  parseLocalDate,
  type CalendarEvent,
} from '../../../domain/calendar/universalCalendarEngine';
import { useAgendaSources } from '../../../hooks/useAgendaSources';
import { routeForEvent } from '../../../navigation/eventRoutes';
import { useRootStore, useShallow, type PersonalCalendarEvent } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

type Mode = 'day' | 'week' | 'month' | 'year' | 'agenda';
const MODES: { id: Mode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'agenda', label: 'Agenda' },
];
const RANGES = [7, 30, 90] as const;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const addDays = (d: string, n: number) => {
  const x = parseLocalDate(d);
  x.setDate(x.getDate() + n);
  return formatLocalDate(x);
};
const mondayOf = (d: string) => addDays(d, -((parseLocalDate(d).getDay() + 6) % 7));
const longDay = (d: string) => parseLocalDate(d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
const shortDay = (d: string) => parseLocalDate(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const tick = () => hapticSelection();
/** Daily estimates that would drown out real records in longer views. */
const isBackground = (e: CalendarEvent) => e.kind === 'cycle_phase';
const weekOf = (d: string) => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(d), i));

type Tone = (e: CalendarEvent) => string;

/**
 * One calendar for everything the person has saved: quests, workouts, meals, check-ins,
 * periods (women's health only) and their own events. Every item opens its real record.
 */
export default function CalendarScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const { cycleData, personalEvents } = useRootStore(
    useShallow((s) => ({ cycleData: s.cycleData, personalEvents: s.personalEvents })),
  );
  const sources = useAgendaSources();
  const todayStr = formatLocalDate(new Date());

  const [mode, setMode] = useState<Mode>('month');
  const [selected, setSelected] = useState(todayStr);
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [picker, setPicker] = useState(false);
  const [editor, setEditor] = useState<{ date: string; event: PersonalCalendarEvent | null } | null>(null);

  // Day agendas are memoised per date until the underlying records change.
  const agendaFor = useMemo(() => {
    const cache = new Map<string, CalendarEvent[]>();
    return (d: string) => {
      let hit = cache.get(d);
      if (!hit) {
        hit = generateDayAgenda(d, { experience, cycleData, ...sources });
        cache.set(d, hit);
      }
      return hit;
    };
  }, [experience, cycleData, sources]);

  const tone: Tone = (e) =>
    e.kind === 'period'
      ? colors.error
      : e.kind === 'cycle_phase'
        ? colors.accent
        : e.category === 'fitness'
          ? colors.info
          : e.category === 'health'
            ? colors.success
            : e.category === 'routine'
              ? colors.primary
              : colors.warning;

  const open = (e: CalendarEvent) => {
    const id = e.metadata?.personalEventId;
    const personal = typeof id === 'string' ? personalEvents.find((p) => p.id === id) : undefined;
    if (personal) {
      setEditor({ date: e.date, event: personal });
      return;
    }
    const route = routeForEvent(e) ?? (e.kind === 'task' ? `/(app)/quests/${e.id}` : null);
    if (route) router.push(route as Href);
  };
  const add = () => setEditor({ date: selected, event: null });

  const sel = parseLocalDate(selected);
  const y = sel.getFullYear();
  const m = sel.getMonth();
  const step = (dir: 1 | -1) => {
    tick();
    if (mode === 'day') setSelected(addDays(selected, dir));
    else if (mode === 'week') setSelected(addDays(selected, 7 * dir));
    else if (mode === 'month') setSelected(formatLocalDate(new Date(y, m + dir, 1)));
    else if (mode === 'year') setSelected(formatLocalDate(new Date(y + dir, m, 1)));
    else setSelected(addDays(selected, range * dir));
  };
  const title =
    mode === 'day'
      ? longDay(selected)
      : mode === 'week'
        ? `Week of ${shortDay(mondayOf(selected))}`
        : mode === 'month'
          ? `${MONTHS[m]} ${y}`
          : mode === 'year'
            ? `${y}`
            : `${shortDay(selected)} – ${shortDay(addDays(selected, range - 1))}`;

  const week = weekOf(selected);
  const agendaDays =
    mode === 'agenda'
      ? Array.from({ length: range }, (_, i) => addDays(selected, i))
          .map((d) => ({ d, ev: agendaFor(d).filter((e) => !isBackground(e)) }))
          .filter((x) => x.ev.length > 0)
      : [];

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Calendar"
          subtitle={
            experience === 'women_health'
              ? 'Cycle, health and plans'
              : experience === 'men_health'
                ? 'Training, health and plans'
                : 'Care, health and plans'
          }
          showBack
          rightAction={<HeaderIconButton icon="add" label="Add an event" onPress={add} />}
        />
      }
      scrollMode="shell-scroll-view"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
        {MODES.map((v) => (
          <Chip key={v.id} label={v.label} selected={mode === v.id} onPress={() => setMode(v.id)} />
        ))}
      </ScrollView>

      <View style={[styles.nav, { marginTop: spacing.md }]}>
        <PressableScale
          onPress={() => setPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`${title}. Jump to a date`}
          style={styles.flex}
        >
          <Text style={[typography.subheading, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
        </PressableScale>
        {selected !== todayStr ? (
          <PressableScale onPress={() => setSelected(todayStr)} accessibilityRole="button" accessibilityLabel="Go to today">
            <SquircleSurface radius={12} fill={colors.primaryAlpha} style={styles.todayBtn}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
            </SquircleSurface>
          </PressableScale>
        ) : null}
        <Arrow icon="chevron-back" label="Previous" onPress={() => step(-1)} />
        <Arrow icon="chevron-forward" label="Next" onPress={() => step(1)} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        {mode === 'month' ? (
          <>
            <MonthGrid year={y} month={m} selected={selected} onSelect={setSelected} agendaFor={agendaFor} tone={tone} />
            <DayList date={selected} events={agendaFor(selected)} tone={tone} onOpen={open} onAdd={add} />
          </>
        ) : mode === 'week' ? (
          <>
            <WeekStrip days={week} selected={selected} onSelect={setSelected} agendaFor={agendaFor} tone={tone} />
            {week.some((d) => agendaFor(d).some((e) => !isBackground(e))) ? (
              week.map((d) => {
                const ev = agendaFor(d).filter((e) => !isBackground(e));
                return ev.length ? <DayList key={d} date={d} events={ev} tone={tone} onOpen={open} compact /> : null;
              })
            ) : (
              <Empty text="Nothing saved this week yet." action={{ label: 'Add an event', onPress: add }} />
            )}
          </>
        ) : mode === 'day' ? (
          <DayList date={selected} events={agendaFor(selected)} tone={tone} onOpen={open} onAdd={add} hideTitle />
        ) : mode === 'year' ? (
          <YearGrid
            year={y}
            agendaFor={agendaFor}
            onMonth={(mi) => {
              setSelected(formatLocalDate(new Date(y, mi, 1)));
              setMode('month');
            }}
          />
        ) : (
          <>
            <View style={styles.chips}>
              {RANGES.map((r) => (
                <Chip key={r} label={`${r} days`} selected={range === r} onPress={() => setRange(r)} />
              ))}
            </View>
            {agendaDays.length ? (
              agendaDays.map(({ d, ev }) => <DayList key={d} date={d} events={ev} tone={tone} onOpen={open} compact />)
            ) : (
              <View style={{ marginTop: spacing.md }}>
                <Empty text="Nothing saved in this range." />
              </View>
            )}
          </>
        )}
      </View>

      <Legend women={experience === 'women_health'} />

      <DatePickerModal
        visible={picker}
        value={selected}
        title="Jump to a date"
        onChange={(d) => {
          setSelected(d);
          setPicker(false);
        }}
        onClose={() => setPicker(false)}
      />
      <PersonalEventModal
        visible={editor !== null}
        initialDateStr={editor?.date ?? selected}
        existingEvent={editor?.event ?? null}
        onClose={() => setEditor(null)}
        onSaved={() => setEditor(null)}
      />
    </ScreenContainer>
  );
}

function Arrow({ icon, label, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <SquircleSurface radius={12} fill={colors.surface1} style={styles.arrow}>
        <Ionicons name={icon} size={18} color={colors.text.primary} />
      </SquircleSurface>
    </PressableScale>
  );
}

function Dots({ events, tone }: { events: CalendarEvent[]; tone: Tone }) {
  const shown = events.filter((e) => !isBackground(e) && e.kind !== 'holiday' && e.kind !== 'period').slice(0, 3);
  return (
    <View style={styles.dots}>
      {shown.map((e) => (
        <View key={e.id} style={[styles.dot, { backgroundColor: tone(e) }]} />
      ))}
    </View>
  );
}

function MonthGrid({
  year,
  month,
  selected,
  onSelect,
  agendaFor,
  tone,
}: {
  year: number;
  month: number;
  selected: string;
  onSelect: (d: string) => void;
  agendaFor: (d: string) => CalendarEvent[];
  tone: Tone;
}) {
  const { colors, typography } = useTheme();
  const cells = useMemo(() => generateMonthGrid(year, month), [year, month]);
  return (
    <SquircleSurface radius={22} fill={colors.surface} style={styles.gridCard}>
      <View style={styles.row7}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={[typography.captionBold, styles.cell7, styles.center, { color: colors.text.muted }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.row7}>
        {cells.map((c) => {
          const ev = agendaFor(c.date);
          const on = c.date === selected;
          const period = ev.find((e) => e.kind === 'period');
          const recorded = period && period.status !== 'predicted';
          const fill = on
            ? colors.primary
            : recorded
              ? colors.error
              : period
                ? colors.errorSurface
                : c.isToday
                  ? colors.primaryAlpha
                  : 'transparent';
          const ink = on || recorded ? colors.onPrimary : c.isToday ? colors.primary : colors.text.primary;
          return (
            <PressableScale
              key={c.date}
              onPress={() => {
                tick();
                onSelect(c.date);
              }}
              scaleTo={0.92}
              style={[styles.cell7, { opacity: c.isCurrentMonth ? 1 : 0.35 }]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${longDay(c.date)}, ${ev.filter((e) => !isBackground(e)).length} items`}
            >
              <SquircleSurface radius={12} fill={fill} style={styles.dayPill}>
                <Text style={[typography.subbodyBold, { color: ink }]}>{c.dayOfMonth}</Text>
              </SquircleSurface>
              <Dots events={ev} tone={tone} />
            </PressableScale>
          );
        })}
      </View>
    </SquircleSurface>
  );
}

function WeekStrip({
  days,
  selected,
  onSelect,
  agendaFor,
  tone,
}: {
  days: string[];
  selected: string;
  onSelect: (d: string) => void;
  agendaFor: (d: string) => CalendarEvent[];
  tone: Tone;
}) {
  const { colors, typography } = useTheme();
  const today = formatLocalDate(new Date());
  return (
    <View style={styles.row7}>
      {days.map((d, i) => {
        const on = d === selected;
        return (
          <PressableScale key={d} onPress={() => onSelect(d)} style={styles.cell7} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={longDay(d)}>
            <SquircleSurface radius={14} fill={on ? colors.primary : d === today ? colors.primaryAlpha : colors.surface} style={styles.weekPill}>
              <Text style={[typography.caption, { color: on ? colors.onPrimary : colors.text.muted }]}>{WEEKDAYS[i]}</Text>
              <Text style={[typography.bodyBold, { color: on ? colors.onPrimary : colors.text.primary }]}>{parseLocalDate(d).getDate()}</Text>
            </SquircleSurface>
            <Dots events={agendaFor(d)} tone={tone} />
          </PressableScale>
        );
      })}
    </View>
  );
}

function YearGrid({ year, agendaFor, onMonth }: { year: number; agendaFor: (d: string) => CalendarEvent[]; onMonth: (m: number) => void }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.yearGrid}>
      {MONTHS.map((name, mi) => (
        <PressableScale key={name} onPress={() => onMonth(mi)} style={styles.yearCell} accessibilityRole="button" accessibilityLabel={`${name} ${year}`}>
          <SquircleSurface radius={18} fill={colors.surface} style={styles.yearCard}>
            <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 4 }]}>{name.slice(0, 3)}</Text>
            <View style={styles.miniGrid}>
              {generateMonthGrid(year, mi).map((c) => {
                const ev = c.isCurrentMonth ? agendaFor(c.date).filter((e) => !isBackground(e) && e.kind !== 'holiday') : [];
                const period = ev.some((e) => e.kind === 'period' && e.status === 'recorded');
                const real = ev.some((e) => e.status !== 'predicted');
                return (
                  <View key={c.date} style={styles.miniCell}>
                    <View
                      style={[
                        styles.miniDot,
                        {
                          backgroundColor: !c.isCurrentMonth
                            ? 'transparent'
                            : period
                              ? colors.error
                              : real
                                ? colors.primary
                                : c.isToday
                                  ? colors.primaryAlpha
                                  : colors.surface2,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </SquircleSurface>
        </PressableScale>
      ))}
    </View>
  );
}

function DayList({
  date,
  events,
  tone,
  onOpen,
  onAdd,
  compact,
  hideTitle,
}: {
  date: string;
  events: CalendarEvent[];
  tone: Tone;
  onOpen: (e: CalendarEvent) => void;
  onAdd?: () => void;
  compact?: boolean;
  hideTitle?: boolean;
}) {
  const { colors, typography, spacing } = useTheme();
  const sorted = [...events].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  return (
    <View style={{ marginTop: compact ? spacing.md : spacing.lg }}>
      {hideTitle ? null : (
        <Text
          style={[
            compact ? typography.label : typography.subheading,
            { color: compact ? colors.text.muted : colors.text.primary, marginBottom: spacing.sm },
          ]}
        >
          {longDay(date)}
        </Text>
      )}
      {sorted.length === 0 ? (
        <Empty text="Nothing saved for this day." action={onAdd ? { label: 'Add an event', onPress: onAdd } : undefined} />
      ) : (
        sorted.map((e) => {
          const tappable = Boolean(e.metadata?.personalEventId || routeForEvent(e) || e.kind === 'task');
          const meta = [
            e.startTime ?? (e.isAllDay ? 'All day' : null),
            e.status === 'completed' ? 'Done' : e.status === 'predicted' ? 'Estimate' : null,
            e.description,
          ]
            .filter(Boolean)
            .join(' · ');
          const row = (
            <SquircleSurface radius={16} fill={colors.surface} style={styles.event}>
              <View style={[styles.bar, { backgroundColor: tone(e) }]} />
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={2}>
                  {e.title}
                </Text>
                {meta ? (
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                    {meta}
                  </Text>
                ) : null}
              </View>
              {tappable ? <Ionicons name="chevron-forward" size={16} color={colors.text.muted} /> : null}
            </SquircleSurface>
          );
          return tappable ? (
            <PressableScale key={e.id} onPress={() => onOpen(e)} accessibilityRole="button" accessibilityLabel={e.title}>
              {row}
            </PressableScale>
          ) : (
            <View key={e.id}>{row}</View>
          );
        })
      )}
    </View>
  );
}

function Empty({ text, action }: { text: string; action?: { label: string; onPress: () => void } }) {
  const { colors, typography } = useTheme();
  return (
    <SquircleSurface radius={16} fill={colors.surface1} style={styles.empty}>
      <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary }]}>{text}</Text>
      {action ? (
        <PressableScale onPress={action.onPress} accessibilityRole="button">
          <Text style={[typography.subbodyBold, { color: colors.primary }]}>{action.label}</Text>
        </PressableScale>
      ) : null}
    </SquircleSurface>
  );
}

function Legend({ women }: { women: boolean }) {
  const { colors, typography, spacing } = useTheme();
  const items: [string, string][] = [
    ['Quests', colors.primary],
    ['Workouts', colors.info],
    ['Meals and check-ins', colors.success],
    ['Your events', colors.warning],
    ...(women ? ([['Period', colors.error]] as [string, string][]) : []),
  ];
  return (
    <View style={[styles.legend, { marginTop: spacing.lg }]}>
      {items.map(([label, c]) => (
        <View key={label} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: c }]} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  bar: { alignSelf: 'stretch', borderRadius: 2, width: 4 },
  cell7: { alignItems: 'center', width: `${100 / 7}%` },
  center: { textAlign: 'center' },
  chipScroll: { flexGrow: 0 },
  chips: { flexDirection: 'row', gap: 8 },
  dayPill: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  dot: { borderRadius: 3, height: 6, width: 6 },
  dots: { flexDirection: 'row', gap: 3, height: 10, justifyContent: 'center', paddingTop: 3 },
  empty: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 16 },
  event: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  flex: { flex: 1 },
  gridCard: { padding: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  miniCell: { alignItems: 'center', height: 9, justifyContent: 'center', width: 9 },
  miniGrid: { alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 63 },
  miniDot: { borderRadius: 2, height: 7, width: 7 },
  nav: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  row7: { flexDirection: 'row', flexWrap: 'wrap' },
  todayBtn: { height: 38, justifyContent: 'center', paddingHorizontal: 12 },
  weekPill: { alignItems: 'center', gap: 2, paddingVertical: 8, width: '88%' },
  yearCard: { padding: 10 },
  yearCell: { padding: 4, width: '33.333%' },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
});

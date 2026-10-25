import { SquircleSurface } from '../ui/SquircleSurface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { getTaskById } from '../../domain/game/gameCatalogService';
import {
  describeReason,
  evaluateObjective,
  objectiveFormFor,
  type ObjectiveEvidence,
  type ObjectiveField,
} from '../../domain/game/objectives';
import { questFamily, type ReplacementOption } from '../../domain/game/progression';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { suggestPlans } from '../../domain/fitness/workouts';
import { fitFor } from '../../domain/game/setupProfile';
import { useRouter, type Href } from 'expo-router';
import { watchHref } from '../../content/exerciseVideos';
import { PressableScale } from '../ui/PressableScale';

type Answers = ObjectiveEvidence['answers'];

const FAMILY_LABEL = { movement: 'Movement', mind: 'Mind', rhythm: 'Rhythm', nutrition: 'Nutrition', growth: 'Growth' };

export interface QuestPanelProps {
  assignmentId: string;
  /** Called after a successful submission, a skip, or a replacement. */
  onDone?: (outcome: 'completed' | 'skipped' | 'replaced') => void;
  /** Called when the panel opens another screen (the sheet closes itself). */
  onLeave?: () => void;
}

/**
 * Runs one assigned quest: instructions, the catalog objective's evidence form, a real
 * in-app timer when the objective is timed, and skip / same-family replacement. Rewards are
 * granted only by the store after the objective's evaluator accepts the evidence.
 */
export function QuestPanel({ assignmentId, onDone, onLeave }: QuestPanelProps) {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { assignment, submitQuestEvidence, skipDailyTask, getReplacementOptions, acceptReplacement, showToast } =
    useRootStore(
      useShallow((s) => ({
        assignment: s.dailyAssignments.find((a) => a.assignmentId === assignmentId),
        submitQuestEvidence: s.submitQuestEvidence,
        skipDailyTask: s.skipDailyTask,
        getReplacementOptions: s.getReplacementOptions,
        acceptReplacement: s.acceptReplacement,
        showToast: s.showToast,
      })),
    );

  const task = assignment ? getTaskById(assignment.taskId) : undefined;
  const form = useMemo(() => (task ? objectiveFormFor(task) : null), [task]);

  const [answers, setAnswers] = useState<Answers>({});
  const [steps, setSteps] = useState<string[]>([]);
  const [safeStop, setSafeStop] = useState(false);
  const [attested, setAttested] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [replacing, setReplacing] = useState(false);
  const [options, setOptions] = useState<ReplacementOption[] | null>(null);

  // Real elapsed time: accumulated only while the timer is running.
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const banked = useRef(0);

  useEffect(() => {
    // Fresh state per assignment; date fields start at today, everything else empty.
    const initial: Answers = {};
    form?.fields.forEach((f) => {
      if (f.kind === 'date') initial[f.id] = formatLocalDate(new Date());
    });
    setAnswers(initial);
    setSteps([]);
    setSafeStop(false);
    setAttested(false);
    setErrors([]);
    setReplacing(false);
    setOptions(null);
    setRunning(false);
    setElapsed(0);
    startedAt.current = null;
    banked.current = 0;
  }, [assignmentId, form]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startedAt.current !== null) {
        setElapsed(banked.current + Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  const toggleTimer = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (running && startedAt.current !== null) {
      banked.current += Math.floor((Date.now() - startedAt.current) / 1000);
      startedAt.current = null;
      setElapsed(banked.current);
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  };

  if (!assignment || !task) {
    return (
      <Text style={[typography.subbody, { color: colors.text.secondary }]}>
        This quest is no longer in today&apos;s list.
      </Text>
    );
  }

  const done = assignment.status === 'verified' || assignment.status === 'self_reported';
  const closed = assignment.status === 'skipped' || assignment.status === 'replaced' || assignment.status === 'expired';

  /** Opens the camera coach with the plan that suits the person today. */
  const openCoach = () => {
    const st = useRootStore.getState();
    const day = formatLocalDate(new Date());
    const checkIn = st.checkInHistory.find((c) => c.date === day);
    const fit = fitFor(st.onboarding, checkIn ?? null);
    const pick = suggestPlans({
      capacity: fit.capacity,
      restDay: checkIn?.intensity === 'rest',
      constraints: st.onboarding.constraints,
      sessions: st.workoutSessions,
      today: day,
    })[0];
    onLeave?.();
    // The workout carries this assignment, so finishing it can complete exactly this quest.
    router.push(`/(app)/health/coach/${pick?.plan.id ?? 'desk_reset'}?assignmentId=${assignmentId}` as Href);
  };
  const minimum = form?.minimumElapsedSeconds ?? 0;

  const submit = () => {
    if (!form) return;
    const currentElapsed =
      banked.current + (running && startedAt.current !== null ? Math.floor((Date.now() - startedAt.current) / 1000) : 0);
    const evidence: ObjectiveEvidence = {
      answers,
      elapsedSeconds: currentElapsed,
      completedStepIds: steps,
      safeStop,
      attested,
    };
    // Show what is missing before anything is recorded.
    const local = evaluateObjective(form, evidence, task.instructions);
    if (local.length) {
      setErrors(local);
      return;
    }
    const result = submitQuestEvidence(assignmentId, evidence);
    if (result.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setRunning(false);
      showToast({
        type: 'success',
        title: result.status === 'verified' ? 'Quest verified' : 'Quest recorded',
        message: `+${result.earnedTaskPoints} points, +${result.earnedXp} XP`,
      });
      onDone?.('completed');
    } else {
      setErrors(result.reasonCodes);
    }
  };

  const startReplacing = () => {
    setOptions(getReplacementOptions(assignmentId));
    setReplacing(true);
  };

  const skipOnly = () => {
    if (skipDailyTask(assignmentId, 'Skipped for today')) {
      showToast({ type: 'info', message: 'Skipped. Nothing was added or taken away.' });
      onDone?.('skipped');
    }
  };

  const replaceWith = (option: ReplacementOption) => {
    if (acceptReplacement(assignmentId, option.task.id)) {
      showToast({ type: 'success', message: `Added "${option.task.title}" to today.` });
      onDone?.('replaced');
    } else {
      showToast({ type: 'warning', message: 'That replacement is no longer available.' });
      setOptions(getReplacementOptions(assignmentId));
    }
  };

  const setAnswer = (id: string, value: Answers[string]) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors([]);
  };

  return (
    <SquircleSurface>
      <SquircleSurface style={styles.metaRow}>
        <Badge label={FAMILY_LABEL[questFamily(task.category)]} variant="neutral" />
        <Text style={[typography.captionBold, { color: colors.text.secondary }]}>{task.estimatedDurationMinutes} min</Text>
        <Text style={[typography.captionBold, { color: colors.primary }]}>
          +{task.points.taskPoints} pts · +{task.points.xp} XP
        </Text>
      </SquircleSurface>

      {task.purpose ? (
        <>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: spacing.md }]}>WHY IT HELPS</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>{task.purpose}</Text>
        </>
      ) : null}

      {questFamily(task.category) === 'movement' && !done && !closed ? (
        <PressableScale
          onPress={openCoach}
          accessibilityRole="button"
          style={[styles.coach, { backgroundColor: colors.primary, marginTop: spacing.md }]}
        >
          <Ionicons name="videocam" size={20} color={colors.onPrimary} />
          <SquircleSurface style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>Do it with the camera coach</Text>
            <Text style={[typography.caption, { color: colors.onPrimary, opacity: 0.9 }]}>
              A short guided workout. Finishing it completes this quest; good form earns 10x workout XP.
            </Text>
          </SquircleSurface>
          <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
        </PressableScale>
      ) : null}

      {questFamily(task.category) === 'nutrition' && !done && !closed ? (
        <PressableScale
          onPress={() => {
            onLeave?.();
            router.push('/(app)/health/meal-log' as Href);
          }}
          accessibilityRole="button"
          style={[styles.coach, { backgroundColor: colors.primary, marginTop: spacing.md }]}
        >
          <Ionicons name="camera" size={20} color={colors.onPrimary} />
          <SquircleSurface style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>Log a meal with a photo</Text>
            <Text style={[typography.caption, { color: colors.onPrimary, opacity: 0.9 }]}>
              Snap your plate, pick the foods and see calories and protein. Logging a meal completes meal quests.
            </Text>
          </SquircleSurface>
          <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
        </PressableScale>
      ) : null}

      <PressableScale
        onPress={() => {
          onLeave?.();
          router.push(watchHref(task.title, undefined, task.id) as Href);
        }}
        accessibilityRole="link"
        style={[styles.metaRow, { marginTop: spacing.sm }]}
      >
        <Ionicons name="logo-youtube" size={16} color={colors.text.secondary} />
        <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 6 }]}>Watch how (video)</Text>
      </PressableScale>

      <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: spacing.md }]}>WHAT TO DO</Text>
      <SquircleSurface style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.xs }]}>
        {task.instructions.map((step, idx) => {
          const checked = steps.includes(step.id);
          const content = (
            <>
              {form?.requireSteps ? (
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checked ? colors.primary : colors.text.muted}
                />
              ) : (
                <SquircleSurface style={[styles.stepBadge, { backgroundColor: colors.primaryAlpha }]}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{idx + 1}</Text>
                </SquircleSurface>
              )}
              <Text style={[typography.subbody, { color: colors.text.primary, flex: 1, marginLeft: 10 }]}>{step.body}</Text>
            </>
          );
          return form?.requireSteps && !done && !closed ? (
            <PressableScale
              key={step.id}
              onPress={() => setSteps((s) => (checked ? s.filter((x) => x !== step.id) : [...s, step.id]))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={[styles.stepRow, idx > 0 && { marginTop: 10 }]}
            >
              {content}
            </PressableScale>
          ) : (
            <SquircleSurface key={step.id} style={[styles.stepRow, idx > 0 && { marginTop: 10 }]}>
              {content}
            </SquircleSurface>
          );
        })}
      </SquircleSurface>

      {task.safetyConstraints && task.safetyConstraints.length > 0 ? (
        <SquircleSurface style={[styles.box, { backgroundColor: colors.warningSurface, marginTop: spacing.sm }]}>
          {task.safetyConstraints.map((c) => (
            <Text key={c} style={[typography.caption, { color: colors.text.secondary }]}>
              {c}
            </Text>
          ))}
        </SquircleSurface>
      ) : null}

      {done ? (
        <SquircleSurface style={[styles.box, { backgroundColor: colors.successSurface, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }]}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
            {assignment.status === 'verified' ? 'Verified' : 'Recorded'}: +{assignment.earnedTaskPoints} points, +
            {assignment.earnedXp} XP
          </Text>
        </SquircleSurface>
      ) : closed ? (
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.md }]}>
          {assignment.status === 'replaced' ? 'Replaced with another quest today.' : 'Skipped for today.'}
        </Text>
      ) : !form ? (
        <>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.md }]}>
            This quest needs a feature that isn&apos;t available in this version, so it can&apos;t be completed here.
            Replace it with another quest instead.
          </Text>
          <Button label="Find a replacement" variant="outline" onPress={startReplacing} style={{ marginTop: spacing.sm }} />
        </>
      ) : replacing ? (
        <SquircleSurface style={{ marginTop: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Do something else instead</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Same kind of quest with a similar reward. Skipping alone earns nothing and loses nothing.
          </Text>
          {options && options.length === 0 ? (
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              There is no suitable replacement in the catalog right now.
            </Text>
          ) : null}
          {(options ?? []).map((o) => (
            <PressableScale
              key={o.task.id}
              onPress={() => replaceWith(o)}
              accessibilityRole="button"
              style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <SquircleSurface style={{ flex: 1 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{o.task.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {o.task.estimatedDurationMinutes} min · +{o.task.points.taskPoints} pts · +{o.task.points.xp} XP
                  {o.specialQuestTitle ? ` · ${o.specialQuestTitle}` : ''}
                </Text>
              </SquircleSurface>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </PressableScale>
          ))}
          <SquircleSurface style={[styles.row, { marginTop: spacing.sm }]}>
            <Button label="Just skip today" variant="ghost" size="sm" onPress={skipOnly} style={{ flex: 1 }} />
            <Button label="Back" variant="ghost" size="sm" onPress={() => setReplacing(false)} style={{ flex: 1 }} />
          </SquircleSurface>
        </SquircleSurface>
      ) : (
        <>
          {minimum > 0 ? (
            <SquircleSurface style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
              <Text style={[typography.display, { color: colors.text.primary, textAlign: 'center' }]}>
                {formatClock(elapsed)}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center' }]}>
                {elapsed >= minimum ? 'Time reached' : `At least ${formatClock(minimum)} needed`}
              </Text>
              <SquircleSurface style={[styles.track, { backgroundColor: colors.surface1 }]}>
                <SquircleSurface
                  style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.min(100, (elapsed / minimum) * 100)}%` }]}
                />
              </SquircleSurface>
              <Button
                label={running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start timer'}
                variant={running ? 'outline' : 'primary'}
                size="sm"
                onPress={toggleTimer}
                style={{ marginTop: 10 }}
              />
            </SquircleSurface>
          ) : null}

          {form.allowSafeStop ? (
            <CheckRow
              label="I stopped early because it didn't feel right"
              checked={safeStop}
              onToggle={() => setSafeStop((v) => !v)}
            />
          ) : null}

          {form.fields.map((field) => (
            <FieldInput key={field.id} field={field} value={answers[field.id]} onChange={(v) => setAnswer(field.id, v)} />
          ))}

          {form.requireAttestation ? (
            <CheckRow label="This is an honest record of what I did" checked={attested} onToggle={() => setAttested((v) => !v)} />
          ) : null}

          {errors.length > 0 ? (
            <SquircleSurface style={{ marginTop: spacing.sm }}>
              {errors.slice(0, 3).map((code) => (
                <Text key={code} style={[typography.caption, { color: colors.error }]}>
                  {describeReason(code, form)}
                </Text>
              ))}
            </SquircleSurface>
          ) : null}

          <Button label="Submit" onPress={submit} style={{ marginTop: spacing.md }} />
          <Button label="Skip or replace" variant="ghost" size="sm" onPress={startReplacing} style={{ marginTop: 6 }} />
        </>
      )}
    </SquircleSurface>
  );
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <PressableScale
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.checkRow, { backgroundColor: colors.surface, marginTop: spacing.sm }]}
    >
      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={checked ? colors.primary : colors.text.muted} />
      <Text style={[typography.subbody, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>{label}</Text>
    </PressableScale>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ObjectiveField;
  value: Answers[string];
  onChange: (v: Answers[string]) => void;
}) {
  const { colors, typography, spacing } = useTheme();
  const label = (
    <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 6 }]}>
      {field.label}
      {field.optional ? ' (optional)' : ''}
    </Text>
  );
  const inputStyle = [
    styles.input,
    typography.body,
    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text.primary },
  ];

  if (field.kind === 'consent') {
    return <CheckRow label={field.label} checked={value === true} onToggle={() => onChange(value !== true)} />;
  }

  return (
    <SquircleSurface style={{ marginTop: spacing.md }}>
      {label}
      {field.kind === 'rating' || field.kind === 'choice' ? (
        <SquircleSurface style={styles.chips}>
          {(field.kind === 'rating'
            ? Array.from({ length: (field.max ?? 5) - (field.min ?? 1) + 1 }, (_, i) => String((field.min ?? 1) + i))
            : field.options ?? []
          ).map((opt) => {
            const v = field.kind === 'rating' ? Number(opt) : opt;
            return (
              <Chip
                key={opt}
                label={field.kind === 'choice' ? opt.replace(/_/g, ' ') : opt}
                selected={value === v}
                onPress={() => onChange(v)}
              />
            );
          })}
        </SquircleSurface>
      ) : field.kind === 'number' ? (
        <TextInput
          value={typeof value === 'number' ? String(value) : ''}
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
            onChange(Number.isFinite(n) ? n : undefined);
          }}
          keyboardType="number-pad"
          placeholder={field.unit ? `${field.min ?? 0}-${field.max ?? ''} ${field.unit}` : undefined}
          placeholderTextColor={colors.text.muted}
          accessibilityLabel={field.label}
          style={inputStyle}
        />
      ) : (
        <TextInput
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          multiline={field.kind === 'longtext' || field.kind === 'lines'}
          placeholder={field.kind === 'date' ? 'YYYY-MM-DD' : field.kind === 'lines' ? 'One per line' : undefined}
          placeholderTextColor={colors.text.muted}
          accessibilityLabel={field.label}
          autoCorrect={field.kind !== 'date'}
          style={[inputStyle, (field.kind === 'longtext' || field.kind === 'lines') && styles.multiline]}
        />
      )}
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  row: { flexDirection: 'row', gap: 8 },
  coach: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', padding: 14 },
  box: { padding: 14, borderRadius: 16, borderColor: 'transparent' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 24 },
  stepBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  track: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 3 },
  checkRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, minHeight: 48 },
  input: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, minHeight: 48 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    minHeight: 56,
  },
});

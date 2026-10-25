import { SquircleSurface } from '@/components/ui';
import React, { useEffect, useMemo, useState } from 'react';


import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { QuestsSection } from '../../../components/game/QuestsSection';
import { QuestSheet } from '../../../components/game/QuestSheet';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { currentLevelProgress } from '../../../domain/game/gameCatalogService';

/** Today's quest board: level, points toward the daily goal and the day's quests. */
export default function QuestsScreen() {
  const s = useRootStore(
    useShallow((st) => ({
      xp: st.xp,
      diamonds: st.diamonds,
      streak: st.streak,
      dailyPoints: st.dailyPoints,
      dailyPointsTarget: st.dailyPointsTarget,
      dailyGoalReached: st.dailyGoalReached,
      todayQuests: st.todayQuests,
      completedCheckpoints: st.completedCheckpoints,
      ensureDailyQuests: st.ensureDailyQuests,
    })),
  );
  const [open, setOpen] = useState<string | null>(null);
  const progress = useMemo(() => currentLevelProgress(s.xp, s.completedCheckpoints), [s.xp, s.completedCheckpoints]);

  const { ensureDailyQuests } = s;
  useEffect(() => {
    ensureDailyQuests();
  }, [ensureDailyQuests]);

  return (
    <ScreenContainer header={<AppHeader title="Quests" subtitle="Today's quests and your level" showBack />} scrollMode="shell-scroll-view">
      <SquircleSurface>
        <QuestsSection
          progress={progress}
          xp={s.xp}
          diamonds={s.diamonds}
          streak={s.streak}
          dailyPoints={s.dailyPoints}
          dailyPointsTarget={s.dailyPointsTarget}
          dailyGoalReached={s.dailyGoalReached}
          todayQuests={s.todayQuests}
          onOpenQuest={setOpen}
        />
      </SquircleSurface>
      <QuestSheet assignmentId={open} onClose={() => setOpen(null)} />
    </ScreenContainer>
  );
}

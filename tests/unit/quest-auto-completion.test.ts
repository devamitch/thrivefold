jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  })),
}));

import { useRootStore } from '../../src/stores/useRootStore';
import { formatLocalDate } from '../../src/domain/calendar/universalCalendarEngine';

describe('Gaming Engine - Quest Auto-Completion & Health Integration', () => {
  const today = formatLocalDate(new Date());

  beforeEach(() => {
    // Reset store state
    useRootStore.setState({
      rewardLedger: [],
      dailyAssignments: [],
      xp: 0,
      level: 1,
      diamonds: 0,
      todayQuests: [],
      checkInHistory: [],
    });
  });

  it('completes an assigned check-in quest and awards ledger entry', () => {
    const store = useRootStore.getState();

    // Setup an assigned checkin task
    useRootStore.setState({
      dailyAssignments: [
        {
          assignmentId: 'asg_chk_1',
          taskId: 'emotion_label_checkin',
          assignedDate: today,
          status: 'assigned',
          isSpecialQuestReplacement: false,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
        },
      ],
    });

    const res = store.completeCheckInQuest(8, 'Feeling energized this morning');
    expect(res).not.toBeNull();
    expect(res?.xp).toBe(0); // Zero-XP by catalog design: private tracking is not incentivized

    const updated = useRootStore.getState();
    const asg = updated.dailyAssignments.find((a) => a.assignmentId === 'asg_chk_1');
    expect(asg?.status).toBe('verified');
    expect(updated.rewardLedger.length).toBe(1);
    expect(updated.rewardLedger[0].kind).toBe('task_reward');
  });

  it('completes an assigned sleep quest with sleep hours and rating', () => {
    const store = useRootStore.getState();

    useRootStore.setState({
      dailyAssignments: [
        {
          assignmentId: 'asg_sleep_1',
          taskId: 'sleep_log',
          assignedDate: today,
          status: 'assigned',
          isSpecialQuestReplacement: false,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
        },
      ],
    });

    const res = store.completeSleepQuest(7.5, 4);
    expect(res).not.toBeNull();
    expect(res?.xp).toBe(0); // Zero-XP by catalog design
    const asg = useRootStore.getState().dailyAssignments.find((a) => a.assignmentId === 'asg_sleep_1');
    expect(asg?.status).toBe('self_reported');
  });

  it('completes an assigned symptom quest when user records symptoms', () => {
    const store = useRootStore.getState();

    useRootStore.setState({
      dailyAssignments: [
        {
          assignmentId: 'asg_symp_1',
          taskId: 'symptom_log',
          assignedDate: today,
          status: 'assigned',
          isSpecialQuestReplacement: false,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
        },
      ],
    });

    const res = store.completeSymptomQuest('Headache', today);
    expect(res).not.toBeNull();
    expect(res?.xp).toBe(0); // Zero-XP by catalog design
    const asg = useRootStore.getState().dailyAssignments.find((a) => a.assignmentId === 'asg_symp_1');
    expect(asg?.status).toBe('self_reported');
  });

  it('healthSlice addCheckIn automatically invokes quest auto-completion', () => {
    const store = useRootStore.getState();

    useRootStore.setState({
      dailyAssignments: [
        {
          assignmentId: 'asg_chk_auto',
          taskId: 'emotion_label_checkin',
          assignedDate: today,
          status: 'assigned',
          isSpecialQuestReplacement: false,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
        },
      ],
    });

    store.addCheckIn({
      date: today,
      energy: 8,
      mood: 9,
      stress: 2,
      sleepHours: 8,
      symptoms: ['Mild tension'],
      notes: 'Great restful night and clear morning.',
    });

    const updated = useRootStore.getState();
    expect(updated.checkInHistory.length).toBe(1);
    expect(updated.checkInHistory[0].date).toBe(today);
  });

  it('addWaterLog adds timestamped record and updates daily hydration glasses', () => {
    const store = useRootStore.getState();
    useRootStore.setState({ hydration: {}, waterLogs: [] });

    store.addWaterLog(500, today);
    let state = useRootStore.getState();
    expect(state.hydration[today]).toBe(2);
    expect(state.waterLogs.length).toBe(1);
    expect(state.waterLogs[0].milliliters).toBe(500);
    expect(state.waterLogs[0].glasses).toBe(2);

    store.addWaterLog(250, today);
    state = useRootStore.getState();
    expect(state.hydration[today]).toBe(3);
    expect(state.waterLogs.length).toBe(2);
  });

  it('undoWaterLog safely reverts the most recent water intake log', () => {
    const store = useRootStore.getState();
    useRootStore.setState({ hydration: {}, waterLogs: [] });

    store.addWaterLog(500, today);
    store.addWaterLog(250, today);
    expect(useRootStore.getState().hydration[today]).toBe(3);

    store.undoWaterLog(today);
    const state = useRootStore.getState();
    expect(state.hydration[today]).toBe(2);
    expect(state.waterLogs.length).toBe(1);
  });

  it('setHydrationTargetGlasses updates and clamps personal water goal', () => {
    const store = useRootStore.getState();
    store.setHydrationTargetGlasses(10);
    expect(useRootStore.getState().hydrationTargetGlasses).toBe(10);

    store.setHydrationTargetGlasses(2);
    expect(useRootStore.getState().hydrationTargetGlasses).toBe(4);

    store.setHydrationTargetGlasses(25);
    expect(useRootStore.getState().hydrationTargetGlasses).toBe(16);
  });
});


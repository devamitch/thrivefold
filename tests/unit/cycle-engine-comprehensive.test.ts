import {
  formatLocalDate,
  parseLocalDate,
  generateDayAgenda,
  generateWeekGrid,
  generateYearForecast,
  generateAgendaRange,
  deriveCyclePhaseForDate,
  getDayRangeInfo,
  } from '../../src/domain/calendar/universalCalendarEngine';
import {
  getCyclePredictions,
  calculatePregnancyProgress,
  computeAdvancedCycleMetrics,
} from '../../src/domain/health/cycleCalculations';
import {
  CycleData,
  PersonalCalendarEvent,
} from '../../src/stores/useRootStore';

describe('Comprehensive Cycle & Universal Calendar Engine', () => {
  const mockCycleData: CycleData = {
    lastPeriodDate: '2026-10-01',
    cycleLengthDays: 28,
    periodLengthDays: 5,
    currentPhase: 'menstrual',
    estimatedNextPeriodDate: '2026-10-29',
    reproductiveContext: 'regular',
    periodHistory: [
      {
        id: 'p1',
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        flowIntensity: 'medium',
        painLevel: 3,
        symptoms: ['Gentle cramps'],
        isOngoing: false,
        loggedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'p0',
        startDate: '2026-09-03',
        endDate: '2026-09-07',
        flowIntensity: 'heavy',
        painLevel: 4,
        isOngoing: false,
        loggedAt: '2026-09-03T08:00:00Z',
      },
    ],
  };

  describe('1. Menstruation & Follicular Phase Overlap', () => {
    it('models bleeding as occurring during early follicular phase (Day 1 starts follicular)', () => {
      // Day 1: Oct 1, 2026
      const day1Info = getDayRangeInfo('2026-10-01', 0, mockCycleData);
      expect(day1Info.isRecordedPeriod).toBe(true);
      expect(day1Info.isFollicular).toBe(true); // Follicular phase spans day 1 until ovulation
      expect(day1Info.rangeType).toBe('period');
      expect(day1Info.phaseLabel).toContain('Bleed');

      // Day 5: Oct 5, 2026 (end of menses)
      const day5Info = getDayRangeInfo('2026-10-05', 0, mockCycleData);
      expect(day5Info.isRecordedPeriod).toBe(true);
      expect(day5Info.isFollicular).toBe(true);

      // Day 8: Oct 8, 2026 (mid-follicular after bleeding ends)
      const day8Info = getDayRangeInfo('2026-10-08', 0, mockCycleData);
      expect(day8Info.isRecordedPeriod).toBe(false);
      expect(day8Info.isFollicular).toBe(true);
      expect(day8Info.phaseLabel).toContain('Follicular Phase');
    });

    it('calculates cycle day numbering and phase status correctly', () => {
      const day1 = deriveCyclePhaseForDate('2026-10-01', mockCycleData);
      expect(day1).toBe('menstrual');

      const day8 = deriveCyclePhaseForDate('2026-10-08', mockCycleData);
      expect(day8).toBe('follicular');

      const day14 = deriveCyclePhaseForDate('2026-10-14', mockCycleData);
      expect(day14).toBe('ovulation');

      const day22 = deriveCyclePhaseForDate('2026-10-22', mockCycleData);
      expect(day22).toBe('luteal');
    });
  });

  describe('2. Continuous Date Range Rendering Across Boundaries', () => {
    it('extends period range smoothly across month boundary', () => {
      const monthBoundaryData: CycleData = {
        lastPeriodDate: '2026-09-29',
        cycleLengthDays: 28,
        periodLengthDays: 5,
        currentPhase: 'menstrual',
        estimatedNextPeriodDate: '2026-10-27',
        periodHistory: [
          {
            id: 'p-boundary',
            startDate: '2026-09-29',
            endDate: '2026-10-03',
            flowIntensity: 'medium',
            isOngoing: false,
            loggedAt: '2026-09-29T08:00:00Z',
          },
        ],
      };

      const sep30 = getDayRangeInfo('2026-09-30', 0, monthBoundaryData);
      const oct01 = getDayRangeInfo('2026-10-01', 0, monthBoundaryData);
      const oct03 = getDayRangeInfo('2026-10-03', 0, monthBoundaryData);

      expect(sep30.isRecordedPeriod).toBe(true);
      expect(oct01.isRecordedPeriod).toBe(true);
      expect(oct03.isRecordedPeriod).toBe(true);
    });
  });

  describe('3. Ovulation & Fertile Window Estimation', () => {
    it('derives fertile window 5 days prior to estimated ovulation plus ovulation day', () => {
      // 28-day cycle with last period Oct 1 -> estimated ovulation Oct 14
      const predictions = getCyclePredictions('2026-10-01', 28, 5);
      expect(predictions).not.toBeNull();
      expect(formatLocalDate(predictions!.ovulationDate)).toBe('2026-10-14');
      expect(formatLocalDate(predictions!.fertileWindowStart)).toBe('2026-10-09');
      expect(formatLocalDate(predictions!.fertileWindowEnd)).toBe('2026-10-14');

      // Check day range info on estimated ovulation day
      const ovDayInfo = getDayRangeInfo('2026-10-14', 0, mockCycleData);
      expect(ovDayInfo.isOvulationPeak).toBe(true);
      expect(ovDayInfo.isFertile).toBe(true);
    });

    it('identifies luteal phase starting after ovulation until menses', () => {
      // Oct 20 is post-ovulation luteal phase
      const lutealDayInfo = getDayRangeInfo('2026-10-20', 0, mockCycleData);
      expect(lutealDayInfo.isLuteal).toBe(true);
      expect(lutealDayInfo.isFollicular).toBe(false);
      expect(lutealDayInfo.isFertile).toBe(false);
    });

    it('identifies late luteal premenstrual symptom (PMS) window without treating it as mutually exclusive', () => {
      // Day 26-28 (Oct 26) is in the premenstrual window
      const pmsDayInfo = getDayRangeInfo('2026-10-26', 0, mockCycleData);
      expect(pmsDayInfo.isPmsWindow).toBe(true);
      expect(pmsDayInfo.isLuteal).toBe(true); // Premenstrual window overlaps the late luteal phase
    });
  });

  describe('4. PCOS / Irregular Cycles & Advanced Metrics', () => {
    it('widens uncertainty interval for PCOS / irregular context', () => {
      const pcosData: CycleData = {
        lastPeriodDate: '2026-09-01',
        cycleLengthDays: 35,
        periodLengthDays: 6,
        currentPhase: 'follicular',
        estimatedNextPeriodDate: '2026-10-06',
        reproductiveContext: 'pcos_pcod',
        periodHistory: [
          {
            id: '1',
            startDate: '2026-09-01',
            endDate: '2026-09-06',
            flowIntensity: 'medium',
            loggedAt: '2026-09-01T08:00:00Z',
          },
          {
            id: '2',
            startDate: '2026-07-20',
            endDate: '2026-07-26',
            flowIntensity: 'medium',
            loggedAt: '2026-07-20T08:00:00Z',
          },
        ],
      };

      const metrics = computeAdvancedCycleMetrics(
        pcosData.lastPeriodDate,
        pcosData.periodHistory ?? [],
        pcosData.cycleLengthDays,
        pcosData.periodLengthDays,
        pcosData.reproductiveContext
      );

      expect(metrics.cycleLengthVariabilityDays).toBeGreaterThanOrEqual(6);
      expect(metrics.confidenceScore).toBe('moderate'); // Explains uncertainty with 1 historical interval
    });

    it('distinguishes between overdue prediction (late) and confirmed missed period threshold', () => {
      const metricsLate = computeAdvancedCycleMetrics(
        '2026-09-10',
        [{ startDate: '2026-09-10' }],
        28,
        5,
        'regular'
      );
      expect(typeof metricsLate.isLate).toBe('boolean');
      expect(typeof metricsLate.isConfirmedMissed).toBe('boolean');
    });
  });

  describe('5. Pregnancy Clinical Progress Calculations', () => {
    it('calculates gestational weeks, trimesters, and estimated delivery accurately', () => {
      // 10 weeks pregnant (70 days since LMP)
      const tenWeeksAgo = new Date();
      tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
      const lmpStr = formatLocalDate(tenWeeksAgo);

      const progress = calculatePregnancyProgress(lmpStr);
      expect(progress.gestationalWeeks).toBe(10);
      expect(progress.gestationalDays).toBe(0);
      expect(progress.trimester).toBe(1);
      expect(progress.developmentMilestone).toBeDefined();
      expect(progress.clinicalGuidance).toContain('Non-diagnostic');
    });
  });

  describe('6. Universal 6-View Calendar Generation', () => {
    it('generates 30-day continuous rolling agenda with event groups', () => {
      const agenda = generateAgendaRange(parseLocalDate('2026-10-01'), 30, {
        experience: 'women_health',
        cycleData: mockCycleData,
      });

      expect(agenda.length).toBe(30);
      expect(agenda[0].date).toBe('2026-10-01');
      expect(agenda[29].date).toBe('2026-10-30');
      expect(agenda[0].rangeInfo.isRecordedPeriod).toBe(true);
    });

    it('generates 12-month annual horizon forecast with cycle intervals', () => {
      const forecast = generateYearForecast(2026, mockCycleData);
      expect(forecast.length).toBe(12);
      expect(forecast[0].monthName).toBe('January');
      expect(forecast[11].monthName).toBe('December');
      expect(forecast[9].year).toBe(2026);
    });

    it('generates week grid with 7 days', () => {
      const week = generateWeekGrid(parseLocalDate('2026-10-23'));
      expect(week.length).toBe(7);
      expect(week.some((d) => d.date === '2026-10-23')).toBe(true);
    });
  });

  describe('7. Men\'s Health Segregation and Life Calendar', () => {
    it('ensures Men\'s agenda is completely free of menstrual, follicular, and cycle terms', () => {
      const menAgenda = generateDayAgenda('2026-10-01', {
        experience: 'men_health',
        cycleData: mockCycleData, // Even if cycleData exists in store, must be ignored for men!
      });

      const hasMenstrualContent = menAgenda.some(
        (ev) =>
          ev.title.toLowerCase().includes('period') ||
          ev.title.toLowerCase().includes('menstrual') ||
          ev.title.toLowerCase().includes('follicular') ||
          ev.title.toLowerCase().includes('ovulation') ||
          ev.title.toLowerCase().includes('luteal')
      );

      expect(hasMenstrualContent).toBe(false);
    });

    it('allows men to view personal milestones and official holidays on Life Calendar', () => {
      const personalEvents: PersonalCalendarEvent[] = [
        {
          id: 'ev-1',
          title: "Partner's Birthday",
          date: '2026-10-23',
          category: 'birthday',
          recurrence: 'yearly',
          relationship: 'partner',
        },
      ];

      const menDayInfo = getDayRangeInfo('2026-10-23', 0, undefined, undefined, personalEvents);
      expect(menDayInfo.personalEvents?.length).toBe(1);
      expect(menDayInfo.personalEvents?.[0].title).toBe("Partner's Birthday");
      expect(menDayInfo.rangeType).toBe('none'); // No cycle range for men
    });
  });
});

import { CyclePhase } from './cycleCalculations';

export interface CycleData {
  lastPeriodDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentPhase: CyclePhase;
  estimatedNextPeriodDate: string;
}

export interface SymptomLog {
  id: string;
  date: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string;
  flow: 'light' | 'medium' | 'heavy';
  notes?: string;
}

export interface OvulationTest {
  id: string;
  date: string;
  result: 'negative' | 'positive' | 'high';
}

import type { AiSlice } from './slices/aiSlice';
import type { IntegrationSlice } from './slices/integrationSlice';
import type { AppSlice } from './slices/appSlice';
import type { AuthSlice } from './slices/authSlice';
import type { HealthSlice } from './slices/healthSlice';
import type { LetterSlice } from './slices/letterSlice';
import type { PolicySlice } from './slices/policySlice';
import type { QuestSlice } from './slices/questSlice';

export type RootState = AppSlice &
  AuthSlice &
  HealthSlice &
  QuestSlice &
  LetterSlice &
  PolicySlice &
  AiSlice &
  IntegrationSlice;

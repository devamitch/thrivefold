import { useState, useEffect, useCallback } from 'react';

let storage: { getString: (k: string) => string | undefined; set: (k: string, v: string) => void; delete: (k: string) => void };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({ id: 'thrivefold-beta-flags' });
} catch {
  const mem = new Map<string, string>();
  storage = {
    getString: (k: string) => mem.get(k),
    set: (k: string, v: string) => { mem.set(k, v); },
    delete: (k: string) => { mem.delete(k); },
  };
}

export type PoseEngineOption = 'default' | 'experimental';

export interface BetaSettings {
  poseEngine: PoseEngineOption;
  motionBlurEnabled: boolean;
  motionBlurIntensity: number; // 0 to 1
  motionBlurSamples: number; // 1 to 16
  motionBlurLive: boolean;
  poseOverlaySmoothing: number; // 0.2 to 0.9
  showDiagnostics: boolean;
}

export const DEFAULT_BETA_SETTINGS: BetaSettings = {
  poseEngine: 'default',
  motionBlurEnabled: false,
  motionBlurIntensity: 0.5,
  motionBlurSamples: 6,
  motionBlurLive: false,
  poseOverlaySmoothing: 0.42,
  showDiagnostics: false,
};

const STORAGE_KEY = 'beta_lab_settings_v1';

export function getBetaSettings(): BetaSettings {
  try {
    const raw = storage.getString(STORAGE_KEY);
    if (!raw) return DEFAULT_BETA_SETTINGS;
    return { ...DEFAULT_BETA_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BETA_SETTINGS;
  }
}

export function saveBetaSettings(settings: Partial<BetaSettings>): BetaSettings {
  try {
    const current = getBetaSettings();
    const updated = { ...current, ...settings };
    storage.set(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_BETA_SETTINGS;
  }
}

export function resetBetaSettings(): BetaSettings {
  try {
    storage.delete(STORAGE_KEY);
  } catch {}
  return DEFAULT_BETA_SETTINGS;
}

/** Hook for subscribing to and updating beta lab settings. */
export function useBetaSettings() {
  const [settings, setSettings] = useState<BetaSettings>(getBetaSettings);

  useEffect(() => {
    setSettings(getBetaSettings());
  }, []);

  const updateSetting = useCallback(<K extends keyof BetaSettings>(key: K, value: BetaSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveBetaSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const def = resetBetaSettings();
    setSettings(def);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}

// lib/feature-flags.ts
// Sistema de Feature Flags para controle gradual de features

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Feature-flags');

const FEATURE_FLAGS_KEY = '@mounjaro:feature_flags';

export interface FeatureFlags {
  FF_PAYWALL: boolean;
  FF_FAQ: boolean;
  FF_ONBOARDING_5_CORE: boolean;
  FF_TRIAL: boolean;
  FF_MARKETING_CAROUSEL_SHOTSY: boolean;
  FF_FINANCE_MVP: boolean;
  FF_PAUSES_ALCOHOL: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  FF_PAYWALL: false, // Ativar após implementação completa
  FF_FAQ: false, // Ativar após implementação completa
  FF_ONBOARDING_5_CORE: true, // ✅ ATIVADO - Onboarding 5 telas core (C1)
  FF_TRIAL: false, // Ativar após implementação completa
  FF_MARKETING_CAROUSEL_SHOTSY: true, // Carrossel Shotsy com 4 imagens
  FF_FINANCE_MVP: true, // ✅ ATIVADO - Módulo financeiro (C4)
  FF_PAUSES_ALCOHOL: true, // ✅ ATIVADO - Pausas e álcool (C5)
};

let cachedFlags: FeatureFlags | null = null;

export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (cachedFlags) {
    return cachedFlags;
  }

  try {
    const stored = await AsyncStorage.getItem(FEATURE_FLAGS_KEY);
    if (stored) {
      cachedFlags = JSON.parse(stored);
      return cachedFlags || DEFAULT_FLAGS;
    }
  } catch (error) {
    logger.error('Error loading feature flags:', error as Error);
  }

  return DEFAULT_FLAGS;
}

export async function setFeatureFlag<K extends keyof FeatureFlags>(
  key: K,
  value: FeatureFlags[K]
): Promise<void> {
  const flags = await getFeatureFlags();
  flags[key] = value;
  cachedFlags = flags;

  try {
    await AsyncStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  } catch (error) {
    logger.error('Error saving feature flags:', error as Error);
  }
}

export async function isFeatureEnabled(key: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key] === true;
}

// Helper para uso em componentes React
export function useFeatureFlag(key: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    isFeatureEnabled(key).then(setEnabled);
  }, [key]);

  return enabled;
}

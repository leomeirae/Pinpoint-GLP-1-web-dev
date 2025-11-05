// lib/feature-flags.ts
// Sistema de Feature Flags para controle gradual de features

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const FEATURE_FLAGS_KEY = '@mounjaro:feature_flags';

export interface FeatureFlags {
  FF_PAYWALL: boolean;
  FF_FAQ: boolean;
  FF_ONBOARDING_23: boolean;
  FF_TRIAL: boolean;
  FF_MARKETING_CAROUSEL_SHOTSY: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  FF_PAYWALL: false, // Ativar após implementação completa
  FF_FAQ: false, // Ativar após implementação completa
  FF_ONBOARDING_23: true, // ✅ ATIVADO para teste da jornada completa
  FF_TRIAL: false, // Ativar após implementação completa
  FF_MARKETING_CAROUSEL_SHOTSY: true, // Carrossel Shotsy com 4 imagens
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
    console.error('Error loading feature flags:', error);
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
    console.error('Error saving feature flags:', error);
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


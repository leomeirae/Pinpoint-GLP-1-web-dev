// hooks/OnboardingContext.tsx
// Context para gerenciar estado do onboarding (5 telas core)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OnboardingContext');

const STORAGE_KEY = '@mounjaro:onboarding_5_core_data';
const TOTAL_STEPS = 5;

// Mapeamento de steps para rotas
const STEP_ROUTES = [
  'Welcome',
  'Compliance',
  'MedicationDose',
  'Schedule',
  'Permissions',
] as const;

export interface OnboardingState {
  // Dados coletados
  medication?: string;
  dosage?: number;
  preferredDay?: number; // 0-6 (dom-sab)
  preferredTime?: string; // HH:mm formato 24h
  consentVersion?: string;
  consentAcceptedAt?: string;
  analyticsOptIn?: boolean;

  // Estado do fluxo
  currentStep: number; // 1-5
  isGuestMode: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingState>) => void;
  saveData: () => Promise<void>;
  loadData: () => Promise<void>;
  reset: () => Promise<void>;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
}

const defaultState: OnboardingState = {
  currentStep: 1,
  isGuestMode: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(defaultState);

  // Carregar dados salvos ao montar
  useEffect(() => {
    // Em desenvolvimento, sempre resetar para testar do zero
    // Remove esta linha quando for para produção ou teste de "retomar onboarding"
    const initOnboarding = async () => {
      if (__DEV__) {
        // Force reset em dev para sempre começar do step 1
        await AsyncStorage.removeItem(STORAGE_KEY);
        setState(defaultState);
        logger.info('Onboarding reset (dev mode)');
      } else {
        // Em produção, carrega dados salvos para permitir retomar
        loadData();
      }
    };

    initOnboarding();
  }, []);

  // Salvar dados automaticamente quando state mudar
  useEffect(() => {
    if (state.currentStep > 1) {
      saveData();
    }
  }, [state]);

  const updateData = useCallback((data: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < TOTAL_STEPS) {
      const nextStepNum = state.currentStep + 1;
      setState((prev) => ({
        ...prev,
        currentStep: nextStepNum,
      }));
      // Navegar para próxima tela
      const nextRoute = STEP_ROUTES[nextStepNum - 1];
      if (nextRoute) {
        router.push(`/(onboarding)/${nextRoute}` as any);
      }
    }
  }, [state.currentStep, router]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      const prevStepNum = state.currentStep - 1;
      setState((prev) => ({
        ...prev,
        currentStep: prevStepNum,
      }));
      // Navegar para tela anterior
      const prevRoute = STEP_ROUTES[prevStepNum - 1];
      if (prevRoute) {
        router.push(`/(onboarding)/${prevRoute}` as any);
      }
    }
  }, [state.currentStep, router]);

  const saveData = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      logger.debug('Onboarding data saved', { step: state.currentStep });
    } catch (error) {
      logger.error('Error saving onboarding data', error as Error);
    }
  }, [state]);

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState;
        setState(parsed);
        logger.debug('Onboarding data loaded', { step: parsed.currentStep });
      }
    } catch (error) {
      logger.error('Error loading onboarding data', error as Error);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
      logger.info('Onboarding data reset');
    } catch (error) {
      logger.error('Error resetting onboarding data', error as Error);
    }
  }, []);

  const canGoNext = useCallback(() => {
    // Validações por step
    switch (state.currentStep) {
      case 1: // Welcome - sempre pode avançar
        return true;
      case 2: // Compliance - precisa aceitar termos
        return !!state.consentAcceptedAt;
      case 3: // MedicationDose - precisa ter medicamento e dose
        return !!state.medication && !!state.dosage;
      case 4: // Schedule - precisa ter dia e horário
        return state.preferredDay !== undefined && !!state.preferredTime;
      case 5: // Permissions - sempre pode avançar (pode pular)
        return true;
      default:
        return false;
    }
  }, [state]);

  const canGoPrev = useCallback(() => {
    return state.currentStep > 1;
  }, [state.currentStep]);

  const value: OnboardingContextType = {
    state,
    nextStep,
    prevStep,
    updateData,
    saveData,
    loadData,
    reset,
    canGoNext,
    canGoPrev,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingContext(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}


// app/(auth)/onboarding-flow.tsx
// Refatorado para o "Onboarding GRANDE" de 16 passos com Analytics da Fase 3

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useShotsyColors';
import { OnboardingProgressBar } from '@/components/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { trackEvent } from '@/lib/analytics';
import { createLogger } from '@/lib/logger';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';

// --- Telas do Onboarding ---
import {
  FirstNameScreen,
  GenderScreen,
  BirthDateScreen,
  MainGoalScreen,
  StartingWeightDateScreen,
  SuccessScreen,
  AlreadyUsingGLP1Screen,
  MedicationSelectionScreen,
  InitialDoseScreen,
  InjectionFrequencyScreen,
  HealthDisclaimerScreen,
  HeightInputScreen,
  CurrentWeightScreen,
  StartingWeightScreen,
  TargetWeightScreen,
  MotivationalMessageScreen,
} from '@/components/onboarding';

const logger = createLogger('OnboardingFlow');

// --- Estrutura do Onboarding (16 Passos) ---
export type OnboardingStep =
  | 'first-name'
  | 'gender'
  | 'birth-date'
  | 'main-goal'
  | 'is-using-glp1'
  | 'medication-name'
  | 'initial-dosage'
  | 'frequency'
  | 'height'
  | 'starting-weight'
  | 'starting-weight-date'
  | 'current-weight'
  | 'target-weight'
  | 'health-disclaimer'
  | 'motivational-message'
  | 'success';

const ONBOARDING_STEPS: OnboardingStep[] = [
  'first-name',
  'gender',
  'birth-date',
  'main-goal',
  'is-using-glp1',
  'medication-name',
  'initial-dosage',
  'frequency',
  'height',
  'starting-weight',
  'starting-weight-date',
  'current-weight',
  'target-weight',
  'health-disclaimer',
  'motivational-message',
  'success',
];

const ONBOARDING_PROGRESS_KEY = '@mounjaro:onboarding_progress';

interface OnboardingData {
  [key: string]: any;
}

export default function OnboardingFlowScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, loading: userLoading } = useUser();

  const activeSteps = ONBOARDING_STEPS;
  const TOTAL_STEPS = activeSteps.length;

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(activeSteps[0]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);

  const [onboardingStartTime] = useState(() => Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // ... (Hooks de Autenticação e Carregamento de Progresso) ...
  useEffect(() => {
    if (!authLoaded) {
      setIsLoading(true);
      return;
    }
    if (!isSignedIn) {
      AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY).catch(() => {});
      router.replace('/(auth)/welcome');
      return;
    }
    if (user && user.onboarding_completed) {
      AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY).catch(() => {});
      router.replace('/(tabs)');
      return;
    }
    if (isSignedIn && user && !user.onboarding_completed) {
      loadProgress();
    } else if (isSignedIn && !userLoading) {
      setIsLoading(true);
    }
  }, [authLoaded, isSignedIn, user, userLoading, router]);

  // --- Funções de Analytics Aprimoradas ---
  useEffect(() => {
    if (currentStep === activeSteps[0] && !isLoading && authLoaded && isSignedIn) {
      trackEvent('onboarding_started', {
        flow_name: 'grande',
        total_steps: TOTAL_STEPS,
      });
    }
  }, [currentStep, isLoading, authLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoading && authLoaded && isSignedIn) {
      const stepIndex = activeSteps.indexOf(currentStep);
      trackEvent('onboarding_step_viewed', {
        step_number: stepIndex + 1,
        step_name: currentStep,
      });
    }
  }, [currentStep, isLoading, authLoaded, isSignedIn]);

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentStep]);

  const loadProgress = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    try {
      const saved = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step && activeSteps.includes(parsed.step)) {
          setCurrentStep(parsed.step);
          setOnboardingData(parsed.data || {});
        }
      }
    } catch (error) {
      logger.error('Error loading onboarding progress', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (step: OnboardingStep, data: OnboardingData) => {
    try {
      const serialized = JSON.stringify({ step, data });
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, serialized);
    } catch (error) {
      logger.error('Error saving onboarding progress', error as Error);
    }
  };


  const handleStepComplete = (step: OnboardingStep, data?: Partial<OnboardingData>) => {
    const stepIndex = activeSteps.indexOf(step);
    const newData = { ...onboardingData, ...data };
    const timeSpentMs = Date.now() - stepStartTime;

    trackEvent('onboarding_step_completed', {
      step_number: stepIndex + 1,
      step_name: step,
      time_spent_ms: timeSpentMs,
      value: data ? data[Object.keys(data)[0]] : undefined, // Captura o primeiro valor dos dados
    });

    setOnboardingData(newData);
    saveProgress(step, newData);

    const nextIndex = stepIndex + 1;
    if (nextIndex < TOTAL_STEPS) {
      setCurrentStep(activeSteps[nextIndex]);
    } else {
      completeOnboarding(newData);
    }
  };

  const handleSkip = (step: OnboardingStep) => {
    const stepIndex = activeSteps.indexOf(step);
    trackEvent('onboarding_step_skipped', {
        step_number: stepIndex + 1,
        step_name: step,
    });
    // Avança para o próximo passo sem salvar dados
    const nextIndex = stepIndex + 1;
    if (nextIndex < TOTAL_STEPS) {
      setCurrentStep(activeSteps[nextIndex]);
    } else {
      completeOnboarding(onboardingData);
    }
  };


  const handleStepBack = () => {
    const stepIndex = activeSteps.indexOf(currentStep);
    if (stepIndex > 0) {
      setCurrentStep(activeSteps[stepIndex - 1]);
    }
  };

  const { saveOnboardingData } = useOnboarding();

  const completeOnboarding = async (data: OnboardingData) => {
    const totalTimeMs = Date.now() - onboardingStartTime;
    trackEvent('onboarding_completed', {
      total_time_ms: totalTimeMs,
      flow_name: 'grande',
    });

    try {
      await saveOnboardingData(data);
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      router.replace('/(tabs)');
    } catch (error) {
      logger.error('Error completing onboarding', error as Error);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.', [{ text: 'OK' }]);
    }
  };

  const renderStep = () => {
    const handleNextWithData = (data?: any) => handleStepComplete(currentStep, data);
    const handleSkipCurrentStep = () => handleSkip(currentStep);

    switch (currentStep) {
      // --- Seção: Boas-vindas ---
      case 'first-name':
        return <FirstNameScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'gender':
        return <GenderScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'birth-date':
        return <BirthDateScreen onNext={handleNextWithData} onBack={handleStepBack} />;

      // --- Seção: Sua Jornada ---
      case 'main-goal':
        return <MainGoalScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'is-using-glp1':
        return <AlreadyUsingGLP1Screen onNext={handleNextWithData} onBack={handleStepBack} />;

      // --- Seção: Medicação ---
      case 'medication-name':
        return <MedicationSelectionScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'initial-dosage':
        // Exemplo de tela que pode ser pulada
        return <InitialDoseScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} />;
      case 'frequency':
        return <InjectionFrequencyScreen onNext={handleNextWithData} onBack={handleStepBack} />;

      // --- Seção: Métricas ---
      case 'height':
        return <HeightInputScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'starting-weight':
         // Exemplo de tela que pode ser pulada
        return <StartingWeightScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} />;
      case 'starting-weight-date':
        return <StartingWeightDateScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'current-weight':
        return <CurrentWeightScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'target-weight':
        // Exemplo de tela que pode ser pulada
        return <TargetWeightScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} currentWeight={onboardingData.currentWeight || 0} startingWeight={onboardingData.startingWeight || 0} height={onboardingData.height || 170} />;

      // --- Seção: Legal ---
      case 'health-disclaimer':
        return <HealthDisclaimerScreen onNext={handleNextWithData} onBack={handleStepBack} />;

      // --- Seção: Finalização ---
      case 'motivational-message':
        return <MotivationalMessageScreen onNext={() => handleNextWithData()} onBack={handleStepBack} />;
      case 'success':
        return <SuccessScreen onNext={() => completeOnboarding(onboardingData)} onBack={handleStepBack} />;

      default:
        return null;
    }
  };

  if (isLoading || !authLoaded || (isSignedIn && userLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <OnboardingProgressBar
        current={activeSteps.indexOf(currentStep) + 1}
        total={TOTAL_STEPS}
      />
      {renderStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

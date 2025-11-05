// app/(auth)/onboarding-flow.tsx
// Onboarding completo com 23 telas conforme Shotsy

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { OnboardingProgressBar } from '@/components/onboarding';
import { useFeatureFlag } from '@/lib/feature-flags';
import { useOnboarding } from '@/hooks/useOnboarding';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';

// Importar todas as 22 telas de onboarding (sem welcome - carrossel já foi mostrado antes do login)
import {
  WidgetsIntroScreen,
  ChartsIntroScreen,
  CustomizationIntroScreen,
  AlreadyUsingGLP1Screen,
  MedicationSelectionScreen,
  InitialDoseScreen,
  DeviceTypeScreen,
  InjectionFrequencyScreen,
  EducationGraphScreen,
  HealthDisclaimerScreen,
  HeightInputScreen,
  CurrentWeightScreen,
  StartingWeightScreen,
  TargetWeightScreen,
  MotivationalMessageScreen,
  WeightLossRateScreen,
  DailyRoutineScreen,
  FluctuationsEducationScreen,
  FoodNoiseScreen,
  SideEffectsConcernsScreen,
  MotivationScreen,
  AppRatingScreen,
} from '@/components/onboarding';

// Tipos de steps conforme ordem do Shotsy (sem welcome - carrossel é antes do login)
export type OnboardingStep =
  | 'widgets'
  | 'charts'
  | 'customization'
  | 'already-using'
  | 'medication'
  | 'initial-dose'
  | 'device-type'
  | 'frequency'
  | 'education-graph'
  | 'health-disclaimer'
  | 'height'
  | 'current-weight'
  | 'starting-weight'
  | 'target-weight'
  | 'motivational-message'
  | 'weight-loss-rate'
  | 'daily-routine'
  | 'fluctuations'
  | 'food-noise'
  | 'side-effects'
  | 'motivation'
  | 'app-rating';

// Removido 'welcome' - o onboarding começa direto com as perguntas após login
const ONBOARDING_STEPS: OnboardingStep[] = [
  'widgets',
  'charts',
  'customization',
  'already-using',
  'medication',
  'initial-dose',
  'device-type',
  'frequency',
  'education-graph',
  'health-disclaimer',
  'height',
  'current-weight',
  'starting-weight',
  'target-weight',
  'motivational-message',
  'weight-loss-rate',
  'daily-routine',
  'fluctuations',
  'food-noise',
  'side-effects',
  'motivation',
  'app-rating',
];

const TOTAL_STEPS = ONBOARDING_STEPS.length; // 22 steps (sem welcome)

const ONBOARDING_PROGRESS_KEY = '@mounjaro:onboarding_progress';

interface OnboardingData {
  [key: string]: any;
}

export default function OnboardingFlowScreen() {
  const colors = useShotsyColors();
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, loading: userLoading } = useUser();
  const use23Steps = useFeatureFlag('FF_ONBOARDING_23');
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('widgets');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);

  // GUARD CRÍTICO: Verificar autenticação PRIMEIRO antes de qualquer coisa
  useEffect(() => {
    if (!authLoaded) {
      setIsLoading(true);
      return;
    }

    // Se não estiver logado, LIMPAR progresso e redirecionar para welcome
    if (!isSignedIn) {
      console.log('🚫 Usuário não autenticado, limpando progresso e redirecionando para welcome');
      // Limpar progresso salvo se não estiver autenticado
      AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY).catch(() => {});
      router.replace('/(auth)/welcome');
      return;
    }

    // Se já completou o onboarding, redirecionar para dashboard
    if (user && user.onboarding_completed) {
      console.log('✅ Onboarding já completado, redirecionando para dashboard');
      // Limpar progresso salvo pois já completou
      AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY).catch(() => {});
      router.replace('/(tabs)');
      return;
    }

    // SÓ AGORA, se estiver autenticado e não completou onboarding, carregar progresso
    if (isSignedIn && user && !user.onboarding_completed) {
      loadProgress();
    } else if (isSignedIn && !userLoading) {
      // Se está autenticado mas ainda não tem user carregado, aguardar
      setIsLoading(true);
    }
  }, [authLoaded, isSignedIn, user, userLoading, router]);

  // Track onboarding started (quando carrega a primeira tela)
  useEffect(() => {
    if (currentStep === 'widgets' && !isLoading && authLoaded && isSignedIn) {
      trackEvent('onboarding_started', {
        source: 'sign_up',
      });
    }
  }, [currentStep, isLoading, authLoaded, isSignedIn]);

  // Track screen view
  useEffect(() => {
    if (!isLoading && authLoaded && isSignedIn) {
      const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
      trackEvent('onboarding_step_viewed', {
        step_number: stepIndex + 1,
        step_name: currentStep,
        total_steps: TOTAL_STEPS,
      });
    }
  }, [currentStep, isLoading, authLoaded, isSignedIn]);

  const loadProgress = async () => {
    // Só carregar se estiver autenticado
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      const saved = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step && ONBOARDING_STEPS.includes(parsed.step)) {
          setCurrentStep(parsed.step);
          setOnboardingData(parsed.data || {});
        }
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (step: OnboardingStep, data: OnboardingData) => {
    try {
      await AsyncStorage.setItem(
        ONBOARDING_PROGRESS_KEY,
        JSON.stringify({ step, data })
      );
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const handleStepComplete = (step: OnboardingStep, data?: Partial<OnboardingData>) => {
    const stepIndex = ONBOARDING_STEPS.indexOf(step);
    const newData = { ...onboardingData, ...data };
    
    // Track step completion
    trackEvent('onboarding_step_completed', {
      step_number: stepIndex + 1,
      step_name: step,
      time_spent_seconds: 0, // TODO: calcular tempo real
      data_collected: data,
    });

    // Salvar progresso
    setOnboardingData(newData);
    saveProgress(step, newData);

    // Avançar para próximo step
    const nextIndex = stepIndex + 1;
    if (nextIndex < TOTAL_STEPS) {
      // Track avanço para próximo step
      trackEvent('onboarding_step_next', {
        from_step: stepIndex + 1,
        to_step: nextIndex + 1,
        from_step_name: step,
        to_step_name: ONBOARDING_STEPS[nextIndex],
      });
      
      setCurrentStep(ONBOARDING_STEPS[nextIndex]);
    } else {
      // Onboarding completo
      completeOnboarding(newData);
    }
  };

  const handleStepBack = () => {
    const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (stepIndex > 0) {
      const previousStep = ONBOARDING_STEPS[stepIndex - 1];
      
      // Track voltar para step anterior
      trackEvent('onboarding_step_back', {
        from_step: stepIndex + 1,
        to_step: stepIndex,
        from_step_name: currentStep,
        to_step_name: previousStep,
      });
      
      setCurrentStep(previousStep);
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    // Track completion
    trackEvent('onboarding_completed', {
      total_time_seconds: 0, // TODO: calcular tempo total
      skipped_steps: [],
      data_completed: {
        has_medication: !!data.medication,
        has_height: !!data.height,
        has_weight: !!data.currentWeight,
        has_target_weight: !!data.targetWeight,
      },
    });

    try {
      // Salvar dados no Supabase
      await saveOnboardingData(data);
      
      // Limpar progresso salvo
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);

      // Redirecionar para dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Mostrar erro ao usuário (implementar toast/alert)
      Alert.alert(
        'Erro',
        'Não foi possível salvar seus dados. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSkip = () => {
    const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
    trackEvent('onboarding_step_skipped', {
      step_number: stepIndex + 1,
      step_name: currentStep,
    });
    
    // Avançar para próximo step sem dados
    handleStepComplete(currentStep);
  };

  const { saveOnboardingData } = useOnboarding();

  // Mostrar loading enquanto verifica autenticação ou carrega dados
  // CRÍTICO: Não renderizar nada até verificar autenticação
  if (!authLoaded || isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Se não estiver autenticado, não renderizar (guard já redirecionou)
  if (!isSignedIn) {
    return null;
  }

  // Se já completou onboarding, não renderizar (guard já redirecionou)
  if (user && user.onboarding_completed) {
    return null;
  }

  // Se ainda está carregando user, mostrar loading
  if (userLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Se feature flag desativada, usar fluxo antigo (4 steps)
  if (!use23Steps) {
    // TODO: manter compatibilidade com fluxo antigo se necessário
  }

  const renderStep = () => {
    // Callback wrapper que aceita dados opcionais de qualquer tipo
    const handleNextWithData = (data?: any) => {
      handleStepComplete(currentStep, data);
    };

    switch (currentStep) {
      case 'widgets':
        return <WidgetsIntroScreen onNext={() => handleStepComplete('widgets')} onBack={handleStepBack} />;
      case 'charts':
        return <ChartsIntroScreen onNext={() => handleStepComplete('charts')} onBack={handleStepBack} />;
      case 'customization':
        return <CustomizationIntroScreen onNext={() => handleStepComplete('customization')} onBack={handleStepBack} />;
      case 'already-using':
        return <AlreadyUsingGLP1Screen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'medication':
        return <MedicationSelectionScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'initial-dose':
        return <InitialDoseScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'device-type':
        return <DeviceTypeScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'frequency':
        return <InjectionFrequencyScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'education-graph':
        return <EducationGraphScreen onNext={() => handleStepComplete('education-graph')} onBack={handleStepBack} />;
      case 'health-disclaimer':
        return (
          <HealthDisclaimerScreen
            onNext={(consentAccepted) => {
              if (consentAccepted) {
                trackEvent('onboarding_consent_accepted', {
                  step_number: ONBOARDING_STEPS.indexOf('health-disclaimer') + 1,
                  timestamp: new Date().toISOString(),
                });
              }
              handleStepComplete('health-disclaimer');
            }}
            onBack={handleStepBack}
          />
        );
      case 'height':
        return <HeightInputScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'current-weight':
        return (
          <CurrentWeightScreen
            onNext={handleNextWithData}
            onBack={handleStepBack}
          />
        );
      case 'starting-weight':
        return (
          <StartingWeightScreen
            onNext={handleNextWithData}
            onBack={handleStepBack}
            weightUnit={onboardingData.weightUnit || 'kg'}
          />
        );
      case 'target-weight':
        return (
          <TargetWeightScreen
            onNext={handleNextWithData}
            onBack={handleStepBack}
            weightUnit={onboardingData.weightUnit || 'kg'}
            currentWeight={onboardingData.currentWeight || 0}
            startingWeight={onboardingData.startingWeight || 0}
            height={onboardingData.height || 170}
          />
        );
      case 'motivational-message':
        return <MotivationalMessageScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'weight-loss-rate':
        return <WeightLossRateScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'daily-routine':
        return <DailyRoutineScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'fluctuations':
        return <FluctuationsEducationScreen onNext={() => handleStepComplete('fluctuations')} onBack={handleStepBack} />;
      case 'food-noise':
        return <FoodNoiseScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'side-effects':
        return <SideEffectsConcernsScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'motivation':
        return <MotivationScreen onNext={handleNextWithData} onBack={handleStepBack} />;
      case 'app-rating':
        return <AppRatingScreen onNext={() => handleStepComplete('app-rating')} onBack={handleStepBack} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress Bar */}
      <OnboardingProgressBar
        current={ONBOARDING_STEPS.indexOf(currentStep) + 1}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});

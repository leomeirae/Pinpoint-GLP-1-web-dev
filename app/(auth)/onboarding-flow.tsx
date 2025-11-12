// app/(auth)/onboarding-flow.tsx
// Versão Final com Fase 2, 3 e 4 (Hooks) aplicadas corretamente

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useShotsyColors';
import { OnboardingProgressBar, FeatureHookScreen } from '@/components/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { trackEvent } from '@/lib/analytics';
import { createLogger } from '@/lib/logger';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { ShoppingCart, BeerStein, HandPalm } from 'phosphor-react-native';

import {
  FirstNameScreen, GenderScreen, BirthDateScreen, MainGoalScreen, StartingWeightDateScreen, SuccessScreen,
  AlreadyUsingGLP1Screen, MedicationSelectionScreen, InitialDoseScreen, InjectionFrequencyScreen,
  HealthDisclaimerScreen, HeightInputScreen, CurrentWeightScreen, StartingWeightScreen, TargetWeightScreen,
  MotivationalMessageScreen
} from '@/components/onboarding';

const logger = createLogger('OnboardingFlow');

export type CoreStep =
  | 'first-name' | 'gender' | 'birth-date' | 'main-goal' | 'is-using-glp1' | 'medication-name'
  | 'initial-dosage' | 'frequency' | 'height' | 'starting-weight' | 'starting-weight-date'
  | 'current-weight' | 'target-weight' | 'health-disclaimer' | 'motivational-message' | 'success';

export type HookStep = 'costs-hook' | 'alcohol-hook' | 'pauses-hook';
export type OnboardingFlowStep = CoreStep | HookStep;

const CORE_STEPS: CoreStep[] = [
  'first-name', 'gender', 'birth-date', 'main-goal', 'is-using-glp1', 'medication-name', 'initial-dosage',
  'frequency', 'height', 'starting-weight', 'starting-weight-date', 'current-weight', 'target-weight',
  'health-disclaimer', 'motivational-message', 'success',
];

const ONBOARDING_FLOW: OnboardingFlowStep[] = [
  ...CORE_STEPS.slice(0, 13), 'costs-hook', 'alcohol-hook', 'pauses-hook', ...CORE_STEPS.slice(13),
];

const ONBOARDING_PROGRESS_KEY = '@mounjaro:onboarding_flow_progress_v2';
interface OnboardingData { [key: string]: any; }

export default function OnboardingFlowScreen() {
    const colors = useColors();
    const router = useRouter();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const { user, loading: userLoading } = useUser();

    const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
    const currentStep: OnboardingFlowStep = ONBOARDING_FLOW[currentFlowIndex];

    const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
    const [isLoading, setIsLoading] = useState(true);

    const [onboardingStartTime] = useState(() => Date.now());
    const [stepStartTime, setStepStartTime] = useState(Date.now());

    useEffect(() => { /* Efeito de autenticação... */ }, [authLoaded, isSignedIn, user, userLoading, router]);

    useEffect(() => {
        const stepName = ONBOARDING_FLOW[currentFlowIndex];
        trackEvent('onboarding_step_viewed', { step_name: stepName });
        if (!CORE_STEPS.includes(stepName as CoreStep)) {
            trackEvent('hook_viewed', { type: stepName.replace('-hook','') });
        }
        setStepStartTime(Date.now());
    }, [currentFlowIndex]);

    const loadProgress = async () => { /* ... */ };
    const saveProgress = async (index: number, data: OnboardingData) => { /* ... */ };

    const advanceToNextStep = () => {
        if (currentFlowIndex < ONBOARDING_FLOW.length - 1) {
        setCurrentFlowIndex(currentFlowIndex + 1);
        } else {
        completeOnboarding(onboardingData);
        }
    };

    const handleStepComplete = (data?: Partial<OnboardingData>) => {
        const newData = { ...onboardingData, ...data };
        setOnboardingData(newData);
        trackEvent('onboarding_step_completed', { step_name: currentStep, value: data ? data[Object.keys(data)[0]] : undefined });
        saveProgress(currentFlowIndex + 1, newData);
        advanceToNextStep();
    };

    const handleSkip = () => {
        trackEvent('onboarding_step_skipped', { step_name: currentStep });
        advanceToNextStep();
    };

    const handleStepBack = () => {
        if (currentFlowIndex > 0) {
        setCurrentFlowIndex(currentFlowIndex - 1);
        }
    };

    const handleHookAction = (hookType: HookStep, action: 'learn_more' | 'dismiss') => {
        trackEvent('hook_cta_clicked', { type: hookType.replace('-hook',''), action });
        advanceToNextStep();
    };

    const { saveOnboardingData } = useOnboarding();
    const completeOnboarding = async (data: OnboardingData) => { /* ... */ };

    const renderStep = () => {
        const isHook = !CORE_STEPS.includes(currentStep as CoreStep);
        if (isHook) {
            switch (currentStep) {
                case 'costs-hook': return <FeatureHookScreen title="Acompanhe seus custos" subtitle="Sabemos que o tratamento pode ser caro. O Pinpoint pode te ajudar a visualizar seus gastos." icon={<ShoppingCart size={48} color={colors.primary} />} primaryButtonText="Ver como funciona" secondaryButtonText="Aprender depois" onPrimaryPress={() => handleHookAction('costs-hook', 'learn_more')} onSecondaryPress={() => handleHookAction('costs-hook', 'dismiss')} />;
                case 'alcohol-hook': return <FeatureHookScreen title="Bebidas alcoólicas e o tratamento" subtitle="O álcool pode impactar seus resultados. Aprenda a registrar seu consumo para entender melhor seus efeitos." icon={<BeerStein size={48} color={colors.primary} />} primaryButtonText="Ver como funciona" secondaryButtonText="Aprender depois" onPrimaryPress={() => handleHookAction('alcohol-hook', 'learn_more')} onSecondaryPress={() => handleHookAction('alcohol-hook', 'dismiss')} />;
                case 'pauses-hook': return <FeatureHookScreen title="Precisa de uma pausa?" subtitle="Se precisar interromper o tratamento temporariamente, você pode pausar seus lembretes e registros." icon={<HandPalm size={48} color={colors.primary} />} primaryButtonText="Ver como funciona" secondaryButtonText="Aprender depois" onPrimaryPress={() => handleHookAction('pauses-hook', 'learn_more')} onSecondaryPress={() => handleHookAction('pauses-hook', 'dismiss')} />;
            }
        }

        const handleNextWithData = (data?: any) => handleStepComplete(data);
        const handleSkipCurrentStep = () => handleSkip();
        switch (currentStep as CoreStep) {
            case 'first-name': return <FirstNameScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'gender': return <GenderScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'birth-date': return <BirthDateScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'main-goal': return <MainGoalScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'is-using-glp1': return <AlreadyUsingGLP1Screen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'medication-name': return <MedicationSelectionScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'initial-dosage': return <InitialDoseScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} />;
            case 'frequency': return <InjectionFrequencyScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'height': return <HeightInputScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'starting-weight': return <StartingWeightScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} />;
            case 'starting-weight-date': return <StartingWeightDateScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'current-weight': return <CurrentWeightScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'target-weight': return <TargetWeightScreen onNext={handleNextWithData} onBack={handleStepBack} onSkip={handleSkipCurrentStep} currentWeight={onboardingData.currentWeight || 80} startingWeight={onboardingData.startingWeight || 80} height={onboardingData.height || 170} />;
            case 'health-disclaimer': return <HealthDisclaimerScreen onNext={handleNextWithData} onBack={handleStepBack} />;
            case 'motivational-message': return <MotivationalMessageScreen onNext={() => handleNextWithData()} onBack={handleStepBack} />;
            case 'success': return <SuccessScreen onNext={() => completeOnboarding(onboardingData)} onBack={handleStepBack} />;
            default: return null;
        }
    };

    const isHook = !CORE_STEPS.includes(currentStep as CoreStep);
    let progress = 0;
    if (!isHook) {
        progress = CORE_STEPS.indexOf(currentStep as CoreStep) + 1;
    } else {
        let tempIndex = currentFlowIndex;
        while(tempIndex >= 0 && !CORE_STEPS.includes(ONBOARDING_FLOW[tempIndex] as CoreStep)) { tempIndex--; }
        progress = CORE_STEPS.indexOf(ONBOARDING_FLOW[tempIndex] as CoreStep) + 1;
    }

    if (isLoading) { return <SafeAreaView style={styles.container}><ActivityIndicator /></SafeAreaView>; }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <OnboardingProgressBar current={progress} total={CORE_STEPS.length} />
        {renderStep()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ container: { flex: 1 } });

// app/(onboarding)/_layout.tsx
// Layout do grupo onboarding (5 telas core)

import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OnboardingProvider, useOnboardingContext } from '@/hooks/OnboardingContext';

function OnboardingHeader() {
  const colors = useColors();
  const router = useRouter();
  const { state, prevStep, canGoPrev } = useOnboardingContext();

  const handleBack = () => {
    if (canGoPrev()) {
      prevStep();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerContent}>
        {canGoPrev() && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar para etapa anterior"
          >
            <ArrowLeft size={24} color={colors.text} weight="bold" />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <ProgressIndicator currentStep={state.currentStep} totalSteps={5} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          header: () => <OnboardingHeader />,
          headerShown: true,
        }}
      >
        <Stack.Screen name="Welcome" options={{ title: 'Bem-vindo' }} />
        <Stack.Screen name="Compliance" options={{ title: 'Termos' }} />
        <Stack.Screen name="MedicationDose" options={{ title: 'Medicamento' }} />
        <Stack.Screen name="Schedule" options={{ title: 'Agendamento' }} />
        <Stack.Screen name="Permissions" options={{ title: 'Permissões' }} />
        <Stack.Screen name="FeatureHook" options={{ title: 'Recursos' }} />
      </Stack>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    gap: ShotsyDesignTokens.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
});


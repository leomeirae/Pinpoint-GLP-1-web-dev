// app/(onboarding)/Welcome.tsx
// Tela 1: Boas-vindas e introdução ao app

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Syringe } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboardingContext } from '@/hooks/OnboardingContext';
import { createLogger } from '@/lib/logger';

const logger = createLogger('WelcomeScreen');

export default function WelcomeScreen() {
  const colors = useColors();
  const { state, nextStep, reset, updateData } = useOnboardingContext();

  // Resetar onboarding ao montar Welcome (garantir que sempre começa do step 1)
  useEffect(() => {
    if (state.currentStep !== 1) {
      logger.warn('Welcome mounted with incorrect step, resetting', {
        currentStep: state.currentStep,
        expectedStep: 1,
      });
      // Resetar apenas o currentStep, manter outros dados se existirem
      updateData({ currentStep: 1 });
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Ícone/Ilustração */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Syringe size={64} color={colors.primary} weight="bold" />
        </View>

        {/* Título */}
        <Text style={[styles.title, { color: colors.text }]}>
          Acompanhe seu tratamento
        </Text>

        {/* Subtítulo */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Registre suas aplicações, acompanhe seu progresso e nunca esqueça sua dose semanal
        </Text>

        {/* CTA */}
        <View style={styles.buttonContainer}>
          <OnboardingButton
            label="Começar"
            onPress={nextStep}
            variant="primary"
            size="large"
            accessibilityLabel="Iniciar onboarding"
            accessibilityHint="Avança para a próxima etapa do onboarding"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: ShotsyDesignTokens.spacing.xl,
    paddingTop: ShotsyDesignTokens.spacing.xxxl,
    paddingBottom: ShotsyDesignTokens.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  title: {
    ...ShotsyDesignTokens.typography.h1,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  subtitle: {
    ...ShotsyDesignTokens.typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: ShotsyDesignTokens.spacing.xxxl,
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
});


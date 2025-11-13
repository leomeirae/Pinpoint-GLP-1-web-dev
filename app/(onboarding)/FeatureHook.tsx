// app/(onboarding)/FeatureHook.tsx
// Hook informativo entre Schedule e Permissions (apresenta features opcionais)

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CurrencyCircleDollar, Wine, PauseCircle } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboardingContext } from '@/hooks/OnboardingContext';

const FEATURES = [
  {
    id: 'finance',
    icon: CurrencyCircleDollar,
    title: 'Acompanhe seus custos',
    description: 'Registre compras e veja quanto você gasta por semana ou por kg perdido',
  },
  {
    id: 'alcohol',
    icon: Wine,
    title: 'Registre consumo de álcool',
    description: 'Acompanhe padrões e veja como o álcool afeta seu progresso',
  },
  {
    id: 'pauses',
    icon: PauseCircle,
    title: 'Pause quando necessário',
    description: 'Registre pausas no tratamento e ajuste seus lembretes automaticamente',
  },
];

export default function FeatureHookScreen() {
  const colors = useColors();
  const { nextStep } = useOnboardingContext();

  const handleContinue = () => {
    nextStep();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Recursos adicionais
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Explore estas funcionalidades opcionais quando quiser
        </Text>

        {/* Cards de features */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <View
                key={feature.id}
                style={[styles.featureCard, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Icon size={32} color={colors.primary} weight="bold" />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Botão Continuar */}
      <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
        <OnboardingButton
          label="Ver Depois"
          onPress={handleContinue}
          variant="primary"
          size="large"
          accessibilityLabel="Continuar para configuração de notificações"
          accessibilityHint="Avança para a última etapa do onboarding"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.xl,
    paddingBottom: ShotsyDesignTokens.spacing.xxl,
  },
  title: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  subtitle: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.xxl,
    lineHeight: 22,
  },
  featuresContainer: {
    gap: ShotsyDesignTokens.spacing.lg,
  },
  featureCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ShotsyDesignTokens.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    ...ShotsyDesignTokens.typography.h3,
    fontSize: 18,
    marginBottom: ShotsyDesignTokens.spacing.xs,
    flex: 1,
  },
  featureDescription: {
    ...ShotsyDesignTokens.typography.body,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
  },
});


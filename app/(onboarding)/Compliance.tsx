// app/(onboarding)/Compliance.tsx
// Tela 2: Disclaimer clínico + Consentimento LGPD

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboardingContext } from '@/hooks/OnboardingContext';

const CONSENT_VERSION = '1.0.0';

export default function ComplianceScreen() {
  const colors = useColors();
  const { updateData, nextStep, canGoNext } = useOnboardingContext();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  const handleTermsToggle = () => {
    const newValue = !termsAccepted;
    setTermsAccepted(newValue);
    if (newValue) {
      updateData({
        consentVersion: CONSENT_VERSION,
        consentAcceptedAt: new Date().toISOString(),
      });
    } else {
      updateData({
        consentVersion: undefined,
        consentAcceptedAt: undefined,
      });
    }
  };

  const handleAnalyticsToggle = () => {
    const newValue = !analyticsOptIn;
    setAnalyticsOptIn(newValue);
    updateData({ analyticsOptIn: newValue });
  };

  const handlePrivacyPolicy = async () => {
    // TODO: Adicionar URL da política de privacidade
    const url = 'https://pinpointglp1.app/privacy';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      nextStep();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer Clínico */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aviso Importante
          </Text>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Este aplicativo é uma ferramenta de acompanhamento e não substitui a orientação
            médica profissional. Sempre consulte seu médico antes de tomar decisões sobre seu
            tratamento com medicamentos GLP-1.
          </Text>
        </View>

        {/* Checkbox Termos */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleTermsToggle}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityLabel="Aceitar termos e condições"
          accessibilityState={{ checked: termsAccepted }}
        >
          {termsAccepted ? (
            <CheckCircle size={24} color={colors.primary} weight="fill" />
          ) : (
            <CheckCircle size={24} color={colors.border} weight="regular" />
          )}
          <View style={styles.checkboxTextContainer}>
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              Li e aceito os{' '}
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                onPress={handlePrivacyPolicy}
              >
                Termos de Uso
              </Text>
              {' e '}
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                onPress={handlePrivacyPolicy}
              >
                Política de Privacidade
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Checkbox Analytics (Opcional) */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleAnalyticsToggle}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityLabel="Compartilhar dados anônimos de uso"
          accessibilityState={{ checked: analyticsOptIn }}
        >
          {analyticsOptIn ? (
            <CheckCircle size={24} color={colors.primary} weight="fill" />
          ) : (
            <CheckCircle size={24} color={colors.border} weight="regular" />
          )}
          <View style={styles.checkboxTextContainer}>
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              Compartilhar dados anônimos de uso para melhorar o app (opcional)
            </Text>
            <Text style={[styles.checkboxHint, { color: colors.textMuted }]}>
              Nenhum dado pessoal será compartilhado
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Botão Continuar */}
      <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
        <OnboardingButton
          label="Continuar"
          onPress={handleNext}
          variant="primary"
          size="large"
          disabled={!canGoNext()}
          accessibilityLabel="Continuar para próxima etapa"
          accessibilityHint={
            canGoNext()
              ? 'Avança para seleção de medicamento'
              : 'É necessário aceitar os termos para continuar'
          }
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
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  disclaimerText: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ShotsyDesignTokens.spacing.md,
    marginBottom: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 22,
  },
  checkboxHint: {
    ...ShotsyDesignTokens.typography.caption,
    marginTop: ShotsyDesignTokens.spacing.xs,
    fontSize: 12,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
  },
});


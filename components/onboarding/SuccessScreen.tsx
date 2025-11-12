import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { CheckCircle } from 'phosphor-react-native';

interface SuccessScreenProps {
  onNext: () => void;
  onBack: () => void; // Embora possa não ser usado aqui, mantemos para consistência
}

export function SuccessScreen({ onNext, onBack }: SuccessScreenProps) {
  const colors = useColors();

  return (
    <OnboardingScreenBase
      title="Tudo pronto!"
      subtitle="Seu perfil está completo. Vamos para a tela principal."
      onNext={onNext}
      onBack={onBack}
      hideBackButton
      nextButtonText="Ir para a Home"
    >
      <View style={styles.content}>
        <CheckCircle size={96} color={colors.primary} weight="light" />
        <Text style={[styles.message, { color: colors.text }]}>
          Estamos animados para te acompanhar nesta jornada. Lembre-se, o progresso é feito um passo de cada vez.
        </Text>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xxxl,
  },
  message: {
    ...ShotsyDesignTokens.typography.h4,
    textAlign: 'center',
    lineHeight: 28,
  },
});

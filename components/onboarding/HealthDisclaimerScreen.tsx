import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

interface HealthDisclaimerScreenProps {
  onNext: (data: { consentVersion: string; consentAcceptedAt: string }) => void;
  onBack: () => void;
}

const CONSENT_VERSION = '1.0.0-br'; // Versão para auditoria

export function HealthDisclaimerScreen({ onNext, onBack }: HealthDisclaimerScreenProps) {
  const colors = useColors();
  const [accepted, setAccepted] = useState(false);

  const handleNext = () => {
    if (accepted) {
      onNext({
        consentVersion: CONSENT_VERSION,
        consentAcceptedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <OnboardingScreenBase
      title="Termo de Saúde e Responsabilidade"
      subtitle="Leia e aceite para continuar. O Pinpoint é uma ferramenta de apoio e não substitui o acompanhamento médico."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!accepted}
      nextButtonText="Aceitar e Continuar"
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            As informações fornecidas por este aplicativo são apenas para fins de acompanhamento e educação. O Pinpoint GLP-1
            não deve ser usado como substituto de aconselhamento médico profissional, diagnóstico ou tratamento.
            Sempre consulte seu médico ou outro profissional de saúde qualificado antes de tomar decisões médicas.
          </Text>

          <Text style={[styles.textHighlight, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}>
            <Text style={{ fontWeight: '700' }}>⚕️ Prescrição Obrigatória no Brasil:</Text> O uso de medicamentos GLP-1 (Mounjaro®, Ozempic®, Wegovy®) requer prescrição e acompanhamento médico contínuo.
          </Text>

            <Text style={[styles.text, { color: colors.textSecondary }]}>
                Ao continuar, você confirma que entende que o Pinpoint GLP-1 é uma ferramenta de suporte e não se responsabiliza pelas suas decisões de tratamento.
            </Text>
        </View>
      </ScrollView>

      <View style={[styles.switchContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>Li e aceito o termo de saúde</Text>
        <Switch
          value={accepted}
          onValueChange={setAccepted}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  text: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 24,
  },
  textHighlight: {
    ...ShotsyDesignTokens.typography.bodySmall,
    lineHeight: 22,
    padding: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  switchLabel: {
    ...ShotsyDesignTokens.typography.label,
    flex: 1,
    marginRight: 16,
  },
});

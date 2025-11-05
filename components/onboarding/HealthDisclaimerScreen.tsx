import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { Ionicons } from '@expo/vector-icons';

interface HealthDisclaimerScreenProps {
  onNext: (consentAccepted: boolean) => void;
  onBack: () => void;
}

export function HealthDisclaimerScreen({ onNext, onBack }: HealthDisclaimerScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [accepted, setAccepted] = useState(false);

  return (
    <OnboardingScreenBase
      title="Aviso importante sobre saúde"
      subtitle="Por favor, leia atentamente antes de continuar"
      onNext={() => onNext(accepted)}
      onBack={onBack}
      disableNext={!accepted}
      nextButtonText="Prosseguir"
    >
      <View style={styles.content}>
        <ShotsyCard variant="elevated" style={[styles.disclaimerCard, { borderLeftColor: currentAccent }]}>
          <Text style={styles.emoji}>⚠️</Text>

          <Text style={[styles.disclaimerTitle, { color: colors.text }]}>
            Este aplicativo é apenas para fins informativos
          </Text>

          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            O Shotsy não substitui orientação médica profissional, diagnóstico ou tratamento.
            Sempre consulte seu médico ou profissional de saúde qualificado sobre quaisquer
            dúvidas relacionadas a condições médicas ou tratamentos.
          </Text>

          <View style={styles.bulletPoints}>
            <View style={styles.bullet}>
              <Text style={[styles.bulletIcon, { color: currentAccent }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                As estimativas de níveis de medicamento são aproximadas
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={[styles.bulletIcon, { color: currentAccent }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                Não tome decisões médicas baseadas apenas neste app
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={[styles.bulletIcon, { color: currentAccent }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                Sempre siga as orientações do seu médico
              </Text>
            </View>
          </View>
        </ShotsyCard>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAccepted(!accepted)}
        >
          <View
            style={[
              styles.checkboxBox,
              {
                borderColor: accepted ? currentAccent : colors.border,
                backgroundColor: accepted ? currentAccent : 'transparent',
              },
            ]}
          >
            {accepted && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            Li e compreendo que este app é apenas informativo e não substitui orientação médica
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  disclaimerCard: {
    padding: 20,
    borderLeftWidth: 4,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoints: {
    gap: 12,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});

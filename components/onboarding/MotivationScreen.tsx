import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import {
  AppIcon, HeartIcon, WeightIcon, InjectionsIcon, SparkleIcon, StethoscopeIcon, CheckCircleIcon
} from '@/components/ui/icons';

interface MotivationScreenProps {
  onNext: (data: { motivation: string }) => void;
  onBack: () => void;
}

const motivations = [
  { id: 'health', label: 'Saúde geral', icon: 'heart', description: 'Melhorar minha saúde como um todo' },
  { id: 'weight', label: 'Perder peso', icon: 'scales', description: 'Alcançar meu peso ideal' },
  { id: 'diabetes', label: 'Controlar diabetes', icon: 'syringe', description: 'Gerenciar melhor meu diabetes tipo 2' },
  { id: 'quality', label: 'Qualidade de vida', icon: 'sparkle', description: 'Ter mais energia e disposição' },
  { id: 'medical', label: 'Recomendação médica', icon: 'stethoscope', description: 'Seguindo orientação do meu médico' },
];

export function MotivationScreen({ onNext, onBack }: MotivationScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ motivation: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="O que te motiva a usar GLP-1?"
      subtitle="Entender sua motivação nos ajuda a personalizar sua experiência"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {motivations.map((motivation) => (
          <TouchableOpacity
            key={motivation.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === motivation.id ? currentAccent : colors.border,
                borderWidth: selected === motivation.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(motivation.id)}
          >
            <View style={styles.optionContent}>
              <AppIcon name={motivation.icon as any} size="xl" color={colors.text} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {motivation.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {motivation.description}
                </Text>
              </View>
            </View>
            {selected === motivation.id && (
              <CheckCircleIcon size="md" color={currentAccent} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  option: {
    borderRadius: 12,  // Mudança: 16 → 12px (design system)
    padding: 16,
    minHeight: 60,  // Touch target adequado
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    // fontSize: 32, // Removed as AppIcon handles its own size
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
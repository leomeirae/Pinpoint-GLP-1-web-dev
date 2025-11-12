import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { useTheme } from '@/lib/theme-context';

interface GenderScreenProps {
  onNext: (data: { gender: string }) => void;
  onBack: () => void;
}

const GENDER_OPTIONS = [
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Feminino' },
  { id: 'other', label: 'Outro' },
];

export function GenderScreen({ onNext, onBack }: GenderScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ gender: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Como você se identifica?"
      subtitle="Isso nos ajuda a personalizar algumas métricas de saúde."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {GENDER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === option.id ? currentAccent : colors.border,
                borderWidth: selected === option.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(option.id)}
          >
            <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  option: {
    ...ShotsyDesignTokens.shadows.subtle,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  optionLabel: {
    ...ShotsyDesignTokens.typography.h5,
  },
});

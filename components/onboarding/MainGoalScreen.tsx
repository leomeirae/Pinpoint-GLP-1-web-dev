import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { useTheme } from '@/lib/theme-context';

interface MainGoalScreenProps {
  onNext: (data: { mainGoal: string }) => void;
  onBack: () => void;
}

const GOAL_OPTIONS = [
  { id: 'lose_weight', label: 'Perder Peso' },
  { id: 'maintain_weight', label: 'Manter Peso' },
  { id: 'health', label: 'Saúde' },
];

export function MainGoalScreen({ onNext, onBack }: MainGoalScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ mainGoal: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Qual seu principal objetivo com o Pinpoint?"
      subtitle="Escolha a opção que melhor descreve o que você busca."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {GOAL_OPTIONS.map((option) => (
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

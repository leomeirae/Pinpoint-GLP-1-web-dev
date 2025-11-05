import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface DailyRoutineScreenProps {
  onNext: (data: { activityLevel: string }) => void;
  onBack: () => void;
}

const activityLevels = [
  { id: 'sedentary', label: 'Sedentário', description: 'Pouca ou nenhuma atividade física', emoji: '🛋️' },
  { id: 'light', label: 'Levemente ativo', description: 'Exercícios leves 1-3 vezes/semana', emoji: '🚶' },
  { id: 'moderate', label: 'Moderadamente ativo', description: 'Exercícios moderados 3-5 vezes/semana', emoji: '🏃' },
  { id: 'very', label: 'Muito ativo', description: 'Exercícios intensos 6-7 vezes/semana', emoji: '💪' },
  { id: 'extra', label: 'Extremamente ativo', description: 'Exercícios intensos diários + trabalho físico', emoji: '🏋️' },
];

export function DailyRoutineScreen({ onNext, onBack }: DailyRoutineScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ activityLevel: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Como você descreveria seu nível de atividade física?"
      subtitle="Isso nos ajuda a entender melhor seu estilo de vida"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === level.id ? currentAccent : colors.border,
                borderWidth: selected === level.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(level.id)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.emoji}>{level.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {level.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {level.description}
                </Text>
              </View>
            </View>
            {selected === level.id && (
              <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
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
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

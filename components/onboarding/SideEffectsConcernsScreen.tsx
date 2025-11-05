import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface SideEffectsConcernsScreenProps {
  onNext: (data: { sideEffectsConcerns: string[] }) => void;
  onBack: () => void;
}

const sideEffects = [
  { id: 'nausea', label: 'Náusea', emoji: '🤢' },
  { id: 'vomiting', label: 'Vômito', emoji: '🤮' },
  { id: 'diarrhea', label: 'Diarreia', emoji: '🚽' },
  { id: 'constipation', label: 'Constipação', emoji: '😣' },
  { id: 'fatigue', label: 'Fadiga', emoji: '😴' },
  { id: 'headache', label: 'Dor de cabeça', emoji: '🤕' },
  { id: 'other', label: 'Outros', emoji: '❓' },
];

export function SideEffectsConcernsScreen({ onNext, onBack }: SideEffectsConcernsScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    onNext({ sideEffectsConcerns: selected });
  };

  return (
    <OnboardingScreenBase
      title="Quais efeitos colaterais te preocupam?"
      subtitle="Selecione todos que se aplicam. Isso nos ajuda a fornecer dicas personalizadas"
      onNext={handleNext}
      onBack={onBack}
      nextButtonText={selected.length > 0 ? 'Continuar' : 'Pular'}
    >
      <View style={styles.content}>
        <View style={styles.optionsList}>
          {sideEffects.map((effect) => (
            <TouchableOpacity
              key={effect.id}
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: selected.includes(effect.id) ? currentAccent : colors.border,
                  borderWidth: selected.includes(effect.id) ? 2 : 1,
                },
              ]}
              onPress={() => toggleSelection(effect.id)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.emoji}>{effect.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {effect.label}
                </Text>
              </View>
              {selected.includes(effect.id) ? (
                <Ionicons name="checkbox" size={24} color={currentAccent} />
              ) : (
                <Ionicons name="square-outline" size={24} color={colors.border} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selected.length > 0 && (
          <View style={[styles.selectedCount, { backgroundColor: colors.card }]}>
            <Text style={[styles.selectedCountText, { color: colors.textSecondary }]}>
              {selected.length} {selected.length === 1 ? 'selecionado' : 'selecionados'}
            </Text>
          </View>
        )}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  optionsList: {
    gap: 12,
  },
  option: {
    borderRadius: 16,  // Mudança: 12 → 16px (match Shotsy)
    paddingVertical: 20,  // Mudança: separar padding vertical
    paddingHorizontal: 16,  // Mudança: padding horizontal explícito
    minHeight: 72,  // Mudança: 60 → 72px (match Shotsy)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: 18,  // Mudança: 17 → 18px (match Shotsy)
    fontWeight: '500',
  },
  selectedCount: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

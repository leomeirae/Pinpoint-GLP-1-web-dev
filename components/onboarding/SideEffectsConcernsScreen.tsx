import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface SideEffectsConcernsScreenProps {
  onNext: (data: { sideEffectsConcerns: string[] }) => void;
  onBack: () => void;
}

// V0 Design: Simple list
const options = ['Náusea', 'Azia', 'Fadiga', 'Queda de cabelo', 'Prisão de Ventre', 'Perda de massa muscular'];

export function SideEffectsConcernsScreen({ onNext, onBack }: SideEffectsConcernsScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (option: string) => {
    setSelected((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
  };

  const handleNext = () => {
    onNext({ sideEffectsConcerns: selected });
  };

  return (
    <OnboardingScreenBase
      title="Quais efeitos colaterais mais te preocupam (se houver)?"
      subtitle="Nos informe para que possamos personalizar sua experiência."
      onNext={handleNext}
      onBack={onBack}
      disableNext={selected.length === 0}
    >
      <View style={styles.content}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.backgroundSecondary : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.border : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                },
              ]}
              onPress={() => toggleSelection(option)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8, // Extra padding to avoid overlap with back button
  },
  option: {
    borderRadius: 16,
    padding: 16,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

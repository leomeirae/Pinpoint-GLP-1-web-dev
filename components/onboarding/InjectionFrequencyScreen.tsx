import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface InjectionFrequencyScreenProps {
  onNext: (data: { frequency: string }) => void;
  onBack: () => void;
}

// V0 Design: Simple list with specific options
const frequencies = [
  'Todos os dias',
  'A cada 7 dias (mais comum)',
  'A cada 14 dias',
  'Personalizado',
  'Não tenho certeza, ainda estou descobrindo',
];

export function InjectionFrequencyScreen({ onNext, onBack }: InjectionFrequencyScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ frequency: selected });
    }
  };

  const isValid = selected !== null;

  return (
    <OnboardingScreenBase
      title="Com que frequência você tomará suas injeções?"
      subtitle="Escolha 'Não tenho certeza' se você ainda não souber. Você poderá editar isso depois."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        {frequencies.map((freq) => {
          const isSelected = selected === freq;
          return (
            <TouchableOpacity
              key={freq}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? '#1F2937' : colors.backgroundSecondary,
                },
              ]}
              onPress={() => setSelected(freq)}
            >
              <View style={styles.radioContainer}>
                {isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                ) : (
              <View
                style={[
                      styles.radio,
                      {
                        borderColor: colors.border,
                      },
                ]}
                  />
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {freq}
                </Text>
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
    padding: 20,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';

interface InitialDoseScreenProps {
  onNext: (data: { initialDose: string }) => void;
  onBack: () => void;
  medication?: string;
}

// V0 Design: Simple list with "Outro" option
const dosages = ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg', 'Outro'];

export function InitialDoseScreen({
  onNext,
  onBack,
  medication = 'tirzepatide',
}: InitialDoseScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ initialDose: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Você sabe sua dose inicial recomendada?"
      subtitle="Não tem problema se você não tiver certeza!"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {dosages.map((dosage) => (
          <TouchableOpacity
            key={dosage}
            style={[
              styles.option,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: selected === dosage ? colors.primary : 'transparent',
                borderWidth: selected === dosage ? 2 : 0,
              },
            ]}
            onPress={() => setSelected(dosage)}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected === dosage ? colors.primary : colors.border,
                  },
                ]}
              >
                {selected === dosage && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{dosage}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

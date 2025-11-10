import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';

interface MedicationSelectionScreenProps {
  onNext: (data: { medication: string }) => void;
  onBack: () => void;
}

const medications = ['Zepbound®', 'Mounjaro®', 'Ozempic®', 'Wegovy®', 'Tirzepatida', 'Semaglutida'];

export function MedicationSelectionScreen({ onNext, onBack }: MedicationSelectionScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ medication: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Qual medicamento com GLP-1 você planeja usar?"
      subtitle="Se não tiver certeza, escolha a opção mais provável. Você pode mudar depois."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {medications.map((medication) => (
          <TouchableOpacity
            key={medication}
            style={[
              styles.option,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: selected === medication ? colors.primary : 'transparent',
                borderWidth: selected === medication ? 2 : 0,
              },
            ]}
            onPress={() => setSelected(medication)}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected === medication ? colors.primary : colors.border,
                  },
                ]}
              >
                {selected === medication && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{medication}</Text>
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
    lineHeight: 18,
  },
});

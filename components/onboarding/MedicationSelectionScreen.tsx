import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface MedicationSelectionScreenProps {
  onNext: (data: { medication: string }) => void;
  onBack: () => void;
}

const medications = [
  { id: 'zepbound', name: 'Zepbound®', description: 'Tirzepatida para perda de peso' },
  { id: 'mounjaro', name: 'Mounjaro®', description: 'Tirzepatida para diabetes tipo 2' },
  { id: 'ozempic', name: 'Ozempic®', description: 'Semaglutida para diabetes tipo 2' },
  { id: 'wegovy', name: 'Wegovy®', description: 'Semaglutida para perda de peso' },
  { id: 'tirzepatide', name: 'Tirzepatida', description: 'Genérico ou manipulado' },
  { id: 'semaglutide', name: 'Semaglutida', description: 'Genérico ou manipulado' },
];

export function MedicationSelectionScreen({ onNext, onBack }: MedicationSelectionScreenProps) {
  const colors = useShotsyColors();
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
      subtitle="Selecione o medicamento que você está tomando ou vai tomar"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {medications.map((medication) => (
          <TouchableOpacity
            key={medication.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === medication.id ? currentAccent : colors.border,
                borderWidth: selected === medication.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(medication.id)}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {medication.name}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {medication.description}
                </Text>
              </View>
            </View>
            {selected === medication.id && (
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
    borderRadius: 16,  // Mudança: 12 → 16px (match Shotsy)
    paddingVertical: 20,  // Mudança: separar padding vertical
    paddingHorizontal: 16,  // Mudança: padding horizontal explícito
    minHeight: 72,  // Mudança: 60 → 72px (match Shotsy)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,  // Mudança: 17 → 18px (match Shotsy)
    fontWeight: '600',
    marginBottom: 4,  // Mudança: 2 → 4px (match Shotsy)
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

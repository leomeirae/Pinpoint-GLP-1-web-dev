import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface InitialDoseScreenProps {
  onNext: (data: { initialDose: string }) => void;
  onBack: () => void;
  medication?: string;
}

const doses = {
  tirzepatide: [
    { id: '2.5mg', label: '2,5 mg', description: 'Dose inicial típica' },
    { id: '5mg', label: '5 mg', description: 'Segunda dose típica' },
    { id: '7.5mg', label: '7,5 mg', description: 'Dose intermediária' },
    { id: '10mg', label: '10 mg', description: 'Dose intermediária' },
    { id: '12.5mg', label: '12,5 mg', description: 'Dose alta' },
    { id: '15mg', label: '15 mg', description: 'Dose máxima' },
  ],
  semaglutide: [
    { id: '0.25mg', label: '0,25 mg', description: 'Dose inicial típica' },
    { id: '0.5mg', label: '0,5 mg', description: 'Segunda dose típica' },
    { id: '1mg', label: '1 mg', description: 'Dose intermediária' },
    { id: '1.7mg', label: '1,7 mg', description: 'Dose intermediária' },
    { id: '2.4mg', label: '2,4 mg', description: 'Dose máxima' },
  ],
};

export function InitialDoseScreen({ onNext, onBack, medication = 'tirzepatide' }: InitialDoseScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const isSemaglutide = medication === 'ozempic' || medication === 'wegovy' || medication === 'semaglutide';
  const availableDoses = isSemaglutide ? doses.semaglutide : doses.tirzepatide;

  const handleNext = () => {
    if (selected) {
      onNext({ initialDose: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Qual dose inicial foi recomendada?"
      subtitle="Selecione a dose que você vai começar ou está tomando"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {availableDoses.map((dose) => (
          <TouchableOpacity
            key={dose.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === dose.id ? currentAccent : colors.border,
                borderWidth: selected === dose.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(dose.id)}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {dose.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {dose.description}
                </Text>
              </View>
            </View>
            {selected === dose.id && (
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
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

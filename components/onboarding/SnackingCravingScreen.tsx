import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { Ionicons } from '@expo/vector-icons';
import { Brain } from 'phosphor-react-native';

interface SnackingCravingScreenProps {
  onNext: (data: { cravingDay: string }) => void;
  onBack: () => void;
}

const daysOfWeek = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
  { id: 'none', label: 'Não tenho um dia específico' },
];

export function SnackingCravingScreen({ onNext, onBack }: SnackingCravingScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ cravingDay: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Em qual dia da semana você costuma ter mais vontade de beliscar?"
      subtitle="Entender seus gatilhos nos ajuda a criar um plano mais eficaz para você."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        <ShotsyCard style={styles.explanationCard}>
          <Brain size={48} color={colors.primary} />
          <Text style={[styles.explanationTitle, { color: colors.text }]}>
            O que é a "vontade de beliscar"?
          </Text>
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
            São pensamentos intrusivos e constantes sobre comida, tornando difícil resistir a
            desejos e manter escolhas alimentares saudáveis. Medicamentos GLP-1 ajudam a reduzir
            esse "ruído mental".
          </Text>
        </ShotsyCard>

        <View style={styles.optionsList}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: selected === day.id ? currentAccent : colors.border,
                  borderWidth: selected === day.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(day.id)}
            >
              <Text style={[styles.optionLabel, { color: colors.text }]}>{day.label}</Text>
              {selected === day.id && (
                <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  explanationCard: {
    padding: 20,
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 12,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});

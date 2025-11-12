import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ShotsyButton } from '@/components/ui/shotsy-button';

interface StartingWeightScreenProps {
  onNext: (data: { startingWeight: number; startDate: string }) => void;
  onBack: () => void;
  onSkip: () => void;
  startWeight?: number;
  startDate?: string;
}

export function StartingWeightScreen({
  onNext,
  onBack,
  onSkip,
  startWeight = 70,
  startDate: initialDate,
}: StartingWeightScreenProps) {
  const colors = useColors();
  const [weight, setWeight] = useState<number | null>(startWeight);
  const [startDate, setStartDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace('.', ' de');
  };

  const handleNext = () => {
    if (weight !== null) {
        onNext({
        startingWeight: weight,
        startDate: startDate.toISOString().split('T')[0],
        });
    }
  };

  return (
    <OnboardingScreenBase
      title="Qual era o seu peso quando começou o tratamento?"
      subtitle="Este será o ponto de partida da sua jornada."
      onNext={handleNext}
      onBack={onBack}
      disableNext={weight === null}
    >
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.cardContent}>
            <Ionicons name="scale" size={32} color={colors.textSecondary} />
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Peso Inicial (kg)</Text>
              <TextInput
                style={[styles.cardValue, { color: colors.text }]}
                value={weight !== null ? String(weight) : ''}
                onChangeText={(text) => setWeight(Number(text.replace(',', '.')) || null)}
                placeholder="--.-"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        <ShotsyButton
            title="Não lembro"
            onPress={onSkip}
            variant="ghost"
            style={{ marginTop: 12 }}
        />
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});

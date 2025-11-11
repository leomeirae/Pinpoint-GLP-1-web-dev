import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface StartingWeightScreenProps {
  onNext: (data: { startingWeight: number; startDate: string }) => void;
  onBack: () => void;
  startWeight?: number;
  startDate?: string;
}

export function StartingWeightScreen({
  onNext,
  onBack,
  startWeight = 70, // Default to a more realistic weight
  startDate: initialDate,
}: StartingWeightScreenProps) {
  const colors = useColors();
  const [weight, setWeight] = useState(startWeight);
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
    onNext({
      startingWeight: weight,
      startDate: startDate.toISOString().split('T')[0],
    });
  };

  return (
    <OnboardingScreenBase
      title="Conte-nos como você estava quando começou."
      subtitle="Adicione o peso que você tinha quando começou sua jornada, junto com a data de início."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Starting Weight Card - V1 Design (Editable) */}
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.cardContent}>
            <Ionicons name="scale" size={32} color={colors.textSecondary} />
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Peso Inicial (kg)</Text>
              <TextInput
                style={[styles.cardValue, { color: colors.text }]}
                value={String(weight)}
                onChangeText={(text) => setWeight(Number(text.replace(',', '.')) || 0)}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* Start Date Card - V0 Design */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}
        >
            <View style={styles.cardContent}>
            <Ionicons name="calendar" size={32} color={colors.textSecondary} />
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Data de Início</Text>
              <Text style={[styles.cardValue, { color: colors.text }]}>{formatDate(startDate)}</Text>
            </View>
            </View>
          <TouchableOpacity>
            <Ionicons name="pencil" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios' ? showDatePicker : false);
              if (date) setStartDate(date);
            }}
            maximumDate={new Date()}
          />
        )}
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


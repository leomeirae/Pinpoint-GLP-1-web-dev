import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface StartingWeightScreenProps {
  onNext: (data: { startingWeight: number; startDate: string }) => void;
  onBack: () => void;
  weightUnit?: 'kg' | 'lb';
}

export function StartingWeightScreen({ onNext, onBack, weightUnit = 'kg' }: StartingWeightScreenProps) {
  const colors = useShotsyColors();
  const [weight, setWeight] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace('.', ' de');
  };

  const handleNext = () => {
    if (weight) {
      const weightNum = parseFloat(weight);
      if (!isNaN(weightNum) && weightNum > 0) {
        onNext({
          startingWeight: weightNum,
          startDate: startDate.toISOString().split('T')[0],
        });
      }
    }
  };

  const isValid = weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0;

  return (
    <OnboardingScreenBase
      title="Conte-nos como você estava quando começou."
      subtitle="Adicione o peso que você tinha quando começou sua jornada, junto com a data de início."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        {/* Weight Card */}
        <ShotsyCard variant="elevated" style={styles.editableCard}>
          <View style={styles.cardIcon}>
            <Text style={styles.icon}>⚖️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Peso Inicial
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.cardValue, { color: colors.text }]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder={weightUnit === 'kg' ? '104' : '229'}
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.unitSuffix, { color: colors.textSecondary }]}>
                {weightUnit}
              </Text>
            </View>
          </View>
        </ShotsyCard>

        {/* Date Card */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <ShotsyCard variant="elevated" style={styles.editableCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>📅</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                Data de Início
              </Text>
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {formatDate(startDate)}
              </Text>
            </View>
            <View style={styles.cardAction}>
              <Ionicons name="pencil" size={20} color={colors.textMuted} />
            </View>
          </ShotsyCard>
        </TouchableOpacity>

        {/* iOS Date Picker */}
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
  },
  editableCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitSuffix: {
    fontSize: 16,
    fontWeight: '500',
  },
});

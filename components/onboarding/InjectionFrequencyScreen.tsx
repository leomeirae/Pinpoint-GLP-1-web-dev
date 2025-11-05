import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface InjectionFrequencyScreenProps {
  onNext: (data: { frequency: number }) => void;
  onBack: () => void;
}

const frequencies = [
  { id: '7', label: 'Uma vez por semana', days: 7 },
  { id: '5', label: 'A cada 5 dias', days: 5 },
  { id: '3.5', label: 'Duas vezes por semana', days: 3.5 },
  { id: 'custom', label: 'Personalizado', days: 0 },
];

export function InjectionFrequencyScreen({ onNext, onBack }: InjectionFrequencyScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [customDays, setCustomDays] = useState('');

  const handleNext = () => {
    if (selected === 'custom' && customDays) {
      const days = parseFloat(customDays);
      if (!isNaN(days) && days > 0) {
        onNext({ frequency: days });
      }
    } else if (selected) {
      const freq = frequencies.find((f) => f.id === selected);
      if (freq) {
        onNext({ frequency: freq.days });
      }
    }
  };

  const isValid = selected === 'custom'
    ? customDays && !isNaN(parseFloat(customDays)) && parseFloat(customDays) > 0
    : selected !== null;

  return (
    <OnboardingScreenBase
      title="Com que frequência você aplica?"
      subtitle="Selecione o intervalo entre suas aplicações"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        {frequencies.map((freq) => (
          <View key={freq.id}>
            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: selected === freq.id ? currentAccent : colors.border,
                  borderWidth: selected === freq.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(freq.id)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {freq.label}
                  </Text>
                </View>
              </View>
              {selected === freq.id && (
                <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
              )}
            </TouchableOpacity>

            {freq.id === 'custom' && selected === 'custom' && (
              <View style={[styles.customInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
                  A cada quantos dias?
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="decimal-pad"
                    placeholder="7"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>
                    dias
                  </Text>
                </View>
              </View>
            )}
          </View>
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
  },
  customInput: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  customLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  inputSuffix: {
    fontSize: 16,
  },
});

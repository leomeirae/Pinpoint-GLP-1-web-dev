import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface CurrentWeightScreenProps {
  onNext: (data: { currentWeight: number; weightUnit: 'kg' | 'lb' }) => void;
  onBack: () => void;
}

// Gerar arrays para o picker
const generateWholeNumbers = (min: number, max: number) => 
  Array.from({ length: max - min + 1 }, (_, i) => i + min);

const DECIMALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const UNITS = ['kg', 'lb'] as const;

export function CurrentWeightScreen({ onNext, onBack }: CurrentWeightScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  
  // Estado: 3 valores separados (inteiro, decimal, unidade)
  const [wholeNumber, setWholeNumber] = useState(75);
  const [decimal, setDecimal] = useState(0);
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const handleNext = () => {
    const weight = wholeNumber + (decimal / 10);
    onNext({ currentWeight: weight, weightUnit: unit });
  };

  const isValid = wholeNumber > 0;

  return (
    <OnboardingScreenBase
      title="Qual é o seu peso atual?"
      subtitle="Essa será a base para acompanhar seu progresso"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        <ShotsyCard variant="elevated" style={styles.pickerCard}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Peso atual
          </Text>

          {/* Container dos 3 pickers com fade effects */}
          <View style={styles.pickerContainer}>
            {/* Top Fade */}
            <LinearGradient
              colors={[colors.card, 'transparent']}
              style={styles.fadeTop}
              pointerEvents="none"
            />

            <View style={styles.pickersRow}>
              {/* Picker 1: Parte inteira (30-200 kg ou 66-440 lb) */}
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={wholeNumber}
                  onValueChange={(value) => {
                    setWholeNumber(value);
                    Haptics.selectionAsync();
                  }}
                  itemStyle={[styles.pickerItem, { color: colors.text }]}
                >
                  {generateWholeNumbers(
                    unit === 'kg' ? 30 : 66,
                    unit === 'kg' ? 200 : 440
                  ).map((num) => (
                    <Picker.Item key={num} label={`${num}`} value={num} />
                  ))}
                </Picker>
              </View>

              {/* Picker 2: Parte decimal (.0 - .9) */}
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={decimal}
                  onValueChange={(value) => {
                    setDecimal(value);
                    Haptics.selectionAsync();
                  }}
                  itemStyle={[styles.pickerItem, { color: colors.text }]}
                >
                  {DECIMALS.map((dec) => (
                    <Picker.Item key={dec} label={`.${dec}`} value={dec} />
                  ))}
                </Picker>
              </View>

              {/* Picker 3: Unidade (kg/lb) */}
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={unit}
                  onValueChange={(value) => {
                    setUnit(value);
                    // Ajustar wholeNumber se mudar de unidade
                    if (value === 'lb' && wholeNumber < 66) {
                      setWholeNumber(165); // ~75kg
                    } else if (value === 'kg' && wholeNumber > 200) {
                      setWholeNumber(75);
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  itemStyle={[styles.pickerItem, { color: colors.text }]}
                >
                  {UNITS.map((u) => (
                    <Picker.Item key={u} label={u} value={u} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Bottom Fade */}
            <LinearGradient
              colors={['transparent', colors.card]}
              style={styles.fadeBottom}
              pointerEvents="none"
            />
          </View>
        </ShotsyCard>

        <Text style={styles.emoji}>⚖️</Text>

        <ShotsyCard style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Para resultados mais precisos, pese-se sempre no mesmo horário,
            de preferência pela manhã, após ir ao banheiro.
          </Text>
        </ShotsyCard>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  pickerCard: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  pickersRow: {
    flexDirection: 'row',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 24,
    fontWeight: '600',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  tipCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

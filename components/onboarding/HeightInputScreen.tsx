import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';

interface HeightInputScreenProps {
  onNext: (data: { height: number; heightUnit: 'cm' }) => void;
  onBack: () => void;
}

// V1 Design: Expanded range 120-220cm for better inclusion
const HEIGHT_RANGE_CM = Array.from({ length: 101 }, (_, i) => 120 + i); // 120-220cm

export function HeightInputScreen({ onNext, onBack }: HeightInputScreenProps) {
  const colors = useColors();
  const [heightCm, setHeightCm] = useState(170);

  const handleNext = () => {
    onNext({ height: heightCm, heightUnit: 'cm' });
  };

  const handleValueChange = (value: number) => {
    Haptics.selectionAsync();
    setHeightCm(value);
  };

  return (
    <OnboardingScreenBase
      title="Sua altura"
      subtitle="Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={heightCm}
            onValueChange={(itemValue) => handleValueChange(itemValue)}
            style={styles.picker}
            itemStyle={{ color: colors.text, fontSize: 24 }}
          >
            {HEIGHT_RANGE_CM.map((height) => (
              <Picker.Item key={height} label={`${height} cm`} value={height} />
            ))}
          </Picker>
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>cm</Text>
        </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 220,
  },
  unitLabel: {
    position: 'absolute',
    right: '35%',
    top: '50%',
    marginTop: -12,
    fontSize: 24,
  },
});

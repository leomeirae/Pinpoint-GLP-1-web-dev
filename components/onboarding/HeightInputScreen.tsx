import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface HeightInputScreenProps {
  onNext: (data: { height: number; heightUnit: 'cm' | 'ft' }) => void;
  onBack: () => void;
}

const HEIGHT_RANGE_CM = Array.from({ length: 151 }, (_, i) => i + 100); // 100-250cm
const HEIGHT_RANGE_FT = Array.from({ length: 5 }, (_, i) => i + 4); // 4-8 ft
const HEIGHT_RANGE_IN = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

export function HeightInputScreen({ onNext, onBack }: HeightInputScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  const handleNext = () => {
    if (unit === 'cm') {
      onNext({ height: heightCm, heightUnit: 'cm' });
    } else {
      const totalCm = (heightFt * 30.48) + (heightIn * 2.54);
      onNext({ height: totalCm, heightUnit: 'ft' });
    }
  };

  const handleUnitChange = (newUnit: 'cm' | 'ft') => {
    setUnit(newUnit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHeightChange = (value: number, type: 'cm' | 'ft' | 'in') => {
    Haptics.selectionAsync();
    if (type === 'cm') setHeightCm(value);
    else if (type === 'ft') setHeightFt(value);
    else setHeightIn(value);
  };

  return (
    <OnboardingScreenBase
      title="Sua altura"
      subtitle="Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Unit Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'cm' ? currentAccent : 'transparent',
                borderColor: unit === 'cm' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => handleUnitChange('cm')}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'cm' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              centímetros
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'ft' ? currentAccent : 'transparent',
                borderColor: unit === 'ft' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => handleUnitChange('ft')}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'ft' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              polegadas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Picker Container with Fade Effect */}
        <View style={styles.pickerContainer}>
          {/* Top Fade */}
          <LinearGradient
            colors={[colors.background, 'transparent']}
            style={styles.fadeTop}
            pointerEvents="none"
          />

          {unit === 'cm' ? (
            <Picker
              selectedValue={heightCm}
              onValueChange={(value) => handleHeightChange(value, 'cm')}
              style={styles.picker}
              itemStyle={[styles.pickerItem, { color: colors.text }]}
            >
              {HEIGHT_RANGE_CM.map((cm) => (
                <Picker.Item key={cm} label={`${cm}cm`} value={cm} />
              ))}
            </Picker>
          ) : (
            <View style={styles.dualPickerRow}>
              <Picker
                selectedValue={heightFt}
                onValueChange={(value) => handleHeightChange(value, 'ft')}
                style={styles.pickerHalf}
                itemStyle={[styles.pickerItem, { color: colors.text }]}
              >
                {HEIGHT_RANGE_FT.map((ft) => (
                  <Picker.Item key={ft} label={`${ft} ft`} value={ft} />
                ))}
              </Picker>
              <Picker
                selectedValue={heightIn}
                onValueChange={(value) => handleHeightChange(value, 'in')}
                style={styles.pickerHalf}
                itemStyle={[styles.pickerItem, { color: colors.text }]}
              >
                {HEIGHT_RANGE_IN.map((inches) => (
                  <Picker.Item key={inches} label={`${inches} in`} value={inches} />
                ))}
              </Picker>
            </View>
          )}

          {/* Bottom Fade */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'relative',
    height: 220,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  picker: {
    height: 220,
    width: '100%',
  },
  pickerItem: {
    fontSize: 22,
    height: 44,
  },
  dualPickerRow: {
    flexDirection: 'row',
    height: 220,
  },
  pickerHalf: {
    flex: 1,
  },
});

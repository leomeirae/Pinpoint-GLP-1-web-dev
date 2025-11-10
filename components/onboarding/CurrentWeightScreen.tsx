import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import * as Haptics from 'expo-haptics';

interface CurrentWeightScreenProps {
  onNext: (data: { currentWeight: number; weightUnit: 'kg' }) => void;
  onBack: () => void;
}

// V0 Design: Simple range 50-150kg
const WEIGHT_RANGE_KG = Array.from({ length: 100 }, (_, i) => 50 + i); // 50-150kg

export function CurrentWeightScreen({ onNext, onBack }: CurrentWeightScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [weight, setWeight] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (weight !== null) {
      onNext({ currentWeight: weight, weightUnit: 'kg' });
    }
  };

  // Scroll to selected weight on mount
  useEffect(() => {
    if (weight !== null) {
      const timer = setTimeout(() => {
        const index = WEIGHT_RANGE_KG.indexOf(weight);
        if (index !== -1 && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: index * 48 - 104, // Center the item
            animated: false,
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [weight]);

  const handleWeightChange = (value: number) => {
    Haptics.selectionAsync();
    setWeight(value);
    // Scroll to selected weight
    const index = WEIGHT_RANGE_KG.indexOf(value);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * 48 - 104,
        animated: true,
      });
    }
  };

  return (
    <OnboardingScreenBase
      title="Seu peso atual"
      subtitle="Agora vamos registrar seu peso atual, para que possamos acompanhar seu progresso."
      onNext={handleNext}
      onBack={onBack}
      disableNext={weight === null}
    >
      <View style={styles.content}>
        {/* Weight Picker - V0 Design */}
          <View style={styles.pickerContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.pickerScroll}
            contentContainerStyle={styles.pickerContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={48}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const index = Math.round((offsetY + 104) / 48);
              if (index >= 0 && index < WEIGHT_RANGE_KG.length) {
                handleWeightChange(WEIGHT_RANGE_KG[index]);
              }
            }}
          >
            {WEIGHT_RANGE_KG.map((w) => {
              const isSelected = w === weight;
              return (
                <TouchableOpacity
                  key={w}
                  style={styles.pickerItem}
                  onPress={() => handleWeightChange(w)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      {
                        color: isSelected ? colors.text : colors.textMuted,
                        fontSize: isSelected ? 24 : 20,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                >
                    {w}kg
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {/* Selection Indicator */}
          <View style={[styles.selectionIndicator, { backgroundColor: colors.backgroundSecondary }]} />
          </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 32,
    paddingHorizontal: 24,
  },
  pickerContainer: {
    position: 'relative',
    height: 256,
    marginBottom: 32,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerContent: {
    alignItems: 'center',
    paddingVertical: 104, // Center the items
  },
  pickerItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pickerText: {
    fontSize: 24,
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 48,
    marginTop: -24,
    borderRadius: 12,
    zIndex: -1,
  },
});

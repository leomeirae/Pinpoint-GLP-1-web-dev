import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface HeightInputScreenProps {
  onNext: (data: { height: number; heightUnit: 'cm' }) => void;
  onBack: () => void;
}

// V0 Design: Simple range 150-200cm
const HEIGHT_RANGE_CM = Array.from({ length: 50 }, (_, i) => 150 + i); // 150-200cm

export function HeightInputScreen({ onNext, onBack }: HeightInputScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [heightCm, setHeightCm] = useState(170);

  const handleNext = () => {
      onNext({ height: heightCm, heightUnit: 'cm' });
  };

  const handleHeightChange = (value: number) => {
    Haptics.selectionAsync();
    setHeightCm(value);
  };

  // Scroll to selected height on mount
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    // Scroll to initial height after a short delay to ensure layout is complete
    const timer = setTimeout(() => {
      const index = HEIGHT_RANGE_CM.indexOf(heightCm);
      if (index !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: index * 48 - 104, // Center the item
          animated: false,
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <OnboardingScreenBase
      title="Sua altura"
      subtitle="Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Height Picker - V0 Design */}
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
              if (index >= 0 && index < HEIGHT_RANGE_CM.length) {
                handleHeightChange(HEIGHT_RANGE_CM[index]);
              }
            }}
          >
            {HEIGHT_RANGE_CM.map((height) => {
              const isSelected = height === heightCm;
              return (
          <TouchableOpacity
                  key={height}
                  style={styles.pickerItem}
                  onPress={() => handleHeightChange(height)}
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
                    {height}cm
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

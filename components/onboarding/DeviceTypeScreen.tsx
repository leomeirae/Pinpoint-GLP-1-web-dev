import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface DeviceTypeScreenProps {
  onNext: (data: { deviceType: string }) => void;
  onBack: () => void;
}

const devices = [
  { id: 'pen', name: 'Caneta pré-preenchida', emoji: '🖊️', description: 'Dispositivo pronto para uso' },
  { id: 'syringe', name: 'Seringa', emoji: '💉', description: 'Seringa convencional' },
  { id: 'autoinjector', name: 'Auto-injetor', emoji: '⚡', description: 'Dispositivo automático' },
];

export function DeviceTypeScreen({ onNext, onBack }: DeviceTypeScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext({ deviceType: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Que tipo de dispositivo você usa?"
      subtitle="Selecione o tipo de aplicador que você utiliza"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!selected}
    >
      <View style={styles.content}>
        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: selected === device.id ? currentAccent : colors.border,
                borderWidth: selected === device.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelected(device.id)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.emoji}>{device.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {device.name}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {device.description}
                </Text>
              </View>
            </View>
            {selected === device.id && (
              <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  option: {
    borderRadius: 12,  // Mudança: 16 → 12px (design system)
    padding: 20,
    minHeight: 80,  // Maior por causa do padding 20px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

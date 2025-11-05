import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface AlreadyUsingGLP1ScreenProps {
  onNext: (data: { alreadyUsing: boolean }) => void;
  onBack: () => void;
}

export function AlreadyUsingGLP1Screen({ onNext, onBack }: AlreadyUsingGLP1ScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleNext = () => {
    if (selected !== null) {
      onNext({ alreadyUsing: selected });
    }
  };

  return (
    <OnboardingScreenBase
      title="Você já está tomando algum medicamento com GLP-1?"
      subtitle="Isso nos ajudará a personalizar sua experiência"
      onNext={handleNext}
      onBack={onBack}
      disableNext={selected === null}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: colors.card,
              borderColor: selected === true ? currentAccent : colors.border,
              borderWidth: selected === true ? 2 : 1,
            },
          ]}
          onPress={() => setSelected(true)}
        >
          <View style={styles.optionContent}>
            <Text style={styles.emoji}>💉</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Já estou tomando GLP-1
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Já comecei meu tratamento e quero acompanhar meu progresso
              </Text>
            </View>
          </View>
          {selected === true && (
            <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: colors.card,
              borderColor: selected === false ? currentAccent : colors.border,
              borderWidth: selected === false ? 2 : 1,
            },
          ]}
          onPress={() => setSelected(false)}
        >
          <View style={styles.optionContent}>
            <Text style={styles.emoji}>📝</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Eu ainda não comecei a usar GLP-1
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                Vou começar em breve e quero me preparar
              </Text>
            </View>
          </View>
          {selected === false && (
            <Ionicons name="checkmark-circle" size={24} color={currentAccent} />
          )}
        </TouchableOpacity>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  option: {
    borderRadius: 12,  // Mudança: 16 → 12px (consistência design system)
    padding: 20,
    minHeight: 100,  // Garantir altura adequada para opções com emoji + texto
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
    fontSize: 40,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

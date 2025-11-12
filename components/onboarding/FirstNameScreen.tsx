import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

interface FirstNameScreenProps {
  onNext: (data: { firstName: string }) => void;
  onBack: () => void;
}

export function FirstNameScreen({ onNext, onBack }: FirstNameScreenProps) {
  const colors = useColors();
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim()) {
      onNext({ firstName: name.trim() });
    }
  };

  return (
    <OnboardingScreenBase
      title="Olá! Para começar, como podemos te chamar?"
      subtitle="Seu nome nos ajuda a personalizar sua experiência."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!name.trim()}
    >
      <View style={styles.content}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundSecondary,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Digite seu nome"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleNext}
        />
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  input: {
    ...ShotsyDesignTokens.typography.h2,
    height: 60,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    textAlign: 'center',
  },
});

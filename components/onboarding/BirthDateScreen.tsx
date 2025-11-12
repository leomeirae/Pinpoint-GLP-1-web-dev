import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

interface BirthDateScreenProps {
  onNext: (data: { birthDate: string }) => void;
  onBack: () => void;
}

export function BirthDateScreen({ onNext, onBack }: BirthDateScreenProps) {
  const colors = useColors();

  // Set initial date to 18 years ago
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const [date, setDate] = useState(eighteenYearsAgo);
  const [isPickerVisible, setPickerVisible] = useState(true); // Always visible on this screen

  const handleNext = () => {
    // Basic age validation (user must be at least 18)
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      // Not yet had birthday this year
    }
    if (age >= 18) {
      onNext({ birthDate: date.toISOString().split('T')[0] });
    } else {
      // (Optional) Show an alert if validation fails, though button is disabled
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setPickerVisible(false); // On Android, picker is a modal
    }
    setDate(currentDate);
  };

  // Disable next button if user is under 18
  const isAgeValid = () => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return age >= 18;
  }

  return (
    <OnboardingScreenBase
      title="Qual a sua data de nascimento?"
      subtitle="Sua idade é importante para calcularmos suas necessidades calóricas."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isAgeValid()}
    >
      <View style={styles.content}>
        {isPickerVisible && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            maximumDate={eighteenYearsAgo} // User must be at least 18
            textColor={colors.text}
          />
        )}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    flex: 1,
  },
});

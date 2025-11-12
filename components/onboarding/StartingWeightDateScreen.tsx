import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface StartingWeightDateScreenProps {
  onNext: (data: { startingWeightDate: string }) => void;
  onBack: () => void;
}

export function StartingWeightDateScreen({ onNext, onBack }: StartingWeightDateScreenProps) {
  const colors = useColors();
  const [date, setDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(true);

  const handleNext = () => {
    onNext({ startingWeightDate: date.toISOString().split('T')[0] });
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }
    setDate(currentDate);
  };

  return (
    <OnboardingScreenBase
      title="Em que data você registrou esse peso?"
      subtitle="A data nos ajuda a criar seu gráfico de progresso."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {isPickerVisible && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            maximumDate={new Date()} // Cannot be in the future
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

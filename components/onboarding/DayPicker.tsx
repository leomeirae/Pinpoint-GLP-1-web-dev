// components/onboarding/DayPicker.tsx
// Seletor de dia da semana (seg-dom)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

const DAYS = [
  { value: 0, label: 'Do', fullLabel: 'Domingo' },
  { value: 1, label: 'Seg', fullLabel: 'Segunda-feira' },
  { value: 2, label: 'Ter', fullLabel: 'Terça-feira' },
  { value: 3, label: 'Qua', fullLabel: 'Quarta-feira' },
  { value: 4, label: 'Qui', fullLabel: 'Quinta-feira' },
  { value: 5, label: 'Sex', fullLabel: 'Sexta-feira' },
  { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
] as const;

interface DayPickerProps {
  selectedDay?: number; // 0-6 (dom-sab)
  onSelectDay: (day: number) => void;
}

export function DayPicker({ selectedDay, onSelectDay }: DayPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container} accessibilityLabel="Selecione o dia da semana">
      {DAYS.map((day) => {
        const isSelected = selectedDay === day.value;

        return (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayButton,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => onSelectDay(day.value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${day.fullLabel}${isSelected ? ' selecionado' : ''}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.dayLabel,
                {
                  color: isSelected ? '#FFFFFF' : colors.text,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.sm,
    justifyContent: 'center',
    paddingVertical: ShotsyDesignTokens.spacing.sm, // Evitar corte inferior
  },
  dayButton: {
    minWidth: 44,
    width: 44,
    height: 56, // Touch area confortável
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ShotsyDesignTokens.spacing.xs,
  },
  dayLabel: {
    ...ShotsyDesignTokens.typography.label,
    fontSize: 13,
    textAlign: 'center',
  },
});


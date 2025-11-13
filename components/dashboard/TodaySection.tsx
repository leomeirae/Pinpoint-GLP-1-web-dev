import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';

interface TodaySectionProps {
  todayWeight?: number;
  todayCalories?: number;
  todayProtein?: number;
  todaySideEffects?: string[];
  todayNotes?: string;
}

export function TodaySection({
  todayWeight,
  todayCalories,
  todayProtein,
  todaySideEffects,
  todayNotes,
}: TodaySectionProps) {
  const colors = useShotsyColors();

  const handleWeightPress = () => {
    router.push('/(tabs)/add-weight');
  };

  const handleCaloriesPress = () => {
    // Feature removida - IA de nutrição não está mais disponível
  };

  const handleProteinPress = () => {
    // Feature removida - IA de nutrição não está mais disponível
  };

  const handleSideEffectsPress = () => {
    Alert.alert(
      'Em breve',
      'A funcionalidade de registro de efeitos colaterais estará disponível em breve!'
    );
  };

  const handleNotesPress = () => {
    Alert.alert('Em breve', 'A funcionalidade de notas diárias estará disponível em breve!');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Hoje</Text>

      {/* Grid de 4 cards pequenos em 2x2 */}
      <View style={styles.grid}>
        {/* Card de Peso */}
        <TouchableOpacity
          style={styles.smallCardContainer}
          onPress={handleWeightPress}
          activeOpacity={0.7}
        >
          <ShotsyCard style={styles.card}>
            <Text style={styles.emoji}>⚖️</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>PESO</Text>
            {todayWeight ? (
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {todayWeight.toFixed(1)} kg
              </Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.textMuted }]}>
                Toque para{'\n'}adicionar
              </Text>
            )}
          </ShotsyCard>
        </TouchableOpacity>

        {/* Card de Calorias */}
        <TouchableOpacity
          style={styles.smallCardContainer}
          onPress={handleCaloriesPress}
          activeOpacity={0.7}
        >
          <ShotsyCard style={styles.card}>
            <Text style={styles.emoji}>🍖</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>CALORIAS</Text>
            {todayCalories ? (
              <Text style={[styles.cardValue, { color: colors.text }]}>{todayCalories} kcal</Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.textMuted }]}>
                Toque para{'\n'}adicionar
              </Text>
            )}
          </ShotsyCard>
        </TouchableOpacity>

        {/* Card de Proteína */}
        <TouchableOpacity
          style={styles.smallCardContainer}
          onPress={handleProteinPress}
          activeOpacity={0.7}
        >
          <ShotsyCard style={styles.card}>
            <Text style={styles.emoji}>🥩</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>PROTEÍNA</Text>
            {todayProtein ? (
              <Text style={[styles.cardValue, { color: colors.text }]}>{todayProtein}g</Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.textMuted }]}>
                Toque para{'\n'}adicionar
              </Text>
            )}
          </ShotsyCard>
        </TouchableOpacity>

        {/* Card de Efeitos Colaterais */}
        <TouchableOpacity
          style={styles.smallCardContainer}
          onPress={handleSideEffectsPress}
          activeOpacity={0.7}
        >
          <ShotsyCard style={styles.card}>
            <Text style={styles.emoji}>😷</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>EFEITOS</Text>
            {todaySideEffects && todaySideEffects.length > 0 ? (
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {todaySideEffects.length} {todaySideEffects.length === 1 ? 'efeito' : 'efeitos'}
              </Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.textMuted }]}>
                Toque para{'\n'}adicionar
              </Text>
            )}
          </ShotsyCard>
        </TouchableOpacity>
      </View>

      {/* Card de Notas (full-width) */}
      <TouchableOpacity
        onPress={handleNotesPress}
        activeOpacity={0.7}
        style={styles.notesContainer}
      >
        <ShotsyCard style={styles.fullCard}>
          <View style={styles.fullCardHeader}>
            <Text style={styles.emoji}>📝</Text>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>NOTAS DIÁRIAS</Text>
          </View>
          {todayNotes ? (
            <Text style={[styles.fullCardValue, { color: colors.text }]} numberOfLines={2}>
              {todayNotes}
            </Text>
          ) : (
            <Text style={[styles.placeholder, { color: colors.textMuted }]}>
              Toque para adicionar suas notas do dia
            </Text>
          )}
        </ShotsyCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallCardContainer: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  notesContainer: {
    marginTop: 4,
  },
  fullCard: {
    minHeight: 80,
  },
  fullCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fullCardValue: {
    fontSize: 14,
    lineHeight: 20,
  },
});

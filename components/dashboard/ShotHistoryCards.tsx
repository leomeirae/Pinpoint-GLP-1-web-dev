import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';
import { Syringe, Pill, ChartLineUp } from 'phosphor-react-native';

interface ShotHistoryData {
  totalShots: number;
  lastDose: number | null;
  estimatedLevel: number | null;
}

interface ShotHistoryCardsProps {
  data: ShotHistoryData;
}

export function ShotHistoryCards({ data }: ShotHistoryCardsProps) {
  const colors = useShotsyColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Histórico de Injeções</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/shots')}>
          <Text style={[styles.link, { color: colors.primary }]}>Ver tudo ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cards}>
        <ShotsyCard style={styles.card}>
          <Syringe size={24} color={colors.textSecondary} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Injeções tomadas</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{data.totalShots}</Text>
        </ShotsyCard>

        <ShotsyCard style={styles.card}>
          <Pill size={24} color={colors.textSecondary} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Última dose</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {data.lastDose ? `${data.lastDose}mg` : '--'}
          </Text>
        </ShotsyCard>

        <ShotsyCard style={styles.card}>
          <ChartLineUp size={24} color={colors.textSecondary} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Nível Est.</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {data.estimatedLevel ? `${data.estimatedLevel}mg` : '--'}
          </Text>
        </ShotsyCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotCard, Shot } from '@/components/shots/ShotCard';
import { FilterChips } from '@/components/shots/FilterChips';
import { ShotsStats } from '@/components/shots/ShotsStats';
import { AppIcon } from '@/components/ui/icons';
import { router } from 'expo-router';
import { useApplications } from '@/hooks/useApplications';
import { useProfile } from '@/hooks/useProfile';
import { calculateNextShotDate } from '@/lib/pharmacokinetics';

const FILTERS = [
  'Todos',
  'Últimos 7 dias',
  'Últimos 30 dias',
  'Últimos 90 dias',
  'Este ano',
];

export default function ShotsScreen() {
  const colors = useShotsyColors();
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch real data from Supabase
  const { applications, loading, deleteApplication, refetch: refetchApplications } = useApplications();
  const { profile } = useProfile();

  // Map Application to Shot format
  const shots = useMemo(() => {
    return applications.map(app => ({
      id: app.id,
      date: app.date,
      dosage: app.dosage,
      injectionSites: app.injection_sites,
      sideEffects: app.side_effects,
      notes: app.notes,
    }));
  }, [applications]);

  // Filtrar shots baseado no filtro selecionado
  const filteredShots = useMemo(() => {
    const now = new Date();

    switch (selectedFilter) {
      case 'Últimos 7 dias':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return shots.filter(shot => shot.date >= sevenDaysAgo);
      case 'Últimos 30 dias':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return shots.filter(shot => shot.date >= thirtyDaysAgo);
      case 'Últimos 90 dias':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return shots.filter(shot => shot.date >= ninetyDaysAgo);
      case 'Este ano':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return shots.filter(shot => shot.date >= startOfYear);
      default:
        return shots;
    }
  }, [shots, selectedFilter]);

  // Agrupar shots por mês/ano
  const groupedShots = useMemo(() => {
    const groups: { [key: string]: Shot[] } = {};

    // ✅ Criar formatter UMA VEZ fora do loop para melhor performance
    const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    filteredShots.forEach(shot => {
      const key = monthYearFormatter.format(shot.date);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(shot);
    });

    return groups;
  }, [filteredShots]);

  // Calcular estatísticas reais
  const totalShots = shots.length;
  const currentDose = shots[0]?.dosage || 0;
  
  const daysUntilNext = useMemo(() => {
    if (applications.length === 0) return 0;
    
    const frequency = profile?.frequency || 'weekly';
    let intervalDays = 7; // Default weekly
    
    const freq = frequency.toLowerCase();
    if (freq.includes('biweekly') || freq.includes('bi-weekly')) {
      intervalDays = 14;
    } else if (freq.includes('daily') || freq.includes('day')) {
      intervalDays = 1;
    }

    const medicationApps = applications.map(app => ({
      dose: app.dosage,
      date: app.date,
    }));

    const nextDate = calculateNextShotDate(medicationApps, intervalDays);
    if (!nextDate) return 0;
    
    const now = new Date();
    const daysDiff = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff);
  }, [applications, profile?.frequency]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchApplications();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando injeções...
        </Text>
      </View>
    );
  }

  // Empty state
  if (shots.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <AppIcon name="syringe" size="xl" color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Nenhuma injeção registrada
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Comece adicionando sua primeira aplicação
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/add-application')}
        >
          <Text style={styles.emptyButtonText}>Adicionar Injeção</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <FilterChips
            filters={FILTERS}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          <ShotsStats
            totalShots={totalShots}
            currentDose={currentDose}
            daysUntilNext={daysUntilNext}
          />

          <View style={styles.listContainer}>
            {Object.entries(groupedShots).map(([monthYear, groupShots]) => (
              <View key={monthYear} style={styles.group}>
                <Text style={[styles.groupHeader, { color: colors.textSecondary }]}>
                  {monthYear}
                </Text>
                {groupShots.map((shot) => (
                  <ShotCard key={shot.id} shot={shot} onDelete={handleDelete} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  group: {
    marginBottom: 24,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 72,  // Mudança: 80 → 72px (Shotsy icon size standard)
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

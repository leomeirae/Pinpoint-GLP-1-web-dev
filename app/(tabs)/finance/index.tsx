// app/(tabs)/finance/index.tsx
// Tela de resumo financeiro

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Receipt } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';
import { usePurchases } from '@/hooks/usePurchases';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import {
  calculateTotalSpent,
  calculateWeeklySpent,
  calculateCostPerKg,
  predictNextPurchase,
} from '@/lib/finance';
import { FinancialSummaryCard } from '@/components/finance/FinancialSummaryCard';
import { PurchaseListItem } from '@/components/finance/PurchaseListItem';
import { CostPerKgOptInModal } from '@/components/finance/CostPerKgOptInModal';
import { createLogger } from '@/lib/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logger = createLogger('FinanceScreen');

const OPTIN_SHOWN_KEY = '@finance_optin_shown';

export default function FinanceScreen() {
  const colors = useColors();
  const router = useRouter();
  const { userId } = useAuth();
  const { purchases, loading, error, deletePurchase, refetch } = usePurchases();
  const { applications } = useApplications();

  const [financeOptIn, setFinanceOptIn] = useState<boolean>(false);
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile para opt-in e peso
  useEffect(() => {
    if (!userId) return;

    fetchUserProfile();
  }, [userId]);

  // Mostrar modal de opt-in na primeira vez (se houver 2+ aplicações e dados de peso)
  useEffect(() => {
    if (!userId) return;
    
    const checkOptInShown = async () => {
      const shown = await AsyncStorage.getItem(OPTIN_SHOWN_KEY);
      
      // Se nunca mostrou modal e usuário não tem opt-in
      if (!shown && !financeOptIn && applications.length >= 2 && currentWeight && startWeight) {
        setShowOptInModal(true);
        await AsyncStorage.setItem(OPTIN_SHOWN_KEY, 'true');
      }
    };

    checkOptInShown();
  }, [userId, financeOptIn, applications.length, currentWeight, startWeight]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('finance_opt_in, start_weight, current_weight')
        .eq('clerk_id', userId)
        .single();

      if (profileError) {
        logger.error('Error fetching user profile', profileError);
        return;
      }

      if (data) {
        setFinanceOptIn(data.finance_opt_in || false);
        setStartWeight(data.start_weight);
        setCurrentWeight(data.current_weight);
      }
    } catch (err) {
      logger.error('Error fetching user profile', err as Error);
    }
  };

  const handleOptInAccept = async () => {
    if (!userId) return;

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ finance_opt_in: true })
        .eq('clerk_id', userId);

      if (updateError) {
        logger.error('Error updating finance opt-in', updateError);
        return;
      }

      setFinanceOptIn(true);
      setShowOptInModal(false);
      logger.info('Finance opt-in accepted');
    } catch (err) {
      logger.error('Error updating finance opt-in', err as Error);
    }
  };

  const handleOptInDecline = () => {
    setShowOptInModal(false);
    logger.info('Finance opt-in declined');
  };

  const handleAddPurchase = () => {
    router.push('/(tabs)/finance/add-purchase');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await fetchUserProfile();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deletePurchase(id);
  };

  const handleOptInInfoPress = () => {
    setShowOptInModal(true);
  };

  // Calcular métricas
  const totalSpentCents = calculateTotalSpent(purchases);
  const weeklySpentCents = calculateWeeklySpent(purchases);
  const nextPurchaseDate = predictNextPurchase(purchases);
  const costPerKgCents = calculateCostPerKg(purchases, startWeight, currentWeight, financeOptIn);

  // Estado vazio
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Receipt size={64} color={colors.textMuted} weight="thin" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Nenhuma compra registrada
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Comece registrando suas compras de medicamentos para acompanhar seus gastos.
      </Text>
      <ScalePress
        onPress={handleAddPurchase}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        hapticType="medium"
      >
        <Plus size={24} color="#FFFFFF" weight="bold" />
        <Text style={styles.emptyButtonText}>Adicionar Primeira Compra</Text>
      </ScalePress>
    </View>
  );

  // Loading
  if (loading && purchases.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Erro ao carregar compras
        </Text>
        <ScalePress
          onPress={handleRefresh}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          hapticType="light"
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </ScalePress>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PurchaseListItem purchase={item} onDelete={handleDelete} />
        )}
        ListHeaderComponent={
          purchases.length > 0 ? (
            <View style={styles.header}>
              <FinancialSummaryCard
                totalSpentCents={totalSpentCents}
                weeklySpentCents={weeklySpentCents}
                nextPurchaseDate={nextPurchaseDate}
                costPerKgCents={costPerKgCents}
                hasOptIn={financeOptIn}
                onOptInPress={handleOptInInfoPress}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          purchases.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {purchases.length > 0 && (
        <ScalePress
          onPress={handleAddPurchase}
          style={[styles.fab, { backgroundColor: colors.primary }, ShotsyDesignTokens.shadows.fab]}
          hapticType="medium"
          accessibilityLabel="Adicionar compra"
          accessibilityHint="Toque para adicionar uma nova compra"
        >
          <Plus size={28} color="#FFFFFF" weight="bold" />
        </ScalePress>
      )}

      {/* Modal de Opt-in */}
      <CostPerKgOptInModal
        visible={showOptInModal}
        onAccept={handleOptInAccept}
        onDecline={handleOptInDecline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: ShotsyDesignTokens.spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: ShotsyDesignTokens.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  emptyTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...ShotsyDesignTokens.typography.body,
    textAlign: 'center',
    marginBottom: ShotsyDesignTokens.spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    paddingHorizontal: ShotsyDesignTokens.spacing.xl,
  },
  emptyButtonText: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: ShotsyDesignTokens.spacing.xl,
    right: ShotsyDesignTokens.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  retryButton: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    paddingHorizontal: ShotsyDesignTokens.spacing.xl,
  },
  retryButtonText: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
  },
});


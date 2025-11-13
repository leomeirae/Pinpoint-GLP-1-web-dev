// components/finance/PurchaseListItem.tsx
// Item de lista para exibir uma compra

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Pencil, Trash } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';
import { formatCurrency } from '@/lib/finance';
import type { Purchase } from '@/lib/finance';

interface PurchaseListItemProps {
  purchase: Purchase;
  onDelete: (id: string) => Promise<void>;
}

export function PurchaseListItem({ purchase, onDelete }: PurchaseListItemProps) {
  const colors = useColors();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/finance/add-purchase',
      params: { purchaseId: purchase.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Deletar Compra',
      'Tem certeza que deseja deletar esta compra? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await onDelete(purchase.id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a compra. Tente novamente.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        ShotsyDesignTokens.shadows.card,
        deleting && styles.deleting,
      ]}
    >
      <View style={styles.content}>
        {/* Header com medicamento e dosagem */}
        <View style={styles.header}>
          <View style={styles.medicationInfo}>
            <Text style={[styles.medication, { color: colors.text }]}>
              {purchase.medication}
            </Text>
            {purchase.brand && (
              <Text style={[styles.brand, { color: colors.textMuted }]}>
                {purchase.brand}
              </Text>
            )}
          </View>
          <Text style={[styles.dosage, { color: colors.primary }]}>
            {purchase.dosage}{purchase.unit}
          </Text>
        </View>

        {/* Detalhes */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Quantidade:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {purchase.quantity} {purchase.package_form}(s)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Preço:
            </Text>
            <Text style={[styles.detailValue, styles.price, { color: colors.success }]}>
              {formatCurrency(purchase.total_price_cents)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Data:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(purchase.purchase_date)}
            </Text>
          </View>

          {purchase.location && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Local:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {purchase.location}
              </Text>
            </View>
          )}

          {purchase.notes && (
            <Text style={[styles.notes, { color: colors.textMuted }]}>
              {purchase.notes}
            </Text>
          )}
        </View>
      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <ScalePress
          onPress={handleEdit}
          style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
          hapticType="light"
          accessibilityLabel="Editar compra"
          accessibilityHint="Toque para editar esta compra"
        >
          <Pencil size={20} color={colors.text} weight="regular" />
        </ScalePress>

        <ScalePress
          onPress={handleDelete}
          style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
          hapticType="light"
          disabled={deleting}
          accessibilityLabel="Deletar compra"
          accessibilityHint="Toque para deletar esta compra"
        >
          <Trash size={20} color={colors.error} weight="regular" />
        </ScalePress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.md,
    borderWidth: 1,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  deleting: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  medicationInfo: {
    flex: 1,
  },
  medication: {
    ...ShotsyDesignTokens.typography.h5,
    marginBottom: 2,
  },
  brand: {
    ...ShotsyDesignTokens.typography.caption,
  },
  dosage: {
    ...ShotsyDesignTokens.typography.h5,
    fontWeight: '700',
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...ShotsyDesignTokens.typography.caption,
  },
  detailValue: {
    ...ShotsyDesignTokens.typography.caption,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
  },
  notes: {
    ...ShotsyDesignTokens.typography.tiny,
    marginTop: ShotsyDesignTokens.spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    marginLeft: ShotsyDesignTokens.spacing.sm,
    gap: ShotsyDesignTokens.spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


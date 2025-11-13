// components/onboarding/DosageSelector.tsx
// Seletor de doses condicionadas por medicamento

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { Plus } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { MedicationConfig } from '@/constants/medications';

interface DosageSelectorProps {
  medication?: MedicationConfig;
  selectedDosage?: number;
  onSelectDosage: (dosage: number) => void;
}

export function DosageSelector({
  medication,
  selectedDosage,
  onSelectDosage,
}: DosageSelectorProps) {
  const colors = useColors();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDose, setCustomDose] = useState('');

  if (!medication) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Selecione um medicamento primeiro
        </Text>
      </View>
    );
  }

  const availableDoses = medication.availableDoses || [];

  if (availableDoses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Nenhuma dose disponível para este medicamento
        </Text>
      </View>
    );
  }

  const handleCustomDose = () => {
    const dose = parseFloat(customDose);
    if (!isNaN(dose) && dose > 0) {
      onSelectDosage(dose);
      setShowCustomInput(false);
      setCustomDose('');
    }
  };

  // Verificar se a dose selecionada é customizada (não está na lista padrão)
  const isCustomDose = selectedDosage !== undefined && !availableDoses.includes(selectedDosage);

  return (
    <>
      <Modal
        visible={showCustomInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomInput(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCustomInput(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Dose customizada
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Digite a dose em {medication.unit}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={customDose}
              onChangeText={setCustomDose}
              keyboardType="decimal-pad"
              placeholder="Ex: 3, 6, 8.5"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomDose('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCustomDose}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel={`Doses disponíveis para ${medication.name}`}
    >
      {availableDoses.map((dose) => {
        const isSelected = selectedDosage === dose;

        return (
          <TouchableOpacity
            key={dose}
            style={[
              styles.dosageButton,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => onSelectDosage(dose)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${dose} ${medication.unit}${isSelected ? ' selecionado' : ''}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.dosageValue,
                {
                  color: isSelected ? '#FFFFFF' : colors.text,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}
            >
              {dose}
            </Text>
            <Text
              style={[
                styles.dosageUnit,
                {
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {medication.unit}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Botão "Outro" para dose customizada */}
      <TouchableOpacity
        style={[
          styles.dosageButton,
          {
            backgroundColor: isCustomDose ? colors.primary : colors.card,
            borderColor: isCustomDose ? colors.primary : colors.border,
          },
          ShotsyDesignTokens.shadows.card,
        ]}
        onPress={() => setShowCustomInput(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Dose customizada"
      >
        {isCustomDose ? (
          <>
            <Text
              style={[
                styles.dosageValue,
                {
                  color: '#FFFFFF',
                  fontWeight: '700',
                },
              ]}
            >
              {selectedDosage}
            </Text>
            <Text
              style={[
                styles.dosageUnit,
                {
                  color: '#FFFFFF',
                },
              ]}
            >
              {medication.unit}
            </Text>
          </>
        ) : (
          <>
            <Plus size={32} color={colors.primary} weight="bold" />
            <Text
              style={[
                styles.dosageUnit,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Outro
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
  },
  dosageButton: {
    minWidth: 80,
    minHeight: 80, // Touch area confortável
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
  },
  dosageValue: {
    ...ShotsyDesignTokens.typography.h3,
    fontSize: 24,
    lineHeight: 28,
  },
  dosageUnit: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...ShotsyDesignTokens.typography.body,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ShotsyDesignTokens.spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.xl,
    ...ShotsyDesignTokens.shadows.modal,
  },
  modalTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  modalSubtitle: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  input: {
    ...ShotsyDesignTokens.typography.body,
    borderWidth: 2,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.lg,
    fontSize: 18,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...ShotsyDesignTokens.typography.button,
    fontWeight: '600',
  },
});


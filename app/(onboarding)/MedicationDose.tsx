// app/(onboarding)/MedicationDose.tsx
// Tela 3: Seleção de medicamento + dose condicionada

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Syringe, CheckCircle } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { DosageSelector } from '@/components/onboarding/DosageSelector';
import { useOnboardingContext } from '@/hooks/OnboardingContext';
import { getMedicationConfigs } from '@/lib/medicationConfig';
import { MedicationConfig } from '@/constants/medications';

export default function MedicationDoseScreen() {
  const colors = useColors();
  const { state, updateData, nextStep, canGoNext } = useOnboardingContext();
  const [medications, setMedications] = useState<MedicationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'medication' | 'dosage'>('medication');

  // Carregar medicamentos ao montar
  useEffect(() => {
    loadMedications();
  }, []);

  // Se já tem medicamento selecionado, ir direto para seleção de dose
  useEffect(() => {
    if (state.medication && step === 'medication') {
      setStep('dosage');
    }
  }, [state.medication]);

  const loadMedications = async () => {
    try {
      const configs = await getMedicationConfigs();
      // Filtrar apenas medicamentos semanais (GLP-1)
      const weeklyMeds = configs.filter((med) => med.frequency === 'weekly');
      setMedications(weeklyMeds);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedication = (medicationId: string) => {
    const medication = medications.find((med) => med.id === medicationId);
    if (medication) {
      updateData({
        medication: medicationId,
        dosage: undefined, // Reset dose ao trocar medicamento
      });
      setStep('dosage');
    }
  };

  const handleSelectDosage = (dosage: number) => {
    updateData({
      dosage,
    });
  };

  const handleBack = () => {
    if (step === 'dosage') {
      setStep('medication');
      updateData({ dosage: undefined });
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      nextStep();
    }
  };

  const selectedMedication = state.medication
    ? medications.find((med) => med.id === state.medication)
    : null;

  const featuredMedications = medications.filter((med) => med.featured);
  const otherMedications = medications.filter((med) => !med.featured);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando medicamentos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'medication' ? (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Qual medicamento você usa?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Selecione o medicamento GLP-1 que você está usando
            </Text>

            {/* Medicamentos em destaque */}
            {featuredMedications.length > 0 && (
              <View style={styles.section}>
                {featuredMedications.map((med) => {
                  const isSelected = state.medication === med.id;

                  return (
                    <TouchableOpacity
                      key={med.id}
                      style={[
                        styles.medicationCard,
                        {
                          backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                        ShotsyDesignTokens.shadows.card,
                      ]}
                      onPress={() => handleSelectMedication(med.id)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${med.name} (${med.genericName})${isSelected ? ' selecionado' : ''}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.medicationCardContent}>
                        <View style={styles.medicationCardLeft}>
                          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Syringe size={24} color={colors.primary} weight="bold" />
                          </View>
                          <View style={styles.medicationInfo}>
                            <View style={styles.medicationHeader}>
                              <Text style={[styles.medicationName, { color: colors.text }]}>
                                {med.name}
                              </Text>
                              {med.featured && (
                                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                  <Text style={styles.badgeText}>Popular</Text>
                                </View>
                              )}
                            </View>
                            <Text style={[styles.medicationGeneric, { color: colors.textSecondary }]}>
                              {med.genericName}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <CheckCircle size={24} color={colors.primary} weight="fill" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Outros medicamentos */}
            {otherMedications.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Outros medicamentos
                </Text>
                {otherMedications.map((med) => {
                  const isSelected = state.medication === med.id;

                  return (
                    <TouchableOpacity
                      key={med.id}
                      style={[
                        styles.medicationCard,
                        {
                          backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                        ShotsyDesignTokens.shadows.card,
                      ]}
                      onPress={() => handleSelectMedication(med.id)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${med.name} (${med.genericName})${isSelected ? ' selecionado' : ''}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.medicationCardContent}>
                        <View style={styles.medicationCardLeft}>
                          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Syringe size={24} color={colors.primary} weight="bold" />
                          </View>
                          <View style={styles.medicationInfo}>
                            <Text style={[styles.medicationName, { color: colors.text }]}>
                              {med.name}
                            </Text>
                            <Text style={[styles.medicationGeneric, { color: colors.textSecondary }]}>
                              {med.genericName}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <CheckCircle size={24} color={colors.primary} weight="fill" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Voltar para seleção de medicamento"
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>← Voltar</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Qual é sua dose atual?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {selectedMedication && (
                <>
                  Doses disponíveis para {selectedMedication.name} ({selectedMedication.genericName})
                </>
              )}
            </Text>

            <DosageSelector
              medication={selectedMedication || undefined}
              selectedDosage={state.dosage}
              onSelectDosage={handleSelectDosage}
            />
          </>
        )}
      </ScrollView>

      {/* Botão Continuar */}
      {step === 'dosage' && (
        <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
          <OnboardingButton
            label="Continuar"
            onPress={handleNext}
            variant="primary"
            size="large"
            disabled={!canGoNext()}
            accessibilityLabel="Continuar para agendamento"
            accessibilityHint={
              canGoNext()
                ? 'Avança para configuração de horário'
                : 'É necessário selecionar uma dose para continuar'
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.xl,
    paddingBottom: ShotsyDesignTokens.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...ShotsyDesignTokens.typography.body,
  },
  title: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  subtitle: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.xxl,
    lineHeight: 22,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.label,
    marginBottom: ShotsyDesignTokens.spacing.md,
    fontSize: 14,
    fontWeight: '600',
  },
  medicationCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 2,
    marginBottom: ShotsyDesignTokens.spacing.md,
    padding: ShotsyDesignTokens.spacing.lg,
  },
  medicationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: 4,
  },
  medicationName: {
    ...ShotsyDesignTokens.typography.h3,
    fontSize: 18,
  },
  medicationGeneric: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: ShotsyDesignTokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: ShotsyDesignTokens.borderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerRow: {
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: ShotsyDesignTokens.spacing.sm,
  },
  backButtonText: {
    ...ShotsyDesignTokens.typography.label,
    fontSize: 16,
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
  },
});


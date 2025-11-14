import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { useProfile } from '@/hooks/useProfile';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { Pill, Calendar, ArrowLeft } from 'phosphor-react-native';

export default function TreatmentSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useProfile();

  // Get current medication from profile
  const currentMedication = profile?.medication || 'Tirzepatida';
  const currentFrequency = parseInt(profile?.frequency || '7');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tratamento
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Medicação Atual */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Medicação Atual
          </Text>
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => router.push('/(tabs)/add-medication')}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Pill size={24} color={colors.primary} weight="bold" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
                  Medicamento
                </Text>
                <Text style={[styles.cardValue, { color: colors.text }]}>
                  {currentMedication}
                </Text>
                <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                  Toque para alterar medicamento
                </Text>
              </View>
            </View>
            <View style={styles.chevronContainer}>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Frequência de Aplicação */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequência de Aplicação
          </Text>
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accentOrange + '20' }]}>
                <Calendar size={24} color={colors.accentOrange || '#f97316'} weight="bold" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
                  Dias entre injeções
                </Text>
                <Text style={[styles.cardValue, { color: colors.text }]}>
                  {currentFrequency === 7 ? 'Semanal (7 dias)' : `A cada ${currentFrequency} dias`}
                </Text>
                <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                  Toque para ajustar frequência
                </Text>
              </View>
            </View>
            <View style={styles.chevronContainer}>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Informação adicional */}
        <View style={styles.section}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Gerenciar Tratamento
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Configure seu medicamento e a frequência de aplicação para receber lembretes personalizados e acompanhar seu progresso de forma precisa.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  card: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
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
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 2,
  },
  cardValue: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: 2,
  },
  cardDescription: {
    ...ShotsyDesignTokens.typography.caption,
  },
  chevronContainer: {
    width: 20,
    alignItems: 'center',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  infoCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
  },
  infoTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  infoText: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 22,
  },
});


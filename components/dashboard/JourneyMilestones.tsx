import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { MedicationApplication } from '@/lib/types';

interface JourneyMilestonesProps {
  applications: MedicationApplication[];
  currentWeight: number;
  initialWeight: number;
}

export function JourneyMilestones({ applications, currentWeight, initialWeight }: JourneyMilestonesProps) {
  if (applications.length === 0) {
    return null;
  }

  const totalApplications = applications.length;
  const firstApplication = applications[applications.length - 1];
  const lastApplication = applications[0];
  
  const daysSinceStart = firstApplication 
    ? Math.ceil((Date.now() - new Date(firstApplication.application_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  const weightLost = initialWeight - currentWeight;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Marcos da Jornada</Text>
      
      <View style={styles.milestonesGrid}>
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>💉</Text>
          <Text style={styles.milestoneValue}>{totalApplications}</Text>
          <Text style={styles.milestoneLabel}>Aplicações</Text>
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>📅</Text>
          <Text style={styles.milestoneValue}>Semana {weekNumber}</Text>
          <Text style={styles.milestoneLabel}>da jornada</Text>
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>📉</Text>
          <Text style={styles.milestoneValue}>{weightLost.toFixed(1)}kg</Text>
          <Text style={styles.milestoneLabel}>perdidos</Text>
        </View>
      </View>

      {lastApplication && (
        <View style={styles.lastApplicationCard}>
          <Text style={styles.lastAppTitle}>Última Aplicação</Text>
          <Text style={styles.lastAppDate}>
            {new Date(lastApplication.application_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.lastAppDosage}>
            Dosagem: {lastApplication.dosage}mg
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  milestonesGrid: {
    flexDirection: 'row',
    // gap: 12, // Not supported in React Native StyleSheet
    marginBottom: 16,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  milestoneValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  milestoneLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  lastApplicationCard: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  lastAppTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  lastAppDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  lastAppDosage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});


import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

interface NextApplicationCardProps {
  daysUntil: number;
  medicationName: string;
  dosage: number;
}

export function NextApplicationCard({ daysUntil, medicationName, dosage }: NextApplicationCardProps) {
  const router = useRouter();

  const isToday = daysUntil === 0;
  const isOverdue = daysUntil < 0;

  return (
    <View style={[
      styles.container,
      isToday && styles.containerToday,
      isOverdue && styles.containerOverdue,
    ]}>
      <Text style={styles.label}>
        {isOverdue ? 'ATRASADA!' : isToday ? 'HOJE!' : 'PRÓXIMA APLICAÇÃO'}
      </Text>
      
      <View style={styles.countdown}>
        {!isToday && !isOverdue && (
          <>
            <Text style={styles.countdownNumber}>{daysUntil}</Text>
            <Text style={styles.countdownLabel}>
              dia{daysUntil > 1 ? 's' : ''}
            </Text>
          </>
        )}
        {isToday && (
          <Text style={styles.todayEmoji}>💉</Text>
        )}
        {isOverdue && (
          <Text style={styles.overdueEmoji}>⚠️</Text>
        )}
      </View>

      <Text style={styles.medication}>
        {medicationName} {dosage}mg
      </Text>

      {(isToday || isOverdue) && (
        <View style={styles.action}>
          <Button
            label="Registrar Aplicação"
            onPress={() => router.push('/(tabs)/add-application')}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  containerToday: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
  },
  containerOverdue: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  countdown: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  countdownLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  todayEmoji: {
    fontSize: 80,
  },
  overdueEmoji: {
    fontSize: 80,
  },
  medication: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  action: {
    width: '100%',
  },
});



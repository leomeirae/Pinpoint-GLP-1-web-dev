import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/colors';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user, refetch } = useUser();
  const { updateNotificationSettings } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [enabled, setEnabled] = useState(user?.notifications_enabled ?? true);
  const [weightFrequency, setWeightFrequency] = useState(user?.weight_reminder_frequency || 'daily');
  const [appReminders, setAppReminders] = useState(user?.application_reminders ?? true);
  const [achievementNotifs, setAchievementNotifs] = useState(user?.achievement_notifications ?? true);

  async function handleSave() {
    try {
      setLoading(true);

      await updateNotificationSettings({
        enabled,
        weightReminderFrequency: weightFrequency as 'daily' | 'weekly' | 'never',
        applicationReminders: appReminders,
        achievementNotifications: achievementNotifs,
      });

      await refetch();

      Alert.alert('Sucesso! ✅', 'Configurações salvas', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.subtitle}>
          Configure seus lembretes e alertas
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Ativar Notificações</Text>
            <Text style={styles.settingDescription}>
              Receber todos os lembretes e alertas
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lembretes de Peso</Text>
        
        <View style={styles.radioGroup}>
          <RadioOption
            label="Diário"
            description="Todos os dias no mesmo horário"
            selected={weightFrequency === 'daily'}
            onPress={() => setWeightFrequency('daily')}
            disabled={!enabled}
          />
          <RadioOption
            label="Semanal"
            description="Uma vez por semana"
            selected={weightFrequency === 'weekly'}
            onPress={() => setWeightFrequency('weekly')}
            disabled={!enabled}
          />
          <RadioOption
            label="Nunca"
            description="Não me lembrar"
            selected={weightFrequency === 'never'}
            onPress={() => setWeightFrequency('never')}
            disabled={!enabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Lembretes de Aplicação</Text>
            <Text style={styles.settingDescription}>
              Notificar quando for dia de aplicar medicação
            </Text>
          </View>
          <Switch
            value={appReminders}
            onValueChange={setAppReminders}
            disabled={!enabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Conquistas</Text>
            <Text style={styles.settingDescription}>
              Notificar quando desbloquear conquistas
            </Text>
          </View>
          <Switch
            value={achievementNotifs}
            onValueChange={setAchievementNotifs}
            disabled={!enabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Salvar Configurações"
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

function RadioOption({ 
  label, 
  description, 
  selected, 
  onPress, 
  disabled 
}: { 
  label: string; 
  description: string; 
  selected: boolean; 
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable 
      style={[
        styles.radioOption,
        selected && styles.radioOptionSelected,
        disabled && styles.radioOptionDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.radioText}>
        <Text style={[styles.radioLabel, disabled && styles.disabledText]}>
          {label}
        </Text>
        <Text style={[styles.radioDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  radioOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  radioOptionDisabled: {
    opacity: 0.5,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  disabledText: {
    opacity: 0.5,
  },
  actions: {
    padding: 24,
  },
});



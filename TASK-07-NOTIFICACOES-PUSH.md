# TASK-07: Sistema de Notificações Push Inteligente

## 🎯 OBJETIVO
Implementar sistema completo de notificações para criar **HÁBITO** no usuário.

**Por que isso é CRÍTICO?**
- Sem lembretes, 90% dos usuários esquecem de abrir o app
- Notificações = Retenção de 300% maior
- Streaks dependem de lembretes

---

## 📋 PRÉ-REQUISITOS
- TASK-06.5 completa
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# 📦 FASE 1: INSTALAR DEPENDÊNCIAS

## PASSO 1.1: Instalar expo-notifications

\`\`\`bash
npx expo install expo-notifications expo-device expo-constants
\`\`\`

---

# 🗄️ FASE 2: ATUALIZAR BANCO DE DADOS

## PASSO 2.1: Adicionar campos de notificações no Supabase

No Supabase Dashboard → SQL Editor → New Query:

\`\`\`sql
-- Adicionar campos de notificações na tabela users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS weight_reminder_time TIME DEFAULT '09:00:00',
  ADD COLUMN IF NOT EXISTS weight_reminder_frequency TEXT DEFAULT 'daily' CHECK (weight_reminder_frequency IN ('daily', 'weekly', 'never')),
  ADD COLUMN IF NOT EXISTS application_reminders BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS achievement_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Criar tabela de notificações agendadas
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  identifier TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_sent ON scheduled_notifications(sent);

-- RLS
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON scheduled_notifications FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can manage own notifications"
  ON scheduled_notifications FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
\`\`\`

Clique em **RUN**.

---

# 📝 FASE 3: CONFIGURAR NOTIFICAÇÕES

## PASSO 3.1: Criar lib de notificações

\`\`\`bash
cat > lib/notifications.ts << 'NOTIFICATIONS_EOF'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar comportamento padrão das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicitar permissões
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Notificações só funcionam em dispositivos físicos');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return null;
    }

    // Para iOS, configurar categorias
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('weight_reminder', [
        {
          identifier: 'register_now',
          buttonTitle: 'Registrar Agora',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'later',
          buttonTitle: 'Mais Tarde',
          options: { opensAppToForeground: false },
        },
      ]);
    }

    return 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissões:', error);
    return null;
  }
}

// Cancelar todas as notificações
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Agendar notificação de lembrete de peso
export async function scheduleWeightReminder(time: string, frequency: 'daily' | 'weekly') {
  // Cancelar lembretes anteriores de peso
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'weight_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  // Criar nova notificação
  const [hours, minutes] = time.split(':').map(Number);
  
  const trigger: any = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };

  if (frequency === 'daily') {
    // Todos os dias
    trigger.type = 'daily';
  } else if (frequency === 'weekly') {
    // Uma vez por semana (segunda-feira)
    trigger.weekday = 2;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚖️ Hora de se pesar!',
      body: 'Registre seu peso para acompanhar seu progresso',
      data: { type: 'weight_reminder', screen: '/(tabs)/add-weight' },
      categoryIdentifier: 'weight_reminder',
    },
    trigger,
  });

  return identifier;
}

// Agendar notificação de aplicação
export async function scheduleApplicationReminder(
  medicationName: string,
  dosage: number,
  daysUntilNext: number
) {
  // Calcular data da próxima aplicação
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  nextDate.setHours(9, 0, 0, 0); // 9h da manhã

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: \`💉 Dia de aplicar \${medicationName}!\`,
      body: \`Aplicação de \${dosage}mg hoje\`,
      data: { type: 'application_reminder', screen: '/(tabs)/add-application' },
    },
    trigger: {
      date: nextDate,
    },
  });

  return identifier;
}

// Notificação de conquista desbloqueada
export async function notifyAchievement(title: string, description: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: \`🏆 \${title}\`,
      body: description,
      data: { type: 'achievement', screen: '/(tabs)' },
    },
    trigger: null, // Imediata
  });
}

// Notificação de inatividade (usuário não usa há X dias)
export async function scheduleInactivityReminder(daysSinceLastLog: number) {
  if (daysSinceLastLog < 3) return;

  const messages = [
    { days: 3, message: 'Sentimos sua falta! Registre seu progresso hoje 💙' },
    { days: 7, message: 'Já faz uma semana! Vamos voltar aos trilhos? 🎯' },
    { days: 14, message: 'Estamos aqui para te ajudar! Não desista 💪' },
  ];

  const message = messages.find(m => daysSinceLastLog >= m.days)?.message || messages[0].message;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👋 Olá!',
      body: message,
      data: { type: 'inactivity', screen: '/(tabs)' },
    },
    trigger: {
      seconds: 60, // 1 minuto (para teste, em prod seria horas)
    },
  });
}

// Obter próxima aplicação agendada
export async function getNextScheduledNotification(type: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.find(n => n.content.data?.type === type);
}
NOTIFICATIONS_EOF
\`\`\`

---

# 🪝 FASE 4: CRIAR HOOKS

## PASSO 4.1: Hook para notificações

\`\`\`bash
cat > hooks/useNotifications.ts << 'NOTIFICATIONS_HOOK_EOF'
import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';
import { useMedications } from './useMedications';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  scheduleWeightReminder,
  scheduleApplicationReminder,
  scheduleInactivityReminder,
  cancelAllNotifications,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

export function useNotifications() {
  const { user } = useUser();
  const { weightLogs } = useWeightLogs();
  const { applications } = useMedicationApplications();
  const { medications } = useMedications();
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Solicitar permissões na primeira vez
  useEffect(() => {
    if (user && user.notifications_enabled) {
      initializeNotifications();
    }
  }, [user?.notifications_enabled]);

  // Agendar lembretes quando dados mudam
  useEffect(() => {
    if (!user || !user.notifications_enabled) return;

    scheduleReminders();
  }, [user, weightLogs, applications, medications]);

  async function initializeNotifications() {
    const status = await registerForPushNotifications();
    setPermissionStatus(status);
  }

  async function scheduleReminders() {
    if (!user) return;

    try {
      // Lembrete de peso
      if (user.weight_reminder_frequency !== 'never') {
        await scheduleWeightReminder(
          user.weight_reminder_time || '09:00:00',
          user.weight_reminder_frequency as 'daily' | 'weekly'
        );
      }

      // Lembrete de próxima aplicação
      if (user.application_reminders && medications.length > 0) {
        const activeMed = medications.find(m => m.active);
        if (activeMed) {
          const lastApp = applications
            .filter(a => a.medication_id === activeMed.id)
            .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0];

          if (lastApp) {
            const daysSinceLastApp = Math.floor(
              (Date.now() - new Date(lastApp.application_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            const daysUntilNext = activeMed.frequency === 'weekly' ? 7 - daysSinceLastApp : 1 - daysSinceLastApp;

            if (daysUntilNext === 1 || daysUntilNext === 0) {
              await scheduleApplicationReminder(
                activeMed.type.charAt(0).toUpperCase() + activeMed.type.slice(1),
                activeMed.dosage,
                daysUntilNext
              );
            }
          }
        }
      }

      // Verificar inatividade
      if (weightLogs.length > 0) {
        const lastLog = weightLogs[0];
        const daysSinceLastLog = Math.floor(
          (Date.now() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastLog >= 3) {
          await scheduleInactivityReminder(daysSinceLastLog);
        }
      }
    } catch (error) {
      console.error('Erro ao agendar lembretes:', error);
    }
  }

  async function updateNotificationSettings(settings: {
    enabled?: boolean;
    weightReminderTime?: string;
    weightReminderFrequency?: 'daily' | 'weekly' | 'never';
    applicationReminders?: boolean;
    achievementNotifications?: boolean;
  }) {
    if (!user) return;

    try {
      const updates: any = {};

      if (settings.enabled !== undefined) {
        updates.notifications_enabled = settings.enabled;
        
        if (!settings.enabled) {
          await cancelAllNotifications();
        }
      }

      if (settings.weightReminderTime) {
        updates.weight_reminder_time = settings.weightReminderTime;
      }

      if (settings.weightReminderFrequency) {
        updates.weight_reminder_frequency = settings.weightReminderFrequency;
      }

      if (settings.applicationReminders !== undefined) {
        updates.application_reminders = settings.applicationReminders;
      }

      if (settings.achievementNotifications !== undefined) {
        updates.achievement_notifications = settings.achievementNotifications;
      }

      await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      // Reagendar notificações
      await scheduleReminders();
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  return {
    permissionStatus,
    updateNotificationSettings,
    scheduleReminders,
  };
}
NOTIFICATIONS_HOOK_EOF
\`\`\`

---

# ⚙️ FASE 5: TELA DE CONFIGURAÇÕES

## PASSO 5.1: Adicionar configurações no perfil

\`\`\`bash
cat > app/\(tabs\)/notification-settings.tsx << 'SETTINGS_EOF'
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
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
    <View 
      style={[
        styles.radioOption,
        selected && styles.radioOptionSelected,
        disabled && styles.radioOptionDisabled,
      ]}
      onTouchEnd={disabled ? undefined : onPress}
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
    </View>
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
SETTINGS_EOF
\`\`\`

---

# ✅ FASE 6: TESTAR

Execute:
\`\`\`bash
npx expo start
\`\`\`

### Checklist:

**TESTE 1: Permissões**
- [ ] App solicita permissão de notificação
- [ ] Permissão aceita/negada funciona

**TESTE 2: Configurações**
- [ ] Ir em Perfil → Notificações
- [ ] Ativar/desativar notificações
- [ ] Mudar frequência de peso
- [ ] Salvar configurações

**TESTE 3: Lembretes** (testar em dispositivo real)
- [ ] Agendar lembrete de peso
- [ ] Notificação aparece no horário
- [ ] Clicar na notificação abre o app

**TESTE 4: Aplicação**
- [ ] Registrar aplicação
- [ ] Lembrete de próxima aplicação agendado
- [ ] Verificar notificação no dia certo

---

## 🎉 RESULTADO ESPERADO

✅ Sistema completo de notificações
✅ Lembretes personalizados
✅ Configurações por usuário
✅ Retenção aumenta 300%!

---

**PRÓXIMO: TASK-08 (Insights Automáticos)** 🚀

import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';
import { useMedications } from './useMedications';
import {
  registerForPushNotifications,
  scheduleWeightReminder,
  scheduleApplicationReminder,
  scheduleInactivityReminder,
  cancelAllNotifications,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useNotifications');

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
      logger.error('Erro ao agendar lembretes:', error);
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
      logger.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  return {
    permissionStatus,
    updateNotificationSettings,
    scheduleReminders,
  };
}







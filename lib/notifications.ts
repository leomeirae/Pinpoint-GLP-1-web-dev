import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Notifications');

// Configurar comportamento padrão das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicitar permissões
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    logger.debug('Notificações só funcionam em dispositivos físicos');
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
      logger.debug('Permissão de notificação negada');
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
    logger.error('Erro ao solicitar permissões:', error as Error);
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

  const trigger: Notifications.NotificationTriggerInput =
    frequency === 'daily'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 2,
          hour: hours,
          minute: minutes,
        };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de se pesar',
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
      title: `Dia de aplicar ${medicationName}`,
      body: `Aplicação de ${dosage}mg hoje`,
      data: { type: 'application_reminder', screen: '/(tabs)/add-application' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextDate,
    },
  });

  return identifier;
}

// Notificação de conquista desbloqueada
export async function notifyAchievement(title: string, description: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
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
    { days: 3, message: 'Sentimos sua falta! Registre seu progresso hoje' },
    { days: 7, message: 'Já faz uma semana! Vamos voltar aos trilhos?' },
    { days: 14, message: 'Estamos aqui para te ajudar! Não desista' },
  ];

  const message = messages.find((m) => daysSinceLastLog >= m.days)?.message || messages[0].message;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Olá',
      body: message,
      data: { type: 'inactivity', screen: '/(tabs)' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60, // 1 minuto (para teste, em prod seria horas)
      repeats: false,
    },
  });
}

// Obter próxima aplicação agendada
export async function getNextScheduledNotification(type: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.find((n) => n.content.data?.type === type);
}

/**
 * Agendar lembrete semanal com janela de aplicação
 * @param weekday Dia da semana (0=domingo, 6=sábado)
 * @param windowStart Início da janela (ex: "19:00")
 * @param windowEnd Fim da janela (ex: "23:00")
 * @returns IDs das notificações agendadas (inicial + catchup)
 */
export async function scheduleWeeklyReminderWithWindow(
  weekday: number,
  windowStart: string,
  windowEnd: string
): Promise<{ initial: string; catchup: string } | null> {
  try {
    logger.info('Agendando lembrete semanal', { weekday, windowStart, windowEnd });

    // Cancelar lembretes anteriores do tipo medication_reminder
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'medication_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        logger.debug('Cancelado lembrete anterior', { id: notification.identifier });
      }
    }

    // Parsear horários
    const [startHour, startMinute] = windowStart.split(':').map(Number);
    const [endHour, endMinute] = windowEnd.split(':').map(Number);

    // Validar inputs
    if (
      weekday < 0 ||
      weekday > 6 ||
      startHour < 0 ||
      startHour > 23 ||
      endHour < 0 ||
      endHour > 23
    ) {
      logger.error('Parâmetros inválidos', { weekday, windowStart, windowEnd });
      return null;
    }

    // Configurar categorias iOS se necessário
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('medication_reminder', [
        {
          identifier: 'register_now',
          buttonTitle: 'Registrar Agora',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Lembrar Depois',
          options: { opensAppToForeground: false },
        },
      ]);
    }

    // Obter timezone local
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    logger.info('Timezone detectado', { timezone });

    // Agendar notificação inicial (início da janela)
    const initialId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de aplicar sua dose',
        body: `Você tem até ${windowEnd} para aplicar sua medicação`,
        data: {
          type: 'medication_reminder',
          screen: '/(tabs)/add-application',
          windowStart,
          windowEnd,
          timezone,
        },
        categoryIdentifier: 'medication_reminder',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: startHour,
        minute: startMinute,
        repeats: true,
      },
    });

    logger.info('Notificação inicial agendada', { id: initialId, weekday, time: windowStart });

    // Calcular horário do catch-up (2h depois do início)
    let catchupHour = startHour + 2;
    let catchupMinute = startMinute;

    // Ajustar se passar de 24h
    if (catchupHour >= 24) {
      catchupHour = catchupHour - 24;
    }

    // Agendar notificação de catch-up (2h depois)
    const catchupId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ainda não aplicou?',
        body: `É seguro aplicar até ${windowEnd}`,
        data: {
          type: 'medication_reminder_catchup',
          screen: '/(tabs)/add-application',
          windowStart,
          windowEnd,
          timezone,
        },
        categoryIdentifier: 'medication_reminder',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: catchupHour,
        minute: catchupMinute,
        repeats: true,
      },
    });

    logger.info('Notificação de catch-up agendada', {
      id: catchupId,
      weekday,
      time: `${catchupHour}:${catchupMinute}`,
    });

    return { initial: initialId, catchup: catchupId };
  } catch (error) {
    logger.error('Erro ao agendar lembrete semanal', error as Error);
    return null;
  }
}

/**
 * Atualizar lembrete semanal (cancela o antigo e agenda novo)
 * @param weekday Dia da semana (0=domingo, 6=sábado)
 * @param time Horário no formato HH:mm
 */
export async function updateWeeklyReminder(weekday: number, time: string): Promise<boolean> {
  try {
    logger.info('Atualizando lembrete semanal', { weekday, time });

    const [hour, minute] = time.split(':').map(Number);

    // Janela padrão: início no horário escolhido, término 4h depois
    const endHour = (hour + 4) % 24;
    const windowEnd = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const result = await scheduleWeeklyReminderWithWindow(weekday, time, windowEnd);

    return result !== null;
  } catch (error) {
    logger.error('Erro ao atualizar lembrete', error as Error);
    return false;
  }
}

/**
 * Obter próximo lembrete semanal agendado
 * @returns Notificação agendada ou undefined
 */
export async function getScheduledWeeklyReminder() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.find((n) => n.content.data?.type === 'medication_reminder');
}

/**
 * Cancelar lembretes semanais
 */
export async function cancelWeeklyReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const type = notification.content.data?.type;
    if (type === 'medication_reminder' || type === 'medication_reminder_catchup') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      logger.debug('Lembrete semanal cancelado', { id: notification.identifier, type });
    }
  }
  logger.info('Todos os lembretes semanais foram cancelados');
}

/**
 * Pausar lembretes semanais (salva estado para restaurar depois)
 */
export async function pauseWeeklyReminders(): Promise<void> {
  try {
    logger.info('Pausando lembretes semanais');
    
    // Obter lembretes atuais antes de cancelar
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const medicationReminders = scheduled.filter(
      (n) => n.content.data?.type === 'medication_reminder' || 
             n.content.data?.type === 'medication_reminder_catchup'
    );

    if (medicationReminders.length === 0) {
      logger.warn('Nenhum lembrete semanal encontrado para pausar');
      return;
    }

    // Extrair configuração do primeiro lembrete
    const firstReminder = medicationReminders[0];
    const trigger = firstReminder.trigger as any;
    const data = firstReminder.content.data;

    // Salvar configuração em AsyncStorage
    const pausedConfig = {
      weekday: trigger.weekday,
      windowStart: data?.windowStart,
      windowEnd: data?.windowEnd,
      timezone: data?.timezone,
      pausedAt: new Date().toISOString(),
    };

    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem('@paused_reminders', JSON.stringify(pausedConfig));
    logger.debug('Configuração de lembretes salva', pausedConfig);

    // Cancelar todos os lembretes
    await cancelWeeklyReminders();
    
    logger.info('Lembretes pausados com sucesso');
  } catch (error) {
    logger.error('Erro ao pausar lembretes', error as Error);
    throw error;
  }
}

/**
 * Retomar lembretes semanais (restaura da configuração salva)
 */
export async function resumeWeeklyReminders(): Promise<void> {
  try {
    logger.info('Retomando lembretes semanais');
    
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const pausedData = await AsyncStorage.getItem('@paused_reminders');
    
    if (!pausedData) {
      logger.warn('Nenhuma configuração de lembretes pausados encontrada');
      return;
    }

    const config = JSON.parse(pausedData);
    logger.debug('Configuração recuperada', config);

    // Reagendar lembretes com a configuração anterior
    if (config.windowStart && config.windowEnd && config.weekday !== undefined) {
      await scheduleWeeklyReminderWithWindow(
        config.weekday,
        config.windowStart,
        config.windowEnd
      );
      
      // Limpar configuração salva
      await AsyncStorage.removeItem('@paused_reminders');
      logger.info('Lembretes retomados com sucesso');
    } else {
      logger.error('Configuração de lembretes pausados inválida', config);
      throw new Error('Configuração de lembretes inválida');
    }
  } catch (error) {
    logger.error('Erro ao retomar lembretes', error as Error);
    throw error;
  }
}

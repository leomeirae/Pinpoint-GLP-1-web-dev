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
      title: `💉 Dia de aplicar ${medicationName}!`,
      body: `Aplicação de ${dosage}mg hoje`,
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
      title: `🏆 ${title}`,
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



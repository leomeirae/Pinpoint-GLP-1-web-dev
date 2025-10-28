import { useMemo } from 'react';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';
import { useMedications } from './useMedications';

export interface Insight {
  id: string;
  type: 'positive' | 'neutral' | 'warning' | 'tip';
  emoji: string;
  title: string;
  description: string;
  priority: number;
}

export function useInsights() {
  const { user } = useUser();
  const { weightLogs } = useWeightLogs();
  const { applications } = useMedicationApplications();
  const { medications } = useMedications();

  const insights = useMemo(() => {
    const insights: Insight[] = [];

    if (!user || weightLogs.length === 0) return insights;

    // Calcular dados base
    const currentWeight = weightLogs[0]?.weight || 0;
    const initialWeight = user.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
    const goalWeight = user.goal_weight || 0;
    const weightLost = initialWeight - currentWeight;

    // INSIGHT 1: Próxima aplicação
    const activeMed = medications.find(m => m.active);
    if (activeMed && applications.length > 0) {
      const lastApp = applications
        .filter(a => a.medication_id === activeMed.id)
        .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0];

      if (lastApp) {
        const daysSinceLastApp = Math.floor(
          (Date.now() - new Date(lastApp.application_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysUntilNext = activeMed.frequency === 'weekly' ? 7 - daysSinceLastApp : 1 - daysSinceLastApp;

        if (daysUntilNext === 0) {
          insights.push({
            id: 'next-application-today',
            type: 'warning',
            emoji: '💉',
            title: 'Aplicação HOJE!',
            description: `Hora de aplicar ${activeMed.type.toUpperCase()} ${activeMed.dosage}mg`,
            priority: 100,
          });
        } else if (daysUntilNext > 0 && daysUntilNext <= 3) {
          insights.push({
            id: 'next-application-soon',
            type: 'neutral',
            emoji: '📅',
            title: `Próxima aplicação em ${daysUntilNext} dia${daysUntilNext > 1 ? 's' : ''}`,
            description: `${activeMed.type.charAt(0).toUpperCase() + activeMed.type.slice(1)} ${activeMed.dosage}mg`,
            priority: 90,
          });
        }
      }
    }

    // INSIGHT 2: Média de perda semanal
    if (weightLogs.length >= 2) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const weeksSinceStart = daysSinceStart / 7;

      if (weeksSinceStart >= 1) {
        const avgWeeklyLoss = weightLost / weeksSinceStart;

        if (avgWeeklyLoss >= 1) {
          insights.push({
            id: 'weekly-average-great',
            type: 'positive',
            emoji: '🔥',
            title: 'Você está ARRASANDO!',
            description: `Perdendo ${avgWeeklyLoss.toFixed(1)}kg por semana em média`,
            priority: 80,
          });
        } else if (avgWeeklyLoss > 0) {
          insights.push({
            id: 'weekly-average-good',
            type: 'positive',
            emoji: '💪',
            title: 'Progresso consistente!',
            description: `Perdendo ${avgWeeklyLoss.toFixed(1)}kg por semana`,
            priority: 75,
          });
        }
      }
    }

    // INSIGHT 3: Projeção de meta
    if (goalWeight > 0 && weightLogs.length >= 2) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceStart >= 7 && weightLost > 0) {
        const dailyAvgLoss = weightLost / daysSinceStart;
        const remainingWeight = currentWeight - goalWeight;
        const daysToGoal = Math.ceil(remainingWeight / dailyAvgLoss);
        const weeksToGoal = Math.ceil(daysToGoal / 7);

        if (weeksToGoal > 0 && weeksToGoal < 52) {
          insights.push({
            id: 'goal-projection',
            type: 'neutral',
            emoji: '🎯',
            title: 'Projeção de Meta',
            description: `Com esse ritmo, você atinge ${goalWeight}kg em ${weeksToGoal} semana${weeksToGoal > 1 ? 's' : ''}`,
            priority: 70,
          });
        }
      }
    }

    // INSIGHT 4: Última pesagem
    if (weightLogs.length > 0) {
      const lastLog = weightLogs[0];
      const daysSinceLastLog = Math.floor(
        (Date.now() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastLog >= 3) {
        insights.push({
          id: 'last-weight-warning',
          type: 'warning',
          emoji: '⚖️',
          title: 'Cadê você?',
          description: `Você não se pesa há ${daysSinceLastLog} dias`,
          priority: 85,
        });
      }
    }

    // INSIGHT 5: Porcentagem de progresso
    if (goalWeight > 0) {
      const totalToLose = initialWeight - goalWeight;
      const progressPercent = Math.round((weightLost / totalToLose) * 100);

      if (progressPercent >= 50 && progressPercent < 75) {
        insights.push({
          id: 'halfway-milestone',
          type: 'positive',
          emoji: '🎉',
          title: 'Você já está na metade!',
          description: `${progressPercent}% da meta concluída`,
          priority: 65,
        });
      } else if (progressPercent >= 75 && progressPercent < 100) {
        insights.push({
          id: 'almost-there',
          type: 'positive',
          emoji: '🏁',
          title: 'Falta pouco!',
          description: `${progressPercent}% da meta - você está quase lá!`,
          priority: 85,
        });
      }
    }

    // INSIGHT 6: Dicas baseadas em tempo de jornada
    if (weightLogs.length > 0) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceStart === 7) {
        insights.push({
          id: 'first-week-tip',
          type: 'tip',
          emoji: '💡',
          title: 'Primeira semana completa!',
          description: 'Continue registrando diariamente para melhores resultados',
          priority: 60,
        });
      }
    }

    // Ordenar por prioridade
    return insights.sort((a, b) => b.priority - a.priority);
  }, [user, weightLogs, applications, medications]);

  // Calcular estatísticas adicionais
  const stats = useMemo(() => {
    if (!user || weightLogs.length === 0) return null;

    const currentWeight = weightLogs[0]?.weight || 0;
    const initialWeight = user.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
    const goalWeight = user.goal_weight || 0;
    const weightLost = initialWeight - currentWeight;
    const totalToLose = initialWeight - goalWeight;
    const progressPercent = goalWeight > 0 ? Math.round((weightLost / totalToLose) * 100) : 0;

    // Calcular média semanal
    const firstLog = weightLogs[weightLogs.length - 1];
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksSinceStart = daysSinceStart / 7;
    const avgWeeklyLoss = weeksSinceStart >= 1 ? weightLost / weeksSinceStart : 0;

    // Próxima aplicação
    let daysUntilNextApplication = null;
    const activeMed = medications.find(m => m.active);
    if (activeMed && applications.length > 0) {
      const lastApp = applications
        .filter(a => a.medication_id === activeMed.id)
        .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0];

      if (lastApp) {
        const daysSinceLastApp = Math.floor(
          (Date.now() - new Date(lastApp.application_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        daysUntilNextApplication = activeMed.frequency === 'weekly' ? 7 - daysSinceLastApp : 1 - daysSinceLastApp;
      }
    }

    return {
      currentWeight,
      initialWeight,
      goalWeight,
      weightLost,
      totalToLose,
      progressPercent,
      avgWeeklyLoss,
      daysSinceStart,
      weeksSinceStart,
      daysUntilNextApplication,
    };
  }, [user, weightLogs, applications, medications]);

  return {
    insights,
    stats,
  };
}



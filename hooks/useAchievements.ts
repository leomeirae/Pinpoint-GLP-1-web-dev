import { createLogger } from "@/lib/logger";
const logger = createLogger("useAchievements");

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { Achievement, InsertAchievement } from '@/lib/types';

// Definição de todas as conquistas possíveis
const ACHIEVEMENT_DEFINITIONS = [
  {
    type: 'onboarding_complete',
    title: 'Bem-vindo!',
    description: 'Completou o onboarding',
    icon: '🎯',
  },
  {
    type: 'first_weight',
    title: 'Primeira Pesagem',
    description: 'Registrou seu primeiro peso',
    icon: '⚖️',
  },
  {
    type: 'first_medication',
    title: 'Medicação Cadastrada',
    description: 'Adicionou sua primeira medicação',
    icon: '💊',
  },
  {
    type: 'first_application',
    title: 'Primeira Aplicação',
    description: 'Registrou sua primeira dose!',
    icon: '💉',
  },
  {
    type: 'applications_5',
    title: '5 Aplicações',
    description: '5 doses aplicadas! Continue assim!',
    icon: '🎯',
  },
  {
    type: 'applications_10',
    title: '10 Aplicações',
    description: '10 doses! Você está consistente!',
    icon: '💪',
  },
  {
    type: 'applications_20',
    title: '20 Aplicações',
    description: '20 doses! Disciplina exemplar!',
    icon: '🔥',
  },
  {
    type: 'weight_1kg_lost',
    title: 'Primeiro Quilo',
    description: 'Perdeu 1kg! Continue assim!',
    icon: '🎉',
  },
  {
    type: 'weight_5kg_lost',
    title: '5kg Perdidos',
    description: 'Perdeu 5kg! Incrível!',
    icon: '🔥',
  },
  {
    type: 'weight_10kg_lost',
    title: '10kg Perdidos',
    description: 'Perdeu 10kg! Você é imparável!',
    icon: '💪',
  },
  {
    type: 'streak_7_days',
    title: '7 Dias de Tracking',
    description: 'Registrou peso por 7 dias',
    icon: '📆',
  },
  {
    type: 'streak_30_days',
    title: '1 Mês Completo',
    description: 'Registrou peso por 30 dias',
    icon: '🏆',
  },
  {
    type: 'goal_reached',
    title: 'Meta Alcançada!',
    description: 'Atingiu seu peso meta!',
    icon: '🎊',
  },
];

export function useAchievements() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  async function fetchAchievements() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAchievements(data || []);
    } catch (err: any) {
      logger.error('Error fetching achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function unlockAchievement(achievementType: string) {
    if (!user) return;

    // Verificar se já tem essa conquista
    const exists = achievements.some(a => a.type === achievementType);
    if (exists) {
      logger.debug('Achievement already unlocked', { achievementType });
      return;
    }

    // Buscar definição da conquista
    const definition = ACHIEVEMENT_DEFINITIONS.find(a => a.type === achievementType);
    if (!definition) {
      logger.error('Achievement definition not found:', achievementType);
      return;
    }

    try {
      logger.info('Unlocking achievement', { achievementType });

      const newAchievement: InsertAchievement = {
        type: definition.type,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
      };

      const { data, error } = await supabase
        .from('achievements')
        .insert({ ...newAchievement, user_id: user.id })
        .select()
        .single();

      if (error) {
        // Se erro for de constraint unique, é porque já existe
        if (error.code === '23505') {
          logger.debug('Achievement already exists (race condition)');
          return;
        }
        throw error;
      }

      logger.info('Achievement unlocked', { data });
      await fetchAchievements();
      
      // Aqui poderia adicionar uma notificação visual
      return data;
    } catch (err: any) {
      logger.error('Error unlocking achievement:', err);
    }
  }

  // Sistema de detecção automática de conquistas
  async function checkAndUnlockAchievements(params: {
    weightLogs?: number;
    medications?: number;
    applications?: number;
    weightLost?: number;
    goalReached?: boolean;
  }) {
    const { weightLogs = 0, medications = 0, applications = 0, weightLost = 0, goalReached = false } = params;

    // Aplicações
    if (applications >= 1) await unlockAchievement('first_application');
    if (applications >= 5) await unlockAchievement('applications_5');
    if (applications >= 10) await unlockAchievement('applications_10');
    if (applications >= 20) await unlockAchievement('applications_20');

    // Peso perdido
    if (weightLost >= 1) await unlockAchievement('weight_1kg_lost');
    if (weightLost >= 5) await unlockAchievement('weight_5kg_lost');
    if (weightLost >= 10) await unlockAchievement('weight_10kg_lost');

    // Registros
    if (weightLogs >= 1) await unlockAchievement('first_weight');
    if (weightLogs >= 7) await unlockAchievement('streak_7_days');
    if (weightLogs >= 30) await unlockAchievement('streak_30_days');

    // Medicações
    if (medications >= 1) await unlockAchievement('first_medication');

    // Meta alcançada
    if (goalReached) await unlockAchievement('goal_reached');
  }

  return {
    achievements,
    loading,
    error,
    unlockAchievement,
    checkAndUnlockAchievements,
    refetch: fetchAchievements,
  };
}



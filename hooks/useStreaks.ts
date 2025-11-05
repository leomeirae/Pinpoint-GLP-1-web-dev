import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useStreaks');

export interface StreakData {
  currentWeightStreak: number;
  longestWeightStreak: number;
  currentApplicationStreak: number;
  longestApplicationStreak: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  lastWeightLogDate: string | null;
}

export function useStreaks() {
  const { user, refetch: refetchUser } = useUser();
  const { weightLogs } = useWeightLogs();
  const { applications } = useMedicationApplications();
  const [loading, setLoading] = useState(false);

  // Calcular streaks automaticamente
  useEffect(() => {
    if (user) {
      calculateStreaks();
    }
  }, [weightLogs.length, applications.length]);

  async function calculateStreaks() {
    if (!user) return;

    try {
      setLoading(true);

      // Calcular streak de peso
      let currentWeightStreak = 0;
      let longestWeightStreak = user.longest_weight_streak || 0;
      const today = new Date().toISOString().split('T')[0];

      if (weightLogs.length > 0) {
        const sortedLogs = [...weightLogs].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Verificar se registrou hoje ou ontem
        const lastLogDate = new Date(sortedLogs[0].date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          // Contar dias consecutivos
          currentWeightStreak = 1;
          for (let i = 1; i < sortedLogs.length; i++) {
            const currentDate = new Date(sortedLogs[i - 1].date);
            const prevDate = new Date(sortedLogs[i].date);
            const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
              currentWeightStreak++;
            } else {
              break;
            }
          }

          if (currentWeightStreak > longestWeightStreak) {
            longestWeightStreak = currentWeightStreak;
          }
        } else {
          currentWeightStreak = 0;
        }
      }

      // Calcular XP e nível
      const totalXP = user.total_experience_points || 0;
      const newXP = totalXP + (currentWeightStreak > (user.current_weight_streak || 0) ? 10 : 0);
      const level = Math.floor(newXP / 100) + 1;

      // Atualizar banco
      await supabase
        .from('users')
        .update({
          current_weight_streak: currentWeightStreak,
          longest_weight_streak: longestWeightStreak,
          last_weight_log_date: weightLogs[0]?.date || null,
          total_experience_points: newXP,
          level,
        })
        .eq('id', user.id);

      await refetchUser();
    } catch (error) {
      logger.error('Error calculating streaks', error as Error);
    } finally {
      setLoading(false);
    }
  }

  const streakData: StreakData | null = user ? {
    currentWeightStreak: user.current_weight_streak || 0,
    longestWeightStreak: user.longest_weight_streak || 0,
    currentApplicationStreak: user.current_application_streak || 0,
    longestApplicationStreak: user.longest_application_streak || 0,
    level: user.level || 1,
    experiencePoints: user.total_experience_points || 0,
    experienceToNextLevel: ((user.level || 1) * 100) - (user.total_experience_points || 0),
    lastWeightLogDate: user.last_weight_log_date || null,
  } : null;

  return {
    streakData,
    loading,
    calculateStreaks,
  };
}

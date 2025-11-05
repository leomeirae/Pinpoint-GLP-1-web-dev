import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedications } from './useMedications';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useCommunityStats');

interface CommunityComparison {
  yourWeightLost: number;
  avgWeightLost: number;
  medianWeightLost: number;
  top25Percentile: number;
  yourPercentile: number;
  usersInSample: number;
  message: string;
  emoji: string;
}

export function useCommunityStats() {
  const { user } = useUser();
  const { weightLogs } = useWeightLogs();
  const { medications } = useMedications();
  const [comparison, setComparison] = useState<CommunityComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && weightLogs.length > 0 && medications.length > 0) {
      fetchCommunityStats();
    }
  }, [user?.id, weightLogs.length, medications.length]);

  async function fetchCommunityStats() {
    if (!user) return;

    try {
      setLoading(true);

      const activeMed = medications.find(m => m.active);
      if (!activeMed) return;

      // Buscar stats da comunidade
      const { data, error } = await supabase
        .from('community_stats')
        .select('*')
        .eq('medication_type', activeMed.type)
        .eq('dosage', activeMed.dosage)
        .single();

      if (error || !data) {
        console.log('Sem dados suficientes da comunidade');
        return;
      }

      // Calcular peso perdido do usuário
      const currentWeight = weightLogs[0]?.weight || 0;
      const initialWeight = user.initial_weight || 0;
      const yourWeightLost = initialWeight - currentWeight;

      // Calcular percentil
      let yourPercentile = 50;
      if (yourWeightLost > data.top_25_percentile) {
        yourPercentile = 90; // Top 10%
      } else if (yourWeightLost > data.median_weight_lost) {
        yourPercentile = 75; // Top 25%
      } else if (yourWeightLost > data.avg_weight_lost * 0.7) {
        yourPercentile = 50;
      } else {
        yourPercentile = 25;
      }

      // Gerar mensagem
      let message = '';
      let emoji = '';

      if (yourPercentile >= 90) {
        message = 'Você está no TOP 10%! Resultado EXCEPCIONAL!';
        emoji = '🏆';
      } else if (yourPercentile >= 75) {
        message = 'Você está acima da média! Continue assim!';
        emoji = '💪';
      } else if (yourPercentile >= 50) {
        message = 'Você está na média da comunidade';
        emoji = '👍';
      } else {
        message = 'Continue firme! Cada corpo é único';
        emoji = '💙';
      }

      setComparison({
        yourWeightLost,
        avgWeightLost: data.avg_weight_lost,
        medianWeightLost: data.median_weight_lost,
        top25Percentile: data.top_25_percentile,
        yourPercentile,
        usersInSample: data.user_count,
        message,
        emoji,
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    comparison,
    loading,
  };
}

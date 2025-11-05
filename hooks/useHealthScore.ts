import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { HealthScore, HealthScoreComponents } from '@/lib/types/insights';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useHealthScore');

export const useHealthScore = () => {
  const { user } = useUser();
  const [score, setScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScore = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get today's score or calculate
      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setScore({
          ...data,
          date: new Date(data.date),
          created_at: new Date(data.created_at),
        });
      } else {
        // Calculate new score
        await calculateTodayScore();
      }
    } catch (err) {
      logger.error('Error fetching health score', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const calculateTodayScore = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase.rpc('calculate_health_score', {
        p_user_id: user.id,
        p_date: new Date().toISOString().split('T')[0],
      });

      if (data) {
        const scoreData: HealthScoreComponents = data;

        // Save to database
        await supabase.from('health_scores').insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          overall_score: scoreData.overall,
          consistency_score: scoreData.consistency,
          progress_score: scoreData.progress,
          engagement_score: scoreData.engagement,
          data_quality_score: scoreData.data_quality,
        });

        await fetchScore();
      }
    } catch (err) {
      logger.error('Error calculating score', err as Error);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    loading,
    refetch: fetchScore,
    calculateScore: calculateTodayScore,
  };
};

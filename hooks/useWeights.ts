import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useWeights');

export interface Weight {
  id: string;
  user_id: string;
  date: Date;
  weight: number;
  notes?: string;
  created_at: Date;
}

export const useWeights = () => {
  const { user } = useUser();
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeights();
    }
  }, [user]);

  const fetchWeights = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('weights')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Parse dates
      const parsedData = (data || []).map(weight => ({
        ...weight,
        date: new Date(weight.date),
        created_at: new Date(weight.created_at),
      }));

      setWeights(parsedData);
    } catch (err) {
      logger.error('Error fetching weights:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createWeight = async (weightData: Omit<Weight, 'id' | 'user_id' | 'created_at'>) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found. Please wait for sync to complete.');
      }

      const { error: insertError } = await supabase
        .from('weights')
        .insert([{
          user_id: user.id,
          ...weightData,
        }]);

      if (insertError) throw insertError;
      await fetchWeights();
    } catch (err) {
      logger.error('Error creating weight:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateWeight = async (id: string, updates: Partial<Weight>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('weights')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchWeights();
    } catch (err) {
      logger.error('Error updating weight:', err);
      setError(err as Error);
      throw err;
    }
  };

  const deleteWeight = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('weights')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchWeights();
    } catch (err) {
      logger.error('Error deleting weight:', err);
      setError(err as Error);
      throw err;
    }
  };

  // Helper to calculate weight difference
  const getWeightDifference = (index: number): number | undefined => {
    if (index >= weights.length - 1) return undefined;
    return weights[index].weight - weights[index + 1].weight;
  };

  return {
    weights,
    loading,
    error,
    createWeight,
    updateWeight,
    deleteWeight,
    getWeightDifference,
    refetch: fetchWeights,
  };
};

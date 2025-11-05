import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { WeightLog, InsertWeightLog, UpdateWeightLog } from '@/lib/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useWeightLogs');

export function useWeightLogs() {
  const { user } = useUser();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeightLogs();
    }
  }, [user]);

  async function fetchWeightLogs() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setWeightLogs(data || []);
    } catch (err: any) {
      logger.error('Error fetching weight logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addWeightLog(weightLog: InsertWeightLog) {
    if (!user) {
      logger.error('User not found in useWeightLogs');
      throw new Error('User not found. Please wait for sync to complete.');
    }

    logger.info('Adding weight log for user:', user.id);

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ ...weightLog, user_id: user.id })
      .select()
      .single();

    if (error) {
      logger.error('Error adding weight log:', error);
      throw error;
    }
    
    await fetchWeightLogs();
    return data;
  }

  async function updateWeightLog(id: string, updates: UpdateWeightLog) {
    const { data, error } = await supabase
      .from('weight_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchWeightLogs();
    return data;
  }

  async function deleteWeightLog(id: string) {
    const { error} = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchWeightLogs();
  }

  return {
    weightLogs,
    loading,
    error,
    addWeightLog,
    updateWeightLog,
    deleteWeightLog,
    refetch: fetchWeightLogs,
  };
}

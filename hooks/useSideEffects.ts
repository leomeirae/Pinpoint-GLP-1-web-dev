import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { SideEffect, InsertSideEffect, UpdateSideEffect } from '@/lib/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useSideEffects');

export function useSideEffects() {
  const { user } = useUser();
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSideEffects();
    }
  }, [user]);

  async function fetchSideEffects() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('side_effects')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setSideEffects(data || []);
    } catch (err: any) {
      logger.error('Error fetching side effects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addSideEffect(sideEffect: InsertSideEffect) {
    if (!user) {
      logger.error('User not found in useSideEffects');
      throw new Error('User not found. Please wait for sync to complete.');
    }

    logger.info('Adding side effect for user:', user.id);

    const { data, error } = await supabase
      .from('side_effects')
      .insert({ ...sideEffect, user_id: user.id })
      .select()
      .single();

    if (error) {
      logger.error('Error adding side effect:', error);
      throw error;
    }
    
    await fetchSideEffects();
    return data;
  }

  async function updateSideEffect(id: string, updates: UpdateSideEffect) {
    const { data, error } = await supabase
      .from('side_effects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchSideEffects();
    return data;
  }

  async function deleteSideEffect(id: string) {
    const { error } = await supabase
      .from('side_effects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchSideEffects();
  }

  return {
    sideEffects,
    loading,
    error,
    addSideEffect,
    updateSideEffect,
    deleteSideEffect,
    refetch: fetchSideEffects,
  };
}



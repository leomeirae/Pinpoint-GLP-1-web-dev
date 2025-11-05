import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { Medication, InsertMedication, UpdateMedication } from '@/lib/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useMedications');

export function useMedications() {
  const { user } = useUser();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  async function fetchMedications() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMedications(data || []);
    } catch (err: any) {
      logger.error('Error fetching medications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMedication(medication: InsertMedication) {
    if (!user) {
      logger.error('User not found in useMedications');
      throw new Error('User not found. Please wait for sync to complete.');
    }

    logger.info('Adding medication for user:', user.id);

    const { data, error } = await supabase
      .from('medications')
      .insert({ ...medication, user_id: user.id })
      .select()
      .single();

    if (error) {
      logger.error('Error adding medication:', error);
      throw error;
    }
    
    await fetchMedications();
    return data;
  }

  async function updateMedication(id: string, updates: UpdateMedication) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchMedications();
    return data;
  }

  async function deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchMedications();
  }

  return {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    refetch: fetchMedications,
  };
}

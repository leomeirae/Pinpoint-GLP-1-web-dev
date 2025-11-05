import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { MedicationApplication, InsertMedicationApplication, UpdateMedicationApplication } from '@/lib/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useMedicationApplications');

export function useMedicationApplications() {
  const { user } = useUser();
  const [applications, setApplications] = useState<MedicationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  async function fetchApplications() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medication_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      if (fetchError) throw fetchError;
      setApplications(data || []);
    } catch (err: any) {
      logger.error('Error fetching applications', err as Error, { message: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addApplication(application: InsertMedicationApplication) {
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('medication_applications')
      .insert({ 
        ...application, 
        user_id: user.id,
        application_time: application.application_time || null,
        notes: application.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchApplications();
    return data;
  }

  async function updateApplication(id: string, updates: UpdateMedicationApplication) {
    const { data, error } = await supabase
      .from('medication_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchApplications();
    return data;
  }

  async function deleteApplication(id: string) {
    const { error } = await supabase
      .from('medication_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchApplications();
  }

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
}








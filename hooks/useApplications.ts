import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface Application {
  id: string;
  user_id: string;
  medication_id: string;
  dosage: number;
  application_date: string; // Date string in YYYY-MM-DD format
  application_time?: string; // Time string
  injection_sites: string[];
  side_effects_list: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
  // Computed field from date + time
  date?: Date;
}

export const useApplications = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
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

      // Parse dates and combine date + time
      const parsedData = (data || []).map(app => {
        const dateTime = new Date(app.application_date);
        
        // If time is provided, add it to the date
        if (app.application_time) {
          const [hours, minutes] = app.application_time.split(':');
          dateTime.setHours(parseInt(hours), parseInt(minutes));
        }

        return {
        ...app,
          date: dateTime,
        created_at: new Date(app.created_at),
        updated_at: new Date(app.updated_at),
        };
      });

      setApplications(parsedData);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: Omit<Application, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'date'>) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found. Please wait for sync to complete.');
      }

      const { error: insertError } = await supabase
        .from('medication_applications')
        .insert([{
          user_id: user.id,
          ...applicationData,
        }]);

      if (insertError) throw insertError;
      await fetchApplications();
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      setError(null);

      // Remove computed 'date' field before updating
      const { date, ...updateData } = updates;

      const { error: updateError } = await supabase
        .from('medication_applications')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchApplications();
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err as Error);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('medication_applications')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
};

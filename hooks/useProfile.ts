import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useProfile');

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  height?: number;
  start_weight?: number;
  target_weight?: number;
  medication?: string;
  current_dose?: number;
  frequency?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const useProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (fetchError) {
        // If profile doesn't exist, create one
        if (fetchError.code === 'PGRST116') {
          await createProfile({
            name: user?.name || 'User',
            email: user?.email || '',
          });
          return;
        }
        throw fetchError;
      }

      setProfile(data);
    } catch (err) {
      logger.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (updateError) throw updateError;
      await fetchProfile();
    } catch (err) {
      logger.error('Error updating profile:', err);
      setError(err as Error);
      throw err;
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user?.id, ...profileData }]);

      if (insertError) throw insertError;
      await fetchProfile();
    } catch (err) {
      logger.error('Error creating profile:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refetch: fetchProfile,
  };
};

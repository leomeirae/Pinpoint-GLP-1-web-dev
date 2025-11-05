import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  accent_color: string;
  dark_mode: boolean;
  shot_reminder: boolean;
  shot_reminder_time: string;
  weight_reminder: boolean;
  weight_reminder_time: string;
  achievements_notifications: boolean;
  sync_apple_health: boolean;
  auto_backup: boolean;
  created_at: Date;
  updated_at: Date;
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'classic',
  accent_color: '#0891B2',
  dark_mode: false,
  shot_reminder: true,
  shot_reminder_time: '09:00:00',
  weight_reminder: true,
  weight_reminder_time: '08:00:00',
  achievements_notifications: true,
  sync_apple_health: false,
  auto_backup: true,
};

export const useSettings = () => {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setSettings(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If settings don't exist, create default ones
        if (fetchError.code === 'PGRST116') {
          await createSettings(DEFAULT_SETTINGS);
          return;
        }
        
        // Se erro é de RLS, usar configurações padrão localmente
        if (fetchError.code === '42501') {
          console.warn('⚠️ RLS policy error on settings, using default settings locally');
          setSettings({
            id: 'temp',
            user_id: user.id,
            ...DEFAULT_SETTINGS,
            created_at: new Date(),
            updated_at: new Date(),
          });
          setLoading(false);
          return;
        }
        
        throw fetchError;
      }

      // Parse dates
      setSettings({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
      
      // Fallback: usar configurações padrão se houver erro
      if (user) {
        console.warn('⚠️ Using default settings as fallback');
        setSettings({
          id: 'temp',
          user_id: user.id,
          ...DEFAULT_SETTINGS,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found. Please wait for sync to complete.');
      }

      const { error: updateError } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      await fetchSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  };

  const createSettings = async (settingsData: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found. Please wait for sync to complete.');
      }

      const { error: insertError } = await supabase
        .from('settings')
        .insert([{ user_id: user.id, ...settingsData }]);

      if (insertError) {
        // Se erro é de RLS, usar configurações padrão localmente e não lançar erro
        if (insertError.code === '42501') {
          console.warn('⚠️ RLS policy error creating settings, using default settings locally');
          setSettings({
            id: 'temp',
            user_id: user.id,
            ...settingsData,
            created_at: new Date(),
            updated_at: new Date(),
          });
          return;
        }
        throw insertError;
      }
      await fetchSettings();
    } catch (err) {
      console.error('Error creating settings:', err);
      setError(err as Error);
      
      // Se falhou por RLS, não lançar erro (já configuramos fallback acima)
      const error = err as any;
      if (error.code !== '42501') {
        throw err;
      }
    }
  };

  const resetSettings = async () => {
    try {
      setError(null);
      await updateSettings(DEFAULT_SETTINGS);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    createSettings,
    resetSettings,
    refetch: fetchSettings,
  };
};

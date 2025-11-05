import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { UserAvatar, AvatarCustomization } from '@/lib/types/avatar';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useAvatar');

export const useAvatar = () => {
  const { user } = useUser();
  const [avatar, setAvatar] = useState<UserAvatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvatar = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Avatar doesn't exist yet, create default one
        if (fetchError.code === 'PGRST116') {
          await createAvatar();
          return;
        }
        throw fetchError;
      }

      // Parse accessories from JSONB
      const parsedData = {
        ...data,
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        unlock_date: new Date(data.unlock_date),
      };

      setAvatar(parsedData);
    } catch (err) {
      logger.error('Error fetching avatar:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const createAvatar = async (customization?: Partial<AvatarCustomization>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const defaultAvatar = {
        user_id: user.id,
        style: customization?.style || 'minimal',
        primary_color: customization?.primary_color || '#0891B2',
        accessories: customization?.accessories || [],
        mood: customization?.mood || 'motivated',
      };

      const { data, error: insertError } = await supabase
        .from('user_avatars')
        .insert([defaultAvatar])
        .select()
        .single();

      if (insertError) throw insertError;

      const parsedData = {
        ...data,
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        unlock_date: new Date(data.unlock_date),
      };

      setAvatar(parsedData);
      return parsedData;
    } catch (err) {
      logger.error('Error creating avatar:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateAvatar = async (updates: Partial<AvatarCustomization>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_avatars')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const parsedData = {
        ...data,
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        unlock_date: new Date(data.unlock_date),
      };

      setAvatar(parsedData);
      return parsedData;
    } catch (err) {
      logger.error('Error updating avatar:', err);
      setError(err as Error);
      throw err;
    }
  };

  const levelUp = async (newLevel: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      // The evolution_stage will be auto-updated by the database trigger
      const { data, error: updateError } = await supabase
        .from('user_avatars')
        .update({ level: newLevel })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const parsedData = {
        ...data,
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        unlock_date: new Date(data.unlock_date),
      };

      setAvatar(parsedData);
      return parsedData;
    } catch (err) {
      logger.error('Error leveling up avatar:', err);
      setError(err as Error);
      throw err;
    }
  };

  const unlockAccessory = async (accessory: string) => {
    if (!avatar) throw new Error('Avatar not loaded');

    const currentAccessories = avatar.accessories || [];

    if (currentAccessories.includes(accessory)) {
      return avatar; // Already unlocked
    }

    const newAccessories = [...currentAccessories, accessory];
    return await updateAvatar({ accessories: newAccessories });
  };

  return {
    avatar,
    loading,
    error,
    createAvatar,
    updateAvatar,
    levelUp,
    unlockAccessory,
    refetch: fetchAvatar,
  };
};

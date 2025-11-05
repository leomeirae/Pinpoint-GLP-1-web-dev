import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { AppPersonality, PersonalityUpdate, getDefaultPersonality, personalizeMessage } from '@/lib/types/communication';
import { createLogger } from '@/lib/logger';

const logger = createLogger('usePersonality');

export const usePersonality = () => {
  const { user } = useUser();
  const [personality, setPersonality] = useState<AppPersonality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPersonality = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('communication_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Preferences don't exist yet, create default
        if (fetchError.code === 'PGRST116') {
          await createPersonality();
          return;
        }
        throw fetchError;
      }

      const parsedData = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setPersonality(parsedData);
    } catch (err) {
      logger.error('Error fetching personality:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPersonality();
  }, [fetchPersonality]);

  const createPersonality = async (prefs?: PersonalityUpdate) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const defaults = {
        user_id: user.id,
        ...getDefaultPersonality(),
        ...prefs,
      };

      const { data, error: insertError } = await supabase
        .from('communication_preferences')
        .insert([defaults])
        .select()
        .single();

      if (insertError) throw insertError;

      const parsedData = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setPersonality(parsedData);
      return parsedData;
    } catch (err) {
      logger.error('Error creating personality:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updatePersonality = async (updates: PersonalityUpdate) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('communication_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const parsedData = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setPersonality(parsedData);
      return parsedData;
    } catch (err) {
      logger.error('Error updating personality:', err);
      setError(err as Error);
      throw err;
    }
  };

  // Helper to get personalized message based on user preferences
  const getPersonalizedMessage = useCallback((
    baseMessage: string,
    context?: {
      isEncouraging?: boolean;
      isImportant?: boolean;
      hasData?: boolean;
    }
  ): string => {
    if (!personality) return baseMessage;
    return personalizeMessage(baseMessage, personality, context);
  }, [personality]);

  // Quick setters for common updates
  const setStyle = (style: AppPersonality['style']) => {
    return updatePersonality({ style });
  };

  const setMotivationType = (motivation_type: AppPersonality['motivation_type']) => {
    return updatePersonality({ motivation_type });
  };

  const setNotificationTone = (notification_tone: AppPersonality['notification_tone']) => {
    return updatePersonality({ notification_tone });
  };

  const setNotificationFrequency = (notification_frequency: AppPersonality['notification_frequency']) => {
    return updatePersonality({ notification_frequency });
  };

  const toggleEmojis = () => {
    if (!personality) return;
    return updatePersonality({ use_emojis: !personality.use_emojis });
  };

  const setHumorLevel = (humor_level: number) => {
    return updatePersonality({ humor_level });
  };

  const setFormalityLevel = (formality_level: number) => {
    return updatePersonality({ formality_level });
  };

  return {
    // State
    personality,
    loading,
    error,

    // Actions
    createPersonality,
    updatePersonality,
    refetch: fetchPersonality,

    // Helpers
    getPersonalizedMessage,

    // Quick setters
    setStyle,
    setMotivationType,
    setNotificationTone,
    setNotificationFrequency,
    toggleEmojis,
    setHumorLevel,
    setFormalityLevel,
  };
};

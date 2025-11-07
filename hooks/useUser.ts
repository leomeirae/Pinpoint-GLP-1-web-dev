import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/clerk';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUser');

interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  goal_weight: number | null;
  onboarding_completed: boolean;
  initial_weight: number | null;
  notifications_enabled: boolean;
  weight_reminder_time: string;
  weight_reminder_frequency: 'daily' | 'weekly' | 'never';
  application_reminders: boolean;
  achievement_notifications: boolean;
  expo_push_token: string | null;
  current_weight_streak: number;
  longest_weight_streak: number;
  last_weight_log_date: string | null;
  current_application_streak: number;
  longest_application_streak: number;
  total_experience_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

// Cache global para evitar múltiplas chamadas para o mesmo usuário
const userCache: Record<string, { user: User | null; timestamp: number }> = {};
const CACHE_DURATION = 2000; // 2 segundos

// Function to clear cache (useful for logout)
export function clearUserCache() {
  Object.keys(userCache).forEach((key) => delete userCache[key]);
  logger.info('User cache cleared');
}

export function useUser() {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchInProgressRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10; // Aguardar até 5 segundos (10 * 500ms)

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [userId]);

  async function fetchUser() {
    if (!userId) return;

    // Verificar cache primeiro
    const cached = userCache[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('Using cached user data');
      setUser(cached.user);
      setLoading(false);
      return;
    }

    // Se já tem fetch em andamento, não fazer outro
    if (fetchInProgressRef.current) {
      logger.debug('Fetch already in progress, skipping...');
      return;
    }

    fetchInProgressRef.current = true;

    try {
      setLoading(true);

      logger.info('Fetching user from Supabase', { userId });

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', userId)
        .single();

      if (error) {
        // Se usuário não existe, será criado pelo useUserSync (não é um erro)
        if (error.code === 'PGRST116') {
          logger.debug('User not found in Supabase, will be created by useUserSync');

          // Tentar novamente após um delay se ainda não atingiu max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setTimeout(() => {
              fetchInProgressRef.current = false;
              fetchUser();
            }, 500);
            return;
          } else {
            logger.info('Max retries reached, user will be created by sync');
            setUser(null);
          }
        } else {
          // Outros erros são reais e devem ser logados
          logger.error('Error fetching user from Supabase', error);
          setUser(null);
        }
      } else {
        logger.info('User fetched successfully', {
          userId: data?.id,
          email: data?.email,
          onboarding_completed: data?.onboarding_completed,
          has_onboarding_field: 'onboarding_completed' in (data || {}),
          clerk_id: data?.clerk_id,
        });
        setUser(data);

        // Atualizar cache
        userCache[userId] = {
          user: data,
          timestamp: Date.now(),
        };

        // Reset retry count em caso de sucesso
        retryCountRef.current = 0;
      }
    } catch (error) {
      logger.error('Error fetching user', error);
      setUser(null);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }

  return { user, loading, refetch: fetchUser };
}

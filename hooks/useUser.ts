import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/clerk';
import { supabase } from '@/lib/supabase';

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

export function useUser() {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

    try {
      setLoading(true);
      
      console.log('Fetching user from Supabase for clerk_id:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user from Supabase:', error);
        
        // Se usuário não existe, criar automaticamente
        if (error.code === 'PGRST116') {
          console.log('User not found, creating new user in Supabase...');
          const { data: userData, error: createError } = await supabase
            .from('users')
            .insert({
              clerk_id: userId,
              email: '', // Será preenchido depois
              onboarding_completed: false,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating user:', createError);
            setUser(null);
          } else {
            console.log('User created successfully:', userData?.id);
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } else {
        console.log('User fetched successfully:', data?.id);
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, refetch: fetchUser };
}

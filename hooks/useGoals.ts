import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { PersonalGoal, CreateGoalInput, Milestone } from '@/lib/types/goals';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useGoals');

export const useGoals = () => {
  const { user } = useUser();
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const parseGoal = (data: any): PersonalGoal => ({
    ...data,
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    target_date: data.target_date ? new Date(data.target_date) : undefined,
    started_at: new Date(data.started_at),
    completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  });

  const fetchGoals = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const parsedGoals = (data || []).map(parseGoal);
      setGoals(parsedGoals);
    } catch (err) {
      logger.error('Error fetching goals:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (goalData: CreateGoalInput) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const insertData = {
        user_id: user.id,
        ...goalData,
        milestones: goalData.milestones || [],
      };

      const { data, error: insertError } = await supabase
        .from('user_goals')
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;

      const parsedGoal = parseGoal(data);
      setGoals(prev => [parsedGoal, ...prev]);

      return parsedGoal;
    } catch (err) {
      logger.error('Error creating goal:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<PersonalGoal>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const parsedGoal = parseGoal(data);
      setGoals(prev => prev.map(g => g.id === goalId ? parsedGoal : g));

      return parsedGoal;
    } catch (err) {
      logger.error('Error updating goal:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found');

    // The database trigger will auto-calculate progress_percentage and update status
    // It will also check milestone achievements
    return await updateGoal(goalId, {
      current_value: newValue,
    });
  };

  const deleteGoal = async (goalId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      logger.error('Error deleting goal:', err);
      setError(err as Error);
      throw err;
    }
  };

  const pauseGoal = async (goalId: string) => {
    return await updateGoal(goalId, { status: 'paused' });
  };

  const resumeGoal = async (goalId: string) => {
    return await updateGoal(goalId, { status: 'active' });
  };

  const completeGoal = async (goalId: string) => {
    return await updateGoal(goalId, {
      status: 'completed',
      completed_at: new Date(),
      progress_percentage: 100,
    });
  };

  const abandonGoal = async (goalId: string) => {
    return await updateGoal(goalId, { status: 'abandoned' });
  };

  // Computed values
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const pausedGoals = goals.filter(g => g.status === 'paused');

  return {
    // State
    goals,
    activeGoals,
    completedGoals,
    pausedGoals,
    loading,
    error,

    // Actions
    createGoal,
    updateGoal,
    updateProgress,
    deleteGoal,
    pauseGoal,
    resumeGoal,
    completeGoal,
    abandonGoal,
    refetch: fetchGoals,
  };
};

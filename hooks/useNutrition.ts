import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useNutrition');

export interface DailyNutrition {
  id: string;
  user_id: string;
  date: Date;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  water_ml?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NutritionInput {
  date: string; // ISO date string (YYYY-MM-DD)
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  water_ml?: number;
  notes?: string;
}

export const useNutrition = () => {
  const { user } = useUser();
  const [nutrition, setNutrition] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchNutrition();
    }
  }, [user]);

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('daily_nutrition')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Parse dates
      const parsedData = (data || []).map(item => ({
        ...item,
        date: new Date(item.date),
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setNutrition(parsedData);
    } catch (err) {
      logger.error('Error fetching nutrition', err as Error);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get today's nutrition data
   */
  const getTodayNutrition = (): DailyNutrition | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return nutrition.find(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  };

  /**
   * Get nutrition data by specific date
   */
  const getNutritionByDate = (date: Date): DailyNutrition | undefined => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return nutrition.find(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === targetDate.getTime();
    });
  };

  /**
   * Get nutrition data for a date range
   */
  const getNutritionRange = (startDate: Date, endDate: Date): DailyNutrition[] => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return nutrition.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };

  /**
   * Create or update nutrition data (upsert)
   */
  const createOrUpdateNutrition = async (nutritionData: NutritionInput) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found. Please wait for sync to complete.');
      }

      // Use upsert to insert or update
      const { error: upsertError } = await supabase
        .from('daily_nutrition')
        .upsert({
          user_id: user.id,
          ...nutritionData,
        }, {
          onConflict: 'user_id,date',
        });

      if (upsertError) throw upsertError;
      await fetchNutrition();
    } catch (err) {
      logger.error('Error creating or updating nutrition', err as Error);
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Delete nutrition data by date
   */
  const deleteNutritionByDate = async (date: string) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not found');
      }

      const { error: deleteError } = await supabase
        .from('daily_nutrition')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (deleteError) throw deleteError;
      await fetchNutrition();
    } catch (err) {
      logger.error('Error deleting nutrition', err as Error);
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Calculate weekly averages
   */
  const getWeeklyAverages = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekData = getNutritionRange(weekAgo, today);

    if (weekData.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFats: 0,
        avgWater: 0,
        daysTracked: 0,
      };
    }

    const totals = weekData.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fats: acc.fats + (item.fats || 0),
      water: acc.water + (item.water_ml || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 });

    const count = weekData.length;

    return {
      avgCalories: Math.round(totals.calories / count),
      avgProtein: Math.round(totals.protein / count),
      avgCarbs: Math.round(totals.carbs / count),
      avgFats: Math.round(totals.fats / count),
      avgWater: Math.round(totals.water / count),
      daysTracked: count,
    };
  };

  return {
    nutrition,
    loading,
    error,
    getTodayNutrition,
    getNutritionByDate,
    getNutritionRange,
    createOrUpdateNutrition,
    deleteNutritionByDate,
    getWeeklyAverages,
    refetch: fetchNutrition,
  };
};

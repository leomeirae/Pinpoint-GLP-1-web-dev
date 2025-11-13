// hooks/useAlcoholLogs.ts
// Hook para gerenciar logs de consumo de álcool

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { useUser } from '@/hooks/useUser';

const logger = createLogger('useAlcoholLogs');

export interface AlcoholLog {
  id: string;
  user_id: string;
  date: string;
  consumed: boolean;
  drinks_count: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsertAlcoholLog {
  date: string;
  consumed: boolean;
  drinks_count?: number;
  notes?: string;
}

export interface UpdateAlcoholLog {
  consumed?: boolean;
  drinks_count?: number;
  notes?: string;
}

export function useAlcoholLogs(startDate?: string, endDate?: string) {
  const { user } = useUser();
  const userId = user?.id; // Supabase UUID, não Clerk ID
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch de logs do usuário
  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('alcohol_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Aplicar filtros de data se fornecidos
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setLogs(data || []);
      logger.debug('Logs de álcool carregados', { count: data?.length });
    } catch (err) {
      logger.error('Erro ao buscar logs de álcool', err as Error);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, startDate, endDate]);

  // Carregar logs ao montar
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`alcohol_logs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alcohol_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('Real-time update', { event: payload.eventType });
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchLogs]);

  // Toggle de álcool para uma data específica (insert ou update)
  const toggleAlcoholForDate = useCallback(
    async (
      date: string,
      consumed: boolean,
      drinksCount?: number,
      notes?: string
    ): Promise<AlcoholLog | null> => {
      if (!userId) {
        logger.error('Tentativa de registrar álcool sem usuário autenticado');
        return null;
      }

      try {
        logger.info('Toggle de álcool', { date, consumed, drinksCount });

        // Verificar se já existe log para essa data
        const { data: existing } = await supabase
          .from('alcohol_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', date)
          .maybeSingle();

        let result;

        if (existing) {
          // Atualizar existente
          const { data: updated, error: updateError } = await supabase
            .from('alcohol_logs')
            .update({
              consumed,
              drinks_count: drinksCount,
              notes,
            })
            .eq('id', existing.id)
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) throw updateError;
          result = updated;
        } else {
          // Inserir novo
          const { data: inserted, error: insertError } = await supabase
            .from('alcohol_logs')
            .insert({
              user_id: userId,
              date,
              consumed,
              drinks_count: drinksCount,
              notes,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          result = inserted;
        }

        await fetchLogs();
        return result;
      } catch (err) {
        logger.error('Erro ao registrar álcool', err as Error);
        throw err;
      }
    },
    [userId, fetchLogs]
  );

  // Deletar log de álcool
  const deleteLog = useCallback(
    async (logId: string): Promise<boolean> => {
      if (!userId) {
        logger.error('Tentativa de deletar log sem usuário autenticado');
        return false;
      }

      try {
        logger.info('Deletando log de álcool', { logId });

        const { error: deleteError } = await supabase
          .from('alcohol_logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        await fetchLogs();
        return true;
      } catch (err) {
        logger.error('Erro ao deletar log', err as Error);
        throw err;
      }
    },
    [userId, fetchLogs]
  );

  // Obter array de datas com consumo de álcool em um range
  const getAlcoholDatesInRange = useCallback(
    (rangeStartDate: string, rangeEndDate: string): string[] => {
      return logs
        .filter((log) => {
          const logDate = log.date;
          return (
            log.consumed &&
            logDate >= rangeStartDate &&
            logDate <= rangeEndDate
          );
        })
        .map((log) => log.date)
        .sort();
    },
    [logs]
  );

  // Verificar se uma data específica tem consumo de álcool
  const hasAlcoholOnDate = useCallback(
    (date: string): boolean => {
      const log = logs.find((l) => l.date === date);
      return log?.consumed === true;
    },
    [logs]
  );

  // Obter log de uma data específica
  const getLogForDate = useCallback(
    (date: string): AlcoholLog | undefined => {
      return logs.find((l) => l.date === date);
    },
    [logs]
  );

  // Obter estatísticas
  const getStats = useCallback(() => {
    const totalDaysLogged = logs.length;
    const daysWithAlcohol = logs.filter((l) => l.consumed).length;
    const daysWithoutAlcohol = logs.filter((l) => !l.consumed).length;
    const totalDrinks = logs.reduce((sum, l) => sum + (l.drinks_count || 0), 0);
    const avgDrinksPerDay =
      daysWithAlcohol > 0 ? totalDrinks / daysWithAlcohol : 0;

    return {
      totalDaysLogged,
      daysWithAlcohol,
      daysWithoutAlcohol,
      totalDrinks,
      avgDrinksPerDay: Math.round(avgDrinksPerDay * 10) / 10, // 1 casa decimal
    };
  }, [logs]);

  return {
    logs,
    loading,
    error,
    toggleAlcoholForDate,
    deleteLog,
    getAlcoholDatesInRange,
    hasAlcoholOnDate,
    getLogForDate,
    getStats,
    refetch: fetchLogs,
  };
}


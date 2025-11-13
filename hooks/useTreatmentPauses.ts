// hooks/useTreatmentPauses.ts
// Hook para gerenciar pausas no tratamento

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { useUser } from '@/hooks/useUser';
import { pauseWeeklyReminders, resumeWeeklyReminders } from '@/lib/notifications';

const logger = createLogger('useTreatmentPauses');

export interface TreatmentPause {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsertPause {
  start_date: string;
  reason?: string;
  notes?: string;
}

export interface UpdatePause {
  end_date?: string;
  reason?: string;
  notes?: string;
}

export function useTreatmentPauses() {
  const { user } = useUser();
  const userId = user?.id; // Supabase UUID, não Clerk ID
  const [pauses, setPauses] = useState<TreatmentPause[]>([]);
  const [activePause, setActivePause] = useState<TreatmentPause | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch de pausas do usuário
  const fetchPauses = useCallback(async () => {
    if (!userId) {
      setPauses([]);
      setActivePause(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('treatment_pauses')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      setPauses(data || []);
      
      // Identificar pausa ativa (end_date = null)
      const active = data?.find(p => p.end_date === null) || null;
      setActivePause(active);

      logger.debug('Pausas carregadas', { count: data?.length, hasActive: !!active });
    } catch (err) {
      logger.error('Erro ao buscar pausas', err as Error);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Carregar pausas ao montar
  useEffect(() => {
    fetchPauses();
  }, [fetchPauses]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`treatment_pauses:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treatment_pauses',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('Real-time update', { event: payload.eventType });
          fetchPauses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchPauses]);

  // Iniciar pausa
  const startPause = useCallback(
    async (data: InsertPause): Promise<TreatmentPause | null> => {
      if (!userId) {
        logger.error('Tentativa de criar pausa sem usuário autenticado');
        return null;
      }

      // Verificar se já existe pausa ativa
      if (activePause) {
        logger.warn('Já existe uma pausa ativa');
        throw new Error('Você já tem uma pausa ativa. Encerre-a antes de iniciar outra.');
      }

      try {
        logger.info('Iniciando pausa', data);

        const { data: pause, error: insertError } = await supabase
          .from('treatment_pauses')
          .insert({
            user_id: userId,
            ...data,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Pausar notificações
        await pauseWeeklyReminders();
        logger.info('Notificações pausadas');

        await fetchPauses();
        return pause;
      } catch (err) {
        logger.error('Erro ao iniciar pausa', err as Error);
        throw err;
      }
    },
    [userId, activePause, fetchPauses]
  );

  // Encerrar pausa
  const endPause = useCallback(
    async (pauseId: string, endDate: string): Promise<TreatmentPause | null> => {
      if (!userId) {
        logger.error('Tentativa de encerrar pausa sem usuário autenticado');
        return null;
      }

      try {
        logger.info('Encerrando pausa', { pauseId, endDate });

        const { data: pause, error: updateError } = await supabase
          .from('treatment_pauses')
          .update({ end_date: endDate })
          .eq('id', pauseId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Retomar notificações
        await resumeWeeklyReminders();
        logger.info('Notificações retomadas');

        await fetchPauses();
        return pause;
      } catch (err) {
        logger.error('Erro ao encerrar pausa', err as Error);
        throw err;
      }
    },
    [userId, fetchPauses]
  );

  // Atualizar pausa
  const updatePause = useCallback(
    async (pauseId: string, updates: UpdatePause): Promise<TreatmentPause | null> => {
      if (!userId) {
        logger.error('Tentativa de atualizar pausa sem usuário autenticado');
        return null;
      }

      try {
        logger.info('Atualizando pausa', { pauseId, updates });

        const { data: pause, error: updateError } = await supabase
          .from('treatment_pauses')
          .update(updates)
          .eq('id', pauseId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        await fetchPauses();
        return pause;
      } catch (err) {
        logger.error('Erro ao atualizar pausa', err as Error);
        throw err;
      }
    },
    [userId, fetchPauses]
  );

  // Deletar pausa
  const deletePause = useCallback(
    async (pauseId: string): Promise<boolean> => {
      if (!userId) {
        logger.error('Tentativa de deletar pausa sem usuário autenticado');
        return false;
      }

      try {
        logger.info('Deletando pausa', { pauseId });

        const { error: deleteError } = await supabase
          .from('treatment_pauses')
          .delete()
          .eq('id', pauseId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        await fetchPauses();
        return true;
      } catch (err) {
        logger.error('Erro ao deletar pausa', err as Error);
        throw err;
      }
    },
    [userId, fetchPauses]
  );

  // Helper: verificar se está pausado
  const isCurrentlyPaused = useCallback((): boolean => {
    return activePause !== null;
  }, [activePause]);

  // Helper: obter pausa ativa
  const getActivePause = useCallback((): TreatmentPause | null => {
    return activePause;
  }, [activePause]);

  // Helper: calcular duração de uma pausa (em dias)
  const getPauseDuration = useCallback((pause: TreatmentPause): number => {
    const start = new Date(pause.start_date);
    const end = pause.end_date ? new Date(pause.end_date) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, []);

  return {
    pauses,
    activePause,
    loading,
    error,
    startPause,
    endPause,
    updatePause,
    deletePause,
    isCurrentlyPaused,
    getActivePause,
    getPauseDuration,
    refetch: fetchPauses,
  };
}


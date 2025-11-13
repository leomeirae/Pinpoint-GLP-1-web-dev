// hooks/useConsent.ts
// Hook para gerenciar consentimentos do usuário (LGPD/GDPR compliance)

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useConsent');

export type ConsentType = 'analytics' | 'finance_r_per_kg' | 'notifications';
export type ConsentAction = 'granted' | 'revoked';

export interface ConsentHistoryEntry {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  action: ConsentAction;
  consent_version: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ConsentStatus {
  analytics: boolean;
  finance_r_per_kg: boolean;
  notifications: boolean;
}

export function useConsent() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Conceder consentimento
   * Atualiza users table, insere em consent_history e atualiza AsyncStorage
   */
  const grantConsent = useCallback(
    async (type: ConsentType, version: string = '1.0.0'): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        logger.info('Granting consent', { type, version, userId });

        // Buscar user_id no Supabase via clerk_id
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userFetchError || !userData) {
          logger.error('Error fetching user from Supabase', userFetchError);
          throw new Error('User not found in Supabase');
        }

        const supabaseUserId = userData.id;

        // 1. Atualizar users table
        const columnName = `${type.replace(/_/g, '_')}_opt_in`;
        const { error: updateError } = await supabase
          .from('users')
          .update({ [columnName]: true })
          .eq('id', supabaseUserId);

        if (updateError) {
          logger.error('Error updating users table', updateError);
          throw updateError;
        }

        // 2. Inserir em consent_history
        const { error: historyError } = await supabase
          .from('consent_history')
          .insert({
            user_id: supabaseUserId,
            consent_type: type,
            action: 'granted',
            consent_version: version,
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'app',
              device: 'mobile',
            },
          });

        if (historyError) {
          logger.error('Error inserting consent history', historyError);
          throw historyError;
        }

        logger.info('Consent granted successfully', { type });
      } catch (error) {
        logger.error('Error granting consent', error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  /**
   * Revogar consentimento
   * Atualiza users table, insere em consent_history e atualiza AsyncStorage
   */
  const revokeConsent = useCallback(
    async (type: ConsentType, version: string = '1.0.0'): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        logger.info('Revoking consent', { type, version, userId });

        // Buscar user_id no Supabase via clerk_id
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userFetchError || !userData) {
          logger.error('Error fetching user from Supabase', userFetchError);
          throw new Error('User not found in Supabase');
        }

        const supabaseUserId = userData.id;

        // 1. Atualizar users table
        const columnName = `${type.replace(/_/g, '_')}_opt_in`;
        const { error: updateError } = await supabase
          .from('users')
          .update({ [columnName]: false })
          .eq('id', supabaseUserId);

        if (updateError) {
          logger.error('Error updating users table', updateError);
          throw updateError;
        }

        // 2. Inserir em consent_history
        const { error: historyError } = await supabase
          .from('consent_history')
          .insert({
            user_id: supabaseUserId,
            consent_type: type,
            action: 'revoked',
            consent_version: version,
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'app',
              device: 'mobile',
            },
          });

        if (historyError) {
          logger.error('Error inserting consent history', historyError);
          throw historyError;
        }

        logger.info('Consent revoked successfully', { type });
      } catch (error) {
        logger.error('Error revoking consent', error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  /**
   * Buscar histórico de consentimentos
   * Retorna últimos 20 registros (ou filtrados por tipo)
   */
  const getConsentHistory = useCallback(
    async (type?: ConsentType): Promise<ConsentHistoryEntry[]> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        logger.info('Fetching consent history', { type, userId });

        // Buscar user_id no Supabase via clerk_id
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userFetchError || !userData) {
          logger.error('Error fetching user from Supabase', userFetchError);
          throw new Error('User not found in Supabase');
        }

        const supabaseUserId = userData.id;

        let query = supabase
          .from('consent_history')
          .select('*')
          .eq('user_id', supabaseUserId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (type) {
          query = query.eq('consent_type', type);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Error fetching consent history', error);
          throw error;
        }

        return (data as ConsentHistoryEntry[]) || [];
      } catch (error) {
        logger.error('Error fetching consent history', error as Error);
        throw error;
      }
    },
    [userId]
  );

  /**
   * Obter status atual de todos os consentimentos
   */
  const getConsentStatus = useCallback(async (): Promise<ConsentStatus | null> => {
    if (!userId) {
      return null;
    }

    try {
      // Buscar user_id no Supabase via clerk_id
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('id, analytics_opt_in, finance_opt_in')
        .eq('clerk_id', userId)
        .single();

      if (userFetchError || !userData) {
        logger.error('Error fetching user consent status', userFetchError);
        return null;
      }

      return {
        analytics: userData.analytics_opt_in || false,
        finance_r_per_kg: userData.finance_opt_in || false,
        notifications: true, // Sempre true por padrão (usuário controla via OS)
      };
    } catch (error) {
      logger.error('Error fetching consent status', error as Error);
      return null;
    }
  }, [userId]);

  return {
    grantConsent,
    revokeConsent,
    getConsentHistory,
    getConsentStatus,
    loading,
  };
}


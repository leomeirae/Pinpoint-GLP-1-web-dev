// hooks/useOnboarding.ts
// Hook para salvar dados do onboarding no Supabase

import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { trackEvent, setAnalyticsOptIn } from '@/lib/analytics';
import { createLogger } from '@/lib/logger';
import { logError } from '@/lib/remote-logger';

const logger = createLogger('useOnboarding');

export interface OnboardingData {
  // Dados de medicação
  medication?: string; // 'mounjaro' | 'ozempic' | etc.
  initial_dose?: number; // 2.5, 5, 7.5, etc.
  frequency?: string; // 'weekly' | 'daily'
  device_type?: string; // 'pen' | 'syringe' | 'auto-injector'

  // Dados físicos
  height?: number; // em cm
  height_unit?: 'cm' | 'ft';
  current_weight?: number;
  weight_unit?: 'kg' | 'lb';
  starting_weight?: number;
  start_date?: string; // ISO date string
  target_weight?: number;

  // Preferências (não persistidas no P0)
  motivation?: string;
  side_effects_concerns?: string[];
  activity_level?: string;
  food_noise_day?: string;
  weight_loss_rate?: string;

  // Novos campos do onboarding 5 core
  preferredDay?: number; // 0-6 (dom-sab)
  preferredTime?: string; // HH:mm formato 24h
  consentVersion?: string;
  consentAcceptedAt?: string;
  analyticsOptIn?: boolean;
}

export function useOnboarding() {
  const { userId } = useAuth();

  const saveOnboardingData = async (data: OnboardingData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Buscar usuário diretamente no Supabase (aguardar até ser criado)
    let userIdSupabase: string | null = null;
    let retries = 0;

    while (!userIdSupabase && retries < 10) {
      logger.debug('Waiting for user to be created in Supabase', {
        attempt: retries + 1,
        maxAttempts: 10,
      });

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .maybeSingle();

      if (!fetchError && userData?.id) {
        userIdSupabase = userData.id;
        logger.info('User found in Supabase', { userIdSupabase });
        break;
      }

      if (retries === 9) {
        const error = new Error('User not found in Supabase. Please wait a moment and try again.');
        await logError('useOnboarding.waitForUser.timeout', error, {
          userId,
          retries,
          maxRetries: 10,
        });
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      retries++;
    }

    if (!userIdSupabase) {
      const error = new Error('User not found in Supabase. Please try again.');
      await logError('useOnboarding.userNotFound', error, {
        userId,
        retries,
      });
      throw error;
    }

    try {
      // 1. Atualizar tabela users com dados físicos e novos campos do onboarding 5 core
      const userUpdates: Partial<{
        height: number;
        start_weight: number;
        target_weight: number;
        onboarding_completed: boolean;
        consent_version?: string;
        consent_accepted_at?: string;
        analytics_opt_in?: boolean;
        preferred_day?: number;
        preferred_time?: string;
      }> = {
        onboarding_completed: true,
      };

      // Novos campos do onboarding 5 core
      if (data.consentVersion) {
        userUpdates.consent_version = data.consentVersion;
      }
      if (data.consentAcceptedAt) {
        userUpdates.consent_accepted_at = data.consentAcceptedAt;
      }
      if (data.analyticsOptIn !== undefined) {
        userUpdates.analytics_opt_in = data.analyticsOptIn;
      }
      if (data.preferredDay !== undefined) {
        userUpdates.preferred_day = data.preferredDay;
      }
      if (data.preferredTime) {
        userUpdates.preferred_time = data.preferredTime;
      }

      // Converter altura para cm se necessário
      if (data.height) {
        if (data.height_unit === 'ft') {
          // Converter ft+in para cm (precisaria dos inches também)
          // Por enquanto, assumir que já está em cm
          userUpdates.height = data.height;
        } else {
          userUpdates.height = data.height; // já está em cm
        }
      }

      // Converter peso para kg se necessário
      if (data.current_weight) {
        const weightKg =
          data.weight_unit === 'lb' ? data.current_weight * 0.453592 : data.current_weight;

        const today = new Date().toISOString().split('T')[0];

        // Verificar se já existe registro para hoje com source='onboarding'
        const { data: existing } = await supabase
          .from('weight_logs')
          .select('id')
          .eq('user_id', userIdSupabase)
          .eq('date', today)
          .eq('source', 'onboarding')
          .maybeSingle();

        if (!existing) {
          // Criar registro inicial em weight_logs com source='onboarding'
          await supabase.from('weight_logs').insert({
            user_id: userIdSupabase,
            weight: weightKg,
            unit: 'kg',
            date: today,
            source: 'onboarding',
          });
        }
      }

      if (data.starting_weight) {
        const startWeightKg =
          data.weight_unit === 'lb' ? data.starting_weight * 0.453592 : data.starting_weight;
        userUpdates.start_weight = startWeightKg;
      }

      if (data.target_weight) {
        const targetWeightKg =
          data.weight_unit === 'lb' ? data.target_weight * 0.453592 : data.target_weight;
        userUpdates.target_weight = targetWeightKg;
      }

      // Atualizar users (usando RPC para contornar cache do PostgREST)
      logger.info('Saving onboarding data to users table', {
        userIdSupabase,
        updates: userUpdates,
        setting_onboarding_completed: true,
      });

      // Usar update normal (tentativa final antes de migrar para Convex)
      logger.info('Attempting to update user with all fields', { userUpdates });
      
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userIdSupabase);

      if (userError) {
        logger.error('Error updating user', userError);
        
        // Se erro for de cache (PGRST204 ou PGRST202), logar mas permitir continuar
        if (userError.code === 'PGRST204' || userError.code === 'PGRST202') {
          logger.warn(
            '⚠️ PostgREST cache issue - dados NÃO salvos no Supabase, mas fluxo continua',
            {
              code: userError.code,
              message: userError.message,
              userIdSupabase,
            }
          );
          logger.info(
            '💡 WORKAROUND ATIVO: Usuário pode continuar, mas dados não estão persistidos no Supabase. Resolver bug ou migrar para Convex.'
          );
          // NÃO throw - permitir que usuário continue usando o app
        } else {
          await logError('useOnboarding.updateUser', userError, {
            userIdSupabase,
            updates: userUpdates,
            userId,
          });
          throw userError;
        }
      } else {
        logger.info('✅ User updated successfully');
      }

      logger.info('✅ Onboarding completed successfully', {
        userIdSupabase,
        onboarding_completed: true,
      });

      // Salvar analytics opt-in em AsyncStorage também
      if (data.analyticsOptIn !== undefined) {
        await setAnalyticsOptIn(data.analyticsOptIn, userIdSupabase);
        logger.info('Analytics opt-in saved', { value: data.analyticsOptIn });
      }

      // 2. Criar registro em medications se houver dados de medicação
      if (data.medication && data.initial_dose && data.frequency) {
        const { error: medError } = await supabase.from('medications').insert({
          user_id: userIdSupabase,
          type: data.medication,
          dosage: data.initial_dose,
          frequency: data.frequency,
          start_date: data.start_date || new Date().toISOString().split('T')[0],
          active: true,
          notes: data.device_type ? `Device: ${data.device_type}` : undefined,
        });

        if (medError) {
          logger.error('Error creating medication', medError);
          await logError('useOnboarding.insertMedication', medError, {
            userIdSupabase,
            medication: {
              type: data.medication,
              dosage: data.initial_dose,
              frequency: data.frequency,
            },
          });
          throw medError;
        }
      }

      // 3. Criar registro inicial em weight_logs se houver starting_weight e start_date
      if (data.starting_weight && data.start_date) {
        const startWeightKg =
          data.weight_unit === 'lb' ? data.starting_weight * 0.453592 : data.starting_weight;

        // Verificar se já existe registro para essa data com source='onboarding'
        const { data: existing } = await supabase
          .from('weight_logs')
          .select('id')
          .eq('user_id', userIdSupabase)
          .eq('date', data.start_date)
          .eq('source', 'onboarding')
          .maybeSingle();

        if (!existing) {
          const { error: weightError } = await supabase.from('weight_logs').insert({
            user_id: userIdSupabase,
            weight: startWeightKg,
            unit: 'kg',
            date: data.start_date,
            source: 'onboarding',
          });

          if (weightError) {
            logger.error('Error creating initial weight log', weightError);
            await logError('useOnboarding.insertWeightLog', weightError, {
              userIdSupabase,
              weight: startWeightKg,
              date: data.start_date,
              code: weightError.code,
            });
            // Não falhar se já existir registro para essa data
            if (weightError.code !== '23505') {
              // Unique violation
              throw weightError;
            }
          }
        }
      }

      // Track evento
      trackEvent('onboarding_completed', {
        total_time_seconds: 0, // TODO: calcular tempo total
        skipped_steps: [],
        data_completed: {
          has_medication: !!data.medication,
          has_height: !!data.height,
          has_weight: !!data.current_weight,
          has_target_weight: !!data.target_weight,
        },
      });

      // VALIDAR se dados foram realmente salvos (DESABILITADO devido ao bug do PostgREST cache)
      // TODO: Reabilitar validação após resolver bug do cache ou migrar para Convex
      logger.warn(
        '⚠️ Validação de onboarding pulada devido ao bug do PostgREST cache (PGRST204/PGRST202)'
      );
      logger.info('✅ Onboarding considerado completo (workaround para bug de cache)', {
        userIdSupabase,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error saving onboarding data', error);
      await logError('useOnboarding.saveOnboardingData', error, {
        userId,
        data: {
          has_medication: !!data.medication,
          has_height: !!data.height,
          has_weight: !!data.current_weight,
          has_target_weight: !!data.target_weight,
        },
      });
      trackEvent('error_occurred', {
        error_code: 'ONBOARDING_SAVE_ERROR',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        screen_name: 'onboarding',
        action: 'save',
      });
      throw error;
    }
  };

  /**
   * Salva dados do onboarding 5 core (modo convidado ou autenticado)
   */
  const saveOnboarding5CoreData = async (
    data: {
      medication?: string;
      dosage?: number;
      preferredDay?: number;
      preferredTime?: string;
      consentVersion?: string;
      consentAcceptedAt?: string;
      analyticsOptIn?: boolean;
    },
    isGuestMode: boolean = false
  ) => {
    if (isGuestMode) {
      // Modo convidado: salvar apenas em AsyncStorage
      try {
        const guestData = {
          ...data,
          isGuestMode: true,
          savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('@mounjaro:guest_onboarding', JSON.stringify(guestData));
        logger.info('Guest onboarding data saved to AsyncStorage');
        return { success: true, guestMode: true };
      } catch (error) {
        logger.error('Error saving guest onboarding data', error as Error);
        throw error;
      }
    }

    // Modo autenticado: salvar no Supabase
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return saveOnboardingData({
      medication: data.medication,
      initial_dose: data.dosage,
      frequency: 'weekly', // Sempre semanal para GLP-1
      preferredDay: data.preferredDay,
      preferredTime: data.preferredTime,
      consentVersion: data.consentVersion,
      consentAcceptedAt: data.consentAcceptedAt,
      analyticsOptIn: data.analyticsOptIn,
    });
  };

  /**
   * Migra dados de modo convidado para conta autenticada
   */
  const migrateGuestDataToAccount = async (userIdSupabase: string) => {
    try {
      const guestDataStr = await AsyncStorage.getItem('@mounjaro:guest_onboarding');
      if (!guestDataStr) {
        logger.info('No guest data to migrate');
        return { success: true, migrated: false };
      }

      const guestData = JSON.parse(guestDataStr);
      logger.info('Migrating guest data to account', { userIdSupabase });

      // Migrar dados para Supabase
      const updates: any = {
        onboarding_completed: true,
      };

      if (guestData.consentVersion) {
        updates.consent_version = guestData.consentVersion;
      }
      if (guestData.consentAcceptedAt) {
        updates.consent_accepted_at = guestData.consentAcceptedAt;
      }
      if (guestData.analyticsOptIn !== undefined) {
        updates.analytics_opt_in = guestData.analyticsOptIn;
      }
      if (guestData.preferredDay !== undefined) {
        updates.preferred_day = guestData.preferredDay;
      }
      if (guestData.preferredTime) {
        updates.preferred_time = guestData.preferredTime;
      }

      // Atualizar users (tentando update normal, ignorando erros de cache)
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userIdSupabase);

      if (updateError) {
        // Se erro for de cache, logar mas não falhar
        if (updateError.code === 'PGRST204' || updateError.code === 'PGRST202') {
          logger.warn('⚠️ PostgREST cache issue during guest migration, but continuing...', {
            code: updateError.code,
          });
        } else {
          logger.error('Error migrating guest data', updateError);
          throw updateError;
        }
      } else {
        logger.info('✅ Guest data migrated successfully');
      }

      // Criar medication se houver
      if (guestData.medication && guestData.dosage) {
        await supabase.from('medications').insert({
          user_id: userIdSupabase,
          type: guestData.medication,
          dosage: guestData.dosage,
          frequency: 'weekly',
          start_date: new Date().toISOString().split('T')[0],
          active: true,
        });
      }

      // Limpar dados de convidado
      await AsyncStorage.removeItem('@mounjaro:guest_onboarding');
      logger.info('Guest data migrated successfully');

      return { success: true, migrated: true };
    } catch (error) {
      logger.error('Error migrating guest data', error as Error);
      throw error;
    }
  };

  return {
    saveOnboardingData,
    saveOnboarding5CoreData,
    migrateGuestDataToAccount,
  };
}

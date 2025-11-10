// hooks/useOnboarding.ts
// Hook para salvar dados do onboarding no Supabase

import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
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
      // 1. Atualizar tabela users com dados físicos
      const userUpdates: Partial<{
        height: number;
        start_weight: number;
        target_weight: number;
        onboarding_completed: boolean;
      }> = {
        onboarding_completed: true,
      };

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

      // Atualizar users
      logger.info('Saving onboarding data to users table', {
        userIdSupabase,
        updates: userUpdates,
        setting_onboarding_completed: true,
      });

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userIdSupabase);

      if (userError) {
        logger.error('Error updating user', userError);
        await logError('useOnboarding.updateUser', userError, {
          userIdSupabase,
          updates: userUpdates,
          userId,
        });
        throw userError;
      }

      logger.info('✅ Onboarding completed successfully', {
        userIdSupabase,
        onboarding_completed: true,
      });

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

      // VALIDAR se dados foram realmente salvos
      logger.info('Validating saved data...', { userIdSupabase });
      const { data: savedUser, error: verifyError } = await supabase
        .from('users')
        .select('onboarding_completed, height, start_weight, target_weight')
        .eq('id', userIdSupabase)
        .single();

      if (verifyError || !savedUser) {
        logger.error('Failed to verify saved data', verifyError);
        await logError('useOnboarding.verifySave', verifyError || new Error('No data returned'), {
          userIdSupabase,
        });
        throw new Error('Failed to verify data was saved. Please try again.');
      }

      if (!savedUser.onboarding_completed) {
        logger.error('onboarding_completed not saved', { savedUser });
        await logError(
          'useOnboarding.onboardingNotSaved',
          new Error('onboarding_completed is still false after save'),
          { userIdSupabase, savedUser }
        );
        throw new Error('Data was not saved correctly. Please try again.');
      }

      logger.info('✅ Data verified successfully', { savedUser });

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

  return {
    saveOnboardingData,
  };
}

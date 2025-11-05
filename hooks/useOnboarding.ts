// hooks/useOnboarding.ts
// Hook para salvar dados do onboarding no Supabase

import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

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
      console.log(`⏳ Aguardando usuário ser criado no Supabase... (tentativa ${retries + 1})`);
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .maybeSingle();

      if (!fetchError && userData?.id) {
        userIdSupabase = userData.id;
        console.log('✅ Usuário encontrado no Supabase:', userIdSupabase);
        break;
      }

      if (retries === 9) {
        throw new Error('User not found in Supabase. Please wait a moment and try again.');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }

    if (!userIdSupabase) {
      throw new Error('User not found in Supabase. Please try again.');
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
        const weightKg = data.weight_unit === 'lb' 
          ? data.current_weight * 0.453592 
          : data.current_weight;
        
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
          await supabase
            .from('weight_logs')
            .insert({
              user_id: userIdSupabase,
              weight: weightKg,
              unit: 'kg',
              date: today,
              source: 'onboarding',
            });
        }
      }

      if (data.starting_weight) {
        const startWeightKg = data.weight_unit === 'lb'
          ? data.starting_weight * 0.453592
          : data.starting_weight;
        userUpdates.start_weight = startWeightKg;
      }

      if (data.target_weight) {
        const targetWeightKg = data.weight_unit === 'lb'
          ? data.target_weight * 0.453592
          : data.target_weight;
        userUpdates.target_weight = targetWeightKg;
      }

      // Atualizar users
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userIdSupabase);

      if (userError) {
        console.error('Error updating user:', userError);
        throw userError;
      }

      // 2. Criar registro em medications se houver dados de medicação
      if (data.medication && data.initial_dose && data.frequency) {
        const { error: medError } = await supabase
          .from('medications')
          .insert({
            user_id: userIdSupabase,
            type: data.medication,
            dosage: data.initial_dose,
            frequency: data.frequency,
            start_date: data.start_date || new Date().toISOString().split('T')[0],
            active: true,
            notes: data.device_type ? `Device: ${data.device_type}` : undefined,
          });

        if (medError) {
          console.error('Error creating medication:', medError);
          throw medError;
        }
      }

      // 3. Criar registro inicial em weight_logs se houver starting_weight e start_date
      if (data.starting_weight && data.start_date) {
        const startWeightKg = data.weight_unit === 'lb'
          ? data.starting_weight * 0.453592
          : data.starting_weight;

        // Verificar se já existe registro para essa data com source='onboarding'
        const { data: existing } = await supabase
          .from('weight_logs')
          .select('id')
          .eq('user_id', userIdSupabase)
          .eq('date', data.start_date)
          .eq('source', 'onboarding')
          .maybeSingle();

        if (!existing) {
          const { error: weightError } = await supabase
            .from('weight_logs')
            .insert({
              user_id: userIdSupabase,
              weight: startWeightKg,
              unit: 'kg',
              date: data.start_date,
              source: 'onboarding',
            });

          if (weightError) {
            console.error('Error creating initial weight log:', weightError);
            // Não falhar se já existir registro para essa data
            if (weightError.code !== '23505') { // Unique violation
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

      return { success: true };
    } catch (error) {
      console.error('Error saving onboarding data:', error);
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

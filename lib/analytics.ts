// lib/analytics.ts
// Sistema de Analytics para tracking de eventos

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { logger } from './logger';
import { createLogger } from './logger';

// Tipos de eventos conforme TRACKING-EVENTS-SPEC.md
export type AnalyticsEvent =
  // Onboarding
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_step_completed'
  | 'onboarding_step_next'
  | 'onboarding_step_back'
  | 'onboarding_step_skipped'
  | 'onboarding_consent_accepted'
  | 'onboarding_completed'
  | 'onboarding_abandoned'
  // Paywall
  | 'paywall_viewed'
  | 'paywall_impression'
  | 'trial_start'
  | 'trial_started'
  | 'trial_convert'
  | 'trial_cancel'
  | 'trial_expire'
  | 'trial_expired'
  | 'paywall_subscription_started'
  | 'paywall_dismissed'
  | 'premium_feature_accessed'
  | 'premium_feature_blocked'
  // FAQ
  | 'faq_viewed'
  | 'faq_searched'
  | 'faq_question_opened'
  // Application
  | 'application_create_started'
  | 'application_create_completed'
  | 'application_create_failed'
  | 'application_edited'
  | 'application_deleted'
  // Navigation
  | 'screen_viewed'
  | 'tab_changed'
  // Errors
  | 'error_occurred'
  | 'error_retry_attempted'
  // Engagement
  | 'app_opened'
  | 'app_backgrounded'
  | 'pull_to_refresh'
  // Carousel
  | 'carousel_view'
  | 'carousel_slide_view'
  | 'welcome_carousel_next'
  | 'cta_start_click'
  | 'legal_open'
  // Authentication
  | 'oauth_login_started'
  | 'oauth_login_complete'
  | 'oauth_login_failed'
  | 'auth_guard_evaluation'
  | 'user_sync_started'
  | 'user_sync_complete'
  | 'user_sync_failed'
  | 'sign_out_started'
  | 'sign_out_complete'
  | 'account_deletion_started'
  | 'account_deletion_complete'
  | 'account_deletion_failed';

/**
 * Propriedades tipadas para eventos de analytics
 * Suporta tipos primitivos e objetos simples
 */
export interface AnalyticsProperties {
  screen_name?: string;
  user_id?: string;
  timestamp?: string;
  step_name?: string;
  step_index?: number;
  error_message?: string;
  feature_name?: string;
  [key: string]: string | number | boolean | undefined | null;
}

// Para desenvolvimento: apenas log no console
// Em produção: integrar com serviço de analytics (Segment, Amplitude, etc.)
const ENABLE_ANALYTICS = true; // Mudar para false em dev se necessário

const analyticsLogger = createLogger('Analytics');

// Cache em memória para performance (evitar AsyncStorage reads excessivos)
let analyticsOptInCache: boolean | null = null;

const ANALYTICS_OPT_IN_KEY = '@mounjaro:analytics_opt_in';

/**
 * Obter status de opt-in de analytics
 * Verifica cache em memória primeiro, depois AsyncStorage
 * Fallback para false (fail-safe para compliance LGPD/GDPR)
 */
export async function getAnalyticsOptIn(): Promise<boolean> {
  // 1. Verificar cache em memória
  if (analyticsOptInCache !== null) {
    return analyticsOptInCache;
  }

  try {
    // 2. Ler de AsyncStorage
    const stored = await AsyncStorage.getItem(ANALYTICS_OPT_IN_KEY);
    
    if (stored !== null) {
      const optIn = stored === 'true';
      analyticsOptInCache = optIn;
      return optIn;
    }
  } catch (error) {
    analyticsLogger.error('Error reading analytics opt-in from AsyncStorage', error as Error);
  }

  // 3. Fallback para false (fail-safe)
  analyticsOptInCache = false;
  return false;
}

/**
 * Salvar status de opt-in de analytics
 * Salva em AsyncStorage, Supabase e atualiza cache
 */
export async function setAnalyticsOptIn(value: boolean, userId?: string): Promise<void> {
  try {
    analyticsLogger.info('Setting analytics opt-in', { value, userId });

    // 1. Salvar em AsyncStorage
    await AsyncStorage.setItem(ANALYTICS_OPT_IN_KEY, value.toString());

    // 2. Atualizar cache em memória
    analyticsOptInCache = value;

    // 3. Salvar no Supabase (se userId fornecido)
    if (userId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ analytics_opt_in: value })
        .eq('id', userId);

      if (updateError) {
        analyticsLogger.error('Error updating analytics opt-in in Supabase', updateError);
      }

      // 4. Log de auditoria em consent_history
      const { error: historyError } = await supabase
        .from('consent_history')
        .insert({
          user_id: userId,
          consent_type: 'analytics',
          action: value ? 'granted' : 'revoked',
          consent_version: '1.0.0',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'app',
          },
        });

      if (historyError) {
        analyticsLogger.error('Error logging consent history', historyError);
      }
    }

    analyticsLogger.info('Analytics opt-in saved successfully');
  } catch (error) {
    analyticsLogger.error('Error setting analytics opt-in', error as Error);
    throw error;
  }
}

/**
 * Limpar cache de opt-in (útil para logout/testes)
 */
export function clearAnalyticsOptInCache(): void {
  analyticsOptInCache = null;
}

export async function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): Promise<void> {
  if (!ENABLE_ANALYTICS) {
    return;
  }

  try {
    // **CRÍTICO: Verificação de opt-in para compliance LGPD/GDPR**
    const optIn = await getAnalyticsOptIn();
    
    if (!optIn) {
      analyticsLogger.debug('Analytics opt-in disabled, skipping event', { event });
      return; // BLOQUEIO ABSOLUTO - não envia para rede
    }

    const timestamp = new Date().toISOString();

    // Em produção, enviar para serviço de analytics
    // Por enquanto, apenas log para debug
    analyticsLogger.debug(`Event: ${event}`, {
      timestamp,
      ...properties,
    });

    // TODO: Integrar com serviço de analytics
    // Exemplo:
    // Segment.track(event, {
    //   timestamp,
    //   userId: getCurrentUserId(),
    //   ...properties,
    // });
  } catch (error) {
    analyticsLogger.error('Error tracking event', error);
  }
}

export async function trackScreen(screenName: string, properties?: AnalyticsProperties): Promise<void> {
  await trackEvent('screen_viewed', {
    screen_name: screenName,
    ...properties,
  });
}

// Hook para uso em componentes React
export function useAnalytics() {
  return {
    trackEvent,
    trackScreen,
  };
}

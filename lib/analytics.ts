// lib/analytics.ts
// Sistema de Analytics para tracking de eventos

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
  | 'cta_start_click'
  | 'legal_open';

interface AnalyticsProperties {
  [key: string]: any;
}

// Para desenvolvimento: apenas log no console
// Em produção: integrar com serviço de analytics (Segment, Amplitude, etc.)
const ENABLE_ANALYTICS = true; // Mudar para false em dev se necessário

export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (!ENABLE_ANALYTICS) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Em produção, enviar para serviço de analytics
    // Por enquanto, apenas log para debug
    if (__DEV__) {
      console.log('[Analytics]', event, {
        timestamp,
        ...properties,
      });
    }

    // TODO: Integrar com serviço de analytics
    // Exemplo:
    // Segment.track(event, {
    //   timestamp,
    //   userId: getCurrentUserId(),
    //   ...properties,
    // });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export function trackScreen(screenName: string, properties?: AnalyticsProperties): void {
  trackEvent('screen_viewed', {
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


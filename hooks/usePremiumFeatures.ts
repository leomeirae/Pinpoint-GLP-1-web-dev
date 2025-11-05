// hooks/usePremiumFeatures.ts
// Hook para verificar acesso a features premium (server-side)

import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useFeatureFlag } from '@/lib/feature-flags';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';

interface EntitlementResult {
  user_id: string;
  has_plus: boolean;
  status: string;
  tier: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  renews_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  plan_type: string | null;
  canceled_at: string | null;
}

export function usePremiumFeatures() {
  const { userId } = useAuth();
  const { status, loading: subscriptionLoading } = useSubscription();
  const paywallEnabled = useFeatureFlag('FF_PAYWALL');
  const [entitlement, setEntitlement] = useState<EntitlementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar entitlement via RPC server-side
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchEntitlement();
    
    // Refresh a cada 24h ou quando app abre
    const interval = setInterval(() => {
      fetchEntitlement();
    }, 24 * 60 * 60 * 1000); // 24 horas

    return () => clearInterval(interval);
  }, [userId]);

  async function fetchEntitlement() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_entitlement')
        .single();

      if (rpcError) {
        // Se RPC falhar, usar fallback local
        // Erro PGRST116 significa que não há resultado (usuário sem subscription)
        if (rpcError.code === 'PGRST116') {
          console.log('ℹ️ No entitlement found (user has no subscription), using free tier');
          setEntitlement(null);
        } else {
          console.warn('⚠️ RPC get_entitlement failed, using local fallback:', rpcError);
          setError(`Failed to fetch premium status: ${rpcError.message}`);
          setEntitlement(null);
        }
        return;
      }

      setEntitlement(data);
    } catch (err: any) {
      console.error('❌ Error fetching entitlement:', err);
      setError(err.message || 'Unknown error fetching premium status');
      // Em caso de erro, assumir tier gratuito como fallback seguro
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  }

  // Se paywall desativado, todos têm acesso
  const hasPremium = paywallEnabled
    ? (entitlement?.has_plus ?? status.hasPremium)
    : true;

  const hasActiveTrial = entitlement?.status === 'trial' || status.hasActiveTrial;
  const isTrialExpired = entitlement?.status === 'expired' || status.isTrialExpired;
  
  const daysUntilTrialExpires = entitlement?.trial_ends_at
    ? Math.ceil(
        (new Date(entitlement.trial_ends_at).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : status.daysUntilTrialExpires;

  return {
    hasPremium,
    hasActiveTrial,
    isTrialExpired,
    daysUntilTrialExpires,
    loading: loading || subscriptionLoading,
    entitlement, // Expor entitlement completo para uso avançado
    // Helper para verificar se pode usar feature específica
    canUseFeature: (featureName: string) => {
      if (!paywallEnabled) return true;
      return hasPremium;
    },
    refetch: fetchEntitlement,
  };
}


// hooks/useSubscription.ts
// Hook para gerenciar assinaturas premium (Mounjaro+)

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled' | 'past_due';
  tier: 'free' | 'plus';
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  started_at: string | null;
  renews_at: string | null;
  canceled_at: string | null;
  plan_type: 'monthly' | 'annual' | null;
  clerk_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  hasPremium: boolean;
  hasActiveTrial: boolean;
  isTrialExpired: boolean;
  daysUntilTrialExpires: number | null;
  daysUntilSubscriptionExpires: number | null;
  subscription: Subscription | null;
}

export function useSubscription() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
    }
  }, [user?.id]);

  async function fetchSubscription() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No subscription found - user is free
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startTrial(): Promise<Subscription> {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Verificar se já tem trial ou assinatura ativa via server-side
    const existing = subscription;
    if (existing && (existing.status === 'trial' || existing.status === 'active')) {
      throw new Error('Trial or subscription already active');
    }

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 dias

    const { data, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        status: 'trial',
        tier: 'plus',
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        started_at: now.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Se erro de constraint único (trial ativo), verificar se já existe
      if (insertError.code === '23505') {
        // Tentar buscar trial existente
        const { data: existingTrial } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'trial')
          .single();
        
        if (existingTrial) {
          setSubscription(existingTrial);
          return existingTrial;
        }
      }
      console.error('Error starting trial:', insertError);
      throw insertError;
    }

    setSubscription(data);
    return data;
  }

  async function activateSubscription(
    clerkSubscriptionId: string,
    planType: 'monthly' | 'annual',
    endsAt: Date
  ): Promise<Subscription> {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const now = new Date();
    const renewsAt = new Date(endsAt);
    renewsAt.setDate(renewsAt.getDate() + (planType === 'monthly' ? 30 : 365));

    // Upsert: atualizar se existe, criar se não existe
    const { data, error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          status: 'active',
          tier: 'plus',
          subscription_started_at: now.toISOString(),
          subscription_ends_at: endsAt.toISOString(),
          started_at: subscription?.started_at || now.toISOString(),
          renews_at: renewsAt.toISOString(),
          plan_type: planType,
          clerk_subscription_id: clerkSubscriptionId,
          // Se tinha trial, manter histórico
          trial_started_at: subscription?.trial_started_at || null,
          trial_ends_at: subscription?.trial_ends_at || null,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error activating subscription:', upsertError);
      throw upsertError;
    }

    setSubscription(data);
    return data;
  }

  async function cancelSubscription(): Promise<void> {
    if (!user?.id || !subscription) {
      throw new Error('No subscription to cancel');
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error cancelling subscription:', updateError);
      throw updateError;
    }

    await fetchSubscription();
  }

  // Verificar se trial expirou e atualizar status
  async function checkTrialExpiry(): Promise<void> {
    if (!subscription || subscription.status !== 'trial') return;

    const now = new Date();
    const trialEndsAt = subscription.trial_ends_at
      ? new Date(subscription.trial_ends_at)
      : null;

    if (trialEndsAt && now > trialEndsAt) {
      // Trial expirou
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
        })
        .eq('id', subscription.id);

      if (!updateError) {
        await fetchSubscription();
      }
    }
  }

  const status: SubscriptionStatus = {
    hasPremium: subscription?.status === 'active' || subscription?.status === 'trial',
    hasActiveTrial: subscription?.status === 'trial' ?? false,
    isTrialExpired: subscription?.status === 'expired' ?? false,
    daysUntilTrialExpires: subscription?.trial_ends_at
      ? Math.ceil(
          (new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
    daysUntilSubscriptionExpires: subscription?.subscription_ends_at
      ? Math.ceil(
          (new Date(subscription.subscription_ends_at).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
    subscription,
  };

  return {
    subscription,
    status,
    loading,
    error,
    startTrial,
    activateSubscription,
    cancelSubscription,
    checkTrialExpiry,
    refetch: fetchSubscription,
  };
}


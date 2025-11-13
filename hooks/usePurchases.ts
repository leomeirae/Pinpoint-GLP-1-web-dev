// hooks/usePurchases.ts
// Hook para gerenciar compras de medicamentos

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { useAuth } from '@clerk/clerk-expo';
import type { Purchase } from '@/lib/finance';

const logger = createLogger('usePurchases');

export interface InsertPurchase {
  medication: string;
  brand?: string;
  dosage: number;
  unit?: string;
  package_form?: string;
  package_qty: number;
  quantity: number;
  currency?: string;
  total_price_cents: number;
  price_source?: string;
  purchase_notes?: string;
  purchase_date: string;
  location?: string;
  notes?: string;
}

export interface UpdatePurchase {
  medication?: string;
  brand?: string;
  dosage?: number;
  unit?: string;
  package_form?: string;
  package_qty?: number;
  quantity?: number;
  total_price_cents?: number;
  price_source?: string;
  purchase_notes?: string;
  purchase_date?: string;
  location?: string;
  notes?: string;
}

export function usePurchases() {
  const { userId } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch inicial de compras
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchPurchases();
  }, [userId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('purchases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('Real-time purchase change detected', { event: payload.eventType });
          fetchPurchases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchPurchases = async () => {
    if (!userId) {
      logger.debug('No userId, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false });

      if (fetchError) {
        logger.error('Error fetching purchases', fetchError);
        setError(fetchError);
        return;
      }

      setPurchases(data || []);
      logger.info('Purchases fetched successfully', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Error fetching purchases', err as Error);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addPurchase = async (purchase: InsertPurchase): Promise<Purchase> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    logger.info('Adding purchase', { medication: purchase.medication });

    const { data, error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        ...purchase,
        unit: purchase.unit || 'mg',
        package_form: purchase.package_form || 'pen',
        currency: purchase.currency || 'BRL',
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error adding purchase', insertError);
      throw insertError;
    }

    logger.info('Purchase added successfully', { id: data.id });
    return data as Purchase;
  };

  const updatePurchase = async (id: string, updates: UpdatePurchase): Promise<Purchase> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    logger.info('Updating purchase', { id });

    const { data, error: updateError } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating purchase', updateError);
      throw updateError;
    }

    logger.info('Purchase updated successfully', { id });
    return data as Purchase;
  };

  const deletePurchase = async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    logger.info('Deleting purchase', { id });

    const { error: deleteError } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Error deleting purchase', deleteError);
      throw deleteError;
    }

    logger.info('Purchase deleted successfully', { id });
  };

  const refetch = () => {
    fetchPurchases();
  };

  return {
    purchases,
    loading,
    error,
    addPurchase,
    updatePurchase,
    deletePurchase,
    refetch,
  };
}


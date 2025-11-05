// components/premium/PremiumGate.tsx
// Componente para gating de features premium

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { trackEvent } from '@/lib/analytics';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ReactNode;
}

export function PremiumGate({ children, featureName, fallback }: PremiumGateProps) {
  const { hasPremium, loading } = usePremiumFeatures();
  const router = useRouter();
  const colors = useShotsyColors();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.textSecondary }}>Carregando...</Text>
      </View>
    );
  }

  if (!hasPremium) {
    // Track bloqueio
    trackEvent('premium_feature_blocked', {
      feature_name: featureName,
      user_status: 'free',
    });

    if (fallback) {
      return <>{fallback}</>;
    }

    // Fallback padrão: botão para abrir paywall
    return (
      <View style={styles.gateContainer}>
        <Text style={[styles.gateTitle, { color: colors.text }]}>
          Recurso Premium
        </Text>
        <Text style={[styles.gateDescription, { color: colors.textSecondary }]}>
          Este recurso está disponível apenas para assinantes Mounjaro+
        </Text>
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            trackEvent('paywall_impression', {
              source: 'premium_gate',
              feature_name: featureName,
            });
            router.push('/(tabs)/premium');
          }}
        >
          <Text style={styles.upgradeButtonText}>Assinar Mounjaro+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  gateContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  gateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  gateDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


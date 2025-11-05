// app/(tabs)/premium.tsx
// Tela de Paywall - Mounjaro+

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useSubscription } from '@/hooks/useSubscription';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { Ionicons } from '@expo/vector-icons';
import { trackEvent } from '@/lib/analytics';
import { useFeatureFlag } from '@/lib/feature-flags';

const PREMIUM_FEATURES = [
  {
    icon: 'sparkles',
    title: 'AI Pack / Nutrição',
    description: 'Insights personalizados e sugestões nutricionais',
  },
  {
    icon: 'download',
    title: 'Exportações',
    description: 'PDF e CSV do seu histórico completo',
  },
  {
    icon: 'trending-up',
    title: 'Insights Avançados',
    description: 'Tendências, comparativos e alertas de anomalia',
  },
  {
    icon: 'notifications',
    title: 'Lembretes Inteligentes',
    description: 'Janelas dinâmicas, snooze e prioridades',
  },
  {
    icon: 'cloud',
    title: 'Backup e Sync',
    description: 'Sincronização em nuvem e restauração',
  },
  {
    icon: 'bar-chart',
    title: 'Gráficos Avançados',
    description: 'Intervalos customizados e marcadores',
  },
  {
    icon: 'attach',
    title: 'Anexos Ilimitados',
    description: 'Fotos e arquivos por registro',
  },
  {
    icon: 'headset',
    title: 'Suporte Prioritário',
    description: 'Resposta mais rápida ao suporte',
  },
];

export default function PremiumScreen() {
  const colors = useShotsyColors();
  const router = useRouter();
  const { subscription, status, startTrial, loading: subscriptionLoading } = useSubscription();
  const { hasPremium, hasActiveTrial, daysUntilTrialExpires } = usePremiumFeatures();
  const paywallEnabled = useFeatureFlag('FF_PAYWALL');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  useEffect(() => {
    trackEvent('paywall_impression', {
      source: 'premium_screen',
      user_status: hasPremium ? 'premium' : 'free',
    });
  }, []);

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true);
      
      trackEvent('paywall_trial_start_attempt', {
        source: 'premium_screen',
      });

      await startTrial();

      trackEvent('trial_started', {
        source: 'premium_screen',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      Alert.alert(
        'Trial Iniciado! 🎉',
        'Você tem 7 dias gratuitos para testar todas as funcionalidades premium.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error starting trial:', error);
      
      trackEvent('trial_start_failed', {
        error_message: error.message,
      });

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível iniciar o trial. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handlePurchase = () => {
    // TODO: Integrar com Clerk Payments
    trackEvent('paywall_purchase_attempt', {
      plan_type: selectedPlan,
      source: 'premium_screen',
    });

    Alert.alert(
      'Em breve',
      'A integração com pagamentos estará disponível em breve.',
      [{ text: 'OK' }]
    );
  };

  // Se já é premium, mostrar tela de confirmação
  if (hasPremium && !subscriptionLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mounjaro+</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Você é assinante Mounjaro+
            </Text>
            {hasActiveTrial && daysUntilTrialExpires !== null && (
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                Trial ativo - {daysUntilTrialExpires} dias restantes
              </Text>
            )}
            {subscription?.plan_type && (
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                Plano {subscription.plan_type === 'monthly' ? 'Mensal' : 'Anual'}
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mounjaro+</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Acesso completo a todas as funcionalidades premium
          </Text>
          <View style={[styles.trialBanner, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.trialBannerText, { color: colors.primary }]}>
              Experimente grátis por 7 dias
            </Text>
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.card },
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planTitle, { color: colors.text }]}>Mensal</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>R$ 19,90</Text>
            <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>/mês</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'annual' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.card },
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>37% OFF</Text>
            </View>
            <Text style={[styles.planTitle, { color: colors.text }]}>Anual</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>R$ 149,90</Text>
            <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>/ano</Text>
            <Text style={[styles.planSavings, { color: colors.textSecondary }]}>
              Economize R$ 89,10
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            O que está incluído:
          </Text>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          {!hasActiveTrial && (
            <TouchableOpacity
              style={[styles.trialButton, { backgroundColor: colors.primary }]}
              onPress={handleStartTrial}
              disabled={isStartingTrial || subscriptionLoading}
            >
              {isStartingTrial ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.trialButtonText}>Começar Trial</Text>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.purchaseButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handlePurchase}
          >
            <Text style={[styles.purchaseButtonText, { color: colors.text }]}>
              Assinar {selectedPlan === 'monthly' ? 'Mensal' : 'Anual'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/faq')}
          >
            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>
              Saiba mais na FAQ
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Cancele a qualquer momento. Sem compromisso.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  trialBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trialBannerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pricingSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 24,
  },
  planCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  planPeriod: {
    fontSize: 14,
    marginTop: 4,
  },
  planSavings: {
    fontSize: 12,
    marginTop: 4,
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 32,
    gap: 12,
  },
  trialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trialButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  purchaseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});


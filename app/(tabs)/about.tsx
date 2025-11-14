import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import Constants from 'expo-constants';
import { ArrowLeft } from 'phosphor-react-native';

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Sobre o App
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo e Nome */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Pinpoint GLP-1
          </Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>
            Versão {appVersion} (Build {buildNumber})
          </Text>
        </View>
        
        {/* Sobre */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sobre
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Aplicativo para acompanhamento de medicamentos GLP-1 (Tirzepatida, Semaglutida),
              desenvolvido para ajudar você a monitorar seu tratamento de forma simples e eficaz.
              {'\n\n'}
              Registre suas aplicações, acompanhe seu peso, monitore efeitos colaterais e
              mantenha um histórico completo da sua jornada.
            </Text>
          </View>
        </View>
        
        {/* Equipe */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Desenvolvido por
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Pinpoint Health Team{'\n'}
              São Paulo, Brasil
            </Text>
          </View>
        </View>
        
        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informações Legais
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL('https://pinpointglp1.app/privacy')}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Política de Privacidade
              </Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL('https://pinpointglp1.app/terms')}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Termos de Uso
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2025 Pinpoint GLP-1. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: ShotsyDesignTokens.spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.xs,
  },
  version: {
    ...ShotsyDesignTokens.typography.caption,
  },
  section: {
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.xl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  card: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
  },
  description: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 22,
  },
  linkItem: {
    paddingVertical: ShotsyDesignTokens.spacing.md,
  },
  linkText: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: ShotsyDesignTokens.spacing.xxl,
  },
  footerText: {
    ...ShotsyDesignTokens.typography.caption,
  },
});


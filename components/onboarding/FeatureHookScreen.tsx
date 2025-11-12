import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ShotsyButton } from '@/components/ui/shotsy-button';

interface FeatureHookScreenProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  primaryButtonText: string;
  secondaryButtonText: string;
}

export function FeatureHookScreen({
  title,
  subtitle,
  icon,
  onPrimaryPress,
  onSecondaryPress,
  primaryButtonText,
  secondaryButtonText,
}: FeatureHookScreenProps) {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <ShotsyButton title={primaryButtonText} onPress={onPrimaryPress} />
        <ShotsyButton title={secondaryButtonText} onPress={onSecondaryPress} variant="ghost" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: ShotsyDesignTokens.spacing.xxxl,
  },
  title: {
    ...ShotsyDesignTokens.typography.h2,
    textAlign: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  subtitle: {
    ...ShotsyDesignTokens.typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
});

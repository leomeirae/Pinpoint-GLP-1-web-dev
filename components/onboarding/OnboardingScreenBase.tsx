import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingScreenBaseProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  disableNext?: boolean;
  showBackButton?: boolean;
  loading?: boolean;
  contentContainerStyle?: any;
}

export function OnboardingScreenBase({
  children,
  title,
  subtitle,
  onNext,
  onBack,
  nextButtonText = 'Continuar',
  disableNext = false,
  showBackButton = true,
  loading = false,
  contentContainerStyle,
}: OnboardingScreenBaseProps) {
  const colors = useShotsyColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showBackButton && onBack && (
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 16 }]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {title && (
          <View style={[
            styles.header,
            showBackButton && onBack && styles.headerWithBackButton
          ]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {children}
      </ScrollView>

      {onNext && (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 20,
              backgroundColor: colors.background,
            },
          ]}
        >
          <ShotsyButton
            title={nextButtonText}
            onPress={onNext}
            disabled={disableNext}
            loading={loading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

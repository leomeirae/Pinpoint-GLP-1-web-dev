import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/colors';
import { useUser } from '@/hooks/useUser';
import { useUserSync } from '@/hooks/useUserSync';
import { createLogger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';

const logger = createLogger('IndexScreen');

// Aumentado de 8s para 10s para acomodar sincronização do Supabase
const MAX_WAIT_TIME = 10;

export default function IndexScreen() {
  const colors = useColors();
  const { isSignedIn, isLoaded } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { syncStatus } = useUserSync();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    if (!isLoaded) {
      logger.debug('Clerk not loaded yet, waiting...');
      return;
    }

    // Evitar múltiplos redirecionamentos que podem causar loops
    if (hasRedirectedRef.current) {
      logger.debug('Already redirected, skipping');
      return;
    }

    // Se não estiver autenticado, ir para welcome
    if (!isSignedIn) {
      logger.info('User not signed in, redirecting to welcome');
      hasRedirectedRef.current = true;
      router.replace('/(auth)/welcome');
      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, 500);
      return;
    }

    // ✅ CRITICAL FIX: Wait for user sync to complete before routing
    // This prevents race condition where routing decision happens before user is created in Supabase
    if (syncStatus === 'syncing') {
      logger.debug('User sync in progress, waiting...', { syncStatus });
      return;
    }

    // Handle sync errors - if sync failed, assume new user needs onboarding
    // This prevents infinite loading state if Supabase sync encounters errors
    if (syncStatus === 'error') {
      logger.warn('User sync failed, redirecting to onboarding as fallback', {
        syncStatus,
        waitTime
      });
      hasRedirectedRef.current = true;
      router.replace('/(auth)/onboarding-flow');
      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, 500);
      return;
    }

    // Incrementar contador de espera
    if (userLoading) {
      const interval = setInterval(() => {
        setWaitTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    // Se passou do tempo máximo de espera e ainda não tem user, assumir que precisa de onboarding
    // Isso pode acontecer se houve erro ao buscar o usuário do Supabase
    if (!user && waitTime >= MAX_WAIT_TIME) {
      logger.warn('User data not loaded after timeout, assuming new user needs onboarding', {
        waitTime,
        isSignedIn,
        userLoading,
        note: 'This usually means Supabase query failed or user does not exist yet'
      });
      hasRedirectedRef.current = true;
      router.replace('/(auth)/onboarding-flow');
      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, 500);
      return;
    }

    // Se ainda está carregando, aguardar
    if (userLoading) {
      logger.debug('User still loading...', { waitTime });
      return;
    }

    // Se user ainda é null após carregar, aguardar um pouco mais
    // (o useUserSync pode estar criando o usuário)
    if (!user) {
      logger.debug('User data not ready yet, waiting...', { waitTime });
      return;
    }

    // IMPORTANTE: Verificação defensiva de onboarding_completed
    // Se o campo não existe ou é undefined, tratar como false (precisa de onboarding)
    const needsOnboarding = user.onboarding_completed !== true;

    logger.info('User data loaded, deciding route', {
      userId: user.id,
      clerkId: user.clerk_id,
      email: user.email,
      onboarding_completed: user.onboarding_completed,
      needsOnboarding,
      hasOnboardingField: 'onboarding_completed' in user,
    });

    // Marcar como redirecionado antes de redirecionar
    hasRedirectedRef.current = true;

    // Pequeno delay para garantir que o estado está estável
    const timer = setTimeout(() => {
      if (isSignedIn && user) {
        // Se o onboarding não foi completado (ou campo não existe), ir para onboarding
        if (needsOnboarding) {
          logger.info('🚀 Redirecting to onboarding flow', {
            reason: user.onboarding_completed === false ? 'flag is false' : 'flag is missing/undefined',
            onboarding_completed: user.onboarding_completed,
          });
          trackEvent('auth_guard_evaluation', {
            user_id: user.id,
            route: 'onboarding',
            onboarding_completed: false,
            onboarding_field_exists: 'onboarding_completed' in user,
          });
          router.replace('/(auth)/onboarding-flow');
        } else {
          logger.info('✅ Redirecting to dashboard', {
            onboarding_completed: user.onboarding_completed,
          });
          trackEvent('auth_guard_evaluation', {
            user_id: user.id,
            route: 'dashboard',
            onboarding_completed: true,
          });
          router.replace('/(tabs)');
        }
        // Resetar após redirecionar
        setTimeout(() => {
          hasRedirectedRef.current = false;
        }, 500);
      } else if (!isSignedIn) {
        logger.info('User signed out, redirecting to welcome');
        trackEvent('auth_guard_evaluation', {
          route: 'welcome',
          signed_in: false,
        });
        router.replace('/(auth)/welcome');
        setTimeout(() => {
          hasRedirectedRef.current = false;
        }, 500);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isSignedIn, isLoaded, userLoading, user, waitTime, syncStatus]);

  const styles = getStyles(colors);

  // Sempre mostrar loading enquanto decide para onde ir
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      {waitTime > 3 && <Text style={styles.loadingText}>Carregando seus dados...</Text>}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

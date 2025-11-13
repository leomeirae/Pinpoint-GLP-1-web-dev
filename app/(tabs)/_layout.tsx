import { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ClipboardText, Syringe, ChartLineUp, Calendar, CurrencyCircleDollar, GearSix } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { useAuth } from '@/lib/clerk';
import { useFeatureFlag } from '@/lib/feature-flags';
import { createLogger } from '@/lib/logger';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

const logger = createLogger('_layout');

export default function Layout() {
  const colors = useColors();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const financeEnabled = useFeatureFlag('FF_FINANCE_MVP');

  // Auth Guard: Redireciona para welcome se não estiver autenticado
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn && !hasRedirectedRef.current) {
        logger.info('User not authenticated, redirecting to welcome');
        hasRedirectedRef.current = true;
        router.replace('/(auth)/welcome');
      } else if (isSignedIn) {
        // Resetar flag quando usuário está autenticado
        hasRedirectedRef.current = false;
      }
    }
  }, [isSignedIn, isLoaded]);

  // Mostrar loading enquanto verifica autenticação
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Se não estiver autenticado, não renderizar as tabs
  if (!isSignedIn) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }} // Esconde do tab bar
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Resumo',
          tabBarIcon: ({ color, focused }) => (
            <ClipboardText
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="injections"
        options={{
          title: 'Injeções',
          tabBarIcon: ({ color, focused }) => (
            <Syringe
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Resultados',
          tabBarIcon: ({ color, focused }) => (
            <ChartLineUp
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, focused }) => (
            <Calendar
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Custos',
          href: financeEnabled ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <CurrencyCircleDollar
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <GearSix
              size={ShotsyDesignTokens.iconSize.xl}
              color={color}
              weight={focused ? 'bold' : 'thin'}
            />
          ),
        }}
      />

      {/* Telas adicionais que NÃO devem aparecer no tab bar */}
      <Tabs.Screen name="add-application" options={{ href: null }} />
      <Tabs.Screen name="add-medication" options={{ href: null }} />
      <Tabs.Screen name="add-side-effect" options={{ href: null }} />
      <Tabs.Screen name="add-weight" options={{ href: null }} />
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
      <Tabs.Screen name="edit-reminder" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="faq" options={{ href: null }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
      <Tabs.Screen name="treatment" options={{ href: null }} />
      <Tabs.Screen name="habits" options={{ href: null }} />
    </Tabs>
  );
}

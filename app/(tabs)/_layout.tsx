import { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { ClipboardText, Syringe, ChartLineUp, Calendar, GearSix } from 'phosphor-react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useAuth } from '@/lib/clerk';

export default function Layout() {
  const colors = useShotsyColors();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  // Auth Guard: Redireciona para welcome se não estiver autenticado
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn && !hasRedirectedRef.current) {
        console.log('User not authenticated, redirecting to welcome...');
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
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
              size={28}
              color={color}
              weight={focused ? 'fill' : 'regular'}
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
              size={28}
              color={color}
              weight={focused ? 'fill' : 'regular'}
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
              size={28}
              color={color}
              weight={focused ? 'fill' : 'regular'}
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
              size={28}
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-nutrition"
        options={{
          title: 'IA',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{
              fontSize: 16,
              fontWeight: focused ? '700' : '600',
              color: color,
              letterSpacing: 0.5,
            }}>
              IA
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <GearSix
              size={28}
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />

      {/* Telas adicionais que NÃO devem aparecer no tab bar */}
      <Tabs.Screen
        name="add-application"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="add-medication"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="add-side-effect"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="add-weight"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notification-settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="faq"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="premium"
        options={{ href: null }}
      />
      {/* Removido add-nutrition daqui pois agora está no tab bar */}
    </Tabs>
  );
}
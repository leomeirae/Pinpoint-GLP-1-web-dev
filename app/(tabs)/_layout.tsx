import { Tabs, useRouter } from 'expo-router';
import { Text, ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/useUser';
import { useEffect } from 'react';

export default function TabsLayout() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.onboarding_completed) {
      console.log('Redirecting to onboarding...');
      router.replace('/(auth)/onboarding');
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLight,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="add-application"
        options={{
          title: 'Registrar Aplicação',
          tabBarLabel: 'Aplicação',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💉</Text>,
        }}
      />
      <Tabs.Screen
        name="add-weight"
        options={{
          title: 'Registrar Peso',
          tabBarLabel: 'Peso',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚖️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="add-medication"
        options={{
          href: null, // Esconder da tab bar
        }}
      />
      <Tabs.Screen
        name="add-side-effect"
        options={{
          href: null, // Esconder da tab bar
        }}
      />
      <Tabs.Screen
        name="notification-settings"
        options={{
          href: null, // Esconder da tab bar
        }}
      />
    </Tabs>
  );
}

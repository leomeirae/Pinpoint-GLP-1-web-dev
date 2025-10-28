import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColors } from '@/constants/colors';
import { tokenCache, validateClerkKey } from '@/lib/clerk';

function StackWithTheme() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(auth)/sign-in" 
          options={{ 
            title: 'Entrar',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(auth)/sign-up" 
          options={{ 
            title: 'Criar Conta',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(auth)/verify-email" 
          options={{ 
            title: 'Verificar Email',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
    </Stack>
  );
}

export default function RootLayout() {
  const publishableKey = validateClerkKey();

  return (
    <ClerkProvider 
      publishableKey={publishableKey} 
      tokenCache={tokenCache}
    >
      <StatusBar style="auto" />
      <StackWithTheme />
    </ClerkProvider>
  );
}
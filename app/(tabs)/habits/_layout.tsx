// app/(tabs)/habits/_layout.tsx
// Layout para rotas de hábitos

import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';

export default function HabitsLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="alcohol"
        options={{
          title: 'Consumo de Álcool',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}


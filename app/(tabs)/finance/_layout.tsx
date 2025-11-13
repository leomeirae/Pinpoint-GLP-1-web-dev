// app/(tabs)/finance/_layout.tsx
// Layout para rotas de finance

import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';

export default function FinanceLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Custos',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="add-purchase"
        options={{
          title: 'Adicionar Compra',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}


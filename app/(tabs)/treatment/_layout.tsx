// app/(tabs)/treatment/_layout.tsx
// Layout para rotas de tratamento

import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';

export default function TreatmentLayout() {
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
        name="pause"
        options={{
          title: 'Pausas no Tratamento',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}


// Script temporário para resetar feature flags
// Execute este código no console do Chrome DevTools quando o app estiver rodando

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function resetFeatureFlags() {
  try {
    await AsyncStorage.removeItem('@mounjaro:feature_flags');
    console.log('✅ Feature flags resetadas! Recarregue o app.');
  } catch (error) {
    console.error('Erro ao resetar feature flags:', error);
  }
}

// Executar automaticamente se for ambiente de desenvolvimento
if (__DEV__) {
  resetFeatureFlags();
}

